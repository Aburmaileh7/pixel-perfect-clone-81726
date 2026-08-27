/**
 * Static wedding details shared across the invitation.
 * Language-dependent copy lives in src/lib/language.tsx.
 */
export const WEDDING = {
  names: "Omar & Rahaf",
  dateLabel: "10.09.2026",
  location: "Al Yousefi Palace, Yajouz Street, Al-Jubeiha, Amman",
  startIso: "2026-09-10T21:00:00+03:00",
  endIso: "2026-09-11T00:00:00+03:00",
  mapsUrl: "https://maps.app.goo.gl/Lq6ZTM6EfJf94ei47",
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
