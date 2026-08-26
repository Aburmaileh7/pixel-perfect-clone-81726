import { AnimatePresence, motion } from "motion/react";
import confetti from "canvas-confetti";
import { Calendar, Clock, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Countdown } from "@/components/Countdown";
import { ScratchCard } from "@/components/ScratchCard";
import { useLanguage } from "@/lib/language";
import { WEDDING, buildCalendarUrl } from "@/lib/wedding";
import heroFrameAsset from "@/assets/hero-frame.webp.asset.json";
import heroOvalMaskAsset from "@/assets/hero-oval-mask.png.asset.json";
import linenTextureAsset from "@/assets/linen-texture.jpg.asset.json";
import venueAsset from "@/assets/al-yousefi-palace.png.asset.json";

const GOLD = ["#e8d9bb", "#dec8a0", "#f0e1c0", "#d6c39a"];
const CREAM = ["#fcf0d7", "#fff8e8", "#f5e6c2", "#ffffff"];

function fireConfetti() {
  const base = {
    spread: 360,
    shapes: ["circle" as const],
    origin: { y: 0.55 },
    zIndex: 9999,
  };
  confetti({ ...base, particleCount: 350, startVelocity: 22, scalar: 0.4, gravity: 0.5, drift: 0.3, ticks: 280, colors: GOLD });
  confetti({ ...base, particleCount: 200, startVelocity: 24, scalar: 0.35, gravity: 0.45, drift: -0.3, ticks: 320, colors: CREAM });

  const until = Date.now() + 2200;
  const burst = () => {
    [
      { angle: 60, x: 0 },
      { angle: 120, x: 1 },
    ].forEach(({ angle, x }) => {
      confetti({ particleCount: 8, angle, spread: 70, startVelocity: 30, scalar: 0.35, gravity: 0.55, ticks: 260, shapes: ["circle"], origin: { x, y: 0.65 }, colors: GOLD, zIndex: 9999 });
      confetti({ particleCount: 5, angle, spread: 80, startVelocity: 32, scalar: 0.3, gravity: 0.5, ticks: 300, shapes: ["circle"], origin: { x, y: 0.65 }, colors: CREAM, zIndex: 9999 });
    });
    if (Date.now() < until) requestAnimationFrame(burst);
  };
  burst();
}

