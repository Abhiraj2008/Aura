import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Disc3, Scissors, Sparkles, Volume2 } from 'lucide-react';

interface PaperTearIntroProps {
  onComplete: () => void;
  theme?: 'paper' | 'chalk';
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  size: number;
  color: string;
  opacity: number;
}

// 72 curated erratic zigzag paper grain offsets for an organic, non-uniform hand tear
const ZIGZAG_OFFSETS = [
  0,   6, -11,  14,  -8,  18, -14,  10, -19,  15,
 -9,  22, -16,   8, -21,  17, -12,  25, -18,  11,
-24,  16, -13,  20, -15,   9, -23,  19, -11,  24,
-17,  13, -20,  18, -14,  22, -19,  12, -25,  16,
-10,  21, -15,   8, -22,  19, -13,  23, -17,  11,
-26,  18, -12,  21, -16,  10, -22,  17, -14,  25,
-18,  12, -21,  16, -11,  20, -17,  14, -23,  19,
 -8,   0
];

export const PaperTearIntro: React.FC<PaperTearIntroProps> = ({ onComplete, theme = 'paper' }) => {
  // Total duration: 2.0s
  // Stages: 'sealed' (0-200ms) -> 'tearing' (200-1500ms, 1.3s) -> 'parting' (1500-1900ms, 0.4s) -> 'done'
  const [stage, setStage] = useState<'sealed' | 'tearing' | 'parting' | 'done'>('sealed');
  const [progress, setProgress] = useState<number>(0); // 0 to 1
  const [particles, setParticles] = useState<Particle[]>([]);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  const isDark = theme === 'chalk';
  const animFrameRef = useRef<number | null>(null);
  const particleIdRef = useRef<number>(0);
  const audioStartedRef = useRef<boolean>(false);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Safe synthesized paper tearing crackle
  const playPaperRipSound = () => {
    if (audioStartedRef.current) return;
    audioStartedRef.current = true;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      
      const bufferSize = Math.floor(ctx.sampleRate * 1.3);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.03 * white) / 1.03;
        const crackle = Math.random() > 0.975 ? (Math.random() - 0.5) * 1.1 : 0;
        data[i] = last * 0.2 + crackle * 0.15;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1500, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(2600, ctx.currentTime + 1.25);
      filter.Q.value = 1.3;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 1.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.3);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch {
      // Audio is optional
    }
  };

  // Stage 1: Auto-start tear after brief 200ms setup
  useEffect(() => {
    const timer = setTimeout(() => {
      setStage('tearing');
      playPaperRipSound();
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // Generate full meandered, non-uniform zig-zag tear path across full height
  const { tearPathPoints } = useMemo(() => {
    const { width: W, height: H } = windowSize;
    const midX = W / 2;
    const numPoints = ZIGZAG_OFFSETS.length;
    const pts: { x: number; y: number }[] = [];

    for (let i = 0; i < numPoints; i++) {
      const ratio = i / (numPoints - 1);
      const y = ratio * H;
      
      // Large organic wander: paper grain meanders left and right across the sheet
      const wander = Math.sin(ratio * Math.PI * 2.8) * 22 + Math.cos(ratio * Math.PI * 4.5) * 12;
      
      // Sharp ununiform zig-zag offset
      const zigzag = ZIGZAG_OFFSETS[i];

      const x = midX + wander + zigzag;
      pts.push({ x, y });
    }

    return { tearPathPoints: pts };
  }, [windowSize]);

  // Stage 2: 1300ms (1.3s) progressive zig-zag tear down
  useEffect(() => {
    if (stage !== 'tearing') return;

    let start: number | null = null;
    const duration = 1300; // 1.3 seconds of active ununiform tearing

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const rawProgress = Math.min(elapsed / duration, 1);

      // Organic rip easing with slight physical resistance snaps
      const p = Math.pow(rawProgress, 1.12);
      setProgress(p);

      // Current head position on the zig-zag path
      const pathIdx = Math.min(Math.floor(p * (tearPathPoints.length - 1)), tearPathPoints.length - 1);
      const headPt = tearPathPoints[pathIdx] || { x: windowSize.width / 2, y: p * windowSize.height };

      // Spawn flying paper fiber particles around the erratic tear head
      if (rawProgress < 0.98 && Math.random() > 0.25) {
        const colors = isDark 
          ? ['#e76f51', '#f4a261', '#e9c46a', '#ffffff', '#eae2d3']
          : ['#e76f51', '#e9c46a', '#181816', '#fffdf5', '#c7beab'];

        const count = Math.floor(Math.random() * 3) + 2;
        const newBatch: Particle[] = [];
        for (let i = 0; i < count; i++) {
          const side = Math.random() > 0.5 ? 1 : -1;
          newBatch.push({
            id: ++particleIdRef.current,
            x: headPt.x + side * (Math.random() * 10 + 4),
            y: headPt.y + (Math.random() - 0.5) * 12,
            vx: side * (Math.random() * 4.5 + 2),
            vy: (Math.random() - 0.5) * 4 - 1.5,
            rot: Math.random() * 360,
            vRot: (Math.random() - 0.5) * 18,
            size: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: 1
          });
        }
        setParticles(prev => [...prev.slice(-40), ...newBatch]);
      }

      // Update particles
      setParticles(prev =>
        prev
          .map(pt => ({
            ...pt,
            x: pt.x + pt.vx,
            y: pt.y + pt.vy,
            rot: pt.rot + pt.vRot,
            opacity: pt.opacity - 0.035
          }))
          .filter(pt => pt.opacity > 0)
      );

      if (rawProgress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        // Tear reaches the bottom! Proceed to parting
        setStage('parting');
      }
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [stage, windowSize, isDark, tearPathPoints]);

  // Stage 3: Parting flaps swing open for 400ms, completing ~2s total
  useEffect(() => {
    if (stage === 'parting') {
      const timer = setTimeout(() => {
        setStage('done');
        onComplete();
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [stage, onComplete]);

  // Skip
  const handleSkip = () => {
    setStage('done');
    onComplete();
  };

  const { width: W, height: H } = windowSize;

  // Maximum separation at top as the paper rips open
  const maxGap = Math.min(W * 0.14, 150);
  const currentTopGap = maxGap * Math.pow(progress, 0.7);

  // Dynamic polygonal clip paths matching the ununiform zig-zag rip
  const { leftClipPathD, rightClipPathD, leftTornEdgePath, rightTornEdgePath, currentHeadPos } = useMemo(() => {
    const totalPts = tearPathPoints.length;
    const currentIdx = Math.min(Math.floor(progress * (totalPts - 1)), totalPts - 1);
    const head = tearPathPoints[currentIdx] || { x: W / 2, y: progress * H };

    const lPoints: { x: number; y: number }[] = [];
    const rPoints: { x: number; y: number }[] = [];

    // Torn region above the head (0 to currentIdx)
    for (let i = 0; i <= currentIdx; i++) {
      const pt = tearPathPoints[i];
      const distRatio = currentIdx > 0 ? (1 - i / currentIdx) : 0;
      const pull = currentTopGap * Math.pow(distRatio, 1.35);

      lPoints.push({ x: pt.x - pull, y: pt.y });
      rPoints.push({ x: pt.x + pull, y: pt.y });
    }

    // Left Flap SVG polygon:
    // (0, 0) -> (lPoints[0].x, 0) -> down torn edge to head -> down intact zigzag path to bottom -> (0, H) -> Z
    let lD = `M 0,0 L ${lPoints[0]?.x.toFixed(1) || (W/2)},0`;
    for (let i = 1; i < lPoints.length; i++) {
      lD += ` L ${lPoints[i].x.toFixed(1)},${lPoints[i].y.toFixed(1)}`;
    }
    // Down intact zigzag path ahead of tear
    for (let i = currentIdx + 1; i < totalPts; i++) {
      lD += ` L ${tearPathPoints[i].x.toFixed(1)},${tearPathPoints[i].y.toFixed(1)}`;
    }
    lD += ` L 0,${H} Z`;

    // Right Flap SVG polygon:
    // (W, 0) -> (W, H) -> (tearPathPoints[last].x, H) -> up intact zigzag path to head -> up right torn edge -> (W, 0) -> Z
    let rD = `M ${W},0 L ${W},${H} L ${tearPathPoints[totalPts - 1].x.toFixed(1)},${H}`;
    // Up intact zigzag path to head
    for (let i = totalPts - 2; i >= currentIdx; i--) {
      rD += ` L ${tearPathPoints[i].x.toFixed(1)},${tearPathPoints[i].y.toFixed(1)}`;
    }
    // Up right torn edge to top
    for (let i = rPoints.length - 1; i >= 0; i--) {
      rD += ` L ${rPoints[i].x.toFixed(1)},${rPoints[i].y.toFixed(1)}`;
    }
    rD += ` Z`;

    // SVG stroke paths for the white torn paper fibers
    const lEdgeD = lPoints.length > 1
      ? `M ${lPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`
      : '';
    const rEdgeD = rPoints.length > 1
      ? `M ${rPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`
      : '';

    return {
      leftClipPathD: lD,
      rightClipPathD: rD,
      leftTornEdgePath: lEdgeD,
      rightTornEdgePath: rEdgeD,
      currentHeadPos: head
    };
  }, [progress, tearPathPoints, currentTopGap, W, H]);

  if (stage === 'done') {
    return null;
  }

  const isParting = stage === 'parting';

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-hidden select-none cursor-pointer transition-opacity duration-200 ${
        isParting ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
      style={{ perspective: '1600px' }}
      onClick={() => {
        if (stage === 'sealed') {
          setStage('tearing');
          playPaperRipSound();
        } else if (stage === 'tearing') {
          handleSkip();
        }
      }}
    >
      {/* SVG Definitions for Dynamic Zig-Zag Clip-Paths & Deckle Shadows */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="aura-zigzag-left-clip" clipPathUnits="userSpaceOnUse">
            <path d={leftClipPathD} />
          </clipPath>
          <clipPath id="aura-zigzag-right-clip" clipPathUnits="userSpaceOnUse">
            <path d={rightClipPathD} />
          </clipPath>
          <filter id="zigzag-deckle-shadow-left" x="-30%" y="-10%" width="160%" height="120%">
            <feDropShadow dx="-5" dy="3" stdDeviation="5" floodColor="#181816" floodOpacity="0.4" />
          </filter>
          <filter id="zigzag-deckle-shadow-right" x="-30%" y="-10%" width="160%" height="120%">
            <feDropShadow dx="5" dy="3" stdDeviation="5" floodColor="#181816" floodOpacity="0.4" />
          </filter>
        </defs>
      </svg>

      {/* Skip Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleSkip();
        }}
        className="absolute top-5 right-6 z-[100] px-3.5 py-1.5 rounded-full text-xs font-typewriter tracking-wider uppercase bg-[#181816]/85 text-[#f5f0e6] hover:bg-[#181816] hover:scale-105 active:scale-95 transition-all shadow-xl border border-white/15 flex items-center space-x-1.5"
      >
        <span>Skip intro</span>
        <span className="opacity-60 text-[10px]">↵</span>
      </button>

      {/* Floating Fiber Dust / Paper Flecks */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute pointer-events-none rounded-[1px]"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size * 0.65}px`,
            backgroundColor: p.color,
            transform: `translate(-50%, -50%) rotate(${p.rot}deg)`,
            opacity: p.opacity,
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            zIndex: 95
          }}
        />
      ))}

      {/* LEFT PAPER SHEET */}
      <div
        className="absolute top-0 left-0 bottom-0 w-full overflow-hidden transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          clipPath: 'url(#aura-zigzag-left-clip)',
          transformOrigin: 'left center',
          transform: isParting
            ? 'translateX(-105%) rotateY(-75deg) scale(0.95)'
            : 'translateX(0) rotateY(0deg) scale(1)',
          backgroundColor: '#f5eee3',
          backgroundImage: `
            radial-gradient(#d6cdb9 0.75px, transparent 0.75px),
            radial-gradient(#ebe1cf 0.75px, #f5eee3 0.75px)
          `,
          backgroundSize: '24px 24px',
          boxShadow: isParting ? 'none' : '15px 0 45px rgba(24, 24, 22, 0.25)'
        }}
      >
        {/* Left Side Content */}
        <div className="w-1/2 h-full flex flex-col justify-between p-3 sm:p-8 relative">
          <div className="absolute top-0 bottom-0 left-2 sm:left-3 w-1 border-r-2 border-dotted border-[#181816]/20" />

          {/* Postal Washi Tape */}
          <div className="pt-2">
            <div className="inline-flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-sm washi-tape rotate-[-2deg] border border-[#181816]/80 text-[#181816] font-typewriter text-[10px] sm:text-xs font-bold tracking-widest shadow-sm">
              <span>✦ AURA AUDIO</span>
              <span className="opacity-60 hidden sm:inline">•</span>
              <span className="hidden sm:inline">ISSUE Nº 01</span>
            </div>

            <div className="mt-4 sm:mt-8 space-y-1 sm:space-y-1.5">
              <div className="text-[9px] sm:text-[10px] font-typewriter font-bold tracking-widest uppercase text-[#e76f51]">
                STUDIO ARCHIVE • 2026
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-[#181816] leading-none">
                AURA<br />
                <span className="text-xl sm:text-3xl md:text-4xl font-doodle font-semibold text-[#e76f51] tracking-normal">
                  Sound Machine
                </span>
              </h1>
            </div>
          </div>

          {/* Center Rubber Stamp Seal */}
          <div className="my-auto flex items-center space-x-3 sm:space-x-5 pl-1 sm:pl-2">
            <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-[#181816]/70 flex flex-col items-center justify-center p-1 sm:p-2 text-center text-[#181816] rotate-[-6deg] shrink-0 bg-[#e9c46a]/15 shadow-sm">
              <Disc3 className="w-5 h-5 sm:w-7 sm:h-7 text-[#e76f51] animate-spin" style={{ animationDuration: '6s' }} />
              <span className="text-[6px] sm:text-[8px] font-typewriter font-bold mt-0.5 sm:mt-1 tracking-tighter uppercase leading-tight">
                MASTER AUDIO
              </span>
            </div>
            <div className="space-y-0.5 sm:space-y-1 min-w-0">
              <div className="font-display font-bold text-[10px] sm:text-xs uppercase tracking-wider text-[#181816] truncate">
                Handcrafted Deck
              </div>
              <p className="font-doodle text-sm sm:text-lg text-[#181816]/80 leading-snug line-clamp-2">
                "Turn the knob, pull the reel & let rhythm breathe."
              </p>
            </div>
          </div>

          {/* Bottom Specs */}
          <div className="flex items-end justify-between pl-2">
            <div className="space-y-1 font-typewriter text-[9px] uppercase tracking-wider text-[#181816]/65">
              <div>BIT-PERFECT 24-BIT ARCHIVE</div>
              <div>DSD • FLAC • WAV • MP3 • AIFF</div>
              <div className="text-[#e76f51] font-bold">ALL LOCAL • ZERO TELEMETRY</div>
            </div>
            <div className="font-doodle text-xl text-[#181816]/70 rotate-[-3deg]">
              vol. 01 / studio
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PAPER SHEET */}
      <div
        className="absolute top-0 right-0 bottom-0 w-full overflow-hidden transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          clipPath: 'url(#aura-zigzag-right-clip)',
          transformOrigin: 'right center',
          transform: isParting
            ? 'translateX(105%) rotateY(75deg) scale(0.95)'
            : 'translateX(0) rotateY(0deg) scale(1)',
          backgroundColor: '#f5eee3',
          backgroundImage: `
            radial-gradient(#d6cdb9 0.75px, transparent 0.75px),
            radial-gradient(#ebe1cf 0.75px, #f5eee3 0.75px)
          `,
          backgroundSize: '24px 24px',
          boxShadow: isParting ? 'none' : '-15px 0 45px rgba(24, 24, 22, 0.25)'
        }}
      >
        {/* Right Side Content */}
        <div className="w-1/2 h-full ml-auto flex flex-col justify-between p-3 sm:p-8 relative">
          <div className="absolute top-0 bottom-0 right-2 sm:right-3 w-1 border-r-2 border-dotted border-[#181816]/20" />

          {/* Airmail Stamp Badge */}
          <div className="pt-2 flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] sm:text-[10px] font-typewriter font-bold tracking-widest uppercase text-[#181816]/60">
                SERIAL: 8492
              </span>
              <div className="font-doodle text-sm sm:text-xl text-[#e76f51]">
                unpack the vibes ✂
              </div>
            </div>

            <div className="p-1 sm:p-2 border-2 border-[#181816] rounded bg-[#faf5ed] rotate-[3deg] shadow-paper-sm flex flex-col items-center">
              <span className="font-typewriter text-[7px] sm:text-[9px] font-extrabold tracking-tighter">PAR AVION</span>
              <span className="font-display font-black text-xs sm:text-sm text-[#e76f51]">99¢</span>
            </div>
          </div>

          {/* Center Barcode */}
          <div className="my-auto flex flex-col items-end space-y-2 sm:space-y-4 pr-1 sm:pr-2">
            <div className="bg-[#fffdf9] p-2.5 sm:p-4 rounded-xl border-2 border-[#181816] shadow-paper rotate-[1.5deg] max-w-[150px] sm:max-w-xs w-full">
              <div className="flex items-center justify-between pb-1 sm:pb-2 border-b border-[#181816]/20">
                <span className="font-display font-bold text-[10px] sm:text-xs uppercase tracking-wider text-[#181816]">
                  Acoustic
                </span>
                <span className="text-[8px] sm:text-[9px] font-typewriter bg-[#40916c]/15 text-[#40916c] font-bold px-1 sm:px-1.5 py-0.5 rounded">
                  VERIFIED
                </span>
              </div>
              <div className="pt-2 sm:pt-3 flex items-end justify-between h-8 sm:h-10 px-0.5 sm:px-1 opacity-80">
                {[3, 1, 4, 1, 2, 5, 1, 3, 2, 4, 1, 2, 4, 1, 3, 2, 5, 2, 1, 4, 2, 3, 1, 2, 4].map((h, idx) => (
                  <div
                    key={idx}
                    className="bg-[#181816] w-[2px] sm:w-[2.5px] rounded-[0.5px]"
                    style={{ height: `${h * 18 + 12}%` }}
                  />
                ))}
              </div>
              <div className="text-center font-typewriter text-[7px] sm:text-[9px] tracking-[0.2em] sm:tracking-[0.25em] text-[#181816]/70 pt-0.5 sm:pt-1">
                8 92019 44021
              </div>
            </div>

            <div className="hidden sm:flex items-center space-x-2 text-[#181816]/70 pr-1">
              <Volume2 className="w-4 h-4 text-[#e76f51]" />
              <span className="font-typewriter text-[10px] uppercase font-bold tracking-wider">
                STUDIO GRADE CASSETTE EMULATION
              </span>
            </div>
          </div>

          {/* Bottom status */}
          <div className="flex items-end justify-between pr-2">
            <div className="font-doodle text-xl text-[#181816]/70">
              tape deck unsealing...
            </div>
            <div className="space-y-0.5 text-right font-typewriter text-[9px] uppercase tracking-wider text-[#181816]/65">
              <div>DESIGNED FOR WINDOWS & WEB</div>
              <div>AUTHENTIC ANALOG WARMTH</div>
            </div>
          </div>
        </div>
      </div>

      {/* SVG REALISTIC ZIG-ZAG TORN DECKLE EDGES & FIBER CORES */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible"
        style={{
          opacity: isParting ? 0 : 1,
          transition: 'opacity 0.25s ease'
        }}
      >
        {/* Pre-tear guide perforation crease (fades away as tear progresses) */}
        {progress < 0.1 && (
          <path
            d={`M ${tearPathPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`}
            stroke="#181816"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            strokeOpacity="0.25"
            fill="none"
          />
        )}

        {/* Left Torn Zig-Zag Edge Highlight & Shadow */}
        {leftTornEdgePath && (
          <>
            <path
              d={leftTornEdgePath}
              stroke="#181816"
              strokeWidth="5"
              strokeOpacity="0.3"
              fill="none"
              filter="url(#zigzag-deckle-shadow-left)"
            />
            <path
              d={leftTornEdgePath}
              stroke="#fffdf7"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}

        {/* Right Torn Zig-Zag Edge Highlight & Shadow */}
        {rightTornEdgePath && (
          <>
            <path
              d={rightTornEdgePath}
              stroke="#181816"
              strokeWidth="5"
              strokeOpacity="0.3"
              fill="none"
              filter="url(#zigzag-deckle-shadow-right)"
            />
            <path
              d={rightTornEdgePath}
              stroke="#fffdf7"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
      </svg>

      {/* ACTIVE ERRATIC TEAR HEAD / RIP POINT */}
      {!isParting && progress < 0.99 && (
        <div
          className="absolute z-50 pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${currentHeadPos.x}px`,
            top: `${currentHeadPos.y}px`,
            transition: 'left 0.04s ease-out, top 0.04s linear'
          }}
        >
          <div className="relative flex items-center justify-center">
            {/* Ambient orange spark */}
            <div className="absolute -inset-4 bg-[#e76f51]/45 rounded-full blur-md animate-pulse" />

            {/* Tactile Pull Tab */}
            <div className="relative w-10 h-10 rounded-full bg-[#e76f51] border-2 border-[#181816] flex items-center justify-center text-white shadow-paper-lg">
              <Scissors className="w-4 h-4 rotate-90 text-white" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#e9c46a] border border-[#181816] flex items-center justify-center text-[#181816]">
                <Sparkles className="w-2 h-2" />
              </div>
            </div>

            {/* Frayed Paper Tag Following the Zig-zag rip */}
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-sm bg-[#e9c46a] border border-[#181816] text-[#181816] font-typewriter text-[8px] font-bold tracking-wider uppercase rotate-[-3deg] shadow-sm whitespace-nowrap"
            >
              TEAR ✂
            </div>
          </div>
        </div>
      )}

      {/* Light Burst Spilling Through Center As Zig-Zag Tear Expands */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-400 bg-gradient-to-r from-transparent via-amber-100/25 to-transparent"
        style={{
          opacity: isParting ? 1 : progress * 0.75
        }}
      />
    </div>
  );
};

export default PaperTearIntro;
