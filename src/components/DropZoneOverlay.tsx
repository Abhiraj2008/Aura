import React from 'react';
import { UploadCloud } from 'lucide-react';

interface DropZoneOverlayProps {
  isDragging: boolean;
}

export const DropZoneOverlay: React.FC<DropZoneOverlayProps> = ({ isDragging }) => {
  if (!isDragging) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#181816]/60 backdrop-blur-xs flex items-center justify-center p-8 pointer-events-none transition-all duration-200">
      <div className="max-w-md w-full p-8 rounded-3xl border-3 border-dashed border-[#181816] bg-[#fffdf9] text-[#181816] shadow-paper-pop flex flex-col items-center text-center space-y-4 rotate-[-1deg]">
        <div className="w-16 h-16 rounded-2xl bg-[#e76f51] border-2 border-[#181816] shadow-paper flex items-center justify-center text-white">
          <UploadCloud className="w-8 h-8 animate-bounce" />
        </div>

        <div className="space-y-1">
          <div className="inline-block px-3 py-1 washi-tape border border-[#181816] font-typewriter text-[11px] font-bold uppercase rotate-[1deg]">
            ✦ INCOMING AUDIO TAPES
          </div>
          <h2 className="text-2xl font-display font-black tracking-tight">
            Drop Your Music Files Here!
          </h2>
          <p className="font-doodle text-lg opacity-80">
            Aura will extract polaroid covers & .lrc lyric sheets instantly ~
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
          {['.FLAC Master', '.MP3 Audio', '.M4A Apple', '.WAV PCM', '.OGG Opus', '.LRC Lyrics'].map((fmt) => (
            <span
              key={fmt}
              className="text-[10px] font-typewriter font-bold px-2 py-0.5 rounded border border-[#181816] bg-[#f5f0e6]"
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
