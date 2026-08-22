import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import confetti from "canvas-confetti";

import { ScratchCard } from "@/components/ScratchCard";
import { Countdown } from "@/components/Countdown";

import { useLanguage } from "@/lib/language";
import heroFrame from "@/assets/hero-frame.png";
import heroOvalMask from "@/assets/hero-oval-mask.png";
import cupidLogo from "@/assets/cupid-logo.png";
import linenTexture from "@/assets/linen-texture.jpg";

/** Static wedding details rendered after the reveal. */
const WEDDING = {
  names: "Clara & Hugo",
  location: "Villa Montalcino",
  calendarTitle: "Boda Clara & Hugo",
  calendarDescription: "La boda de Clara y Hugo",
  start: "20270615T160000Z",
  end: "20270615T230000Z",
  startIso: "2027-06-15T16:00:00Z",

};

const GOLD = ["#e8d9bb", "#dec8a0", "#f0e1c0", "#d6c39a"];
const CREAM = ["#fcf0d7", "#fff8e8", "#f5e6c2", "#ffffff"];

/** Champagne confetti burst played once the card is fully scratched. */
function celebrate() {
  const common = { spread: 360, shapes: ["circle" as const], origin: { y: 0.55 }, zIndex: 9999 };
  confetti({
    ...common,
    particleCount: 350,
    startVelocity: 22,
    scalar: 0.4,
    gravity: 0.5,
    drift: 0.3,
    ticks: 280,
    colors: GOLD,
  });
  confetti({
    ...common,
    particleCount: 200,
    startVelocity: 24,
    scalar: 0.35,
    gravity: 0.45,
    drift: -0.3,
    ticks: 320,
    colors: CREAM,
  });

  // Side cannons for ~2.2s
  const until = Date.now() + 2200;
  const frame = () => {
    const sides = [
      { angle: 60, x: 0 },
      { angle: 120, x: 1 },
    ];
    sides.forEach(({ angle, x }) => {
      confetti({
        particleCount: 8,
        angle,
        spread: 70,
        startVelocity: 30,
        scalar: 0.35,
        gravity: 0.55,
        ticks: 260,
        shapes: ["circle"],
        origin: { x, y: 0.65 },
        colors: GOLD,
        zIndex: 9999,
      });
      confetti({
        particleCount: 5,
        angle,
        spread: 80,
        startVelocity: 32,
        scalar: 0.3,
        gravity: 0.5,
        ticks: 300,
        shapes: ["circle"],
        origin: { x, y: 0.65 },
        colors: CREAM,
        zIndex: 9999,
      });
    });
    if (Date.now() < until) requestAnimationFrame(frame);
  };
  frame();
}

/**
 * The scratch-to-reveal scene: linen background, oval photo frame, tinted
 * vignette layers and the glitter scratch canvas on top.
 */
export function ScratchScene() {
  const { t } = useLanguage();
  const [scratchStarted, setScratchStarted] = useState(false);
  const startedRef = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [maskLoaded, setMaskLoaded] = useState(false);
  const ready = frameLoaded && maskLoaded;

  // Gate the scene on the frame + mask being decoded to avoid layout flashes.
  useEffect(() => {
    let cancelled = false;
    const preload = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
      });

    void preload(heroFrame).then(() => !cancelled && setFrameLoaded(true));
    void preload(heroOvalMask).then(() => !cancelled && setMaskLoaded(true));
    return () => {
      cancelled = true;
    };
  }, []);


  const maskLayer = {
    WebkitMaskImage: `url(${heroOvalMask})`,
    maskImage: `url(${heroOvalMask})`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  } as const;

  return (
    <section
      className="relative flex min-h-[100svh] items-start justify-center overflow-hidden pb-[max(env(safe-area-inset-bottom),5rem)] pt-[max(env(safe-area-inset-top),1rem)]"
      style={{
        backgroundImage: `url(${linenTexture})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {ready && (
        <div className="mx-auto w-full max-w-[540px] translate-y-[calc(4%_-_1cm)] px-2">
          <div className="relative flex aspect-[9/16] w-full items-center justify-center">
            {/* Lace photo frame */}
            <img
              src={heroFrame}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0 h-full w-full select-none object-contain"
            />

            {/* Warm tint inside the oval opening */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-[5] h-full w-full -translate-x-[0.5%] -translate-y-[7%]"
              style={{ backgroundColor: "rgba(40, 30, 20, 0.32)", ...maskLayer }}
            />

            {/* Vignette that blends the oval edge into the frame */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-[6] h-full w-full -translate-x-[0.5%] -translate-y-[7%]"
              style={{
                background:
                  "radial-gradient(circle at center, transparent 68%, rgba(225, 210, 182, 0.95) 92%)",
                ...maskLayer,
              }}
            />

            <ScratchCard
              maskSrc={heroOvalMask}
              glitter
              color="rgba(216, 201, 172, 0.68)"
              radius={18}
              revealThreshold={0.65}
              className="absolute inset-0 z-20 block h-full w-full -translate-x-[0.5%] -translate-y-[7%]"
              onScratchStart={() => {
                if (startedRef.current) return;
                startedRef.current = true;
                setScratchStarted(true);
              }}
              onRevealed={() => {
                setRevealed(true);
                celebrate();
              }}
            />

            {/* Pulsing "Scratch to reveal" hint */}
            <AnimatePresence>
              {!scratchStarted && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center"
                >
                  <motion.span
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    className="font-display max-w-[82%] -translate-y-[5%] whitespace-pre-line text-center text-[13.5px] font-semibold uppercase tracking-[0.25em] text-sepia md:text-[15.5px]"
                  >
                    {t("scratchToReveal")}
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Cupid mark flies in from the centre after the reveal */}
      <AnimatePresence>
        {revealed && (
          <motion.a
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            href="https://thedigitalyes.com"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute left-0 right-0 top-6 z-20 mx-auto w-fit"
          >
            <motion.span
              initial={{ x: "calc(50vw - 4.5rem)", y: -6 }}
              animate={{ x: 0 }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              className="block"
            >
              <motion.span
                animate={{ y: [0, -3, 0, 2, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 1.6 }}
                aria-label="The Digital Yes"
                className="block h-10 w-10 bg-ink opacity-90"
                style={{
                  WebkitMaskImage: `url(${cupidLogo})`,
                  maskImage: `url(${cupidLogo})`,
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                }}
              />
            </motion.span>
          </motion.a>
        )}
      </AnimatePresence>

      {/* Announcement + calendar actions */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute bottom-[calc(7rem+1vh-1cm)] left-0 right-0 z-20 mx-auto flex w-fit flex-col items-center"
          >
            <div className="mb-5 px-6 text-center">
              <p className="font-display mb-2 text-xs uppercase tracking-[0.35em] text-ink md:text-xs">
                {t("weGettingMarried")}
              </p>
              <h1 className="font-names mb-1 text-3xl italic text-ink md:text-4xl">
                {WEDDING.names}
              </h1>
              <p className="font-display mb-2 text-sm uppercase tracking-[0.25em] text-ink md:text-sm">
                {t("weddingDate")}
              </p>
              <p className="font-display mb-3 text-[10px] uppercase tracking-[0.25em] text-ink/75 md:text-xs">
                {WEDDING.location}
              </p>

              <div className="mx-auto mb-1 h-px w-16 bg-ink/20" />
              <Countdown target={WEDDING.startIso} className="mt-2" />
            </div>


          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
