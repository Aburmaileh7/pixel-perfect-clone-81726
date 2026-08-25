import { createContext, useContext, useEffect, useState, type Context, type ReactNode } from "react";

/**
 * Bilingual copy dictionary (EN / AR), mirroring the original page.
 */
export const translations = {
  weGettingMarried: { en: "WE ARE GETTING MARRIED", ar: "حفل زفافنا" },
  weddingDate: { en: "10.09.26", ar: "10.09.26" },
  openEnvelope: { en: "OPEN ENVELOPE", ar: "افتح الظرف" },
  envelopeAlt: { en: "Envelope with seal", ar: "ظرف مختوم" },
  tapToOpen: { en: "Tap to open", ar: "اضغط للفتح" },
  scratchToReveal: { en: "Scratch to\nreveal", ar: "اِحكّ\nللكشف" },
  days: { en: "Days", ar: "أيام" },
  hours: { en: "Hours", ar: "ساعات" },
  mins: { en: "Mins", ar: "دقائق" },
  secs: { en: "Secs", ar: "ثواني" },
  today: { en: "Today is the day", ar: "اليوم هو اليوم!" },
  countdownTitle: { en: "Counting down", ar: "العد التنازلي" },

  // Couple + venue details (translated, replacing the old hardcoded strings)
  coupleNames: { en: "Omar & His Bride", ar: "عمر و كريمته" },
  location: { en: "Location", ar: "المكان" },
  venueLabel: { en: "Location", ar: "المكان" },
  venueName: { en: "Al Yousefi Palace", ar: "قصر اليوسفي" },
  venueAddress: { en: "Al-Jubeiha, Yajouz Street, Amman", ar: "الجبيهة، شارع ياجوز، عمّان" },
  venueHours: { en: "From 9:00 PM to Midnight", ar: "من الساعة 9:00 مساءً حتى منتصف الليل" },
  openInMaps: { en: "Open in Maps", ar: "افتح في الخرائط" },
  addToCalendar: { en: "Add to calendar", ar: "أضف إلى التقويم" },
  venueImageAlt: { en: "Al Yousefi Palace - view", ar: "قصر اليوسفي - صورة" },
  mapTitle: { en: "Map of Al Yousefi Palace", ar: "خريطة قصر اليوسفي" },

  // RSVP form
  rsvpTitle: { en: "RSVP", ar: "تأكيد الحضور" },
  rsvpSubtitle: { en: "Kindly respond by 1st September 2026", ar: "نرجو التأكيد قبل 1 أيلول 2026" },
  rsvpName: { en: "Full Name", ar: "الاسم الكامل" },
  rsvpAttendance: { en: "Will you be attending?", ar: "هل ستحضر؟" },
  rsvpYes: { en: "Joyfully accepts", ar: "أقبل بكل سرور" },
  rsvpNo: { en: "Regretfully declines", ar: "أعتذر" },
  rsvpMaybe: { en: "Maybe", ar: "ربما" },
  rsvpGuests: { en: "Number of Guests", ar: "عدد الضيوف" },
  rsvpDietary: { en: "Dietary Requirements", ar: "متطلبات غذائية" },
  rsvpMessage: { en: "Message for the Couple", ar: "رسالة للعروسين" },
  rsvpSubmit: { en: "Send RSVP", ar: "إرسال" },
  rsvpSuccess: { en: "Thank you! Your response has been received.", ar: "شكراً! تم استلام ردك." },
  rsvpError: { en: "Something went wrong. Please try again.", ar: "حدث خطأ. حاول مرة أخرى." },
} as const;

type Key = keyof typeof translations;
type Lang = "en" | "ar";
type Dir = "ltr" | "rtl";

const DIR_BY_LANG: Record<Lang, Dir> = { en: "ltr", ar: "rtl" };

interface LanguageContextValue {
  lang: Lang;
  dir: Dir;
  setLang: (lang: Lang) => void;
  t: (key: Key) => string;
}

// Cache the context on globalThis so hot-reloads (or a duplicated module
// instance) never produce two distinct contexts, which would make consumers
// read `undefined` even though a provider is mounted above them.
const globalStore = globalThis as typeof globalThis & {
  __languageContext?: Context<LanguageContextValue | undefined>;
};

const LanguageContext =
  globalStore.__languageContext ??
  (globalStore.__languageContext = createContext<LanguageContextValue | undefined>(undefined));

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const dir = DIR_BY_LANG[lang];
  const t = (key: Key) => translations[key][lang];

  // Keep <html lang> / <html dir> in sync with the active language so RTL
  // layout, browser find-in-page and screen readers all behave correctly.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  return (
    <LanguageContext.Provider value={{ lang, dir, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

const fallback: LanguageContextValue = {
  lang: "en",
  dir: "ltr",
  setLang: () => {},
  t: (key: Key) => translations[key].en,
};

export function useLanguage() {
  // Fall back to English instead of throwing so a missing provider can never
  // blank the whole page.
  return useContext(LanguageContext) ?? fallback;
}
