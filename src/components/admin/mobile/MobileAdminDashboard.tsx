import React, { useState, useEffect } from 'react';
import {
  Layers,
  FileText,
  Film,
  Share2,
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
  Mail,
  Lock,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Inbox,
  FileSpreadsheet,
  Check,
  Video,
  Image as ImageIcon,
  Sliders,
  GraduationCap,
  Wrench,
  Award,
  Globe,
  Download,
  RefreshCw,
  User
} from 'lucide-react';
import { usePortfolio } from '../../../context/PortfolioContext';
import { resolveAssetUrl } from '../../../utils/assetUrl';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from '../../../lib/firebase';
import { uploadMediaToStorage } from '../../../lib/mediaUpload';
import {
  ProjectItem,
  VideoShowcaseItem,
  Lead,
  ThemeId,
  ServiceItem,
  SkillCategory,
  AcademicRecord
} from '../../../types/portfolio';
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
import { ImageUploaderField } from '../ImageUploaderField';
import { ProjectGalleryManager } from '../ProjectGalleryManager';

interface MobileAdminDashboardProps {
  onBackToSite: () => void;
}

type MobileTab = 'overview' | AdminGroupId;
type SubSection = string | null;

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

  // Media states
  const [fetchingOgId, setFetchingOgId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

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
      <div className="min-h-screen bg-[#070A0C] text-neutral-100 flex flex-col justify-center items-center p-4 selection:bg-[#FF5722] selection:text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#141A20] border border-[#232B33] flex items-center justify-center font-bold text-xl text-white font-mono animate-pulse glow-orange-sm">
            <span>M</span>
            <span className="text-[#FF5722]">J</span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono text-neutral-400">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF5722]" />
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
      <div className="min-h-screen bg-[#070A0C] text-neutral-100 flex flex-col justify-between p-4 font-sans">
        {/* Top Header */}
        <div className="flex items-center justify-between pt-2 pb-6 border-b border-[#1A222B]">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <div className="w-9 h-9 rounded-xl bg-[#141A20] border border-[#232B33] flex items-center justify-center font-bold text-white font-mono">
              <span>M</span>
              <span className="text-[#FF5722]">J</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white font-mono tracking-wide">
                MD JABER HOSAIN
              </h1>
              <p className="text-[10px] text-neutral-400 font-mono">Mobile Admin Portal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onBackToSite}
            className="px-3 py-1.5 text-xs font-mono text-neutral-400 hover:text-white rounded-lg bg-[#141A20] border border-[#232B33] min-h-[44px] flex items-center justify-center"
          >
            Back to Site
          </button>
        </div>

        {/* Center Login Box */}
        <div className="my-auto py-6 max-w-sm mx-auto w-full">
          <div className="p-6 rounded-3xl bg-[#0F1419] border border-[#232B33] shadow-2xl space-y-5">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FF5722]/10 border border-[#FF5722]/30 text-[#FF5722] flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white">Admin Authentication</h2>
              <p className="text-xs text-neutral-400 font-mono">
                Sign in with your username or backup Gmail
              </p>
            </div>

            {currentUser && !isAdmin && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Access Restricted</p>
                  <p className="text-[11px] text-amber-200/80">
                    Logged in as {currentUser.email}, which is not the designated owner account.
                  </p>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="mt-2 text-xs font-mono underline text-amber-300 min-h-[44px] flex items-center"
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
                <label className="block text-xs font-mono text-neutral-300 mb-1.5 font-semibold">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="jabirbd"
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="w-full pl-9 pr-3 py-3 rounded-xl bg-[#070A0C] border border-[#232B33] text-sm text-white placeholder-neutral-600 focus:border-[#FF5722] focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-1.5 font-semibold">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-3 rounded-xl bg-[#070A0C] border border-[#232B33] text-sm text-white placeholder-neutral-600 focus:border-[#FF5722] focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-[#FF5722] hover:bg-[#F4511E] shadow-lg shadow-orange-900/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 min-h-[48px]"
              >
                {authLoading ? (
                  <span className="animate-spin text-sm">⌛</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div className="relative py-2 flex items-center justify-center">
              <div className="border-t border-[#232B33] w-full"></div>
              <span className="bg-[#0F1419] px-3 text-[11px] font-mono text-neutral-500 absolute">OR</span>
            </div>

            {/* Google Authentication (Matching Desktop) */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-neutral-200 bg-[#141A20] hover:bg-[#1A222B] border border-[#232B33] transition-colors flex items-center justify-center space-x-2 min-h-[48px]"
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
        <p className="text-[11px] text-center text-neutral-500 font-mono pb-2">
          Secure Mobile Admin &bull; Real Firebase Backend
        </p>
      </div>
    );
  }

  // ==========================================
  // 2. LIVE PREVIEW MODAL (Full Screen on Mobile)
  // ==========================================
  if (showLivePreview) {
    return (
      <div className="fixed inset-0 z-50 bg-[#070A0C] flex flex-col">
        {/* Floating Top Control */}
        <div className="p-3 bg-[#0B0F12]/95 border-b border-[#232B33] flex items-center justify-between backdrop-blur-xl shrink-0">
          <button
            type="button"
            onClick={() => {
              setShowLivePreview(false);
              setIsPreviewDraft(false);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#141A20] border border-[#232B33] text-xs font-mono font-bold text-white flex items-center space-x-1.5 min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 text-[#FF5722]" />
            <span>Return to Admin</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline">
              Draft Preview
            </span>
            <button
              type="button"
              onClick={handlePublishLive}
              disabled={publishing}
              className="px-3.5 py-2 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-xs font-mono font-bold text-white flex items-center space-x-1.5 shadow-lg shadow-orange-900/30 min-h-[44px]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{publishing ? 'Publishing...' : 'Publish'}</span>
            </button>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="flex-1 w-full h-full overflow-hidden bg-black relative">
          <iframe
            src="/"
            title="Live Preview"
            className="w-full h-full border-0"
          />
        </div>
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
            <div className="p-4 rounded-2xl bg-[#0F1419] border border-[#232B33] space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-300 font-semibold mb-1.5">
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
                  className="w-full px-3 py-2.5 rounded-xl bg-[#070A0C] border border-[#232B33] text-sm text-white font-mono focus:border-[#FF5722] focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 font-semibold mb-1.5">
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
                  className="w-full px-3 py-2.5 rounded-xl bg-[#070A0C] border border-[#232B33] text-sm text-white font-mono focus:border-[#FF5722] focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 font-semibold mb-1.5">
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
                  className="w-24 px-3 py-2.5 rounded-xl bg-[#070A0C] border border-[#232B33] text-sm text-white font-mono text-center tracking-widest focus:border-[#FF5722] focus:outline-none min-h-[44px]"
                />
              </div>
            </div>

            {/* Change Admin Password Card */}
            <div className="p-4 rounded-2xl bg-[#0F1419] border border-[#232B33] space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                  <KeyRound className="w-4 h-4 text-[#FF5722]" />
                  <span>Change Admin Password</span>
                </h3>
                <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                  Update password for your username login (minimum 10 characters).
                </p>
              </div>

              {passwordChangeMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs font-mono flex items-center space-x-2 ${
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
                  <label className="block text-xs font-mono text-neutral-300 font-semibold mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#070A0C] border border-[#232B33] text-sm text-white font-mono focus:border-[#FF5722] focus:outline-none min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 font-semibold mb-1">
                    New Password (min 10 chars)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={10}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="At least 10 characters"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#070A0C] border border-[#232B33] text-sm text-white font-mono focus:border-[#FF5722] focus:outline-none min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 font-semibold mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={10}
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#070A0C] border border-[#232B33] text-sm text-white font-mono focus:border-[#FF5722] focus:outline-none min-h-[44px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full py-3 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-white font-mono font-bold text-xs transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 min-h-[44px]"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{changingPassword ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </form>
            </div>

            {/* Session Safety & Inactivity Auto-Logout Card */}
            <div className="p-4 rounded-2xl bg-[#0F1419] border border-[#232B33] space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-[#FF5722]" />
                  <span>Session Safety & Auto-Logout</span>
                </h3>
                <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                  Off by default so you stay signed in permanently.
                </p>
              </div>
              <select
                value={autoLogoutMinutes}
                onChange={(e) => handleAutoLogoutChange(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-[#070A0C] border border-[#232B33] text-xs text-white font-mono focus:border-[#FF5722] focus:outline-none min-h-[44px]"
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
            <div className="p-4 rounded-2xl bg-[#0F1419] border border-[#232B33] space-y-4">
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
                className="w-full py-2.5 rounded-xl bg-[#141A20] hover:bg-[#1A222B] border border-[#232B33] text-xs font-mono font-semibold text-neutral-200 flex items-center justify-center space-x-2 min-h-[44px]"
              >
                <CheckCircle className="w-3.5 h-3.5 text-[#FF5722]" />
                <span>Also Apply This Photo to Hero Section</span>
              </button>

              <div>
                <label className="block text-xs font-mono text-neutral-300 font-semibold mb-1.5">
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
                  className="w-full px-3 py-2.5 rounded-xl bg-[#070A0C] border border-[#232B33] text-xs text-white font-mono focus:border-[#FF5722] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 font-semibold mb-1.5">
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
                  className="w-full px-3 py-2.5 rounded-xl bg-[#070A0C] border border-[#232B33] text-xs text-white font-mono focus:border-[#FF5722] focus:outline-none"
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
            <div className="p-4 rounded-2xl bg-[#0F1419] border border-[#232B33] space-y-4">
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
                className="w-full py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-xs font-mono font-bold text-white flex items-center justify-center space-x-2 min-h-[44px]"
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
              className="w-full py-3 rounded-xl bg-[#141A20] hover:bg-[#1A222B] border border-[#232B33] text-xs font-mono font-bold text-[#FF5722] flex items-center justify-center space-x-2 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>

            {(draftPortfolio.services || []).map((srv, idx) => (
              <div
                key={srv.id || idx}
                className="p-4 rounded-2xl bg-[#0F1419] border border-[#232B33] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#FF5722] font-bold">
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
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">
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
                    className="w-full px-3 py-2 rounded-xl bg-[#070A0C] border border-[#232B33] text-xs text-white font-mono min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">
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
                    className="w-full px-3 py-2 rounded-xl bg-[#070A0C] border border-[#232B33] text-xs text-white font-mono"
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
              className="w-full py-3 rounded-xl bg-[#141A20] hover:bg-[#1A222B] border border-[#232B33] text-xs font-mono font-bold text-[#FF5722] flex items-center justify-center space-x-2 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Skill Category</span>
            </button>

            {(draftPortfolio.skills || []).map((skill, idx) => (
              <div
                key={skill.id || idx}
                className="p-3.5 rounded-2xl bg-[#0F1419] border border-[#232B33] space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#FF5722] font-semibold">
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
                  <label className="block text-[10px] font-mono text-neutral-400 mb-1">
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
                    className="w-full px-2.5 py-2 rounded-xl bg-[#070A0C] border border-[#232B33] text-xs text-white font-mono min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-neutral-400 mb-1">
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
                    className="w-full px-2.5 py-2 rounded-xl bg-[#070A0C] border border-[#232B33] text-xs text-white font-mono min-h-[44px]"
                  />
                </div>
              </div>
            ))}

            <div className="pt-6 border-t border-[#1D232A]">
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
                  behanceUrl: 'https://www.behance.net/jaberhosain',
                  order: (draftPortfolio.projects?.length || 0) + 1,
                };
                updateDraft((prev) => ({
                  ...prev,
                  projects: [...(prev.projects || []), newProject],
                }));
                showToast('New graphic project created!');
              }}
              className="w-full py-3 rounded-xl bg-[#141A20] hover:bg-[#1A222B] border border-[#232B33] text-xs font-mono font-bold text-[#FF5722] flex items-center justify-center space-x-2 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Graphics Project</span>
            </button>

            {(draftPortfolio.projects || []).map((proj, idx) => (
              <div
                key={proj.id || idx}
                className="p-4 rounded-2xl bg-[#0F1419] border border-[#232B33] space-y-3"
              >
                {/* Header & Order Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-mono font-bold text-white">
                      #{idx + 1} {proj.title?.en || 'Untitled'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
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
                      className="p-2 text-neutral-400 hover:text-white disabled:opacity-30 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
                      className="p-2 text-neutral-400 hover:text-white disabled:opacity-30 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">
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
                    className="w-full px-3 py-2 rounded-xl bg-[#070A0C] border border-[#232B33] text-xs text-white font-mono min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">
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
                    className="w-full px-3 py-2 rounded-xl bg-[#070A0C] border border-[#232B33] text-xs text-white font-mono min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                    Behance Project Link (opens in Lightbox)
                  </label>
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
                    className="w-full px-3 py-2 rounded-xl bg-[#070A0C] border border-[#232B33] text-xs text-white font-mono min-h-[44px]"
                  />
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
              className="w-full py-3 rounded-xl bg-[#141A20] hover:bg-[#1A222B] border border-[#232B33] text-xs font-mono font-bold text-[#FF5722] flex items-center justify-center space-x-2 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Video</span>
            </button>

            {(draftPortfolio.videos || []).map((vid, idx) => (
              <div
                key={vid.id || idx}
                className="p-4 rounded-2xl bg-[#0F1419] border border-[#232B33] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white">
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
                      className="p-2 text-neutral-400 hover:text-white disabled:opacity-30 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
                      className="p-2 text-neutral-400 hover:text-white disabled:opacity-30 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
                    <label className="block text-[10px] font-mono text-neutral-400 mb-1">
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
                      className="w-full px-2.5 py-2 rounded-xl bg-[#070A0C] border border-[#232B33] text-xs text-[#FF5722] font-mono focus:outline-none min-h-[40px]"
                    >
                      <option value="vimeo">Vimeo</option>
                      <option value="youtube">YouTube</option>
                      <option value="facebook">Facebook</option>
                      <option value="direct">Direct Link</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 mb-1">
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
                      className="w-full px-2.5 py-2 rounded-xl bg-[#070A0C] border border-[#232B33] text-xs text-white font-mono min-h-[40px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">
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
                    className="w-full px-3 py-2 rounded-xl bg-[#070A0C] border border-[#232B33] text-xs text-white font-mono min-h-[44px]"
                  />
                </div>

                {/* Thumbnail Preview (if any) - object-contain */}
                {(vid.customThumbnailUrl || vid.thumbnailUrl) && (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#080B0D] border border-[#232B33] flex items-center justify-center">
                    <img
                      src={vid.customThumbnailUrl || vid.thumbnailUrl}
                      alt="Thumbnail preview"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 left-2 flex items-center space-x-1.5 bg-black/85 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono border border-[#232B33]">
                      {vid.customThumbnailUrl ? (
                        <span className="text-emerald-400">Custom Thumbnail</span>
                      ) : vid.videoType === 'vimeo' ? (
                        <span className="text-[#1AB7EA] flex items-center gap-1">
                          <VimeoIcon className="w-3 h-3" /> Vimeo Auto Thumbnail
                        </span>
                      ) : (
                        <span className="text-neutral-300">Auto Thumbnail</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Reset to Automatic Thumbnail Button (Mobile) */}
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
                    className="w-full py-2 px-3 rounded-xl bg-amber-950/40 hover:bg-amber-950/60 border border-amber-500/30 text-xs font-mono font-semibold text-amber-300 flex items-center justify-center space-x-1.5 min-h-[44px]"
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
                    className="flex-1 py-2 px-3 rounded-xl bg-[#141A20] hover:bg-[#1A222B] border border-[#232B33] text-xs font-mono font-semibold text-neutral-200 flex items-center justify-center space-x-1.5 min-h-[44px]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FF5722]" />
                    <span>{fetchingOgId === vid.id ? 'Fetching...' : 'Re-fetch Thumbnail'}</span>
                  </button>

                  <label className="py-2 px-3 rounded-xl bg-[#141A20] hover:bg-[#1A222B] border border-[#232B33] text-xs font-mono font-semibold text-neutral-200 flex items-center justify-center space-x-1.5 cursor-pointer min-h-[44px]">
                    <Upload className="w-3.5 h-3.5 text-[#FF5722]" />
                    <span>Upload Thumbnail</span>
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
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">
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
                    className="w-full px-3 py-2 rounded-xl bg-[#070A0C] border border-[#232B33] text-xs text-white font-mono min-h-[44px]"
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
            <div className="p-4 rounded-2xl bg-[#0F1419] border border-[#232B33] space-y-3">
              <h3 className="text-sm font-bold text-white font-mono">Channel Links</h3>
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">
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
                  className="w-full px-3 py-2 rounded-xl bg-[#070A0C] border border-[#232B33] text-xs text-white font-mono min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">
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
                  className="w-full px-3 py-2 rounded-xl bg-[#070A0C] border border-[#232B33] text-xs text-white font-mono min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">
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
                  className="w-full px-3 py-2 rounded-xl bg-[#070A0C] border border-[#232B33] text-xs text-white font-mono min-h-[44px]"
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
            <div className="p-4 rounded-2xl bg-[#0F1419] border border-[#232B33] space-y-4">
              <h3 className="text-sm font-bold text-white font-mono">Direct Contact Information</h3>
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">
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
                  className="w-full px-3 py-2 rounded-xl bg-[#070A0C] border border-[#232B33] text-xs text-white font-mono min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Facebook URL</label>
                <input
                  type="text"
                  value={draftPortfolio.contact?.facebookUrl || ''}
                  onChange={(e) => updateDraft((prev) => ({
                    ...prev,
                    contact: { ...(prev.contact || {}), facebookUrl: e.target.value }
                  }))}
                  placeholder="https://www.facebook.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-[#070A0C] border border-[#232B33] text-xs text-white font-mono min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Telegram URL</label>
                <input
                  type="text"
                  value={draftPortfolio.contact?.telegramUrl || ''}
                  onChange={(e) => updateDraft((prev) => ({
                    ...prev,
                    contact: { ...(prev.contact || {}), telegramUrl: e.target.value }
                  }))}
                  placeholder="https://t.me/..."
                  className="w-full px-3 py-2 rounded-xl bg-[#070A0C] border border-[#232B33] text-xs text-white font-mono min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Behance URL</label>
                <input
                  type="text"
                  value={draftPortfolio.contact?.behanceUrl || ''}
                  onChange={(e) => updateDraft((prev) => ({
                    ...prev,
                    contact: { ...(prev.contact || {}), behanceUrl: e.target.value }
                  }))}
                  placeholder="https://www.behance.net/..."
                  className="w-full px-3 py-2 rounded-xl bg-[#070A0C] border border-[#232B33] text-xs text-white font-mono min-h-[44px]"
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

            <div className="p-4 rounded-2xl bg-[#0F1419] border border-[#232B33] space-y-3">
              <h3 className="text-sm font-bold text-white font-mono">Direct Contact Information</h3>
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">
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
                  className="w-full px-3 py-2 rounded-xl bg-[#070A0C] border border-[#232B33] text-xs text-white font-mono min-h-[44px]"
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
            <div className="p-4 rounded-2xl bg-[#0F1419] border border-[#232B33] space-y-3">
              <h3 className="text-sm font-bold text-white font-mono">Data Export & Backup</h3>
              <p className="text-xs text-neutral-400 font-mono">Download complete portfolio JSON backup</p>
              <button
                type="button"
                onClick={() => {
                  exportPortfolioBackup();
                  showToast('Backup JSON downloaded successfully!');
                }}
                className="w-full py-3 rounded-xl bg-[#141A20] hover:bg-[#1A222B] border border-[#232B33] text-xs font-mono font-bold text-white flex items-center justify-center space-x-2 min-h-[44px]"
              >
                <Download className="w-4 h-4 text-[#FF5722]" />
                <span>Download Complete JSON Backup</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F1419] border border-[#232B33] space-y-3">
              <h3 className="text-sm font-bold text-white font-mono">Draft & Deployment Controls</h3>
              <button
                type="button"
                onClick={handlePublishLive}
                disabled={publishing}
                className="w-full py-3.5 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-xs font-mono font-bold text-white flex items-center justify-center space-x-2 shadow-lg shadow-orange-900/30 min-h-[48px]"
              >
                <Send className="w-4 h-4" />
                <span>{publishing ? 'Publishing Live...' : 'Publish to Live Site'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPreviewDraft(true);
                  setShowLivePreview(true);
                }}
                className="w-full py-3 rounded-xl bg-[#141A20] border border-[#232B33] text-xs font-mono font-bold text-white flex items-center justify-center space-x-2 min-h-[44px]"
              >
                <Eye className="w-4 h-4 text-[#FF5722]" />
                <span>Launch Mobile Preview</span>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full py-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs font-mono font-bold text-rose-400 hover:text-rose-300 flex items-center justify-center space-x-2 min-h-[44px]"
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
              <span className="text-xs font-mono text-neutral-400">
                {leads.length} Inquiries Received
              </span>
              <button
                type="button"
                onClick={loadLeadsData}
                disabled={loadingLeads}
                className="px-3 py-1.5 rounded-xl bg-[#141A20] border border-[#232B33] text-xs font-mono text-[#FF5722] min-h-[44px] flex items-center"
              >
                {loadingLeads ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {leads.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#0F1419] border border-[#232B33]">
                <Inbox className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                <p className="text-xs text-neutral-400 font-mono">No contact submissions yet</p>
              </div>
            ) : (
              leads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 rounded-2xl bg-[#0F1419] border border-[#232B33] space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{lead.name}</h4>
                      <p className="text-xs text-neutral-400 font-mono">{lead.email}</p>
                    </div>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                        lead.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : lead.status === 'contacted'
                          ? 'bg-sky-500/20 text-sky-400'
                          : 'bg-[#FF5722]/20 text-[#FF5722]'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 bg-[#070A0C] p-2.5 rounded-xl border border-[#232B33]">
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
                      className="px-2.5 py-1.5 rounded-lg bg-[#141A20] text-xs font-mono text-neutral-300 min-h-[44px] flex items-center"
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
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-xs font-mono text-emerald-400 min-h-[44px] flex items-center"
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
            <div className="p-4 rounded-2xl bg-[#0F1419] border border-[#232B33] space-y-3">
              <h3 className="text-sm font-bold text-white font-mono">Google Sheets Webhook</h3>
              <p className="text-xs text-neutral-400 font-mono">
                Enter your Google Apps Script Web App URL to receive inquiries directly into your
                spreadsheet.
              </p>
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">
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
                  className="w-full px-3 py-2 rounded-xl bg-[#070A0C] border border-[#232B33] text-xs text-white font-mono min-h-[44px]"
                />
              </div>
            </div>
          </div>
        );

      // ----------------------------------------
      // THEME COLORS (Exact desktop features only!)
      // ----------------------------------------
      case 'theme-colors':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#0F1419] border border-[#232B33] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-mono">Brand Colors</h3>
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
                  className="text-xs font-mono text-[#FF5722] flex items-center space-x-1 min-h-[44px]"
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
                  className="p-3 rounded-xl bg-[#070A0C] border border-[#232B33] flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-mono text-white font-semibold block">
                      {c.label}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-500 uppercase">
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
      // THEME FONTS (Exact desktop features only!)
      // ----------------------------------------
      case 'theme-fonts':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#0F1419] border border-[#232B33] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-mono">Typography Selection</h3>
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
                  className="text-xs font-mono text-[#FF5722] flex items-center space-x-1 min-h-[44px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 font-semibold mb-1.5">
                  বাংলা ফন্ট (Bangla Font)
                </label>
                <select
                  value={themeFonts.bangla}
                  onChange={(e) => updateThemeFont('bangla', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#070A0C] border border-[#232B33] text-sm text-white font-mono focus:border-[#FF5722] focus:outline-none min-h-[44px]"
                >
                  <option value="Li Ador Noirrit">Li Ador Noirrit (আদর নৈঋত - Default Locked)</option>
                  <option value="Hind Siliguri">Hind Siliguri (হিন্দ শিলিগুড়ি)</option>
                  <option value="Noto Sans Bengali">Noto Sans Bengali</option>
                  <option value="Tiro Bangla">Tiro Bangla</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 font-semibold mb-1.5">
                  English Font
                </label>
                <select
                  value={themeFonts.english}
                  onChange={(e) => updateThemeFont('english', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#070A0C] border border-[#232B33] text-sm text-white font-mono focus:border-[#FF5722] focus:outline-none min-h-[44px]"
                >
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans (Default Locked)</option>
                  <option value="Space Grotesk">Space Grotesk</option>
                  <option value="Inter">Inter</option>
                  <option value="Outfit">Outfit</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 font-semibold mb-1.5">
                  الخط العربي (Arabic Font)
                </label>
                <select
                  value={themeFonts.arabic}
                  onChange={(e) => updateThemeFont('arabic', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#070A0C] border border-[#232B33] text-sm text-white font-mono focus:border-[#FF5722] focus:outline-none min-h-[44px]"
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
      // VISITOR THEME SELECTOR (Exact desktop features only!)
      // ----------------------------------------
      case 'theme-visitor':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#0F1419] border border-[#232B33] space-y-3">
              <h3 className="text-sm font-bold text-white font-mono">Visitor Theme Selector</h3>
              <p className="text-xs text-neutral-400 font-mono">
                Choose which themes visitors can preview in the website navbar dropdown
              </p>

              <div className="space-y-2 pt-1">
                {[
                  { id: 'dark' as ThemeId, label: 'Dark (Default Locked)', dot: '#FF5722', locked: true },
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
                          ? 'bg-[#141A20] border-[#FF5722]/50'
                          : 'bg-[#070A0C] border-[#232B33] opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/30"
                          style={{ backgroundColor: th.dot }}
                        />
                        <span className="text-xs font-mono text-white font-semibold">{th.label}</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border ${
                          isEnabled
                            ? 'bg-[#FF5722] border-[#FF5722] text-white'
                            : 'border-[#333D48]'
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

      default:
        return null;
    }
  };

  // ==========================================
  // 4. MAIN MOBILE ADMIN LAYOUT
  // ==========================================
  return (
    <div className="min-h-screen bg-[#070A0C] text-neutral-100 flex flex-col font-sans pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-4 right-4 z-50 animate-in fade-in slide-in-from-top duration-200">
          <div
            className={`p-3.5 rounded-2xl shadow-2xl border text-xs font-mono font-semibold flex items-center space-x-2.5 ${
              toastType === 'success'
                ? 'bg-[#141A20]/95 border-emerald-500/50 text-emerald-300'
                : 'bg-[#141A20]/95 border-rose-500/50 text-rose-300'
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
      <header className="sticky top-0 z-40 bg-[#0B0F12]/95 border-b border-[#1A222B] px-4 py-3 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
          {activeSection ? (
            <button
              type="button"
              onClick={() => setActiveSection(null)}
              className="p-2 -ml-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-[#FF5722]" />
            </button>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-[#141A20] border border-[#232B33] flex items-center justify-center font-bold text-xs text-white font-mono">
              <span>M</span>
              <span className="text-[#FF5722]">J</span>
            </div>
          )}

          <div>
            <h2 className="text-xs font-bold text-white font-mono uppercase tracking-wide">
              {activeSection
                ? activeSection.replace('-', ' ')
                : activeTab.toUpperCase()}
            </h2>
            <div className="flex items-center space-x-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  hasUnsavedChanges ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                }`}
              />
              <span className="text-[10px] text-neutral-400 font-mono">
                {hasUnsavedChanges ? 'Unsaved Changes' : 'All Saved'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {/* Live Preview Button */}
          <button
            type="button"
            onClick={() => {
              setIsPreviewDraft(true);
              setShowLivePreview(true);
            }}
            className="p-2 rounded-xl bg-[#141A20] border border-[#232B33] text-neutral-300 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Live Preview on Mobile"
          >
            <Eye className="w-4 h-4 text-[#FF5722]" />
          </button>

          {/* Sticky Publish Button */}
          <button
            type="button"
            onClick={handlePublishLive}
            disabled={publishing}
            className="px-3.5 py-2 rounded-xl font-bold font-mono text-xs text-white bg-[#FF5722] hover:bg-[#F4511E] shadow-lg shadow-orange-900/30 flex items-center space-x-1.5 disabled:opacity-50 min-h-[44px]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{publishing ? 'Publishing...' : 'Publish'}</span>
          </button>
        </div>
      </header>

      {/* Real Error Notification & Retry Banner */}
      {(saveError || publishError) && (
        <div className="bg-rose-950/90 border-b border-rose-800/80 px-4 py-3 backdrop-blur-md">
          <div className="max-w-lg mx-auto flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-rose-200 font-mono">
                {saveError ? 'Draft Save Failed' : 'Publish Failed'}
              </p>
              <p className="text-[11px] text-rose-300 font-mono break-words mt-0.5">
                {saveError || publishError}
              </p>
              {(saveError || publishError)?.includes('securetoken.googleapis.com') && (
                <div className="mt-1">
                  <a
                    href="https://console.developers.google.com/apis/api/securetoken.googleapis.com/overview?project=142615067158"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-orange-400 font-bold text-[11px] hover:text-orange-300"
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
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-mono font-bold flex items-center space-x-1 min-h-[36px]"
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
                    className="px-3 py-1.5 rounded-lg bg-[#FF5722] hover:bg-[#F4511E] text-white text-[11px] font-mono font-bold flex items-center space-x-1 min-h-[36px]"
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
                  className="px-2.5 py-1.5 rounded-lg bg-[#141A20] text-neutral-400 hover:text-white text-[11px] font-mono min-h-[36px]"
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
                className="w-full py-3.5 rounded-2xl bg-[#141A20] hover:bg-[#1A222B] border border-[#FF5722]/50 text-white font-mono font-bold text-xs flex items-center justify-center space-x-2 shadow-xl min-h-[48px]"
              >
                <Save className="w-4 h-4 text-[#FF5722]" />
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
                <div className="p-4 rounded-3xl bg-[#0F1419] border border-[#232B33] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white font-mono">Mobile Control Center</h3>
                      <p className="text-xs text-neutral-400 font-mono">
                        Logged in as sbmc.3925@gmail.com
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="p-2 rounded-xl bg-[#141A20] text-neutral-400 hover:text-white border border-[#232B33] min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="p-3 rounded-2xl bg-[#070A0C] border border-[#232B33] text-center">
                      <span className="text-lg font-bold font-mono text-[#FF5722]">
                        {draftPortfolio.projects?.length || 0}
                      </span>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5">Projects</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#070A0C] border border-[#232B33] text-center">
                      <span className="text-lg font-bold font-mono text-[#FF5722]">
                        {draftPortfolio.videos?.length || 0}
                      </span>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5">Videos</p>
                    </div>
                    <div
                      onClick={() => setActiveSection('leads')}
                      className="p-3 rounded-2xl bg-[#070A0C] border border-[#232B33] text-center cursor-pointer"
                    >
                      <span className="text-lg font-bold font-mono text-emerald-400">
                        {leads.length || 0}
                      </span>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5">Leads</p>
                    </div>
                  </div>

                  {/* One-Tap Live Preview Launcher */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsPreviewDraft(true);
                      setShowLivePreview(true);
                    }}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF5722]/20 to-[#FF7043]/10 border border-[#FF5722]/40 text-xs font-mono font-bold text-white flex items-center justify-center space-x-2 min-h-[48px]"
                  >
                    <Eye className="w-4 h-4 text-[#FF5722]" />
                    <span>Launch Live Phone Preview</span>
                  </button>

                  {/* Backup JSON Button */}
                  <button
                    type="button"
                    onClick={() => {
                      exportPortfolioBackup();
                      showToast('Backup JSON downloaded successfully!');
                    }}
                    className="w-full py-2.5 rounded-2xl bg-[#141A20] hover:bg-[#1A222B] border border-[#232B33] text-xs font-mono text-neutral-300 hover:text-white flex items-center justify-center space-x-2 min-h-[44px]"
                  >
                    <Download className="w-4 h-4 text-[#FF5722]" />
                    <span>Download Backup JSON</span>
                  </button>
                </div>

                {/* 8 Admin Groups Grid */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-mono uppercase text-neutral-400 tracking-wider px-1">
                    Management Groups
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
                          className="p-3.5 rounded-2xl bg-[#0F1419] hover:bg-[#141A20] border border-[#232B33] hover:border-[#FF5722]/50 text-left transition-all min-h-[56px] flex items-center space-x-3"
                        >
                          <div className="w-9 h-9 rounded-xl bg-[#141A20] border border-[#232B33] text-[#FF5722] flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold font-mono text-white truncate">{group.label}</p>
                              <span className="text-[10px] text-neutral-500 font-mono ml-2 shrink-0">
                                {group.subSections.length} items
                              </span>
                            </div>
                            <p className="text-[10px] text-neutral-400 font-mono truncate mt-0.5">{group.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Theme Live Edit Note for Mobile */}
                <div className="p-3.5 rounded-2xl bg-[#0F1419] border border-[#232B33] space-y-1 mt-2">
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-neutral-300">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF5722]" />
                    <span>Theme Live Edit</span>
                    <span className="text-[9px] uppercase tracking-wider bg-[#FF5722]/15 text-[#FF5722] px-1.5 py-0.5 rounded font-mono font-bold">Desktop</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-mono leading-relaxed">
                    Use desktop for Live Edit (click & customize visual layout with live side panel).
                  </p>
                </div>

                {/* Back to Public Site */}
                <button
                  type="button"
                  onClick={onBackToSite}
                  className="w-full py-3 rounded-2xl bg-[#0F1419] border border-[#232B33] text-xs font-mono text-neutral-300 hover:text-white flex items-center justify-center space-x-2 min-h-[48px] mt-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Exit Admin & Return to Site</span>
                </button>
              </div>
            )}

            {/* GROUP SUB-SECTIONS (When any of the 8 groups is active) */}
            {activeTab !== 'overview' && (() => {
              const currentGroup = ADMIN_GROUPS.find((g) => g.id === activeTab);
              if (!currentGroup) return null;
              const GroupIcon = currentGroup.icon;

              return (
                <div className="space-y-3">
                  {/* Group Header & Back Navigation */}
                  <div className="flex items-center justify-between pb-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('overview')}
                      className="px-3 py-1.5 rounded-xl bg-[#0F1419] hover:bg-[#141A20] border border-[#232B33] text-xs font-mono text-neutral-300 hover:text-white flex items-center space-x-1.5 min-h-[40px]"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-[#FF5722]" />
                      <span>All Groups</span>
                    </button>
                    <span className="text-[11px] font-mono text-neutral-500">
                      {currentGroup.subSections.length} Sub-sections
                    </span>
                  </div>

                  {/* Group Banner */}
                  <div className="p-4 rounded-2xl bg-[#0F1419] border border-[#232B33] flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FF5722]/10 border border-[#FF5722]/30 text-[#FF5722] flex items-center justify-center shrink-0">
                      <GroupIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white font-mono">{currentGroup.label}</h3>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">{currentGroup.desc}</p>
                    </div>
                  </div>

                  {/* Sub-sections list */}
                  <div className="space-y-2.5">
                    {currentGroup.subSections.map((sec) => (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => setActiveSection(sec.id)}
                        className="w-full p-4 rounded-2xl bg-[#0F1419] hover:bg-[#141A20] border border-[#232B33] hover:border-[#FF5722]/40 text-left flex items-center justify-between transition-colors min-h-[52px]"
                      >
                        <div className="pr-3 flex-1 min-w-0">
                          <h4 className="text-xs font-bold font-mono text-white">{sec.label}</h4>
                          {sec.desc && (
                            <p className="text-[11px] text-neutral-400 font-mono mt-0.5 line-clamp-1">{sec.desc}</p>
                          )}
                        </div>
                        <span className="text-[#FF5722] text-xs font-mono shrink-0">&rarr;</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </main>

      {/* Sticky Bottom Tab Bar - 8 Groups + Overview */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F12]/95 border-t border-[#1A222B] backdrop-blur-xl px-2 py-1.5">
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            type="button"
            onClick={() => {
              setActiveTab('overview');
              setActiveSection(null);
            }}
            className={`px-3 py-1.5 rounded-xl flex flex-col items-center justify-center space-y-0.5 transition-colors shrink-0 min-w-[56px] min-h-[44px] ${
              activeTab === 'overview' && !activeSection
                ? 'bg-[#FF5722]/20 text-[#FF5722] border border-[#FF5722]/40 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="text-[9px] font-mono tracking-wider">Home</span>
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
                className={`px-2.5 py-1.5 rounded-xl flex flex-col items-center justify-center space-y-0.5 transition-colors shrink-0 min-w-[62px] min-h-[44px] ${
                  isActive
                    ? 'bg-[#FF5722]/20 text-[#FF5722] border border-[#FF5722]/40 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <GrpIcon className="w-4 h-4" />
                <span className="text-[9px] font-mono tracking-wider truncate max-w-[68px]">
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
