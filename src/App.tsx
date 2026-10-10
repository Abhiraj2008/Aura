import React, { useState, useEffect, useRef } from 'react';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { HeroBanner } from './components/HeroBanner';
import { TrackList } from './components/TrackList';
import { PlayerBar } from './components/PlayerBar';
import { NowPlayingPanel } from './components/NowPlayingPanel';
import { DropZoneOverlay } from './components/DropZoneOverlay';
import { PaperTearIntro } from './components/PaperTearIntro';
import { AudioEngine } from './services/audioEngine';
import { getInitialTracks } from './services/sampleTracks';
import { extractBrowserFileMetadata } from './utils/metadataExtractor';
import type { Track, AudioFormat, ViewMode } from './types/audio';

export function App() {
  const [tracks, setTracks] = useState<Track[]>(getInitialTracks());
  const [currentTrack, setCurrentTrack] = useState<Track | null>(tracks[0] || null);
  const [queue, setQueue] = useState<Track[]>(tracks.slice(1));
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(tracks[0]?.duration || 184);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentView, setCurrentView] = useState<ViewMode>('all');
  const [activePlaylist, setActivePlaylist] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [theme, setTheme] = useState<'paper' | 'chalk'>('paper');

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'paper' ? 'chalk' : 'paper');
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  const audioEngine = AudioEngine.getInstance();

  // Initialize audio listeners
  useEffect(() => {
    const audio = audioEngine.getAudioElement();

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      if (audio.duration && Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      handleNextTrack();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [queue, repeatMode, isShuffle, currentTrack]);

  // Synchronize playback rate & volume
  useEffect(() => {
    audioEngine.setVolume(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  useEffect(() => {
    audioEngine.setPlaybackRate(playbackRate);
  }, [playbackRate]);

  // Load current track into engine when currentTrack changes
  const playTrack = async (track: Track) => {
    setCurrentTrack(track);
    try {
      const dur = await audioEngine.loadTrack(track.src);
      const finalDuration = dur > 0 ? Math.round(dur) : track.duration;
      setDuration(finalDuration);

      if (dur > 0 && track.duration <= 0) {
        setTracks(prev => prev.map(t => t.id === track.id ? { ...t, duration: Math.round(dur) } : t));
        setCurrentTrack(prev => prev ? { ...prev, duration: Math.round(dur) } : null);
      }

      await audioEngine.play();
      setIsPlaying(true);
    } catch (err) {
      console.warn('Playback error (interaction required or invalid file):', err);
    }
  };

  const handleTogglePlay = async () => {
    if (!currentTrack && tracks.length > 0) {
      playTrack(tracks[0]);
      return;
    }

    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioEngine.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Playback error:', err);
      }
    }
  };

  const handleNextTrack = () => {
    if (repeatMode === 'one' && currentTrack) {
      audioEngine.seek(0);
      audioEngine.play();
      return;
    }

    if (queue.length > 0) {
      const nextTrack = queue[0];
      setQueue(queue.slice(1));
      playTrack(nextTrack);
    } else if (repeatMode === 'all' && tracks.length > 0) {
      if (isShuffle) {
        const randomIndex = Math.floor(Math.random() * tracks.length);
        playTrack(tracks[randomIndex]);
      } else {
        const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
        const nextIndex = (currentIndex + 1) % tracks.length;
        playTrack(tracks[nextIndex]);
      }
    } else {
      setIsPlaying(false);
      audioEngine.pause();
    }
  };

  const handlePrevTrack = () => {
    if (currentTime > 3) {
      audioEngine.seek(0);
      return;
    }

    if (tracks.length > 0) {
      const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
      const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
      playTrack(tracks[prevIndex]);
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    audioEngine.seek(time);
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    if (isMuted && vol > 0) setIsMuted(false);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleToggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  const handleToggleRepeat = () => {
    const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % modes.length]);
  };

  const handleCyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    setPlaybackRate(rates[(currentIndex + 1) % rates.length]);
  };

  const handleToggleFavorite = (trackId: string) => {
    setTracks(prev =>
      prev.map(t => (t.id === trackId ? { ...t, isFavorite: !t.isFavorite } : t))
    );
    if (currentTrack?.id === trackId) {
      setCurrentTrack(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
  };

  const handleAddToQueue = (track: Track) => {
    setQueue(prev => [...prev, track]);
  };

  const handleRemoveFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  // Helper to parse audio files & match companion images/.lrc
  const processImportedFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const audioFiles: File[] = [];
    const lrcMap = new Map<string, string>();
    const imageMap = new Map<string, string>();

    const validAudioExts: Record<string, AudioFormat> = {
      mp3: 'mp3',
      m4a: 'm4a',
      wav: 'wav',
      flac: 'flac',
      ogg: 'ogg',
      oga: 'ogg',
      aac: 'aac',
      opus: 'opus',
      wma: 'wma',
      aiff: 'aiff',
      aif: 'aiff',
      alac: 'alac',
      webm: 'webm',
      weba: 'webm',
      m4b: 'm4b'
    };

    // First pass: collect .lrc lyrics and companion images
    for (const file of fileArray) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const base = file.name.substring(0, file.name.lastIndexOf('.')).toLowerCase();
      const cleanBase = base.replace(/\(mp3_\d+k\)/gi, '').trim();

      if (ext === 'lrc') {
        const text = await file.text();
        lrcMap.set(base, text);
        lrcMap.set(cleanBase, text);
        lrcMap.set(base.replace(/_private$/, ''), text);
      } else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
        const objUrl = URL.createObjectURL(file);
        imageMap.set(base, objUrl);
        imageMap.set(cleanBase, objUrl);
      } else if (validAudioExts[ext]) {
        audioFiles.push(file);
      }
    }

    // Second pass: extract real metadata (APIC picture, title, artist, album, duration)
    const newTracks: Track[] = await Promise.all(
      audioFiles.map(async (file, idx) => {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const format = validAudioExts[ext] || 'mp3';
        const objectUrl = URL.createObjectURL(file);
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const cleanName = nameWithoutExt.replace(/\(MP3_\d+K\)/gi, '').trim();
        const baseKey = nameWithoutExt.toLowerCase();
        const cleanKey = cleanName.toLowerCase();

        // Extract real embedded ID3 artwork, duration, and metadata
        const extracted = await extractBrowserFileMetadata(file, format);

        const companionCover = imageMap.get(baseKey) || imageMap.get(cleanKey);
        const companionLyrics = lrcMap.get(baseKey) || lrcMap.get(cleanKey);

        return {
          id: `local-${Date.now()}-${idx}`,
          title: extracted.title || cleanName,
          artist: extracted.artist,
          album: extracted.album,
          duration: extracted.duration,
          format,
          category: (file.name.toLowerCase().includes('podcast') || extracted.title.toLowerCase().includes('podcast')) ? 'podcast' : 'music',
          src: objectUrl,
          path: (file as unknown as { path?: string }).path,
          coverUrl: extracted.coverUrl || companionCover,
          lyrics: companionLyrics,
          isFavorite: false,
          year: new Date().getFullYear(),
          metadata: extracted.metadata
        };
      })
    );

    if (newTracks.length > 0) {
      setTracks(prev => [...newTracks, ...prev]);
      if (!currentTrack) {
        playTrack(newTracks[0]);
      }
    }
  };

  // Electron or Browser Dialog Handlers
  const handleImportFiles = async () => {
    const isElectron = typeof window !== 'undefined' && 'electronAPI' in window;
    if (isElectron) {
      try {
        const imported = await (window as unknown as { electronAPI: { openFileDialog: () => Promise<Track[]> } }).electronAPI.openFileDialog();
        if (imported && imported.length > 0) {
          setTracks(prev => [...imported, ...prev]);
          if (!currentTrack && imported.length > 0) {
            playTrack(imported[0]);
          }
        }
      } catch (err) {
        console.error('Electron file open error:', err);
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleScanFolder = async () => {
    const isElectron = typeof window !== 'undefined' && 'electronAPI' in window;
    if (isElectron) {
      try {
        const result = await (window as unknown as { electronAPI: { openDirectoryDialog: () => Promise<{ folderPath: string; files: Track[] }> } }).electronAPI.openDirectoryDialog();
        if (result && result.files && result.files.length > 0) {
          setTracks(prev => [...result.files, ...prev]);
          if (!currentTrack && result.files.length > 0) {
            playTrack(result.files[0]);
          }
        }
      } catch (err) {
        console.error('Electron folder scan error:', err);
      }
    } else {
      folderInputRef.current?.click();
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImportedFiles(e.dataTransfer.files);
    }
  };

  // Filtered tracks logic
  const filteredTracks = tracks.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.album.toLowerCase().includes(q) ||
      t.format.toLowerCase().includes(q);

    const matchesView =
      currentView === 'all' ||
      (currentView === 'music' && t.category === 'music') ||
      (currentView === 'podcasts' && t.category === 'podcast') ||
      (currentView === 'favorites' && t.isFavorite);

    const matchesPlaylist = !activePlaylist || true;

    return matchesSearch && matchesView && matchesPlaylist;
  });

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`h-[100dvh] w-screen flex flex-col overflow-hidden select-none font-sans transition-colors duration-300 ${
        theme === 'chalk' ? 'chalk-texture text-[#f5f1e8]' : 'paper-texture text-[#181816]'
      }`}
    >
      {/* Hidden file inputs for Web fallback */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="audio/*,.mp3,.m4a,.wav,.flac,.ogg,.oga,.aac,.opus,.wma,.aiff,.aif,.alac,.webm,.weba,.m4b,.lrc,.jpg,.jpeg,.png,.webp"
        onChange={(e) => e.target.files && processImportedFiles(e.target.files)}
        className="hidden"
      />
      <input
        type="file"
        ref={folderInputRef}
        // @ts-expect-error webkitdirectory attribute exists in browsers
        webkitdirectory="true"
        directory="true"
        onChange={(e) => e.target.files && processImportedFiles(e.target.files)}
        className="hidden"
      />

      {/* Intro Paper Tear & Unboxing Reveal Animation */}
      {showIntro && (
        <PaperTearIntro 
          onComplete={() => setShowIntro(false)} 
          theme={theme} 
        />
      )}

      {/* Drag & Drop Visual Overlay */}
      <DropZoneOverlay isDragging={isDragging} />

      {/* Top Title Bar */}
      <TitleBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onImportFiles={handleImportFiles}
        onScanFolder={handleScanFolder}
        totalTracksCount={tracks.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onReplayIntro={() => setShowIntro(true)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Navigation Sidebar (Drawer on mobile, standard column on desktop) */}
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          totalTracks={tracks.length}
          musicCount={tracks.filter(t => t.category === 'music').length}
          podcastsCount={tracks.filter(t => t.category === 'podcast').length}
          favoritesCount={tracks.filter(t => t.isFavorite).length}
          activePlaylist={activePlaylist}
          onSelectPlaylist={setActivePlaylist}
          theme={theme}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Center Content Scroll Area */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 pt-3 sm:pt-5 pb-28 sm:pb-32">
          <HeroBanner
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            theme={theme}
            onTogglePlay={handleTogglePlay}
            onShufflePlay={() => {
              if (tracks.length > 0) {
                const rand = tracks[Math.floor(Math.random() * tracks.length)];
                playTrack(rand);
              }
            }}
            onToggleFavorite={handleToggleFavorite}
            onScanFolder={handleScanFolder}
          />

          <TrackList
            tracks={filteredTracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            theme={theme}
            onSelectTrack={playTrack}
            onTogglePlay={handleTogglePlay}
            onToggleFavorite={handleToggleFavorite}
            onAddToQueue={handleAddToQueue}
          />
        </main>

        {/* Mobile Full-Screen / Bottom Sheet for NowPlayingPanel */}
        <div
          className={`fixed inset-0 z-50 md:hidden transition-all duration-300 flex flex-col ${
            isInspectorOpen
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          <div
            onClick={() => setIsInspectorOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />
          <div
            className={`relative z-10 w-full h-[90dvh] mt-auto rounded-t-3xl border-t-2 shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 ${
              isInspectorOpen ? 'translate-y-0' : 'translate-y-full'
            } ${
              theme === 'chalk' ? 'bg-[#181715] border-[#36342e]' : 'bg-[#f7f2e9] border-[#181816]'
            }`}
          >
            <NowPlayingPanel
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              currentTime={currentTime}
              queue={queue}
              theme={theme}
              onRemoveFromQueue={handleRemoveFromQueue}
              onSelectTrack={playTrack}
              onSeek={handleSeek}
              onClose={() => setIsInspectorOpen(false)}
            />
          </div>
        </div>

        {/* Desktop Right Studio Inspector Panel with smooth sliding transition */}
        <aside
          className={`hidden md:flex shrink-0 overflow-hidden transition-[width,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex-col ${
            isInspectorOpen
              ? 'w-84 opacity-100 pointer-events-auto'
              : 'w-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="w-84 h-full shrink-0 flex flex-col">
            <NowPlayingPanel
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              currentTime={currentTime}
              queue={queue}
              theme={theme}
              onRemoveFromQueue={handleRemoveFromQueue}
              onSelectTrack={playTrack}
              onSeek={handleSeek}
              onClose={() => setIsInspectorOpen(false)}
            />
          </div>
        </aside>
      </div>

      {/* Bottom Floating Studio Player Bar */}
      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        playbackRate={playbackRate}
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        isInspectorOpen={isInspectorOpen}
        theme={theme}
        onTogglePlay={handleTogglePlay}
        onPrev={handlePrevTrack}
        onNext={handleNextTrack}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onToggleShuffle={handleToggleShuffle}
        onToggleRepeat={handleToggleRepeat}
        onCyclePlaybackRate={handleCyclePlaybackRate}
        onToggleFavorite={handleToggleFavorite}
        onToggleInspector={() => setIsInspectorOpen(!isInspectorOpen)}
      />
    </div>
  );
}
export default App;
