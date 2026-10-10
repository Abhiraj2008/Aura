import type { Track } from '../types/audio';
import { createSyntheticAudioTrack } from './syntheticAudio';

export const getInitialTracks = (): Track[] => {
  return [
    {
      id: 'track-1',
      title: 'Neon Odyssey (Master Studio)',
      artist: 'Aura Collective',
      album: 'Resonance 2026',
      duration: 184,
      format: 'flac',
      category: 'music',
      src: createSyntheticAudioTrack('synthwave', 28),
      coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
      isFavorite: true,
      year: 2026,
      metadata: {
        bitrate: '1411 kbps (Lossless)',
        sampleRate: '96.0 kHz',
        channels: 'Stereo (2.0)',
        bitDepth: '24-bit',
        fileSize: '42.8 MB'
      }
    },
    {
      id: 'track-2',
      title: 'Midnight Coffee Lofi',
      artist: 'Kaito Rain',
      album: 'Chill Reflections',
      duration: 142,
      format: 'mp3',
      category: 'music',
      src: createSyntheticAudioTrack('lofi', 24),
      coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80',
      isFavorite: false,
      year: 2025,
      metadata: {
        bitrate: '320 kbps CBR',
        sampleRate: '44.1 kHz',
        channels: 'Joint Stereo',
        bitDepth: '16-bit',
        fileSize: '7.9 MB'
      }
    },
    {
      id: 'track-3',
      title: 'Echoes of the Deep Mind',
      artist: 'Neural Frontier Podcast',
      album: 'Episode #42 - The Agentic Era',
      duration: 215,
      format: 'm4a',
      category: 'podcast',
      src: createSyntheticAudioTrack('podcast', 32),
      coverUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&auto=format&fit=crop&q=80',
      isFavorite: true,
      year: 2026,
      metadata: {
        bitrate: '256 kbps AAC',
        sampleRate: '48.0 kHz',
        channels: 'Stereo',
        bitDepth: '16-bit',
        fileSize: '18.4 MB'
      }
    },
    {
      id: 'track-4',
      title: 'Starlight Acoustic Arpeggios',
      artist: 'Elena Rostova',
      album: 'Nordic Strings',
      duration: 198,
      format: 'wav',
      category: 'music',
      src: createSyntheticAudioTrack('ambient', 26),
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
      isFavorite: false,
      year: 2024,
      metadata: {
        bitrate: '2304 kbps Uncompressed',
        sampleRate: '48.0 kHz',
        channels: 'Stereo (2.0)',
        bitDepth: '24-bit PCM',
        fileSize: '54.2 MB'
      }
    },
    {
      id: 'track-5',
      title: 'Boreal Aurora Ambient Drift',
      artist: 'Subsolar',
      album: 'Atmospheres Vol. III',
      duration: 260,
      format: 'ogg',
      category: 'music',
      src: createSyntheticAudioTrack('ambient', 30),
      coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80',
      isFavorite: true,
      year: 2026,
      metadata: {
        bitrate: '192 kbps Opus/Vorbis',
        sampleRate: '48.0 kHz',
        channels: 'Stereo',
        bitDepth: 'Floating Point',
        fileSize: '12.1 MB'
      }
    },
    {
      id: 'track-6',
      title: 'Cyberpunk Rain in Neo-Tokyo',
      artist: 'Voxel Vector',
      album: 'Glitch Architecture',
      duration: 175,
      format: 'flac',
      category: 'music',
      src: createSyntheticAudioTrack('synthwave', 25),
      coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80',
      isFavorite: false,
      year: 2026,
      metadata: {
        bitrate: '1680 kbps FLAC',
        sampleRate: '96.0 kHz',
        channels: 'Stereo',
        bitDepth: '24-bit',
        fileSize: '48.6 MB'
      }
    }
  ];
};

