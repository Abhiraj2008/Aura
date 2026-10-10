import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Shuffle,
  Repeat,
  Repeat1,
  Gauge,
  PanelRightClose,
  PanelRightOpen,
  Heart,
  Disc3
} from 'lucide-react';
import type { Track } from '../types/audio';
import { FluidPlayingIndicator } from './FluidPlayingIndicator';

interface PlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  isInspectorOpen: boolean;
  theme: 'paper' | 'chalk';
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onCyclePlaybackRate: () => void;
  onToggleFavorite: (trackId: string) => void;
  onToggleInspector: () => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  playbackRate,
  isShuffle,
  repeatMode,
  isInspectorOpen,
  theme,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
  onCyclePlaybackRate,
  onToggleFavorite,
  onToggleInspector
}) => {
  const [hoverSeekTime, setHoverSeekTime] = useState<number | null>(null);

  const isDark = theme === 'chalk';

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || sec < 0) return '0:00';
    const mins = Math.floor(sec / 60);
    const remainingSecs = Math.floor(sec % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleTimelineHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    setHoverSeekTime(Math.max(0, Math.min(duration, pos * duration)));
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    onSeek(Math.max(0, Math.min(duration, pos * duration)));
  };

  return (
    <footer className="fixed bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 z-40 select-none pb-safe">
      <div className={`max-w-7xl mx-auto rounded-2xl sm:rounded-3xl border-2 px-3 sm:px-5 py-2 sm:py-3 transition-all duration-300 ${
        isDark
          ? 'bg-[#1e1d1a] border-[#36342e] text-[#f5f1e8] shadow-chalk'
          : 'bg-[#fffdf9] border-[#181816] text-[#181816] shadow-paper-lg'
      }`}>

        {/* MOBILE COMPACT VIEW (< md screens) */}
        <div className="flex md:hidden flex-col w-full space-y-1.5">
          {/* Top Micro Scrub Bar */}
          <div
            onClick={handleTimelineClick}
            className={`w-full h-2 rounded-full cursor-pointer relative overflow-hidden border ${
              isDark ? 'bg-[#292723] border-[#36342e]' : 'bg-[#ece4d4] border-[#181816]/40'
            }`}
          >
            <div
              className="h-full bg-[#e76f51] rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            {/* Left: Artwork & Title */}
            <div className="flex items-center space-x-2.5 min-w-0 flex-1">
              <div className={`relative shrink-0 w-10 h-10 rounded-lg overflow-hidden border-2 rotate-[-1deg] ${
                isDark ? 'border-[#f5f1e8] bg-[#161513]' : 'border-[#181816] bg-white shadow-paper-sm'
              }`}>
                {currentTrack?.coverUrl ? (
                  <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-stone-900">
                    <Disc3 className="w-5 h-5 text-stone-500" />
                  </div>
                )}
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                    <FluidPlayingIndicator className="h-3.5" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="font-display font-bold text-xs truncate">
                  {currentTrack ? currentTrack.title : 'Deck Ready'}
                </div>
                <div className="font-doodle text-sm opacity-80 truncate leading-none pt-0.5">
                  {currentTrack ? currentTrack.artist : 'Select track to play'}
                </div>
              </div>
            </div>

            {/* Right: Tactile Mobile Action Buttons */}
            <div className="flex items-center space-x-1 shrink-0">
              {currentTrack && (
                <button
                  onClick={() => onToggleFavorite(currentTrack.id)}
                  className="p-1.5 rounded-lg opacity-70 hover:opacity-100"
                  title="Favorite"
                >
                  <Heart className={`w-4 h-4 ${currentTrack.isFavorite ? 'fill-rose-500 text-rose-500 opacity-100' : ''}`} />
                </button>
              )}

              <button
                onClick={onPrev}
                className="p-1.5 rounded-lg border-2 btn-paper hidden xs:flex items-center justify-center"
                title="Previous"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onTogglePlay}
                className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center btn-paper ${
                  isDark
                    ? 'bg-[#f4a261] border-[#f5f1e8] text-[#161513] shadow-chalk-sm'
                    : 'bg-[#e76f51] border-[#181816] text-white shadow-paper-sm'
                }`}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={onNext}
                className="p-1.5 rounded-lg border-2 btn-paper flex items-center justify-center"
                title="Next"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onToggleInspector}
                className={`p-1.5 rounded-lg border-2 btn-paper ${
                  isInspectorOpen
                    ? isDark ? 'bg-[#f4a261] border-[#f5f1e8] text-[#161513]' : 'bg-[#faedcb] border-[#181816]'
                    : isDark ? 'border-[#36342e] bg-[#22211d]' : 'border-[#181816] bg-[#f8f3ea]'
                }`}
                title="Open Studio Notebook (Lyrics / EQ)"
              >
                {isInspectorOpen ? (
                  <PanelRightClose className="w-4 h-4" />
                ) : (
                  <PanelRightOpen className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* DESKTOP FULL VIEW (>= md screens) */}
        <div className="hidden md:flex items-center justify-between gap-4 w-full">
          {/* Left: Mini Polaroid Artwork & Track Info */}
          <div className="flex items-center space-x-3 w-1/4 min-w-[200px]">
            <div className={`relative group shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 rotate-[-1deg] transition-transform group-hover:rotate-0 ${
              isDark ? 'border-[#f5f1e8] bg-[#161513]' : 'border-[#181816] bg-white shadow-paper-sm'
            }`}>
              {currentTrack?.coverUrl ? (
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-stone-900">
                  <Disc3 className="w-6 h-6 text-stone-500" />
                </div>
              )}
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                  <FluidPlayingIndicator className="h-4.5" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5">
                <span className="font-display font-bold text-xs truncate">
                  {currentTrack ? currentTrack.title : 'Deck Ready'}
                </span>
                {currentTrack && (
                  <span className="text-[9px] font-typewriter font-bold uppercase px-1 py-0.2 rounded border border-current">
                    .{currentTrack.format}
                  </span>
                )}
              </div>
              <div className="font-doodle text-base opacity-80 truncate leading-none pt-0.5">
                {currentTrack ? `${currentTrack.artist}` : 'drop a track into deck'}
              </div>
            </div>

            {currentTrack && (
              <button
                onClick={() => onToggleFavorite(currentTrack.id)}
                className="p-1 rounded opacity-60 hover:opacity-100 hover:text-rose-500 transition-colors shrink-0"
                title="Favorite"
              >
                <Heart className={`w-4 h-4 ${currentTrack.isFavorite ? 'fill-rose-500 text-rose-500 opacity-100' : ''}`} />
              </button>
            )}
          </div>

          {/* Center: Tactile Walkman Transport Controls and Timeline */}
          <div className="flex-1 max-w-xl flex flex-col items-center space-y-1.5">
            {/* Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={onToggleShuffle}
                className={`p-1.5 rounded-xl border-2 btn-paper ${
                  isShuffle
                    ? isDark ? 'bg-[#f4a261] border-[#f5f1e8] text-[#161513]' : 'bg-[#faedcb] border-[#181816]'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
                title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={onPrev}
                className={`p-1.5 rounded-xl border-2 btn-paper ${
                  isDark ? 'border-[#36342e] bg-[#22211d]' : 'border-[#181816] bg-[#f8f3ea] shadow-paper-sm'
                }`}
                title="Previous Track"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Main Tactile Stamped Play Button */}
              <button
                onClick={onTogglePlay}
                className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-transform active:scale-95 btn-paper ${
                  isDark
                    ? 'bg-[#f4a261] border-[#f5f1e8] text-[#161513] shadow-chalk-sm'
                    : 'bg-[#e76f51] border-[#181816] text-white shadow-paper'
                }`}
                title={isPlaying ? 'Pause Tape' : 'Roll Tape'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={onNext}
                className={`p-1.5 rounded-xl border-2 btn-paper ${
                  isDark ? 'border-[#36342e] bg-[#22211d]' : 'border-[#181816] bg-[#f8f3ea] shadow-paper-sm'
                }`}
                title="Next Track"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={onToggleRepeat}
                className={`p-1.5 rounded-xl border-2 btn-paper ${
                  repeatMode !== 'off'
                    ? isDark ? 'bg-[#f4a261] border-[#f5f1e8] text-[#161513]' : 'bg-[#faedcb] border-[#181816]'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
                title={`Repeat: ${repeatMode.toUpperCase()}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            </div>

            {/* Timeline Scrub Bar */}
            <div className="w-full flex items-center space-x-2 text-[11px] font-typewriter select-none">
              <span className="w-10 text-right font-bold">{formatSeconds(currentTime)}</span>

              <div
                className="relative flex-1 h-3 flex items-center cursor-pointer group py-1"
                onMouseMove={handleTimelineHover}
                onMouseLeave={() => setHoverSeekTime(null)}
                onClick={handleTimelineClick}
              >
                <div className={`w-full h-1.5 rounded-full overflow-hidden border ${
                  isDark ? 'bg-[#292723] border-[#36342e]' : 'bg-[#ece4d4] border-[#181816]'
                }`}>
                  <div
                    className="h-full bg-[#e76f51] rounded-full transition-all duration-75 relative"
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border border-[#181816] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>

                {hoverSeekTime !== null && (
                  <div
                    className="absolute -top-6 px-1.5 py-0.5 rounded text-[10px] bg-[#181816] text-white pointer-events-none transform -translate-x-1/2 shadow"
                    style={{ left: `${(hoverSeekTime / duration) * 100}%` }}
                  >
                    {formatSeconds(hoverSeekTime)}
                  </div>
                )}
              </div>

              <span className="w-10 text-left font-bold">{formatSeconds(duration)}</span>
            </div>
          </div>

          {/* Right: Walkman Speed, Volume & Inspector Toggle */}
          <div className="flex items-center justify-end space-x-3 w-1/4 min-w-[200px]">
            {/* Playback speed stamp */}
            <button
              onClick={onCyclePlaybackRate}
              className={`flex items-center space-x-1 text-[11px] font-typewriter font-bold px-2 py-1 rounded-xl border-2 btn-paper ${
                isDark ? 'bg-[#22211d] border-[#36342e]' : 'bg-[#f8f3ea] border-[#181816] shadow-paper-sm'
              }`}
              title="Tape Playback Speed"
            >
              <Gauge className="w-3 h-3 text-[#e76f51]" />
              <span>{playbackRate}x</span>
            </button>

            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onToggleMute}
                className="opacity-70 hover:opacity-100 transition-opacity"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-500" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-18 h-1 rounded-lg cursor-pointer"
                title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              />
            </div>

            {/* Inspector Panel Toggle */}
            <button
              onClick={onToggleInspector}
              className={`p-2 rounded-xl border-2 btn-paper ${
                isInspectorOpen
                  ? isDark ? 'bg-[#f4a261] border-[#f5f1e8] text-[#161513]' : 'bg-[#faedcb] border-[#181816]'
                  : isDark ? 'border-[#36342e] bg-[#22211d]' : 'border-[#181816] bg-[#f8f3ea] shadow-paper-sm'
              }`}
              title="Toggle Studio Inspector"
            >
              {isInspectorOpen ? (
                <PanelRightClose className="w-4 h-4" />
              ) : (
                <PanelRightOpen className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default PlayerBar;
