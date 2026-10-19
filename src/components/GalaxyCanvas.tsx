import { useEffect, useRef } from 'react';

// ── Category colors ──
const colors = ['#ff6b6b', '#a78bfa', '#fbbf24', '#34d399', '#38bdf8', '#fb923c', '#f472b6'];
const glows = [
  'rgba(255,107,107,', 'rgba(167,139,250,', 'rgba(251,191,36,',
  'rgba(52,211,153,', 'rgba(56,189,248,', 'rgba(251,146,60,', 'rgba(244,114,182,',
];

// ── Constellation-style doodle draw functions ──
// Thin single-stroke line art with dots at vertices

function drawKettlebell(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath(); ctx.arc(0, s * 0.15, s * 0.22, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-s * 0.12, -s * 0.05);
  ctx.quadraticCurveTo(-s * 0.16, -s * 0.32, 0, -s * 0.35);
  ctx.quadraticCurveTo(s * 0.16, -s * 0.32, s * 0.12, -s * 0.05);
  ctx.stroke();
  for (const [dx, dy] of [[-s*0.12,-s*0.05],[s*0.12,-s*0.05],[0,-s*0.35],[0,s*0.37],[-s*0.22,s*0.15],[s*0.22,s*0.15]]) {
    ctx.beginPath(); ctx.arc(dx, dy, 1.2, 0, Math.PI * 2); ctx.fill();
  }
}

function drawHeadphones(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath(); ctx.arc(0, -s * 0.08, s * 0.28, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
  for (const sx of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(sx * s * 0.27, 0); ctx.lineTo(sx * s * 0.27, s * 0.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx * s * 0.32, s * 0.04); ctx.lineTo(sx * s * 0.32, s * 0.18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx * s * 0.27, s * 0.04); ctx.lineTo(sx * s * 0.32, s * 0.04); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx * s * 0.27, s * 0.18); ctx.lineTo(sx * s * 0.32, s * 0.18); ctx.stroke();
  }
  for (const [dx, dy] of [[0,-s*0.36],[-s*0.27,0],[s*0.27,0],[-s*0.32,s*0.11],[s*0.32,s*0.11]]) {
    ctx.beginPath(); ctx.arc(dx, dy, 1.2, 0, Math.PI * 2); ctx.fill();
  }
}

function drawCat(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath(); ctx.ellipse(0, s * 0.05, s * 0.2, s * 0.16, 0, 0, Math.PI * 2); ctx.stroke();
  // Ears
  ctx.beginPath(); ctx.moveTo(-s*0.18,-s*0.08); ctx.lineTo(-s*0.15,-s*0.3); ctx.lineTo(-s*0.04,-s*0.12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(s*0.18,-s*0.08); ctx.lineTo(s*0.15,-s*0.3); ctx.lineTo(s*0.04,-s*0.12); ctx.stroke();
  // Eyes
  ctx.beginPath(); ctx.arc(-s*0.07, s*0.02, 1.5, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*0.07, s*0.02, 1.5, 0, Math.PI*2); ctx.fill();
  // Whiskers
  ctx.beginPath(); ctx.moveTo(-s*0.14,s*0.08); ctx.lineTo(-s*0.32,s*0.04); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-s*0.14,s*0.1); ctx.lineTo(-s*0.3,s*0.12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(s*0.14,s*0.08); ctx.lineTo(s*0.32,s*0.04); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(s*0.14,s*0.1); ctx.lineTo(s*0.3,s*0.12); ctx.stroke();
  // Tail
  ctx.beginPath(); ctx.moveTo(s*0.18,s*0.15); ctx.quadraticCurveTo(s*0.35,s*0.2,s*0.3,0); ctx.stroke();
  for (const [dx, dy] of [[-s*0.15,-s*0.3],[s*0.15,-s*0.3],[-s*0.32,s*0.04],[s*0.32,s*0.04],[s*0.3,0]]) {
    ctx.beginPath(); ctx.arc(dx, dy, 1, 0, Math.PI * 2); ctx.fill();
  }
}

function drawTerminal(ctx: CanvasRenderingContext2D, s: number) {
  // Prompt chevron
  ctx.beginPath(); ctx.moveTo(-s*0.2,-s*0.02); ctx.lineTo(-s*0.06,s*0.08); ctx.lineTo(-s*0.2,s*0.18); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,s*0.18); ctx.lineTo(s*0.2,s*0.18); ctx.stroke();
  // Corner brackets
  const corners: [number,number,number,number,number,number][] = [
    [-0.35,-0.2,-0.35,-0.12,-0.27,-0.2],
    [0.35,-0.2,0.35,-0.12,0.27,-0.2],
    [-0.35,0.28,-0.35,0.2,-0.27,0.28],
    [0.35,0.28,0.35,0.2,0.27,0.28],
  ];
  for (const [x1,y1,x2,y2,x3,y3] of corners) {
    ctx.beginPath(); ctx.moveTo(s*x1,s*y1); ctx.lineTo(s*x2,s*y2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s*x1,s*y1); ctx.lineTo(s*x3,s*y3); ctx.stroke();
  }
  for (const [dx, dy] of [[-s*0.35,-s*0.2],[s*0.35,-s*0.2],[-s*0.35,s*0.28],[s*0.35,s*0.28],[-s*0.06,s*0.08]]) {
    ctx.beginPath(); ctx.arc(dx, dy, 1, 0, Math.PI * 2); ctx.fill();
  }
}

