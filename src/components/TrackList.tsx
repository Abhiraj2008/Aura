import React, { useState } from 'react';
import {
  Play,
  Pause,
  Heart,
  Clock,
  List,
  LayoutGrid,
  Disc3,
  ArrowUpDown,
  ListPlus,
  Mic2
} from 'lucide-react';
import type { Track } from '../types/audio';
import { FluidPlayingIndicator } from './FluidPlayingIndicator';

interface TrackListProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  theme: 'paper' | 'chalk';
  onSelectTrack: (track: Track) => void;
  onTogglePlay: () => void;
  onToggleFavorite: (trackId: string) => void;
  onAddToQueue: (track: Track) => void;
}

export const TrackList: React.FC<TrackListProps> = ({
  tracks,
  currentTrack,
  isPlaying,
  theme,
  onSelectTrack,
  onTogglePlay,
  onToggleFavorite,
  onAddToQueue
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'duration' | 'format'>('title');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const isDark = theme === 'chalk';

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = Math.floor(sec % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const getFormatBadge = (format: string) => {
    const styles: Record<string, string> = {
      flac: 'bg-[#e76f51]/15 text-[#e76f51] border-[#e76f51]',
      mp3: 'bg-[#e9c46a]/20 text-[#c8921a] border-[#e9c46a]',
      m4a: 'bg-[#2a9d8f]/15 text-[#2a9d8f] border-[#2a9d8f]',
      wav: 'bg-[#3d5a80]/15 text-[#3d5a80] border-[#3d5a80]',
      ogg: 'bg-[#f4a261]/15 text-[#d97736] border-[#f4a261]',
      aac: 'bg-[#2a9d8f]/20 text-[#1d7066] border-[#2a9d8f]',
      opus: 'bg-[#9b5de5]/15 text-[#9b5de5] border-[#9b5de5]',
      wma: 'bg-[#00bbf9]/15 text-[#008dbd] border-[#00bbf9]',
      aiff: 'bg-[#f15bb5]/15 text-[#c42d87] border-[#f15bb5]',
      alac: 'bg-[#e76f51]/20 text-[#b23b1e] border-[#e76f51]',
      webm: 'bg-[#fee440]/25 text-[#9c8400] border-[#fee440]',
      m4b: 'bg-[#00f5d4]/15 text-[#009b86] border-[#00f5d4]',
    };
    return styles[format] || 'bg-stone-500/10 text-stone-700 border-stone-500';
  };

  const sortedTracks = [...tracks].sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'title') cmp = a.title.localeCompare(b.title);
    else if (sortBy === 'artist') cmp = a.artist.localeCompare(b.artist);
    else if (sortBy === 'duration') cmp = a.duration - b.duration;
    else if (sortBy === 'format') cmp = a.format.localeCompare(b.format);
    return sortAsc ? cmp : -cmp;
  });

  const toggleSort = (field: 'title' | 'artist' | 'duration' | 'format') => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Table Header Bar with Views and Sorters */}
      <div className="flex items-center justify-between px-2 text-xs font-typewriter">
        <div className="flex items-center space-x-2">
          <span className="font-bold">
            {tracks.length} {tracks.length === 1 ? 'TRACK RECORD' : 'TRACK RECORDS'}
          </span>
          <span className="opacity-40">•</span>
          <span className="font-doodle text-sm opacity-80">
            click row to drop needle on track
          </span>
        </div>

        {/* View Toggle - Stamped Buttons */}
        <div className={`flex items-center p-0.5 rounded-xl border-2 ${
          isDark ? 'bg-[#22211d] border-[#36342e]' : 'bg-[#fffdf9] border-[#181816]'
        }`}>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? (isDark ? 'bg-[#f4a261] text-[#161513]' : 'bg-[#e76f51] text-white') : 'opacity-60 hover:opacity-100'}`}
            title="Ledger List View"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? (isDark ? 'bg-[#f4a261] text-[#161513]' : 'bg-[#e76f51] text-white') : 'opacity-60 hover:opacity-100'}`}
            title="Polaroid Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className={`rounded-3xl border-2 overflow-hidden transition-all duration-300 ${
          isDark ? 'bg-[#1e1d1a] border-[#36342e] shadow-chalk' : 'bg-[#fffdf9] border-[#181816] shadow-paper-lg'
        }`}>
          {/* Table Header */}
          <div className={`grid grid-cols-12 gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] font-typewriter font-bold uppercase tracking-wider border-b-2 select-none ${
            isDark ? 'border-[#36342e] bg-[#252420]' : 'border-[#181816] bg-[#f8f3ea]'
          }`}>
            <div className="col-span-1 hidden xs:block text-center">#</div>
            <div
              className="col-span-8 xs:col-span-7 sm:col-span-6 md:col-span-4 flex items-center space-x-1 cursor-pointer hover:underline"
              onClick={() => toggleSort('title')}
            >
              <span>Title & Artist</span>
              <ArrowUpDown className="w-3 h-3 opacity-60" />
            </div>
            <div className="col-span-3 hidden md:block">Album Ledger</div>
            <div
              className="col-span-2 hidden sm:flex items-center space-x-1 cursor-pointer hover:underline"
              onClick={() => toggleSort('format')}
            >
              <span>Stamp</span>
              <ArrowUpDown className="w-3 h-3 opacity-60" />
            </div>
            <div
              className="col-span-4 xs:col-span-4 sm:col-span-3 md:col-span-2 flex items-center justify-end space-x-1 cursor-pointer hover:underline pr-2 sm:pr-4"
              onClick={() => toggleSort('duration')}
            >
              <Clock className="w-3.5 h-3.5 mr-1" />
              <span>Length</span>
              <ArrowUpDown className="w-3 h-3 opacity-60" />
            </div>
          </div>

          {/* Table Body */}
          <div className={`divide-y-2 ${isDark ? 'divide-[#2a2924]' : 'divide-[#181816]/10'}`}>
            {sortedTracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => {
                    if (isCurrent) onTogglePlay();
                    else onSelectTrack(track);
                  }}
                  className={`grid grid-cols-12 gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 items-center text-xs group cursor-pointer transition-all duration-150 relative ${
                    isCurrent
                      ? isDark
                        ? 'bg-[#2a2924] font-bold'
                        : 'bg-[#faedcb] font-bold'
                      : isDark
                        ? 'hover:bg-[#252420]'
                        : 'hover:bg-[#fbf7ee]'
                  }`}
                >
                  {/* Active Highlighter Indicator */}
                  {isCurrent && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-[#e76f51] rounded-r border border-[#181816]"></div>
                  )}

                  {/* Index / Play Button */}
                  <div className="col-span-1 hidden xs:flex items-center justify-center text-center">
                    {isCurrent && isPlaying ? (
                      <FluidPlayingIndicator />
                    ) : (
                      <span className="group-hover:hidden font-typewriter text-[11px] opacity-70">
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                    )}
                    <button
                      className="hidden group-hover:flex items-center justify-center text-[#e76f51] font-bold"
                      title={isCurrent && isPlaying ? 'Pause' : 'Play'}
                    >
                      {isCurrent && isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Title & Artist with Mini Polaroid */}
                  <div className="col-span-8 xs:col-span-7 sm:col-span-6 md:col-span-4 flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden shrink-0 border-2 rotate-[-1deg] group-hover:rotate-0 transition-transform ${
                      isDark ? 'border-[#f5f1e8] bg-[#161513]' : 'border-[#181816] bg-white shadow-paper-sm'
                    }`}>
                      {track.coverUrl ? (
                        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-stone-900">
                          <Disc3 className="w-4 h-4 text-stone-400" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <span className={`font-display text-xs truncate ${isCurrent ? 'text-[#e76f51] font-extrabold' : 'font-bold'}`}>
                          {track.title}
                        </span>
                        {track.lyrics && (
                          <span title="Synchronized .LRC lyrics">
                            <Mic2 className="w-3 h-3 text-[#e76f51] shrink-0" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-doodle text-base opacity-85 truncate leading-none pt-0.5">
                        {track.artist}
                      </div>
                    </div>
                  </div>

                  {/* Album */}
                  <div className="col-span-3 hidden md:block opacity-75 truncate font-sans text-xs">
                    {track.album}
                  </div>

                  {/* Stamp format */}
                  <div className="col-span-2 hidden sm:flex items-center space-x-2">
                    <span className={`text-[10px] font-typewriter font-bold uppercase px-2 py-0.5 rounded border-2 shadow-paper-sm ${getFormatBadge(track.format)}`}>
                      .{track.format}
                    </span>
                    <span className="text-[10px] font-typewriter opacity-60 hidden xl:inline">
                      {track.metadata?.bitrate?.split(' ')[0]}
                    </span>
                  </div>

                  {/* Duration & Actions */}
                  <div className="col-span-4 xs:col-span-4 sm:col-span-3 md:col-span-2 flex items-center justify-end space-x-2 sm:space-x-3 pr-1 sm:pr-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleFavorite(track.id)}
                      className="opacity-50 hover:opacity-100 hover:text-rose-500 transition-colors p-1"
                      title="Favorite"
                    >
                      <Heart className={`w-3.5 h-3.5 ${track.isFavorite ? 'fill-rose-500 text-rose-500 opacity-100' : ''}`} />
                    </button>

                    <button
                      onClick={() => onAddToQueue(track)}
                      className="hidden sm:inline opacity-0 group-hover:opacity-100 hover:text-[#e76f51] transition-opacity p-1"
                      title="Add to Mixtape Queue"
                    >
                      <ListPlus className="w-3.5 h-3.5" />
                    </button>

                    <span className="font-typewriter text-xs font-bold w-11 sm:w-12 text-right">
                      {formatSeconds(track.duration)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Polaroid Grid Cards View */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {sortedTracks.map((track, i) => {
            const isCurrent = currentTrack?.id === track.id;
            const rotations = ['rotate-[-1.5deg]', 'rotate-[1.2deg]', 'rotate-[-0.8deg]', 'rotate-[1.8deg]', 'rotate-[-2deg]'];
            const rot = rotations[i % rotations.length];
            return (
              <div
                key={track.id}
                onClick={() => {
                  if (isCurrent) onTogglePlay();
                  else onSelectTrack(track);
                }}
                className={`group relative p-3 pb-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${rot} hover:rotate-0 hover:scale-[1.02] ${
                  isCurrent
                    ? isDark
                      ? 'bg-[#282723] border-[#f5f1e8] shadow-chalk'
                      : 'bg-[#fffdf9] border-[#181816] shadow-paper-pop ring-2 ring-[#e76f51]'
                    : isDark
                      ? 'bg-[#1e1d1a] border-[#36342e] shadow-chalk-sm'
                      : 'bg-[#fffdf9] border-[#181816] shadow-paper'
                }`}
              >
                {/* Washi tape on top center */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-3.5 washi-tape border border-[#181816] rotate-[2deg] z-10"></div>

                {/* Cover Art */}
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 border-2 border-current/20 bg-stone-900">
                  {track.coverUrl ? (
                    <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-900">
                      <Disc3 className="w-12 h-12 text-stone-500" />
                    </div>
                  )}

                  {/* Stamp format in corner */}
                  <div className="absolute top-2 left-2 flex items-center space-x-1">
                    <span className={`text-[9px] font-typewriter font-bold uppercase px-1.5 py-0.5 rounded border-2 shadow-paper-sm ${getFormatBadge(track.format)}`}>
                      .{track.format}
                    </span>
                  </div>

                  {/* Hover play button */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-[#e76f51] text-white flex items-center justify-center border-2 border-[#181816] shadow-paper transform scale-90 group-hover:scale-100 transition-transform">
                      {isCurrent && isPlaying ? (
                        <Pause className="w-5 h-5 fill-white" />
                      ) : (
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-0.5">
                  <div className="font-display font-bold text-xs truncate">
                    {track.title}
                  </div>
                  <div className="font-doodle text-base truncate opacity-85 leading-tight">
                    {track.artist}
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[10px] font-typewriter opacity-70">
                    <span>{formatSeconds(track.duration)}</span>
                    <span className="uppercase">{track.category}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
