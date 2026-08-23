import { createContext, useContext, useState, type Context, type ReactNode } from "react";

/**
 * Bilingual copy dictionary (EN / ES), mirroring the original page.
 */
export const translations = {
  weGettingMarried: { en: "WE ARE GETTING MARRIED", es: "NOS CASAMOS" },
  weddingDate: { en: "15.06.27", es: "15.06.27" },
  openEnvelope: { en: "OPEN ENVELOPE", es: "ABRIR SOBRE" },
  envelopeAlt: { en: "Envelope with seal", es: "Sobre con sello" },
  tapToOpen: { en: "Tap to open", es: "Toca para abrir" },
  scratchToReveal: { en: "Scratch to\nreveal", es: "Rasca para\ndescubrir" },
  days: { en: "Days", es: "Días" },
  hours: { en: "Hours", es: "Horas" },
  mins: { en: "Mins", es: "Min" },
  secs: { en: "Secs", es: "Seg" },
  today: { en: "Today is the day", es: "¡Hoy es el día!" },
  countdownTitle: { en: "Counting down", es: "Cuenta atrás" },
  location: { en: "Location", es: "Localización" },
  venueName: { en: "Finca Biniagual", es: "Finca Biniagual" },
  venueHours: { en: "From 5:00 PM to 1:00 AM", es: "De 17:00h a 01:00h" },
  openInMaps: { en: "Open in Maps", es: "Abrir en Maps" },
  addToCalendar: { en: "Add to calendar", es: "Añadir al calendario" },
  venueImageAlt: { en: "Finca Biniagual - Aerial view", es: "Finca Biniagual - Vista aérea" },
  mapTitle: { en: "Map of Finca Biniagual", es: "Mapa de Finca Biniagual" },
} as const;

type Key = keyof typeof translations;
type Lang = "en" | "es";

interface LanguageContextValue {
  lang: Lang;
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
  const t = (key: Key) => translations[key][lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
  );
}

const fallback: LanguageContextValue = {
  lang: "en",
  setLang: () => {},
  t: (key: Key) => translations[key].en,
};

export function useLanguage() {
  // Fall back to English instead of throwing so a missing provider can never
  // blank the whole page.
  return useContext(LanguageContext) ?? fallback;
}

