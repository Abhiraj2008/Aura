import React, { useState } from 'react';
import {
  Music2,
  Mic,
  Heart,
  Plus,
  Layers,
  ChevronDown,
  Info,
  Sliders,
  Keyboard,
  Sparkles,
  FileAudio,
  Bookmark,
  X
} from 'lucide-react';
import type { ViewMode } from '../types/audio';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  totalTracks: number;
  musicCount: number;
  podcastsCount: number;
  favoritesCount: number;
  activePlaylist: string | null;
  onSelectPlaylist: (playlist: string | null) => void;
  theme: 'paper' | 'chalk';
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  totalTracks,
  musicCount,
  podcastsCount,
  favoritesCount,
  activePlaylist,
  onSelectPlaylist,
  theme,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<'formats' | 'shortcuts' | 'engine' | null>(null);

  const isDark = theme === 'chalk';

  const handleViewSelect = (view: ViewMode) => {
    onViewChange(view);
    onSelectPlaylist(null);
    if (onCloseMobile) onCloseMobile();
  };

  const handlePlaylistSelect = (id: string) => {
    onSelectPlaylist(id);
    if (onCloseMobile) onCloseMobile();
  };

  const playlists = [
    { id: 'p1', name: 'Late Night Mixtape', count: 18, color: 'text-[#e76f51]' },
    { id: 'p2', name: 'Coffee & Lo-Fi Sketches', count: 24, color: 'text-[#e9c46a]' },
    { id: 'p3', name: 'Podcasts & Talk Tapes', count: 7, color: 'text-[#2a9d8f]' },
    { id: 'p4', name: 'Acoustic Master Sessions', count: 12, color: 'text-[#3d5a80]' },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      <aside className={`fixed md:relative inset-y-0 left-0 z-50 md:z-0 w-72 md:w-64 h-full md:h-[calc(100dvh-3.25rem)] border-r-2 flex flex-col justify-between py-4 select-none shrink-0 overflow-y-auto transition-transform md:transition-none duration-300 ${
        isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
      } ${
        isDark
          ? 'bg-[#181715] border-[#36342e] text-[#f5f1e8]'
          : 'bg-[#f7f2e9] border-[#181816] text-[#181816]'
      }`}>
        {/* Mobile Header with Close Button */}
        <div className="flex md:hidden items-center justify-between px-4 pb-3 mb-2 border-b-2 border-current/20">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#e76f51]" />
            <span className="font-display font-extrabold text-xs tracking-wider uppercase">
              AUDIO ZINE LIBRARY
            </span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg border border-current hover:bg-current/10"
            title="Close Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Notebook binding perforations along left edge */}
        <div className="absolute left-1.5 top-0 bottom-0 flex flex-col justify-around pointer-events-none opacity-40">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full border ${isDark ? 'border-white/40 bg-[#161513]' : 'border-black/50 bg-[#e8e0d0]'}`} />
          ))}
        </div>

        <div className="space-y-6 px-4 pl-6">
          {/* Library Section */}
          <div>
            <div className="flex items-center space-x-1.5 pb-2">
              <span className="font-typewriter text-[11px] font-bold uppercase tracking-wider opacity-70">
                ✦ Tape Archive
              </span>
            </div>

            <nav className="space-y-1.5">
              <button
                onClick={() => handleViewSelect('all')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all btn-paper ${
                  currentView === 'all' && !activePlaylist
                    ? isDark
                      ? 'bg-[#f4a261] border-[#f5f1e8] text-[#161513] shadow-chalk-sm'
                      : 'bg-[#e76f51] border-[#181816] text-white shadow-paper-sm'
                    : isDark
                      ? 'bg-[#22211d] border-[#36342e] text-[#f5f1e8] hover:border-[#f5f1e8]'
                      : 'bg-[#fffdf9] border-[#181816] text-[#181816] hover:bg-[#fff7ea]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Music2 className="w-4 h-4" />
                  <span className="font-display">All Audio Files</span>
                </div>
                <span className="text-[11px] font-typewriter px-1.5 py-0.5 rounded border border-current font-bold">
                  {totalTracks}
                </span>
              </button>

              <button
                onClick={() => handleViewSelect('music')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all btn-paper ${
                  currentView === 'music'
                    ? isDark
                      ? 'bg-[#f4a261] border-[#f5f1e8] text-[#161513] shadow-chalk-sm'
                      : 'bg-[#e76f51] border-[#181816] text-white shadow-paper-sm'
                    : isDark
                      ? 'bg-[#22211d] border-[#36342e] text-[#f5f1e8] hover:border-[#f5f1e8]'
                      : 'bg-[#fffdf9] border-[#181816] text-[#181816] hover:bg-[#fff7ea]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Layers className="w-4 h-4" />
                  <span className="font-display">Music Tracks</span>
                </div>
                <span className="text-[11px] font-typewriter px-1.5 py-0.5 rounded border border-current font-bold">
                  {musicCount}
                </span>
              </button>

              <button
                onClick={() => handleViewSelect('podcasts')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all btn-paper ${
                  currentView === 'podcasts'
                    ? isDark
                      ? 'bg-[#f4a261] border-[#f5f1e8] text-[#161513] shadow-chalk-sm'
                      : 'bg-[#e76f51] border-[#181816] text-white shadow-paper-sm'
                    : isDark
                      ? 'bg-[#22211d] border-[#36342e] text-[#f5f1e8] hover:border-[#f5f1e8]'
                      : 'bg-[#fffdf9] border-[#181816] text-[#181816] hover:bg-[#fff7ea]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Mic className="w-4 h-4" />
                  <span className="font-display">Podcasts & Voice</span>
                </div>
                <span className="text-[11px] font-typewriter px-1.5 py-0.5 rounded border border-current font-bold">
                  {podcastsCount}
                </span>
              </button>

              <button
                onClick={() => handleViewSelect('favorites')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all btn-paper ${
                  currentView === 'favorites'
                    ? isDark
                      ? 'bg-[#f4a261] border-[#f5f1e8] text-[#161513] shadow-chalk-sm'
                      : 'bg-[#e76f51] border-[#181816] text-white shadow-paper-sm'
                    : isDark
                      ? 'bg-[#22211d] border-[#36342e] text-[#f5f1e8] hover:border-[#f5f1e8]'
                      : 'bg-[#fffdf9] border-[#181816] text-[#181816] hover:bg-[#fff7ea]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Heart className={`w-4 h-4 ${currentView === 'favorites' ? 'fill-current' : ''}`} />
                  <span className="font-display">Favorites</span>
                </div>
                <span className="text-[11px] font-typewriter px-1.5 py-0.5 rounded border border-current font-bold">
                  {favoritesCount}
                </span>
              </button>
            </nav>
          </div>

          {/* Playlists Section */}
          <div>
            <div className="flex items-center justify-between pb-2">
              <span className="font-typewriter text-[11px] font-bold uppercase tracking-wider opacity-70">
                ✎ Mixtapes
              </span>
              <button
                className={`p-1 rounded border btn-paper ${isDark ? 'border-[#36342e] bg-[#22211d]' : 'border-[#181816] bg-[#fffdf9]'}`}
                title="Create New Mixtape"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              {playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => handlePlaylistSelect(pl.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs border transition-all btn-paper ${
                    activePlaylist === pl.name
                      ? isDark
                        ? 'bg-[#2a2924] border-[#f5f1e8] font-bold shadow-chalk-sm'
                        : 'bg-[#faedcb] border-[#181816] font-bold shadow-paper-sm'
                      : isDark
                        ? 'border-[#36342e] bg-[#1e1d1a] opacity-80 hover:opacity-100'
                        : 'border-[#181816]/30 bg-[#fffdf9] hover:border-[#181816]'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <Bookmark className={`w-3.5 h-3.5 shrink-0 ${pl.color}`} />
                    <span className="font-sans font-medium truncate">{pl.name}</span>
                  </div>
                  <span className="text-[10px] font-typewriter px-1 py-0.2 rounded border border-current opacity-70">
                    {pl.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dropdown Menu: "More about this app" - Tactile Sticky Note */}
        <div className={`px-4 pl-6 pt-3 border-t-2 space-y-2 ${isDark ? 'border-[#36342e]' : 'border-[#181816]'}`}>
          <div className="relative">
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 text-xs font-bold btn-paper ${
                isDark
                  ? 'bg-[#22211d] border-[#36342e] text-[#f5f1e8] shadow-chalk-sm'
                  : 'bg-[#fffdf9] border-[#181816] text-[#181816] shadow-paper-sm'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Info className="w-3.5 h-3.5 text-[#e76f51]" />
                <span className="font-display">More about this app</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Expandable Accordion Menu */}
            {isMoreMenuOpen && (
              <div className={`mt-2 p-2 rounded-xl border-2 space-y-1.5 shadow-paper-lg animate-in fade-in duration-200 ${
                isDark ? 'bg-[#22211d] border-[#f5f1e8]' : 'bg-[#fffdf9] border-[#181816]'
              }`}>
                <button
                  onClick={() => setActiveModal('formats')}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-left text-xs font-sans font-semibold hover:bg-current/10 transition-colors"
                >
                  <FileAudio className="w-3.5 h-3.5 text-[#e76f51]" />
                  <span>Supported Audio Formats</span>
                </button>

                <button
                  onClick={() => setActiveModal('engine')}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-left text-xs font-sans font-semibold hover:bg-current/10 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#2a9d8f]" />
                  <span>Artwork & .LRC Karaoke</span>
                </button>

                <button
                  onClick={() => setActiveModal('shortcuts')}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-left text-xs font-sans font-semibold hover:bg-current/10 transition-colors"
                >
                  <Keyboard className="w-3.5 h-3.5 text-[#e9c46a]" />
                  <span>Keyboard Shortcuts</span>
                </button>
              </div>
            )}
          </div>

          {/* Engine Status Tape Badge */}
          <div className={`px-3 py-2 rounded-xl border-2 flex items-center justify-between text-[11px] font-typewriter ${
            isDark ? 'bg-[#1e1d1a] border-[#36342e]' : 'bg-[#f4efe4] border-[#181816]'
          }`}>
            <span className="flex items-center space-x-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>ENGINE READY</span>
            </span>
            <span className="font-bold text-[#e76f51]">96kHz/24b</span>
          </div>
        </div>
      </aside>

      {/* Info Modal Dialog */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-3xl border-2 p-6 shadow-paper-pop space-y-4 ${
            isDark ? 'bg-[#22211d] border-[#f5f1e8] text-[#f5f1e8]' : 'bg-[#fffdf9] border-[#181816] text-[#181816]'
          }`}>
            {activeModal === 'formats' && (
              <>
                <div className="flex items-center justify-between border-b-2 border-current pb-3">
                  <h3 className="font-display font-extrabold text-base flex items-center space-x-2">
                    <FileAudio className="w-4 h-4 text-[#e76f51]" />
                    <span>Supported Audio Formats</span>
                  </h3>
                  <button onClick={() => setActiveModal(null)} className="font-typewriter text-xs font-bold hover:text-[#e76f51]">✕ CLOSE</button>
                </div>
                <div className="space-y-2 text-xs max-h-80 overflow-y-auto pr-1">
                  {[
                    { ext: '.FLAC', desc: 'Studio Master Lossless Audio (up to 24-bit / 192kHz)' },
                    { ext: '.MP3', desc: 'MPEG-1 Audio Layer III with embedded ID3 APIC artwork' },
                    { ext: '.M4A', desc: 'Apple AAC & ALAC containers for high dynamic range' },
                    { ext: '.WAV', desc: 'Uncompressed Linear PCM waveform' },
                    { ext: '.OGG', desc: 'Vorbis open audio stream container' },
                    { ext: '.AAC', desc: 'Advanced Audio Coding for streaming & podcasts' },
                    { ext: '.OPUS', desc: 'Next-gen ultra low latency speech and music codec' },
                    { ext: '.WMA', desc: 'Windows Media Audio standard & lossless codec' },
                    { ext: '.AIFF', desc: 'Audio Interchange File Format (Mac/Studio uncompressed PCM)' },
                    { ext: '.ALAC', desc: 'Apple Lossless Audio Codec for bit-perfect fidelity' },
                    { ext: '.WEBM', desc: 'WebM Audio container (Opus / Vorbis streams)' },
                    { ext: '.M4B', desc: 'Audiobook & podcast chaptered audio container' }
                  ].map(f => (
                    <div key={f.ext} className={`p-2.5 rounded-xl border-2 ${isDark ? 'bg-[#181715] border-[#36342e]' : 'bg-[#f5f0e6] border-[#181816]'}`}>
                      <div className="font-typewriter font-bold text-[#e76f51]">{f.ext}</div>
                      <div className="opacity-80 text-[11px] mt-0.5">{f.desc}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeModal === 'engine' && (
              <>
                <div className="flex items-center justify-between border-b-2 border-current pb-3">
                  <h3 className="font-display font-extrabold text-base flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-[#2a9d8f]" />
                    <span>Artwork & .LRC Lyrics</span>
                  </h3>
                  <button onClick={() => setActiveModal(null)} className="font-typewriter text-xs font-bold hover:text-[#e76f51]">✕ CLOSE</button>
                </div>
                <div className="space-y-3 text-xs leading-relaxed opacity-90">
                  <p>
                    <strong>Embedded ID3 Picture:</strong> Aura extracts the raw APIC picture from inside your MP3, M4A, FLAC, and OGG files and renders it as an authentic polaroid cover.
                  </p>
                  <p>
                    <strong>Companion .LRC Lyrics:</strong> When a file named <code className="px-1 py-0.5 rounded border border-current font-typewriter">SongName.lrc</code> exists alongside the audio, the app highlights karaoke lines live with a watercolor highlighter!
                  </p>
                </div>
              </>
            )}

            {activeModal === 'shortcuts' && (
              <>
                <div className="flex items-center justify-between border-b-2 border-current pb-3">
                  <h3 className="font-display font-extrabold text-base flex items-center space-x-2">
                    <Keyboard className="w-4 h-4 text-[#e9c46a]" />
                    <span>Keyboard Controls</span>
                  </h3>
                  <button onClick={() => setActiveModal(null)} className="font-typewriter text-xs font-bold hover:text-[#e76f51]">✕ CLOSE</button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-current/20">
                    <span>Play / Pause</span>
                    <kbd className="px-2 py-0.5 rounded border border-current font-typewriter text-[10px]">Space</kbd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-current/20">
                    <span>Seek Forward 5s</span>
                    <kbd className="px-2 py-0.5 rounded border border-current font-typewriter text-[10px]">Arrow Right</kbd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-current/20">
                    <span>Seek Backward 5s</span>
                    <kbd className="px-2 py-0.5 rounded border border-current font-typewriter text-[10px]">Arrow Left</kbd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-current/20">
                    <span>Global Search</span>
                    <kbd className="px-2 py-0.5 rounded border border-current font-typewriter text-[10px]">Ctrl + K</kbd>
                  </div>
                </div>
              </>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className={`px-5 py-2 rounded-xl border-2 font-display font-bold text-xs btn-paper ${
                  isDark
                    ? 'bg-[#f4a261] border-[#f5f1e8] text-[#161513] shadow-chalk-sm'
                    : 'bg-[#e76f51] border-[#181816] text-white shadow-paper'
                }`}
              >
                Close Memo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
