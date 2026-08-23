import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import envelopeStill from "@/assets/envelope.jpg";
import heroFrame from "@/assets/hero-frame.png";
import cupidLogo from "@/assets/cupid-logo.png";
import { useLanguage } from "@/lib/language";

interface EnvelopeIntroProps {
  /** Fired once the crossfade to the scratch scene has completed. */
  onEnter: () => void;
  /** Fired on the first user gesture (used to start audio playback). */
  onInteraction?: () => void;
}

/**
 * Full-screen intro overlay: a still of the sealed envelope that plays an
 * opening video on tap, then fades to the parchment background colour.
 */
export function EnvelopeIntro({ onEnter, onInteraction }: EnvelopeIntroProps) {
  const [started, setStarted] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
  const [finished, setFinished] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { t, lang } = useLanguage();

  // Warm the browser cache for the next scene while the user is still here.
  useEffect(() => {
    [heroFrame, cupidLogo].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const handleOpen = () => {
    if (started) return;
    onInteraction?.();
    setStarted(true);
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      void video.play().catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && !finished && video.duration && video.currentTime >= video.duration - 0.6) {
      setFinished(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 cursor-pointer overflow-hidden bg-parchment"
      onClick={handleOpen}
    >
      <div className="pointer-events-none absolute inset-0">
        {!videoVisible && (
          <img
            src={envelopeStill}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <video
          ref={videoRef}
          src="/video/envelope-open.mp4"
          muted
          playsInline
          preload="auto"
          onPlaying={() => setVideoVisible(true)}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setFinished(true)}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: videoVisible ? 1 : 0 }}
        />
      </div>

      <AnimatePresence>
        {!videoVisible && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute bottom-[max(env(safe-area-inset-bottom),2rem)] left-0 right-0 z-10 mx-auto w-fit text-[10px] tracking-[0.4em] text-granate ${lang === "ar" ? "font-arabic" : "font-display uppercase"}`}
          >
            {t("tapToOpen")}
          </motion.span>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {finished && (
          <motion.div
            className="absolute inset-0 z-10 bg-parchment"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            onAnimationComplete={onEnter}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
