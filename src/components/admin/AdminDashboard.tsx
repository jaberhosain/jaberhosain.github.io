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
  FileSpreadsheet, 
  Inbox, 
  Layers, 
  Film, 
  User as UserIcon, 
  Share2, 
  Sliders, 
  Copy, 
  GraduationCap,
  ArrowLeft,
  KeyRound,
  Mail,
  Lock,
  ArrowUp,
  ArrowDown,
  Upload,
  RefreshCw,
  Image as ImageIcon,
  Facebook,
  Youtube,
  Play,
  Palette,
  Sparkles,
  Wrench,
  Award,
  Globe,
  Download,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup, 
  googleProvider, 
  auth, 
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from '../../lib/firebase';
import { ProjectItem, Lead, VideoShowcaseItem, ServiceItem, SkillCategory } from '../../types/portfolio';
import { ImageUploaderField } from './ImageUploaderField';
import { ThemeEditor } from './ThemeEditor';
import { EducationEditor } from './EducationEditor';
import { HeroEditor } from './HeroEditor';
import { SocialLinksEditor } from './SocialLinksEditor';
import { WorkflowEditor } from './WorkflowEditor';
import { ContactFooterEditor } from './ContactFooterEditor';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { extractYouTubeId } from '../VideoModal';
import { uploadMediaToStorage } from '../../lib/mediaUpload';
import { 
  extractVimeoInfo, 
  detectVideoType, 
  fetchVimeoMetadata, 
  fetchVideoAutoMetadata,
  VimeoIcon 
} from '../../lib/videoUtils';
import { BestWorkGraphicEditor } from './BestWorkGraphicEditor';
import { BestWorkVideoEditor } from './BestWorkVideoEditor';
import { ADMIN_GROUPS, AdminGroupId } from './adminNavigation';
import { ThemeLiveEditView } from './liveEdit/ThemeLiveEditView';

