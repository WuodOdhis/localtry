"use client";

import { useEffect, useRef } from "react";

interface ConfettiPiece {
  x: number; y: number; vx: number; vy: number; size: number; color: string; rotation: number; rotationSpeed: number; life: number; maxLife: number;
}

const COLORS = ["#F59E0B", "#D97706", "#B45309", "#FBBF24", "#FDE68A", "#FFFBEB"];

export default function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces: ConfettiPiece[] = Array.from({ length: 80 }, () => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 1) * 14 - 4,
      size: Math.random() * 6 + 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      life: 0,
      maxLife: Math.random() * 60 + 40,
    }));

    let anim: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of pieces) {
        if (p.life >= p.maxLife) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.rotation += p.rotationSpeed;
        p.life++;
        const alpha = 1 - p.life / p.maxLife;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      if (alive) anim = requestAnimationFrame(render);
    };
    render();

    return () => cancelAnimationFrame(anim);
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  );
}
