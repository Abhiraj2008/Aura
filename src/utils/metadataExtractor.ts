import { parseBlob } from 'music-metadata';
import type { AudioMetadata, AudioFormat } from '../types/audio';

export interface ExtractedTrackData {
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl?: string;
  metadata: AudioMetadata;
}

/**
 * Extracts embedded ID3/APIC artwork, titles, artists, albums, and duration directly from a browser File
 */
export async function extractBrowserFileMetadata(
  file: File,
  fallbackFormat: AudioFormat
): Promise<ExtractedTrackData> {
  const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const cleanFallbackTitle = nameWithoutExt.replace(/\(MP3_\d+K\)/gi, '').trim();

  let title = cleanFallbackTitle;
  let artist = 'Unknown Artist';
  let album = 'Local Audio';
  let duration = 0;
  let coverUrl: string | undefined = undefined;
  let bitrate = undefined;
  let sampleRate = undefined;
  let bitDepth = undefined;
  let channels = 'Stereo';

  // 1. Try parsing metadata and embedded picture with music-metadata
  try {
    const meta = await parseBlob(file);
    if (meta.common.title) title = meta.common.title;
    if (meta.common.artist) artist = meta.common.artist;
    if (meta.common.album) album = meta.common.album;
    if (meta.format.duration && Number.isFinite(meta.format.duration)) {
      duration = Math.round(meta.format.duration);
    }
    if (meta.format.bitrate) {
      bitrate = `${Math.round(meta.format.bitrate / 1000)} kbps`;
    }
    if (meta.format.sampleRate) {
      sampleRate = `${(meta.format.sampleRate / 1000).toFixed(1)} kHz`;
    }
    if (meta.format.bitsPerSample) {
      bitDepth = `${meta.format.bitsPerSample}-bit`;
    }
    if (meta.format.numberOfChannels) {
      channels = meta.format.numberOfChannels === 2 ? 'Stereo (2.0)' : meta.format.numberOfChannels === 1 ? 'Mono' : 'Multi-channel';
    }

    // Extract embedded cover artwork (APIC)
    if (meta.common.picture && meta.common.picture.length > 0) {
      const pic = meta.common.picture[0];
      const imgBlob = new Blob([pic.data as unknown as BlobPart], { type: pic.format || 'image/jpeg' });
      coverUrl = URL.createObjectURL(imgBlob);
    }
  } catch (err) {
    console.warn('Browser parseBlob notice for file:', file.name, err);
  }

  // 2. If duration could not be extracted from ID3 header, probe HTML5 Audio element
  if (!duration || duration <= 0) {
    try {
      const probeAudio = new Audio();
      const objUrl = URL.createObjectURL(file);
      probeAudio.preload = 'metadata';
      probeAudio.src = objUrl;

      duration = await new Promise<number>((resolve) => {
        const cleanup = () => {
          probeAudio.removeEventListener('loadedmetadata', onLoaded);
          probeAudio.removeEventListener('error', onError);
          URL.revokeObjectURL(objUrl);
        };
        const onLoaded = () => {
          const d = Math.round(probeAudio.duration) || 0;
          cleanup();
          resolve(d);
        };
        const onError = () => {
          cleanup();
          resolve(0);
        };
        probeAudio.addEventListener('loadedmetadata', onLoaded);
        probeAudio.addEventListener('error', onError);
        // Timeout safeguard
        setTimeout(() => {
          cleanup();
          resolve(0);
        }, 1500);
      });
    } catch {
      duration = 0;
    }
  }

  const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);

  return {
    title,
    artist,
    album,
    duration,
    coverUrl,
    metadata: {
      fileSize: `${sizeInMb} MB`,
      bitrate: bitrate || (fallbackFormat === 'flac' ? 'Lossless' : '320 kbps'),
      sampleRate: sampleRate || '44.1 kHz',
      bitDepth: bitDepth || (fallbackFormat === 'flac' || fallbackFormat === 'wav' ? '24-bit PCM' : '16-bit'),
      channels
    }
  };
}

