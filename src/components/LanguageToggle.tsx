import { useLanguage } from "@/lib/language";

/** EN / ES language switch pinned to the top-right corner. */
export function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const base = "font-display tracking-[0.2em] uppercase text-xs transition-colors";

  return (
    <div className="fixed right-6 top-6 z-30 flex items-center gap-2 text-ink/80">
      <button
        onClick={() => setLang("en")}
        className={`${base} ${lang === "en" ? "font-semibold text-ink" : "hover:text-ink"}`}
        aria-label="English"
      >
        EN
      </button>
      <span className="text-ink/40">/</span>
      <button
        onClick={() => setLang("ar")}
        className={`${base} ${lang === "ar" ? "font-semibold text-ink" : "hover:text-ink"}`}
        aria-label="العربية"
      >
        AR
      </button>
    </div>
  );
}
