/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { useDesignOverrides } from '../../../context/DesignOverridesContext';
import { usePortfolio } from '../../../context/PortfolioContext';
import { useNavigation } from '../../../context/NavigationContext';
import { LiveEditHeader } from './LiveEditHeader';
import { LiveEditSidePanel } from './LiveEditSidePanel';
import { StudioBackdrop3D } from '../../three/StudioBackdrop3D';
import { CustomLayersRenderer } from '../../common/CustomLayersRenderer';

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
  const { setIsLiveEditMode, selectElement, selectLayer } = useDesignOverrides();
  const { isPreviewDraft, setIsPreviewDraft } = usePortfolio();
  const { focusMode, setFocusMode } = useNavigation();
  const prevDraftRef = useRef(isPreviewDraft);
  const [activeView, setActiveView] = useState<LivePageView>('home');

  // Activate live edit + ensure draft content is previewed cleanly
  useEffect(() => {
    prevDraftRef.current = isPreviewDraft;
    setIsLiveEditMode(true);
    setIsPreviewDraft(true);
    return () => {
      setIsLiveEditMode(false);
      selectElement(null);
      selectLayer(null);
      setIsPreviewDraft(prevDraftRef.current);
    };
  }, [setIsLiveEditMode, selectElement, selectLayer, setIsPreviewDraft]);

  const handleExit = () => {
    setIsLiveEditMode(false);
    selectElement(null);
    selectLayer(null);
    setIsPreviewDraft(prevDraftRef.current);
    onExit();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0C0F] flex flex-col overflow-hidden text-[#F4F0E8] font-sans">
      {/* Live 3D Backdrop behind translucent preview stage */}
      <StudioBackdrop3D activePage={activeView === 'all' ? 'home' : activeView} />

      {/* Top Controls Header */}
      <LiveEditHeader onExit={handleExit} />

      {/* Main Studio Workspace: Public Website Live Stage + Inspector Side Panel */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left: Scrollable Public Website Preview */}
        <div className="flex-1 overflow-y-auto bg-transparent relative custom-scrollbar">
          {/* Live Edit View & Focus Switcher Bar */}
          <div className="sticky top-0 z-30 bg-[#121419]/95 backdrop-blur-md border-b border-white/[0.08] px-4 py-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-medium text-[#A7A298] hidden xl:inline">
                Click dashed elements to edit &middot; Double-click text to type
              </span>
              {/* Focus Switcher Preview */}
              <div className="inline-flex items-center p-0.5 rounded-lg bg-[#0B0C0F] border border-white/[0.08]">
                {(
                  [
                    { id: 'all', label: 'All Work' },
                    { id: 'video', label: 'Video & Motion' },
                    { id: 'graphic', label: 'Graphic Design' }
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setFocusMode(mode.id)}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      focusMode === mode.id
                        ? 'bg-[#E4583B] text-white'
                        : 'text-[#A7A298] hover:text-white'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

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

          <div
            onClick={() => {
              selectElement(null);
              selectLayer(null);
            }}
            className="min-h-screen bg-transparent relative z-10"
          >
            <CustomLayersRenderer sectionTarget="global" />
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
