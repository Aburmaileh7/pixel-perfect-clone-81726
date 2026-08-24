/**
 * Static wedding details shared across the invitation.
 * Language-dependent copy lives in src/lib/language.tsx.
 */
export const WEDDING = {
  names: "Clara & Hugo",
  dateLabel: "10.09.26",
  location: "Finca Biniagual, Mallorca",
  startIso: "2026-09-10T21:00:00Z",
  endIso: "2026-09-10T23:59:00Z",
  mapsUrl: "https://maps.app.goo.gl/KHMzUJcEUWvGT4hW7",
} as const;

/** Google Calendar "add event" link for the wedding. */
export function buildCalendarUrl() {
  const fmt = (iso: string) => new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Wedding — ${WEDDING.names}`,
    dates: `${fmt(WEDDING.startIso)}/${fmt(WEDDING.endIso)}`,
    location: WEDDING.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
