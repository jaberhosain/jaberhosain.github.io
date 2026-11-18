/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { DesignOverridesProvider } from './context/DesignOverridesContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { VideoModal } from './components/VideoModal';
import { LightboxModal } from './components/LightboxModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { MobileAdminDashboard } from './components/admin/mobile/MobileAdminDashboard';
import { HomePage } from './components/pages/HomePage';
import { AboutPage } from './components/pages/AboutPage';
import { VideosPage } from './components/pages/VideosPage';
import { DesignPage } from './components/pages/DesignPage';
import { SkillsPage } from './components/pages/SkillsPage';
import { GameZonePage } from './components/pages/GameZonePage';
import { ContactPage } from './components/pages/ContactPage';
import { PortfolioAIAgent } from './components/PortfolioAIAgent';
import { WelcomeSalamToast } from './components/WelcomeSalamToast';
import { StudioBackdrop3D } from './components/three/StudioBackdrop3D';
import { StudioCursor } from './components/common/StudioCursor';
import { SmoothScrollEngine } from './components/common/SmoothScrollEngine';
import { CustomLayersRenderer } from './components/common/CustomLayersRenderer';
import { VideoShowcaseItem, ProjectItem } from './types/portfolio';

function NavigationWithFocusSync({ children }: { children: React.ReactNode }) {
  const { portfolio } = usePortfolio();
  return (
    <NavigationProvider initialFocusMode={portfolio.defaultFocusMode || 'all'}>
      {children}
    </NavigationProvider>
  );
}

function MainApp() {
  const { currentPage, navigateTo } = useNavigation();

  const checkIsAdmin = (): boolean => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return (
      path === '/admin' ||
      path.endsWith('/admin') ||
      path.endsWith('/admin/') ||
      hash === '#admin' ||
      hash.startsWith('#admin') ||
      search.includes('admin') ||
      search.includes('p=/admin')
    );
  };

  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(checkIsAdmin);

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
  });

  const [activeVideo, setActiveVideo] = useState<VideoShowcaseItem | null>(null);
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number>(0);

  const handleOpenLightbox = (proj: ProjectItem, initialIndex = 0) => {
    setActiveLightboxIndex(initialIndex);
    setActiveProject(proj);
  };

  // Track responsive screen width for mobile admin breakpoint (<= 768px)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen to URL routing for /admin, #admin, and query param changes
  useEffect(() => {
    const handleRoute = () => {
      setIsAdminRoute(checkIsAdmin());
    };

    window.addEventListener('popstate', handleRoute);
    window.addEventListener('hashchange', handleRoute);
    return () => {
      window.removeEventListener('popstate', handleRoute);
      window.removeEventListener('hashchange', handleRoute);
    };
  }, []);

  const navigateToHome = () => {
    const cleanPath = window.location.pathname.replace(/\/admin\/?$/, '/') || './';
    try {
      window.history.pushState({}, '', cleanPath);
    } catch {
      // fallback
    }
    setIsAdminRoute(false);
    navigateTo('home');
  };

  // If visitor opens /admin:
  // On mobile screens (<= 768px), render dedicated MobileAdminDashboard
  // On desktop / tablet-landscape, render untouched locked AdminDashboard
  if (isAdminRoute) {
    return isMobile ? (
      <MobileAdminDashboard onBackToSite={navigateToHome} />
    ) : (
      <AdminDashboard onBackToSite={navigateToHome} />
    );
  }

  const renderActivePage = () => {
    switch (currentPage) {
      case 'about':
        return <AboutPage key="about" />;
      case 'videos':
        return (
          <VideosPage
            key="videos"
            onOpenVideo={(vid) => setActiveVideo(vid)}
            onOpenLightbox={handleOpenLightbox}
          />
        );
      case 'design':
        return <DesignPage key="design" onOpenLightbox={handleOpenLightbox} />;
      case 'skills':
        return <SkillsPage key="skills" />;
      case 'games':
        return <GameZonePage key="games" />;
      case 'contact':
        return <ContactPage key="contact" />;
      case 'home':
      default:
        return (
          <HomePage
            key="home"
            onOpenLightbox={handleOpenLightbox}
            onOpenVideo={(vid) => setActiveVideo(vid)}
          />
        );
    }
  };

  // PUBLIC WEBSITE (3D WebGL Spatial World + Multi-page architecture)
  return (
    <div className="app-shell-canvas relative min-h-screen bg-[#121419] text-[#F4F0E8] flex flex-col font-sans selection:bg-[#E4583B] selection:text-white overflow-x-clip">
      {/* Context-Aware Kinetic Studio Cursor (Desktop fine pointers only) */}
      <StudioCursor />

      {/* Silky Desktop Wheel Inertia & GPU Top Scroll Progress Bar */}
      <SmoothScrollEngine />

      {/* Subtle Cinema Cut Transition Indicator on route switch */}
      <div key={`cut-${currentPage}`} aria-hidden="true" className="animate-route-cut fixed top-0 left-0 right-0 h-[2px] z-[60] pointer-events-none" />

      {/* Persistent Three.js Interactive 3D WebGL Backdrop */}
      <StudioBackdrop3D activePage={currentPage} />

      {/* Global Custom Studio Canvas Layers */}
      <CustomLayersRenderer sectionTarget="global" />

      {/* Automatic Salam Greeting Popup on Site Entry */}
      <WelcomeSalamToast />

      {/* Navbar with brand monogram, page links, theme & language switcher */}
      <Navbar />

      <main className="relative z-10 flex-1 flex flex-col">
        {renderActivePage()}
      </main>

      {/* Footer */}
      <div className="relative z-10">
        <Footer onOpenAdmin={() => setIsAdminRoute(true)} />
      </div>

      {/* Video Modal Player */}
      {activeVideo && (
        <VideoModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}

      {/* Creative Works / Graphics Lightbox Modal */}
      {activeProject && (
        <LightboxModal
          project={activeProject}
          initialIndex={activeLightboxIndex}
          onClose={() => {
            setActiveProject(null);
            setActiveLightboxIndex(0);
          }}
        />
      )}

      {/* Floating Portfolio AI Agent */}
      <PortfolioAIAgent />
    </div>
  );
}

export default function App() {
  return (
    <PortfolioProvider>
      <DesignOverridesProvider>
        <NavigationWithFocusSync>
          <MainApp />
        </NavigationWithFocusSync>
      </DesignOverridesProvider>
    </PortfolioProvider>
  );
}

