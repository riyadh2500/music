import React, { useEffect, useRef } from "react";

// Full-page animated music background with canvas + CSS
const MusicBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Particles ──────────────────────────────────────────
    const NOTES = ["♪", "♫", "♩", "♬", "🎵"];
    const particles = Array.from({ length: 40 }, () => ({
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight,
      note:  NOTES[Math.floor(Math.random() * NOTES.length)],
      size:  10 + Math.random() * 18,
      speed: 0.3 + Math.random() * 0.7,
      drift: (Math.random() - 0.5) * 0.4,
      alpha: 0.04 + Math.random() * 0.08,
      spin:  (Math.random() - 0.5) * 0.02,
      angle: Math.random() * Math.PI * 2,
    }));

    // ── Waveform lines ──────────────────────────────────────
    const waves = Array.from({ length: 5 }, (_, i) => ({
      y:         0.2 + i * 0.18,
      amplitude: 15 + i * 8,
      frequency: 0.003 + i * 0.001,
      speed:     0.3 + i * 0.15,
      phase:     Math.random() * Math.PI * 2,
      alpha:     0.04 - i * 0.005,
      color:     i % 2 === 0 ? "16,185,129" : "5,150,105",
    }));

    let frame = 0;
    let animId;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ── Draw waves ────────────────────────────────────────
      waves.forEach((w) => {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${w.color},${w.alpha})`;
        ctx.lineWidth   = 1.5;
        for (let x = 0; x <= canvas.width; x += 4) {
          const y = canvas.height * w.y
            + Math.sin(x * w.frequency + frame * w.speed * 0.03 + w.phase) * w.amplitude
            + Math.sin(x * w.frequency * 1.7 + frame * 0.02) * (w.amplitude * 0.4);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // ── Draw floating notes ───────────────────────────────
      particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.font        = `${p.size}px serif`;
        ctx.fillStyle   = "rgba(16,185,129,1)";
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillText(p.note, 0, 0);
        ctx.restore();

        p.y     -= p.speed;
        p.x     += p.drift;
        p.angle += p.spin;

        if (p.y < -30) {
          p.y = canvas.height + 20;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -30 || p.x > canvas.width + 30) {
          p.x = Math.random() * canvas.width;
        }
      });

      frame++;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", top: 0, left: 0,
        width: "100vw", height: "100vh",
        pointerEvents: "none", zIndex: 0,
      }}
    />
  );
};

export default MusicBackground;
