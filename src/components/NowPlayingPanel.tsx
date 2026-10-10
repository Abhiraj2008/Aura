import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Disc3,
  Sliders,
  ListOrdered,
  FileCode2,
  Trash2,
  Headphones,
  CheckCircle2,
  Sparkles,
  Info,
  Mic2,
  PenTool
} from 'lucide-react';
import type { Track, LrcLine } from '../types/audio';
import { VisualizerCanvas } from './VisualizerCanvas';
import { parseLrc } from '../utils/lrcParser';

interface NowPlayingPanelProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  queue: Track[];
  theme: 'paper' | 'chalk';
  onRemoveFromQueue: (index: number) => void;
  onSelectTrack: (track: Track) => void;
  onSeek: (time: number) => void;
  onClose: () => void;
}

export const NowPlayingPanel: React.FC<NowPlayingPanelProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  queue,
  theme,
  onRemoveFromQueue,
  onSelectTrack,
  onSeek,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'lyrics' | 'details' | 'queue' | 'eq'>('lyrics');
  const [tapePreset, setTapePreset] = useState<'warm' | 'master' | 'vintage' | 'voice'>('warm');
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  const isDark = theme === 'chalk';

  // Memoize parsed lyrics so we don't re-parse on every audio tick
  const parsedLyrics: LrcLine[] = useMemo(() => {
    return currentTrack?.lyrics ? parseLrc(currentTrack.lyrics) : [];
  }, [currentTrack?.lyrics]);

  // Determine active lyric line
  const activeLyricIndex = parsedLyrics.findIndex((line, i) => {
    const nextLine = parsedLyrics[i + 1];
    return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
  });

  // Auto-scroll to active lyric
  useEffect(() => {
    if (activeLyricIndex >= 0 && lyricsContainerRef.current) {
      const activeEl = lyricsContainerRef.current.children[activeLyricIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [activeLyricIndex]);

  if (!currentTrack) {
    return (
      <div className={`w-full md:w-84 h-full border-l-2 p-6 flex flex-col items-center justify-center text-center select-none shrink-0 transition-colors duration-300 ${
        isDark ? 'bg-[#181715] border-[#36342e] text-[#f5f1e8]' : 'bg-[#f7f2e9] border-[#181816] text-[#181816]'
      }`}>
        <Headphones className="w-12 h-12 opacity-40 mb-3" />
        <div className="font-display font-bold text-sm">NO TAPE ON DECK</div>
        <p className="font-doodle text-base opacity-75 mt-1 max-w-[200px]">
          drop a cassette into the slot to inspect track telemetry & live lyric scrolls!
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full md:w-84 h-full border-l-2 flex flex-col justify-between select-none shrink-0 overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-[#181715] border-[#36342e] text-[#f5f1e8]' : 'bg-[#f7f2e9] border-[#181816] text-[#181816]'
    }`}>
      {/* Top Header */}
      <div className={`p-4 border-b-2 flex items-center justify-between ${isDark ? 'border-[#36342e]' : 'border-[#181816]'}`}>
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#e76f51]" />
          <span className="font-display font-extrabold text-xs tracking-wider uppercase">
            STUDIO NOTEBOOK
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg border border-current hover:bg-current/10 transition-colors"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className={`grid grid-cols-4 px-2 pt-2 text-xs border-b-2 font-typewriter ${
        isDark ? 'border-[#36342e]' : 'border-[#181816]'
      }`}>
        <button
          onClick={() => setActiveTab('lyrics')}
          className={`pb-2 font-bold flex items-center justify-center space-x-1 transition-all border-b-2 ${
            activeTab === 'lyrics'
              ? isDark ? 'border-[#f4a261] text-[#f4a261]' : 'border-[#e76f51] text-[#e76f51]'
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
        >
          <Mic2 className="w-3.5 h-3.5" />
          <span>Lyrics</span>
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`pb-2 font-bold flex items-center justify-center space-x-1 transition-all border-b-2 ${
            activeTab === 'details'
              ? isDark ? 'border-[#f4a261] text-[#f4a261]' : 'border-[#e76f51] text-[#e76f51]'
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>Specs</span>
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-2 font-bold flex items-center justify-center space-x-1 transition-all border-b-2 ${
            activeTab === 'queue'
              ? isDark ? 'border-[#f4a261] text-[#f4a261]' : 'border-[#e76f51] text-[#e76f51]'
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
        >
          <ListOrdered className="w-3.5 h-3.5" />
          <span>Queue</span>
        </button>
        <button
          onClick={() => setActiveTab('eq')}
          className={`pb-2 font-bold flex items-center justify-center space-x-1 transition-all border-b-2 ${
            activeTab === 'eq'
              ? isDark ? 'border-[#f4a261] text-[#f4a261]' : 'border-[#e76f51] text-[#e76f51]'
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Tape FX</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Lyrics Tab - Songwriter's Ruled Notebook */}
        {activeTab === 'lyrics' && (
          <div className="space-y-4 flex flex-col h-full">
            {/* Header with Tape Label */}
            <div className={`p-3 rounded-2xl border-2 flex items-center space-x-3 ${
              isDark ? 'bg-[#22211d] border-[#36342e]' : 'bg-[#fffdf9] border-[#181816] shadow-paper-sm'
            }`}>
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-current bg-stone-900 shrink-0">
                {currentTrack.coverUrl ? (
                  <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Disc3 className="w-5 h-5 text-stone-500" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display font-bold text-xs truncate">{currentTrack.title}</div>
                <div className="font-doodle text-sm opacity-80 truncate">{currentTrack.artist}</div>
              </div>
            </div>

            {/* Ruled Notebook Sheet for Lyrics */}
            {parsedLyrics.length > 0 ? (
              <div className={`rounded-2xl border-2 p-4 max-h-[380px] overflow-y-auto notebook-ruled font-sans relative ${
                isDark ? 'bg-[#201f1c] border-[#36342e]' : 'bg-[#fffdf9] border-[#181816] shadow-paper'
              }`}>
                {/* Pencil doodle mark */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-current/10 font-doodle text-base opacity-75">
                  <span>✎ Songwriter's Lyric Sheet</span>
                  <span className="text-xs font-typewriter">click line to seek</span>
                </div>

                <div ref={lyricsContainerRef} className="space-y-2 py-2 text-center">
                  {parsedLyrics.map((line, idx) => {
                    const isActive = idx === activeLyricIndex;
                    return (
                      <div
                        key={idx}
                        onClick={() => onSeek(line.time)}
                        className={`cursor-pointer px-2 py-1 rounded transition-all duration-200 text-sm leading-relaxed ${
                          isActive
                            ? 'lyric-highlighter font-bold text-base scale-105'
                            : 'opacity-50 hover:opacity-100 hover:scale-[1.02]'
                        }`}
                      >
                        {line.text}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className={`rounded-2xl border-2 p-6 text-center space-y-3 ${
                isDark ? 'bg-[#201f1c] border-[#36342e]' : 'bg-[#fffdf9] border-[#181816] shadow-paper'
              }`}>
                <div className="w-12 h-12 mx-auto rounded-2xl bg-[#e76f51]/15 border-2 border-[#e76f51] flex items-center justify-center text-[#e76f51]">
                  <PenTool className="w-6 h-6" />
                </div>
                <div className="font-display font-bold text-xs uppercase">NO .LRC LYRIC SHEET FOUND</div>
                <p className="font-doodle text-base opacity-80 leading-relaxed">
                  Place a <span className="font-typewriter text-xs underline font-bold">{currentTrack.title}.lrc</span> file in the same folder to see synchronized highlighter lyrics!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Specs Tab */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            {/* Spinning Turntable Deck */}
            <div className="relative flex justify-center py-2">
              <div className={`w-44 h-44 rounded-full border-4 p-2 relative flex items-center justify-center ${
                isDark ? 'bg-[#100f0e] border-[#f5f1e8] shadow-chalk' : 'bg-[#181816] border-[#181816] shadow-paper-lg'
              }`}>
                {/* Outer vinyl grooves */}
                <div className="w-full h-full rounded-full border border-white/20 flex items-center justify-center relative overflow-hidden">
                  {currentTrack.coverUrl ? (
                    <img
                      src={currentTrack.coverUrl}
                      alt={currentTrack.title}
                      className={`w-28 h-28 rounded-full object-cover border-2 border-white/40 ${isPlaying ? 'animate-reel-spin' : ''}`}
                    />
                  ) : (
                    <Disc3 className={`w-28 h-28 text-amber-400 ${isPlaying ? 'animate-reel-spin' : ''}`} />
                  )}
                  {/* Turntable spindle */}
                  <div className="absolute w-4 h-4 rounded-full bg-[#f6f1e8] border-2 border-black z-20"></div>
                </div>
              </div>
            </div>

            <div className="text-center space-y-0.5">
              <h3 className="font-display font-black text-sm truncate">{currentTrack.title}</h3>
              <p className="font-doodle text-lg opacity-85 truncate leading-tight">{currentTrack.artist}</p>
              <p className="font-sans text-xs opacity-60 truncate">{currentTrack.album}</p>
            </div>

            {/* Doodle Spectrum Canvas */}
            <VisualizerCanvas isPlaying={isPlaying} height={90} theme={theme} />

            {/* Hardware Telemetry Specs Card */}
            <div className={`p-4 rounded-2xl border-2 space-y-2.5 ${
              isDark ? 'bg-[#22211d] border-[#36342e]' : 'bg-[#fffdf9] border-[#181816] shadow-paper'
            }`}>
              <div className="flex items-center justify-between text-xs font-typewriter font-bold">
                <span className="flex items-center space-x-1.5">
                  <FileCode2 className="w-3.5 h-3.5 text-[#e76f51]" />
                  <span>DECODER SPECS</span>
                </span>
                <span className="px-2 py-0.5 rounded border border-current">
                  .{currentTrack.format.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 font-typewriter text-[11px]">
                <div className="p-2 rounded-xl border border-current/20">
                  <span className="opacity-60 block text-[9px]">SAMPLE RATE</span>
                  <span className="font-bold">{currentTrack.metadata?.sampleRate || '48.0 kHz'}</span>
                </div>
                <div className="p-2 rounded-xl border border-current/20">
                  <span className="opacity-60 block text-[9px]">BIT DEPTH</span>
                  <span className="font-bold">{currentTrack.metadata?.bitDepth || '24-bit PCM'}</span>
                </div>
                <div className="p-2 rounded-xl border border-current/20">
                  <span className="opacity-60 block text-[9px]">BITRATE</span>
                  <span className="font-bold">{currentTrack.metadata?.bitrate || '1411 kbps'}</span>
                </div>
                <div className="p-2 rounded-xl border border-current/20">
                  <span className="opacity-60 block text-[9px]">CHANNELS</span>
                  <span className="font-bold">{currentTrack.metadata?.channels || 'Stereo 2.0'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Queue Tab */}
        {activeTab === 'queue' && (
          <div className="space-y-2 font-typewriter">
            <div className="flex items-center justify-between text-xs opacity-70 pb-1">
              <span>MIXTAPE QUEUE</span>
              <span>{queue.length} TRACKS</span>
            </div>

            {queue.length === 0 ? (
              <div className="text-center py-10 text-xs opacity-60 font-doodle text-base">
                Queue is empty! Click "+ Add" on any song to queue it up.
              </div>
            ) : (
              <div className="space-y-2">
                {queue.map((track, idx) => (
                  <div
                    key={`${track.id}-${idx}`}
                    className={`flex items-center justify-between p-2.5 rounded-xl border-2 transition-all btn-paper ${
                      isDark ? 'bg-[#22211d] border-[#36342e]' : 'bg-[#fffdf9] border-[#181816] shadow-paper-sm'
                    }`}
                  >
                    <div
                      className="flex items-center space-x-2.5 min-w-0 cursor-pointer flex-1"
                      onClick={() => onSelectTrack(track)}
                    >
                      <span className="text-[10px] opacity-60 w-4">
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <div className="font-display font-bold text-xs truncate">
                          {track.title}
                        </div>
                        <div className="font-doodle text-sm opacity-80 truncate">
                          {track.artist}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveFromQueue(idx)}
                      className="p-1 rounded opacity-50 hover:opacity-100 hover:text-rose-500 transition-colors"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DSP Tape FX Tab */}
        {activeTab === 'eq' && (
          <div className="space-y-4">
            <div className="font-display font-extrabold text-xs uppercase tracking-wider">
              ✦ TAPE SATURATION & SOUND FILTERS
            </div>
            <div className="space-y-2.5">
              {[
                { id: 'warm', name: 'Analog Cassette Tape Warmth', desc: 'Mild magnetic tape saturation & harmonic rich acoustic low-end' },
                { id: 'master', name: 'Studio Reference Master', desc: 'Flat 0dB acoustic response for bit-perfect audio fidelity' },
                { id: 'vintage', name: 'Vintage Vinyl Turntable', desc: 'Warm RIAA curve with enhanced sub-bass resonance' },
                { id: 'voice', name: 'Podcast Speech Presence', desc: 'Mid-range presence boost tuned for clear spoken vocals' },
              ].map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setTapePreset(preset.id as unknown as 'warm' | 'master' | 'vintage' | 'voice')}
                  className={`w-full text-left p-3 rounded-2xl border-2 transition-all btn-paper ${
                    tapePreset === preset.id
                      ? isDark
                        ? 'bg-[#2d2b25] border-[#f5f1e8] shadow-chalk-sm'
                        : 'bg-[#faedcb] border-[#181816] shadow-paper font-bold'
                      : isDark
                        ? 'bg-[#22211d] border-[#36342e]'
                        : 'bg-[#fffdf9] border-[#181816] shadow-paper-sm'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-display font-bold">
                    <span>{preset.name}</span>
                    {tapePreset === preset.id && <CheckCircle2 className="w-3.5 h-3.5 text-[#e76f51]" />}
                  </div>
                  <div className="font-sans text-[11px] opacity-75 mt-1">{preset.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
