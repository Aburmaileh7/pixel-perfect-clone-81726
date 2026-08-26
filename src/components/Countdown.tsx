import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { useLanguage } from "@/lib/language";

interface CountdownProps {
  /** Event start, ISO string or Date. */
  target: string | Date;
  className?: string;
}

interface Parts {
  days: number;
  hours: number;
  mins: number;
  secs: number;
  done: boolean;
}

const compute = (target: number): Parts => {
  const diff = Math.max(0, target - Date.now());
  const total = Math.floor(diff / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    mins: Math.floor((total % 3600) / 60),
    secs: total % 60,
    done: diff === 0,
  };
};

const pad = (value: number) => value.toString().padStart(2, "0");

/** A single flip-in unit (value + label). */
function Unit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-[3.1rem] flex-col items-center md:min-w-[3.6rem]">
      <div className="relative h-[1.6em] overflow-hidden text-[26px] leading-[1.6em] tabular-nums text-ink md:text-[30px]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: "60%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-60%", opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="font-names block italic"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="font-display mt-1 text-[8.5px] uppercase tracking-[0.3em] text-ink/70 md:text-[9.5px]">
        {label}
      </span>
    </div>
  );
}

/**
 * Live countdown to the wedding. Ticks once per second (aligned to the wall
 * clock so it never drifts) and animates each changing digit group.
 */
export function Countdown({ target, className = "" }: CountdownProps) {
  const { t } = useLanguage();
  const targetMs = typeof target === "string" ? Date.parse(target) : target.getTime();
  const [parts, setParts] = useState<Parts>(() => compute(targetMs));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setParts(compute(targetMs));
      // Re-align to the next whole second to avoid cumulative drift.
      timer = setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    timer = setTimeout(tick, 1000 - (Date.now() % 1000));
    return () => clearTimeout(timer);
  }, [targetMs]);

  if (parts.done) {
    return (
      <p
        dir="ltr"
        className={`font-display text-[10px] uppercase tracking-[0.3em] text-ink md:text-xs ${className}`}
      >
        {t("today")}
      </p>
    );
  }

  return (
    <div
      dir="ltr"
      className={`flex items-start justify-center gap-1 ${className}`}
      role="timer"
      aria-live="off"
      aria-label={`${parts.days} ${t("days")}, ${parts.hours} ${t("hours")}, ${parts.mins} ${t("mins")}, ${parts.secs} ${t("secs")}`}
    >
      <Unit value={String(parts.days)} label={t("days")} />
      <span className="font-names pt-[0.15em] text-[24px] italic leading-[1.6em] text-ink/35 md:text-[28px]">
        :
      </span>
      <Unit value={pad(parts.hours)} label={t("hours")} />
      <span className="font-names pt-[0.15em] text-[24px] italic leading-[1.6em] text-ink/35 md:text-[28px]">
        :
      </span>
      <Unit value={pad(parts.mins)} label={t("mins")} />
      <span className="font-names pt-[0.15em] text-[24px] italic leading-[1.6em] text-ink/35 md:text-[28px]">
        :
      </span>
      <Unit value={pad(parts.secs)} label={t("secs")} />
    </div>
  );
}
