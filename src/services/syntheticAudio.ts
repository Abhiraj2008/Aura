/**
 * Generates synthetic pleasant ambient chords as WAV audio blobs for instant demo playback
 */
export function createSyntheticAudioTrack(
  type: 'synthwave' | 'lofi' | 'podcast' | 'ambient',
  durationSec: number = 24
): string {
  const sampleRate = 22050;
  const numChannels = 2;
  const numSamples = durationSec * sampleRate;
  const buffer = new Float32Array(numSamples * numChannels);

  // Different harmonic sound palettes
  if (type === 'synthwave') {
    const freqs = [130.81, 164.81, 196.00, 246.94]; // C-E-G-B
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const beat = (t % 2) / 2;
      const kick = Math.exp(-beat * 12) * Math.sin(2 * Math.PI * (55 - beat * 30) * t);
      
      let synth = 0;
      for (let f = 0; f < freqs.length; f++) {
        const chordProg = Math.floor(t / 4) % 4;
        const noteFreq = freqs[f] * (chordProg === 1 ? 1.125 : chordProg === 2 ? 0.89 : 1.0);
        synth += Math.sin(2 * Math.PI * noteFreq * t) * 0.15;
        synth += Math.sin(2 * Math.PI * (noteFreq * 2.01) * t) * 0.05;
      }

      const sample = Math.tanh(kick * 0.6 + synth * 0.5) * 0.6;
      buffer[i * 2] = sample;
      buffer[i * 2 + 1] = sample * 0.95;
    }
  } else if (type === 'lofi') {
    const root = 146.83; // D3
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const chord = Math.floor(t / 3) % 4;
      const f1 = root * (1 + chord * 0.25);
      const f2 = f1 * 1.25;
      const f3 = f1 * 1.5;
      
      const wave = Math.sin(2 * Math.PI * f1 * t) * 0.2 +
                   Math.sin(2 * Math.PI * f2 * t) * 0.15 +
                   Math.sin(2 * Math.PI * f3 * t) * 0.1;
      
      // subtle vinyl crackle
      const crackle = (Math.random() > 0.992 ? (Math.random() - 0.5) * 0.08 : 0);
      const sample = (wave + crackle) * 0.7;
      buffer[i * 2] = sample;
      buffer[i * 2 + 1] = sample * 0.9;
    }
  } else if (type === 'podcast') {
    // Simulates vocal speech pattern modulation
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const cadence = Math.sin(2 * Math.PI * 3.5 * t);
      const voicePitch = 120 + Math.sin(2 * Math.PI * 0.8 * t) * 20;
      const speech = cadence > 0.1 ? (Math.sin(2 * Math.PI * voicePitch * t) + 0.3 * Math.sin(2 * Math.PI * voicePitch * 2 * t)) * 0.3 : 0;
      buffer[i * 2] = speech;
      buffer[i * 2 + 1] = speech;
    }
  } else {
    // Ambient soundscape
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const sweep = Math.sin(2 * Math.PI * 0.1 * t);
      const freq = 110 + sweep * 30;
      const drone = Math.sin(2 * Math.PI * freq * t) * 0.25 + Math.sin(2 * Math.PI * (freq * 1.503) * t) * 0.15;
      buffer[i * 2] = drone * 0.5;
      buffer[i * 2 + 1] = drone * 0.5;
    }
  }

  // Encode Float32Array to 16-bit PCM WAV
  const wavBytes = encodeWAV(buffer, sampleRate, numChannels);
  const blob = new Blob([wavBytes], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

function encodeWAV(samples: Float32Array, sampleRate: number, channels: number): ArrayBuffer {
  const byteRate = sampleRate * channels * 2;
  const blockAlign = channels * 2;
  const dataSize = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // 16-bit
  // data chunk identifier
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

