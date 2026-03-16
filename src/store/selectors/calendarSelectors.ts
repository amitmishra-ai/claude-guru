/**
 * Memoized selectors for the calendar module — §7 of CALENDAR_FUNCTIONALITY_RTK_MUI.md
 *
 * Using RTK's createSelector (re-exports Reselect's createSelector) so that
 * derived values are only recomputed when their inputs change.
 */
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { startOfWeekMonday, addDays, startOfMonth, toYmd } from "@/lib/helpers";
import { demoExternalBusy } from "@/data/demo-sessions";

// ─── Raw state slices ────────────────────────────────────────────────────────

const selectSessions = (s: RootState) => s.sessions.items;
const selectConfirmations = (s: RootState) => s.sessions.confirmations;
const selectSessionDeclined = (s: RootState) => s.sessions.sessionDeclined;
const selectRequests = (s: RootState) => s.requests.items;
const selectPatterns = (s: RootState) => s.availability.patterns;
const selectOneOffAvail = (s: RootState) => s.availability.oneOffAvail;
const selectUnavailable = (s: RootState) => s.availability.unavailable;
const selectMaxPerWeek = (s: RootState) => s.availability.maxPerWeek;
const selectRangeDays = (s: RootState) => s.availability.rangeDays;
const selectAnchorDateISO = (s: RootState) => s.calendar.anchorDate;
const selectCalendarViewMode = (s: RootState) => s.calendar.calendarViewMode;

// ─── Derived date anchors ────────────────────────────────────────────────────

/** Parse anchor ISO string into a Date object */
export const selectAnchorDate = createSelector(
  selectAnchorDateISO,
  (iso) => new Date(iso)
);

/** Monday-aligned week start for current anchor */
export const selectWeekStart = createSelector(
  selectAnchorDate,
  (anchor) => startOfWeekMonday(anchor)
);

/** First day of month for current anchor */
export const selectMonthStart = createSelector(
  selectAnchorDate,
  (anchor) => startOfMonth(anchor)
);

/** Array of 7 Date objects for the visible week (Mon–Sun) */
export const selectWeekDays = createSelector(
  selectWeekStart,
  (weekStart) => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
);

// ─── Availability end date ────────────────────────────────────────────────────

export const selectAvailabilityEndDate = createSelector(
  selectRangeDays,
  (rangeDays) => {
    // Use a fixed demoNow to keep selectors pure (no Date.now() in createSelector)
    const demoNow = new Date("2026-02-16T09:00:00");
    return toYmd(addDays(demoNow, rangeDays));
  }
);

// ─── Items filtered to the visible week ──────────────────────────────────────

export const selectSessionsThisWeek = createSelector(
  selectSessions,
  selectWeekStart,
  (sessions, weekStart) => {
    const weekEnd = addDays(weekStart, 7);
    return sessions.filter((s) => {
      const sDate = new Date(`${s.dateYmd}T00:00:00`);
      return sDate >= weekStart && sDate < weekEnd;
    });
  }
);

export const selectRequestsThisWeek = createSelector(
  selectRequests,
  selectWeekStart,
  (requests, weekStart) => {
    const weekEnd = addDays(weekStart, 7);
    return requests.filter((r) => {
      const rDate = new Date(`${r.dateYmd}T00:00:00`);
      return rDate >= weekStart && rDate < weekEnd;
    });
  }
);

export const selectBusyThisWeek = createSelector(
  selectWeekStart,
  (weekStart) => {
    const weekEnd = addDays(weekStart, 7);
    return demoExternalBusy.filter((b) => {
      const bDate = new Date(`${b.dateYmd}T00:00:00`);
      return bDate >= weekStart && bDate < weekEnd;
    });
  }
);

// ─── Stats ───────────────────────────────────────────────────────────────────

export const selectPendingRequestsThisWeek = createSelector(
  selectRequestsThisWeek,
  (requests) => requests.filter((r) => r.response === "pending").length
);

// ─── "Is current period" (§13) ───────────────────────────────────────────────

export const selectIsCurrentPeriod = createSelector(
  selectCalendarViewMode,
  selectWeekStart,
  selectAnchorDate,
  (viewMode, weekStart, anchorDate) => {
    const demoNow = new Date("2026-02-16T09:00:00");
    const currentWeekStart = startOfWeekMonday(demoNow);
    if (viewMode === "week") {
      return toYmd(weekStart) === toYmd(currentWeekStart);
    }
    return (
      anchorDate.getMonth() === demoNow.getMonth() &&
      anchorDate.getFullYear() === demoNow.getFullYear()
    );
  }
);

// ─── Re-exports of raw selectors for convenience ─────────────────────────────

export {
  selectSessions,
  selectConfirmations,
  selectSessionDeclined,
  selectRequests,
  selectPatterns,
  selectOneOffAvail,
  selectUnavailable,
  selectMaxPerWeek,
  selectRangeDays,
  selectAnchorDateISO,
  selectCalendarViewMode,
};
