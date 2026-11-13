/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useDesignOverrides } from '../../../context/DesignOverridesContext';
import { LiveEditHeader } from './LiveEditHeader';
import { LiveEditSidePanel } from './LiveEditSidePanel';

// Public site sections rendered inside Live Edit preview
import { Navbar } from '../../Navbar';
import { Hero } from '../../Hero';
import { About } from '../../About';
import { Experience } from '../../Experience';
import { Services } from '../../Services';
import { Skills } from '../../Skills';
import { Portfolio } from '../../Portfolio';
import { GraphicBestShowcase } from '../../GraphicBestShowcase';
import { VideoShowcase } from '../../VideoShowcase';
import { ChannelLinks } from '../../ChannelLinks';
import { Contact } from '../../Contact';
import { Footer } from '../../Footer';

interface ThemeLiveEditViewProps {
  onExit: () => void;
}

export const ThemeLiveEditView: React.FC<ThemeLiveEditViewProps> = ({ onExit }) => {
  const { setIsLiveEditMode, selectElement } = useDesignOverrides();

  // Ensure live edit mode is active while this view is mounted
  useEffect(() => {
    setIsLiveEditMode(true);
    return () => {
      setIsLiveEditMode(false);
      selectElement(null);
    };
  }, [setIsLiveEditMode, selectElement]);

  const handleExit = () => {
    setIsLiveEditMode(false);
    selectElement(null);
    onExit();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070A0D] flex flex-col overflow-hidden text-neutral-100">
      
      {/* Top Controls Header */}
      <LiveEditHeader onExit={handleExit} />

      {/* Main Studio Workspace: Public Website Live Stage + Inspector Side Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left: Scrollable Public Website Preview */}
        <div className="flex-1 overflow-y-auto bg-[#0B0F12] relative custom-scrollbar">
          
          {/* Subtle Live Edit Watermark Bar at Top */}
          <div className="bg-[#12161A] border-b border-[#232B33] px-4 py-2 text-center text-[11px] font-mono text-neutral-400 flex items-center justify-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-pulse" />
            <span>Interactive Live Edit Mode &bull; Click any text with a dashed outline to customize</span>
          </div>

          <div className="min-h-screen">
            <Navbar />
            <Hero />
            <About />
            <Experience />
            <Portfolio />
            <GraphicBestShowcase />
            <VideoShowcase />
            <Services />
            <Skills />
            <ChannelLinks />
            <Contact />
            <Footer />
          </div>
        </div>

        {/* Right: Inspector Side Panel */}
        <LiveEditSidePanel />

      </div>

    </div>
  );
};
