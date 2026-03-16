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

// ─── Display Formatters ─────────────────────────────────────────────────────

export function fmtDateNice(ymd: string) {
  const d = new Date(`${ymd}T00:00:00`);
  const dow = d.toLocaleDateString(undefined, { weekday: "short" });
  const md = d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
  return `${dow}, ${md}`;
}

export function monthLabel(d: Date) {
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function weekLabel(d: Date) {
  const start = startOfWeekMonday(d);
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    const month = start.toLocaleDateString(undefined, { month: "short" });
    return `${month} ${start.getDate()}–${end.getDate()}, ${end.getFullYear()}`;
  }
  const startPart = start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const endPart = end.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
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
  return dateTimeMs(s.dateYmd, s.end) < nowMs;
}
