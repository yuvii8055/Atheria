import React, { useEffect, useRef } from 'react';

interface FluidCanvasProps {
  interactive?: boolean;
}

export const FluidCanvas: React.FC<FluidCanvasProps> = ({ interactive = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse tracking for fluid disturbance
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      speed: 0,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Dynamic fluid blobs (orbs of cosmic chromatic light)
    interface FluidOrb {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseRadius: number;
      color: string;
      phase: number;
      speed: number;
    }

    const colors = [
      'rgba(6, 182, 212, 0.28)',   // Neon Cyan
      'rgba(139, 92, 246, 0.24)',  // Galactic Violet
      'rgba(236, 72, 153, 0.18)',  // Stellar Pink / Fuchsia
      'rgba(59, 130, 246, 0.22)',  // Deep Astral Blue
      'rgba(245, 158, 11, 0.12)',  // Supernova Gold/Amber
    ];

    const orbs: FluidOrb[] = [
      {
        x: width * 0.25,
        y: height * 0.3,
        vx: 0.4,
        vy: 0.3,
        baseRadius: Math.min(width, height) * 0.42,
        radius: Math.min(width, height) * 0.42,
        color: colors[0],
        phase: 0,
        speed: 0.0012,
      },
      {
        x: width * 0.75,
        y: height * 0.4,
        vx: -0.35,
        vy: 0.25,
        baseRadius: Math.min(width, height) * 0.48,
        radius: Math.min(width, height) * 0.48,
        color: colors[1],
        phase: Math.PI * 0.5,
        speed: 0.0009,
      },
      {
        x: width * 0.5,
        y: height * 0.75,
        vx: 0.25,
        vy: -0.4,
        baseRadius: Math.min(width, height) * 0.45,
        radius: Math.min(width, height) * 0.45,
        color: colors[2],
        phase: Math.PI,
        speed: 0.0015,
      },
      {
        x: width * 0.85,
        y: height * 0.8,
        vx: -0.2,
        vy: -0.25,
        baseRadius: Math.min(width, height) * 0.38,
        radius: Math.min(width, height) * 0.38,
        color: colors[3],
        phase: Math.PI * 1.5,
        speed: 0.0011,
      },
      {
        x: width * 0.15,
        y: height * 0.85,
        vx: 0.3,
        vy: -0.2,
        baseRadius: Math.min(width, height) * 0.35,
        radius: Math.min(width, height) * 0.35,
        color: colors[4],
        phase: Math.PI * 0.25,
        speed: 0.0018,
      },
    ];

    // Constellation / energy particles
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 1.8 + 0.6,
      alpha: Math.random() * 0.6 + 0.2,
    }));

    let time = 0;

    const render = () => {
      time += 0.01;

      // Smooth mouse interpolation (spring-physics damping)
      const dx = mouse.targetX - mouse.x;
      const dy = mouse.targetY - mouse.y;
      mouse.x += dx * 0.06;
      mouse.y += dy * 0.06;
      mouse.speed = Math.sqrt(dx * dx + dy * dy);

      // Deep space background fill
      ctx.fillStyle = '#05070c';
      ctx.fillRect(0, 0, width, height);

      // Draw each fluid radial gradient orb with smooth organic oscillation
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      orbs.forEach((orb, i) => {
        orb.phase += orb.speed;
        const wave = Math.sin(orb.phase + time) * 45;
        const radiusOsc = orb.baseRadius + Math.cos(time * 0.8 + i) * 30;

        // Mouse magnetic attraction / repulsion
        const distToMouse = Math.hypot(orb.x - mouse.x, orb.y - mouse.y);
        if (distToMouse < 450) {
          const force = (450 - distToMouse) / 450;
          orb.x += (mouse.x - orb.x) * force * 0.015;
          orb.y += (mouse.y - orb.y) * force * 0.015;
        }

        orb.x += orb.vx + Math.sin(time + i) * 0.3;
        orb.y += orb.vy + Math.cos(time + i) * 0.3;

        // Bounce within bounds
        if (orb.x < -100) orb.x = width + 100;
        if (orb.x > width + 100) orb.x = -100;
        if (orb.y < -100) orb.y = height + 100;
        if (orb.y > height + 100) orb.y = -100;

        const radial = ctx.createRadialGradient(
          orb.x,
          orb.y + wave,
          0,
          orb.x,
          orb.y + wave,
          radiusOsc
        );
        radial.addColorStop(0, orb.color);
        radial.addColorStop(0.5, orb.color.replace(/[\d\.]+\)$/, '0.08)'));
        radial.addColorStop(1, 'rgba(5, 7, 12, 0)');

        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y + wave, radiusOsc, 0, Math.PI * 2);
        ctx.fill();
      });

      // Mouse energetic focal aura
      const mouseGlow = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        180
      );
      mouseGlow.addColorStop(0, 'rgba(56, 189, 248, 0.16)');
      mouseGlow.addColorStop(0.5, 'rgba(168, 85, 247, 0.08)');
      mouseGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = mouseGlow;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 180, 0, Math.PI * 2);
      ctx.fill();

      // Delicate stellar particles
      ctx.globalCompositeOperation = 'lighter';
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Proximity line links
        const dMouse = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        let alpha = p.alpha;
        if (dMouse < 140) {
          alpha = Math.min(1, alpha + 0.4);
        }

        ctx.fillStyle = `rgba(224, 242, 254, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [interactive]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Noise texture overlay for analog depth */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Subtle edge vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,7,12,0.6)_100%)]" />
    </div>
  );
};
