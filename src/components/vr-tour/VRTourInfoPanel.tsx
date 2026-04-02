import React from 'react';
import type { VRScene } from './VRTourTypes';
import { Info, ChevronUp, ChevronDown, Image } from 'lucide-react';

interface Props {
  scene: VRScene;
  totalScenes: number;
  currentIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
}

const VRTourInfoPanel: React.FC<Props> = ({ scene, totalScenes, currentIndex, isExpanded, onToggle }) => {
  return (
    <div className="absolute bottom-20 left-4 z-[102] w-72 max-w-[calc(100vw-7rem)] pointer-events-none">
      <div className="pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-all duration-300">
        {/* Collapsed bar */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Image className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-white font-medium text-sm truncate">{scene.name}</span>
            <span className="text-white/30 text-xs flex-shrink-0">
              {currentIndex + 1}/{totalScenes}
            </span>
          </div>
          <div className="text-white/40 flex-shrink-0 ml-2">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </button>

        {/* Expanded content */}
        {isExpanded && scene.description && (
          <div className="px-4 pb-3 border-t border-white/10">
            <div className="flex items-start gap-2 mt-2.5">
              <Info className="w-3.5 h-3.5 text-white/30 flex-shrink-0 mt-0.5" />
              <p className="text-white/60 text-xs leading-relaxed">{scene.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VRTourInfoPanel;
