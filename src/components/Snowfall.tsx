import { useEffect, useRef } from "react";

export function Snowfall() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationFrameId: number;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const numFlakes = 60;
    const flakes: Array<{
      x: number;
      y: number;
      r: number;
      d: number;
      wind: number;
      opacity: number;
    }> = [];

    for (let i = 0; i < numFlakes; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 3 + 1,
        d: Math.random() * numFlakes,
        wind: Math.random() * 0.8 - 0.4,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = (canvas.width = window.innerWidth);
      height = (canvas.height = window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < numFlakes; i++) {
        const f = flakes[i];
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
        ctx.fill();

        f.y += Math.cos(f.d) + 1 + f.r / 3;
        f.x += Math.sin(f.d) * 0.3 + f.wind;

        if (f.y > height) {
          flakes[i] = {
            x: Math.random() * width,
            y: -10,
            r: f.r,
            d: f.d,
            wind: f.wind,
            opacity: f.opacity,
          };
        }
        if (f.x > width + 5 || f.x < -5) {
          flakes[i].x = Math.random() * width;
        }
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[100]" />;
}
