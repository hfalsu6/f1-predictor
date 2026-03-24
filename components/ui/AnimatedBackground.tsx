"use client";

// Usage:
// import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
// <AnimatedBackground /> — place in root layout once, before {children}

import { useEffect, useRef } from "react";

interface Streak {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  width: number;
}

// Angle of streaks from horizontal (slight upward diagonal, F1 speed-line style)
const ANGLE = Math.PI / 9; // 20°
const COS   = Math.cos(ANGLE);
const SIN   = Math.sin(ANGLE);
const COUNT = 36;

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let W = 0, H = 0;

    function resize() {
      W = canvas!.width  = window.innerWidth;
      H = canvas!.height = window.innerHeight;
    }

    // Spawn a streak; init=true scatters them randomly at startup
    function makeStreak(init: boolean): Streak {
      return {
        x:       init ? Math.random() * (W + 400) - 100 : -80 - Math.random() * 300,
        y:       -30 + Math.random() * (H + 60),
        length:  55 + Math.random() * 170,
        speed:   0.18 + Math.random() * 0.65,
        opacity: 0.01 + Math.random() * 0.03,
        width:   0.3 + Math.random() * 1.1,
      };
    }

    resize();
    window.addEventListener("resize", resize);

    const streaks: Streak[] = Array.from({ length: COUNT }, () => makeStreak(true));

    function draw() {
      ctx!.clearRect(0, 0, W, H);

      for (const s of streaks) {
        s.x += s.speed;

        // Tail is at the back of the streak direction
        const tailX = s.x - s.length * COS;
        const tailY = s.y + s.length * SIN;

        // Wrap when the whole streak has left the right edge
        if (tailX > W + 20) {
          Object.assign(s, makeStreak(false));
          continue;
        }

        // Comet gradient: transparent → dim red-white core → transparent tip
        const grad = ctx!.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0,    `rgba(200, 0, 0, 0)`);
        grad.addColorStop(0.35, `rgba(220, 30, 10, ${s.opacity * 0.6})`);
        grad.addColorStop(0.75, `rgba(255, 160, 130, ${s.opacity})`);
        grad.addColorStop(1,    `rgba(255, 220, 210, 0)`);

        ctx!.beginPath();
        ctx!.moveTo(tailX, tailY);
        ctx!.lineTo(s.x, s.y);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth   = s.width;
        ctx!.lineCap     = "round";
        ctx!.stroke();
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:      "fixed",
        inset:         0,
        zIndex:        0,
        pointerEvents: "none",
      }}
    />
  );
}
