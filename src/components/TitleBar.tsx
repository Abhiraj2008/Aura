import React from 'react';
import { Minus, Square, X, Search, FolderPlus, FileAudio, Sparkles, Sun, Moon, Menu } from 'lucide-react';

interface TitleBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onImportFiles: () => void;
  onScanFolder: () => void;
  totalTracksCount: number;
  theme: 'paper' | 'chalk';
  onToggleTheme: () => void;
  onReplayIntro?: () => void;
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  searchQuery,
  onSearchChange,
  onImportFiles,
  onScanFolder,
  totalTracksCount,
  theme,
  onToggleTheme,
  onReplayIntro,
  onToggleMobileSidebar
}) => {
  const isElectron = typeof window !== 'undefined' && 'electronAPI' in window;

  const handleMinimize = () => {
    if (isElectron) {
      (window as unknown as { electronAPI: { minimizeWindow: () => void } }).electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = () => {
    if (isElectron) {
      (window as unknown as { electronAPI: { maximizeWindow: () => void } }).electronAPI.maximizeWindow();
    }
  };

  const handleClose = () => {
    if (isElectron) {
      (window as unknown as { electronAPI: { closeWindow: () => void } }).electronAPI.closeWindow();
    }
  };

  const isDark = theme === 'chalk';

  return (
    <header className={`h-13 w-full border-b-2 px-2 sm:px-3 flex items-center justify-between select-none app-drag-region transition-colors duration-300 pt-safe ${
      isDark
        ? 'bg-[#181715] border-[#36342e] text-[#f5f1e8]'
        : 'bg-[#f7f2e9] border-[#181816] text-[#181816]'
    }`}>
      {/* Brand & Mobile Hamburger Toggle */}
      <div className="flex items-center space-x-1.5 sm:space-x-3 app-no-drag shrink-0">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          onClick={onToggleMobileSidebar}
          className={`p-1.5 rounded-lg border-2 md:hidden btn-paper ${
            isDark ? 'bg-[#22211d] border-[#36342e]' : 'bg-[#fffdf9] border-[#181816] shadow-paper-sm'
          }`}
          title="Open Library Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Replay Intro Badge */}
        <button
          onClick={onReplayIntro}
          className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 font-black text-sm rotate-[-2deg] transition-all hover:rotate-6 hover:scale-110 active:scale-95 cursor-pointer ${
          isDark
            ? 'bg-[#f4a261] border-[#f5f1e8] text-[#161513] shadow-chalk-sm'
            : 'bg-[#e76f51] border-[#181816] text-white shadow-paper-sm'
        }`}
          title="Replay unboxing animation"
        >
          <Sparkles className="w-3.5 h-3.5 fill-current" />
        </button>

        <div className="flex items-baseline space-x-1.5 sm:space-x-2">
          <span className="font-display font-extrabold text-sm sm:text-base tracking-tight">
            AURA
          </span>
          <span className="hidden xs:inline text-[9px] sm:text-[10px] font-typewriter uppercase tracking-widest px-1.5 py-0.5 rounded border border-current font-semibold rotate-[1deg]">
            Zine
          </span>
          <span className="hidden lg:inline font-doodle text-sm opacity-80">
            ~ {totalTracksCount} tape tracks on deck ~
          </span>
        </div>
      </div>

      {/* Center Search - Stamped Input */}
      <div className="flex-1 max-w-[180px] sm:max-w-xs md:max-w-md mx-2 sm:mx-4 app-no-drag">
        <div className="relative flex items-center group">
          <Search className={`absolute left-2.5 sm:left-3 w-3.5 sm:w-4 h-3.5 sm:h-4 transition-colors ${isDark ? 'text-stone-400' : 'text-stone-600'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="search track or artist..."
            className={`w-full h-7 sm:h-8 pl-8 sm:pl-9 pr-2 sm:pr-14 text-[11px] sm:text-xs rounded-full border-2 focus:outline-none transition-all font-typewriter ${
              isDark
                ? 'bg-[#21201c] border-[#36342e] text-[#f5f1e8] placeholder:text-stone-500 focus:border-[#f4a261]'
                : 'bg-[#fffdf9] border-[#181816] text-[#181816] placeholder:text-stone-500 focus:border-[#e76f51] shadow-paper-sm'
            }`}
          />
          <div className={`hidden sm:flex absolute right-2.5 items-center pointer-events-none text-[9px] font-typewriter px-1.5 py-0.5 rounded border ${
            isDark ? 'bg-[#292723] border-[#36342e] text-stone-400' : 'bg-[#ece4d4] border-[#181816] text-stone-700'
          }`}>
            Ctrl+K
          </div>
        </div>
      </div>

      {/* Right Actions & Tactile Buttons */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 app-no-drag shrink-0">
        {/* Theme Toggle (Kraft Paper vs Midnight Chalk) */}
        <button
          onClick={onToggleTheme}
          className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1 rounded-lg border-2 text-xs font-typewriter btn-paper ${
            isDark
              ? 'bg-[#24231f] border-[#f5f1e8] text-[#f5f1e8] shadow-chalk-sm'
              : 'bg-[#fffdf9] border-[#181816] text-[#181816] shadow-paper-sm'
          }`}
          title={isDark ? 'Switch to Warm Kraft Paper theme' : 'Switch to Midnight Chalkboard theme'}
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-yellow-400" /> : <Moon className="w-3.5 h-3.5 text-stone-700" />}
          <span className="hidden md:inline text-[11px] font-semibold">{isDark ? 'Kraft' : 'Chalk'}</span>
        </button>

        {/* Scan Folder: Hidden on small mobile screens because mobile OS does not support folder picker */}
        <button
          onClick={onScanFolder}
          className={`hidden sm:flex items-center space-x-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl border-2 btn-paper ${
            isDark
              ? 'bg-[#22211d] border-[#f5f1e8] text-[#f5f1e8] shadow-chalk-sm'
              : 'bg-[#fffdf9] border-[#181816] text-[#181816] shadow-paper-sm'
          }`}
          title="Scan local folder for audio"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Add Folder</span>
        </button>

        {/* Import Files Button - Works everywhere including Android and iOS */}
        <button
          onClick={onImportFiles}
          className={`flex items-center space-x-1 text-xs font-bold px-2.5 sm:px-3.5 py-1.5 rounded-xl border-2 btn-paper ${
            isDark
              ? 'bg-[#f4a261] border-[#f5f1e8] text-[#161513] shadow-chalk-sm'
              : 'bg-[#e76f51] border-[#181816] text-white shadow-paper-sm'
          }`}
          title="Import local files"
        >
          <FileAudio className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Import</span>
        </button>

        {/* Windows Window Controls - ONLY shown in Desktop Electron app */}
        {isElectron && (
          <div className={`hidden md:flex items-center space-x-1 ml-2 pl-2 border-l-2 ${isDark ? 'border-[#36342e]' : 'border-[#181816]'}`}>
            <button
              onClick={handleMinimize}
              className="w-7 h-7 flex items-center justify-center rounded border border-transparent hover:border-current transition-colors"
              title="Minimize"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleMaximize}
              className="w-7 h-7 flex items-center justify-center rounded border border-transparent hover:border-current transition-colors"
              title="Maximize / Restore"
            >
              <Square className="w-3 h-3" />
            </button>
            <button
              onClick={handleClose}
              className="w-7 h-7 flex items-center justify-center rounded border border-transparent hover:bg-rose-500 hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default TitleBar;
