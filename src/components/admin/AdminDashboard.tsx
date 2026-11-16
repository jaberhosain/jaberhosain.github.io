import React, { useState, useEffect } from 'react';
import {
  Save,
  Send,
  Eye,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  LogIn,
  LogOut,
  Plus,
  Trash2,
  User as UserIcon,
  Sliders,
  Copy,
  ArrowLeft,
  KeyRound,
  Mail,
  Lock,
  ArrowUp,
  ArrowDown,
  Upload,
  RefreshCw,
  Image as ImageIcon,
  Youtube,
  Play,
  Sparkles,
  Download,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  Wand2,
  Loader2
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  auth,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from '../../lib/firebase';
import {
  ProjectItem,
  Lead,
  VideoShowcaseItem,
  ServiceItem,
  SkillCategory,
  VideoSectionFormat,
  VideoSubSectionTier
} from '../../types/portfolio';
import { ImageUploaderField } from './ImageUploaderField';
import { ThemeEditor } from './ThemeEditor';
import { EducationEditor } from './EducationEditor';
import { HeroEditor } from './HeroEditor';
import { SocialLinksEditor } from './SocialLinksEditor';
import { WorkflowEditor } from './WorkflowEditor';
import { ContactFooterEditor } from './ContactFooterEditor';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { ProjectGalleryManager } from './ProjectGalleryManager';
import { extractYouTubeId } from '../VideoModal';
import { uploadMediaToStorage } from '../../lib/mediaUpload';
import {
  extractVimeoInfo,
  detectVideoType,
  fetchVideoAutoMetadata,
  VimeoIcon
} from '../../lib/videoUtils';
import {
  VIDEO_SECTION_META,
  VIDEO_SUBSECTION_META,
  resolveVideoSection,
  resolveVideoSubSection
} from '../../lib/videoOrganization';
import { resolveBehanceProjectFromUrl } from '../../lib/imageUrlResolver';
import { BestWorkGraphicEditor } from './BestWorkGraphicEditor';
import { BestWorkVideoEditor } from './BestWorkVideoEditor';
import { CaseStudiesEditor } from './CaseStudiesEditor';
import { StatsTestimonialsEditor } from './StatsTestimonialsEditor';
import { ADMIN_GROUPS, AdminGroupId } from './adminNavigation';
import { ThemeLiveEditView } from './liveEdit/ThemeLiveEditView';

// Helper to map activeTab to its parent AdminGroupId
export const getGroupFromTab = (tab: string): AdminGroupId => {
  switch (tab) {
    case 'hero':
    case 'about':
      return 'profile';
    case 'case-studies':
    case 'stats-testimonials':
      return 'home-content';
    case 'education':
      return 'education';
    case 'skills':
    case 'services':
      return 'skills-services';
    case 'projects':
    case 'graphic-best':
    case 'videos':
    case 'video-best':
      return 'media';
    case 'contact':
    case 'channels':
      return 'contact-links';
    case 'leads':
    case 'sheets':
      return 'feedback-leads';
    case 'theme':
      return 'theme';
    case 'branding':
      return 'settings';
    default:
      return 'theme';
  }
};

// Helper to map sub-section ID to the corresponding existing activeTab
export const getTabFromSubSection = (
  subId: string
): 'theme' | 'branding' | 'hero' | 'about' | 'case-studies' | 'stats-testimonials' | 'services' | 'skills' | 'education' | 'projects' | 'graphic-best' | 'videos' | 'video-best' | 'channels' | 'contact' | 'leads' | 'sheets' => {
  switch (subId) {
    case 'hero': return 'hero';
    case 'about':
    case 'photo': return 'about';
    case 'home-case-studies': return 'case-studies';
    case 'home-stats-testimonials': return 'stats-testimonials';
    case 'academic':
    case 'professional': return 'education';
    case 'skills':
    case 'workflow': return 'skills';
    case 'services': return 'services';
    case 'graphic-design': return 'projects';
    case 'graphic-best': return 'graphic-best';
    case 'video-editing': return 'videos';
    case 'video-best': return 'video-best';
    case 'contact-info':
    case 'social-icons':
    case 'advice-form-text': return 'contact';
    case 'channel-links': return 'channels';
    case 'leads': return 'leads';
    case 'sheets': return 'sheets';
    case 'theme-settings': return 'theme';
    case 'general-branding':
    case 'footer-text':
    case 'controls-backup': return 'branding';
    default: return 'theme';
  }
};

interface AdminDashboardProps {
  onBackToSite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToSite }) => {
  const { 
    draftPortfolio, 
    updateDraft, 
    saveDraftToDatabase, 
    publishToLive, 
    isPreviewDraft, 
    setIsPreviewDraft, 
    isAdmin, 
    authLoading: authRestoring,
    currentUser, 
    ui, 
    fetchLeads,
    exportPortfolioBackup
  } = usePortfolio();

  // Login Form States (Username + Password with automatic internal mapping & brute force cooldown)
  const [usernameInput, setUsernameInput] = useState('jabirbd');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number>(0);

  const [activeTab, setActiveTab] = useState<
    'theme' | 'branding' | 'hero' | 'about' | 'case-studies' | 'stats-testimonials' | 'services' | 'skills' | 'education' | 'projects' | 'graphic-best' | 'videos' | 'video-best' | 'channels' | 'contact' | 'leads' | 'sheets'
  >('theme');

  // Dedicated Theme Live Edit full-screen mode
  const [isLiveEditOpen, setIsLiveEditOpen] = useState(false);

  // Active expanded group in the grouped sidebar (keeps only active group expanded)
  const [expandedGroup, setExpandedGroup] = useState<AdminGroupId>(() => getGroupFromTab(activeTab));

  useEffect(() => {
    setExpandedGroup(getGroupFromTab(activeTab));
  }, [activeTab]);

  const [savingDraft, setSavingDraft] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Leads list state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Video management states
  const [fetchingOgId, setFetchingOgId] = useState<string | null>(null);
  const [ogFetchNotes, setOgFetchNotes] = useState<Record<string, string>>({});
  const [videoUploadProgress, setVideoUploadProgress] = useState<Record<number, number>>({});
  const [videoAdminFilter, setVideoAdminFilter] = useState<'all' | VideoSectionFormat>('all');

  // Behance project group extraction states
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

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // 1-Click Import Entire Behance Project Group into Graphic Design showcase
  const handleImportNewBehanceProject = async () => {
    const url = behanceImportUrl.trim();
    if (!url) {
      setBehanceImportHint({ type: 'err', text: 'আগে একটি Behance প্রজেক্টের লিংক পেস্ট করুন (যেমন: https://www.behance.net/gallery/...)' });
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
          order: nextOrder
        };

        updateDraft((prev) => ({
          ...prev,
          projects: [...(prev.projects || []), newProject]
        }));
        setBehanceImportUrl('');
        setBehanceImportHint({
          type: 'ok',
          text: `"${resolvedTitle}" (${res.images.length}টি পোস্টার) প্রজেক্ট #${nextOrder} হিসেবে যুক্ত হয়েছে! নিচে কার্ড থেকে ক্যাপশন বা কভার চেক করুন।`
        });
        showToast(`Imported "${resolvedTitle}" (${res.images.length} posters)!`);
        setTimeout(() => {
          document.getElementById(`project-card-${newId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120);
      } else {
        setBehanceImportHint({
          type: 'err',
          text:
            res.error ||
            'Behance অটো-ব্লক করেছে। নিচে নতুন প্রজেক্ট খুলে "Smart Import / URLs" বাটনে পেজ সোর্স (Ctrl+U) অথবা ডিরেক্ট পোস্টার লিংক পেস্ট করুন।'
        });
        showToast('Behance blocked automated fetch — use Smart Import (Ctrl+U) inside the project card.', 'error');
      }
    } catch (err: any) {
      setBehanceImportHint({
        type: 'err',
        text: err?.message || 'Behance থেকে ডেটা আনতে সমস্যা হয়েছে।'
      });
    } finally {
      setImportingBehanceProject(false);
    }
  };

  // Per-project Behance poster group extractor
  const handleExtractProjectBehance = async (proj: ProjectItem) => {
    const url = (proj.behanceUrl || '').trim();
    if (!url || !url.toLowerCase().includes('behance.net')) {
      showToast('প্রথমে এই প্রজেক্টের Behance Project URL ঘরে একটি Behance লিংক দিন।', 'error');
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
              !p.title?.en ||
              p.title.en === 'New Graphic Project' ||
              p.title.en === 'Untitled';
            const isDefaultDesc =
              !p.description?.en ||
              p.description.en.startsWith('High-resolution graphic design concept');

            return {
              ...p,
              coverImage: p.coverImage || res.coverImage || res.images[0],
              galleryImages: merged,
              galleryCaptions: nextCaptions,
              title: isDefaultTitle && res.title ? { ...(p.title || { en: '', bn: '', ar: '' }), en: res.title } : p.title,
              groupName: !p.groupName?.en && res.title ? { ...(p.groupName || { en: '', bn: '', ar: '' }), en: res.title } : p.groupName,
              description:
                isDefaultDesc && res.description
                  ? { ...(p.description || { en: '', bn: '', ar: '' }), en: res.description }
                  : p.description
            };
          })
        }));
        showToast(res.note || `Behance থেকে ${res.images.length}টি পোস্টার প্রজেক্টে যুক্ত হয়েছে!`);
      } else {
        showToast(
          res.error || 'অটো-এক্সট্র্যাক্ট করা যায়নি। নিচে "Smart Import / URLs" এ Ctrl+U পেজ সোর্স দিন।',
          'error'
        );
      }
    } finally {
      setExtractingProjectId(null);
    }
  };

  // Automatically fetch video thumbnail & metadata for any platform (YouTube, Vimeo, Facebook)
  const triggerAutoFetchVideo = async (videoUrl: string, idx: number, forceAutoThumbnail = false) => {
    const cleanUrl = videoUrl.trim();
    if (!cleanUrl) return;
    const currentVideo = draftPortfolio.videos?.[idx];
    if (!currentVideo) return;

    const detected = detectVideoType(cleanUrl);
    const ytId = extractYouTubeId(cleanUrl);

    // YouTube quick local preview
    if (detected === 'youtube' && ytId) {
      const defaultYt = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
      updateDraft(prev => ({
        ...prev,
        videos: prev.videos.map((v, i) => i === idx ? { ...v, thumbnailUrl: v.thumbnailUrl || defaultYt } : v)
      }));
    }

    setFetchingOgId(currentVideo.id);
    try {
      const meta = await fetchVideoAutoMetadata(cleanUrl);
      if (meta && (meta.thumbnailUrl || meta.fallbackThumbnailUrl)) {
        const thumb = meta.thumbnailUrl || meta.fallbackThumbnailUrl || '';
        updateDraft(prev => ({
          ...prev,
          videos: prev.videos.map((v, i) => i === idx ? {
            ...v,
            thumbnailUrl: thumb,
            customThumbnailUrl: forceAutoThumbnail ? '' : v.customThumbnailUrl,
            videoType: meta.videoType || v.videoType,
            videoId: meta.videoId || v.videoId,
            videoHash: meta.videoHash || v.videoHash,
            duration: meta.duration || v.duration,
            title: (!v.title?.en && meta.title) ? { en: meta.title, bn: '', ar: '' } : v.title
          } : v)
        }));
      }
    } catch (err: any) {
      console.warn('Auto fetch video error:', err);
    } finally {
      setFetchingOgId(null);
    }
  };

  // Manual or retry automatic thumbnail fetch
  const handleFetchOg = async (videoItem: VideoShowcaseItem, idx: number) => {
    if (!videoItem.videoUrl) {
      showToast('Please enter a video URL first', 'error');
      return;
    }
    setFetchingOgId(videoItem.id);
    setOgFetchNotes(prev => ({ ...prev, [videoItem.id]: '' }));

    try {
      const meta = await fetchVideoAutoMetadata(videoItem.videoUrl);
      if (meta && (meta.thumbnailUrl || meta.fallbackThumbnailUrl)) {
        const thumb = meta.thumbnailUrl || meta.fallbackThumbnailUrl || '';
        updateDraft(prev => ({
          ...prev,
          videos: prev.videos.map((v, i) => i === idx ? { 
            ...v, 
            thumbnailUrl: thumb,
            videoType: meta.videoType || v.videoType,
            videoId: meta.videoId || v.videoId,
            videoHash: meta.videoHash || v.videoHash,
            duration: meta.duration || v.duration,
            title: (!v.title?.en && meta.title) ? { en: meta.title, bn: '', ar: '' } : v.title
          } : v)
        }));
        showToast('Thumbnail fetched successfully from video metadata!');
      } else {
        setOgFetchNotes(prev => ({
          ...prev,
          [videoItem.id]: 'Could not automatically fetch thumbnail. Please upload a custom thumbnail below.'
        }));
      }
    } catch (err: any) {
      setOgFetchNotes(prev => ({
        ...prev,
        [videoItem.id]: 'Fetch failed: ' + (err.message || 'Network error')
      }));
    } finally {
      setFetchingOgId(null);
    }
  };

  // Handle custom image/video thumbnail upload (compresses to 1600px & stores in Firebase Storage)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoUploadProgress(prev => ({ ...prev, [idx]: 15 }));
    showToast('Compressing and uploading to Firebase Storage...');

    try {
      const downloadUrl = await uploadMediaToStorage(file, (pct) => {
        setVideoUploadProgress(prev => ({ ...prev, [idx]: pct }));
      });

      updateDraft(prev => ({
        ...prev,
        videos: prev.videos.map((v, i) => i === idx ? { ...v, customThumbnailUrl: downloadUrl } : v)
      }));
      showToast('Thumbnail uploaded to Firebase Storage successfully!');
    } catch (err: any) {
      console.error('Video thumbnail upload failed:', err);
      showToast('Upload failed: ' + (err.message || 'Storage error'), 'error');
    } finally {
      setVideoUploadProgress(prev => {
        const next = { ...prev };
        delete next[idx];
        return next;
      });
      e.target.value = '';
    }
  };

  // Move video item order up or down
  const handleMoveVideo = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= draftPortfolio.videos.length) return;
    updateDraft(prev => {
      const newVideos = [...prev.videos];
      const item = newVideos.splice(fromIdx, 1)[0];
      newVideos.splice(toIdx, 0, item);
      return {
        ...prev,
        videos: newVideos.map((v, i) => ({ ...v, order: i + 1 }))
      };
    });
  };

  // Move project item order up or down
  const handleMoveProject = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= (draftPortfolio.projects?.length || 0)) return;
    updateDraft(prev => {
      const newProjects = [...(prev.projects || [])];
      const item = newProjects.splice(fromIdx, 1)[0];
      newProjects.splice(toIdx, 0, item);
      return {
        ...prev,
        projects: newProjects.map((p, i) => ({ ...p, order: i + 1 }))
      };
    });
  };

  // Add a new video item to the list
  const handleAddVideo = () => {
    const targetSection: VideoSectionFormat =
      videoAdminFilter === 'all' ? 'reels' : videoAdminFilter;
    const newVideo: VideoShowcaseItem = {
      id: 'vid-' + Date.now(),
      title: { en: '', bn: '', ar: '' },
      description: { en: '', bn: '', ar: '' },
      videoType: 'facebook',
      videoUrl: '',
      thumbnailUrl: '',
      customThumbnailUrl: '',
      duration: '',
      videoSection: targetSection,
      subSection: 'premium',
      order: (draftPortfolio.videos?.length || 0) + 1
    };
    updateDraft(prev => ({
      ...prev,
      videos: [...(prev.videos || []), newVideo]
    }));
    showToast('New video slot added. Choose section, enter URL and configure thumbnail.');
  };

  // Username + Password authentication (maps username to email-style ID internally)
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

  // Change Password States & Handler (Settings Group)
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

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    setSaveError(null);
    try {
      await saveDraftToDatabase();
      showToast(ui.admin.savedDraftSuccess, 'success');
    } catch (err: any) {
      console.error('Save Draft Error:', err);
      const msg = parseErrorMessage(err);
      setSaveError(msg);
      showToast('Save failed: ' + msg, 'error');
    } finally {
      setSavingDraft(false);
    }
  };

  const handlePublishLive = async () => {
    setPublishing(true);
    setPublishError(null);
    try {
      await publishToLive();
      showToast(ui.admin.publishedSuccess, 'success');
    } catch (err: any) {
      console.error('Publish Live Error:', err);
      const msg = parseErrorMessage(err);
      setPublishError(msg);
      showToast('Publish failed: ' + msg, 'error');
    } finally {
      setPublishing(false);
    }
  };

  const loadLeadsData = async () => {
    setLoadingLeads(true);
    try {
      const data = await fetchLeads();
      setLeads(data);
    } catch (err) {
      console.warn('Leads fetch note:', err);
    } finally {
      setLoadingLeads(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'leads' && isAdmin) {
      loadLeadsData();
    }
  }, [activeTab, isAdmin]);

  const appsScriptCode = `/**
 * Google Apps Script Web App for MD. JABER HOSAIN Inquiries
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    var timestamp = new Date();
    
    sheet.appendRow([
      data.timestamp || timestamp,
      data.name,
      data.email,
      data.phone || '',
      data.country || '',
      data.projectType || 'Advice / Feedback',
      data.message
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success", "row": sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}`;

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

  // If not logged in or unauthorized: SHOW ONLY THE SECURE LOGIN SCREEN
  if (!currentUser || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0B0C0F] text-[#F4F0E8] flex flex-col justify-center items-center p-4 font-sans selection:bg-[#E4583B] selection:text-white">
        <div className="w-full max-w-md bg-[#121419] border border-white/[0.08] rounded-2xl p-8 sm:p-10 shadow-2xl">
          {/* Brand header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-11 h-11 rounded-xl bg-[#171A21] border border-white/[0.08] flex items-center justify-center font-bold text-lg text-[#F4F0E8] mb-4">
              <span>M</span>
              <span className="text-[#E4583B]">J</span>
            </div>

            <h1 className="text-xl font-semibold text-[#F4F0E8] tracking-tight mb-1">
              Studio Admin Console
            </h1>
            <p className="text-xs text-[#8E8A82]">
              Sign in with your owner credentials to manage site content.
            </p>
          </div>

          {/* Access Warning if signed in with non-owner account */}
          {currentUser && !isAdmin && (
            <div className="p-4 rounded-xl bg-amber-950/35 border border-amber-500/30 text-amber-300 text-xs mb-6 space-y-2">
              <div className="font-semibold flex items-center space-x-1.5 rtl:space-x-reverse">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Unauthorized User</span>
              </div>
              <p>
                Signed in as <span className="font-mono text-white">{currentUser.email}</span>. Only the verified site owner (<span className="font-mono text-white">sbmc.3925@gmail.com</span>) has administrative rights.
              </p>
              <button
                onClick={handleSignOut}
                className="text-xs text-white underline hover:text-[#E4583B]"
              >
                Sign out and use owner account
              </button>
            </div>
          )}

          {/* Error notice */}
          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/35 text-rose-300 text-xs mb-6 flex items-start space-x-2.5 rtl:space-x-reverse">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Username + Password Form (Auto-maps to username@jabir.internal) */}
          <form onSubmit={handleUsernamePasswordAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#A7A298] mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3 w-4 h-4 text-[#6F6B64]" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="jabirbd"
                  className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-sm text-[#F4F0E8] focus:outline-none focus:border-[#E4583B] font-mono transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A7A298] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3 w-4 h-4 text-[#6F6B64]" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-sm text-[#F4F0E8] focus:outline-none focus:border-[#E4583B] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 rounded-xl font-semibold text-xs text-white bg-[#E4583B] hover:bg-[#D0492D] transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse disabled:opacity-50 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>{authLoading ? 'Verifying...' : 'Sign In as Admin'}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.08]" /></div>
            <span className="relative px-3 text-[11px] bg-[#121419] text-[#6F6B64]">Or continue with</span>
          </div>

          {/* Backup Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={authLoading}
            className="w-full py-2.5 rounded-xl text-xs font-medium text-[#EAE5DC] bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.08] transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-[#E4583B]" />
            <span>Sign In with Google</span>
          </button>

          {/* Back to public site button */}
          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
            <button
              onClick={onBackToSite}
              className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-xs text-[#8E8A82] hover:text-[#F4F0E8] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Website</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // THEME LIVE EDIT FULLSCREEN MODE (renders public website with interactive element selector & side panel)
  if (isLiveEditOpen) {
    return <ThemeLiveEditView onExit={() => setIsLiveEditOpen(false)} />;
  }

  // AUTHENTICATED OWNER: FULL CONTROL CENTER
  return (
    <div className="min-h-screen bg-[#0B0C0F] text-[#F4F0E8] flex flex-col font-sans selection:bg-[#E4583B] selection:text-white">

      {/* Top Header Toolbar */}
      <header className="sticky top-0 z-40 bg-[#121419]/95 backdrop-blur-md border-b border-white/[0.08] px-6 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#E4583B] text-white flex items-center justify-center font-bold text-sm shrink-0">
            MJ
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-[#F4F0E8] tracking-tight truncate">
              {ui.admin.title}
            </h1>
            <p className="text-xs text-[#8E8A82] truncate">
              Signed in as <span className="font-mono text-[#D7D2C8]">{loggedInLabel}</span>
            </p>
          </div>
        </div>

        {/* Actions: Save Draft, Preview, Publish Live, Back to site, Logout */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse shrink-0">
          {/* Backup & Export JSON */}
          <button
            onClick={exportPortfolioBackup}
            className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-2 rounded-lg text-xs font-medium text-[#D7D2C8] hover:text-white bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.08] transition-colors whitespace-nowrap cursor-pointer"
            title="Download complete JSON backup of portfolio content"
          >
            <Download className="w-3.5 h-3.5 text-[#E4583B]" />
            <span className="hidden md:inline">Backup JSON</span>
          </button>

          {/* Save Draft */}
          <button
            onClick={handleSaveDraft}
            disabled={savingDraft || publishing}
            className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3.5 py-2 rounded-lg text-xs font-medium text-[#F4F0E8] bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.08] transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-[#E4583B]" />
            <span className="hidden sm:inline">{savingDraft ? 'Saving...' : ui.admin.saveDraft}</span>
          </button>

          {/* Preview Toggle */}
          <button
            onClick={() => setIsPreviewDraft(!isPreviewDraft)}
            className={`inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer ${
              isPreviewDraft
                ? 'bg-[#E4583B]/15 text-[#F07C63] border-[#E4583B]/60'
                : 'bg-[#171A21] text-[#D7D2C8] border-white/[0.08] hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isPreviewDraft ? ui.admin.previewDraft : ui.admin.previewLive}
            </span>
          </button>

          {/* Publish Live */}
          <button
            onClick={handlePublishLive}
            disabled={publishing || savingDraft}
            className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#E4583B] hover:bg-[#D0492D] transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{publishing ? ui.admin.publishing : ui.admin.publishLive}</span>
          </button>

          {/* View Website */}
          <button
            onClick={onBackToSite}
            className="p-2 text-[#A7A298] hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="View Public Website"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* LOGOUT BUTTON */}
          <button
            onClick={handleSignOut}
            className="inline-flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-950/25 border border-rose-500/25 hover:bg-rose-950/45 transition-colors whitespace-nowrap cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Save or Publish Error Banner with Retry Button */}
      {(saveError || publishError) && (
        <div className="px-6 py-3 bg-rose-950/85 text-rose-200 border-b border-rose-500/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="font-semibold">Error: </span>
              <span>{saveError || publishError}</span>
              {(saveError || publishError)?.includes('securetoken.googleapis.com') && (
                <div className="mt-1">
                  <a
                    href="https://console.developers.google.com/apis/api/securetoken.googleapis.com/overview?project=142615067158"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-amber-300 font-medium hover:text-amber-200"
                  >
                    Click here to enable Google Token Service API in Google Cloud Console &rarr;
                  </a>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {saveError && (
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={savingDraft}
                className="px-3 py-1 rounded-lg bg-[#E4583B] hover:bg-[#D0492D] text-white font-semibold text-xs transition-colors"
              >
                {savingDraft ? 'Retrying...' : 'Retry Save Draft'}
              </button>
            )}
            {publishError && (
              <button
                type="button"
                onClick={handlePublishLive}
                disabled={publishing}
                className="px-3 py-1 rounded-lg bg-[#E4583B] hover:bg-[#D0492D] text-white font-semibold text-xs transition-colors"
              >
                {publishing ? 'Retrying...' : 'Retry Publish'}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setSaveError(null);
                setPublishError(null);
              }}
              className="text-xs text-[#A7A298] hover:text-white underline ml-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Toast Alert Banner */}
      {toastMessage && (
        <div
          className={`px-6 py-2.5 text-xs font-medium flex items-center justify-between ${
            toastType === 'success'
              ? 'bg-emerald-950/75 text-emerald-300 border-b border-emerald-500/30'
              : 'bg-rose-950/75 text-rose-300 border-b border-rose-500/30'
          }`}
        >
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {toastType === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Admin Stage */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">

        {/* Grouped Navigation Sidebar */}
        <aside className="w-full md:w-72 bg-[#121419] border border-white/[0.08] rounded-2xl p-3 flex flex-col space-y-1 shrink-0 h-fit">
          <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
            <span className="text-xs font-semibold text-[#8E8A82]">
              Content Sections
            </span>
          </div>

          <div className="space-y-1">
            {ADMIN_GROUPS.map((group) => {
              const GroupIcon = group.icon;
              const isExpanded = expandedGroup === group.id;
              const isGroupActive = getGroupFromTab(activeTab) === group.id;

              return (
                <div key={group.id} className="rounded-xl transition-colors">
                  {/* Group Header Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!isExpanded) {
                        setExpandedGroup(group.id);
                        setActiveTab(getTabFromSubSection(group.subSections[0].id) as any);
                      } else {
                        setExpandedGroup(group.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      isGroupActive
                        ? 'bg-[#171A21] text-[#F4F0E8] border border-white/[0.08]'
                        : 'text-[#A7A298] hover:text-[#F4F0E8] hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 rtl:space-x-reverse min-w-0">
                      <GroupIcon className={`w-4 h-4 shrink-0 ${isGroupActive ? 'text-[#E4583B]' : 'text-[#6F6B64]'}`} />
                      <span className="truncate text-xs font-medium">{group.label}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse shrink-0">
                      <span className="text-[11px] text-[#6F6B64] tabular-nums">
                        {group.subSections.length}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-[#8E8A82]" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-[#6F6B64]" />
                      )}
                    </div>
                  </button>

                  {/* Collapsible Sub-sections */}
                  {isExpanded && (
                    <div className="mt-1 ml-3.5 pl-3 border-l border-white/[0.08] space-y-0.5 py-1">
                      {group.subSections.map((sub) => {
                        const targetTab = getTabFromSubSection(sub.id);
                        const isSubActive = activeTab === targetTab;

                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => setActiveTab(targetTab as any)}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                              isSubActive
                                ? 'bg-[#E4583B] text-white font-semibold'
                                : 'text-[#A7A298] hover:text-[#F4F0E8] hover:bg-white/[0.04]'
                            }`}
                          >
                            <span className="truncate">{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Dedicated Option: Theme Live Edit */}
          <div className="pt-3 mt-2 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => setIsLiveEditOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.08] hover:border-[#E4583B]/50 text-[#F4F0E8] text-xs font-medium transition-colors group cursor-pointer"
            >
              <div className="flex items-center space-x-2.5 rtl:space-x-reverse min-w-0">
                <div className="p-1.5 rounded-lg bg-[#E4583B] text-white shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="text-left rtl:text-right">
                  <div className="text-xs font-semibold text-[#F4F0E8]">
                    Theme Live Edit
                  </div>
                  <div className="text-[11px] text-[#8E8A82]">Click &amp; edit public site</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#E4583B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
            </button>
          </div>
        </aside>

        {/* Content Workspace */}
        <div className="flex-1 bg-[#121419] border border-white/[0.08] rounded-2xl p-6 sm:p-8 overflow-y-auto">

          {/* Media Group Sub-tabs */}
          {['projects', 'graphic-best', 'videos', 'video-best'].includes(activeTab) && (
            <div className="mb-6 pb-4 border-b border-white/[0.08] flex flex-wrap items-center gap-2">
              <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[#0B0C0F] border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setActiveTab('projects')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === 'projects'
                      ? 'bg-[#E4583B] text-white'
                      : 'text-[#A7A298] hover:text-white'
                  }`}
                >
                  Graphic Design
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('graphic-best')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === 'graphic-best'
                      ? 'bg-[#E4583B] text-white'
                      : 'text-[#A7A298] hover:text-white'
                  }`}
                >
                  Graphic Best Work
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('videos')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === 'videos'
                      ? 'bg-[#E4583B] text-white'
                      : 'text-[#A7A298] hover:text-white'
                  }`}
                >
                  Video Editing
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('video-best')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === 'video-best'
                      ? 'bg-[#E4583B] text-white'
                      : 'text-[#A7A298] hover:text-white'
                  }`}
                >
                  Video Best Work
                </button>
              </div>
            </div>
          )}
          
          {/* TAB 0: THEME (Colors & Fonts) */}
          {activeTab === 'theme' && <ThemeEditor />}

          {/* TAB: BRANDING */}
          {activeTab === 'branding' && (
            <div className="space-y-6 max-w-3xl">
              <div className="pb-4 border-b border-white/[0.08]">
                <h2 className="text-lg font-semibold text-[#F4F0E8] mb-0.5">Site Branding &amp; Title</h2>
                <p className="text-xs text-[#8E8A82]">Control browser window title and navbar brand monogram</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7A298] mb-1.5">Browser Page Title</label>
                <input
                  type="text"
                  value={draftPortfolio.branding?.title || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateDraft(prev => ({
                      ...prev,
                      branding: { ...(prev.branding || { title: '', logoText: '', logoInitials: '' }), title: val }
                    }));
                  }}
                  placeholder="MD JABER HOSAIN | Creative Portfolio"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-sm text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#A7A298] mb-1.5">Navbar Logo Monogram (Initials)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={draftPortfolio.branding?.logoInitials || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft(prev => ({
                        ...prev,
                        branding: { ...(prev.branding || { title: '', logoText: '', logoInitials: '' }), logoInitials: val }
                      }));
                    }}
                    placeholder="MJ"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-sm text-[#F4F0E8] uppercase focus:border-[#E4583B] focus:outline-none"
                  />
                  <span className="text-[11px] text-[#6F6B64] mt-1 block">Example: "MJ"</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A7A298] mb-1.5">Navbar Brand Text</label>
                  <input
                    type="text"
                    value={draftPortfolio.branding?.logoText || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft(prev => ({
                        ...prev,
                        branding: { ...(prev.branding || { title: '', logoText: '', logoInitials: '' }), logoText: val }
                      }));
                    }}
                    placeholder="MD JABER HOSAIN"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-sm text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                  />
                </div>
              </div>

              {/* Change Admin Password Section */}
              <div className="pt-8 mt-8 border-t border-white/[0.08]">
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-[#F4F0E8] flex items-center space-x-2">
                    <KeyRound className="w-4 h-4 text-[#E4583B]" />
                    <span>Change Admin Password</span>
                  </h3>
                  <p className="text-xs text-[#8E8A82] mt-0.5">
                    Update the password for your username/password login (minimum 10 characters). Requires current password verification.
                  </p>
                </div>

                {passwordChangeMessage && (
                  <div
                    className={`mb-4 p-3 rounded-xl border text-xs flex items-center space-x-2 ${
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

                <form onSubmit={handleChangePassword} className="space-y-4 bg-[#171A21] p-5 rounded-xl border border-white/[0.08]">
                  <div>
                    <label className="block text-xs font-medium text-[#D7D2C8] mb-1.5">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPasswordInput}
                      onChange={(e) => setCurrentPasswordInput(e.target.value)}
                      placeholder="••••••••••"
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-sm text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#D7D2C8] mb-1.5">New Password (min 10 chars)</label>
                      <input
                        type="password"
                        required
                        minLength={10}
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="At least 10 characters"
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-sm text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#D7D2C8] mb-1.5">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        minLength={10}
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        placeholder="Repeat new password"
                        className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-sm text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="px-4 py-2 rounded-lg bg-[#E4583B] hover:bg-[#D0492D] text-white font-semibold text-xs transition-colors disabled:opacity-50 inline-flex items-center space-x-2 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{changingPassword ? 'Updating Password...' : 'Update Password'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Optional Inactivity Auto-Logout Section */}
              <div className="pt-8 mt-8 border-t border-white/[0.08]">
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-[#F4F0E8] flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-[#E4583B]" />
                    <span>Session Safety &amp; Inactivity Auto-Logout</span>
                  </h3>
                  <p className="text-xs text-[#8E8A82] mt-0.5">
                    By default, your login stays active permanently on this browser (Off). Enable an inactivity timer only if you are using a shared computer.
                  </p>
                </div>

                <div className="bg-[#171A21] p-5 rounded-xl border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-[#F4F0E8]">Auto-Logout After Inactivity</p>
                    <p className="text-xs text-[#8E8A82] mt-0.5">
                      Current status: {autoLogoutMinutes === 0 ? 'Disabled (Keep me signed in)' : `Auto-sign out after ${autoLogoutMinutes} minutes of inactivity`}
                    </p>
                  </div>
                  <select
                    value={autoLogoutMinutes}
                    onChange={(e) => handleAutoLogoutChange(Number(e.target.value))}
                    className="px-3.5 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                  >
                    <option value={0}>Off — Keep me logged in (Default)</option>
                    <option value={15}>After 15 minutes of inactivity</option>
                    <option value={30}>After 30 minutes of inactivity</option>
                    <option value={60}>After 60 minutes of inactivity</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: HERO */}
          {activeTab === 'hero' && (
            <HeroEditor />
          )}

          {/* TAB: CASE STUDIES & WORK TYPE */}
          {activeTab === 'case-studies' && (
            <CaseStudiesEditor onNotify={showToast} />
          )}

          {/* TAB: FOCUS MODE, STATS & TESTIMONIALS */}
          {activeTab === 'stats-testimonials' && (
            <StatsTestimonialsEditor onNotify={showToast} />
          )}

          {/* TAB 2: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-6 max-w-3xl">
              <div className="pb-4 border-b border-white/[0.08]">
                <h2 className="text-lg font-semibold text-[#F4F0E8] mb-0.5">About Bio &amp; Portrait</h2>
                <p className="text-xs text-[#8E8A82]">Manage bilingual biography copy and your portrait photo</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7A298] mb-1.5">Bio (English)</label>
                <textarea
                  rows={4}
                  value={draftPortfolio.about.bio.en}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateDraft(prev => ({
                      ...prev,
                      about: { ...prev.about, bio: { ...prev.about.bio, en: val } }
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-sm text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7A298] mb-1.5">Bio (বাংলা)</label>
                <textarea
                  rows={4}
                  value={draftPortfolio.about.bio.bn}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateDraft(prev => ({
                      ...prev,
                      about: { ...prev.about, bio: { ...prev.about.bio, bn: val } }
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-sm text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none resize-none"
                />
              </div>

              {/* About Avatar Image with Upload + URL */}
              <ImageUploaderField
                label="About Section Portrait"
                value={draftPortfolio.about.avatarUrl}
                onChange={(val) => updateDraft(prev => ({
                  ...prev,
                  about: { ...prev.about, avatarUrl: val }
                }))}
                defaultFallback="/assets/jabir_profile.png"
                helperText="Upload image or paste direct image URL (i.postimg.cc, Google Drive, Firebase). Syncs to live site upon Publish."
              />
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    updateDraft(prev => ({
                      ...prev,
                      hero: { ...prev.hero, avatarUrl: prev.about.avatarUrl }
                    }));
                    showToast('About portrait also applied to Hero section!');
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.08] text-xs font-medium text-[#D7D2C8] hover:text-white transition-colors cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-[#E4583B]" />
                  <span>Also use this photo for Hero section</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: SERVICES */}
          {activeTab === 'services' && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                <div>
                  <h2 className="text-lg font-semibold text-[#F4F0E8] mb-0.5">Services Management</h2>
                  <p className="text-xs text-[#8E8A82]">Edit offered services across English, Bengali, and Arabic</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newService: ServiceItem = {
                      id: 'srv-' + Date.now(),
                      title: { en: 'New Service', bn: 'নতুন সেবা', ar: 'خدمة جديدة' },
                      description: { en: 'Description of professional service.', bn: '', ar: '' },
                      icon: 'Video'
                    };
                    updateDraft(prev => ({
                      ...prev,
                      services: [...(prev.services || []), newService]
                    }));
                    showToast('New service added');
                  }}
                  className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#E4583B] hover:bg-[#D0492D] transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Service</span>
                </button>
              </div>

              {(draftPortfolio.services || []).map((service, sIdx) => (
                <div key={service.id || sIdx} className="p-5 rounded-xl bg-[#171A21] border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#E4583B] tabular-nums">Service #{sIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const name = service.title?.en || `Service #${sIdx + 1}`;
                        requestDelete(
                          'Delete Service?',
                          name,
                          () => {
                            updateDraft(prev => ({
                              ...prev,
                              services: (prev.services || []).filter((_, i) => i !== sIdx)
                            }));
                            showToast('Service removed from list');
                          },
                          'Are you sure you want to delete this service? It will be removed from your draft portfolio. Changes take effect on the live website when you click Publish.'
                        );
                      }}
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Delete Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#8E8A82] mb-1">Title (English)</label>
                      <input
                        type="text"
                        value={service.title.en}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft(prev => ({
                            ...prev,
                            services: prev.services.map((s, i) => i === sIdx ? { ...s, title: { ...s.title, en: val } } : s)
                          }));
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#8E8A82] mb-1">Title (বাংলা)</label>
                      <input
                        type="text"
                        value={service.title.bn}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft(prev => ({
                            ...prev,
                            services: prev.services.map((s, i) => i === sIdx ? { ...s, title: { ...s.title, bn: val } } : s)
                          }));
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#8E8A82] mb-1">Title (العربية)</label>
                      <input
                        type="text"
                        dir="rtl"
                        value={service.title.ar}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft(prev => ({
                            ...prev,
                            services: prev.services.map((s, i) => i === sIdx ? { ...s, title: { ...s.title, ar: val } } : s)
                          }));
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#8E8A82] mb-1">Description (English)</label>
                      <textarea
                        rows={2}
                        value={service.description.en}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft(prev => ({
                            ...prev,
                            services: prev.services.map((s, i) => i === sIdx ? { ...s, description: { ...s.description, en: val } } : s)
                          }));
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#8E8A82] mb-1">Description (বাংলা)</label>
                      <textarea
                        rows={2}
                        value={service.description.bn}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft(prev => ({
                            ...prev,
                            services: prev.services.map((s, i) => i === sIdx ? { ...s, description: { ...s.description, bn: val } } : s)
                          }));
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#8E8A82] mb-1">Description (العربية)</label>
                      <textarea
                        rows={2}
                        dir="rtl"
                        value={service.description.ar}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft(prev => ({
                            ...prev,
                            services: prev.services.map((s, i) => i === sIdx ? { ...s, description: { ...s.description, ar: val } } : s)
                          }));
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                <div>
                  <h2 className="text-lg font-semibold text-[#F4F0E8] mb-0.5">Skills &amp; Tools Management</h2>
                  <p className="text-xs text-[#8E8A82]">Manage skill categories and software tool lists</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newSkill: SkillCategory = {
                      id: 'skill-' + Date.now(),
                      title: { en: 'New Skill Category', bn: 'নতুন স্কিল ক্যাটাগরি', ar: 'فئة مهارات جديدة' },
                      description: { en: 'Tools and proficiency description', bn: '', ar: '' },
                      tools: ['Adobe Photoshop', 'Premiere Pro'],
                      icon: 'Award'
                    };
                    updateDraft(prev => ({
                      ...prev,
                      skills: [...(prev.skills || []), newSkill]
                    }));
                    showToast('New skill category added');
                  }}
                  className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#E4583B] hover:bg-[#D0492D] transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Skill</span>
                </button>
              </div>

              {(draftPortfolio.skills || []).map((skill, skIdx) => (
                <div key={skill.id || skIdx} className="p-5 rounded-xl bg-[#171A21] border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#E4583B] tabular-nums">Category #{skIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const name = skill.title?.en || `Category #${skIdx + 1}`;
                        requestDelete(
                          'Delete Skill Category?',
                          name,
                          () => {
                            updateDraft(prev => ({
                              ...prev,
                              skills: (prev.skills || []).filter((_, i) => i !== skIdx)
                            }));
                            showToast('Skill removed from list');
                          },
                          'Are you sure you want to delete this skill category? It will be removed from your draft portfolio. Changes take effect on the live website when you click Publish.'
                        );
                      }}
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Delete Skill"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#8E8A82] mb-1">Title (English)</label>
                      <input
                        type="text"
                        value={skill.title.en}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft(prev => ({
                            ...prev,
                            skills: prev.skills.map((s, i) => i === skIdx ? { ...s, title: { ...s.title, en: val } } : s)
                          }));
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#8E8A82] mb-1">Title (বাংলা)</label>
                      <input
                        type="text"
                        value={skill.title.bn}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft(prev => ({
                            ...prev,
                            skills: prev.skills.map((s, i) => i === skIdx ? { ...s, title: { ...s.title, bn: val } } : s)
                          }));
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#8E8A82] mb-1">Title (العربية)</label>
                      <input
                        type="text"
                        dir="rtl"
                        value={skill.title.ar}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft(prev => ({
                            ...prev,
                            skills: prev.skills.map((s, i) => i === skIdx ? { ...s, title: { ...s.title, ar: val } } : s)
                          }));
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#8E8A82] mb-1">
                      Software / Tools (comma separated)
                    </label>
                    <input
                      type="text"
                      value={skill.tools.join(', ')}
                      onChange={(e) => {
                        const list = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                        updateDraft(prev => ({
                          ...prev,
                          skills: prev.skills.map((s, i) => i === skIdx ? { ...s, tools: list } : s)
                        }));
                      }}
                      placeholder="e.g. Adobe Premiere Pro, After Effects, DaVinci Resolve"
                      className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                    />
                  </div>
                </div>
              ))}

              {/* Creative Workflow Steps Management */}
              <div className="pt-8 border-t border-white/[0.08]">
                <WorkflowEditor />
              </div>
            </div>
          )}

          {/* TAB 3: EDUCATION (Academic Records & Professional Courses) */}
          {activeTab === 'education' && <EducationEditor />}

          {/* TAB 4: PROJECTS (Creative Works & Graphic Design) */}
          {activeTab === 'projects' && (
            <div className="space-y-6 max-w-4xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                <div>
                  <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                    <h2 className="text-lg font-semibold text-[#F4F0E8]">
                      Projects &amp; Graphics Showcase
                    </h2>
                    <span className="text-xs text-[#8E8A82] tabular-nums">
                      &middot; {draftPortfolio.projects?.length || 0} items
                    </span>
                  </div>
                  <p className="text-xs text-[#8E8A82] mt-0.5">
                    Manage multi-poster graphic project groups, display order, Behance gallery links, and high-res artwork.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newId = 'proj-' + Date.now();
                    const nextOrder = (draftPortfolio.projects?.length || 0) + 1;
                    const newProject: ProjectItem = {
                      id: newId,
                      title: { en: 'New Graphic Project', bn: 'নতুন গ্রাফিক্স প্রজেক্ট', ar: 'مشروع جرافيك جديد' },
                      category: 'graphic',
                      description: {
                        en: 'High-resolution graphic design concept, brand identity and visual styling.',
                        bn: 'হাই-রেজোলিউশন গ্রাফিক্স ডিজাইন কনসেপ্ট, ব্র্যান্ড আইডেন্টিটি ও ভিজ্যুয়াল স্টাইলিং।',
                        ar: 'مفهوم تصميم جرافيكي عالي الدقة وهوية بصرية بأسلوب مميز.'
                      },
                      behanceUrl: 'https://www.behance.net/jaberhosain',
                      externalUrl: '',
                      coverImage: '',
                      galleryImages: [],
                      galleryCaptions: [],
                      order: nextOrder
                    };
                    updateDraft(prev => ({
                      ...prev,
                      projects: [...(prev.projects || []), newProject]
                    }));
                    showToast('New graphic project created! Paste a Behance URL or upload posters below.');
                  }}
                  className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#E4583B] hover:bg-[#D0492D] transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Blank Project</span>
                </button>
              </div>

              {/* 1-Click Import Entire Behance Project Group Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#171A21] border border-white/[0.08] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <Wand2 className="w-4 h-4 text-[#E4583B]" />
                    <h3 className="text-xs font-semibold text-[#F4F0E8]">
                      Import Entire Behance Project Group
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#8E8A82]">
                    ১টি প্রজেক্টে ২–৩টি বা তার বেশি পোস্টার অটোমেটিক গ্রুপ আকারে যোগ হবে
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={behanceImportUrl}
                    onChange={(e) => setBehanceImportUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleImportNewBehanceProject();
                      }
                    }}
                    placeholder="https://www.behance.net/gallery/..."
                    className="flex-1 px-3.5 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs font-mono text-[#F4F0E8] placeholder-[#6F6B64] focus:border-[#E4583B] focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={importingBehanceProject}
                    onClick={handleImportNewBehanceProject}
                    className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-[#E4583B] hover:bg-[#D0492D] text-xs font-semibold text-white disabled:opacity-50 shrink-0 cursor-pointer transition-colors"
                  >
                    {importingBehanceProject ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>{importingBehanceProject ? 'Importing Posters...' : 'Import Behance Group'}</span>
                  </button>
                </div>

                {behanceImportHint && (
                  <div
                    className={`p-3 rounded-lg text-xs border flex items-start space-x-2 ${
                      behanceImportHint.type === 'ok'
                        ? 'bg-emerald-950/35 border-emerald-500/30 text-emerald-300'
                        : 'bg-amber-950/35 border-amber-500/30 text-amber-200'
                    }`}
                  >
                    {behanceImportHint.type === 'ok' ? (
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    )}
                    <span>{behanceImportHint.text}</span>
                  </div>
                )}
              </div>

              {/* Projects List */}
              <div className="space-y-5">
                {(draftPortfolio.projects || []).map((proj, pIdx) => (
                  <div
                    id={`project-card-${proj.id}`}
                    key={proj.id || pIdx}
                    className="p-5 sm:p-6 rounded-2xl bg-[#171A21] border border-white/[0.08] space-y-5 relative hover:border-white/[0.14] transition-colors"
                  >
                    {/* Header: Order, Category & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-white/[0.06]">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <span className="px-2 py-0.5 rounded-md bg-[#0B0C0F] border border-white/[0.08] text-xs font-semibold text-[#E4583B] tabular-nums">
                          #{pIdx + 1}
                        </span>

                        {/* Category Selector */}
                        <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                          <label className="text-xs text-[#8E8A82]">Category:</label>
                          <select
                            value={proj.category}
                            onChange={(e) => {
                              const val = e.target.value as 'video' | 'graphic';
                              updateDraft(prev => ({
                                ...prev,
                                projects: prev.projects.map(p => p.id === proj.id ? { ...p, category: val } : p)
                              }));
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs font-medium text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                          >
                            <option value="graphic">Graphic Design</option>
                            <option value="video">Video Editing</option>
                          </select>
                        </div>

                        {/* Order Input */}
                        <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                          <label className="text-xs text-[#8E8A82]">Order:</label>
                          <input
                            type="number"
                            min={1}
                            value={proj.order ?? (pIdx + 1)}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 1;
                              updateDraft(prev => ({
                                ...prev,
                                projects: prev.projects.map(p => p.id === proj.id ? { ...p, order: val } : p)
                              }));
                            }}
                            className="w-14 px-2 py-0.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs tabular-nums text-center text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Move & Delete controls */}
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <button
                          type="button"
                          onClick={() => handleMoveProject(pIdx, pIdx - 1)}
                          disabled={pIdx === 0}
                          className="p-1.5 rounded-lg text-[#8E8A82] hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveProject(pIdx, pIdx + 1)}
                          disabled={pIdx === (draftPortfolio.projects?.length || 0) - 1}
                          className="p-1.5 rounded-lg text-[#8E8A82] hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const name = proj.title?.en || `Project #${pIdx + 1}`;
                            requestDelete(
                              'Delete Project?',
                              name,
                              () => {
                                updateDraft(prev => ({
                                  ...prev,
                                  projects: (prev.projects || []).filter(p => p.id !== proj.id)
                                }));
                                showToast('Project deleted from list');
                              },
                              'Are you sure you want to delete this project? It will be removed from your draft portfolio. Changes take effect on the live website when you click Publish.'
                            );
                          }}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors ml-1 cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Group / Series Name (Behance Project Group) */}
                    <div className="p-3.5 rounded-xl bg-[#121419] border border-white/[0.07] space-y-2">
                      <label className="block text-xs font-medium text-[#D7D2C8]">
                        Behance Group / Poster Series Name (Optional — e.g. Eid Poster Series, Brand Identity)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <input
                          type="text"
                          placeholder="Group Name (EN)"
                          value={proj.groupName?.en || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft(prev => ({
                              ...prev,
                              projects: prev.projects.map(p => p.id === proj.id ? { ...p, groupName: { ...(p.groupName || { en: '', bn: '', ar: '' }), en: val } } : p)
                            }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="গ্রুপের নাম (বাংলা)"
                          value={proj.groupName?.bn || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft(prev => ({
                              ...prev,
                              projects: prev.projects.map(p => p.id === proj.id ? { ...p, groupName: { ...(p.groupName || { en: '', bn: '', ar: '' }), bn: val } } : p)
                            }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                        />
                        <input
                          type="text"
                          dir="rtl"
                          placeholder="اسم المجموعة (العربية)"
                          value={proj.groupName?.ar || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft(prev => ({
                              ...prev,
                              projects: prev.projects.map(p => p.id === proj.id ? { ...p, groupName: { ...(p.groupName || { en: '', bn: '', ar: '' }), ar: val } } : p)
                            }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Titles across 3 languages */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-[#8E8A82] mb-1">Title (English)</label>
                        <input
                          type="text"
                          value={proj.title?.en || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft(prev => ({
                              ...prev,
                              projects: prev.projects.map(p => p.id === proj.id ? { ...p, title: { ...(p.title || { en: '', bn: '', ar: '' }), en: val } } : p)
                            }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#8E8A82] mb-1">Title (বাংলা)</label>
                        <input
                          type="text"
                          value={proj.title?.bn || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft(prev => ({
                              ...prev,
                              projects: prev.projects.map(p => p.id === proj.id ? { ...p, title: { ...(p.title || { en: '', bn: '', ar: '' }), bn: val } } : p)
                            }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#8E8A82] mb-1">Title (العربية)</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={proj.title?.ar || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft(prev => ({
                              ...prev,
                              projects: prev.projects.map(p => p.id === proj.id ? { ...p, title: { ...(p.title || { en: '', bn: '', ar: '' }), ar: val } } : p)
                            }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Descriptions across 3 languages */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-[#8E8A82] mb-1">Description (English)</label>
                        <textarea
                          rows={2}
                          value={proj.description?.en || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft(prev => ({
                              ...prev,
                              projects: prev.projects.map(p => p.id === proj.id ? { ...p, description: { ...(p.description || { en: '', bn: '', ar: '' }), en: val } } : p)
                            }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#8E8A82] mb-1">Description (বাংলা)</label>
                        <textarea
                          rows={2}
                          value={proj.description?.bn || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft(prev => ({
                              ...prev,
                              projects: prev.projects.map(p => p.id === proj.id ? { ...p, description: { ...(p.description || { en: '', bn: '', ar: '' }), bn: val } } : p)
                            }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#8E8A82] mb-1">Description (العربية)</label>
                        <textarea
                          rows={2}
                          dir="rtl"
                          value={proj.description?.ar || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft(prev => ({
                              ...prev,
                              projects: prev.projects.map(p => p.id === proj.id ? { ...p, description: { ...(p.description || { en: '', bn: '', ar: '' }), ar: val } } : p)
                            }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none resize-none"
                        />
                      </div>
                    </div>

                    {/* Links: Behance (with 1-click Extract Posters) & Optional External Link */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#A7A298] mb-1.5">
                          Behance Project / Gallery URL
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            placeholder="https://www.behance.net/gallery/..."
                            value={proj.behanceUrl || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateDraft(prev => ({
                                ...prev,
                                projects: prev.projects.map(p => p.id === proj.id ? { ...p, behanceUrl: val } : p)
                              }));
                            }}
                            className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] font-mono focus:border-[#E4583B] focus:outline-none"
                          />
                          <button
                            type="button"
                            disabled={extractingProjectId === proj.id || !proj.behanceUrl}
                            onClick={() => handleExtractProjectBehance(proj)}
                            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#121419] hover:bg-[#1E222B] border border-white/[0.1] text-xs font-medium text-[#F4F0E8] disabled:opacity-45 shrink-0 cursor-pointer transition-colors"
                            title="Pull cover and all posters from this Behance project URL"
                          >
                            {extractingProjectId === proj.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E4583B]" />
                            ) : (
                              <Wand2 className="w-3.5 h-3.5 text-[#E4583B]" />
                            )}
                            <span>{extractingProjectId === proj.id ? 'Extracting...' : 'Extract Posters'}</span>
                          </button>
                        </div>
                        <span className="text-[11px] text-[#6F6B64] mt-1 block">
                          Displays "View on Behance" button inside the high-resolution lightbox
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#A7A298] mb-1.5">
                          External Project Link (Optional)
                        </label>
                        <input
                          type="url"
                          placeholder="https://example.com/project-live"
                          value={proj.externalUrl || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft(prev => ({
                              ...prev,
                              projects: prev.projects.map(p => p.id === proj.id ? { ...p, externalUrl: val } : p)
                            }));
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] font-mono focus:border-[#E4583B] focus:outline-none"
                        />
                        <span className="text-[11px] text-[#6F6B64] mt-1 block">
                          Optional live demo or client case study link
                        </span>
                      </div>
                    </div>

                    {/* Artwork Image Uploader & Live Preview */}
                    <ImageUploaderField
                      label="Project Cover Poster / Main Artwork"
                      value={proj.coverImage || ''}
                      onChange={(val) => updateDraft(prev => ({
                        ...prev,
                        projects: prev.projects.map(p => p.id === proj.id ? { ...p, coverImage: val } : p)
                      }))}
                      defaultFallback=""
                      helperText="Upload image file or paste Behance/Postimages URL (mir-s3-cdn-cf.behance.net/..., i.postimg.cc/...)."
                    />

                    {/* Multi-Poster Project Group Gallery */}
                    <ProjectGalleryManager
                      galleryImages={proj.galleryImages || []}
                      galleryCaptions={proj.galleryCaptions || []}
                      coverImage={proj.coverImage || ''}
                      behanceUrl={proj.behanceUrl || ''}
                      onChange={(nextImages, nextCaptions, newCover) => {
                        updateDraft(prev => ({
                          ...prev,
                          projects: prev.projects.map(p =>
                            p.id === proj.id
                              ? {
                                  ...p,
                                  galleryImages: nextImages,
                                  galleryCaptions: nextCaptions,
                                  ...(newCover !== undefined ? { coverImage: newCover } : {})
                                }
                              : p
                          )
                        }));
                      }}
                      onBehanceImported={({ title, description }) => {
                        updateDraft(prev => ({
                          ...prev,
                          projects: prev.projects.map(p => {
                            if (p.id !== proj.id) return p;
                            const isDefaultTitle =
                              !p.title?.en ||
                              p.title.en === 'New Graphic Project' ||
                              p.title.en === 'Untitled';
                            const isDefaultDesc =
                              !p.description?.en ||
                              p.description.en.startsWith('High-resolution graphic design concept');
                            return {
                              ...p,
                              title: isDefaultTitle && title ? { ...(p.title || { en: '', bn: '', ar: '' }), en: title } : p.title,
                              groupName: !p.groupName?.en && title ? { ...(p.groupName || { en: '', bn: '', ar: '' }), en: title } : p.groupName,
                              description:
                                isDefaultDesc && description
                                  ? { ...(p.description || { en: '', bn: '', ar: '' }), en: description }
                                  : p.description
                            };
                          })
                        }));
                      }}
                    />
                  </div>
                ))}

                {(draftPortfolio.projects?.length || 0) === 0 && (
                  <div className="p-8 text-center rounded-xl bg-[#171A21] border border-white/[0.08] text-[#8E8A82] text-xs">
                    No projects found. Import a Behance link above or click "Add Blank Project" to create one.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: GRAPHIC DESIGN - BEST WORK */}
          {activeTab === 'graphic-best' && (
            <BestWorkGraphicEditor onNotify={showToast} />
          )}

          {/* TAB 5: VIDEOS (Video Editing Showcase & Embeds) */}
          {activeTab === 'videos' && (
            <div className="max-w-4xl space-y-6">

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                <div>
                  <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                    <h2 className="text-lg font-semibold text-[#F4F0E8]">
                      Video Editing Portfolio / Showcase
                    </h2>
                    <span className="text-xs text-[#8E8A82] tabular-nums">
                      &middot; {draftPortfolio.videos?.length || 0} videos
                    </span>
                  </div>
                  <p className="text-xs text-[#8E8A82] mt-0.5">
                    Manage Vimeo, YouTube, and Facebook video embeds, automatic thumbnails, custom uploads, titles, and display order.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddVideo}
                  className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#E4583B] hover:bg-[#D0492D] transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Video</span>
                </button>
              </div>

              {/* YouTube Channel Link Global Editor */}
              <div className="p-5 rounded-xl bg-[#171A21] border border-white/[0.08] space-y-2.5">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Youtube className="w-4 h-4 text-[#FF0000]" />
                  <label className="text-xs font-semibold text-[#F4F0E8]">
                    My YouTube Channel URL
                  </label>
                </div>
                <input
                  type="url"
                  value={draftPortfolio.contact?.youtubeUrl || draftPortfolio.channelLinks?.find(c => c.platform === 'YouTube')?.url || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateDraft(prev => ({
                      ...prev,
                      contact: { ...(prev.contact || {}), youtubeUrl: val },
                      channelLinks: (prev.channelLinks || []).map(c => c.platform === 'YouTube' ? { ...c, url: val, status: val ? 'LINKED' : 'UNLINKED' } : c)
                    }));
                  }}
                  placeholder="https://www.youtube.com/@jaberhosain"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-sm text-[#F4F0E8] font-mono focus:border-[#E4583B] focus:outline-none"
                />
                <p className="text-xs text-[#8E8A82]">
                  Controls the primary "Watch My Work On YouTube" button and public channel proof links across the website.
                </p>
              </div>

              {/* Creative Organization Section Filter Bar */}
              <div className="p-4 rounded-xl bg-[#171A21] border border-white/[0.08] space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#F4F0E8]">
                    Creative Organization Filter (Reels 9:16 vs Video Editing Sub-Sections)
                  </span>
                  <span className="text-[11px] text-[#8E8A82]">
                    Assign each video below to organize Reels &amp; Video sections automatically
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setVideoAdminFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer tabular-nums ${
                      videoAdminFilter === 'all'
                        ? 'bg-[#E4583B] text-white font-semibold'
                        : 'bg-[#0B0C0F] text-[#A7A298] hover:text-white border border-white/[0.08]'
                    }`}
                  >
                    All ({draftPortfolio.videos?.length || 0})
                  </button>
                  {VIDEO_SECTION_META.map((sec) => {
                    const count = (draftPortfolio.videos || []).filter(
                      (item) => resolveVideoSection(item, item.title?.en || '', item.description?.en || '') === sec.id
                    ).length;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => setVideoAdminFilter(sec.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer tabular-nums ${
                          videoAdminFilter === sec.id
                            ? 'bg-[#E4583B] text-white font-semibold'
                            : 'bg-[#0B0C0F] text-[#A7A298] hover:text-white border border-white/[0.08]'
                        }`}
                      >
                        {sec.label.en} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Videos List */}
              <div className="space-y-5">
                {draftPortfolio.videos?.map((vid, idx) => {
                  const resolvedSection = resolveVideoSection(
                    vid,
                    vid.title?.en || '',
                    vid.description?.en || ''
                  );
                  const resolvedSubSection = resolveVideoSubSection(vid, vid.category === 'video_best');
                  if (videoAdminFilter !== 'all' && resolvedSection !== videoAdminFilter) {
                    return null;
                  }
                  const ytId = extractYouTubeId(vid.videoUrl);
                  const vimeoInfo = extractVimeoInfo(vid.videoUrl);
                  const isVimeo = vid.videoType === 'vimeo' || Boolean(vimeoInfo.id);
                  const isYouTube = !isVimeo && (vid.videoType === 'youtube' || Boolean(ytId));
                  const isFetchingOg = fetchingOgId === vid.id;
                  const ogNote = ogFetchNotes[vid.id];

                  // Auto YouTube thumbnail where possible
                  const autoYtThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '';
                  const activeThumbnail = vid.customThumbnailUrl || vid.thumbnailUrl || autoYtThumb;

                  return (
                    <div
                      key={vid.id || idx}
                      className="p-5 sm:p-6 rounded-2xl bg-[#171A21] border border-white/[0.08] space-y-5 relative hover:border-white/[0.14] transition-colors"
                    >
                      {/* Top Video Header: Platform, Order & Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-white/[0.06]">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <span className="px-2 py-0.5 rounded-md bg-[#0B0C0F] border border-white/[0.08] text-xs font-semibold text-[#E4583B] tabular-nums">
                            #{idx + 1}
                          </span>

                          {/* Platform Selector with Vimeo */}
                          <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                            <label className="text-xs text-[#8E8A82]">Platform:</label>
                            <select
                              value={vid.videoType}
                              onChange={(e) => {
                                const val = e.target.value as 'vimeo' | 'youtube' | 'facebook' | 'direct';
                                updateDraft(prev => ({
                                  ...prev,
                                  videos: prev.videos.map((v, i) => i === idx ? { ...v, videoType: val } : v)
                                }));
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs font-medium text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                            >
                              <option value="vimeo">Vimeo</option>
                              <option value="youtube">YouTube</option>
                              <option value="facebook">Facebook</option>
                              <option value="direct">Direct Link / MP4</option>
                            </select>
                          </div>

                          {/* Order Input */}
                          <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                            <label className="text-xs text-[#8E8A82]">Order:</label>
                            <input
                              type="number"
                              min={1}
                              value={vid.order ?? (idx + 1)}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 1;
                                updateDraft(prev => ({
                                  ...prev,
                                  videos: prev.videos.map((v, i) => i === idx ? { ...v, order: val } : v)
                                }));
                              }}
                              className="w-14 px-2 py-0.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs tabular-nums text-center text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                            />
                          </div>

                          {vid.customThumbnailUrl && (
                            <span className="text-xs text-emerald-400">
                              Custom Thumbnail Active
                            </span>
                          )}
                          {!vid.customThumbnailUrl && isVimeo && (
                            <span className="text-xs text-[#1AB7EA]">
                              Vimeo Auto
                            </span>
                          )}
                          {!vid.customThumbnailUrl && isYouTube && ytId && (
                            <span className="text-xs text-[#D7D2C8]">
                              YouTube Auto
                            </span>
                          )}
                        </div>

                        {/* Order & Delete */}
                        <div className="flex items-center space-x-1 rtl:space-x-reverse">
                          <button
                            type="button"
                            onClick={() => handleMoveVideo(idx, idx - 1)}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg text-[#8E8A82] hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveVideo(idx, idx + 1)}
                            disabled={idx === (draftPortfolio.videos?.length || 0) - 1}
                            className="p-1.5 rounded-lg text-[#8E8A82] hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                            title="Move Down"
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
                                  updateDraft(prev => ({
                                    ...prev,
                                    videos: (prev.videos || []).filter((_, i) => i !== idx)
                                  }));
                                  showToast('Video deleted from list');
                                },
                                'Are you sure you want to delete this video item? It will be removed from your draft portfolio. Changes take effect on the live website when you click Publish.'
                              );
                            }}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 ml-2 transition-colors cursor-pointer"
                            title="Delete Video"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Section Format, Sub-Section Tier & Duration Classification */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#121419] border border-white/[0.07]">
                        <div>
                          <label className="block text-[11px] font-medium text-[#A7A298] mb-1">
                            Section Placement
                          </label>
                          <select
                            value={vid.videoSection || resolvedSection}
                            onChange={(e) => {
                              const val = e.target.value as VideoSectionFormat;
                              updateDraft(prev => ({
                                ...prev,
                                videos: prev.videos.map((v, i) => i === idx ? { ...v, videoSection: val } : v)
                              }));
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs font-medium text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                          >
                            {VIDEO_SECTION_META.map((sec) => (
                              <option key={sec.id} value={sec.id}>
                                {sec.isVerticalReel ? `${sec.label.en} (9:16)` : `${sec.label.en} (16:9)`}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-[#A7A298] mb-1">
                            Sub-Section Tier
                          </label>
                          <select
                            value={vid.subSection || resolvedSubSection}
                            onChange={(e) => {
                              const val = e.target.value as VideoSubSectionTier;
                              updateDraft(prev => ({
                                ...prev,
                                videos: prev.videos.map((v, i) => i === idx ? { ...v, subSection: val } : v)
                              }));
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs font-medium text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                          >
                            {VIDEO_SUBSECTION_META.map((tier) => (
                              <option key={tier.id} value={tier.id}>
                                {tier.label.en}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-[#A7A298] mb-1">
                            Duration (e.g. 0:51)
                          </label>
                          <input
                            type="text"
                            value={vid.duration || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateDraft(prev => ({
                                ...prev,
                                videos: prev.videos.map((v, i) => i === idx ? { ...v, duration: val } : v)
                              }));
                            }}
                            placeholder="0:51"
                            className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs font-mono tabular-nums text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Video URL Input */}
                      <div>
                        <label className="block text-xs font-medium text-[#A7A298] mb-1.5 flex items-center justify-between">
                          <span>Video URL (Vimeo, YouTube, or Facebook Link)</span>
                          {isVimeo && (
                            <span className="text-[11px] text-[#1AB7EA] font-medium">
                              Vimeo Link Detected
                            </span>
                          )}
                        </label>
                        <input
                          type="url"
                          required
                          value={vid.videoUrl || ''}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            const detected = detectVideoType(val);
                            const ytId = extractYouTubeId(val);
                            const vInfo = extractVimeoInfo(val);
                            const autoThumb = ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : '';

                            updateDraft(prev => ({
                              ...prev,
                              videos: prev.videos.map((v, i) => i === idx ? {
                                ...v,
                                videoUrl: val,
                                videoType: detected !== 'direct' ? detected : v.videoType,
                                videoId: vInfo.id || (ytId || v.videoId),
                                videoHash: vInfo.hash || v.videoHash,
                                thumbnailUrl: autoThumb || v.thumbnailUrl
                              } : v)
                            }));
                          }}
                          onBlur={(e) => {
                            const val = e.target.value.trim();
                            if (val) {
                              triggerAutoFetchVideo(val, idx);
                            }
                          }}
                          placeholder="https://vimeo.com/... or https://www.youtube.com/watch?v=... or https://www.facebook.com/..."
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-sm text-[#F4F0E8] font-mono focus:border-[#E4583B] focus:outline-none"
                        />
                      </div>

                      {/* Thumbnail Management Stage */}
                      <div className="p-4 rounded-xl bg-[#121419] border border-white/[0.07] space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-[#D7D2C8] flex items-center space-x-1.5 rtl:space-x-reverse">
                            <ImageIcon className="w-3.5 h-3.5 text-[#E4583B]" />
                            <span>Thumbnail Configuration</span>
                          </span>

                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            {vid.customThumbnailUrl && (
                              <button
                                type="button"
                                onClick={() => {
                                  updateDraft(prev => ({
                                    ...prev,
                                    videos: prev.videos.map((v, i) => i === idx ? { ...v, customThumbnailUrl: '' } : v)
                                  }));
                                  if (vid.videoUrl) {
                                    triggerAutoFetchVideo(vid.videoUrl, idx, true);
                                  }
                                  showToast('Reset to automatic thumbnail');
                                }}
                                className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-950/35 hover:bg-amber-950/55 border border-amber-500/30 transition-colors cursor-pointer"
                                title="Remove custom thumbnail and restore automatic thumbnail"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                                <span>Reset to Auto</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleFetchOg(vid, idx)}
                              disabled={isFetchingOg || !vid.videoUrl}
                              className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-lg text-xs font-medium text-[#EAE5DC] bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.08] hover:border-[#E4583B]/50 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 text-[#E4583B] ${isFetchingOg ? 'animate-spin' : ''}`} />
                              <span>{isFetchingOg ? 'Fetching...' : 'Re-fetch Auto Thumbnail'}</span>
                            </button>
                          </div>
                        </div>

                        {ogNote && (
                          <div className="p-3 rounded-lg bg-amber-950/35 border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-2 rtl:space-x-reverse">
                            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>{ogNote}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                          <div className="md:col-span-5">
                            <label className="block text-[11px] font-medium text-[#8E8A82] mb-1">
                              Current Display Preview
                            </label>
                            <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-white/[0.08] bg-[#0B0C0F] flex items-center justify-center">
                              {activeThumbnail ? (
                                <img
                                  src={activeThumbnail}
                                  alt="Thumbnail preview"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="text-center p-4">
                                  <div className="w-10 h-10 mx-auto rounded-lg bg-[#171A21] border border-white/[0.08] flex items-center justify-center text-[#E4583B] mb-2">
                                    {isVimeo ? (
                                      <VimeoIcon className="w-5 h-5 text-[#1AB7EA]" />
                                    ) : (
                                      <Play className="w-5 h-5 fill-current" />
                                    )}
                                  </div>
                                  <span className="text-[11px] text-[#8E8A82]">
                                    {isVimeo ? 'Vimeo Placeholder' : 'Branded Placeholder'}
                                  </span>
                                </div>
                              )}

                              {isVimeo && (
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-medium bg-black/85 text-[#1AB7EA] border border-[#1AB7EA]/35 flex items-center space-x-1">
                                  <VimeoIcon className="w-3 h-3 fill-current" />
                                  <span>Vimeo</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="md:col-span-7 space-y-3">
                            <div>
                              <label className="block text-[11px] font-medium text-[#8E8A82] mb-1">
                                Upload Custom Thumbnail (Overrides Auto)
                              </label>
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <label className="flex-1 cursor-pointer inline-flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-[#F4F0E8] bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.08] hover:border-[#E4583B]/60 transition-colors">
                                  <Upload className="w-3.5 h-3.5 text-[#E4583B]" />
                                  <span>{videoUploadProgress[idx] ? `Uploading to Storage (${videoUploadProgress[idx]}%)...` : 'Upload Thumbnail File...'}</span>
                                  <input
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={(e) => handleFileUpload(e, idx)}
                                    className="hidden"
                                    disabled={Boolean(videoUploadProgress[idx])}
                                  />
                                </label>
                              </div>
                              {videoUploadProgress[idx] && (
                                <div className="w-full bg-[#0B0C0F] rounded-full h-1 mt-1">
                                  <div
                                    className="bg-[#E4583B] h-1 rounded-full transition-all"
                                    style={{ width: `${videoUploadProgress[idx]}%` }}
                                  />
                                </div>
                              )}
                            </div>

                            <div>
                              <label className="block text-[11px] font-medium text-[#8E8A82] mb-1">
                                Or Paste Image URL
                              </label>
                              <input
                                type="url"
                                value={vid.customThumbnailUrl || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateDraft(prev => ({
                                    ...prev,
                                    videos: prev.videos.map((v, i) => i === idx ? { ...v, customThumbnailUrl: val } : v)
                                  }));
                                }}
                                placeholder="https://example.com/thumbnail.jpg"
                                className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] font-mono focus:border-[#E4583B] focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Video Title in 3 languages (Optional) */}
                      <div>
                        <label className="block text-xs font-medium text-[#A7A298] mb-1.5">
                          Video Title (Optional)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Title (English)"
                            value={vid.title?.en || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateDraft(prev => ({
                                ...prev,
                                videos: prev.videos.map((v, i) => i === idx ? {
                                  ...v,
                                  title: { ...(v.title || { en: '', bn: '', ar: '' }), en: val }
                                } : v)
                              }));
                            }}
                            className="px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                          />

                          <input
                            type="text"
                            placeholder="শিরোনাম (বাংলা)"
                            value={vid.title?.bn || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateDraft(prev => ({
                                ...prev,
                                videos: prev.videos.map((v, i) => i === idx ? {
                                  ...v,
                                  title: { ...(v.title || { en: '', bn: '', ar: '' }), bn: val }
                                } : v)
                              }));
                            }}
                            className="px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                          />

                          <input
                            type="text"
                            dir="rtl"
                            placeholder="العنوان (العربية)"
                            value={vid.title?.ar || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateDraft(prev => ({
                                ...prev,
                                videos: prev.videos.map((v, i) => i === idx ? {
                                  ...v,
                                  title: { ...(v.title || { en: '', bn: '', ar: '' }), ar: val }
                                } : v)
                              }));
                            }}
                            className="px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Optional Description (EN / BN) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Short description / client note (EN)"
                          value={vid.description?.en || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft(prev => ({
                              ...prev,
                              videos: prev.videos.map((v, i) => i === idx ? {
                                ...v,
                                description: { ...(v.description || { en: '', bn: '', ar: '' }), en: val }
                              } : v)
                            }));
                          }}
                          className="px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="সংক্ষিপ্ত বিবরণ (বাংলা - ঐচ্ছিক)"
                          value={vid.description?.bn || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft(prev => ({
                              ...prev,
                              videos: prev.videos.map((v, i) => i === idx ? {
                                ...v,
                                description: { ...(v.description || { en: '', bn: '', ar: '' }), bn: val }
                              } : v)
                            }));
                          }}
                          className="px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: VIDEO EDITING - BEST WORK */}
          {activeTab === 'video-best' && (
            <BestWorkVideoEditor onNotify={showToast} />
          )}

          {/* TAB 6: CHANNELS */}
          {activeTab === 'channels' && (
            <div className="max-w-3xl space-y-6">
              <div className="pb-4 border-b border-white/[0.08]">
                <h2 className="text-lg font-semibold text-[#F4F0E8] mb-0.5">Channel Links</h2>
                <p className="text-xs text-[#8E8A82]">Connect your active YouTube, Facebook, Behance, or external portfolio channels</p>
              </div>
              <div className="space-y-4">
                {(draftPortfolio.channelLinks || []).map((item) => (
                  <div key={item.id} className="p-4 rounded-xl bg-[#171A21] border border-white/[0.08] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-[#F4F0E8]">{item.platform}</span>
                      <select
                        value={item.status}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          updateDraft(prev => ({
                            ...prev,
                            channelLinks: prev.channelLinks.map(c => c.id === item.id ? { ...c, status: val } : c)
                          }));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                      >
                        <option value="LINKED">LINKED</option>
                        <option value="UNLINKED">UNLINKED</option>
                      </select>
                    </div>

                    <input
                      type="text"
                      placeholder="URL Link (Leave empty if unlinked)"
                      value={item.url || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft(prev => ({
                          ...prev,
                          channelLinks: prev.channelLinks.map(c => c.id === item.id ? { ...c, url: val } : c)
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs font-mono text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CONTACT & SOCIAL LINKS */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <SocialLinksEditor />

              {/* Primary Email & Direct Contact Info */}
              <div className="p-6 rounded-2xl bg-[#171A21] border border-white/[0.08] space-y-4 max-w-4xl">
                <div className="flex items-center space-x-3 rtl:space-x-reverse pb-3 border-b border-white/[0.06]">
                  <div className="w-9 h-9 rounded-lg bg-[#121419] border border-white/[0.08] flex items-center justify-center text-[#E4583B]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#F4F0E8]">Direct Contact Information</h3>
                    <p className="text-xs text-[#8E8A82]">Email address and social links used for inquiries</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#A7A298] mb-1">Primary Email Address</label>
                    <input
                      type="email"
                      value={draftPortfolio.contact?.email || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft(prev => ({
                          ...prev,
                          contact: { ...(prev.contact || {}), email: val }
                        }));
                      }}
                      placeholder="yourname@gmail.com"
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] font-mono focus:border-[#E4583B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#A7A298] mb-1 flex items-center justify-between">
                      <span>Telegram (Direct Contact Link)</span>
                      <span className="text-[11px] text-[#38BDF8]">Get In Touch</span>
                    </label>
                    <input
                      type="url"
                      value={draftPortfolio.contact?.telegramUrl || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft(prev => ({
                          ...prev,
                          contact: { ...(prev.contact || {}), telegramUrl: val }
                        }));
                      }}
                      placeholder="https://t.me/sbmc3925"
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] font-mono focus:border-[#E4583B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#A7A298] mb-1 flex items-center justify-between">
                      <span>Facebook Profile URL</span>
                      <span className="text-[11px] text-[#6F6B64]">Leave empty to hide</span>
                    </label>
                    <input
                      type="url"
                      value={draftPortfolio.contact?.facebookUrl || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft(prev => ({
                          ...prev,
                          contact: { ...(prev.contact || {}), facebookUrl: val }
                        }));
                      }}
                      placeholder="https://www.facebook.com/..."
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] font-mono focus:border-[#E4583B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#A7A298] mb-1 flex items-center justify-between">
                      <span>YouTube Channel URL</span>
                      <span className="text-[11px] text-[#6F6B64]">Leave empty to hide</span>
                    </label>
                    <input
                      type="url"
                      value={draftPortfolio.contact?.youtubeUrl || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft(prev => ({
                          ...prev,
                          contact: { ...(prev.contact || {}), youtubeUrl: val }
                        }));
                      }}
                      placeholder="https://www.youtube.com/@..."
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] font-mono focus:border-[#E4583B] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#A7A298] mb-1 flex items-center justify-between">
                      <span>Behance Profile URL</span>
                      <span className="text-[11px] text-[#60A5FA]">Direct Profile</span>
                    </label>
                    <input
                      type="url"
                      value={draftPortfolio.contact?.behanceUrl || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft(prev => ({
                          ...prev,
                          contact: { ...(prev.contact || {}), behanceUrl: val }
                        }));
                      }}
                      placeholder="https://www.behance.net/jaberhosain"
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#F4F0E8] font-mono focus:border-[#E4583B] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Advice Form & Footer Text Editor */}
              <ContactFooterEditor />
            </div>
          )}

          {/* TAB 7: LEADS */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div>
                  <h2 className="text-lg font-semibold text-[#F4F0E8]">Received Advice &amp; Messages</h2>
                  <p className="text-xs text-[#8E8A82]">Private submissions from the Give Me Your Advice form.</p>
                </div>
                <button
                  onClick={loadLeadsData}
                  disabled={loadingLeads}
                  className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#D7D2C8] bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.08] hover:text-white cursor-pointer transition-colors"
                >
                  {loadingLeads ? 'Refreshing...' : 'Refresh List'}
                </button>
              </div>

              {leads.length === 0 ? (
                <div className="p-12 text-center text-[#8E8A82] text-sm rounded-xl bg-[#171A21] border border-white/[0.08]">
                  No messages received yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {leads.map((l) => (
                    <div key={l.id} className="p-5 rounded-xl bg-[#171A21] border border-white/[0.08] space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-sm text-[#F4F0E8]">{l.name}</h3>
                        <span className="text-xs font-mono text-[#E4583B]">{l.email}</span>
                      </div>
                      <p className="text-xs text-[#D7D2C8] bg-[#0B0C0F] p-3.5 rounded-lg border border-white/[0.06]">
                        {l.message}
                      </p>
                      <span className="text-[11px] text-[#6F6B64] font-mono block">
                        {new Date(l.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: GOOGLE SHEETS */}
          {activeTab === 'sheets' && (
            <div className="max-w-3xl space-y-6">
              <div className="pb-4 border-b border-white/[0.08]">
                <h2 className="text-lg font-semibold text-[#F4F0E8] mb-0.5">Google Sheets Webhook</h2>
                <p className="text-xs text-[#8E8A82]">Optionally connect your Google Sheet to receive automatic rows.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7A298] mb-1.5">Web App URL</label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={draftPortfolio.googleSheetWebhookUrl || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateDraft(prev => ({
                      ...prev,
                      googleSheetWebhookUrl: val
                    }));
                  }}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0B0C0F] border border-white/[0.08] text-xs font-mono text-[#F4F0E8] focus:border-[#E4583B] focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#D7D2C8]">Google Apps Script Code</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(appsScriptCode);
                      setCopiedScript(true);
                      setTimeout(() => setCopiedScript(false), 3000);
                    }}
                    className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-lg text-xs font-medium text-[#F4F0E8] bg-[#171A21] hover:bg-[#1E222B] border border-white/[0.08] cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedScript ? 'Copied to Clipboard!' : 'Copy Code'}</span>
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-[#0B0C0F] border border-white/[0.08] text-xs text-[#D7D2C8] font-mono overflow-x-auto max-h-56">
                  {appsScriptCode}
                </pre>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Reusable Delete Confirmation Dialog */}
      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.title}
        itemName={deleteConfirm.itemName}
        message={deleteConfirm.message}
        onConfirm={deleteConfirm.onConfirm}
        onCancel={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
