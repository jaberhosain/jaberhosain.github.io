/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PortfolioProvider } from './context/PortfolioContext';
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
import { ContactPage } from './components/pages/ContactPage';
import { PortfolioAIAgent } from './components/PortfolioAIAgent';
import { WelcomeSalamToast } from './components/WelcomeSalamToast';
import { StudioBackdrop3D } from './components/three/StudioBackdrop3D';
import { VideoShowcaseItem, ProjectItem } from './types/portfolio';

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
        return <VideosPage key="videos" onOpenVideo={(vid) => setActiveVideo(vid)} />;
      case 'design':
        return <DesignPage key="design" onOpenLightbox={handleOpenLightbox} />;
      case 'skills':
        return <SkillsPage key="skills" />;
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
    <div className="relative min-h-screen bg-[#121419] text-[#F4F0E8] flex flex-col font-sans selection:bg-[#E4583B] selection:text-white overflow-x-clip">
      {/* Persistent Three.js Interactive 3D WebGL Backdrop */}
      <StudioBackdrop3D activePage={currentPage} />

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
        <NavigationProvider>
          <MainApp />
        </NavigationProvider>
      </DesignOverridesProvider>
    </PortfolioProvider>
  );
}
