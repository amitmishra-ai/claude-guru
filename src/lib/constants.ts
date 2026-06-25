import { minutes, hhmmFromMinutes, fmtTime12 } from "./helpers";

// ─── Day-of-week Arrays ─────────────────────────────────────────────────────

export const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const DOW_LONG = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

// ─── Time Grid Constants ────────────────────────────────────────────────────

export const TIME_START = minutes(8);
export const TIME_END = minutes(20);
export const TIME_STEP = 30;

export const timeRows: number[] = (() => {
  const rows: number[] = [];
  for (let t = TIME_START; t <= TIME_END; t += TIME_STEP) rows.push(t);
  return rows;
})();

export const timeOptions12 = Array.from(
  { length: Math.floor((TIME_END - TIME_START) / TIME_STEP) + 1 },
  (_, i) => {
    const mins = TIME_START + i * TIME_STEP;
    return { value: hhmmFromMinutes(mins), label: fmtTime12(mins) };
  }
);

/** Full 24-hour list (00:00 → 23:30, 30-min steps) for availability time pickers. */
export const timeOptions24 = Array.from({ length: (24 * 60) / TIME_STEP }, (_, i) => {
  const mins = i * TIME_STEP;
  return { value: hhmmFromMinutes(mins), label: fmtTime12(mins) };
});

// ─── Demo Anchor Date ───────────────────────────────────────────────────────

export const demoNow = new Date("2026-04-21T09:00:00");

// ─── Nudge Image ────────────────────────────────────────────────────────────

export const availabilityNudgeImageSrc = "/Teacher.png";