export function HeroSection() {
  const { t, lang } = useLanguage();
  const [scratching, setScratching] = useState(false);
  const startedRef = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const [frameReady, setFrameReady] = useState(false);
  const [maskReady, setMaskReady] = useState(false);
  const ready = frameReady && maskReady;

  useEffect(() => {
    let cancelled = false;
    const preload = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
      });
    preload(heroFrameAsset.url).then(() => !cancelled && setFrameReady(true));
    preload(heroOvalMaskAsset.url).then(() => !cancelled && setMaskReady(true));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      className="relative flex min-h-[100svh] flex-col items-center overflow-y-auto pb-[max(env(safe-area-inset-bottom),5rem)] pt-[max(env(safe-area-inset-top),1rem)]"
      style={{
        backgroundImage: `url(${linenTextureAsset.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {ready && (
        <div className="mx-auto w-full max-w-[540px] translate-y-[calc(4%_-_1cm)] px-2">
          <div className="relative flex aspect-[9/16] w-full items-center justify-center">
            <img
              src={heroFrameAsset.url}
              alt={t("coupleNames")}
              className="pointer-events-none absolute inset-0 z-0 h-full w-full select-none object-contain"
            />
            <ScratchCard
              maskSrc={heroOvalMaskAsset.url}
              glitter
              color="rgba(216, 201, 172, 0.68)"
              radius={38}
              revealThreshold={0.5}
              className="absolute inset-0 z-20 block h-full w-full origin-center translate-x-[0.5%] translate-y-[4.2%] scale-x-[1.30] scale-y-[1.26]"
              onScratchStart={() => {
                if (startedRef.current) return;
                startedRef.current = true;
                setScratching(true);
              }}
              onRevealed={() => {
                setRevealed(true);
                fireConfetti();
              }}
            />
            <AnimatePresence>
              {!scratching && (
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

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative z-20 mx-auto w-full max-w-[540px] px-4 pb-12"
          >
            <div className="mb-6 px-6 text-center">
              <p
                dir="rtl"
                className="font-arabic mb-4 text-xl font-bold leading-relaxed text-ink md:text-2xl"
              >
                بسم الله الرحمن الرحيم
              </p>
              <p
                dir="rtl"
                className="font-arabic mb-3 text-base leading-relaxed text-ink/80 md:text-lg"
              >
                ومن آياته أن خلق لكم من أنفسكم أزواجا لتسكنوا إليها
              </p>
              <p
                dir="rtl"
                className="font-arabic mb-2 text-lg font-semibold leading-relaxed text-ink md:text-xl"
              >
                تتشرف عائلة المرحوم وليد عيسى بطاح وعائلة السيد عبدالله محمد أبو أرميلة
              </p>
              <p
                dir="rtl"
                className="font-arabic mb-4 text-lg font-semibold leading-relaxed text-ink md:text-xl"
              >
                بدعوتكم لحضور حفل زفاف نجليهما
              </p>
              <h1
                className={`mb-2 text-5xl font-bold text-ink md:text-6xl ${lang === "ar" ? "font-arabic" : "font-names italic"}`}
              >
                {t("coupleNames")}
              </h1>
              <p className="font-display mb-3 text-lg font-bold uppercase tracking-[0.25em] text-ink md:text-xl">
                {WEDDING.dateLabel}
              </p>
              <p
                className={`mb-3 text-base font-semibold tracking-[0.2em] text-ink/80 md:text-lg ${lang === "ar" ? "font-arabic" : "font-display uppercase"}`}
              >
                {t("venueName")}
              </p>

              <div className="mx-auto mb-1 h-px w-16 bg-ink/20" />
              <Countdown target={WEDDING.startIso} className="mt-2" />
              <p
                dir="rtl"
                className="font-arabic mt-4 text-lg font-semibold leading-relaxed text-ink md:text-xl"
              >
                للعُمر الذي لا يُعدّ
              </p>
            </div>

            <div className="rounded-lg border border-sage/30 bg-white/80 p-8 text-center shadow-sm backdrop-blur-sm md:p-12">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sage/30">
                <MapPin className="h-7 w-7 text-sage-dark" />
              </div>
              <h2 className="font-display mb-4 text-2xl text-sage-dark">{t("location")}</h2>
              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-display text-xl text-sage-dark">{t("venueName")}</span>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 text-sage-dark/70">
                  <Clock className="h-4 w-4" />
                  <span className="font-body">{t("venueHours")}</span>
                </div>
              </div>

              <div className="group relative mb-6 overflow-hidden rounded-lg border border-sage/30">
                <img
                  src={venueAsset.url}
                  alt={t("venueImageAlt")}
                  width={650}
                  height={487}
                  loading="lazy"
                  className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-105 md:h-80"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-sage-dark/40 via-transparent to-transparent" />
              </div>

              <div className="mb-6 overflow-hidden rounded-lg border border-sage/30">
                <iframe
                  src="https://www.google.com/maps?q=Al%20Yousefi%20Palace%20Yajouz%20Street%20Amman&output=embed"
                  width="100%"
                  height={200}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={t("mapTitle")}
                  className="sepia-[0.15] transition-all duration-500 hover:sepia-0"
                  style={{ border: 0 }}
                />
              </div>

              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                
                  href={WEDDING.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-sage-dark/40 bg-background px-3 text-sm font-medium text-sage-dark transition-colors hover:bg-sage-dark hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <MapPin className="h-4 w-4" />
                  {t("openInMaps")}
                </a>
                
                  href={buildCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-sage-dark/40 bg-background px-3 text-sm font-medium text-sage-dark transition-colors hover:bg-sage-dark hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Calendar className="h-4 w-4" />
                  {t("addToCalendar")}
                </a>
              </div>
            </div>

            <p
              dir="rtl"
              className="font-arabic mt-8 px-6 text-center text-base font-semibold leading-relaxed text-ink md:text-lg"
            >
              جعلهُ الله زواجاً مباركاً لا يخيب، وعُمراً رغيداً تمتدّ فيه المسرّات على مرّ السنين.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
