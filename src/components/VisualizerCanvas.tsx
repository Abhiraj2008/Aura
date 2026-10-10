import React, { useEffect, useRef, useState } from 'react';
import { AudioEngine } from '../services/audioEngine';
import { BarChart3, Activity, Disc, Sparkles } from 'lucide-react';

interface VisualizerCanvasProps {
  isPlaying: boolean;
  height?: number;
  className?: string;
  theme?: 'paper' | 'chalk';
}

type VisualizerMode = 'bars' | 'wave' | 'radial';

export const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({
  isPlaying,
  height = 95,
  className = '',
  theme = 'paper'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<VisualizerMode>('bars');
  const animationFrameId = useRef<number | null>(null);
  // Lerp smoothing buffer for buttery continuous animation without gaps
  const smoothedBars = useRef<Float32Array>(new Float32Array(32));

  const isDark = theme === 'chalk';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;
    const audioEngine = AudioEngine.getInstance();
    let currentWidth = 0;
    let currentHeight = 0;

    const updateDimensions = () => {
      if (!canvas) return false;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = Math.floor(rect.width);
      const displayHeight = Math.floor(rect.height || height);

      if (displayWidth <= 0 || displayHeight <= 0) return false;

      if (currentWidth !== displayWidth || currentHeight !== displayHeight) {
        canvas.width = Math.floor(displayWidth * dpr);
        canvas.height = Math.floor(displayHeight * dpr);
        currentWidth = displayWidth;
        currentHeight = displayHeight;
      }
      return true;
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(canvas);

    const render = () => {
      if (!isMounted) return;

      const hasValidSize = updateDimensions();
      if (!hasValidSize || !canvas) {
        animationFrameId.current = requestAnimationFrame(render);
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      const width = currentWidth;
      const h = currentHeight;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, h);

      const freqData = audioEngine.getFrequencyData();
      const waveData = audioEngine.getWaveformData();

      if (mode === 'bars') {
        const barCount = 32;
        const barWidth = (width / barCount) * 0.65;
        const gap = (width - barCount * barWidth) / (barCount - 1);

        const colors = isDark
          ? ['#f4a261', '#e9c46a', '#2a9d8f', '#e76f51']
          : ['#e76f51', '#e9c46a', '#40916c', '#3d5a80'];

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * (freqData.length * 0.75));
          const rawTarget = isPlaying
            ? freqData[dataIndex] / 255
            : (Math.sin(Date.now() / 350 + i * 0.3) * 0.09 + 0.14);

          // Smooth lerp interpolation (eliminates discrete jerky frame jumps)
          smoothedBars.current[i] += (rawTarget - smoothedBars.current[i]) * 0.32;
          const val = Math.max(0.08, Math.min(1, smoothedBars.current[i]));
          const barHeight = val * (h - 10);

          const x = i * (barWidth + gap);
          const y = h - barHeight;

          ctx.fillStyle = colors[i % colors.length];

          // Draw rounded sketch bar
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
          ctx.fill();

          ctx.strokeStyle = isDark ? '#f5f1e8' : '#181816';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Peak continuous cap
          if (val > 0.35) {
            ctx.fillStyle = isDark ? '#ffffff' : '#181816';
            ctx.beginPath();
            ctx.arc(x + barWidth / 2, y - 3, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (mode === 'wave') {
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = isDark ? '#f4a261' : '#e76f51';

        const sliceWidth = width / waveData.length;
        let x = 0;

        for (let i = 0; i < waveData.length; i++) {
          let v = waveData[i] / 128.0;
          if (!isPlaying) {
            v = 1.0 + Math.sin(Date.now() / 250 + i * 0.25) * 0.09;
          }
          const y = (v * h) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.stroke();
      } else if (mode === 'radial') {
        const centerX = width / 2;
        const centerY = h / 2;
        const radius = Math.min(centerX, centerY) * 0.52;

        ctx.save();
        ctx.translate(centerX, centerY);

        const points = 28;
        for (let i = 0; i < points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const dataIndex = Math.floor((i / points) * (freqData.length * 0.7));
          let val = isPlaying ? freqData[dataIndex] / 255 : Math.sin(Date.now() / 350 + i * 0.4) * 0.12 + 0.16;
          val = Math.max(0.1, val);
          const len = radius + val * (radius * 0.7);

          const x1 = Math.cos(angle) * radius;
          const y1 = Math.sin(angle) * radius;
          const x2 = Math.cos(angle) * len;
          const y2 = Math.sin(angle) * len;

          ctx.strokeStyle = i % 2 === 0 ? (isDark ? '#f4a261' : '#e76f51') : (isDark ? '#e9c46a' : '#2a9d8f');
          ctx.lineWidth = 2.2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        ctx.restore();
      }

      ctx.restore();
      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isMounted = false;
      resizeObserver.disconnect();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, mode, theme, height]);

  return (
    <div className={`relative rounded-2xl border-2 p-3 ${
      isDark ? 'bg-[#1e1d1a] border-[#36342e]' : 'bg-[#fffdf9] border-[#181816] shadow-paper-sm'
    } ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1.5 font-typewriter text-[10px] font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[#e76f51]" />
          <span>DOODLE SOUNDWAVE</span>
          {isPlaying && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          )}
        </div>

        {/* Visualizer Mode Switcher */}
        <div className={`flex items-center p-0.5 rounded-lg border ${
          isDark ? 'border-[#36342e] bg-[#252420]' : 'border-[#181816] bg-[#f8f3ea]'
        }`}>
          <button
            onClick={() => setMode('bars')}
            className={`p-1 rounded transition-colors ${mode === 'bars' ? (isDark ? 'bg-[#f4a261] text-[#161513]' : 'bg-[#e76f51] text-white') : 'opacity-60 hover:opacity-100'}`}
            title="Doodle Bars"
          >
            <BarChart3 className="w-3 h-3" />
          </button>
          <button
            onClick={() => setMode('wave')}
            className={`p-1 rounded transition-colors ${mode === 'wave' ? (isDark ? 'bg-[#f4a261] text-[#161513]' : 'bg-[#e76f51] text-white') : 'opacity-60 hover:opacity-100'}`}
            title="Ink Wave"
          >
            <Activity className="w-3 h-3" />
          </button>
          <button
            onClick={() => setMode('radial')}
            className={`p-1 rounded transition-colors ${mode === 'radial' ? (isDark ? 'bg-[#f4a261] text-[#161513]' : 'bg-[#e76f51] text-white') : 'opacity-60 hover:opacity-100'}`}
            title="Doodle Sunburst"
          >
            <Disc className="w-3 h-3" />
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px` }}
        className="w-full block"
      />
    </div>
  );
};
