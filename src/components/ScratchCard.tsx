import { useEffect, useRef } from "react";

interface ScratchCardProps {
  /** Solid fallback colour used when no image / glitter layer is supplied. */
  color?: string;
  /** Optional image painted as the scratch-off surface. */
  imageSrc?: string;
  /** Alpha mask (PNG) that clips the scratch surface to the oval frame opening. */
  maskSrc?: string;
  /** Paint a procedural "glitter foil" texture on top of the surface. */
  glitter?: boolean;
  /** Eraser radius in CSS pixels. */
  radius?: number;
  className?: string;
  onScratchStart?: () => void;
  onRevealed?: () => void;
  /** Fraction of the covered area that has to be removed before auto-reveal. */
  revealThreshold?: number;
}

/**
 * Canvas scratch-off surface.
 *
 * The cover art is drawn once (image and/or generated foil texture), clipped by
 * an alpha mask, then erased with `destination-out` strokes as the pointer
 * moves. Coverage is sampled on a coarse grid; once enough has been removed the
 * whole canvas fades out and stops capturing pointer events.
 */
export function ScratchCard({
  color = "#7f071b",
  imageSrc,
  maskSrc,
  glitter = false,
  radius = 38,
  className = "",
  onScratchStart,
  onRevealed,
  revealThreshold = 0.55,
}: ScratchCardProps) {
  const revealedRef = useRef(false);
  const initialOpaqueRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  /** Count opaque pixels on a subsampled grid (cheap coverage estimate). */
  const countOpaque = () => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    const { width, height } = canvas;
    const step = Math.max(8, Math.floor(Math.min(width, height) / 40));
    const data = ctx.getImageData(0, 0, width, height).data;
    let count = 0;
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const alphaIndex = (y * width + x) * 4 + 3;
        if (data[alphaIndex] >= 32) count++;
      }
    }
    return count;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /** Procedural champagne glitter foil. */
    const paintGlitter = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const area = w * h;

      ctx.fillStyle = "rgba(232, 221, 201, 0.78)";
      ctx.fillRect(0, 0, w, h);

      const sheen = ctx.createRadialGradient(
        w * 0.46,
        h * 0.34,
        0,
        w * 0.46,
        h * 0.34,
        Math.max(w, h) * 0.72,
      );
      sheen.addColorStop(0, "rgba(255, 251, 238, 0.42)");
      sheen.addColorStop(0.45, "rgba(238, 226, 205, 0.18)");
      sheen.addColorStop(1, "rgba(190, 169, 136, 0.16)");
      ctx.fillStyle = sheen;
      ctx.fillRect(0, 0, w, h);

      // Fine grain
      const grains = Math.floor(area / 2.1);
      for (let i = 0; i < grains; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const roll = Math.random();
        let fill: string;
        if (roll < 0.44) fill = `rgba(211,196,166,${(0.05 + Math.random() * 0.09).toFixed(2)})`;
        else if (roll < 0.78) fill = `rgba(241,232,214,${(0.06 + Math.random() * 0.12).toFixed(2)})`;
        else fill = `rgba(255,250,235,${(0.08 + Math.random() * 0.16).toFixed(2)})`;
        ctx.fillStyle = fill;
        ctx.fillRect(x, y, 1, 1);
      }

      // Bright flecks
      const brights = Math.floor(area / 95);
      for (let i = 0; i < brights; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = Math.random() * 0.75 + 0.2;
        ctx.fillStyle = `rgba(255,248,228,${(0.18 + Math.random() * 0.28).toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Darker flecks for depth
      const darks = Math.floor(area / 190);
      for (let i = 0; i < darks; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = Math.random() * 0.55 + 0.15;
        ctx.fillStyle = `rgba(176,154,118,${(0.08 + Math.random() * 0.12).toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sparkle crosses
      const sparkles = Math.floor(area / 1450);
      for (let i = 0; i < sparkles; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const len = Math.random() * 1.4 + 0.55;
        const alpha = 0.32 + Math.random() * 0.36;
        ctx.strokeStyle = `rgba(255,252,238,${alpha.toFixed(2)})`;
        ctx.lineWidth = 0.55;
        ctx.beginPath();
        ctx.moveTo(x - len, y);
        ctx.lineTo(x + len, y);
        ctx.moveTo(x, y - len);
        ctx.lineTo(x, y + len);
        ctx.stroke();
        ctx.fillStyle = `rgba(255,246,218,${Math.min(alpha + 0.16, 0.82).toFixed(2)})`;
        ctx.fillRect(x - 0.45, y - 0.45, 0.9, 0.9);
      }
    };

    /** Clip whatever has been painted to the alpha mask. */
    const applyMask = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      if (!maskSrc) {
        initialOpaqueRef.current = countOpaque();
        return;
      }
      const mask = new Image();
      mask.onload = () => {
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(mask, 0, 0, w, h);
        ctx.globalCompositeOperation = "source-over";
        initialOpaqueRef.current = countOpaque();
      };
      mask.src = maskSrc;
    };

    const paintCover = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);

      if (glitter && imageSrc) {
        const img = new Image();
        img.onload = () => {
          const c = canvas.getContext("2d");
          if (!c) return;
          c.globalCompositeOperation = "source-over";
          c.clearRect(0, 0, w, h);
          c.drawImage(img, 0, 0, w, h);
          c.globalCompositeOperation = "source-atop";
          paintGlitter(c, w, h);
          c.globalCompositeOperation = "source-over";
          applyMask(c, w, h);
        };
        img.src = imageSrc;
        return;
      }

      if (glitter) {
        paintGlitter(ctx, w, h);
        applyMask(ctx, w, h);
        return;
      }

      if (imageSrc) {
        const img = new Image();
        img.onload = () => {
          const c = canvas.getContext("2d");
          if (!c) return;
          c.globalCompositeOperation = "source-over";
          c.clearRect(0, 0, w, h);
          c.drawImage(img, 0, 0, w, h);
          applyMask(c, w, h);
        };
        img.src = imageSrc;
        return;
      }

      ctx.fillStyle = color;
      ctx.fillRect(0, 0, w, h);
      applyMask(ctx, w, h);
    };

    const resize = () => {
      // Never repaint once the user started scratching: a repaint would restore
      // the foil (duplicated cover) over already-cleared areas.
      if (drawingStartedRef.current || revealedRef.current) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      paintCover(ctx, rect.width, rect.height);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, imageSrc, maskSrc, glitter]);

  const pointerPos = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    onScratchStart?.();

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = radius * 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (lastPointRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    lastPointRef.current = { x, y };

    if (revealedRef.current || !initialOpaqueRef.current) return;

    const remaining = countOpaque();
    const cleared = (initialOpaqueRef.current - remaining) / initialOpaqueRef.current;
    if (cleared < revealThreshold) return;

    revealedRef.current = true;
    onRevealed?.();
    canvas.style.transition = "opacity 700ms ease-out";
    canvas.style.opacity = "0";
    setTimeout(() => {
      canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.pointerEvents = "none";
    }, 720);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    const { x, y } = pointerPos(event);
    lastPointRef.current = null;
    scratch(x, y);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const { x, y } = pointerPos(event);
    scratch(x, y);
  };

  const stop = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stop}
      onPointerLeave={stop}
      className={`touch-none cursor-pointer ${className}`}
    />
  );
}