function drawMountain(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.moveTo(-s*0.38,s*0.2); ctx.lineTo(-s*0.12,-s*0.22); ctx.lineTo(s*0.02,s*0.02);
  ctx.lineTo(s*0.22,-s*0.28); ctx.lineTo(s*0.38,s*0.2);
  ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-s*0.4,s*0.2); ctx.lineTo(s*0.4,s*0.2); ctx.stroke();
  ctx.beginPath(); ctx.arc(s*0.3,-s*0.15,s*0.06,0,Math.PI*2); ctx.stroke();
  for (const [dx, dy] of [[-s*0.12,-s*0.22],[s*0.22,-s*0.28],[s*0.02,s*0.02],[-s*0.38,s*0.2],[s*0.38,s*0.2],[s*0.3,-s*0.15]]) {
    ctx.beginPath(); ctx.arc(dx, dy, 1, 0, Math.PI * 2); ctx.fill();
  }
}

function drawSun(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath(); ctx.arc(0, 0, s * 0.14, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * s * 0.2, Math.sin(a) * s * 0.2);
    ctx.lineTo(Math.cos(a) * s * 0.32, Math.sin(a) * s * 0.32);
    ctx.stroke();
    ctx.beginPath(); ctx.arc(Math.cos(a) * s * 0.32, Math.sin(a) * s * 0.32, 1, 0, Math.PI * 2); ctx.fill();
  }
}

function drawHeart(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.moveTo(0, s * 0.25);
  ctx.bezierCurveTo(-s*0.06,s*0.18,-s*0.32,s*0.02,-s*0.32,-s*0.1);
  ctx.bezierCurveTo(-s*0.32,-s*0.25,-s*0.16,-s*0.3,0,-s*0.14);
  ctx.bezierCurveTo(s*0.16,-s*0.3,s*0.32,-s*0.25,s*0.32,-s*0.1);
  ctx.bezierCurveTo(s*0.32,s*0.02,s*0.06,s*0.18,0,s*0.25);
  ctx.stroke();
  for (const [dx, dy] of [[0,s*0.25],[0,-s*0.14],[-s*0.32,-s*0.1],[s*0.32,-s*0.1]]) {
    ctx.beginPath(); ctx.arc(dx, dy, 1, 0, Math.PI * 2); ctx.fill();
  }
}

const drawFns = [drawKettlebell, drawHeadphones, drawCat, drawTerminal, drawMountain, drawSun, drawHeart];

// ── Types ──
interface Star {
  angle: number;
  dist: number;
  dAngle: number;
  wobbleA: number;
  wobbleF: number;
  phase: number;
  color: string;
  glow: string;
  draw: ((ctx: CanvasRenderingContext2D, s: number) => void) | null;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  rot: number;
  rotSpeed: number;
}

interface DustCloud {
  angle: number;
  dist: number;
  dAngle: number;
  size: number;
  color: string;
  alpha: number;
  phase: number;
}

const ARMS = 3;
const STAR_COUNT = 380;
const DUST_COUNT = 55;

function createStars(W: number, H: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    const arm = i % ARMS;
    const armAngle = (arm / ARMS) * Math.PI * 2;
    const t = Math.random();
    const dist = 50 + t * Math.min(W, H) * 0.5;
    const spiral = armAngle + t * 2.6 + (Math.random() - 0.5) * 0.8;
    const ci = i % 7;
    const isDoodle = Math.random() < 0.09;
    stars.push({
      angle: spiral,
      dist,
      dAngle: 0.00008 + Math.random() * 0.00025,
      wobbleA: Math.random() * 0.3,
      wobbleF: 0.002 + Math.random() * 0.006,
      phase: Math.random() * Math.PI * 2,
      color: colors[ci],
      glow: glows[ci],
      draw: isDoodle ? drawFns[ci] : null,
      size: isDoodle ? (16 + Math.random() * 16) : (0.8 + Math.random() * 2.2),
      baseAlpha: isDoodle ? (0.25 + Math.random() * 0.3) : (0.25 + Math.random() * 0.75),
      twinkleSpeed: 0.015 + Math.random() * 0.035,
      twinklePhase: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.001,
    });
  }
  return stars;
}

