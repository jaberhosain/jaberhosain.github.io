import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  onSnapshot 
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { initialPortfolioData, defaultThemeColors, defaultThemeFonts } from '../data/initialPortfolio';
import { PortfolioConfig, Lead, Language, LocalizedText, ThemeId } from '../types/portfolio';
import { translations, UITranslations } from '../translations/ui';
import { normalizeDirectImageUrl } from '../lib/imageUrlResolver';
import firebaseConfig from '../../firebase-applet-config.json';

interface PortfolioContextType {
  portfolio: PortfolioConfig;
  draftPortfolio: PortfolioConfig;
  loading: boolean;
  isAdmin: boolean;
  authLoading: boolean;
  currentUser: User | null;
  language: Language;
  setLanguage: (lang: Language) => void;
  ui: UITranslations;
  loc: (text?: LocalizedText | string) => string;
  isPreviewDraft: boolean;
  setIsPreviewDraft: (val: boolean) => void;
  activeThemeId: ThemeId;
  setActiveThemeId: (theme: ThemeId) => void;
  customAccentColor: string;
  setCustomAccentColor: (color: string) => void;
  updateDraft: (updater: (prev: PortfolioConfig) => PortfolioConfig) => void;
  saveDraftToDatabase: () => Promise<void>;
  publishToLive: () => Promise<void>;
  submitContactLead: (data: Omit<Lead, 'id' | 'createdAt' | 'status'>) => Promise<boolean>;
  fetchLeads: () => Promise<Lead[]>;
  updateLeadStatus: (leadId: string, status: 'new' | 'contacted' | 'completed') => Promise<void>;
  exportPortfolioBackup: () => void;
  cloudSyncStatus: string;
  remoteDraftConflict: { incomingDraft: PortfolioConfig; incomingTime: string } | null;
  resolveDraftConflict: (choice: 'load' | 'keep') => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const OWNER_EMAIL = 'sbmc.3925@gmail.com';
const ADMIN_UID = 'ngH4tKvzVDee0eI0IvTnC6mwSnS2';
const ADMIN_INTERNAL_EMAIL = 'jabirbd@jabir.internal';

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [portfolio, setPortfolio] = useState<PortfolioConfig>(initialPortfolioData);
  const [draftPortfolio, setDraftPortfolio] = useState<PortfolioConfig>(initialPortfolioData);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isPreviewDraft, setIsPreviewDraft] = useState<boolean>(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<string>('Saved to cloud');
  const [remoteDraftConflict, setRemoteDraftConflict] = useState<{
    incomingDraft: PortfolioConfig;
    incomingTime: string;
  } | null>(null);

  // Synchronization refs to prevent overwrite loops and track uncommitted local edits
  const hasUnsavedEditsRef = useRef<boolean>(false);
  const lastSyncedDraftUpdatedAtRef = useRef<string | null>(null);
  const lastGoodPublishedRef = useRef<PortfolioConfig | null>(null);

  // Language state initialized from localStorage
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('jabir_portfolio_lang') as Language;
      if (saved && ['en', 'bn', 'ar'].includes(saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('jabir_portfolio_lang', lang);
    } catch {
      // ignore
    }
  };

  // Visitor theme state initialized from localStorage (default is 'dark' = current locked design)
  const [activeThemeId, setActiveThemeIdState] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem('jabir_portfolio_theme') as ThemeId;
      if (saved && ['dark', 'light', 'blue', 'green', 'purple', 'warm', 'custom'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'dark';
  });

  const [customAccentColor, setCustomAccentColorState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('jabir_custom_accent');
      if (saved) return saved;
    } catch {}
    return '#FF5722';
  });

  const setActiveThemeId = (id: ThemeId) => {
    setActiveThemeIdState(id);
    try {
      localStorage.setItem('jabir_portfolio_theme', id);
    } catch {}
  };

  const setCustomAccentColor = (color: string) => {
    setCustomAccentColorState(color);
    try {
      localStorage.setItem('jabir_custom_accent', color);
    } catch {}
  };

  // Sync HTML tag direction and lang attribute whenever language changes
  useEffect(() => {
    document.documentElement.lang = language;
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [language]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Owner verification: primary Gmail owner OR verified admin UID / internal email
        const emailLower = user.email?.toLowerCase() || '';
        const isOwner = 
          emailLower === OWNER_EMAIL.toLowerCase() ||
          user.uid === ADMIN_UID ||
          emailLower === ADMIN_INTERNAL_EMAIL.toLowerCase() ||
          emailLower.endsWith('@jabir.internal');
        setIsAdmin(isOwner);
      } else {
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sanitizer to guarantee canonical URLs and eliminate any resurrected legacy variants
  const cleanseLegacySocialAndContact = (cfg: PortfolioConfig): PortfolioConfig => {
    if (!cfg) return cfg;

    // 1. Clean contact object
    const contact = { ...(cfg.contact || initialPortfolioData.contact) };
    if (!contact.telegramUrl || contact.telegramUrl.includes('mdjabirhossen')) {
      contact.telegramUrl = 'https://t.me/sbmc3925';
    }
    if (contact.facebookUrl && (contact.facebookUrl.includes('mdjabirhossen') || contact.facebookUrl.includes('md.jaber.hosain.75'))) {
      contact.facebookUrl = '';
    }
    if (contact.youtubeUrl && (contact.youtubeUrl.includes('mdjaberhosain') || contact.youtubeUrl.includes('mdjabirhossen'))) {
      contact.youtubeUrl = '';
    }
    if (!contact.email) {
      contact.email = 'sbmc.3925@gmail.com';
    }

    // 2. Clean channelLinks
    const channelLinks = (cfg.channelLinks || initialPortfolioData.channelLinks).map(ch => {
      if (ch.id === 'ch-telegram') {
        const url = (!ch.url || ch.url.includes('mdjabirhossen')) ? 'https://t.me/jaberhosain' : ch.url;
        return { ...ch, url, status: 'LINKED' as const };
      }
      if (ch.id === 'ch-facebook') {
        const isLegacy = ch.url && (ch.url.includes('mdjabirhossen') || ch.url.includes('md.jaber.hosain.75'));
        const url = isLegacy ? '' : ch.url;
        return { ...ch, url, status: (url ? 'LINKED' : 'UNLINKED') as any };
      }
      if (ch.id === 'ch-youtube') {
        const isLegacy = ch.url && ch.url.includes('mdjaberhosain');
        const url = isLegacy ? '' : ch.url;
        return { ...ch, url, status: (url ? 'LINKED' : 'UNLINKED') as any };
      }
      return ch;
    });

    // 3. Clean socialLinks
    const existingSocial = Array.isArray(cfg.socialLinks) && cfg.socialLinks.length > 0
      ? cfg.socialLinks
      : (initialPortfolioData.socialLinks || []);

    const socialLinks = existingSocial.map(s => {
      let url = s.url || '';
      let enabled = s.enabled !== false;
      let name = s.name;

      if (s.platform === 'telegram') {
        if (s.id === 'soc-tg-channel' || (name && name.toLowerCase().includes('channel'))) {
          if (!url || url.includes('mdjabirhossen')) url = 'https://t.me/jaberhosain';
          name = 'Telegram (Channel)';
        } else {
          if (!url || url.includes('mdjabirhossen')) url = 'https://t.me/sbmc3925';
          name = 'Telegram (Contact)';
        }
      } else if (s.platform === 'facebook') {
        if (url.includes('mdjabirhossen') || url.includes('md.jaber.hosain.75')) {
          url = '';
          enabled = false;
        }
      } else if (s.platform === 'youtube') {
        if (url.includes('mdjaberhosain') || url.includes('mdjabirhossen')) {
          url = '';
          enabled = false;
        }
      }
      return { ...s, name, url, enabled };
    });

    // Make sure both Telegram (Contact) and Telegram (Channel) exist in socialLinks
    const hasTgContact = socialLinks.some(s => s.platform === 'telegram' && (s.name?.includes('Contact') || s.id === 'soc-tg-contact' || s.url?.includes('sbmc3925')));
    const hasTgChannel = socialLinks.some(s => s.platform === 'telegram' && (s.name?.includes('Channel') || s.id === 'soc-tg-channel' || s.url?.includes('jaberhosain')));

    const finalSocialLinks = [...socialLinks];
    if (!hasTgContact) {
      finalSocialLinks.unshift({
        id: 'soc-tg-contact',
        platform: 'telegram',
        name: 'Telegram (Contact)',
        url: 'https://t.me/sbmc3925',
        icon: 'telegram',
        enabled: true,
        order: 1
      });
    }
    if (!hasTgChannel) {
      finalSocialLinks.splice(1, 0, {
        id: 'soc-tg-channel',
        platform: 'telegram',
        name: 'Telegram (Channel)',
        url: 'https://t.me/jaberhosain',
        icon: 'telegram',
        enabled: true,
        order: 2
      });
    }

    return {
      ...cfg,
      contact,
      channelLinks,
      socialLinks: finalSocialLinks
    };
  };

  const formatTimeString = (isoStr?: string): string => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const resolveValidAvatar = (url?: string): string => {
    if (!url || typeof url !== 'string') return '/assets/jabir_profile.png';
    const clean = normalizeDirectImageUrl(url);
    if (!clean) return '/assets/jabir_profile.png';
    return clean;
  };

  const mergePortfolioData = (data: Partial<PortfolioConfig> = {}): PortfolioConfig => {
    return {
      ...initialPortfolioData,
      ...data,
      theme: {
        ...initialPortfolioData.theme,
        ...(data.theme || {}),
        colors: { ...defaultThemeColors, ...(data.theme?.colors || {}) },
        fonts: { ...defaultThemeFonts, ...(data.theme?.fonts || {}) }
      },
      branding: {
        ...initialPortfolioData.branding,
        ...(data.branding || {})
      },
      contact: {
        ...initialPortfolioData.contact,
        ...(data.contact || {})
      },
      hero: { 
        ...initialPortfolioData.hero, 
        ...(data.hero || {}), 
        avatarUrl: resolveValidAvatar(data.hero?.avatarUrl) 
      },
      about: { 
        ...initialPortfolioData.about, 
        ...(data.about || {}), 
        avatarUrl: resolveValidAvatar(data.about?.avatarUrl) 
      },
      // Professional Institutes Auto-migration (migrates single object to list, keeping all 3 languages)
      professionalInstitutes: Array.isArray(data.professionalInstitutes)
        ? data.professionalInstitutes
        : (data.professionalInstitute ? [{
            id: data.professionalInstitute.id || 'inst-1',
            institution: data.professionalInstitute.institution,
            course: data.professionalInstitute.course,
            batch: data.professionalInstitute.batch,
            competencies: (data.professionalInstitute.competencies || []).map((c, i) => ({
              id: c.id || `comp-${i + 1}`,
              category: c.category,
              tools: c.tools
            })),
            footerTag1: data.professionalInstitute.footerTag1,
            footerTag2: data.professionalInstitute.footerTag2,
            order: 1
          }] : (initialPortfolioData.professionalInstitutes || [])),
      professionalInstitute: data.professionalInstitute || initialPortfolioData.professionalInstitute,
      // Social links with fallback to verified defaults
      socialLinks: Array.isArray(data.socialLinks)
        ? data.socialLinks
        : (initialPortfolioData.socialLinks || []),
      // Arrays: Firestore is the single source of truth. If empty [], keep it empty!
      videos: Array.isArray(data.videos) ? data.videos : initialPortfolioData.videos,
      projects: Array.isArray(data.projects) ? data.projects : initialPortfolioData.projects,
      bestGraphicWorks: Array.isArray(data.bestGraphicWorks) ? data.bestGraphicWorks : initialPortfolioData.bestGraphicWorks,
      bestVideoWorks: Array.isArray(data.bestVideoWorks) ? data.bestVideoWorks : initialPortfolioData.bestVideoWorks,
      bestGraphicSection: data.bestGraphicSection || initialPortfolioData.bestGraphicSection,
      bestVideoSection: data.bestVideoSection || initialPortfolioData.bestVideoSection,
      services: Array.isArray(data.services) ? data.services : initialPortfolioData.services,
      skills: Array.isArray(data.skills) ? data.skills : initialPortfolioData.skills,
      academicRecords: Array.isArray(data.academicRecords) ? data.academicRecords : initialPortfolioData.academicRecords,
      showWorkflow: data.showWorkflow !== false,
      workflow: Array.isArray(data.workflow) 
        ? data.workflow.map((item, i) => ({
            ...item,
            id: item.id || `wf-${item.step || i + 1}-${i}`,
            order: item.order !== undefined ? item.order : i + 1
          }))
        : initialPortfolioData.workflow,
      contactForm: data.contactForm || initialPortfolioData.contactForm,
      footerConfig: data.footerConfig || initialPortfolioData.footerConfig,
      updatedAt: data.updatedAt || initialPortfolioData.updatedAt || new Date().toISOString(),
      publishedAt: data.publishedAt || initialPortfolioData.publishedAt,
      status: data.status || 'published'
    };
  };

  // 1. PUBLIC SITE: real-time onSnapshot listener for portfolio/published
  useEffect(() => {
    let isMounted = true;
    const docRef = doc(db, 'portfolio', 'published');

    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (!isMounted) return;
        if (snap.exists()) {
          const data = snap.data() as PortfolioConfig;
          const cleanMerged = cleanseLegacySocialAndContact(mergePortfolioData(data));
          lastGoodPublishedRef.current = cleanMerged;
          setPortfolio(cleanMerged);
        } else {
          // Fresh Firestore initialization fallback
          if (!lastGoodPublishedRef.current) {
            lastGoodPublishedRef.current = initialPortfolioData;
            setPortfolio(initialPortfolioData);
          }
        }
        setLoading(false);
      },
      (error) => {
        console.warn('Published portfolio onSnapshot note:', error);
        // Condition 1: Never render an empty or partial state if a snapshot errors; keep the last good data.
        if (isMounted) {
          if (!lastGoodPublishedRef.current) {
            setPortfolio(initialPortfolioData);
          }
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // 2. ADMIN DRAFT: real-time onSnapshot listener for portfolio/draft with collision/conflict detection
  useEffect(() => {
    if (!isAdmin) {
      setRemoteDraftConflict(null);
      return;
    }

    let isMounted = true;
    const draftRef = doc(db, 'portfolio', 'draft');

    const unsubscribe = onSnapshot(
      draftRef,
      (snap) => {
        if (!isMounted) return;
        // Ignore local pending write echos to prevent state loops
        if (snap.metadata.hasPendingWrites) return;

        if (snap.exists()) {
          const draftData = snap.data() as PortfolioConfig;
          const cleanDraft = cleanseLegacySocialAndContact(mergePortfolioData(draftData));
          const remoteTime = draftData.updatedAt || '';

          // If the admin is actively editing unsaved changes in this browser
          if (hasUnsavedEditsRef.current) {
            // Compare timestamps: if another browser saved a newer draft than what we started with
            if (remoteTime && lastSyncedDraftUpdatedAtRef.current && remoteTime > lastSyncedDraftUpdatedAtRef.current) {
              console.warn('[Firestore] Newer draft detected from another device while local edits exist.');
              setRemoteDraftConflict({
                incomingDraft: cleanDraft,
                incomingTime: formatTimeString(remoteTime) || 'recently'
              });
              return;
            }
          }

          // If no unsaved edits, or initial load: smoothly update to latest cloud draft
          setDraftPortfolio(cleanDraft);
          lastSyncedDraftUpdatedAtRef.current = remoteTime || new Date().toISOString();
          const timeStr = formatTimeString(remoteTime);
          setCloudSyncStatus(timeStr ? `Saved to cloud at ${timeStr}` : 'Saved to cloud');
          setRemoteDraftConflict(null);
        } else {
          // If no draft doc exists yet in Firestore, mirror current published portfolio
          const fallback = lastGoodPublishedRef.current || initialPortfolioData;
          setDraftPortfolio(cleanseLegacySocialAndContact(fallback));
          setCloudSyncStatus('NOT saved to cloud');
        }
      },
      (error) => {
        console.warn('Draft live listener note:', error);
        // Condition 4: Local backup used ONLY if Firestore is unreachable and no data was received
        if (!lastSyncedDraftUpdatedAtRef.current) {
          try {
            const cached = localStorage.getItem('jabir_draft_local_backup');
            if (cached) {
              const parsed = JSON.parse(cached);
              const cleanBackup = cleanseLegacySocialAndContact(mergePortfolioData(parsed));
              setDraftPortfolio(cleanBackup);
              setCloudSyncStatus('NOT saved to cloud (offline backup)');
            }
          } catch {}
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isAdmin]);

  const resolveDraftConflict = (choice: 'load' | 'keep') => {
    if (!remoteDraftConflict) return;
    if (choice === 'load') {
      setDraftPortfolio(remoteDraftConflict.incomingDraft);
      hasUnsavedEditsRef.current = false;
      lastSyncedDraftUpdatedAtRef.current = remoteDraftConflict.incomingDraft.updatedAt || null;
      const t = formatTimeString(remoteDraftConflict.incomingDraft.updatedAt);
      setCloudSyncStatus(t ? `Saved to cloud at ${t}` : 'Saved to cloud');
      setRemoteDraftConflict(null);
      // Clean local backup on explicit load
      try {
        localStorage.removeItem('jabir_draft_local_backup');
      } catch {}
    } else {
      // Keep local edits
      setRemoteDraftConflict(null);
      setCloudSyncStatus('NOT saved to cloud');
    }
  };

  const updateDraft = (updater: (prev: PortfolioConfig) => PortfolioConfig) => {
    hasUnsavedEditsRef.current = true;
    setCloudSyncStatus('NOT saved to cloud');
    setDraftPortfolio(prev => {
      const next = updater(prev);
      try {
        localStorage.setItem('jabir_draft_local_backup', JSON.stringify({
          ...next,
          updatedAt: new Date().toISOString()
        }));
      } catch {}
      return next;
    });
  };

  // Detect if any string anywhere in the payload starts with "data:"
  const findBase64Field = (data: any, path = ''): string | null => {
    if (data === null || data === undefined) return null;
    if (typeof data === 'string') {
      if (data.startsWith('data:')) {
        return path || 'root';
      }
      return null;
    }
    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const found = findBase64Field(data[i], `${path}[${i}]`);
        if (found) return found;
      }
      return null;
    }
    if (typeof data === 'object') {
      for (const [key, val] of Object.entries(data)) {
        const fieldPath = path ? `${path}.${key}` : key;
        const found = findBase64Field(val, fieldPath);
        if (found) return found;
      }
      return null;
    }
    return null;
  };

  // Convert JS object to Firestore REST API typed format
  const toFirestoreRestValue = (val: any): any => {
    if (val === null || val === undefined) return { nullValue: null };
    if (typeof val === 'boolean') return { booleanValue: val };
    if (typeof val === 'number') {
      if (Number.isInteger(val)) return { integerValue: String(val) };
      return { doubleValue: val };
    }
    if (typeof val === 'string') return { stringValue: val };
    if (Array.isArray(val)) {
      return { arrayValue: { values: val.map(toFirestoreRestValue) } };
    }
    if (typeof val === 'object') {
      const fields: Record<string, any> = {};
      for (const [k, v] of Object.entries(val)) {
        if (v !== undefined) {
          fields[k] = toFirestoreRestValue(v);
        }
      }
      return { mapValue: { fields } };
    }
    return { stringValue: String(val) };
  };

  // Fallback: save through plain Firestore REST call (documents.patch with owner ID token)
  const saveViaFirestoreRest = async (docId: string, data: any): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated for Firestore REST write.');
    const idToken = await user.getIdToken();
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/portfolio/${docId}`;
    
    const restFields: Record<string, any> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) {
        restFields[k] = toFirestoreRestValue(v);
      }
    }

    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields: restFields })
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Firestore REST save failed (${res.status}): ${errBody}`);
    }
    console.log(`[Firestore REST] Successfully saved portfolio/${docId} via HTTP REST call.`);
  };

  // Validate payload size and disallow raw base64 data URIs
  const validatePayloadBeforeWrite = (cleanData: any, docName: string) => {
    const jsonStr = JSON.stringify(cleanData);
    const sizeBytes = new TextEncoder().encode(jsonStr).length;
    const sizeKB = (sizeBytes / 1024).toFixed(2);
    console.log(`[Firestore Payload Check] portfolio/${docName} size: ${sizeKB} KB (${sizeBytes} bytes)`);

    if (sizeBytes > 700 * 1024) {
      throw new Error(`Payload size is ${sizeKB} KB, which exceeds the 700 KB safe limit. Please ensure images are uploaded to Firebase Storage.`);
    }

    const base64Field = findBase64Field(cleanData);
    if (base64Field) {
      throw new Error(`Field "${base64Field}" contains a base64 data URI ("data:..."). Please upload the image to Firebase Storage instead of storing raw base64.`);
    }
  };

  // Execute Firestore write with 30s timeout, 1 automatic retry, and REST fallback
  const executeWriteWithRetryAndFallback = async (
    docId: 'draft' | 'published',
    cleanData: any,
    operationName: string
  ): Promise<void> => {
    validatePayloadBeforeWrite(cleanData, docId);

    // Pre-flight auth check: If STS token service API is disabled on project, catch immediately
    if (auth.currentUser) {
      try {
        await auth.currentUser.getIdToken();
      } catch (tokenErr: any) {
        const tokenMsg = tokenErr?.message || String(tokenErr);
        if (tokenMsg.includes('token-service-api') || tokenMsg.includes('securetoken.googleapis.com')) {
          throw new Error(
            'Google Token Service API is disabled in project 142615067158. Please enable it at https://console.developers.google.com/apis/api/securetoken.googleapis.com/overview?project=142615067158 then retry.'
          );
        }
      }
    }

    const TIMEOUT_MS = 30000; // 30 seconds

    const runAttempt = (promise: Promise<any>, timeoutLabel: string) => {
      let timer: any;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`${timeoutLabel} timed out after 30s. Firestore write stream delayed.`));
        }, TIMEOUT_MS);
      });
      return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
    };

    const attemptSdkSave = () => setDoc(doc(db, 'portfolio', docId), cleanData);

    try {
      // First attempt: SDK write with long polling
      await runAttempt(attemptSdkSave(), operationName);
    } catch (firstError: any) {
      const firstMsg = firstError?.message || '';
      if (firstMsg.includes('token-service-api') || firstMsg.includes('securetoken.googleapis.com')) {
        throw new Error(
          'Google Token Service API is disabled in project 142615067158. Please enable it at https://console.developers.google.com/apis/api/securetoken.googleapis.com/overview?project=142615067158 then retry.'
        );
      }
      console.warn(`[Firestore] ${operationName} first attempt issue: ${firstMsg}. Initiating 1 automatic retry...`);
      try {
        // Automatic retry attempt
        await runAttempt(attemptSdkSave(), `${operationName} (Retry)`);
      } catch (retryError: any) {
        console.warn(`[Firestore] ${operationName} SDK retry also failed. Attempting Firestore REST fallback...`);
        try {
          // Direct HTTP REST patch fallback with user's ID token
          await saveViaFirestoreRest(docId, cleanData);
        } catch (restError: any) {
          console.error(`[Firestore] REST fallback error:`, restError);
          const restMsg = restError?.message || '';
          if (restMsg.includes('token-service-api') || restMsg.includes('securetoken.googleapis.com')) {
            throw new Error(
              'Google Token Service API is disabled in project 142615067158. Please enable it at https://console.developers.google.com/apis/api/securetoken.googleapis.com/overview?project=142615067158 then retry.'
            );
          }
          throw retryError;
        }
      }
    }
  };

  // Export & Download Backup JSON
  const exportPortfolioBackup = () => {
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        published: portfolio,
        draft: draftPortfolio
      };
      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Backup export failed:', err);
    }
  };

  // Save current changes to 'draft' document in Firestore with 30s timeout & retry
  const saveDraftToDatabase = async () => {
    try {
      const institutesList = Array.isArray(draftPortfolio.professionalInstitutes) && draftPortfolio.professionalInstitutes.length > 0
        ? draftPortfolio.professionalInstitutes
        : (draftPortfolio.professionalInstitute ? [draftPortfolio.professionalInstitute] : (initialPortfolioData.professionalInstitutes || []));

      const links = draftPortfolio.socialLinks || initialPortfolioData.socialLinks || [];
      const fb = links.find(l => l.platform === 'facebook')?.url;
      const tg = links.find(l => l.platform === 'telegram')?.url;
      const be = links.find(l => l.platform === 'behance')?.url;
      const yt = links.find(l => l.platform === 'youtube')?.url;

      const draftData: PortfolioConfig = {
        ...draftPortfolio,
        professionalInstitutes: institutesList,
        professionalInstitute: institutesList[0] || initialPortfolioData.professionalInstitute,
        socialLinks: links,
        contact: {
          ...(draftPortfolio.contact || {}),
          ...(fb ? { facebookUrl: fb } : {}),
          ...(tg ? { telegramUrl: tg } : {}),
          ...(be ? { behanceUrl: be } : {}),
          ...(yt ? { youtubeUrl: yt } : {})
        },
        status: 'draft',
        updatedAt: new Date().toISOString()
      };
      await executeWriteWithRetryAndFallback('draft', draftData, 'Save Draft');
      setDraftPortfolio(draftData);
      hasUnsavedEditsRef.current = false;
      lastSyncedDraftUpdatedAtRef.current = draftData.updatedAt || null;
      const t = formatTimeString(draftData.updatedAt);
      setCloudSyncStatus(t ? `Saved to cloud at ${t}` : 'Saved to cloud');
      // Condition 3: Delete jabir_draft_local_backup ONLY after a successful Save Draft
      try {
        localStorage.removeItem('jabir_draft_local_backup');
      } catch {}
    } catch (error) {
      setCloudSyncStatus('NOT saved to cloud');
      handleFirestoreError(error, OperationType.WRITE, 'portfolio/draft');
    }
  };

  // Publish to 'published' document in Firestore with 30s timeout & retry
  const publishToLive = async () => {
    try {
      const now = new Date().toISOString();
      const institutesList = Array.isArray(draftPortfolio.professionalInstitutes) && draftPortfolio.professionalInstitutes.length > 0
        ? draftPortfolio.professionalInstitutes
        : (draftPortfolio.professionalInstitute ? [draftPortfolio.professionalInstitute] : (initialPortfolioData.professionalInstitutes || []));

      const links = draftPortfolio.socialLinks || initialPortfolioData.socialLinks || [];
      const fb = links.find(l => l.platform === 'facebook')?.url;
      const tg = links.find(l => l.platform === 'telegram')?.url;
      const be = links.find(l => l.platform === 'behance')?.url;
      const yt = links.find(l => l.platform === 'youtube')?.url;

      const publishData: PortfolioConfig = {
        ...draftPortfolio,
        professionalInstitutes: institutesList,
        professionalInstitute: institutesList[0] || initialPortfolioData.professionalInstitute,
        socialLinks: links,
        contact: {
          ...(draftPortfolio.contact || {}),
          ...(fb ? { facebookUrl: fb } : {}),
          ...(tg ? { telegramUrl: tg } : {}),
          ...(be ? { behanceUrl: be } : {}),
          ...(yt ? { youtubeUrl: yt } : {})
        },
        status: 'published',
        updatedAt: now,
        publishedAt: now
      };
      
      // Save to published doc with timeout & retry
      await executeWriteWithRetryAndFallback('published', publishData, 'Publish to Live');
      // Also update draft to stay in sync
      await executeWriteWithRetryAndFallback('draft', publishData, 'Sync Draft to Live');
      
      setPortfolio(publishData);
      setDraftPortfolio(publishData);
      hasUnsavedEditsRef.current = false;
      lastSyncedDraftUpdatedAtRef.current = now;
      const t = formatTimeString(now);
      setCloudSyncStatus(t ? `Saved to cloud at ${t}` : 'Saved to cloud');
      // Condition 3: Delete jabir_draft_local_backup ONLY after a successful Publish
      try {
        localStorage.removeItem('jabir_draft_local_backup');
      } catch {}
    } catch (error) {
      setCloudSyncStatus('NOT saved to cloud');
      handleFirestoreError(error, OperationType.WRITE, 'portfolio/published');
    }
  };

  // Submit contact lead to Firestore + Google Apps Script Webhook
  const submitContactLead = async (data: Omit<Lead, 'id' | 'createdAt' | 'status'>): Promise<boolean> => {
    // Spam honeypot protection: if honeypot is populated, silently return success without saving
    if (data.honeypot && data.honeypot.trim() !== '') {
      console.warn('Bot submission trapped by honeypot.');
      return true;
    }

    const newLead: Omit<Lead, 'id'> = {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() || '',
      country: data.country?.trim() || '',
      projectType: data.projectType?.trim() || 'General Inquiry',
      message: data.message.trim(),
      status: 'new',
      createdAt: new Date().toISOString(),
      syncedToSheet: false
    };

    try {
      // 1. Save to Firestore leads collection
      const leadsCol = collection(db, 'leads');
      await addDoc(leadsCol, {
        ...newLead,
        timestamp: serverTimestamp()
      });

      // 2. If Google Sheet Webhook is configured, post lead payload
      const webhookUrl = portfolio.googleSheetWebhookUrl || draftPortfolio.googleSheetWebhookUrl;
      if (webhookUrl && webhookUrl.startsWith('http')) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            mode: 'no-cors', // standard for Google Apps Script Web App
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              timestamp: newLead.createdAt,
              name: newLead.name,
              email: newLead.email,
              phone: newLead.phone,
              country: newLead.country,
              projectType: newLead.projectType,
              message: newLead.message
            })
          });
        } catch (sheetError) {
          console.warn('Google Sheet webhook post note:', sheetError);
        }
      }

      return true;
    } catch (error) {
      console.error('Lead submission failure:', error);
      handleFirestoreError(error, OperationType.CREATE, 'leads');
      return false;
    }
  };

  const fetchLeads = async (): Promise<Lead[]> => {
    try {
      const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<Lead, 'id'>)
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'leads');
      return [];
    }
  };

  const updateLeadStatus = async (leadId: string, status: 'new' | 'contacted' | 'completed') => {
    try {
      await setDoc(doc(db, 'leads', leadId), { status }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `leads/${leadId}`);
    }
  };

  // Localized text helper: safely returns string for current language
  const loc = (text?: LocalizedText | string): string => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    return text[language] || text.en || text.bn || text.ar || '';
  };

  const activePortfolio = isPreviewDraft ? draftPortfolio : portfolio;

  // Dynamically apply Theme CSS Variables, data-theme attribute, & Title
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', activeThemeId);
    root.style.setProperty('--custom-accent', customAccentColor);

    const fonts = activePortfolio.theme?.fonts || defaultThemeFonts;

    if (activeThemeId === 'dark') {
      const colors = activePortfolio.theme?.colors || defaultThemeColors;
      const bg = colors.background && colors.background.toUpperCase() !== '#0B0F12' ? colors.background : defaultThemeColors.background;
      const surf = colors.surface && colors.surface.toUpperCase() !== '#12161A' ? colors.surface : defaultThemeColors.surface;
      const sec = colors.secondary && colors.secondary.toUpperCase() !== '#181E24' ? colors.secondary : defaultThemeColors.secondary;
      const brd = colors.border && colors.border.toUpperCase() !== '#232B33' ? colors.border : defaultThemeColors.border;
      const pri = colors.primary && colors.primary.toUpperCase() !== '#FF5722' ? colors.primary : defaultThemeColors.primary;
      const acc = colors.accent && colors.accent.toUpperCase() !== '#FF5722' ? colors.accent : defaultThemeColors.accent;

      root.style.setProperty('--brand-black', bg);
      root.style.setProperty('--brand-dark', surf);
      root.style.setProperty('--brand-surface', sec);
      root.style.setProperty('--brand-border', brd);
      root.style.setProperty('--brand-border-subtle', brd);
      root.style.setProperty('--brand-orange', pri);
      root.style.setProperty('--brand-orange-hover', pri);
      root.style.setProperty('--brand-orange-light', acc);
    } else {
      root.style.removeProperty('--brand-black');
      root.style.removeProperty('--brand-dark');
      root.style.removeProperty('--brand-surface');
      root.style.removeProperty('--brand-border');
      root.style.removeProperty('--brand-border-subtle');
      if (activeThemeId !== 'custom') {
        root.style.removeProperty('--brand-orange');
        root.style.removeProperty('--brand-orange-hover');
        root.style.removeProperty('--brand-orange-light');
      }
    }

    // Font families
    if (fonts.english) root.style.setProperty('--font-latin', `'${fonts.english}', system-ui, sans-serif`);
    if (fonts.bangla) root.style.setProperty('--font-bangla', `'${fonts.bangla}', 'Li Ador Noirrit', sans-serif`);
    if (fonts.arabic) root.style.setProperty('--font-arabic', `'${fonts.arabic}', 'Cairo', system-ui, sans-serif`);

    if (activePortfolio.branding?.title) {
      document.title = activePortfolio.branding.title;
    }
  }, [activePortfolio.theme, activePortfolio.branding?.title, activeThemeId, customAccentColor]);

  return (
    <PortfolioContext.Provider
      value={{
        portfolio: activePortfolio,
        draftPortfolio,
        loading,
        isAdmin,
        authLoading,
        currentUser,
        language,
        setLanguage,
        ui: translations[language],
        loc,
        isPreviewDraft,
        setIsPreviewDraft,
        activeThemeId,
        setActiveThemeId,
        customAccentColor,
        setCustomAccentColor,
        updateDraft,
        saveDraftToDatabase,
        publishToLive,
        submitContactLead,
        fetchLeads,
        updateLeadStatus,
        exportPortfolioBackup,
        cloudSyncStatus,
        remoteDraftConflict,
        resolveDraftConflict
      }}
    >
      {/* Condition 2: Clear conflict banner if another device saved a newer version while admin has local edits */}
      {isAdmin && remoteDraftConflict && (
        <div 
          role="alert"
          className="fixed top-0 left-0 right-0 z-[999999] bg-[#1a1309] border-b-2 border-amber-500 shadow-2xl px-4 py-3 text-amber-100 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top duration-300"
        >
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping shrink-0" />
            <div>
              <p className="font-bold text-sm text-amber-200">
                A newer version was saved from another device{remoteDraftConflict.incomingTime ? ` at ${remoteDraftConflict.incomingTime}` : ''}.
              </p>
              <p className="text-xs text-neutral-300">
                Load the newer version from the cloud or keep your current edits?
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse shrink-0">
            <button
              type="button"
              onClick={() => resolveDraftConflict('load')}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Load newer version
            </button>
            <button
              type="button"
              onClick={() => resolveDraftConflict('keep')}
              className="px-3.5 py-1.5 rounded-lg bg-[#25201A] hover:bg-[#322B22] text-neutral-200 border border-amber-700/60 font-semibold text-xs transition-all cursor-pointer"
            >
              Keep mine
            </button>
          </div>
        </div>
      )}

      {/* Condition 6: Clear cloud save status pill for admin */}
      {isAdmin && (
        <div 
          className="fixed bottom-4 left-4 z-[99999] px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md border shadow-lg flex items-center space-x-2 rtl:space-x-reverse pointer-events-none select-none transition-all"
          style={{
            backgroundColor: cloudSyncStatus.startsWith('Saved') ? 'rgba(16, 185, 129, 0.14)' : 'rgba(245, 158, 11, 0.16)',
            borderColor: cloudSyncStatus.startsWith('Saved') ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.4)',
            color: cloudSyncStatus.startsWith('Saved') ? '#34D399' : '#FBBF24'
          }}
        >
          <span 
            className="w-2 h-2 rounded-full shrink-0" 
            style={{ backgroundColor: cloudSyncStatus.startsWith('Saved') ? '#10B981' : '#F59E0B' }} 
          />
          <span>{cloudSyncStatus}</span>
        </div>
      )}

      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