// Helper to map activeTab to its parent AdminGroupId
export const getGroupFromTab = (tab: string): AdminGroupId => {
  switch (tab) {
    case 'hero':
    case 'about':
      return 'profile';
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
): 'theme' | 'branding' | 'hero' | 'about' | 'services' | 'skills' | 'education' | 'projects' | 'graphic-best' | 'videos' | 'video-best' | 'channels' | 'contact' | 'leads' | 'sheets' => {
  switch (subId) {
    case 'hero': return 'hero';
    case 'about':
    case 'photo': return 'about';
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
    'theme' | 'branding' | 'hero' | 'about' | 'services' | 'skills' | 'education' | 'projects' | 'graphic-best' | 'videos' | 'video-best' | 'channels' | 'contact' | 'leads' | 'sheets'
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
    const newVideo: VideoShowcaseItem = {
      id: 'fb-vid-' + Date.now(),
      title: { en: '', bn: '', ar: '' },
      description: { en: '', bn: '', ar: '' },
      videoType: 'facebook',
      videoUrl: '',
      thumbnailUrl: '',
      customThumbnailUrl: '',
      order: (draftPortfolio.videos?.length || 0) + 1
    };
    updateDraft(prev => ({
      ...prev,
      videos: [...(prev.videos || []), newVideo]
    }));
    showToast('New video slot added. Enter URL and configure thumbnail.');
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

  // If not logged in or unauthorized: SHOW ONLY THE SECURE LOGIN SCREEN
  if (!currentUser || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#070A0C] text-neutral-100 flex flex-col justify-center items-center p-4 selection:bg-[#FF5722] selection:text-white">
        
        {/* Subtle ambient lighting */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-[#FF5722]/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="w-full max-w-md bg-[#0F1419] border border-[#232B33] rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
          
          {/* Brand header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#141A20] border border-[#232B33] flex items-center justify-center font-bold text-xl text-white font-mono mb-4 glow-orange-sm">
              <span>M</span>
              <span className="text-[#FF5722]">J</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-wider uppercase mb-1">
              Admin Portal
            </h1>
            <p className="text-xs text-neutral-400 font-mono">
              Sign in with your owner credentials to manage site content.
            </p>
          </div>

          {/* Access Warning if signed in with non-owner account */}
          {currentUser && !isAdmin && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs mb-6 space-y-2">
              <div className="font-bold flex items-center space-x-1.5 rtl:space-x-reverse">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Unauthorized User</span>
              </div>
              <p>
                Signed in as <span className="font-mono text-white">{currentUser.email}</span>. Only the verified site owner (<span className="font-mono text-white">sbmc.3925@gmail.com</span>) has administrative rights.
              </p>
              <button
                onClick={handleSignOut}
                className="text-xs text-white underline hover:text-[#FF5722]"
              >
                Sign out and use owner account
              </button>
            </div>
          )}

          {/* Error notice */}
          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs mb-6 flex items-start space-x-2.5 rtl:space-x-reverse">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Username + Password Form (Auto-maps to username@jabir.internal) */}
          <form onSubmit={handleUsernamePasswordAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5 font-semibold">
                Username or Email
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="jabirbd"
                  className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 rounded-xl bg-[#141A20] border border-[#232B33] text-sm text-white focus:outline-none focus:border-[#FF5722] font-mono transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5 font-semibold">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 rounded-xl bg-[#141A20] border border-[#232B33] text-sm text-white focus:outline-none focus:border-[#FF5722] font-mono transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl font-bold font-mono text-xs uppercase tracking-wider text-white bg-[#FF5722] hover:bg-[#F4511E] glow-orange transition-all flex items-center justify-center space-x-2 rtl:space-x-reverse disabled:opacity-50 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>{authLoading ? 'Verifying...' : 'Sign In as Admin'}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#232B33]" /></div>
            <span className="relative px-3 text-[10px] font-mono uppercase tracking-widest bg-[#0F1419] text-neutral-500">Or continue with</span>
          </div>

          {/* Backup Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={authLoading}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-neutral-200 bg-[#141A20] hover:bg-[#1A222B] border border-[#232B33] hover:border-neutral-500 transition-all flex items-center justify-center space-x-2 rtl:space-x-reverse cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-[#FF5722]" />
            <span>Sign In with Google</span>
          </button>

          {/* Back to public site button */}
          <div className="mt-6 pt-4 border-t border-[#232B33] text-center">
            <button
              onClick={onBackToSite}
              className="inline-flex items-center space-x-1.5 rtl:space-x-reverse text-xs font-mono text-neutral-400 hover:text-[#FF5722] transition-colors"
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
    <div className="min-h-screen bg-[#070A0C] text-neutral-100 flex flex-col selection:bg-[#FF5722] selection:text-white">
      
      {/* Top Header Toolbar */}
      <header className="sticky top-0 z-40 bg-[#0F1419]/90 backdrop-blur-xl border-b border-[#232B33] px-6 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-9 h-9 rounded-xl bg-[#FF5722] text-white flex items-center justify-center font-bold font-mono shadow-md">
            MJ
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2 rtl:space-x-reverse">
              <span>{ui.admin.title}</span>
              <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                OWNER AUTHENTICATED
              </span>
            </h1>
            <p className="text-xs text-neutral-400 font-mono">
              Logged in as <span className="text-neutral-200 font-semibold">{loggedInLabel}</span>
            </p>
          </div>
        </div>

        {/* Actions: Save Draft, Preview, Publish Live, Back to site, Logout */}
        <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
          {/* Backup & Export JSON */}
          <button
            onClick={exportPortfolioBackup}
            className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white bg-[#141A20] hover:bg-[#1E2630] border border-[#232B33] transition-all"
            title="Download complete JSON backup of portfolio content"
          >
            <Download className="w-3.5 h-3.5 text-[#FF5722]" />
            <span className="hidden md:inline">Backup JSON</span>
          </button>

          {/* Save Draft */}
          <button
            onClick={handleSaveDraft}
            disabled={savingDraft || publishing}
            className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-200 bg-[#141A20] hover:bg-[#1E2630] border border-[#232B33] transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-[#FF5722]" />
            <span className="hidden sm:inline">{savingDraft ? 'Saving...' : ui.admin.saveDraft}</span>
          </button>

          {/* Preview Toggle */}
          <button
            onClick={() => setIsPreviewDraft(!isPreviewDraft)}
            className={`inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isPreviewDraft
                ? 'bg-[#FF5722] text-white border-[#FF5722]'
                : 'bg-[#141A20] text-neutral-300 border-[#232B33] hover:border-neutral-500'
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
            className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF5722] hover:bg-[#F4511E] glow-orange-sm transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{publishing ? ui.admin.publishing : ui.admin.publishLive}</span>
          </button>

          {/* View Website */}
          <button
            onClick={onBackToSite}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
            title="View Public Website"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* LOGOUT BUTTON */}
          <button
            onClick={handleSignOut}
            className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/30 border border-rose-500/30 hover:bg-rose-950/50 transition-colors"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Save or Publish Error Banner with Retry Button */}
      {(saveError || publishError) && (
        <div className="px-6 py-3 bg-rose-950/90 text-rose-200 border-b border-rose-500/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold">Error: </span>
              <span>{saveError || publishError}</span>
              {(saveError || publishError)?.includes('securetoken.googleapis.com') && (
                <div className="mt-1">
                  <a
                    href="https://console.developers.google.com/apis/api/securetoken.googleapis.com/overview?project=142615067158"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-orange-400 font-bold hover:text-orange-300"
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
                className="px-3 py-1 rounded-lg bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold font-mono text-xs transition-colors"
              >
                {savingDraft ? 'Retrying...' : 'Retry Save Draft'}
              </button>
            )}
            {publishError && (
              <button
                type="button"
                onClick={handlePublishLive}
                disabled={publishing}
                className="px-3 py-1 rounded-lg bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold font-mono text-xs transition-colors"
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
              className="text-xs text-neutral-400 hover:text-white underline ml-2"
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
              ? 'bg-emerald-950/80 text-emerald-300 border-b border-emerald-500/30'
              : 'bg-rose-950/80 text-rose-300 border-b border-rose-500/30'
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
        
        {/* Grouped Navigation Sidebar (Single source of truth from adminNavigation.ts) */}
        <div className="w-full md:w-72 bg-[#0F1419] border border-[#232B33] rounded-3xl p-3.5 flex flex-col space-y-1.5 shrink-0 h-fit">
          <div className="px-3 py-2 border-b border-[#232B33] mb-1 flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-neutral-400 font-bold tracking-wider">
              Management Groups
            </span>
            <span className="text-[10px] font-mono text-neutral-500 bg-[#141A20] px-2 py-0.5 rounded-full border border-[#232B33]">
              8 Groups
            </span>
          </div>

          <div className="space-y-1">
            {ADMIN_GROUPS.map((group) => {
              const GroupIcon = group.icon;
              const isExpanded = expandedGroup === group.id;
              const isGroupActive = getGroupFromTab(activeTab) === group.id;

              return (
                <div key={group.id} className="rounded-2xl transition-all">
                  {/* Group Header Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!isExpanded) {
                        setExpandedGroup(group.id);
                        setActiveTab(getTabFromSubSection(group.subSections[0].id) as any);
                      } else {
                        // Keep active group expanded
                        setExpandedGroup(group.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isGroupActive
                        ? 'bg-[#182029] text-white border border-[#2F3A46] shadow-sm'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 rtl:space-x-reverse min-w-0">
                      <div className={`p-1.5 rounded-lg shrink-0 ${isGroupActive ? 'text-[#FF5722] bg-[#FF5722]/10' : 'text-neutral-400'}`}>
                        <GroupIcon className="w-4 h-4" />
                      </div>
                      <span className="truncate text-xs font-semibold">{group.label}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse shrink-0">
                      <span className="text-[10px] font-mono text-neutral-500 bg-[#12171E] px-1.5 py-0.5 rounded border border-[#232B33]">
                        {group.subSections.length}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                      )}
                    </div>
                  </button>

                  {/* Collapsible Sub-sections (Visible only for the active expanded group) */}
                  {isExpanded && (
                    <div className="mt-1 ml-3.5 pl-3 border-l border-[#232B33] space-y-1 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                      {group.subSections.map((sub) => {
                        const targetTab = getTabFromSubSection(sub.id);
                        const isSubActive = activeTab === targetTab;

                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => setActiveTab(targetTab as any)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                              isSubActive
                                ? 'bg-[#FF5722] text-white font-bold shadow-md glow-orange-sm'
                                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                            }`}
                          >
                            <span className="truncate">{sub.label}</span>
                            {isSubActive && <span className="text-[10px] font-mono ml-1">&bull;</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Separate Dedicated Option at the bottom of sidebar: Theme Live Edit */}
          <div className="pt-3.5 mt-2 border-t border-[#232B33]">
            <button
              type="button"
              onClick={() => setIsLiveEditOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#FF5722]/15 via-[#FF5722]/10 to-transparent border border-[#FF5722]/40 hover:border-[#FF5722] text-white text-xs font-bold transition-all shadow-lg hover:shadow-[#FF5722]/20 group"
            >
              <div className="flex items-center space-x-2.5 rtl:space-x-reverse min-w-0">
                <div className="p-1.5 rounded-xl bg-[#FF5722] text-white shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-left rtl:text-right">
                  <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <span>Theme Live Edit</span>
                    <span className="text-[9px] uppercase tracking-wider bg-[#FF5722] text-white px-1.5 py-0.2 rounded font-mono font-bold">New</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 font-normal">Click & edit public site</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#FF5722] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Content Workspace */}
        <div className="flex-1 bg-[#0F1419] border border-[#232B33] rounded-3xl p-6 sm:p-8 overflow-y-auto">
          
          {/* Media Group Sub-tabs */}
          {['projects', 'graphic-best', 'videos', 'video-best'].includes(activeTab) && (
            <div className="mb-6 pb-4 border-b border-[#232B33] flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mr-1">
                Media Group:
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('projects')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors ${
                  activeTab === 'projects'
                    ? 'bg-[#FF5722] text-white shadow-sm'
                    : 'bg-[#141A20] text-neutral-400 hover:text-white border border-[#232B33]'
                }`}
              >
                1. Graphic Design
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('graphic-best')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors ${
                  activeTab === 'graphic-best'
                    ? 'bg-[#FF5722] text-white shadow-sm'
                    : 'bg-[#141A20] text-neutral-400 hover:text-white border border-[#232B33]'
                }`}
              >
                2. Graphic Design - Best Work
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('videos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors ${
                  activeTab === 'videos'
                    ? 'bg-[#FF5722] text-white shadow-sm'
                    : 'bg-[#141A20] text-neutral-400 hover:text-white border border-[#232B33]'
                }`}
              >
                3. Video Editing
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('video-best')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors ${
                  activeTab === 'video-best'
                    ? 'bg-[#FF5722] text-white shadow-sm'
                    : 'bg-[#141A20] text-neutral-400 hover:text-white border border-[#232B33]'
                }`}
              >
                4. Video Editing - Best Work
              </button>
            </div>
          )}
          
          {/* TAB 0: THEME (Colors & Fonts) */}
          {activeTab === 'theme' && <ThemeEditor />}

          {/* TAB: BRANDING */}
          {activeTab === 'branding' && (
            <div className="space-y-6 max-w-3xl">
              <div className="pb-4 border-b border-[#1D232A]">
                <h2 className="text-xl font-bold text-white mb-1">Site Branding & Title</h2>
                <p className="text-xs text-neutral-400 font-mono">Control browser window title and navbar brand monogram</p>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Browser Page Title</label>
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
                  className="w-full px-3 py-2 rounded-xl bg-[#141A20] border border-[#232B33] text-sm text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">Navbar Logo Monogram (Initials)</label>
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
                    className="w-full px-3 py-2 rounded-xl bg-[#141A20] border border-[#232B33] text-sm text-white font-mono uppercase"
                  />
                  <span className="text-[11px] text-neutral-500 font-mono">Example: "MJ"</span>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">Navbar Brand Text</label>
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
                    className="w-full px-3 py-2 rounded-xl bg-[#141A20] border border-[#232B33] text-sm text-white font-mono"
                  />
                </div>
              </div>

              {/* Change Admin Password Section */}
              <div className="pt-8 mt-8 border-t border-[#1D232A]">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <KeyRound className="w-4 h-4 text-[#FF5722]" />
                    <span>Change Admin Password</span>
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">
                    Update the password for your username/password login (minimum 10 characters). Requires current password verification.
                  </p>
                </div>

                {passwordChangeMessage && (
                  <div
                    className={`mb-4 p-3 rounded-xl border text-xs font-mono flex items-center space-x-2 ${
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

                <form onSubmit={handleChangePassword} className="space-y-4 bg-[#141A20]/60 p-5 rounded-2xl border border-[#232B33]">
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPasswordInput}
                      onChange={(e) => setCurrentPasswordInput(e.target.value)}
                      placeholder="••••••••••"
                      className="w-full px-3 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] text-sm text-white font-mono focus:border-[#FF5722] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-neutral-300 mb-1">New Password (min 10 chars)</label>
                      <input
                        type="password"
                        required
                        minLength={10}
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="At least 10 characters"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] text-sm text-white font-mono focus:border-[#FF5722] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-neutral-300 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        minLength={10}
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        placeholder="Repeat new password"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] text-sm text-white font-mono focus:border-[#FF5722] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="px-4 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-white font-mono font-bold text-xs transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{changingPassword ? 'Updating Password...' : 'Update Password'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Optional Inactivity Auto-Logout Section */}
              <div className="pt-8 mt-8 border-t border-[#1D232A]">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-[#FF5722]" />
                    <span>Session Safety & Inactivity Auto-Logout</span>
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">
                    By default, your login stays active permanently on this browser (Off). Enable an inactivity timer only if you are using a shared computer.
                  </p>
                </div>

                <div className="bg-[#141A20]/60 p-5 rounded-2xl border border-[#232B33] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-mono text-white font-bold">Auto-Logout After Inactivity</p>
                    <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                      Current status: {autoLogoutMinutes === 0 ? 'Disabled (Keep me signed in)' : `Auto-sign out after ${autoLogoutMinutes} minutes of inactivity`}
                    </p>
                  </div>
                  <select
                    value={autoLogoutMinutes}
                    onChange={(e) => handleAutoLogoutChange(Number(e.target.value))}
                    className="px-3.5 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] text-xs text-white font-mono focus:border-[#FF5722] focus:outline-none"
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

          {/* TAB 2: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-6 max-w-3xl">
              <h2 className="text-xl font-bold text-white mb-2">About Bio</h2>
              
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Bio (English)</label>
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
                  className="w-full px-3 py-2 rounded-xl bg-[#141A20] border border-[#232B33] text-sm text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Bio (বাংলা)</label>
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
                  className="w-full px-3 py-2 rounded-xl bg-[#141A20] border border-[#232B33] text-sm text-white resize-none"
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
                helperText="Upload image or specify local path. Syncs to live site upon Publish."
              />
            </div>
          )}

          {/* TAB: SERVICES */}
          {activeTab === 'services' && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1D232A]">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Services Management</h2>
                  <p className="text-xs text-neutral-400 font-mono">Edit offered services across English, Bengali, and Arabic</p>
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
                  className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF5722] hover:bg-[#F4511E] glow-orange-sm transition-all shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Service</span>
                </button>
              </div>

              {(draftPortfolio.services || []).map((service, sIdx) => (
                <div key={service.id || sIdx} className="p-5 rounded-2xl bg-[#141A20] border border-[#232B33] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#FF5722]">Service #{sIdx + 1}</span>
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
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Delete Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-neutral-400 mb-1">Title (English)</label>
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
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-neutral-400 mb-1">Title (বাংলা)</label>
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
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-neutral-400 mb-1">Title (العربية)</label>
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
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-neutral-400 mb-1">Description (English)</label>
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
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs text-white resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-neutral-400 mb-1">Description (বাংলা)</label>
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
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs text-white resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-neutral-400 mb-1">Description (العربية)</label>
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
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs text-white resize-none"
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1D232A]">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Skills & Tools Management</h2>
                  <p className="text-xs text-neutral-400 font-mono">Manage skill categories, descriptions and software tool badges</p>
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
                  className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF5722] hover:bg-[#F4511E] glow-orange-sm transition-all shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Skill</span>
                </button>
              </div>

              {(draftPortfolio.skills || []).map((skill, skIdx) => (
                <div key={skill.id || skIdx} className="p-5 rounded-2xl bg-[#141A20] border border-[#232B33] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#FF5722]">Category #{skIdx + 1}</span>
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
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Delete Skill"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-neutral-400 mb-1">Title (English)</label>
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
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-neutral-400 mb-1">Title (বাংলা)</label>
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
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-neutral-400 mb-1">Title (العربية)</label>
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
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 mb-1">
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
                      className="w-full px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs text-white font-mono"
                    />
                  </div>
                </div>
              ))}

              {/* Creative Workflow Steps Management */}
              <div className="pt-8 border-t border-[#1D232A]">
                <WorkflowEditor />
              </div>
            </div>
          )}

          {/* TAB: CONTACT */}
          {activeTab === 'contact' && (
            <div className="space-y-6 max-w-3xl">
              <div className="pb-4 border-b border-[#1D232A]">
                <h2 className="text-xl font-bold text-white mb-1">Contact & Social Links</h2>
                <p className="text-xs text-neutral-400 font-mono">Edit direct contact email and social profile links</p>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Direct Contact Email</label>
                <input
                  type="email"
                  value={draftPortfolio.contact?.email || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateDraft(prev => ({
                      ...prev,
                      contact: { ...(prev.contact || { email: '' }), email: val }
                    }));
                  }}
                  placeholder="mdjaber.contact@gmail.com"
                  className="w-full px-3 py-2 rounded-xl bg-[#141A20] border border-[#232B33] text-sm text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">Facebook Profile URL</label>
                  <input
                    type="text"
                    value={draftPortfolio.contact?.facebookUrl || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft(prev => ({
                        ...prev,
                        contact: { ...(prev.contact || { email: '' }), facebookUrl: val }
                      }));
                    }}
                    placeholder="https://www.facebook.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-[#141A20] border border-[#232B33] text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">Telegram Profile URL</label>
                  <input
                    type="text"
                    value={draftPortfolio.contact?.telegramUrl || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft(prev => ({
                        ...prev,
                        contact: { ...(prev.contact || { email: '' }), telegramUrl: val }
                      }));
                    }}
                    placeholder="https://t.me/..."
                    className="w-full px-3 py-2 rounded-xl bg-[#141A20] border border-[#232B33] text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">Behance Portfolio URL</label>
                  <input
                    type="text"
                    value={draftPortfolio.contact?.behanceUrl || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft(prev => ({
                        ...prev,
                        contact: { ...(prev.contact || { email: '' }), behanceUrl: val }
                      }));
                    }}
                    placeholder="https://www.behance.net/..."
                    className="w-full px-3 py-2 rounded-xl bg-[#141A20] border border-[#232B33] text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">YouTube Channel URL</label>
                  <input
                    type="text"
                    value={draftPortfolio.contact?.youtubeUrl || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDraft(prev => ({
                        ...prev,
                        contact: { ...(prev.contact || { email: '' }), youtubeUrl: val }
                      }));
                    }}
                    placeholder="https://www.youtube.com/@..."
                    className="w-full px-3 py-2 rounded-xl bg-[#141A20] border border-[#232B33] text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EDUCATION (Academic Records & Professional Courses) */}
          {activeTab === 'education' && <EducationEditor />}

          {/* TAB 4: PROJECTS (Creative Works & Graphic Design) */}
          {activeTab === 'projects' && (
            <div className="space-y-6 max-w-4xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232B33]">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2 rtl:space-x-reverse">
                    <span>Projects & Graphics Showcase</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#FF5722]/15 text-[#FF5722] border border-[#FF5722]/30">
                      {draftPortfolio.projects?.length || 0} Total Items
                    </span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Manage Graphic Design and Video Editing projects, display order, Behance URLs, external links, and artwork.
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
                      order: nextOrder
                    };
                    updateDraft(prev => ({
                      ...prev,
                      projects: [...(prev.projects || []), newProject]
                    }));
                    showToast('New graphic project created! Enter details, upload artwork, and Publish.', 'success');
                  }}
                  className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF5722] hover:bg-[#F4511E] glow-orange-sm transition-all shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Project</span>
                </button>
              </div>

              {/* Projects List */}
              <div className="space-y-6">
                {(draftPortfolio.projects || []).map((proj, pIdx) => (
                  <div key={proj.id || pIdx} className="p-5 sm:p-6 rounded-3xl bg-[#141A20] border border-[#232B33] space-y-5 relative shadow-xl hover:border-neutral-700 transition-all">
                    
                    {/* Header: Order, Category & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#232B33]">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <span className="w-7 h-7 rounded-full bg-[#181E24] border border-[#232B33] flex items-center justify-center text-xs font-mono font-bold text-[#FF5722]">
                          #{pIdx + 1}
                        </span>

                        {/* Category Selector */}
                        <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                          <label className="text-[11px] font-mono text-neutral-400">Category:</label>
                          <select
                            value={proj.category}
                            onChange={(e) => {
                              const val = e.target.value as 'video' | 'graphic';
                              updateDraft(prev => ({
                                ...prev,
                                projects: prev.projects.map(p => p.id === proj.id ? { ...p, category: val } : p)
                              }));
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs font-mono text-[#FF5722] uppercase focus:outline-none"
                          >
                            <option value="graphic">Graphic Design</option>
                            <option value="video">Video Editing</option>
                          </select>
                        </div>

                        {/* Order Input */}
                        <div className="flex items-center space-x-1 rtl:space-x-reverse">
                          <label className="text-[11px] font-mono text-neutral-400">Order:</label>
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
                            className="w-14 px-2 py-0.5 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs font-mono text-center text-white"
                          />
                        </div>
                      </div>

                      {/* Move & Delete controls */}
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <button
                          type="button"
                          onClick={() => handleMoveProject(pIdx, pIdx - 1)}
                          disabled={pIdx === 0}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveProject(pIdx, pIdx + 1)}
                          disabled={pIdx === (draftPortfolio.projects?.length || 0) - 1}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
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
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors ml-1"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Titles across 3 languages */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-neutral-400 mb-1">Title (English)</label>
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
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-neutral-400 mb-1">Title (বাংলা)</label>
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
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-neutral-400 mb-1">Title (العربية)</label>
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
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* Descriptions across 3 languages */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-neutral-400 mb-1">Description (English)</label>
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
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs text-white resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-neutral-400 mb-1">Description (বাংলা)</label>
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
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs text-white resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-neutral-400 mb-1">Description (العربية)</label>
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
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs text-white resize-none"
                        />
                      </div>
                    </div>

                    {/* Links: Behance & Optional External Link */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                          Behance Project / Profile URL
                        </label>
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
                          className="w-full px-3 py-2 rounded-xl bg-[#0F1419] border border-[#232B33] text-xs text-white font-mono"
                        />
                        <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">
                          Displays "View on Behance" button inside the high-resolution lightbox
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-neutral-400 mb-1">
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
                          className="w-full px-3 py-2 rounded-xl bg-[#0F1419] border border-[#232B33] text-xs text-white font-mono"
                        />
                        <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">
                          Optional live demo or client case study link
                        </span>
                      </div>
                    </div>

                    {/* Artwork Image Uploader & Live Preview */}
                    <ImageUploaderField
                      label="Project Artwork / Cover Image"
                      value={proj.coverImage || ''}
                      onChange={(val) => updateDraft(prev => ({
                        ...prev,
                        projects: prev.projects.map(p => p.id === proj.id ? { ...p, coverImage: val } : p)
                      }))}
                      defaultFallback=""
                      helperText="Upload image file or paste URL. Clicking on the website opens this artwork in the lightbox."
                    />
                  </div>
                ))}

                {(draftPortfolio.projects?.length || 0) === 0 && (
                  <div className="p-8 text-center rounded-2xl bg-[#141A20] border border-[#232B33] text-neutral-400 text-xs">
                    No projects found. Click "Add Project" above to create one.
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232B33]">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2 rtl:space-x-reverse">
                    <span>Video Editing Portfolio / Showcase</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#FF5722]/15 text-[#FF5722] border border-[#FF5722]/30">
                      {draftPortfolio.videos?.length || 0} Videos
                    </span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Manage YouTube and Facebook video embeds, automatic thumbnails, custom uploads, titles, and display order.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddVideo}
                  className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF5722] hover:bg-[#F4511E] glow-orange-sm transition-all shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Video</span>
                </button>
              </div>

              {/* YouTube Channel Link Global Editor */}
              <div className="p-5 rounded-3xl bg-[#141A20] border border-[#232B33] space-y-2.5 shadow-lg">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Youtube className="w-4 h-4 text-[#FF0000]" />
                  <label className="text-xs font-mono font-bold text-white uppercase tracking-wider">
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
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F12] border border-[#232B33] text-sm text-white font-mono focus:border-[#FF5722] focus:outline-none"
                />
                <p className="text-[11px] text-neutral-400 font-mono">
                  Controls the primary "Watch My Work On YouTube" button and public channel proof links across the website.
                </p>
              </div>

              {/* Videos List */}
              <div className="space-y-6">
                {draftPortfolio.videos?.map((vid, idx) => {
                  const ytId = extractYouTubeId(vid.videoUrl);
                  const vimeoInfo = extractVimeoInfo(vid.videoUrl);
                  const isVimeo = vid.videoType === 'vimeo' || Boolean(vimeoInfo.id);
                  const isYouTube = !isVimeo && (vid.videoType === 'youtube' || Boolean(ytId));
                  const isFacebook = !isVimeo && !isYouTube && (vid.videoType === 'facebook' || (vid.videoUrl && (vid.videoUrl.includes('facebook.com') || vid.videoUrl.includes('fb.watch'))));
                  const isFetchingOg = fetchingOgId === vid.id;
                  const ogNote = ogFetchNotes[vid.id];

                  // Auto YouTube thumbnail where possible
                  const autoYtThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '';
                  const activeThumbnail = vid.customThumbnailUrl || vid.thumbnailUrl || autoYtThumb;

                  return (
                    <div
                      key={vid.id || idx}
                      className="p-6 rounded-3xl bg-[#141A20] border border-[#232B33] space-y-5 relative shadow-xl hover:border-neutral-700 transition-all"
                    >
                      {/* Top Video Header: Platform, Order & Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#232B33]">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <span className="w-7 h-7 rounded-full bg-[#181E24] border border-[#232B33] flex items-center justify-center text-xs font-mono font-bold text-[#FF5722]">
                            #{idx + 1}
                          </span>

                          {/* Platform Selector with Vimeo */}
                          <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                            <label className="text-[11px] font-mono text-neutral-400">Platform:</label>
                            <select
                              value={vid.videoType}
                              onChange={(e) => {
                                const val = e.target.value as 'vimeo' | 'youtube' | 'facebook' | 'direct';
                                updateDraft(prev => ({
                                  ...prev,
                                  videos: prev.videos.map((v, i) => i === idx ? { ...v, videoType: val } : v)
                                }));
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs font-mono text-[#FF5722] uppercase focus:outline-none"
                            >
                              <option value="vimeo">Vimeo</option>
                              <option value="youtube">YouTube</option>
                              <option value="facebook">Facebook</option>
                              <option value="direct">Direct Link / MP4</option>
                            </select>
                          </div>

                          {/* Order Input */}
                          <div className="flex items-center space-x-1 rtl:space-x-reverse">
                            <label className="text-[11px] font-mono text-neutral-400">Order:</label>
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
                              className="w-14 px-2 py-0.5 rounded-lg bg-[#0F1419] border border-[#232B33] text-xs font-mono text-center text-white"
                            />
                          </div>

                          {vid.customThumbnailUrl && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                              Custom Thumbnail Active
                            </span>
                          )}
                          {!vid.customThumbnailUrl && isVimeo && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1AB7EA]/20 text-[#1AB7EA] border border-[#1AB7EA]/30">
                              Vimeo Video
                            </span>
                          )}
                          {!vid.customThumbnailUrl && isYouTube && ytId && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-500/30">
                              Auto YouTube Thumbnail
                            </span>
                          )}
                        </div>

                        {/* Order & Delete */}
                        <div className="flex items-center space-x-1 rtl:space-x-reverse">
                          <button
                            type="button"
                            onClick={() => handleMoveVideo(idx, idx - 1)}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveVideo(idx, idx + 1)}
                            disabled={idx === (draftPortfolio.videos?.length || 0) - 1}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
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
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 ml-2 transition-colors"
                            title="Delete Video"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Video URL Input */}
                      <div>
                        <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5 flex items-center justify-between">
                          <span>Video URL (Vimeo, YouTube, or Facebook Link)</span>
                          {isVimeo && (
                            <span className="text-[10px] text-[#1AB7EA] font-bold font-mono">
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
                          className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F12] border border-[#232B33] text-sm text-white font-mono focus:border-[#FF5722] focus:outline-none"
                        />
                      </div>

                      {/* Thumbnail Management Stage */}
                      <div className="p-4 rounded-2xl bg-[#0E1217] border border-[#232B33] space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="text-xs font-mono uppercase font-bold text-neutral-300 flex items-center space-x-1.5 rtl:space-x-reverse">
                            <ImageIcon className="w-3.5 h-3.5 text-[#FF5722]" />
                            <span>Thumbnail Configuration</span>
                          </span>

                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            {/* Reset to Automatic Thumbnail Button */}
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
                                className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-lg text-xs font-mono text-amber-300 bg-amber-950/40 hover:bg-amber-950/60 border border-amber-500/30 transition-colors"
                                title="Remove custom thumbnail and restore automatic thumbnail"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                                <span>Reset to automatic thumbnail</span>
                              </button>
                            )}

                            {/* Automatic Open Graph & oEmbed Fetch Button */}
                            <button
                              type="button"
                              onClick={() => handleFetchOg(vid, idx)}
                              disabled={isFetchingOg || !vid.videoUrl}
                              className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-lg text-xs font-mono text-neutral-200 bg-[#181E24] hover:bg-[#202830] border border-[#232B33] hover:border-[#FF5722]/50 transition-colors disabled:opacity-50"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 text-[#FF5722] ${isFetchingOg ? 'animate-spin' : ''}`} />
                              <span>{isFetchingOg ? 'Fetching...' : 'Re-fetch Automatic Thumbnail'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Notice if auto-fetch failed */}
                        {ogNote && (
                          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-2 rtl:space-x-reverse">
                            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>{ogNote}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                          {/* Thumbnail Preview Stage - object-contain */}
                          <div className="md:col-span-5">
                            <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                              Current Display Preview
                            </label>
                            <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-[#232B33] bg-[#080B0D] flex items-center justify-center">
                              {activeThumbnail ? (
                                <img
                                  src={activeThumbnail}
                                  alt="Thumbnail preview"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="text-center p-4">
                                  <div className="w-10 h-10 mx-auto rounded-xl bg-[#181E24] border border-[#232B33] flex items-center justify-center text-[#FF5722] mb-2">
                                    {isVimeo ? (
                                      <VimeoIcon className="w-5 h-5 text-[#1AB7EA]" />
                                    ) : (
                                      <Play className="w-5 h-5 fill-current" />
                                    )}
                                  </div>
                                  <span className="text-[10px] font-mono text-neutral-400 uppercase">
                                    {isVimeo ? 'Vimeo Placeholder' : 'Branded Placeholder'}
                                  </span>
                                </div>
                              )}

                              {isVimeo && (
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/85 text-[#1AB7EA] border border-[#1AB7EA]/40 flex items-center space-x-1">
                                  <VimeoIcon className="w-3 h-3 fill-current" />
                                  <span>Vimeo</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Upload / URL Inputs */}
                          <div className="md:col-span-7 space-y-3">
                            <div>
                              <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                                Upload Custom Thumbnail (Overrides Auto)
                              </label>
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <label className="flex-1 cursor-pointer inline-flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-mono text-white bg-[#181E24] hover:bg-[#202830] border border-[#232B33] hover:border-[#FF5722] transition-colors">
                                  <Upload className="w-3.5 h-3.5 text-[#FF5722]" />
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
                                <div className="w-full bg-[#0B0F12] rounded-full h-1 mt-1">
                                  <div
                                    className="bg-[#FF5722] h-1 rounded-full transition-all"
                                    style={{ width: `${videoUploadProgress[idx]}%` }}
                                  />
                                </div>
                              )}
                            </div>

                            <div>
                              <label className="block text-[11px] font-mono text-neutral-400 mb-1">
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
                                className="w-full px-3 py-2 rounded-lg bg-[#0B0F12] border border-[#232B33] text-xs text-white font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Video Title in 3 languages (Optional) */}
                      <div>
                        <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
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
                            className="px-3 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] text-xs text-white font-mono"
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
                            className="px-3 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] text-xs text-white font-mono"
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
                            className="px-3 py-2 rounded-xl bg-[#0B0F12] border border-[#232B33] text-xs text-white font-mono"
                          />
                        </div>
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
              <h2 className="text-xl font-bold text-white mb-2">Channel Links</h2>
              <div className="space-y-4">
                {(draftPortfolio.channelLinks || []).map((item) => (
                  <div key={item.id} className="p-4 rounded-xl bg-[#141A20] border border-[#232B33] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{item.platform}</span>
                      <select
                        value={item.status}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          updateDraft(prev => ({
                            ...prev,
                            channelLinks: prev.channelLinks.map(c => c.id === item.id ? { ...c, status: val } : c)
                          }));
                        }}
                        className="px-2 py-1 rounded bg-[#0B0F12] border border-[#232B33] text-xs text-white"
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
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0F12] border border-[#232B33] text-xs text-white"
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
              <div className="p-6 rounded-3xl bg-[#12161A] border border-[#232B33] space-y-4 max-w-4xl">
                <div className="flex items-center space-x-3 rtl:space-x-reverse pb-3 border-b border-[#1D232A]">
                  <div className="w-10 h-10 rounded-xl bg-[#181E24] border border-[#232B33] flex items-center justify-center text-[#FF5722]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">Direct Contact Information</h3>
                    <p className="text-xs text-neutral-400 font-mono">Email address used for inquiries and advice form</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-neutral-400 mb-1">Primary Email Address</label>
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
                      className="w-full px-3 py-2 rounded-xl bg-[#0F1419] border border-[#232B33] text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-neutral-400 mb-1 flex items-center justify-between">
                      <span>Telegram (Direct Contact Link)</span>
                      <span className="text-[10px] text-[#229ED9]">Get In Touch</span>
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
                      className="w-full px-3 py-2 rounded-xl bg-[#0F1419] border border-[#232B33] text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-neutral-400 mb-1 flex items-center justify-between">
                      <span>Facebook Profile URL</span>
                      <span className="text-[10px] text-neutral-500">Leave empty to hide</span>
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
                      className="w-full px-3 py-2 rounded-xl bg-[#0F1419] border border-[#232B33] text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-neutral-400 mb-1 flex items-center justify-between">
                      <span>YouTube Channel URL</span>
                      <span className="text-[10px] text-neutral-500">Leave empty to hide</span>
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
                      className="w-full px-3 py-2 rounded-xl bg-[#0F1419] border border-[#232B33] text-xs text-white font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono text-neutral-400 mb-1 flex items-center justify-between">
                      <span>Behance Profile URL</span>
                      <span className="text-[10px] text-[#0057FF]">Direct Profile</span>
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
                      className="w-full px-3 py-2 rounded-xl bg-[#0F1419] border border-[#232B33] text-xs text-white font-mono"
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
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Received Advice & Messages</h2>
                  <p className="text-xs text-neutral-400">Private submissions from the Give Me Your Advice form.</p>
                </div>
                <button
                  onClick={loadLeadsData}
                  disabled={loadingLeads}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-300 bg-[#141A20] border border-[#232B33] hover:text-white"
                >
                  {loadingLeads ? 'Refreshing...' : 'Refresh List'}
                </button>
              </div>

              {leads.length === 0 ? (
                <div className="p-12 text-center text-neutral-400 text-sm rounded-2xl bg-[#141A20] border border-[#232B33]">
                  No messages received yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {leads.map((l) => (
                    <div key={l.id} className="p-5 rounded-2xl bg-[#141A20] border border-[#232B33] space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-white">{l.name}</h3>
                        <span className="text-xs font-mono text-[#FF5722]">{l.email}</span>
                      </div>
                      <p className="text-xs text-neutral-300 bg-[#0B0F12] p-3 rounded-lg border border-[#232B33]">
                        {l.message}
                      </p>
                      <span className="text-[10px] text-neutral-500 font-mono">
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
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Google Sheets Webhook</h2>
                <p className="text-xs text-neutral-400">Optionally connect your Google Sheet to receive automatic rows.</p>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Web App URL</label>
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
                  className="w-full px-3 py-2 rounded-xl bg-[#141A20] border border-[#232B33] text-xs text-white"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-300">Google Apps Script Code:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(appsScriptCode);
                      setCopiedScript(true);
                      setTimeout(() => setCopiedScript(false), 3000);
                    }}
                    className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1 rounded-lg text-xs font-semibold text-white bg-[#141A20] hover:bg-[#1E2630] border border-[#232B33]"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedScript ? 'Copied to Clipboard!' : 'Copy Code'}</span>
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-[#080B0D] border border-[#232B33] text-xs text-neutral-300 font-mono overflow-x-auto max-h-56">
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
