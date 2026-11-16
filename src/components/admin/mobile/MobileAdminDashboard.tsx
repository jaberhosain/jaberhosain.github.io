import React, { useState, useEffect } from 'react';
import {
  Layers,
  Palette,
  Eye,
  Send,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  CheckCircle,
  AlertCircle,
  LogOut,
  LogIn,
  KeyRound,
  Lock,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Inbox,
  Check,
  Sliders,
  Download,
  RefreshCw,
  User,
  Wand2,
  Loader2
} from 'lucide-react';
import { usePortfolio } from '../../../context/PortfolioContext';
import {
  auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from '../../../lib/firebase';
import { uploadMediaToStorage } from '../../../lib/mediaUpload';
import { resolveBehanceProjectFromUrl } from '../../../lib/imageUrlResolver';
import {
  ProjectItem,
  VideoShowcaseItem,
  Lead,
  ThemeId,
  ServiceItem,
  SkillCategory,
  VideoSectionFormat,
  VideoSubSectionTier
} from '../../../types/portfolio';
import {
  VIDEO_SECTION_META,
  VIDEO_SUBSECTION_META,
  resolveVideoSection,
  resolveVideoSubSection
} from '../../../lib/videoOrganization';
import { defaultThemeColors, defaultThemeFonts } from '../../../data/initialPortfolio';
import { EducationEditor } from '../EducationEditor';
import { HeroEditor } from '../HeroEditor';
import { SocialLinksEditor } from '../SocialLinksEditor';
import { WorkflowEditor } from '../WorkflowEditor';
import { ContactFooterEditor } from '../ContactFooterEditor';
import { ThemeEditor } from '../ThemeEditor';
import { ConfirmDeleteModal } from '../ConfirmDeleteModal';
import { ADMIN_GROUPS, AdminGroupId } from '../adminNavigation';
import {
  detectVideoType,
  extractVimeoInfo,
  extractYouTubeId,
  fetchVideoAutoMetadata,
  VimeoIcon
} from '../../../lib/videoUtils';
import { BestWorkGraphicEditor } from '../BestWorkGraphicEditor';
import { BestWorkVideoEditor } from '../BestWorkVideoEditor';
import { CaseStudiesEditor } from '../CaseStudiesEditor';
import { StatsTestimonialsEditor } from '../StatsTestimonialsEditor';
import { ImageUploaderField } from '../ImageUploaderField';
import { ProjectGalleryManager } from '../ProjectGalleryManager';
import { HomePage } from '../../pages/HomePage';
import { AboutPage } from '../../pages/AboutPage';
import { VideosPage } from '../../pages/VideosPage';
import { DesignPage } from '../../pages/DesignPage';
import { SkillsPage } from '../../pages/SkillsPage';
import { ContactPage } from '../../pages/ContactPage';
import { Footer } from '../../Footer';
import { VideoModal } from '../../VideoModal';
import { LightboxModal } from '../../LightboxModal';

interface MobileAdminDashboardProps {
  onBackToSite: () => void;
}

type MobileTab = 'overview' | AdminGroupId;
type SubSection = string | null;
type PreviewPageId = 'home' | 'about' | 'videos' | 'design' | 'skills' | 'contact';

export const MobileAdminDashboard: React.FC<MobileAdminDashboardProps> = ({ onBackToSite }) => {
  const {
    portfolio,
    draftPortfolio,
    updateDraft,
    saveDraftToDatabase,
    publishToLive,
    isPreviewDraft,
    setIsPreviewDraft,
    isAdmin,
    authLoading: authRestoring,
    currentUser,
    fetchLeads,
    updateLeadStatus,
    exportPortfolioBackup
  } = usePortfolio();

  // Navigation states
  const [activeTab, setActiveTab] = useState<MobileTab>('overview');
  const [activeSection, setActiveSection] = useState<SubSection>(null);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [wasPreviewDraft, setWasPreviewDraft] = useState(false);
  const [previewPage, setPreviewPage] = useState<PreviewPageId>('home');
  const [previewVideo, setPreviewVideo] = useState<VideoShowcaseItem | null>(null);
  const [previewProject, setPreviewProject] = useState<ProjectItem | null>(null);
  const [previewLightboxIndex, setPreviewLightboxIndex] = useState(0);

  // Authentication states (Strictly identical to Desktop Admin)
  const [usernameInput, setUsernameInput] = useState('jabirbd');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number>(0);

  // Saving / Publishing states
  const [savingDraft, setSavingDraft] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Leads
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Media & Behance states
  const [fetchingOgId, setFetchingOgId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [behanceImportUrl, setBehanceImportUrl] = useState('');
  const [importingBehanceProject, setImportingBehanceProject] = useState(false);
  const [extractingProjectId, setExtractingProjectId] = useState<string | null>(null);
  const [behanceImportHint, setBehanceImportHint] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Reusable Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    itemName?: string;
    message?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    onConfirm: () => {}
  });

  const requestDelete = (title: string, itemName: string, onConfirm: () => void, message?: string) => {
    setDeleteConfirm({
      isOpen: true,
      title,
      itemName,
      message,
      onConfirm
    });
  };

  // Check for unsaved changes
  const hasUnsavedChanges = JSON.stringify(draftPortfolio) !== JSON.stringify(portfolio);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const openLivePreview = () => {
    setWasPreviewDraft(isPreviewDraft);
    setIsPreviewDraft(true);
    setPreviewPage('home');
    setShowLivePreview(true);
  };

  const closeLivePreview = () => {
    setShowLivePreview(false);
    setPreviewVideo(null);
    setPreviewProject(null);
    setIsPreviewDraft(wasPreviewDraft);
  };

  // Mobile 1-Click Import Entire Behance Project Group
  const handleImportNewBehanceProject = async () => {
    const url = behanceImportUrl.trim();
    if (!url) {
      setBehanceImportHint({ type: 'err', text: 'আগে একটি Behance প্রজেক্টের লিংক পেস্ট করুন।' });
      return;
    }

    setImportingBehanceProject(true);
    setBehanceImportHint(null);
    try {
      const res = await resolveBehanceProjectFromUrl(url);
      if (res.success && res.images.length > 0) {
        const newId = 'proj-' + Date.now();
        const nextOrder = (draftPortfolio.projects?.length || 0) + 1;
        const resolvedTitle = res.title?.trim() || 'Behance Poster Series';
        const resolvedDesc =
          res.description?.trim() ||
          'High-resolution graphic design poster campaign and visual identity series.';

        const newProject: ProjectItem = {
          id: newId,
          title: { en: resolvedTitle, bn: resolvedTitle, ar: resolvedTitle },
          groupName: { en: resolvedTitle, bn: '', ar: '' },
          category: 'graphic',
          description: { en: resolvedDesc, bn: resolvedDesc, ar: resolvedDesc },
          behanceUrl: url,
          externalUrl: '',
          coverImage: res.coverImage || res.images[0],
          galleryImages: res.images,
          galleryCaptions: res.images.map(() => ''),
          order: nextOrder,
        };

        updateDraft((prev) => ({
          ...prev,
          projects: [...(prev.projects || []), newProject],
        }));
        setBehanceImportUrl('');
        setBehanceImportHint({
          type: 'ok',
          text: `"${resolvedTitle}" (${res.images.length}টি পোস্টার) #${nextOrder} হিসেবে যুক্ত হয়েছে।`,
        });
        showToast(`Imported "${resolvedTitle}" (${res.images.length} posters)!`);
        setTimeout(() => {
          document.getElementById(`mobile-project-${newId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120);
      } else {
        setBehanceImportHint({
          type: 'err',
          text:
            res.error ||
            'Behance অটো-ব্লক করেছে। নিচে নতুন প্রজেক্টে "Smart Import / URLs" দিয়ে পেজ সোর্স অথবা পোস্টার লিংক দিন।',
        });
        showToast('Behance blocked automated fetch — use Smart Import.', 'error');
      }
    } catch (err: any) {
      setBehanceImportHint({
        type: 'err',
        text: err?.message || 'Behance থেকে ডেটা আনতে সমস্যা হয়েছে।',
      });
    } finally {
      setImportingBehanceProject(false);
    }
  };

  // Per-project Behance extractor (Mobile)
  const handleExtractProjectBehance = async (proj: ProjectItem) => {
    const url = (proj.behanceUrl || '').trim();
    if (!url || !url.toLowerCase().includes('behance.net')) {
      showToast('প্রথমে প্রজেক্টের Behance লিংক দিন।', 'error');
      return;
    }
    setExtractingProjectId(proj.id);
    try {
      const res = await resolveBehanceProjectFromUrl(url);
      if (res.success && res.images.length > 0) {
        updateDraft((prev) => ({
          ...prev,
          projects: (prev.projects || []).map((p) => {
            if (p.id !== proj.id) return p;
            const merged = [...(p.galleryImages || [])];
            for (const img of res.images) {
              if (img && !merged.includes(img)) merged.push(img);
            }
            const nextCaptions = Array.from({ length: merged.length }, (_, i) => p.galleryCaptions?.[i] || '');
            const isDefaultTitle =
              !p.title?.en || p.title.en === 'New Graphic Project' || p.title.en === 'Untitled';
            return {
              ...p,
              coverImage: p.coverImage || res.coverImage || res.images[0],
              galleryImages: merged,
              galleryCaptions: nextCaptions,
              title: isDefaultTitle && res.title ? { ...(p.title || { en: '', bn: '', ar: '' }), en: res.title } : p.title,
              groupName: !p.groupName?.en && res.title ? { ...(p.groupName || { en: '', bn: '', ar: '' }), en: res.title } : p.groupName,
            };
          }),
        }));
        showToast(res.note || `${res.images.length}টি পোস্টার যুক্ত হয়েছে!`);
      } else {
        showToast(res.error || 'অটো-এক্সট্র্যাক্ট করা যায়নি। নিচে Smart Import ব্যবহার করুন।', 'error');
      }
    } finally {
      setExtractingProjectId(null);
    }
  };

  // Auth Handlers (Matching Desktop Admin exactly)
  const handleUsernamePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const now = Date.now();
    if (lockoutUntil && now < lockoutUntil) {
      const remaining = Math.ceil((lockoutUntil - now) / 1000);
      setAuthError(`Too many failed attempts. Please wait ${remaining} seconds before trying again.`);
      return;
    }

    const cleanIdentifier = usernameInput.trim();
    if (!cleanIdentifier) {
      setAuthError('Please enter your username or email.');
      return;
    }
    if (!password) {
      setAuthError('Please enter your password.');
      return;
    }

    // Mapping rule: if no @ is present, internally map username to username@jabir.internal
    const authEmail = cleanIdentifier.includes('@')
      ? cleanIdentifier.toLowerCase()
      : `${cleanIdentifier.toLowerCase()}@jabir.internal`;

    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, authEmail, password);
      setFailedAttempts(0);
      setLockoutUntil(0);
      showToast('Authenticated successfully!');
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);

      if (nextFailed >= 5) {
        setLockoutUntil(Date.now() + 60000);
        setAuthError('Too many failed attempts. Please wait 60 seconds before trying again.');
      } else {
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
          setAuthError('Invalid username or password.');
        } else if (err.code === 'auth/too-many-requests') {
          setAuthError('Too many unsuccessful login attempts. Please wait or use Google sign-in.');
        } else {
          setAuthError(err.message || 'Authentication failed. Please verify credentials.');
        }
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      showToast('Logged in via Google successfully!');
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Google authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showToast('Signed out successfully.');
    } catch (err) {
      console.error(err);
    }
  };

  // Change Password States & Handler (Mobile Settings Group)
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordChangeMessage, setPasswordChangeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeMessage(null);

    if (!auth.currentUser || !auth.currentUser.email) {
      setPasswordChangeMessage({ type: 'error', text: 'You must be signed in with a password account to change your password.' });
      return;
    }

    if (!currentPasswordInput) {
      setPasswordChangeMessage({ type: 'error', text: 'Please enter your current password.' });
      return;
    }

    if (newPasswordInput.length < 10) {
      setPasswordChangeMessage({ type: 'error', text: 'New password must be at least 10 characters long.' });
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordChangeMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPasswordInput);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPasswordInput);

      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setPasswordChangeMessage({ type: 'success', text: 'Password updated successfully.' });
      showToast('Password updated successfully!', 'success');
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setPasswordChangeMessage({ type: 'error', text: 'Current password is incorrect.' });
      } else if (err.code === 'auth/weak-password') {
        setPasswordChangeMessage({ type: 'error', text: 'Password is too weak. Please choose a stronger password.' });
      } else {
        setPasswordChangeMessage({ type: 'error', text: err.message || 'Failed to update password.' });
      }
    } finally {
      setChangingPassword(false);
    }
  };

  // Optional Inactivity Auto-Logout (Off by default)
  const [autoLogoutMinutes, setAutoLogoutMinutes] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('jabir_admin_auto_logout_mins');
      return saved ? Number(saved) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const handleAutoLogoutChange = (mins: number) => {
    setAutoLogoutMinutes(mins);
    try {
      if (mins > 0) {
        localStorage.setItem('jabir_admin_auto_logout_mins', String(mins));
      } else {
        localStorage.removeItem('jabir_admin_auto_logout_mins');
      }
    } catch {}
  };

  useEffect(() => {
    if (!currentUser || !isAdmin || autoLogoutMinutes <= 0) return;

    const timeoutMs = autoLogoutMinutes * 60 * 1000;
    let timerId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        signOut(auth).catch(console.error);
      }, timeoutMs);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      clearTimeout(timerId);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [currentUser, isAdmin, autoLogoutMinutes]);

  const loggedInLabel = currentUser?.email?.toLowerCase().endsWith('@jabir.internal')
    ? `${currentUser.email.split('@')[0]} (${currentUser.email})`
    : currentUser?.email || 'Admin';

  const parseErrorMessage = (err: any): string => {
    let msg = err?.message || 'Operation failed.';
    try {
      const parsed = JSON.parse(msg);
      if (parsed && parsed.error) {
        msg = parsed.error;
      }
    } catch {}
    return msg;
  };

  // Draft & Publish Actions
  const handleSaveDraft = async () => {
    setSavingDraft(true);
    setSaveError(null);
    try {
      await saveDraftToDatabase();
      showToast('Draft changes saved to database!', 'success');
    } catch (err: any) {
      console.error('Mobile Save Draft Error:', err);
      const msg = parseErrorMessage(err);
      setSaveError(msg);
      showToast('Failed to save draft: ' + msg, 'error');
    } finally {
      setSavingDraft(false);
    }
  };

  const handlePublishLive = async () => {
    setPublishing(true);
    setPublishError(null);
    try {
      await publishToLive();
      showToast('🎉 Published live! Changes are visible to all visitors.', 'success');
    } catch (err: any) {
      console.error('Mobile Publish Live Error:', err);
      const msg = parseErrorMessage(err);
      setPublishError(msg);
      showToast('Publish failed: ' + msg, 'error');
    } finally {
      setPublishing(false);
    }
  };

  // Leads loader
  const loadLeadsData = async () => {
    setLoadingLeads(true);
    try {
      const data = await fetchLeads();
      setLeads(data);
    } catch (err) {
      console.warn('Leads fetch error:', err);
    } finally {
      setLoadingLeads(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'leads' && isAdmin) {
      loadLeadsData();
    }
  }, [activeSection, isAdmin]);

  // Mobile Media Uploader Handler (Resize max 1600px, 0.8 quality, store in Firebase Storage)
  const handleMobileFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: string,
    onSuccess: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress((prev) => ({ ...prev, [fieldKey]: 15 }));
    showToast('Compressing & uploading to Firebase Storage...');

    try {
      const finalUrl = await uploadMediaToStorage(file, (percent) => {
        setUploadProgress((prev) => ({ ...prev, [fieldKey]: percent }));
      });

      setUploadProgress((prev) => ({ ...prev, [fieldKey]: 100 }));
      setTimeout(() => {
        setUploadProgress((prev) => {
          const next = { ...prev };
          delete next[fieldKey];
          return next;
        });
      }, 700);

      onSuccess(finalUrl);
      showToast('Uploaded to Firebase Storage successfully!');
    } catch (err: any) {
      setUploadProgress((prev) => {
        const next = { ...prev };
        delete next[fieldKey];
        return next;
      });
      showToast('Upload failed: ' + (err.message || 'Storage upload error'), 'error');
    } finally {
      e.target.value = '';
    }
  };

  // Automatically fetch video thumbnail & metadata for mobile editor
  const triggerAutoFetchVideo = async (videoUrl: string, idx: number, forceAutoThumbnail = false) => {
    const cleanUrl = videoUrl.trim();
    if (!cleanUrl) return;
    const currentVideo = draftPortfolio.videos?.[idx];
    if (!currentVideo) return;

    const detected = detectVideoType(cleanUrl);
    const ytId = extractYouTubeId(cleanUrl);

    // Fast local YouTube thumbnail fallback
    if (detected === 'youtube' && ytId) {
      const defaultYt = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
      updateDraft((prev) => ({
        ...prev,
        videos: prev.videos.map((v, i) => (i === idx ? { ...v, thumbnailUrl: v.thumbnailUrl || defaultYt } : v)),
      }));
    }

    setFetchingOgId(currentVideo.id);
    try {
      const meta = await fetchVideoAutoMetadata(cleanUrl);
      if (meta && (meta.thumbnailUrl || meta.fallbackThumbnailUrl)) {
        const thumb = meta.thumbnailUrl || meta.fallbackThumbnailUrl || '';
        updateDraft((prev) => ({
          ...prev,
          videos: prev.videos.map((v, i) =>
            i === idx
              ? {
                  ...v,
                  thumbnailUrl: thumb,
                  customThumbnailUrl: forceAutoThumbnail ? '' : v.customThumbnailUrl,
                  title: !v.title?.en && meta.title ? { en: meta.title, bn: '', ar: '' } : v.title,
                  videoType: meta.videoType || v.videoType,
                  videoId: meta.videoId || v.videoId,
                  videoHash: meta.videoHash || v.videoHash,
                  duration: meta.duration || v.duration
                }
              : v
          ),
        }));
      }
    } catch (err: any) {
      console.warn('Mobile auto fetch error:', err);
    } finally {
      setFetchingOgId(null);
    }
  };

  // Open Graph video thumbnail fetcher
  const handleFetchOg = async (videoItem: VideoShowcaseItem, idx: number) => {
    if (!videoItem.videoUrl) {
      showToast('Please enter a video URL first', 'error');
      return;
    }
    setFetchingOgId(videoItem.id);
    try {
      const meta = await fetchVideoAutoMetadata(videoItem.videoUrl);
      if (meta && (meta.thumbnailUrl || meta.fallbackThumbnailUrl)) {
        const thumb = meta.thumbnailUrl || meta.fallbackThumbnailUrl || '';
        updateDraft((prev) => ({
          ...prev,
          videos: prev.videos.map((v, i) =>
            i === idx
              ? {
                  ...v,
                  thumbnailUrl: thumb,
                  title: !v.title?.en && meta.title ? { en: meta.title, bn: '', ar: '' } : v.title,
                  videoType: meta.videoType || v.videoType,
                  videoId: meta.videoId || v.videoId,
                  videoHash: meta.videoHash || v.videoHash,
                  duration: meta.duration || v.duration
                }
              : v
          ),
        }));
        showToast('Thumbnail fetched from video metadata!');
      } else {
        showToast('Could not auto-fetch. Please upload custom thumbnail or use placeholder.', 'error');
      }
    } catch (err: any) {
      showToast('Fetch failed: ' + (err.message || 'Network error'), 'error');
    } finally {
      setFetchingOgId(null);
    }
  };

  // Theme Helpers (Using exact existing desktop theme properties only!)
  const themeColors = draftPortfolio.theme?.colors || defaultThemeColors;
  const themeFonts = draftPortfolio.theme?.fonts || defaultThemeFonts;
  const availableThemes: ThemeId[] = draftPortfolio.theme?.availableThemes || [
    'dark',
    'light',
    'blue',
    'green',
    'purple',
    'warm',
    'custom',
  ];

  const updateThemeColor = (key: keyof typeof defaultThemeColors, val: string) => {
    updateDraft((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        colors: {
          ...(prev.theme?.colors || defaultThemeColors),
          [key]: val,
        },
        fonts: prev.theme?.fonts || defaultThemeFonts,
      },
    }));
  };

  const updateThemeFont = (key: keyof typeof defaultThemeFonts, val: string) => {
    updateDraft((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        colors: prev.theme?.colors || defaultThemeColors,
        fonts: {
          ...(prev.theme?.fonts || defaultThemeFonts),
          [key]: val,
        },
      },
    }));
  };

  const toggleVisitorTheme = (themeId: ThemeId) => {
    if (themeId === 'dark') return; // Dark is locked default
    updateDraft((prev) => {
      const current = prev.theme?.availableThemes || [
        'dark',
        'light',
        'blue',
        'green',
        'purple',
        'warm',
        'custom',
      ];
      const next = current.includes(themeId)
        ? current.filter((id) => id !== themeId)
        : [...current, themeId];
      return {
        ...prev,
        theme: {
          ...prev.theme,
          colors: prev.theme?.colors || defaultThemeColors,
          fonts: prev.theme?.fonts || defaultThemeFonts,
          availableThemes: next,
        },
      };
    });
  };

  // While auth session is restoring from browserLocalPersistence / IndexedDB, show clean loader
  if (authRestoring) {
    return (
      <div className="min-h-screen bg-[#0B0C0F] text-[#F4F0E8] flex flex-col justify-center items-center p-4 font-sans selection:bg-[#E4583B] selection:text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-11 h-11 rounded-xl bg-[#121419] border border-white/[0.08] flex items-center justify-center font-bold text-lg text-[#F4F0E8]">
            <span>M</span>
            <span className="text-[#E4583B]">J</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-[#8E8A82]">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#E4583B]" />
            <span>Verifying session...</span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 1. MOBILE LOGIN VIEW (Touch-friendly, exact same Firebase credentials)
  // ==========================================
  if (!currentUser || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0B0C0F] text-[#F4F0E8] flex flex-col justify-between p-4 font-sans">
        {/* Top Header */}
        <div className="flex items-center justify-between pt-2 pb-5 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <div className="w-9 h-9 rounded-lg bg-[#E4583B] flex items-center justify-center font-bold text-white text-sm">
              MJ
            </div>
            <div>
              <h1 className="text-sm font-semibold text-[#F4F0E8]">
                MD JABER HOSAIN
              </h1>
              <p className="text-[11px] text-[#8E8A82]">Mobile Studio Console</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onBackToSite}
            className="px-3.5 py-2 text-xs font-medium text-[#D7D2C8] hover:text-white rounded-lg bg-[#121419] border border-white/[0.08] min-h-[44px] flex items-center justify-center"
          >
            Back to Site
          </button>
        </div>

        {/* Center Login Box */}
        <div className="my-auto py-6 max-w-sm mx-auto w-full">
          <div className="p-6 rounded-2xl bg-[#121419] border border-white/[0.08] shadow-2xl space-y-5">
            <div className="text-center space-y-1.5">
              <div className="w-11 h-11 rounded-xl bg-[#171A21] border border-white/[0.08] text-[#E4583B] flex items-center justify-center mx-auto mb-2">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-[#F4F0E8]">Admin Authentication</h2>
              <p className="text-xs text-[#8E8A82]">
                Sign in with your username or backup Gmail
              </p>
            </div>

            {currentUser && !isAdmin && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Access Restricted</p>
                  <p className="text-[11px] text-amber-200/80">
                    Logged in as <span className="font-mono">{currentUser.email}</span>, which is not the designated owner account.
                  </p>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="mt-2 text-xs underline text-amber-300 min-h-[44px] flex items-center"
                  >
                    Sign out to switch account
                  </button>
                </div>
              </div>
            )}

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleUsernamePasswordAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#A7A298] mb-1.5">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#6F6B64] absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="jabirbd"
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="w-full pl-9 pr-3 py-3 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-sm font-mono text-[#F4F0E8] placeholder-[#6F6B64] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7A298] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#6F6B64] absolute left-3 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-3 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-sm text-[#F4F0E8] placeholder-[#6F6B64] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-[#E4583B] hover:bg-[#D0492D] transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 min-h-[48px]"
              >
                {authLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div className="relative py-2 flex items-center justify-center">
              <div className="border-t border-white/[0.08] w-full"></div>
              <span className="bg-[#121419] px-3 text-[11px] text-[#6F6B64] absolute">OR</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="w-full py-3 px-4 rounded-xl font-medium text-xs text-[#EAE5DC] bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.08] transition-colors flex items-center justify-center space-x-2 min-h-[48px]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-[11px] text-center text-[#6F6B64] pb-2">
          Studio Admin &middot; Synced with Firebase
        </p>
      </div>
    );
  }

  // ==========================================
  // 2. INTERACTIVE LIVE DRAFT PREVIEW MODAL (Renders real React public pages reading draftPortfolio!)
  // ==========================================
  if (showLivePreview) {
    const previewTabs: { id: PreviewPageId; label: string }[] = [
      { id: 'home', label: 'Home' },
      { id: 'about', label: 'About' },
      { id: 'videos', label: 'Videos' },
      { id: 'design', label: 'Design' },
      { id: 'skills', label: 'Skills' },
      { id: 'contact', label: 'Contact' },
    ];

    const openPreviewLightbox = (proj: ProjectItem, initialIndex = 0) => {
      setPreviewLightboxIndex(initialIndex);
      setPreviewProject(proj);
    };

    const renderPreviewContent = () => {
      switch (previewPage) {
        case 'about':
          return <AboutPage />;
        case 'videos':
          return <VideosPage onOpenVideo={(vid) => setPreviewVideo(vid)} />;
        case 'design':
          return <DesignPage onOpenLightbox={openPreviewLightbox} />;
        case 'skills':
          return <SkillsPage />;
        case 'contact':
          return <ContactPage />;
        case 'home':
        default:
          return (
            <HomePage
              onOpenLightbox={openPreviewLightbox}
              onOpenVideo={(vid) => setPreviewVideo(vid)}
            />
          );
      }
    };

    return (
      <div className="fixed inset-0 z-50 bg-[#0B0C0F] flex flex-col">
        {/* Top Control Bar */}
        <div className="px-3 py-2.5 bg-[#121419]/95 border-b border-white/[0.08] flex items-center justify-between gap-2 backdrop-blur-md shrink-0">
          <button
            type="button"
            onClick={closeLivePreview}
            className="px-3 py-2 rounded-lg bg-[#171A21] border border-white/[0.08] text-xs font-semibold text-[#F4F0E8] flex items-center space-x-1.5 min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 text-[#E4583B]" />
            <span>Back to Admin</span>
          </button>

          <span className="text-xs font-medium text-[#A7A298] truncate">
            Live Draft Preview
          </span>

          <button
            type="button"
            onClick={handlePublishLive}
            disabled={publishing}
            className="px-3.5 py-2 rounded-lg bg-[#E4583B] hover:bg-[#D0492D] text-xs font-semibold text-white flex items-center space-x-1.5 min-h-[44px] disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{publishing ? 'Publishing...' : 'Publish'}</span>
          </button>
        </div>

        {/* Page Switcher Bar inside Preview */}
        <div className="px-3 py-2 bg-[#0B0C0F] border-b border-white/[0.06] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {previewTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPreviewPage(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                previewPage === tab.id
                  ? 'bg-[#E4583B] text-white'
                  : 'bg-[#171A21] text-[#A7A298] hover:text-white border border-white/[0.06]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Draft Site Viewport */}
        <div className="flex-1 overflow-y-auto bg-[#121419] text-[#F4F0E8] relative">
          <div className="min-h-full flex flex-col">
            <div className="flex-1">{renderPreviewContent()}</div>
            <Footer onOpenAdmin={closeLivePreview} />
          </div>
        </div>

        {previewVideo && (
          <VideoModal
            video={previewVideo}
            onClose={() => setPreviewVideo(null)}
          />
        )}

        {previewProject && (
          <LightboxModal
            project={previewProject}
            initialIndex={previewLightboxIndex}
            onClose={() => {
              setPreviewProject(null);
              setPreviewLightboxIndex(0);
            }}
          />
        )}
      </div>
    );
  }

  // ==========================================
  // 3. FULL-SCREEN SUBSECTION EDITORS
  // ==========================================
  const renderSectionEditor = () => {
    switch (activeSection) {
      // ----------------------------------------
      // BRANDING
      // ----------------------------------------
      case 'general-branding':
      case 'branding':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#D7D2C8] mb-1.5">
                  Website Page Title
                </label>
                <input
                  type="text"
                  value={draftPortfolio.branding?.title || ''}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      branding: { ...(prev.branding || {}), title: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-sm text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#D7D2C8] mb-1.5">
                  Brand Name / Monogram Text
                </label>
                <input
                  type="text"
                  value={draftPortfolio.branding?.logoText || ''}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      branding: { ...(prev.branding || {}), logoText: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-sm text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#D7D2C8] mb-1.5">
                  Logo Initials (2 Letters, e.g. MJ)
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={draftPortfolio.branding?.logoInitials || ''}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      branding: { ...(prev.branding || {}), logoInitials: e.target.value.toUpperCase() },
                    }))
                  }
                  className="w-24 px-3 py-2.5 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-sm text-[#F4F0E8] text-center tracking-widest focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                />
              </div>
            </div>

            {/* Change Admin Password Card */}
            <div className="p-4 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[#F4F0E8] flex items-center space-x-2">
                  <KeyRound className="w-4 h-4 text-[#E4583B]" />
                  <span>Change Admin Password</span>
                </h3>
                <p className="text-xs text-[#8E8A82] mt-0.5">
                  Update password for your username login (minimum 10 characters).
                </p>
              </div>

              {passwordChangeMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
                    passwordChangeMessage.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {passwordChangeMessage.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{passwordChangeMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#D7D2C8] mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-sm text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#D7D2C8] mb-1">
                    New Password (min 10 chars)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={10}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="At least 10 characters"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-sm text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#D7D2C8] mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={10}
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-sm text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full py-3 rounded-xl bg-[#E4583B] hover:bg-[#D0492D] text-white font-semibold text-xs transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 min-h-[44px]"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{changingPassword ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </form>
            </div>

            {/* Session Safety & Inactivity Auto-Logout Card */}
            <div className="p-4 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-[#F4F0E8] flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-[#E4583B]" />
                  <span>Session Safety &amp; Auto-Logout</span>
                </h3>
                <p className="text-xs text-[#8E8A82] mt-0.5">
                  Off by default so you stay signed in permanently.
                </p>
              </div>
              <select
                value={autoLogoutMinutes}
                onChange={(e) => handleAutoLogoutChange(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
              >
                <option value={0}>Off — Keep me logged in (Default)</option>
                <option value={15}>After 15 minutes of inactivity</option>
                <option value={30}>After 30 minutes of inactivity</option>
                <option value={60}>After 60 minutes of inactivity</option>
              </select>
            </div>
          </div>
        );

      // ----------------------------------------
      // HERO
      // ----------------------------------------
      case 'hero':
        return (
          <div className="space-y-4">
            <HeroEditor />
          </div>
        );

      // ----------------------------------------
      // ABOUT
      // ----------------------------------------
      case 'about':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-4">
              <ImageUploaderField
                label="About Portrait Photo (URL or Upload)"
                value={draftPortfolio.about.avatarUrl}
                onChange={(val) =>
                  updateDraft((prev) => ({
                    ...prev,
                    about: { ...prev.about, avatarUrl: val },
                  }))
                }
                defaultFallback="/assets/jabir_profile.png"
                helperText="Paste direct image link (i.postimg.cc/..., Google Drive, Firebase) or upload from phone."
              />
              <button
                type="button"
                onClick={() => {
                  updateDraft((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, avatarUrl: prev.about.avatarUrl },
                  }));
                  showToast('Synced photo to Hero & About!');
                }}
                className="w-full py-2.5 rounded-xl bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.08] text-xs font-medium text-[#EAE5DC] flex items-center justify-center space-x-2 min-h-[44px]"
              >
                <CheckCircle className="w-3.5 h-3.5 text-[#E4583B]" />
                <span>Also Apply This Photo to Hero Section</span>
              </button>

              <div>
                <label className="block text-xs font-medium text-[#D7D2C8] mb-1.5">
                  Bio (English)
                </label>
                <textarea
                  rows={4}
                  value={draftPortfolio.about.bio.en || ''}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      about: { ...prev.about, bio: { ...prev.about.bio, en: e.target.value } },
                    }))
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#D7D2C8] mb-1.5">
                  Bio (Bangla)
                </label>
                <textarea
                  rows={4}
                  value={draftPortfolio.about.bio.bn || ''}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      about: { ...prev.about, bio: { ...prev.about.bio, bn: e.target.value } },
                    }))
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                />
              </div>
            </div>
          </div>
        );

      // ----------------------------------------
      // PROFILE PHOTO
      // ----------------------------------------
      case 'photo':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-4">
              <ImageUploaderField
                label="Hero Main Portrait Photo"
                value={draftPortfolio.hero.avatarUrl}
                onChange={(val) =>
                  updateDraft((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, avatarUrl: val },
                  }))
                }
                defaultFallback="/assets/jabir_profile.png"
                helperText="Paste direct image link (i.postimg.cc/..., Google Drive, Firebase) or upload from phone."
              />

              <ImageUploaderField
                label="About Section Portrait Photo"
                value={draftPortfolio.about.avatarUrl}
                onChange={(val) =>
                  updateDraft((prev) => ({
                    ...prev,
                    about: { ...prev.about, avatarUrl: val },
                  }))
                }
                defaultFallback="/assets/jabir_profile.png"
                helperText="Paste direct image link or upload from phone."
              />

              <button
                type="button"
                onClick={() => {
                  const chosen = draftPortfolio.hero.avatarUrl || draftPortfolio.about.avatarUrl;
                  updateDraft((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, avatarUrl: chosen },
                    about: { ...prev.about, avatarUrl: chosen },
                  }));
                  showToast('Synced Hero & About profile photo!');
                }}
                className="w-full py-2.5 rounded-xl bg-[#E4583B] hover:bg-[#D0492D] text-xs font-semibold text-white flex items-center justify-center space-x-2 min-h-[44px]"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Use Hero Photo for Both Hero &amp; About</span>
              </button>
            </div>
          </div>
        );

      // ----------------------------------------
      // SERVICES
      // ----------------------------------------
      case 'services':
        return (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                const newService: ServiceItem = {
                  id: 'service-' + Date.now(),
                  title: { en: 'New Service', bn: 'নতুন সেবা', ar: 'خدمة جديدة' },
                  description: { en: 'Service description', bn: 'সেবার বিবরণ', ar: 'وصف الخدمة' },
                  icon: 'Sparkles',
                };
                updateDraft((prev) => ({
                  ...prev,
                  services: [...(prev.services || []), newService],
                }));
                showToast('New service item added');
              }}
              className="w-full py-3 rounded-xl bg-[#121419] hover:bg-[#171A21] border border-white/[0.08] text-xs font-semibold text-[#E4583B] flex items-center justify-center space-x-2 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>

            {(draftPortfolio.services || []).map((srv, idx) => (
              <div
                key={srv.id || idx}
                className="p-4 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#E4583B] font-semibold tabular-nums">
                    Service #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const name = srv.title?.en || `Service #${idx + 1}`;
                      requestDelete(
                        'Delete Service?',
                        name,
                        () => {
                          updateDraft((prev) => ({
                            ...prev,
                            services: (prev.services || []).filter((_, i) => i !== idx),
                          }));
                          showToast('Service removed');
                        },
                        'Are you sure you want to delete this service? It will be removed from your draft portfolio. Changes take effect on the live website when you click Publish.'
                      );
                    }}
                    className="p-2 text-rose-400 hover:text-rose-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Delete Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs text-[#8E8A82] mb-1">
                    Title (EN)
                  </label>
                  <input
                    type="text"
                    value={srv.title.en || ''}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        services: prev.services.map((s, i) =>
                          i === idx ? { ...s, title: { ...s.title, en: e.target.value } } : s
                        ),
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#8E8A82] mb-1">
                    Description (EN)
                  </label>
                  <textarea
                    rows={2}
                    value={srv.description.en || ''}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        services: prev.services.map((s, i) =>
                          i === idx
                            ? { ...s, description: { ...s.description, en: e.target.value } }
                            : s
                        ),
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        );

      // ----------------------------------------
      // SKILLS
      // ----------------------------------------
      case 'skills':
        return (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                const newSkill: SkillCategory = {
                  id: 'skill-' + Date.now(),
                  title: { en: 'New Skill Category', bn: 'নতুন স্কিল', ar: 'مهارة جديدة' },
                  description: { en: 'Tools and proficiency description', bn: '', ar: '' },
                  tools: ['Adobe Photoshop', 'Premiere Pro'],
                  icon: 'Award',
                };
                updateDraft((prev) => ({
                  ...prev,
                  skills: [...(prev.skills || []), newSkill],
                }));
                showToast('New skill category added');
              }}
              className="w-full py-3 rounded-xl bg-[#121419] hover:bg-[#171A21] border border-white/[0.08] text-xs font-semibold text-[#E4583B] flex items-center justify-center space-x-2 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Skill Category</span>
            </button>

            {(draftPortfolio.skills || []).map((skill, idx) => (
              <div
                key={skill.id || idx}
                className="p-3.5 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#E4583B] font-semibold tabular-nums">
                    Category #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const name = skill.title?.en || `Category #${idx + 1}`;
                      requestDelete(
                        'Delete Skill Category?',
                        name,
                        () => {
                          updateDraft((prev) => ({
                            ...prev,
                            skills: (prev.skills || []).filter((_, i) => i !== idx),
                          }));
                          showToast('Skill deleted');
                        },
                        'Are you sure you want to delete this skill category? It will be removed from your draft portfolio. Changes take effect on the live website when you click Publish.'
                      );
                    }}
                    className="p-2 text-rose-400 hover:text-rose-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Delete Skill"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] text-[#8E8A82] mb-1">
                    Category Title (EN)
                  </label>
                  <input
                    type="text"
                    value={skill.title.en || ''}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        skills: prev.skills.map((s, i) =>
                          i === idx ? { ...s, title: { ...s.title, en: e.target.value } } : s
                        ),
                      }))
                    }
                    className="w-full px-2.5 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#8E8A82] mb-1">
                    Software / Tools (comma separated)
                  </label>
                  <input
                    type="text"
                    value={skill.tools.join(', ')}
                    onChange={(e) => {
                      const list = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
                      updateDraft((prev) => ({
                        ...prev,
                        skills: prev.skills.map((s, i) => (i === idx ? { ...s, tools: list } : s)),
                      }));
                    }}
                    className="w-full px-2.5 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>
            ))}

            <div className="pt-6 border-t border-white/[0.08]">
              <WorkflowEditor />
            </div>
          </div>
        );

      // ----------------------------------------
      // CREATIVE WORKFLOW
      // ----------------------------------------
      case 'workflow':
        return (
          <div className="space-y-4">
            <WorkflowEditor />
          </div>
        );

      // ----------------------------------------
      // EDUCATION (Academic & Professional)
      // ----------------------------------------
      case 'academic':
        return (
          <div className="space-y-4">
            <EducationEditor activeSection="academic" />
          </div>
        );

      case 'professional':
        return (
          <div className="space-y-4">
            <EducationEditor activeSection="professional" />
          </div>
        );

      case 'education':
        return (
          <div className="space-y-4">
            <EducationEditor activeSection="all" />
          </div>
        );

      // ----------------------------------------
      // GRAPHIC DESIGN (PROJECTS & PORTFOLIO)
      // ----------------------------------------
      case 'graphic-design':
      case 'projects':
        return (
          <div className="space-y-4">
            {/* 1-Click Mobile Behance Group Importer */}
            <div className="p-4 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-2.5">
              <div className="flex items-center space-x-2">
                <Wand2 className="w-4 h-4 text-[#E4583B]" />
                <h3 className="text-xs font-semibold text-[#F4F0E8]">
                  Import Entire Behance Project Group
                </h3>
              </div>
              <p className="text-[11px] text-[#8E8A82]">
                Behance প্রজেক্ট লিংক দিন—সব পোস্টার ১টি প্রজেক্ট গ্রুপে যোগ হয়ে যাবে।
              </p>
              <input
                type="url"
                value={behanceImportUrl}
                onChange={(e) => setBehanceImportUrl(e.target.value)}
                placeholder="https://www.behance.net/gallery/..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs font-mono text-[#F4F0E8] placeholder-[#6F6B64] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
              />
              <button
                type="button"
                disabled={importingBehanceProject}
                onClick={handleImportNewBehanceProject}
                className="w-full py-2.5 rounded-xl bg-[#E4583B] hover:bg-[#D0492D] text-xs font-semibold text-white flex items-center justify-center space-x-1.5 disabled:opacity-50 min-h-[44px]"
              >
                {importingBehanceProject ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{importingBehanceProject ? 'Importing Posters...' : 'Import Behance Group'}</span>
              </button>

              {behanceImportHint && (
                <div
                  className={`p-2.5 rounded-xl text-xs border ${
                    behanceImportHint.type === 'ok'
                      ? 'bg-emerald-950/35 border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-950/35 border-amber-500/30 text-amber-200'
                  }`}
                >
                  {behanceImportHint.text}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                const newProject: ProjectItem = {
                  id: 'proj-' + Date.now(),
                  title: { en: 'New Graphic Project', bn: 'নতুন গ্রাফিক্স প্রজেক্ট', ar: 'مشروع جرافيك جديد' },
                  groupName: { en: '', bn: '', ar: '' },
                  description: { en: 'Graphic design project', bn: '', ar: '' },
                  category: 'graphic',
                  coverImage: '',
                  galleryImages: [],
                  galleryCaptions: [],
                  behanceUrl: 'https://www.behance.net/jaberhosain',
                  order: (draftPortfolio.projects?.length || 0) + 1,
                };
                updateDraft((prev) => ({
                  ...prev,
                  projects: [...(prev.projects || []), newProject],
                }));
                showToast('New graphic project created!');
              }}
              className="w-full py-3 rounded-xl bg-[#121419] hover:bg-[#171A21] border border-white/[0.08] text-xs font-semibold text-[#E4583B] flex items-center justify-center space-x-2 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Blank Graphics Project</span>
            </button>

            {(draftPortfolio.projects || []).map((proj, idx) => (
              <div
                id={`mobile-project-${proj.id}`}
                key={proj.id || idx}
                className="p-4 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-3"
              >
                {/* Header & Order Controls */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <span className="text-xs font-semibold text-[#F4F0E8] truncate tabular-nums">
                      #{idx + 1} {proj.title?.en || 'Untitled'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => {
                        const newProjects = [...(draftPortfolio.projects || [])];
                        const item = newProjects.splice(idx, 1)[0];
                        newProjects.splice(idx - 1, 0, item);
                        updateDraft((prev) => ({
                          ...prev,
                          projects: newProjects.map((p, i) => ({ ...p, order: i + 1 })),
                        }));
                      }}
                      className="p-2 text-[#8E8A82] hover:text-white disabled:opacity-30 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === (draftPortfolio.projects?.length || 0) - 1}
                      onClick={() => {
                        const newProjects = [...(draftPortfolio.projects || [])];
                        const item = newProjects.splice(idx, 1)[0];
                        newProjects.splice(idx + 1, 0, item);
                        updateDraft((prev) => ({
                          ...prev,
                          projects: newProjects.map((p, i) => ({ ...p, order: i + 1 })),
                        }));
                      }}
                      className="p-2 text-[#8E8A82] hover:text-white disabled:opacity-30 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const name = proj.title?.en || `Project #${idx + 1}`;
                        requestDelete(
                          'Delete Project?',
                          name,
                          () => {
                            updateDraft((prev) => ({
                              ...prev,
                              projects: (prev.projects || []).filter((_, i) => i !== idx),
                            }));
                            showToast('Project deleted');
                          },
                          'Are you sure you want to delete this project? It will be removed from your draft portfolio. Changes take effect on the live website when you click Publish.'
                        );
                      }}
                      className="p-2 text-rose-400 hover:text-rose-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Group / Series Name */}
                <div>
                  <label className="block text-[11px] text-[#8E8A82] mb-1">
                    Project Group / Series Name (Optional, e.g. Eid Poster Series)
                  </label>
                  <input
                    type="text"
                    value={proj.groupName?.en || ''}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        projects: prev.projects?.map((p, i) =>
                          i === idx
                            ? {
                                ...p,
                                groupName: {
                                  ...(p.groupName || { en: '', bn: '', ar: '' }),
                                  en: e.target.value,
                                },
                              }
                            : p
                        ),
                      }))
                    }
                    placeholder="e.g. Brand Identity / Poster Campaign"
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#8E8A82] mb-1">
                    Title (EN)
                  </label>
                  <input
                    type="text"
                    value={proj.title.en || ''}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        projects: prev.projects?.map((p, i) =>
                          i === idx ? { ...p, title: { ...p.title, en: e.target.value } } : p
                        ),
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#8E8A82] mb-1">
                    Behance Project Link (opens in Lightbox)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={proj.behanceUrl || ''}
                      onChange={(e) =>
                        updateDraft((prev) => ({
                          ...prev,
                          projects: prev.projects?.map((p, i) =>
                            i === idx ? { ...p, behanceUrl: e.target.value } : p
                          ),
                        }))
                      }
                      placeholder="https://www.behance.net/gallery/..."
                      className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs font-mono text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                    />
                    <button
                      type="button"
                      disabled={extractingProjectId === proj.id || !proj.behanceUrl}
                      onClick={() => handleExtractProjectBehance(proj)}
                      className="px-3 py-2 rounded-xl bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.08] text-xs font-medium text-[#F4F0E8] disabled:opacity-45 shrink-0 min-h-[44px] flex items-center space-x-1"
                    >
                      {extractingProjectId === proj.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E4583B]" />
                      ) : (
                        <Wand2 className="w-3.5 h-3.5 text-[#E4583B]" />
                      )}
                      <span>{extractingProjectId === proj.id ? 'Extracting' : 'Extract'}</span>
                    </button>
                  </div>
                </div>

                <ImageUploaderField
                  label="Cover Poster / Artwork Image"
                  value={proj.coverImage || ''}
                  onChange={(val) =>
                    updateDraft((prev) => ({
                      ...prev,
                      projects: prev.projects?.map((p, i) =>
                        i === idx ? { ...p, coverImage: val } : p
                      ),
                    }))
                  }
                  defaultFallback=""
                  helperText="Paste direct image link (mir-s3-cdn-cf.behance.net/..., i.postimg.cc/...) or upload."
                />

                <ProjectGalleryManager
                  galleryImages={proj.galleryImages || []}
                  galleryCaptions={proj.galleryCaptions || []}
                  coverImage={proj.coverImage || ''}
                  behanceUrl={proj.behanceUrl || ''}
                  onChange={(nextImages, nextCaptions, newCover) => {
                    updateDraft((prev) => ({
                      ...prev,
                      projects: prev.projects?.map((p, i) =>
                        i === idx
                          ? {
                              ...p,
                              galleryImages: nextImages,
                              galleryCaptions: nextCaptions,
                              ...(newCover !== undefined ? { coverImage: newCover } : {}),
                            }
                          : p
                      ),
                    }));
                  }}
                  onBehanceImported={({ title, description }) => {
                    updateDraft((prev) => ({
                      ...prev,
                      projects: prev.projects?.map((p, i) => {
                        if (i !== idx) return p;
                        const isDefaultTitle =
                          !p.title?.en || p.title.en === 'New Graphic Project' || p.title.en === 'Untitled';
                        return {
                          ...p,
                          title: isDefaultTitle && title ? { ...(p.title || { en: '', bn: '', ar: '' }), en: title } : p.title,
                          groupName: !p.groupName?.en && title ? { ...(p.groupName || { en: '', bn: '', ar: '' }), en: title } : p.groupName,
                          description:
                            !p.description?.en && description
                              ? { ...(p.description || { en: '', bn: '', ar: '' }), en: description }
                              : p.description,
                        };
                      }),
                    }));
                  }}
                />
              </div>
            ))}
          </div>
        );

      // ----------------------------------------
      // GRAPHIC DESIGN - BEST WORK
      // ----------------------------------------
      case 'graphic-best':
        return <BestWorkGraphicEditor onNotify={showToast} />;

      // ----------------------------------------
      // VIDEO EDITING (SHOWCASE & EMBEDS)
      // ----------------------------------------
      case 'video-editing':
      case 'videos':
        return (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                const newVideo: VideoShowcaseItem = {
                  id: 'vid-' + Date.now(),
                  title: { en: 'New Video', bn: '', ar: '' },
                  description: { en: '', bn: '', ar: '' },
                  videoType: 'youtube',
                  videoUrl: '',
                  thumbnailUrl: '',
                  customThumbnailUrl: '',
                  order: (draftPortfolio.videos?.length || 0) + 1,
                };
                updateDraft((prev) => ({
                  ...prev,
                  videos: [...(prev.videos || []), newVideo],
                }));
                showToast('New video entry added');
              }}
              className="w-full py-3 rounded-xl bg-[#121419] hover:bg-[#171A21] border border-white/[0.08] text-xs font-semibold text-[#E4583B] flex items-center justify-center space-x-2 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Video</span>
            </button>

            {(draftPortfolio.videos || []).map((vid, idx) => (
              <div
                key={vid.id || idx}
                className="p-4 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#F4F0E8] tabular-nums">
                    #{idx + 1} {vid.title?.en || 'Untitled Video'}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => {
                        const newVideos = [...(draftPortfolio.videos || [])];
                        const item = newVideos.splice(idx, 1)[0];
                        newVideos.splice(idx - 1, 0, item);
                        updateDraft((prev) => ({
                          ...prev,
                          videos: newVideos.map((v, i) => ({ ...v, order: i + 1 })),
                        }));
                      }}
                      className="p-2 text-[#8E8A82] hover:text-white disabled:opacity-30 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === (draftPortfolio.videos?.length || 0) - 1}
                      onClick={() => {
                        const newVideos = [...(draftPortfolio.videos || [])];
                        const item = newVideos.splice(idx, 1)[0];
                        newVideos.splice(idx + 1, 0, item);
                        updateDraft((prev) => ({
                          ...prev,
                          videos: newVideos.map((v, i) => ({ ...v, order: i + 1 })),
                        }));
                      }}
                      className="p-2 text-[#8E8A82] hover:text-white disabled:opacity-30 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const name = vid.title?.en || `Video #${idx + 1}`;
                        requestDelete(
                          'Delete Video?',
                          name,
                          () => {
                            updateDraft((prev) => ({
                              ...prev,
                              videos: (prev.videos || []).filter((_, i) => i !== idx),
                            }));
                            showToast('Video deleted');
                          },
                          'Are you sure you want to delete this video? It will be removed from your draft portfolio. Changes take effect on the live website when you click Publish.'
                        );
                      }}
                      className="p-2 text-rose-400 hover:text-rose-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Delete Video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Platform & Order */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#8E8A82] mb-1">
                      Platform
                    </label>
                    <select
                      value={vid.videoType}
                      onChange={(e) => {
                        const val = e.target.value as 'vimeo' | 'youtube' | 'facebook' | 'direct';
                        updateDraft((prev) => ({
                          ...prev,
                          videos: prev.videos.map((v, i) => (i === idx ? { ...v, videoType: val } : v)),
                        }));
                      }}
                      className="w-full px-2.5 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                    >
                      <option value="vimeo">Vimeo</option>
                      <option value="youtube">YouTube</option>
                      <option value="facebook">Facebook</option>
                      <option value="direct">Direct Link</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#8E8A82] mb-1">
                      Order
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={vid.order ?? (idx + 1)}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 1;
                        updateDraft((prev) => ({
                          ...prev,
                          videos: prev.videos.map((v, i) => (i === idx ? { ...v, order: val } : v)),
                        }));
                      }}
                      className="w-full px-2.5 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] tabular-nums min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Section Placement, Sub-Section Tier & Duration */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#8E8A82] mb-1">
                      Section Placement
                    </label>
                    <select
                      value={vid.videoSection || resolveVideoSection(vid, vid.title?.en || '')}
                      onChange={(e) => {
                        const val = e.target.value as VideoSectionFormat;
                        updateDraft((prev) => ({
                          ...prev,
                          videos: prev.videos.map((v, i) => (i === idx ? { ...v, videoSection: val } : v)),
                        }));
                      }}
                      className="w-full px-2.5 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                    >
                      {VIDEO_SECTION_META.map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          {sec.isVerticalReel ? `${sec.label.en} (9:16)` : `${sec.label.en} (16:9)`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#8E8A82] mb-1">
                      Sub-Section Tier
                    </label>
                    <select
                      value={vid.subSection || resolveVideoSubSection(vid)}
                      onChange={(e) => {
                        const val = e.target.value as VideoSubSectionTier;
                        updateDraft((prev) => ({
                          ...prev,
                          videos: prev.videos.map((v, i) => (i === idx ? { ...v, subSection: val } : v)),
                        }));
                      }}
                      className="w-full px-2.5 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                    >
                      {VIDEO_SUBSECTION_META.map((tier) => (
                        <option key={tier.id} value={tier.id}>
                          {tier.label.en}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#8E8A82] mb-1">
                    Duration (e.g. 0:51)
                  </label>
                  <input
                    type="text"
                    value={vid.duration || ''}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        videos: prev.videos.map((v, i) =>
                          i === idx ? { ...v, duration: e.target.value } : v
                        ),
                      }))
                    }
                    placeholder="0:51"
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs font-mono tabular-nums text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#8E8A82] mb-1">
                    Video URL (Vimeo, YouTube or Facebook)
                  </label>
                  <input
                    type="text"
                    value={vid.videoUrl || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      const detected = detectVideoType(val);
                      const vimeoMeta = detected === 'vimeo' ? extractVimeoInfo(val) : null;
                      updateDraft((prev) => ({
                        ...prev,
                        videos: prev.videos.map((v, i) =>
                          i === idx ? {
                            ...v,
                            videoUrl: val,
                            videoType: (detected || v.videoType) as any,
                            videoId: vimeoMeta?.id || v.videoId,
                            videoHash: vimeoMeta?.hash || v.videoHash,
                          } : v
                        ),
                      }));
                    }}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if (val) {
                        triggerAutoFetchVideo(val, idx);
                      }
                    }}
                    placeholder="https://vimeo.com/... or https://youtube.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs font-mono text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                  />
                </div>

                {(vid.customThumbnailUrl || vid.thumbnailUrl) && (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#0B0C0F] border border-white/[0.08] flex items-center justify-center">
                    <img
                      src={vid.customThumbnailUrl || vid.thumbnailUrl}
                      alt="Thumbnail preview"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 left-2 flex items-center space-x-1.5 bg-black/85 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] border border-white/[0.08]">
                      {vid.customThumbnailUrl ? (
                        <span className="text-emerald-400">Custom Thumbnail</span>
                      ) : vid.videoType === 'vimeo' ? (
                        <span className="text-[#1AB7EA] flex items-center gap-1">
                          <VimeoIcon className="w-3 h-3" /> Vimeo Auto
                        </span>
                      ) : (
                        <span className="text-[#D7D2C8]">Auto Thumbnail</span>
                      )}
                    </div>
                  </div>
                )}

                {vid.customThumbnailUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      updateDraft((prev) => ({
                        ...prev,
                        videos: prev.videos.map((v, i) =>
                          i === idx ? { ...v, customThumbnailUrl: '' } : v
                        ),
                      }));
                      if (vid.videoUrl) {
                        triggerAutoFetchVideo(vid.videoUrl, idx, true);
                      }
                      showToast('Reset to automatic thumbnail');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-amber-950/35 hover:bg-amber-950/55 border border-amber-500/30 text-xs font-medium text-amber-300 flex items-center justify-center space-x-1.5 min-h-[44px]"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Reset to automatic thumbnail</span>
                  </button>
                )}

                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="button"
                    disabled={fetchingOgId === vid.id}
                    onClick={() => handleFetchOg(vid, idx)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.08] text-xs font-medium text-[#EAE5DC] flex items-center justify-center space-x-1.5 min-h-[44px]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#E4583B]" />
                    <span>{fetchingOgId === vid.id ? 'Fetching...' : 'Re-fetch Thumb'}</span>
                  </button>

                  <label className="py-2 px-3 rounded-xl bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.08] text-xs font-medium text-[#EAE5DC] flex items-center justify-center space-x-1.5 cursor-pointer min-h-[44px]">
                    <Upload className="w-3.5 h-3.5 text-[#E4583B]" />
                    <span>Upload Thumb</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleMobileFileUpload(e, `vid-thumb-${idx}`, (dataUrl) => {
                          updateDraft((prev) => ({
                            ...prev,
                            videos: prev.videos.map((v, i) =>
                              i === idx ? { ...v, customThumbnailUrl: dataUrl } : v
                            ),
                          }));
                        })
                      }
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] text-[#8E8A82] mb-1">
                    Title (EN)
                  </label>
                  <input
                    type="text"
                    value={vid.title.en || ''}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        videos: prev.videos.map((v, i) =>
                          i === idx ? { ...v, title: { ...v.title, en: e.target.value } } : v
                        ),
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>
            ))}
          </div>
        );

      // ----------------------------------------
      // VIDEO EDITING - BEST WORK
      // ----------------------------------------
      case 'video-best':
        return <BestWorkVideoEditor onNotify={showToast} />;

      // ----------------------------------------
      // CHANNELS & CHANNEL LINKS
      // ----------------------------------------
      case 'channel-links':
      case 'channels':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-3">
              <h3 className="text-sm font-semibold text-[#F4F0E8]">Channel Links</h3>
              <div>
                <label className="block text-xs text-[#8E8A82] mb-1">
                  YouTube Channel URL
                </label>
                <input
                  type="text"
                  value={draftPortfolio.contact?.youtubeUrl || ''}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      contact: { ...(prev.contact || {}), youtubeUrl: e.target.value },
                    }))
                  }
                  placeholder="https://www.youtube.com/@mdjaberhosain"
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs font-mono text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8E8A82] mb-1">
                  Facebook Profile / Page URL
                </label>
                <input
                  type="text"
                  value={draftPortfolio.contact?.facebookUrl || ''}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      contact: { ...(prev.contact || {}), facebookUrl: e.target.value },
                    }))
                  }
                  placeholder="https://www.facebook.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs font-mono text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8E8A82] mb-1">
                  Behance Profile URL
                </label>
                <input
                  type="text"
                  value={draftPortfolio.contact?.behanceUrl || ''}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      contact: { ...(prev.contact || {}), behanceUrl: e.target.value },
                    }))
                  }
                  placeholder="https://www.behance.net/..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs font-mono text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                />
              </div>
            </div>
          </div>
        );

      // ----------------------------------------
      // CONTACT INFO
      // ----------------------------------------
      case 'contact-info':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-4">
              <h3 className="text-sm font-semibold text-[#F4F0E8]">Direct Contact Information</h3>
              <div>
                <label className="block text-xs text-[#8E8A82] mb-1">
                  Primary Email
                </label>
                <input
                  type="email"
                  value={draftPortfolio.contact?.email || ''}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      contact: { ...(prev.contact || {}), email: e.target.value },
                    }))
                  }
                  placeholder="yourname@gmail.com"
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs font-mono text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8E8A82] mb-1">Facebook URL</label>
                <input
                  type="text"
                  value={draftPortfolio.contact?.facebookUrl || ''}
                  onChange={(e) => updateDraft((prev) => ({
                    ...prev,
                    contact: { ...(prev.contact || {}), facebookUrl: e.target.value }
                  }))}
                  placeholder="https://www.facebook.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs font-mono text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8E8A82] mb-1">Telegram URL</label>
                <input
                  type="text"
                  value={draftPortfolio.contact?.telegramUrl || ''}
                  onChange={(e) => updateDraft((prev) => ({
                    ...prev,
                    contact: { ...(prev.contact || {}), telegramUrl: e.target.value }
                  }))}
                  placeholder="https://t.me/..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs font-mono text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8E8A82] mb-1">Behance URL</label>
                <input
                  type="text"
                  value={draftPortfolio.contact?.behanceUrl || ''}
                  onChange={(e) => updateDraft((prev) => ({
                    ...prev,
                    contact: { ...(prev.contact || {}), behanceUrl: e.target.value }
                  }))}
                  placeholder="https://www.behance.net/..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs font-mono text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                />
              </div>
            </div>
          </div>
        );

      // ----------------------------------------
      // SOCIAL ICONS
      // ----------------------------------------
      case 'social-icons':
        return (
          <div className="space-y-4">
            <SocialLinksEditor />
          </div>
        );

      // ----------------------------------------
      // CONTACT & SOCIAL LINKS (LEGACY ALIAS)
      // ----------------------------------------
      case 'contact':
        return (
          <div className="space-y-4">
            <SocialLinksEditor />

            <div className="p-4 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-3">
              <h3 className="text-sm font-semibold text-[#F4F0E8]">Direct Contact Information</h3>
              <div>
                <label className="block text-xs text-[#8E8A82] mb-1">
                  Primary Email
                </label>
                <input
                  type="email"
                  value={draftPortfolio.contact?.email || ''}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      contact: { ...(prev.contact || {}), email: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs font-mono text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                />
              </div>
            </div>

            <ContactFooterEditor />
          </div>
        );

      // ----------------------------------------
      // ADVICE FORM TEXT
      // ----------------------------------------
      case 'advice-form-text':
        return (
          <div className="space-y-4">
            <ContactFooterEditor activeSection="form" />
          </div>
        );

      // ----------------------------------------
      // FOOTER TEXT
      // ----------------------------------------
      case 'footer-text':
        return (
          <div className="space-y-4">
            <ContactFooterEditor activeSection="footer" />
          </div>
        );

      // ----------------------------------------
      // THEME SETTINGS
      // ----------------------------------------
      case 'theme-settings':
        return (
          <div className="space-y-4">
            <ThemeEditor />
          </div>
        );

      // ----------------------------------------
      // BACKUP & CONTROLS
      // ----------------------------------------
      case 'controls-backup':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-3">
              <h3 className="text-sm font-semibold text-[#F4F0E8]">Data Export &amp; Backup</h3>
              <p className="text-xs text-[#8E8A82]">Download complete portfolio JSON backup</p>
              <button
                type="button"
                onClick={() => {
                  exportPortfolioBackup();
                  showToast('Backup JSON downloaded successfully!');
                }}
                className="w-full py-3 rounded-xl bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.08] text-xs font-semibold text-[#F4F0E8] flex items-center justify-center space-x-2 min-h-[44px]"
              >
                <Download className="w-4 h-4 text-[#E4583B]" />
                <span>Download Complete JSON Backup</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-3">
              <h3 className="text-sm font-semibold text-[#F4F0E8]">Draft &amp; Deployment Controls</h3>
              <button
                type="button"
                onClick={handlePublishLive}
                disabled={publishing}
                className="w-full py-3.5 rounded-xl bg-[#E4583B] hover:bg-[#D0492D] text-xs font-semibold text-white flex items-center justify-center space-x-2 min-h-[48px]"
              >
                <Send className="w-4 h-4" />
                <span>{publishing ? 'Publishing Live...' : 'Publish to Live Site'}</span>
              </button>

              <button
                type="button"
                onClick={openLivePreview}
                className="w-full py-3 rounded-xl bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.08] text-xs font-semibold text-[#F4F0E8] flex items-center justify-center space-x-2 min-h-[44px]"
              >
                <Eye className="w-4 h-4 text-[#E4583B]" />
                <span>Launch Mobile Draft Preview</span>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full py-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center justify-center space-x-2 min-h-[44px]"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out from Admin</span>
              </button>
            </div>
          </div>
        );

      // ----------------------------------------
      // LEADS INBOX
      // ----------------------------------------
      case 'leads':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8E8A82] tabular-nums">
                {leads.length} Inquiries Received
              </span>
              <button
                type="button"
                onClick={loadLeadsData}
                disabled={loadingLeads}
                className="px-3 py-1.5 rounded-xl bg-[#121419] border border-white/[0.08] text-xs font-medium text-[#E4583B] min-h-[44px] flex items-center"
              >
                {loadingLeads ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {leads.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#121419] border border-white/[0.08]">
                <Inbox className="w-8 h-8 text-[#6F6B64] mx-auto mb-2" />
                <p className="text-xs text-[#8E8A82]">No contact submissions yet</p>
              </div>
            ) : (
              leads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-[#F4F0E8]">{lead.name}</h4>
                      <p className="text-xs text-[#8E8A82] font-mono">{lead.email}</p>
                    </div>
                    <span
                      className={`text-xs font-medium capitalize ${
                        lead.status === 'completed'
                          ? 'text-emerald-400'
                          : lead.status === 'contacted'
                          ? 'text-sky-400'
                          : 'text-[#E4583B]'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#D7D2C8] bg-[#0B0C0F] p-3 rounded-xl border border-white/[0.06]">
                    {lead.message}
                  </p>

                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        if (lead.id) {
                          await updateLeadStatus(lead.id, 'contacted');
                          loadLeadsData();
                          showToast('Status updated to Contacted');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#171A21] border border-white/[0.08] text-xs font-medium text-[#D7D2C8] min-h-[44px] flex items-center"
                    >
                      Mark Contacted
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (lead.id) {
                          await updateLeadStatus(lead.id, 'completed');
                          loadLeadsData();
                          showToast('Status updated to Completed');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-400 min-h-[44px] flex items-center"
                    >
                      Mark Completed
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      // ----------------------------------------
      // GOOGLE SHEETS WEBHOOK
      // ----------------------------------------
      case 'sheets':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-3">
              <h3 className="text-sm font-semibold text-[#F4F0E8]">Google Sheets Webhook</h3>
              <p className="text-xs text-[#8E8A82]">
                Enter your Google Apps Script Web App URL to receive inquiries directly into your
                spreadsheet.
              </p>
              <div>
                <label className="block text-xs text-[#8E8A82] mb-1">
                  Webhook URL
                </label>
                <input
                  type="text"
                  value={draftPortfolio.googleSheetWebhookUrl || ''}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      googleSheetWebhookUrl: e.target.value,
                    }))
                  }
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs font-mono text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                />
              </div>
            </div>
          </div>
        );

      // ----------------------------------------
      // THEME COLORS
      // ----------------------------------------
      case 'theme-colors':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#F4F0E8]">Brand Colors</h3>
                <button
                  type="button"
                  onClick={() => {
                    updateDraft((prev) => ({
                      ...prev,
                      theme: {
                        ...prev.theme,
                        colors: { ...defaultThemeColors },
                        fonts: prev.theme?.fonts || defaultThemeFonts,
                      },
                    }));
                    showToast('Colors reset to default');
                  }}
                  className="text-xs font-medium text-[#E4583B] flex items-center space-x-1 min-h-[44px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>
              </div>

              {[
                { key: 'background' as const, label: 'Background Color' },
                { key: 'surface' as const, label: 'Surface & Cards' },
                { key: 'primary' as const, label: 'Primary Brand Accent' },
                { key: 'secondary' as const, label: 'Secondary Surface' },
                { key: 'border' as const, label: 'Borders & Outlines' },
                { key: 'accent' as const, label: 'Accent Glow' },
              ].map((c) => (
                <div
                  key={c.key}
                  className="p-3 rounded-xl bg-[#0B0C0F] border border-white/[0.08] flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs text-[#F4F0E8] font-medium block">
                      {c.label}
                    </span>
                    <span className="text-[11px] font-mono text-[#8E8A82] uppercase">
                      {themeColors[c.key]}
                    </span>
                  </div>
                  <input
                    type="color"
                    value={themeColors[c.key]}
                    onChange={(e) => updateThemeColor(c.key, e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      // ----------------------------------------
      // THEME FONTS
      // ----------------------------------------
      case 'theme-fonts':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#F4F0E8]">Typography Selection</h3>
                <button
                  type="button"
                  onClick={() => {
                    updateDraft((prev) => ({
                      ...prev,
                      theme: {
                        ...prev.theme,
                        colors: prev.theme?.colors || defaultThemeColors,
                        fonts: { ...defaultThemeFonts },
                      },
                    }));
                    showToast('Fonts reset to default');
                  }}
                  className="text-xs font-medium text-[#E4583B] flex items-center space-x-1 min-h-[44px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#D7D2C8] mb-1.5">
                  বাংলা ফন্ট (Bangla Font)
                </label>
                <select
                  value={themeFonts.bangla}
                  onChange={(e) => updateThemeFont('bangla', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-sm text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                >
                  <option value="Li Ador Noirrit">Li Ador Noirrit (আদর নৈঋত - Default Locked)</option>
                  <option value="Hind Siliguri">Hind Siliguri (হিন্দ শিলিগুড়ি)</option>
                  <option value="Noto Sans Bengali">Noto Sans Bengali</option>
                  <option value="Tiro Bangla">Tiro Bangla</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#D7D2C8] mb-1.5">
                  English Font
                </label>
                <select
                  value={themeFonts.english}
                  onChange={(e) => updateThemeFont('english', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-sm text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                >
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans (Default Locked)</option>
                  <option value="Space Grotesk">Space Grotesk</option>
                  <option value="Inter">Inter</option>
                  <option value="Outfit">Outfit</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#D7D2C8] mb-1.5">
                  الخط العربي (Arabic Font)
                </label>
                <select
                  value={themeFonts.arabic}
                  onChange={(e) => updateThemeFont('arabic', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-sm text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none min-h-[44px]"
                >
                  <option value="Cairo">Cairo (القاهرة - Default Locked)</option>
                  <option value="Amiri">Amiri (أميري)</option>
                  <option value="Noto Sans Arabic">Noto Sans Arabic</option>
                </select>
              </div>
            </div>
          </div>
        );

      // ----------------------------------------
      // VISITOR THEME SELECTOR
      // ----------------------------------------
      case 'theme-visitor':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-3">
              <h3 className="text-sm font-semibold text-[#F4F0E8]">Visitor Theme Selector</h3>
              <p className="text-xs text-[#8E8A82]">
                Choose which themes visitors can preview in the website navbar dropdown
              </p>

              <div className="space-y-2 pt-1">
                {[
                  { id: 'dark' as ThemeId, label: 'Dark (Default Locked)', dot: '#E4583B', locked: true },
                  { id: 'light' as ThemeId, label: 'Light Theme', dot: '#EA580C', locked: false },
                  { id: 'blue' as ThemeId, label: 'Blue Ocean', dot: '#38BDF8', locked: false },
                  { id: 'green' as ThemeId, label: 'Emerald Green', dot: '#10B981', locked: false },
                  { id: 'purple' as ThemeId, label: 'Royal Purple', dot: '#A855F7', locked: false },
                  { id: 'warm' as ThemeId, label: 'Warm / Golden', dot: '#F59E0B', locked: false },
                  { id: 'custom' as ThemeId, label: 'Custom Accent Picker', dot: '#EC4899', locked: false },
                ].map((th) => {
                  const isEnabled = availableThemes.includes(th.id);
                  return (
                    <div
                      key={th.id}
                      onClick={() => !th.locked && toggleVisitorTheme(th.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer min-h-[48px] ${
                        isEnabled
                          ? 'bg-[#171A21] border-[#E4583B]/50'
                          : 'bg-[#0B0C0F] border-white/[0.08] opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/30"
                          style={{ backgroundColor: th.dot }}
                        />
                        <span className="text-xs text-[#F4F0E8] font-medium">{th.label}</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border ${
                          isEnabled
                            ? 'bg-[#E4583B] border-[#E4583B] text-white'
                            : 'border-white/20'
                        }`}
                      >
                        {isEnabled && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      // ----------------------------------------
      // HOME CASE STUDIES & FOCUS/STATS/REVIEWS
      // ----------------------------------------
      case 'home-case-studies':
        return <CaseStudiesEditor onNotify={showToast} />;

      case 'home-stats-testimonials':
        return <StatsTestimonialsEditor onNotify={showToast} />;

      default:
        return null;
    }
  };

  // ==========================================
  // 4. MAIN MOBILE ADMIN LAYOUT
  // ==========================================
  return (
    <div className="min-h-screen bg-[#0B0C0F] text-[#F4F0E8] flex flex-col font-sans pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-4 right-4 z-50">
          <div
            className={`p-3.5 rounded-xl shadow-2xl border text-xs font-medium flex items-center space-x-2.5 ${
              toastType === 'success'
                ? 'bg-[#121419]/95 border-emerald-500/40 text-emerald-300'
                : 'bg-[#121419]/95 border-rose-500/40 text-rose-300'
            }`}
          >
            {toastType === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="flex-1">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Sticky Top App Bar */}
      <header className="sticky top-0 z-40 bg-[#121419]/95 border-b border-white/[0.08] px-4 py-2.5 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-2.5 rtl:space-x-reverse min-w-0">
          {activeSection ? (
            <button
              type="button"
              onClick={() => setActiveSection(null)}
              className="p-2 -ml-2 rounded-xl text-[#D7D2C8] hover:text-white hover:bg-white/[0.05] min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-[#E4583B]" />
            </button>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[#E4583B] flex items-center justify-center font-bold text-xs text-white shrink-0">
              MJ
            </div>
          )}

          <div className="min-w-0">
            <h2 className="text-xs font-semibold text-[#F4F0E8] capitalize truncate">
              {activeSection
                ? activeSection.replace(/-/g, ' ')
                : activeTab === 'overview'
                ? 'Mobile Control Center'
                : activeTab.replace(/-/g, ' ')}
            </h2>
            <span className={`text-[11px] block ${hasUnsavedChanges ? 'text-amber-400' : 'text-emerald-400'}`}>
              {hasUnsavedChanges ? 'Unsaved draft changes' : 'All changes saved'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse shrink-0">
          <button
            type="button"
            onClick={openLivePreview}
            className="p-2 rounded-lg bg-[#171A21] border border-white/[0.08] text-[#D7D2C8] hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Live Draft Preview on Mobile"
          >
            <Eye className="w-4 h-4 text-[#E4583B]" />
          </button>

          <button
            type="button"
            onClick={handlePublishLive}
            disabled={publishing}
            className="px-3.5 py-2 rounded-lg font-semibold text-xs text-white bg-[#E4583B] hover:bg-[#D0492D] flex items-center space-x-1.5 disabled:opacity-50 min-h-[44px]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{publishing ? 'Publishing...' : 'Publish'}</span>
          </button>
        </div>
      </header>

      {/* Real Error Notification & Retry Banner */}
      {(saveError || publishError) && (
        <div className="bg-rose-950/90 border-b border-rose-500/40 px-4 py-3 backdrop-blur-md">
          <div className="max-w-lg mx-auto flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-rose-200">
                {saveError ? 'Draft Save Failed' : 'Publish Failed'}
              </p>
              <p className="text-[11px] text-rose-300 break-words mt-0.5">
                {saveError || publishError}
              </p>
              {(saveError || publishError)?.includes('securetoken.googleapis.com') && (
                <div className="mt-1">
                  <a
                    href="https://console.developers.google.com/apis/api/securetoken.googleapis.com/overview?project=142615067158"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-amber-300 font-medium text-[11px] hover:text-amber-200"
                  >
                    Click to enable Token Service API &rarr;
                  </a>
                </div>
              )}
              <div className="flex items-center space-x-2 mt-2">
                {saveError && (
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={savingDraft}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold flex items-center space-x-1 min-h-[36px]"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${savingDraft ? 'animate-spin' : ''}`} />
                    <span>{savingDraft ? 'Retrying...' : 'Retry Save Draft'}</span>
                  </button>
                )}
                {publishError && (
                  <button
                    type="button"
                    onClick={handlePublishLive}
                    disabled={publishing}
                    className="px-3 py-1.5 rounded-lg bg-[#E4583B] hover:bg-[#D0492D] text-white text-[11px] font-semibold flex items-center space-x-1 min-h-[36px]"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${publishing ? 'animate-spin' : ''}`} />
                    <span>{publishing ? 'Retrying...' : 'Retry Publish'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSaveError(null);
                    setPublishError(null);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-[#171A21] text-[#A7A298] hover:text-white text-[11px] min-h-[36px]"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {activeSection ? (
          <div>
            {renderSectionEditor()}

            {/* Sticky Save Draft Bar inside section editor */}
            <div className="sticky bottom-20 mt-6 pt-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={savingDraft}
                className="w-full py-3 rounded-xl bg-[#171A21] hover:bg-[#1E222B] border border-[#E4583B]/50 text-[#F4F0E8] font-semibold text-xs flex items-center justify-center space-x-2 shadow-xl min-h-[48px]"
              >
                <Save className="w-4 h-4 text-[#E4583B]" />
                <span>{savingDraft ? 'Saving Draft...' : 'Save Draft Changes'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Status Card */}
                <div className="p-4 rounded-2xl bg-[#121419] border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-[#F4F0E8]">Mobile Control Center</h3>
                      <p className="text-xs text-[#8E8A82] font-mono truncate">
                        {loggedInLabel}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="p-2 rounded-lg bg-[#171A21] text-[#A7A298] hover:text-white border border-white/[0.08] min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="p-3 rounded-xl bg-[#0B0C0F] border border-white/[0.06] text-center">
                      <span className="text-lg font-bold tabular-nums text-[#E4583B]">
                        {draftPortfolio.projects?.length || 0}
                      </span>
                      <p className="text-[11px] text-[#8E8A82] mt-0.5">Projects</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0B0C0F] border border-white/[0.06] text-center">
                      <span className="text-lg font-bold tabular-nums text-[#E4583B]">
                        {draftPortfolio.videos?.length || 0}
                      </span>
                      <p className="text-[11px] text-[#8E8A82] mt-0.5">Videos</p>
                    </div>
                    <div
                      onClick={() => setActiveSection('leads')}
                      className="p-3 rounded-xl bg-[#0B0C0F] border border-white/[0.06] text-center cursor-pointer"
                    >
                      <span className="text-lg font-bold tabular-nums text-emerald-400">
                        {leads.length || 0}
                      </span>
                      <p className="text-[11px] text-[#8E8A82] mt-0.5">Leads</p>
                    </div>
                  </div>

                  {/* One-Tap Interactive Draft Preview Launcher */}
                  <button
                    type="button"
                    onClick={openLivePreview}
                    className="w-full py-3 rounded-xl bg-[#E4583B] hover:bg-[#D0492D] text-xs font-semibold text-white flex items-center justify-center space-x-2 min-h-[48px]"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Launch Live Draft Preview</span>
                  </button>

                  {/* Backup JSON Button */}
                  <button
                    type="button"
                    onClick={() => {
                      exportPortfolioBackup();
                      showToast('Backup JSON downloaded successfully!');
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.08] text-xs text-[#D7D2C8] hover:text-white flex items-center justify-center space-x-2 min-h-[44px]"
                  >
                    <Download className="w-4 h-4 text-[#E4583B]" />
                    <span>Download Backup JSON</span>
                  </button>
                </div>

                {/* Admin Groups Grid */}
                <div className="space-y-2.5 pt-2">
                  <h4 className="text-xs font-semibold text-[#8E8A82] px-1">
                    Content Sections
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ADMIN_GROUPS.map((group) => {
                      const Icon = group.icon;
                      return (
                        <button
                          key={group.id}
                          type="button"
                          onClick={() => {
                            setActiveTab(group.id);
                            setActiveSection(null);
                          }}
                          className="p-3.5 rounded-xl bg-[#121419] hover:bg-[#171A21] border border-white/[0.08] hover:border-[#E4583B]/40 text-left transition-colors min-h-[56px] flex items-center space-x-3"
                        >
                          <div className="w-9 h-9 rounded-lg bg-[#171A21] border border-white/[0.08] text-[#E4583B] flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold text-[#F4F0E8] truncate">{group.label}</p>
                              <span className="text-[11px] text-[#6F6B64] tabular-nums shrink-0">
                                {group.subSections.length}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#8E8A82] truncate mt-0.5">{group.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Theme Live Edit Note for Mobile */}
                <div className="p-3.5 rounded-xl bg-[#121419] border border-white/[0.08] space-y-1 mt-2">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-[#EAE5DC]">
                    <Sparkles className="w-3.5 h-3.5 text-[#E4583B]" />
                    <span>Theme Live Edit</span>
                  </div>
                  <p className="text-xs text-[#8E8A82] leading-relaxed">
                    Open on desktop to click and customize visual typography or layout spacing live.
                  </p>
                </div>

                {/* Back to Public Site */}
                <button
                  type="button"
                  onClick={onBackToSite}
                  className="w-full py-3 rounded-xl bg-[#121419] border border-white/[0.08] text-xs font-medium text-[#D7D2C8] hover:text-white flex items-center justify-center space-x-2 min-h-[48px] mt-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Exit Admin &amp; Return to Site</span>
                </button>
              </div>
            )}

            {/* GROUP SUB-SECTIONS */}
            {activeTab !== 'overview' && (() => {
              const currentGroup = ADMIN_GROUPS.find((g) => g.id === activeTab);
              if (!currentGroup) return null;
              const GroupIcon = currentGroup.icon;

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('overview')}
                      className="px-3 py-1.5 rounded-xl bg-[#121419] hover:bg-[#171A21] border border-white/[0.08] text-xs font-medium text-[#D7D2C8] hover:text-white flex items-center space-x-1.5 min-h-[40px]"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-[#E4583B]" />
                      <span>All Groups</span>
                    </button>
                    <span className="text-xs text-[#8E8A82] tabular-nums">
                      {currentGroup.subSections.length} sections
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#121419] border border-white/[0.08] flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-[#171A21] border border-white/[0.08] text-[#E4583B] flex items-center justify-center shrink-0">
                      <GroupIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[#F4F0E8]">{currentGroup.label}</h3>
                      <p className="text-xs text-[#8E8A82] mt-0.5">{currentGroup.desc}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {currentGroup.subSections.map((sec) => (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => setActiveSection(sec.id)}
                        className="w-full p-4 rounded-xl bg-[#121419] hover:bg-[#171A21] border border-white/[0.08] hover:border-[#E4583B]/40 text-left flex items-center justify-between transition-colors min-h-[52px]"
                      >
                        <div className="pr-3 flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-[#F4F0E8]">{sec.label}</h4>
                          {sec.desc && (
                            <p className="text-[11px] text-[#8E8A82] mt-0.5 line-clamp-1">{sec.desc}</p>
                          )}
                        </div>
                        <span className="text-[#E4583B] text-xs shrink-0">&rarr;</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </main>

      {/* Sticky Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#121419]/95 border-t border-white/[0.08] backdrop-blur-md px-2 py-1.5">
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            type="button"
            onClick={() => {
              setActiveTab('overview');
              setActiveSection(null);
            }}
            className={`px-3 py-1.5 rounded-lg flex flex-col items-center justify-center space-y-0.5 transition-colors shrink-0 min-w-[56px] min-h-[44px] ${
              activeTab === 'overview' && !activeSection
                ? 'bg-[#E4583B]/15 text-[#F07C63] border border-[#E4583B]/40 font-semibold'
                : 'text-[#8E8A82] hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="text-[10px]">Home</span>
          </button>
          {ADMIN_GROUPS.map((grp) => {
            const GrpIcon = grp.icon;
            const isActive = activeTab === grp.id && !activeSection;
            return (
              <button
                key={grp.id}
                type="button"
                onClick={() => {
                  setActiveTab(grp.id);
                  setActiveSection(null);
                }}
                className={`px-2.5 py-1.5 rounded-lg flex flex-col items-center justify-center space-y-0.5 transition-colors shrink-0 min-w-[62px] min-h-[44px] ${
                  isActive
                    ? 'bg-[#E4583B]/15 text-[#F07C63] border border-[#E4583B]/40 font-semibold'
                    : 'text-[#8E8A82] hover:text-white'
                }`}
              >
                <GrpIcon className="w-4 h-4" />
                <span className="text-[10px] truncate max-w-[68px]">
                  {grp.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Delete Confirmation Modal for Mobile */}
      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.title}
        itemName={deleteConfirm.itemName}
        message={deleteConfirm.message}
        onConfirm={deleteConfirm.onConfirm}
        onCancel={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
