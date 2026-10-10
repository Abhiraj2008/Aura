import type { LrcLine } from '../types/audio';

/**
 * Parses raw .lrc string into sorted timestamped lyrics lines
 */
export function parseLrc(lrcText: string): LrcLine[] {
  if (!lrcText || typeof lrcText !== 'string') return [];

  const lines = lrcText.split(/\r?\n/);
  const result: LrcLine[] = [];
  const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Check for timestamps
    const matches = [...trimmed.matchAll(timeRegex)];
    if (matches.length > 0) {
      // Clean lyric text by removing all timestamp tags
      const text = trimmed.replace(timeRegex, '').trim();

      for (const match of matches) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const milliseconds = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10) : 0;
        const timeInSeconds = minutes * 60 + seconds + milliseconds / 1000;

        result.push({
          time: timeInSeconds,
          text: text || '♪'
        });
      }
    }
  }

  // Sort chronologically
  return result.sort((a, b) => a.time - b.time);
}

