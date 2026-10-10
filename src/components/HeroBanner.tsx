import React from 'react';
import { Play, Pause, Shuffle, Heart, Disc3, FolderOpen } from 'lucide-react';
import type { Track } from '../types/audio';

interface HeroBannerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  theme: 'paper' | 'chalk';
  onTogglePlay: () => void;
  onShufflePlay: () => void;
  onToggleFavorite: (trackId: string) => void;
  onScanFolder: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  currentTrack,
  isPlaying,
  theme,
  onTogglePlay,
  onShufflePlay,
  onToggleFavorite,
  onScanFolder
}) => {
  const isDark = theme === 'chalk';

  if (!currentTrack) {
    return (
      <div className={`relative rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border-2 mb-6 transition-all duration-300 ${
        isDark
          ? 'bg-[#1e1d1a] border-[#36342e] text-[#f5f1e8] shadow-chalk'
          : 'bg-[#fffdf9] border-[#181816] text-[#181816] shadow-paper-lg'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            {/* Washi tape header */}
            <div className="inline-block px-3 py-1 rounded washi-tape rotate-[-1.5deg] border border-[#181816] text-[#181816] font-typewriter text-xs font-bold uppercase tracking-wider">
              ✦ Handcrafted Sound Deck • Issue #01
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-black tracking-tight leading-tight">
              Tactile Audio <span className="font-doodle text-3xl sm:text-4xl md:text-5xl text-[#e76f51] underline decoration-wavy decoration-[#e9c46a]">for your ears</span>
            </h1>
            <p className="text-xs sm:text-sm font-sans opacity-80 leading-relaxed max-w-lg">
              Pop your local tapes in! Pure, offline, bit-perfect audio directly from your local folders with synchronized karaoke lyric scrolls.
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
              <button
                onClick={onScanFolder}
                className={`hidden sm:flex items-center space-x-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border-2 font-bold text-xs btn-paper ${
                  isDark
                    ? 'bg-[#f4a261] border-[#f5f1e8] text-[#161513] shadow-chalk-sm'
                    : 'bg-[#e76f51] border-[#181816] text-white shadow-paper'
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                <span>Select Music Folder</span>
              </button>
              <button
                onClick={onShufflePlay}
                className={`flex items-center space-x-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border-2 font-semibold text-xs btn-paper ${
                  isDark
                    ? 'bg-[#262420] border-[#36342e] text-[#f5f1e8] shadow-chalk-sm'
                    : 'bg-[#f5f0e6] border-[#181816] text-[#181816] shadow-paper-sm'
                }`}
              >
                <Shuffle className="w-4 h-4" />
                <span>Shuffle Demo Tape</span>
              </button>
            </div>
          </div>

          {/* Doodle cassette illustration */}
          <div className="hidden lg:flex flex-col items-center justify-center p-4">
            <div className={`w-48 h-32 rounded-2xl border-2 p-3 flex flex-col justify-between rotate-[2deg] relative ${
              isDark ? 'bg-[#252420] border-[#f5f1e8] shadow-chalk' : 'bg-[#f8f3ea] border-[#181816] shadow-paper'
            }`}>
              <div className="w-full h-4 bg-amber-400/30 rounded border border-current flex items-center justify-center text-[9px] font-typewriter">
                DEMO CASSETTE • C-60
              </div>
              <div className="flex items-center justify-around py-1">
                <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center bg-white/10">
                  <div className="w-4 h-4 rounded-full border border-current"></div>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center bg-white/10">
                  <div className="w-4 h-4 rounded-full border border-current"></div>
                </div>
              </div>
              <div className="text-[10px] text-center font-doodle">insert tape to play ⤷</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-3xl p-6 md:p-8 border-2 mb-6 transition-all duration-300 ${
      isDark
        ? 'bg-[#1e1d1a] border-[#36342e] text-[#f5f1e8] shadow-chalk'
        : 'bg-[#fffdf9] border-[#181816] text-[#181816] shadow-paper-lg'
    }`}>
      {/* Corner washi tape sticker */}
      <div className="absolute -top-3 right-8 px-4 py-1 washi-tape rotate-[-1deg] border border-[#181816] text-[#181816] font-typewriter text-[10px] font-bold tracking-widest uppercase z-20">
        ✦ NOW SPINNING • SIDE A
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6">
        {/* Polaroid Style Cover Frame with Tape */}
        <div className="relative group shrink-0">
          {/* Tilted tape on top of polaroid */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-4 washi-tape-rose rotate-[3deg] border border-[#181816] z-20"></div>

          <div className={`w-38 h-46 sm:w-44 sm:h-52 rounded-xl p-2.5 pb-6 border-2 rotate-[-1.5deg] group-hover:rotate-0 transition-transform duration-300 flex flex-col justify-between ${
            isDark ? 'bg-[#282723] border-[#f5f1e8] shadow-chalk' : 'bg-[#ffffff] border-[#181816] shadow-paper'
          }`}>
            <div className="w-full aspect-square rounded-lg overflow-hidden border border-current/20 bg-stone-900 relative">
              {currentTrack.coverUrl ? (
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-stone-900">
                  <Disc3 className={`w-14 h-14 text-amber-400 ${isPlaying ? 'animate-reel-spin' : ''}`} />
                </div>
              )}
            </div>
            <div className="text-center pt-2 font-doodle text-sm font-semibold truncate">
              {currentTrack.artist || 'Local Track'}
            </div>
          </div>
        </div>

        {/* Center: The Hand-Drawn Retro Cassette Deck */}
        <div className="flex-1 space-y-3 min-w-0 w-full text-center sm:text-left">
          {/* Formats and badges */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className={`text-[10px] font-typewriter font-bold uppercase px-2.5 py-0.5 rounded-full border-2 shadow-paper-sm ${
              isDark ? 'bg-[#f4a261] border-[#f5f1e8] text-[#161513]' : 'bg-[#e76f51] border-[#181816] text-white'
            }`}>
              .{currentTrack.format}
            </span>

            {currentTrack.metadata?.bitrate && (
              <span className="text-[10px] font-typewriter px-2.5 py-0.5 rounded-full border border-current opacity-80">
                {currentTrack.metadata.bitrate}
              </span>
            )}

            {currentTrack.lyrics && (
              <span className={`text-[10px] font-doodle text-sm font-bold px-2 py-0.5 rounded border border-current rotate-[-1deg] ${
                isDark ? 'bg-[#2d2b25]' : 'bg-[#ffe66d] text-[#181816]'
              }`}>
                ✎ Synced Lyrics Attached
              </span>
            )}
          </div>

          {/* Title & Artist with doodle scribble */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black truncate tracking-tight">
              {currentTrack.title}
            </h1>
            <p className="text-sm font-sans opacity-85 truncate">
              <span className="font-doodle text-lg font-bold text-[#e76f51]">{currentTrack.artist}</span>
              <span className="mx-2 opacity-50">•</span>
              <span className="italic">{currentTrack.album}</span>
            </p>
          </div>

          {/* Interactive Illustrated Cassette Deck with Animated Spools */}
          <div className={`p-3 rounded-2xl border-2 flex items-center justify-between gap-4 max-w-md ${
            isDark ? 'bg-[#24231f] border-[#36342e]' : 'bg-[#f8f3ea] border-[#181816]'
          }`}>
            {/* Left spool */}
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full border-2 border-current flex items-center justify-center ${isPlaying ? 'animate-reel-spin' : ''}`}>
                <div className="w-2.5 h-2.5 rounded-full border border-current bg-current/20"></div>
              </div>
              <div className="font-typewriter text-[10px] opacity-70">REEL A</div>
            </div>

            {/* Center Tape Window */}
            <div className={`flex-1 h-7 rounded border-2 border-current flex items-center justify-center px-2 relative overflow-hidden ${
              isDark ? 'bg-[#181715]' : 'bg-[#ede5d5]'
            }`}>
              <div className="h-0.5 w-full bg-current opacity-30"></div>
              <span className="absolute font-typewriter text-[9px] font-bold tracking-widest uppercase">
                {isPlaying ? '● TAPE PLAYING' : '❚❚ TAPE PAUSED'}
              </span>
            </div>

            {/* Right spool */}
            <div className="flex items-center space-x-2">
              <div className="font-typewriter text-[10px] opacity-70">REEL B</div>
              <div className={`w-8 h-8 rounded-full border-2 border-current flex items-center justify-center ${isPlaying ? 'animate-reel-spin' : ''}`}>
                <div className="w-2.5 h-2.5 rounded-full border border-current bg-current/20"></div>
              </div>
            </div>
          </div>

          {/* Playback Stamp Buttons */}
          <div className="flex items-center justify-center sm:justify-start space-x-3 pt-1">
            <button
              onClick={onTogglePlay}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-2xl border-2 font-display font-extrabold text-xs btn-paper ${
                isDark
                  ? 'bg-[#f4a261] border-[#f5f1e8] text-[#161513] shadow-chalk-sm'
                  : 'bg-[#e76f51] border-[#181816] text-white shadow-paper'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Tape</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Play Tape</span>
                </>
              )}
            </button>

            <button
              onClick={() => onToggleFavorite(currentTrack.id)}
              className={`p-2.5 rounded-2xl border-2 btn-paper ${
                currentTrack.isFavorite
                  ? 'bg-rose-500 border-rose-600 text-white shadow-paper-sm'
                  : isDark
                    ? 'bg-[#24231f] border-[#36342e] text-[#f5f1e8] shadow-chalk-sm'
                    : 'bg-[#f5f0e6] border-[#181816] text-[#181816] shadow-paper-sm'
              }`}
              title="Add to Favorites"
            >
              <Heart className={`w-4 h-4 ${currentTrack.isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={onShufflePlay}
              className={`p-2.5 rounded-2xl border-2 btn-paper ${
                isDark
                  ? 'bg-[#24231f] border-[#36342e] text-[#f5f1e8] shadow-chalk-sm'
                  : 'bg-[#f5f0e6] border-[#181816] text-[#181816] shadow-paper-sm'
              }`}
              title="Shuffle All"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
