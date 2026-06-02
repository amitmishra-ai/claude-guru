import type { Session } from "./types";

// ─── Number Formatting ──────────────────────────────────────────────────────

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function minutes(h: number, m = 0) {
  return h * 60 + m;
}

export function fmtTime(mins: number) {
  if (mins == null || isNaN(mins)) return "--:--";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

/** Apply timezone offset to minutes-from-midnight value */
export function applyTzOffset(mins: number, offsetMinutes: number) {
  if (!offsetMinutes) return mins;
  let adjusted = mins + offsetMinutes;
  if (adjusted < 0) adjusted += 24 * 60;
  if (adjusted >= 24 * 60) adjusted -= 24 * 60;
  return adjusted;
}

export function fmtTime12(mins: number) {
  if (mins == null || isNaN(mins)) return "--:-- --";
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${pad2(m)} ${ampm}`;
}

export function hhmmFromMinutes(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

export function parseHHMM(hhmm: string) {
  const [h, m] = hhmm.split(":").map((x) => Number(x));
  return minutes(h || 0, m || 0);
}

// ─── Date Helpers ───────────────────────────────────────────────────────────

export function toYmd(d: Date) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}

export function addDays(d: Date, n: number) {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt;
}

export function addMonths(d: Date, n: number) {
  const dt = new Date(d);
  dt.setDate(1);
  dt.setMonth(dt.getMonth() + n);
  return dt;
}

export function startOfMonth(d: Date) {
  const dt = new Date(d);
  dt.setDate(1);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

export function startOfWeekMonday(d: Date) {
  const dt = new Date(d);
  const day = dt.getDay(); // 0 Sun..6 Sat
  const diff = (day === 0 ? -6 : 1) - day;
  dt.setDate(dt.getDate() + diff);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

// ─── Timezone Helpers ───────────────────────────────────────────────────────

export function formatGMTOffset(offsetMinutes: number) {
  const sign = offsetMinutes <= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `GMT${sign}${h}${m ? ":" + pad2(m) : ""}`;
}

export function formatGMTOffsetFromMinutesAhead(minutesAhead: number) {
  const sign = minutesAhead >= 0 ? "+" : "-";
  const abs = Math.abs(minutesAhead);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `GMT${sign}${h}${m ? ":" + pad2(m) : ""}`;
}

export function getTimeZoneOffsetMinutes(timeZone: string, date = new Date()) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = dtf.formatToParts(date);
  const m = new Map(parts.map((p) => [p.type, p.value]));
  const y = Number(m.get("year"));
  const mo = Number(m.get("month"));
  const d = Number(m.get("day"));
  const h = Number(m.get("hour"));
  const mi = Number(m.get("minute"));
  const s = Number(m.get("second"));

  const asUTC = Date.UTC(y, mo - 1, d, h, mi, s);
  const utcMs = date.getTime();
  return Math.round((asUTC - utcMs) / 60000);
}

// ─── Timezone → Locale ──────────────────────────────────────────────────────

const TZ_LOCALE: Record<string, string> = {
  "Asia/Kolkata": "en-IN", "Asia/Calcutta": "en-IN", "Asia/Mumbai": "en-IN",
  "Asia/Chennai": "en-IN", "Asia/Delhi": "en-IN",
  "America/New_York": "en-US", "America/Chicago": "en-US",
  "America/Denver": "en-US", "America/Los_Angeles": "en-US",
  "America/Phoenix": "en-US", "America/Anchorage": "en-US",
  "Pacific/Honolulu": "en-US",
  "Europe/London": "en-GB", "Europe/Dublin": "en-GB",
  "Europe/Berlin": "de-DE", "Europe/Paris": "fr-FR",
  "Europe/Madrid": "es-ES", "Europe/Rome": "it-IT",
  "Europe/Amsterdam": "nl-NL", "Europe/Zurich": "de-CH",
  "Australia/Sydney": "en-AU", "Australia/Melbourne": "en-AU",
  "Australia/Perth": "en-AU", "Australia/Brisbane": "en-AU",
  "Asia/Singapore": "en-SG", "Asia/Hong_Kong": "en-HK",
  "Asia/Tokyo": "ja-JP", "Asia/Seoul": "ko-KR",
  "Asia/Shanghai": "zh-CN", "Asia/Dubai": "en-AE",
  "Asia/Riyadh": "ar-SA",
  "America/Toronto": "en-CA", "America/Vancouver": "en-CA",
  "America/Sao_Paulo": "pt-BR", "America/Mexico_City": "es-MX",
  "Africa/Johannesburg": "en-ZA", "Africa/Lagos": "en-NG",
  "Pacific/Auckland": "en-NZ",
};

export function getLocaleFromTimezone(tz: string): string {
  return TZ_LOCALE[tz] ?? "en-US";
}

// ─── Display Formatters ─────────────────────────────────────────────────────

export function fmtDateNice(ymd: string, locale?: string) {
  const d = new Date(`${ymd}T00:00:00`);
  const loc = locale ?? undefined;
  const dow = d.toLocaleDateString(loc, { weekday: "short" });
  const md = d.toLocaleDateString(loc, { month: "short", day: "2-digit" });
  return `${dow}, ${md}`;
}

export function monthLabel(d: Date, locale?: string) {
  return d.toLocaleDateString(locale ?? undefined, { month: "long", year: "numeric" });
}

export function weekLabel(d: Date, locale?: string) {
  const loc = locale ?? undefined;
  const start = startOfWeekMonday(d);
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    const month = start.toLocaleDateString(loc, { month: "short" });
    return `${month} ${start.getDate()}–${end.getDate()}, ${end.getFullYear()}`;
  }
  const startPart = start.toLocaleDateString(loc, { month: "short", day: "numeric" });
  const endPart = end.toLocaleDateString(loc, { month: "short", day: "numeric", year: "numeric" });
  return `${startPart}–${endPart}`;
}

// ─── Utility Helpers ────────────────────────────────────────────────────────

export function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export function formatDayGroupShort(days: string[]) {
  const set = new Set(days);
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const isWeekdays = weekdays.every((d) => set.has(d)) && !set.has("Saturday") && !set.has("Sunday");
  if (isWeekdays) return "Weekdays";
  return days.map((d) => d.slice(0, 3)).join(", ");
}

export function clampNumber(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function sortByDateTime<T extends { dateYmd: string; start: number }>(items: T[]) {
  return [...items].sort((a, b) => {
    if (a.dateYmd !== b.dateYmd) return a.dateYmd.localeCompare(b.dateYmd);
    return a.start - b.start;
  });
}

export function dateTimeMs(dateYmd: string, startMinutes: number) {
  const base = new Date(`${dateYmd}T00:00:00`).getTime();
  return base + startMinutes * 60_000;
}

export function isSessionCompleted(s: Session, nowMs: number) {
  /* For date-range activities (Evaluation, Moderation, Residency) the
     session is "completed" only after the END date — keeping it in upcoming
     while its window is open. Single-day sessions fall back to start+end. */
  const endMs = s.endDateYmd
    ? dateTimeMs(s.endDateYmd, 24 * 60 - 1)
    : dateTimeMs(s.dateYmd, s.end);
  return endMs < nowMs;
}

/* Evaluation / Moderation activity whose due date passed before grading was
   finished. Completed-but-incomplete — pinned in the Overdue section. */
export function isOverdueActivity(s: Session): boolean {
  return (s.sessionType === "Evaluation" || s.sessionType === "Moderation") && !!s.overdue;
}

export function fmtDuration(startMins: number, endMins: number): string {
  const diff = endMins - startMins;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

export function fmtInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
