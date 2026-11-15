/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { useDesignOverrides } from '../../../context/DesignOverridesContext';
import { usePortfolio } from '../../../context/PortfolioContext';
import { LiveEditHeader } from './LiveEditHeader';
import { LiveEditSidePanel } from './LiveEditSidePanel';

// Public site sections & pages rendered inside Live Edit preview
import { Navbar } from '../../Navbar';
import { Hero } from '../../Hero';
import { HomeHighlights } from '../../HomeHighlights';
import { About } from '../../About';
import { Experience } from '../../Experience';
import { WorkExperienceCVSection } from '../../WorkExperienceCVSection';
import { Services } from '../../Services';
import { Skills } from '../../Skills';
import { Portfolio } from '../../Portfolio';
import { GraphicBestShowcase } from '../../GraphicBestShowcase';
import { VideoShowcase } from '../../VideoShowcase';
import { CraftTimeline } from '../../CraftTimeline';
import { LayerExplosionShowcase } from '../../LayerExplosionShowcase';
import { ChannelLinks } from '../../ChannelLinks';
import { Contact } from '../../Contact';
import { Footer } from '../../Footer';

interface ThemeLiveEditViewProps {
  onExit: () => void;
}

type LivePageView = 'all' | 'home' | 'about' | 'videos' | 'design' | 'skills' | 'contact';

const PAGE_TABS: { id: LivePageView; label: string }[] = [
  { id: 'all', label: 'All Sections' },
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About & CV' },
  { id: 'videos', label: 'Videos' },
  { id: 'design', label: 'Design & Posters' },
  { id: 'skills', label: 'Skills & Services' },
  { id: 'contact', label: 'Contact & Footer' }
];

export const ThemeLiveEditView: React.FC<ThemeLiveEditViewProps> = ({ onExit }) => {
  const { setIsLiveEditMode, selectElement } = useDesignOverrides();
  const { isPreviewDraft, setIsPreviewDraft } = usePortfolio();
  const prevDraftRef = useRef(isPreviewDraft);
  const [activeView, setActiveView] = useState<LivePageView>('all');

  // Activate live edit + ensure draft content is previewed cleanly
  useEffect(() => {
    prevDraftRef.current = isPreviewDraft;
    setIsLiveEditMode(true);
    setIsPreviewDraft(true);
    return () => {
      setIsLiveEditMode(false);
      selectElement(null);
      setIsPreviewDraft(prevDraftRef.current);
    };
  }, [setIsLiveEditMode, selectElement, setIsPreviewDraft]);

  const handleExit = () => {
    setIsLiveEditMode(false);
    selectElement(null);
    setIsPreviewDraft(prevDraftRef.current);
    onExit();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0C0F] flex flex-col overflow-hidden text-[#F4F0E8] font-sans">
      
      {/* Top Controls Header */}
      <LiveEditHeader onExit={handleExit} />

      {/* Main Studio Workspace: Public Website Live Stage + Inspector Side Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left: Scrollable Public Website Preview */}
        <div className="flex-1 overflow-y-auto bg-[#0B0C0F] relative custom-scrollbar">
          
          {/* Live Edit View & Page Switcher Bar */}
          <div className="sticky top-0 z-30 bg-[#121419]/95 backdrop-blur-md border-b border-white/[0.08] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-[#A7A298]">
              Interactive Live Edit Mode &mdash; click any dashed text element to customize style &amp; typography
            </span>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {PAGE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveView(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    activeView === tab.id
                      ? 'bg-[#E4583B] text-white'
                      : 'bg-[#171A21] text-[#A7A298] hover:text-white border border-white/[0.07]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-screen bg-[#121419]">
            <Navbar />

            {(activeView === 'all' || activeView === 'home') && (
              <>
                <Hero />
                <HomeHighlights />
              </>
            )}

            {(activeView === 'all' || activeView === 'about') && (
              <>
                <About />
                <WorkExperienceCVSection />
                <Experience />
              </>
            )}

            {(activeView === 'all' || activeView === 'videos') && (
              <>
                <Portfolio mode="video" />
                <VideoShowcase />
                <CraftTimeline />
                <LayerExplosionShowcase />
              </>
            )}

            {(activeView === 'all' || activeView === 'design') && (
              <>
                <GraphicBestShowcase />
                <Portfolio mode="graphic" />
              </>
            )}

            {(activeView === 'all' || activeView === 'skills') && (
              <>
                <Services />
                <Skills />
                <ChannelLinks />
              </>
            )}

            {(activeView === 'all' || activeView === 'contact') && <Contact />}

            <Footer />
          </div>
        </div>

        {/* Right: Inspector Side Panel */}
        <LiveEditSidePanel />

      </div>

    </div>
  );
};