function createDust(W: number, H: number): DustCloud[] {
  const dust: DustCloud[] = [];
  for (let i = 0; i < DUST_COUNT; i++) {
    const arm = i % ARMS;
    const armAngle = (arm / ARMS) * Math.PI * 2;
    const t = 0.15 + Math.random() * 0.75;
    const dist = 60 + t * Math.min(W, H) * 0.48;
    const spiral = armAngle + t * 2.6 + (Math.random() - 0.5) * 0.5;
    const ci = i % 7;
    dust.push({
      angle: spiral,
      dist,
      dAngle: 0.00006 + Math.random() * 0.00015,
      size: 30 + Math.random() * 70,
      color: glows[ci],
      alpha: 0.012 + Math.random() * 0.025,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return dust;
}

export default function GalaxyCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W: number, H: number, dpr: number;
    let stars: Star[];
    let dust: DustCloud[];
    let frame = 0;
    let rafId: number;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = container!.clientWidth || window.innerWidth;
      H = container!.clientHeight || window.innerHeight;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      canvas!.style.width = W + 'px';
      canvas!.style.height = H + 'px';
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
      resize();
      stars = createStars(W, H);
      dust = createDust(W, H);
    }

    function render() {
      ctx!.clearRect(0, 0, W, H);
      frame++;
      const ccx = W / 2;
      const ccy = H / 2;

      // Core glow
      const cg = ctx!.createRadialGradient(ccx, ccy, 0, ccx, ccy, 200);
      cg.addColorStop(0, 'rgba(130,110,255,0.06)');
      cg.addColorStop(0.4, 'rgba(100,80,200,0.02)');
      cg.addColorStop(1, 'transparent');
      ctx!.fillStyle = cg;
      ctx!.fillRect(0, 0, W, H);

      // Dust clouds
      for (const d of dust) {
        d.angle += d.dAngle;
        const x = ccx + Math.cos(d.angle) * d.dist;
        const y = ccy + Math.sin(d.angle) * d.dist * 0.68;
        const distC = Math.sqrt((x - ccx) ** 2 + (y - ccy) ** 2);
        const fade = Math.min(1, Math.max(0, (distC - 90) / 100));
        ctx!.save();
        ctx!.globalAlpha = d.alpha * fade * (0.7 + 0.3 * Math.sin(frame * 0.005 + d.phase));
        const g = ctx!.createRadialGradient(x, y, 0, x, y, d.size);
        g.addColorStop(0, d.color + '0.4)');
        g.addColorStop(1, d.color + '0)');
        ctx!.fillStyle = g;
        ctx!.beginPath(); ctx!.arc(x, y, d.size, 0, Math.PI * 2); ctx!.fill();
        ctx!.restore();
      }

      // Stars and constellation doodles
      for (const s of stars) {
        s.angle += s.dAngle;
        s.rot += s.rotSpeed;
        const wobble = Math.sin(frame * s.wobbleF + s.phase) * s.wobbleA;
        const d = s.dist + wobble * 15;
        const x = ccx + Math.cos(s.angle) * d;
        const y = ccy + Math.sin(s.angle) * d * 0.68;
        const distC = Math.sqrt((x - ccx) ** 2 + (y - ccy) ** 2);
        const fade = Math.min(1, Math.max(0, (distC - 85) / 90));
        const twinkle = 0.55 + 0.45 * Math.sin(frame * s.twinkleSpeed + s.twinklePhase);
        const alpha = s.baseAlpha * fade * twinkle;
        if (alpha < 0.01) continue;

        if (s.draw) {
          ctx!.save();
          ctx!.translate(x, y);
          ctx!.rotate(s.rot);
          ctx!.globalAlpha = alpha;
          ctx!.strokeStyle = s.color;
          ctx!.fillStyle = s.color;
          ctx!.lineWidth = 0.8;
          ctx!.lineCap = 'round';
          ctx!.lineJoin = 'round';
          s.draw(ctx!, s.size);
          ctx!.restore();
        } else {
          ctx!.save();
          ctx!.globalAlpha = alpha * 0.25;
          ctx!.fillStyle = s.glow + '0.5)';
          ctx!.beginPath(); ctx!.arc(x, y, s.size * 3, 0, Math.PI * 2); ctx!.fill();
          ctx!.globalAlpha = alpha;
          ctx!.fillStyle = s.color;
          ctx!.beginPath(); ctx!.arc(x, y, s.size, 0, Math.PI * 2); ctx!.fill();
          ctx!.globalAlpha = alpha * 0.9;
          ctx!.fillStyle = '#fff';
          ctx!.beginPath(); ctx!.arc(x, y, s.size * 0.35, 0, Math.PI * 2); ctx!.fill();
          ctx!.restore();
        }
      }

      rafId = requestAnimationFrame(render);
    }

    init();
    rafId = requestAnimationFrame(render);

    const handleResize = () => {
      resize();
      // Regenerate particles for new dimensions
      stars = createStars(W, H);
      dust = createDust(W, H);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
