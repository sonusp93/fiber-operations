import React, { useEffect, useRef } from 'react';

interface LiveVideoWallpaperProps {
  wallpaper: string;
  isLightMode?: boolean;
}

export const LiveVideoWallpaper: React.FC<LiveVideoWallpaperProps> = ({
  wallpaper,
  isLightMode = false
}) => {
  // If light mode is active or wallpaper is standard static, do not render video wallpaper
  if (isLightMode) return null;

  const isCustomVideo = wallpaper.startsWith('data:video/') || 
    wallpaper.startsWith('blob:') || 
    wallpaper.endsWith('.mp4') || 
    wallpaper.endsWith('.webm');

  const isPresetVideo = wallpaper.startsWith('video:');

  if (!isCustomVideo && !isPresetVideo) return null;

  // Custom uploaded MP4/WebM video renderer
  if (isCustomVideo) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          src={wallpaper.replace('video:', '')}
          className="w-full h-full object-cover opacity-65"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70 backdrop-blur-[0.5px]" />
      </div>
    );
  }

  // Built-in Lightweight 60-120FPS Live Animated Canvas Video Wallpapers
  return <CanvasVideoPreset mode={wallpaper} />;
};

interface CanvasVideoPresetProps {
  mode: string;
}

const CanvasVideoPreset: React.FC<CanvasVideoPresetProps> = ({ mode }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const presetType = mode.replace('video:', '');

    let time = 0;

    // Presets resources
    const fiberRays = Array.from({ length: 22 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 0.6 + Math.random() * 1.6,
      len: 80 + Math.random() * 180,
      width: 1 + Math.random() * 2.5,
      hue: Math.random() > 0.4 ? 188 : 150
    }));

    const particles = Array.from({ length: 42 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 1.2 + Math.random() * 2.8,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      alpha: 0.2 + Math.random() * 0.6,
      hue: Math.random() > 0.5 ? 190 : 270
    }));

    const synthStreams = Array.from({ length: 26 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 1.2 + Math.random() * 2.2,
      len: 60 + Math.random() * 140,
      hue: Math.random() > 0.5 ? 320 : 270 // Neon pink or purple
    }));

    const auroraWaves = Array.from({ length: 4 }, (_, i) => ({
      baseY: height * (0.35 + i * 0.15),
      speed: 0.008 + i * 0.004,
      hue: 155 + i * 25 // Emerald to cyan
    }));

    const render = () => {
      time += 0.016;

      if (presetType === 'cyber_fiber') {
        ctx.fillStyle = 'rgba(3, 6, 12, 0.22)';
        ctx.fillRect(0, 0, width, height);

        fiberRays.forEach((ray) => {
          ray.y -= ray.speed * 2.2;
          ray.x += Math.sin(time + ray.y * 0.01) * 0.5;

          if (ray.y < -ray.len) {
            ray.y = height + ray.len;
            ray.x = Math.random() * width;
          }

          const grad = ctx.createLinearGradient(ray.x, ray.y, ray.x, ray.y + ray.len);
          grad.addColorStop(0, `hsla(${ray.hue}, 95%, 65%, 0.9)`);
          grad.addColorStop(1, `hsla(${ray.hue}, 95%, 45%, 0)`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = ray.width;
          ctx.beginPath();
          ctx.moveTo(ray.x, ray.y);
          ctx.lineTo(ray.x, ray.y + ray.len);
          ctx.stroke();
        });
      } else if (presetType === 'matrix_grid') {
        ctx.fillStyle = '#020408';
        ctx.fillRect(0, 0, width, height);

        const horizon = height * 0.45;
        const gridOffset = (time * 60) % 40;

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.lineWidth = 1;

        for (let y = horizon; y < height; y += (y - horizon) * 0.18 + 4) {
          const drawY = y + gridOffset * ((y - horizon) / height);
          if (drawY > horizon && drawY < height) {
            ctx.beginPath();
            ctx.moveTo(0, drawY);
            ctx.lineTo(width, drawY);
            ctx.stroke();
          }
        }

        const vanishingX = width * 0.5;
        for (let x = -width * 0.5; x <= width * 1.5; x += 60) {
          ctx.beginPath();
          ctx.moveTo(vanishingX, horizon);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        const glow = ctx.createRadialGradient(vanishingX, horizon, 10, vanishingX, horizon, width * 0.6);
        glow.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
        glow.addColorStop(0.5, 'rgba(147, 51, 234, 0.15)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, horizon - 80, width, 160);
      } else if (presetType === 'synthwave_neon') {
        // Neon Synthwave Magenta & Violet flow
        ctx.fillStyle = 'rgba(6, 3, 14, 0.25)';
        ctx.fillRect(0, 0, width, height);

        synthStreams.forEach((s) => {
          s.y += s.speed * 2.5;
          s.x += Math.sin(time * 2 + s.y * 0.008) * 0.8;

          if (s.y > height + s.len) {
            s.y = -s.len;
            s.x = Math.random() * width;
          }

          const grad = ctx.createLinearGradient(s.x, s.y, s.x, s.y + s.len);
          grad.addColorStop(0, `hsla(${s.hue}, 100%, 70%, 0.85)`);
          grad.addColorStop(1, `hsla(${s.hue}, 100%, 40%, 0)`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x, s.y + s.len);
          ctx.stroke();
        });
      } else if (presetType === 'aurora_borealis') {
        // Emerald & Cyan Aurora Borealis ripples
        ctx.fillStyle = 'rgba(2, 6, 12, 0.28)';
        ctx.fillRect(0, 0, width, height);

        auroraWaves.forEach((w, i) => {
          ctx.beginPath();
          ctx.moveTo(0, height);
          for (let x = 0; x <= width; x += 30) {
            const y = w.baseY + Math.sin(x * 0.006 + time + i) * 60 + Math.cos(x * 0.003 - time) * 35;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, height);
          ctx.closePath();

          const grad = ctx.createLinearGradient(0, w.baseY - 80, 0, height);
          grad.addColorStop(0, `hsla(${w.hue}, 85%, 55%, 0.22)`);
          grad.addColorStop(0.6, `hsla(${w.hue}, 85%, 45%, 0.08)`);
          grad.addColorStop(1, 'transparent');

          ctx.fillStyle = grad;
          ctx.fill();
        });
      } else if (presetType === 'quantum_particles') {
        ctx.fillStyle = 'rgba(4, 5, 10, 0.25)';
        ctx.fillRect(0, 0, width, height);

        particles.forEach((p, idx) => {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${p.alpha})`;
          ctx.shadowColor = `hsla(${p.hue}, 90%, 60%, 0.8)`;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          for (let j = idx + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (dist < 110) {
              ctx.strokeStyle = `hsla(${p.hue}, 80%, 60%, ${(1 - dist / 110) * 0.22})`;
              ctx.lineWidth = 0.8;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        });
        ctx.shadowBlur = 0;
      } else {
        // Deep Space Cosmic Nebula
        ctx.fillStyle = '#03050c';
        ctx.fillRect(0, 0, width, height);

        const cx1 = width * 0.3 + Math.sin(time * 0.5) * 80;
        const cy1 = height * 0.3 + Math.cos(time * 0.4) * 80;
        const g1 = ctx.createRadialGradient(cx1, cy1, 20, cx1, cy1, width * 0.6);
        g1.addColorStop(0, 'rgba(126, 34, 206, 0.28)');
        g1.addColorStop(0.5, 'rgba(6, 182, 212, 0.12)');
        g1.addColorStop(1, 'transparent');
        ctx.fillStyle = g1;
        ctx.fillRect(0, 0, width, height);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [mode]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
      <canvas ref={canvasRef} className="w-full h-full block opacity-75" />
    </div>
  );
};
