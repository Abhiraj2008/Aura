export type AudioFormat =
  | 'mp3'
  | 'm4a'
  | 'wav'
  | 'flac'
  | 'ogg'
  | 'aac'
  | 'opus'
  | 'wma'
  | 'aiff'
  | 'alac'
  | 'webm'
  | 'm4b';

export interface LrcLine {
  time: number; // in seconds
  text: string;
}

export interface AudioMetadata {
  bitrate?: string;
  sampleRate?: string;
  channels?: string;
  bitDepth?: string;
  fileSize?: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  format: AudioFormat;
  src: string; // url, blob url, or file path
  coverUrl?: string;
  isFavorite?: boolean;
  category: 'music' | 'podcast' | 'audiobook';
  year?: number;
  metadata?: AudioMetadata;
  path?: string;
  lyrics?: string; // Raw or LRC content
  lrcLines?: LrcLine[];
}

export type ViewMode = 'all' | 'music' | 'podcasts' | 'favorites' | 'folder';

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
}
