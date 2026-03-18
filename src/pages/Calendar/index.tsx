import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LanguageIcon from "@mui/icons-material/Language";
import EventNoteIcon from "@mui/icons-material/EventNote";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { keyframes } from "@mui/system";
import { useAppSelector, useAppDispatch } from "@/store";
import { setCalendarViewMode, setAnchorDate } from "@/store/slices/calendarSlice";
import { setSessionFocus, clearRecentlyConfirmed } from "@/store/slices/sessionsSlice";
import { setRequestFocus } from "@/store/slices/requestsSlice";
import {
  setOpenSession,
  setOpenRequest,
  setOpenAvailability,
  setOpenNotAvailable,
  setOpenAddAvailability,
  setLeavePopoverNaId,
  setAvailPopoverBlockId,
  setOpenTimezone,
} from "@/store/slices/uiSlice";
import { LeavePopover } from "@/components/dialogs/LeavePopover";
import { AvailabilityPopover } from "@/components/dialogs/AvailabilityPopover";
import {
  selectAnchorDate,
  selectWeekStart,
  selectMonthStart,
  selectWeekDays,
  selectSessionsThisWeek,
  selectRequestsThisWeek,
  selectBusyThisWeek,
  selectAvailabilityEndDate,
  selectPendingRequestsThisWeek,
  selectIsCurrentPeriod,
} from "@/store/selectors/calendarSelectors";
import {
  addDays,
  addMonths,
  weekLabel,
  monthLabel,
  fmtTime,
  fmtTime12,
  toYmd,
} from "@/lib/helpers";
import { DOW, DOW_LONG, TIME_START, TIME_END, demoNow } from "@/lib/constants";
import type { NA, RequestSlot, Session } from "@/lib/types";

/* ─── helpers ─────────────────────────────────────────────────────────────── */

/** Overlap predicate per spec §8.3: aStart < bEnd && bStart < aEnd */
function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Computes side-by-side column layout for overlapping events.
 * Returns { col, numCols } per event id so overlapping events
 * can be rendered as horizontal neighbours instead of stacking.
 */
function computeEventLayout(
  items: Array<{ id: string; start: number; end: number }>
): Record<string, { col: number; numCols: number }> {
  if (items.length === 0) return {};
  const sorted = [...items].sort((a, b) =>
    a.start !== b.start ? a.start - b.start : b.end - a.end
  );
  const cols: number[] = new Array(sorted.length).fill(0);
  const colEnds: number[] = [];
  for (let i = 0; i < sorted.length; i++) {
    let col = 0;
    while (col < colEnds.length && colEnds[col] > sorted[i].start) col++;
    cols[i] = col;
    colEnds[col] = sorted[i].end;
  }
  const result: Record<string, { col: number; numCols: number }> = {};
  for (let i = 0; i < sorted.length; i++) {
    let maxCol = cols[i];
    for (let j = 0; j < sorted.length; j++) {
      if (i !== j && overlaps(sorted[i].start, sorted[i].end, sorted[j].start, sorted[j].end)) {
        maxCol = Math.max(maxCol, cols[j]);
      }
    }
    result[sorted[i].id] = { col: cols[i], numCols: maxCol + 1 };
  }
  return result;
}

/** Convert minutes-since-midnight to a percentage within the visible grid. */
function timeToPercent(mins: number) {
  return ((mins - TIME_START) / (TIME_END - TIME_START)) * 100;
}

/** Hours to render on the time axis (8 AM … 8 PM). */
const HOUR_LABELS: number[] = (() => {
  const arr: number[] = [];
  for (let m = TIME_START; m <= TIME_END; m += 60) arr.push(m);
  return arr;
})();

/** Shared sizing constants for week/month card consistency */
const GRID_ROW_PX = 42;
const CALENDAR_CARD_HEIGHT = HOUR_LABELS.length * GRID_ROW_PX + 84; // grid + header + bottom label room

/** Format a Date as "Feb 16" */
function fmtShortDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Format minutes as "8 AM" or "8:30 AM" */
function fmtTimeLabel(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${h12} ${ampm}` : `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

/** Session status color (§8.4) */
function sessionColors(confirmed: boolean, declined: boolean) {
  if (declined)
    return {
      bg: "var(--gl-cal-session-declined-bg)",
      border: "var(--gl-cal-session-declined-border)",
      text: "error.main",
      sub: "error.light",
    };
  if (confirmed)
    return {
      bg: "var(--gl-cal-session-confirmed-bg)",
      border: "var(--gl-cal-session-confirmed-border)",
      text: "var(--gl-cal-session-confirmed-text)",
      sub: "var(--gl-cal-session-confirmed-sub)",
    };
  // Scheduled
  return {
    bg: "var(--gl-cal-session-scheduled-bg)",
    border: "var(--gl-cal-session-scheduled-border)",
    text: "var(--gl-cal-session-scheduled-text)",
    sub: "var(--gl-cal-session-scheduled-sub)",
  };
}

/** Request status color (§8.5) */
function requestColors(response: RequestSlot["response"]) {
  if (response === "available")
    return {
      bg: "var(--gl-cal-request-hold-bg)",
      border: "var(--gl-cal-request-hold-border)",
      text: "var(--gl-cal-request-hold-text)",
      sub: "var(--gl-cal-request-hold-sub)",
    };
  if (response === "unavailable")
    return {
      bg: "var(--gl-cal-request-declined-bg)",
      border: "var(--gl-cal-request-declined-border)",
      text: "var(--gl-cal-request-declined-text)",
      sub: "var(--gl-cal-request-declined-sub)",
    };
  // Pending
  return {
    bg: "var(--gl-cal-request-pending-bg)",
    border: "var(--gl-cal-request-pending-border)",
    text: "var(--gl-cal-request-pending-text)",
    sub: "var(--gl-cal-request-pending-sub)",
  };
}

/* ── Pulse animation for recently-confirmed sessions ─────────────────── */
const confirmPulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 var(--gl-cal-session-confirmed-pulse, rgba(25,106,229,0.4)); }
  50% { box-shadow: 0 0 0 6px var(--gl-cal-session-confirmed-pulse-end, rgba(25,106,229,0)); }
`;

/* ═══════════════════════════════════════════════════════════════════════════ */

export default function CalendarPage() {
  const dispatch = useAppDispatch();

  /* ── real current date/time (local) ───────────────────────────────────── */
  const realNow = new Date();

  /* ── redux state ──────────────────────────────────────────────────────── */
  const sessions = useAppSelector((s) => s.sessions.items);
  const confirmations = useAppSelector((s) => s.sessions.confirmations);
  const sessionDeclined = useAppSelector((s) => s.sessions.sessionDeclined);
  const recentlyConfirmedIds = useAppSelector((s) => s.sessions.recentlyConfirmedIds);
  const calendarViewMode = useAppSelector((s) => s.calendar.calendarViewMode);
  const timeZoneMode = useAppSelector((s) => s.profile.timeZoneMode);
  const manualTimeZone = useAppSelector((s) => s.profile.manualTimeZone);
  const effectiveTz = timeZoneMode === "manual" ? manualTimeZone : Intl.DateTimeFormat().resolvedOptions().timeZone;
  const patterns = useAppSelector((s) => s.availability.patterns);
  const oneOffAvail = useAppSelector((s) => s.availability.oneOffAvail);
  const unavailable = useAppSelector((s) => s.availability.unavailable);
  const removedAvailabilityIds = useAppSelector((s) => s.availability.removedAvailabilityIds);
  const hasUserConfiguredAvailability = useAppSelector((s) => s.availability.hasUserConfiguredAvailability);
  const requests = useAppSelector((s) => s.requests.items);
  /* ── memoized selectors (§7) ──────────────────────────────────────────── */
  const anchorDate = useAppSelector(selectAnchorDate);
  const weekStart = useAppSelector(selectWeekStart);
  const monthStart = useAppSelector(selectMonthStart);
  const weekDays = useAppSelector(selectWeekDays);
  const availabilityEndDate = useAppSelector(selectAvailabilityEndDate);
  const rangeEndYmd = availabilityEndDate;
  const sessionsThisWeek = useAppSelector(selectSessionsThisWeek);
  const requestsThisWeek = useAppSelector(selectRequestsThisWeek);
  const busyThisWeek = useAppSelector(selectBusyThisWeek);
  const isCurrentPeriod = useAppSelector(selectIsCurrentPeriod);

  /* ── navigation ───────────────────────────────────────────────────────── */
  const navPrev = () => {
    if (calendarViewMode === "week") {
      dispatch(setAnchorDate(addDays(anchorDate, -7).toISOString()));
    } else {
      dispatch(setAnchorDate(addMonths(anchorDate, -1).toISOString()));
    }
  };
  const navNext = () => {
    if (calendarViewMode === "week") {
      dispatch(setAnchorDate(addDays(anchorDate, 7).toISOString()));
    } else {
      dispatch(setAnchorDate(addMonths(anchorDate, 1).toISOString()));
    }
  };
  const navCurrent = () => {
    dispatch(setAnchorDate(realNow.toISOString()));
  };


  /* ── Month day-click → switch to week view (§9.5) ─────────────────── */
  const handleMonthDayClick = useCallback(
    (d: Date) => {
      const ymd = toYmd(d);
      // §9.4: beyond rangeEndYmd → no action
      if (ymd > rangeEndYmd) return;
      dispatch(setAnchorDate(d.toISOString()));
      dispatch(setCalendarViewMode("week"));
    },
    [dispatch, rangeEndYmd]
  );

  /* ── Mobile selected day ──────────────────────────────────────────── */
  const todayYmd = toYmd(realNow);
  const [mobileSelectedDay, setMobileSelectedDay] = useState<string>(todayYmd);

  /* ── Popover anchor refs ──────────────────────────────────────────── */
  const [leaveAnchorEl, setLeaveAnchorEl] = useState<HTMLElement | null>(null);
  const [availAnchorEl, setAvailAnchorEl] = useState<HTMLElement | null>(null);

  /* ── Confirmed pulse cleanup ──────────────────────────────────────── */
  useEffect(() => {
    const ids = Object.keys(recentlyConfirmedIds);
    if (ids.length === 0) return;
    const timers = ids.map((id) => {
      const elapsed = Date.now() - (recentlyConfirmedIds[id] || 0);
      const remaining = Math.max(0, 2000 - elapsed);
      return setTimeout(() => dispatch(clearRecentlyConfirmed(id)), remaining);
    });
    return () => timers.forEach(clearTimeout);
  }, [recentlyConfirmedIds, dispatch]);


  /* ── Summary stats for "week at a glance" ─────────────────────────── */
  const weekStats = useMemo(() => {
    const weekSessions = sessionsThisWeek.filter((s) => !sessionDeclined[s.id]);
    const confirmedCount = weekSessions.filter((s) => confirmations[s.id]).length;
    const unconfirmedCount = weekSessions.filter((s) => !confirmations[s.id]).length;
    const pendingReqs = requestsThisWeek.filter((r) => r.response === "pending").length;
    // Available slots = pattern blocks + one-off for the week
    const availSlots = weekDays.reduce((count, d) => {
      const dayLong = DOW_LONG[d.getDay() === 0 ? 6 : d.getDay() - 1];
      return count + patterns.filter((p) => p.days.includes(dayLong)).length
        + oneOffAvail.filter((b) => b.dateYmd === toYmd(d)).length;
    }, 0);
    return { total: weekSessions.length, confirmedCount, unconfirmedCount, pendingReqs, availSlots };
  }, [sessionsThisWeek, sessionDeclined, confirmations, requestsThisWeek, weekDays, patterns, oneOffAvail]);

  // Collect all availability blocks for popover
  const allAvailBlocks = useMemo(() => {
    const blocks = [...oneOffAvail];
    // Generate virtual blocks from patterns for the week
    weekDays.forEach((d) => {
      const dayLong = DOW_LONG[d.getDay() === 0 ? 6 : d.getDay() - 1];
      const ymd = toYmd(d);
      patterns.filter((p) => p.days.includes(dayLong)).forEach((p) => {
        blocks.push({ id: `pat-${p.id}-${ymd}`, dateYmd: ymd, start: p.start, end: p.end, source: "pattern" as const, patternId: p.id });
      });
    });
    return blocks;
  }, [oneOffAvail, weekDays, patterns]);

  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ── Row 1: Title + actions (actions hidden on mobile) ───────────── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CalendarMonthIcon sx={{ fontSize: 20 }} aria-hidden="true" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Calendar</Typography>
        </Box>
        {/* Desktop: action buttons */}
        <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 1 }}>
          <Button
            variant="soft"
            size="small"
            startIcon={<EventBusyIcon sx={{ fontSize: 16 }} />}
            aria-label="Mark leave"
            sx={{ textTransform: 'none' }}
            onClick={() => dispatch(setOpenNotAvailable(true))}
          >
            Mark leave
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<EditCalendarIcon sx={{ fontSize: 16 }} />}
            aria-label="Add availability"
            sx={{ textTransform: 'none' }}
            onClick={() => dispatch(setOpenAvailability(true))}
          >
            Add availability
          </Button>
        </Box>

        {/* Mobile: timezone in title row */}
        <Button
          variant="text"
          size="small"
          startIcon={<LanguageIcon sx={{ fontSize: 13 }} />}
          sx={{ display: { xs: "flex", sm: "none" }, textTransform: 'none', color: 'text.disabled', fontWeight: 400, fontSize: '0.75rem', p: 0, minWidth: 0, '&:hover': { color: 'text.secondary', bgcolor: 'transparent' } }}
          onClick={() => dispatch(setOpenTimezone(true))}
        >
          {effectiveTz}
        </Button>
      </Box>

      {/* ── Row 2: Date navigator (left) + Week/Month toggle (right) ─────── */}
      <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>

        {/* Left: prev / date label / next + "Today" jump */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Button
            variant="text"
            size="small"
            aria-label="Previous period"
            sx={{ minWidth: 0, p: 0.75, color: 'text.secondary' }}
            onClick={navPrev}
          >
            <ChevronLeftIcon sx={{ fontSize: 20 }} />
          </Button>
          <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {calendarViewMode === "week" ? weekLabel(anchorDate) : monthLabel(anchorDate)}
          </Typography>
          <Button
            variant="text"
            size="small"
            aria-label="Next period"
            sx={{ minWidth: 0, p: 0.75, color: 'text.secondary' }}
            onClick={navNext}
          >
            <ChevronRightIcon sx={{ fontSize: 20 }} />
          </Button>
          {!isCurrentPeriod && (
            <Button
              variant="soft"
              size="small"
              sx={{ textTransform: 'none', fontSize: '0.8125rem', fontWeight: 500, ml: 0.5 }}
              onClick={() => dispatch(setAnchorDate(realNow.toISOString()))}
            >
              Today
            </Button>
          )}
        </Box>

        {/* Right: Week/Month pill toggle */}
        <Box
          sx={{
            display: 'inline-flex',
            gap: 0.5,
            bgcolor: 'action.hover',
            borderRadius: '100px',
            p: '4px',
            flexShrink: 0,
          }}
        >
          {(["week", "month"] as const).map((mode) => (
            <Button
              key={mode}
              size="small"
              aria-label={`Switch to ${mode} view`}
              sx={{
                fontSize: '0.875rem',
                textTransform: 'capitalize',
                minWidth: 64,
                px: 1.75,
                borderRadius: '100px',
                fontWeight: calendarViewMode === mode ? 600 : 400,
                bgcolor: calendarViewMode === mode ? 'primary.main' : 'transparent',
                color: calendarViewMode === mode ? 'primary.contrastText' : 'text.secondary',
                boxShadow: calendarViewMode === mode ? '0 1px 4px rgba(25,106,229,0.35)' : 'none',
                '&:hover': { bgcolor: calendarViewMode === mode ? 'primary.dark' : 'transparent' },
              }}
              onClick={() => dispatch(setCalendarViewMode(mode))}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Button>
          ))}
        </Box>

      </Box>

      {/* ── Row 3: Timezone (desktop only, left) + mobile actions (right, xs only) ─── */}
      <Box sx={{ mt: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Button
          variant="text"
          size="small"
          startIcon={<LanguageIcon sx={{ fontSize: 14 }} />}
          sx={{ display: { xs: "none", sm: "flex" }, textTransform: 'none', color: 'text.disabled', fontWeight: 400, fontSize: '0.75rem', p: 0, minWidth: 0, '&:hover': { color: 'text.secondary', bgcolor: 'transparent' } }}
          onClick={() => dispatch(setOpenTimezone(true))}
        >
          {effectiveTz}
        </Button>

      </Box>

      {/* ── Availability gate ─────────────────────────────────────────── */}
      {!hasUserConfiguredAvailability && (
        <Box
          sx={{
            mt: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2.5,
            py: 10,
            borderRadius: 3,
            border: '2px dashed',
            borderColor: 'divider',
            bgcolor: 'action.hover',
            textAlign: 'center',
            px: 4,
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <EventNoteIcon sx={{ fontSize: 36, color: 'primary.contrastText' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75 }}>
              Set your availability to get started
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: 'auto' }}>
              Without marking your availability, no events will be scheduled with you. Let learners know when you're free so they can book time with you.
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<EditCalendarIcon sx={{ fontSize: 18 }} />}
            sx={{ textTransform: 'none', px: 4 }}
            onClick={() => dispatch(setOpenAvailability(true))}
          >
            Set your availability
          </Button>
        </Box>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── WEEK VIEW ─────────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {hasUserConfiguredAvailability && calendarViewMode === "week" && (
        <>
          {/* ── Mobile time-grid view (below md) ────────────────────────── */}
          <Box sx={{ mt: 2, display: { md: "none" } }}>

            {/* Day strip */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", mb: 1.5 }}>
              {weekDays.map((d, i) => {
                const ymd = toYmd(d);
                const isToday = ymd === toYmd(realNow);
                const isSelected = ymd === mobileSelectedDay;
                const hasEvents =
                  sessionsThisWeek.some((s) => s.dateYmd === ymd && !sessionDeclined[s.id]) ||
                  requestsThisWeek.some((r) => r.dateYmd === ymd && r.response === "pending");
                return (
                  <Box
                    key={i}
                    component="button"
                    onClick={() => setMobileSelectedDay(ymd)}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.25,
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      p: 0.5,
                      fontFamily: 'inherit',
                    }}
                  >
                    {/* Event dot */}
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: hasEvents ? 'warning.main' : 'transparent' }} />
                    {/* Day name */}
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 500, fontSize: '0.65rem', color: isSelected ? 'primary.main' : 'text.secondary' }}
                    >
                      {DOW[i]}
                    </Typography>
                    {/* Date circle */}
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: isSelected ? 'primary.main' : 'transparent',
                        color: isSelected ? 'primary.contrastText' : isToday ? 'primary.main' : 'text.primary',
                        fontWeight: isSelected || isToday ? 700 : 400,
                        fontSize: '0.875rem',
                      }}
                    >
                      {d.getDate()}
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Single-day time grid */}
            <Card variant="outlined" sx={{ overflow: 'hidden' }}>
              <Box sx={{ overflowY: 'auto', maxHeight: 480, position: 'relative' }}>
                {/* Hour rows */}
                <Box sx={{ position: 'relative', height: HOUR_LABELS.length * GRID_ROW_PX }}>
                  {HOUR_LABELS.map((mins, idx) => (
                    <Box
                      key={mins}
                      sx={{
                        position: 'absolute',
                        top: idx * GRID_ROW_PX,
                        left: 0,
                        right: 0,
                        height: GRID_ROW_PX,
                        display: 'grid',
                        gridTemplateColumns: '48px 1fr',
                        borderTop: idx > 0 ? 1 : 0,
                        borderColor: 'divider',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontWeight: 500, pt: 0.5, pr: 1, textAlign: 'right', fontSize: '0.7rem' }}
                      >
                        {fmtTime(mins)}
                      </Typography>
                      <Box sx={{ borderLeft: 1, borderColor: 'divider' }} />
                    </Box>
                  ))}

                  {/* Session events for selected day */}
                  {sessionsThisWeek
                    .filter((s) => s.dateYmd === mobileSelectedDay && !sessionDeclined[s.id])
                    .map((s) => {
                      const confirmed = !!confirmations[s.id];
                      const sColors = sessionColors(confirmed, false);
                      const topPct = timeToPercent(s.start);
                      const blockHeight = timeToPercent(s.end) - topPct;
                      const totalPx = HOUR_LABELS.length * GRID_ROW_PX;
                      return (
                        <Box
                          key={s.id}
                          component="button"
                          onClick={() => { dispatch(setSessionFocus(s)); dispatch(setOpenSession(true)); }}
                          sx={{
                            position: 'absolute',
                            top: `${topPct}%`,
                            height: `${blockHeight}%`,
                            left: 52,
                            right: 4,
                            bgcolor: sColors.bg,
                            borderRadius: '10px',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            px: 1,
                            pt: 0.5,
                            overflow: 'hidden',
                            fontFamily: 'inherit',
                            zIndex: 5,
                            minHeight: totalPx * blockHeight / 100,
                          }}
                        >
                          <Typography sx={{ fontSize: '0.7rem', color: sColors.text, fontWeight: 500, lineHeight: '14px' }} noWrap>
                            {fmtTime(s.start)}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: sColors.text, fontWeight: 700, lineHeight: '16px' }} noWrap>
                            {s.title.replace("Mentor Session: ", "")}
                          </Typography>
                        </Box>
                      );
                    })}

                  {/* Request events for selected day */}
                  {requestsThisWeek
                    .filter((r) => r.dateYmd === mobileSelectedDay && r.response === "pending")
                    .map((r) => {
                      const topPct = timeToPercent(r.start);
                      const blockHeight = timeToPercent(r.end) - topPct;
                      return (
                        <Box
                          key={r.id}
                          component="button"
                          onClick={() => { dispatch(setRequestFocus(r)); dispatch(setOpenRequest(true)); }}
                          sx={{
                            position: 'absolute',
                            top: `${topPct}%`,
                            height: `${blockHeight}%`,
                            left: 52,
                            right: 4,
                            bgcolor: 'var(--gl-cal-request-pending-bg)',
                            border: '1px dashed var(--gl-cal-request-pending-border)',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            px: 1,
                            pt: 0.5,
                            overflow: 'hidden',
                            fontFamily: 'inherit',
                            zIndex: 5,
                          }}
                        >
                          <Typography sx={{ fontSize: '0.7rem', color: 'var(--gl-cal-request-pending-text)', fontWeight: 500, lineHeight: '14px' }} noWrap>
                            {fmtTime(r.start)}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: 'var(--gl-cal-request-pending-text)', fontWeight: 700, lineHeight: '16px' }} noWrap>
                            {r.title}
                          </Typography>
                        </Box>
                      );
                    })}
                </Box>
              </Box>
            </Card>
          </Box>

          {/* ── Desktop time-grid view (md and above) ───────────────────── */}
          <Box sx={{ mt: 2, display: { xs: 'none', md: 'flex' }, flexDirection: 'column', border: 1, borderColor: 'divider', borderRadius: 2 }}>

            {/* Day-of-week header row */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '56px repeat(7, 1fr)',
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Box /> {/* time gutter */}
              {weekDays.map((d, i) => {
                const ymd = toYmd(d);
                const isToday = ymd === toYmd(realNow);
                return (
                  <Box
                    key={i}
                    sx={{
                      py: 1.5,
                      textAlign: 'center',
                      borderLeft: 1,
                      borderColor: 'divider',
                      bgcolor: isToday ? 'action.selected' : 'transparent',
                    }}
                    aria-label={`${DOW_LONG[i]} ${d.getDate()}`}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: isToday ? 'primary.main' : 'text.secondary',
                        fontSize: '0.7rem',
                      }}
                    >
                      {DOW[i]} {d.getDate()}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Time grid body — full height, no internal scroll */}
            <Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '56px repeat(7, 1fr)',
                  position: 'relative',
                  height: HOUR_LABELS.length * GRID_ROW_PX,
                }}
              >
                {/* ── Time labels + horizontal grid lines ──────────────── */}
                {HOUR_LABELS.map((mins, hIdx) => {
                  const isFirst = hIdx === 0;
                  const isLast = hIdx === HOUR_LABELS.length - 1;
                  const top = `${timeToPercent(mins)}%`;
                  return (
                    <Box key={mins} sx={{ display: "contents" }}>
                      <Typography
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          left: 0,
                          width: 56,
                          textAlign: 'right',
                          pr: 1,
                          top,
                          transform: isFirst ? 'none' : isLast ? 'translateY(-100%)' : 'translateY(-50%)',
                          color: 'text.disabled',
                          fontSize: '0.65rem',
                          fontWeight: 500,
                          userSelect: 'none',
                        }}
                      >
                        {fmtTimeLabel(mins)}
                      </Typography>
                      <Box
                        sx={{
                          position: 'absolute',
                          top,
                          left: 56,
                          right: 0,
                          height: '1px',
                          bgcolor: 'divider',
                        }}
                      />
                    </Box>
                  );
                })}

                {/* ── Day columns with overlap handling (§8.3) ──────────── */}
                {weekDays.map((d, colIdx) => {
                  const ymd = toYmd(d);
                  const dayLong = DOW_LONG[colIdx];

                  /* raw data for this day */
                  const rawAvailBlocks = patterns.filter((p) => p.days.includes(dayLong));
                  const rawOneOffBlocks = oneOffAvail.filter((b) => b.dateYmd === ymd);
                  const naBlocks = unavailable.filter((n) => n.dateYmd === ymd);
                  const rawBusyBlocks = busyThisWeek.filter((b) => b.dateYmd === ymd);
                  const daySessions = sessionsThisWeek.filter((s) => s.dateYmd === ymd);
                  const dayRequests = requestsThisWeek.filter((r) => r.dateYmd === ymd);

                  /* ── §8.3 overlap filtering ────────────────────────── */

                  // Collect all "occupied" intervals (drawn sessions, requests, NA)
                  const occupiedIntervals: Array<{ start: number; end: number }> = [];

                  // Sessions that are drawn (not declined)
                  const drawnSessions = daySessions.filter((s) => !sessionDeclined[s.id]);
                  drawnSessions.forEach((s) => occupiedIntervals.push({ start: s.start, end: s.end }));

                  // Declined sessions — their time slots
                  const declinedSessions = daySessions.filter((s) => !!sessionDeclined[s.id]);

                  // Requests add to occupied
                  dayRequests.forEach((r) => occupiedIntervals.push({ start: r.start, end: r.end }));

                  // §8.3: Hide busy blocks if they collide with ANY session or request
                  const filteredBusyBlocks = rawBusyBlocks.filter((b) => {
                    // Hide if overlapping any session (drawn or declined)
                    if (daySessions.some((s) => overlaps(b.start, b.end, s.start, s.end))) return false;
                    // Hide if overlapping any request
                    if (dayRequests.some((r) => overlaps(b.start, b.end, r.start, r.end))) return false;
                    return true;
                  });
                  filteredBusyBlocks.forEach((b) => occupiedIntervals.push({ start: b.start, end: b.end }));

                  // §8.3: For overlapping NA (leave) blocks, keep only the most recent by createdAt
                  // Also hide leave blocks tied to sessionId if the same session is drawn in that day
                  const filteredNaBlocks = (() => {
                    // Step 1: Remove NA blocks whose sessionId maps to a drawn session
                    const afterSessionFilter = naBlocks.filter((n) => {
                      if (n.sessionId) {
                        // Hide if this session is drawn (not declined)
                        return !drawnSessions.some((s) => s.id === n.sessionId);
                      }
                      return true;
                    });
                    // Step 2: For overlapping NA blocks, keep only the most recent by createdAt
                    const result: NA[] = [];
                    for (const n of afterSessionFilter) {
                      const overlapping = result.findIndex((existing) =>
                        overlaps(existing.start, existing.end, n.start, n.end)
                      );
                      if (overlapping >= 0) {
                        const existingCreated = result[overlapping].createdAt ?? 0;
                        const newCreated = n.createdAt ?? 0;
                        if (newCreated > existingCreated) {
                          result[overlapping] = n;
                        }
                        // else keep existing
                      } else {
                        result.push(n);
                      }
                    }
                    return result;
                  })();
                  filteredNaBlocks.forEach((n) => occupiedIntervals.push({ start: n.start, end: n.end }));

                  // §8.3: Hide availability placeholders that overlap any drawn occupied interval
                  const filteredAvailBlocks = rawAvailBlocks.filter((p) => {
                    return !occupiedIntervals.some((occ) =>
                      overlaps(p.start, p.end, occ.start, occ.end)
                    );
                  });
                  const filteredOneOffBlocks = rawOneOffBlocks.filter((b) => {
                    return !occupiedIntervals.some((occ) =>
                      overlaps(b.start, b.end, occ.start, occ.end)
                    );
                  });

                  // Compute side-by-side column layout for ALL events together so that
                  // overlapping sessions AND requests are placed in adjacent columns.
                  const combinedLayout = computeEventLayout([
                    ...drawnSessions.map((s) => ({ id: `sess-${s.id}`, start: s.start, end: s.end })),
                    ...dayRequests.map((r) => ({ id: `req-${r.id}`, start: r.start, end: r.end })),
                  ]);

                  const colIsToday = toYmd(d) === toYmd(realNow);
                  return (
                    <Box
                      key={colIdx}
                      sx={{
                        position: 'relative',
                        gridColumn: colIdx + 2,
                        gridRow: 1,
                        borderLeft: 1,
                        borderColor: 'divider',
                        bgcolor: colIsToday ? 'action.hover' : 'transparent',
                      }}
                    >
                      {/* Current time indicator — today column only */}
                      {colIsToday && (() => {
                        const nowMins = realNow.getHours() * 60 + realNow.getMinutes();
                        if (nowMins < TIME_START || nowMins > TIME_END) return null;
                        const topPct = timeToPercent(nowMins);
                        return (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: `${topPct}%`,
                              left: 0,
                              right: 0,
                              height: '2px',
                              bgcolor: 'primary.main',
                              zIndex: 20,
                              pointerEvents: 'none',
                            }}
                          >
                            <Box
                              sx={{
                                position: 'absolute',
                                left: -4,
                                top: -3,
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                              }}
                            />
                          </Box>
                        );
                      })()}

                      {/* §8.2 Draw order: 1. Busy (lowest) */}
                      {filteredBusyBlocks.map((b) => (
                        <Box
                          key={`busy-${b.id}`}
                          sx={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: `${timeToPercent(b.start)}%`,
                            height: `${timeToPercent(b.end) - timeToPercent(b.start)}%`,
                            bgcolor: 'var(--gl-cal-busy-bg)',
                            borderLeft: '3px solid var(--gl-cal-busy-border)',
                            borderRadius: '4px',
                            zIndex: 1,
                            pointerEvents: 'none',
                            px: 0.5,
                          }}
                        >
                          <Typography sx={{ fontSize: 9, lineHeight: '14px', color: 'text.secondary' }} noWrap>
                            {b.title}
                          </Typography>
                        </Box>
                      ))}

                      {/* §8.2 Draw order: 2. Leave (unavailable) — dashed border */}
                      {filteredNaBlocks.map((n) => (
                        <Box
                          key={`na-${n.id}`}
                          component="button"
                          onClick={(e: React.MouseEvent<HTMLElement>) => {
                            setLeaveAnchorEl(e.currentTarget);
                            dispatch(setLeavePopoverNaId(n.id));
                          }}
                          sx={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: `${timeToPercent(n.start)}%`,
                            height: `${timeToPercent(n.end) - timeToPercent(n.start)}%`,
                            bgcolor: 'var(--gl-cal-leave-bg)',
                            border: '1.5px dashed',
                            borderColor: 'error.main',
                            borderRadius: '12px',
                            backgroundImage:
                              'repeating-linear-gradient(135deg, transparent, transparent 4px, var(--gl-cal-leave-bg) 4px, var(--gl-cal-leave-bg) 5px)',
                            zIndex: 2,
                            px: 0.5,
                            pt: 0.25,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            width: '100%',
                            fontFamily: 'inherit',
                            textAlign: 'left',
                          }}
                        >
                          <Typography sx={{ fontSize: 10, fontWeight: 600, color: 'error.dark' }}>
                            Not available
                          </Typography>
                          {n.reason && (
                            <Typography sx={{ fontSize: 9, color: 'error.dark' }} noWrap>
                              {n.reason}
                            </Typography>
                          )}
                        </Box>
                      ))}

                      {/* §8.2 Draw order: 3. Availability placeholders — dashed emerald */}
                      {filteredAvailBlocks.map((p) => {
                        const virtualId = `pat-${p.id}-${ymd}`;
                        if (removedAvailabilityIds[virtualId]) return null;
                        return (
                          <Box
                            key={`avail-${p.id}`}
                            component="button"
                            onClick={(e: React.MouseEvent<HTMLElement>) => {
                              setAvailAnchorEl(e.currentTarget);
                              dispatch(setAvailPopoverBlockId(virtualId));
                            }}
                            sx={{
                              position: 'absolute',
                              left: 0,
                              right: 0,
                              top: `${timeToPercent(p.start)}%`,
                              height: `${timeToPercent(p.end) - timeToPercent(p.start)}%`,
                              bgcolor: 'var(--gl-cal-avail-bg)',
                              border: '1.5px dashed',
                              borderColor: 'success.main',
                              borderRadius: '12px',
                              zIndex: 3,
                              px: 0.5,
                              pt: 0.5,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              width: '100%',
                              fontFamily: 'inherit',
                              textAlign: 'left',
                            }}
                          >
                            <Typography sx={{ fontSize: 10, fontWeight: 600, color: 'success.dark' }}>
                              Available
                            </Typography>
                            <Typography sx={{ fontSize: 9, color: 'success.dark' }}>
                              {fmtTime(p.start)}–{fmtTime(p.end)}
                            </Typography>
                          </Box>
                        );
                      })}

                      {/* One-off availability blocks — dashed emerald */}
                      {filteredOneOffBlocks.map((b) => {
                        if (removedAvailabilityIds[b.id]) return null;
                        return (
                          <Box
                            key={`oneoff-${b.id}`}
                            component="button"
                            onClick={(e: React.MouseEvent<HTMLElement>) => {
                              setAvailAnchorEl(e.currentTarget);
                              dispatch(setAvailPopoverBlockId(b.id));
                            }}
                            sx={{
                              position: 'absolute',
                              left: 0,
                              right: 0,
                              top: `${timeToPercent(b.start)}%`,
                              height: `${timeToPercent(b.end) - timeToPercent(b.start)}%`,
                              bgcolor: 'var(--gl-cal-avail-bg)',
                              border: '1.5px dashed',
                              borderColor: 'success.main',
                              borderRadius: '12px',
                              zIndex: 3,
                              px: 0.5,
                              pt: 0.5,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              width: '100%',
                              fontFamily: 'inherit',
                              textAlign: 'left',
                            }}
                          >
                            <Typography sx={{ fontSize: 10, fontWeight: 600, color: 'success.dark' }}>
                              Available
                            </Typography>
                            <Typography sx={{ fontSize: 9, color: 'success.dark' }}>
                              {fmtTime(b.start)}–{fmtTime(b.end)}
                            </Typography>
                          </Box>
                        );
                      })}

                      {/* §8.2 Draw order: 4. Requests */}
                      {dayRequests.map((r) => {
                        const rColors = requestColors(r.response);
                        const { col: rCol, numCols: rNumCols } = combinedLayout[`req-${r.id}`] ?? { col: 0, numCols: 1 };
                        const rLeftPct = (rCol / rNumCols) * 100;
                        const rWidthPct = (1 / rNumCols) * 100;
                        return (
                          <Box
                            key={`req-${r.id}`}
                            component="button"
                            onClick={() => {
                              dispatch(setRequestFocus(r));
                              dispatch(setOpenRequest(true));
                            }}
                            aria-label={`Request: ${r.title}, ${fmtTime12(r.start)} to ${fmtTime12(r.end)}, status ${r.response}`}
                            sx={{
                              position: 'absolute',
                              left: `${rLeftPct}%`,
                              width: `calc(${rWidthPct}% - ${rNumCols > 1 ? 2 : 0}px)`,
                              top: `${timeToPercent(r.start)}%`,
                              height: `${timeToPercent(r.end) - timeToPercent(r.start)}%`,
                              bgcolor: rColors.bg,
                              border: `1.5px dashed ${rColors.border}`,
                              borderRadius: '4px',
                              zIndex: 4,
                              px: 0.5,
                              pt: 0.25,
                              textAlign: 'left',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              fontFamily: 'inherit',
                            }}
                          >
                            <Typography
                              sx={{ fontSize: 10, fontWeight: 700, lineHeight: '14px', color: rColors.text }}
                              noWrap
                            >
                              Request
                            </Typography>
                            <Typography
                              sx={{ fontSize: 10, lineHeight: '14px', color: rColors.text }}
                              noWrap
                            >
                              {r.title}
                            </Typography>
                            <Typography
                              sx={{ fontSize: 9, lineHeight: '12px', color: rColors.sub }}
                            >
                              {fmtTime(r.start)}–{fmtTime(r.end)}
                            </Typography>
                          </Box>
                        );
                      })}

                      {/* §8.2 Draw order: 5. Sessions (top) — with status dot + pulse */}
                      {daySessions.map((s) => {
                        const declined = !!sessionDeclined[s.id];
                        const confirmed = !!confirmations[s.id];
                        const sColors = sessionColors(confirmed, declined);
                        const statusLabel = declined
                          ? "Declined"
                          : confirmed
                            ? "Confirmed"
                            : "Scheduled";
                        const isRecentlyConfirmed = !!recentlyConfirmedIds[s.id];
                        const blockHeight = timeToPercent(s.end) - timeToPercent(s.start);
                        // Approximate pixel height based on grid
                        const pxHeight = (blockHeight / 100) * (HOUR_LABELS.length * GRID_ROW_PX);
                        const { col, numCols } = combinedLayout[`sess-${s.id}`] ?? { col: 0, numCols: 1 };
                        const leftPct = (col / numCols) * 100;
                        const widthPct = (1 / numCols) * 100;
                        return (
                          <Box
                            key={`sess-${s.id}`}
                            component="button"
                            onClick={() => {
                              dispatch(setSessionFocus(s));
                              dispatch(setOpenSession(true));
                            }}
                            aria-label={`${statusLabel} session: ${s.title}, ${fmtTime12(s.start)} to ${fmtTime12(s.end)}`}
                            sx={{
                              position: 'absolute',
                              left: `${leftPct}%`,
                              width: `calc(${widthPct}% - ${numCols > 1 ? 2 : 0}px)`,
                              top: `${timeToPercent(s.start)}%`,
                              height: `${blockHeight}%`,
                              bgcolor: sColors.bg,
                              border: 'none',
                              borderRadius: '10px',
                              zIndex: 5,
                              px: 1,
                              pt: 0.75,
                              pb: 0.5,
                              textAlign: 'left',
                              cursor: 'pointer',
                              textDecoration: declined ? 'line-through' : 'none',
                              overflow: 'hidden',
                              fontFamily: 'inherit',
                              transition: 'background-color 0.4s ease',
                              ...(isRecentlyConfirmed && {
                                animation: `${confirmPulse} 0.8s ease-in-out 2`,
                              }),
                            }}
                          >
                            {/* Time range row with dashed bottom border */}
                            <Box sx={{ borderBottom: `1px dashed ${sColors.border}`, pb: 0.5, mb: 0.5 }}>
                              <Typography
                                sx={{ fontSize: '0.6rem', fontWeight: 600, color: sColors.text, lineHeight: '14px' }}
                                noWrap
                              >
                                {fmtTimeLabel(s.start)} - {fmtTimeLabel(s.end)}
                              </Typography>
                            </Box>
                            {/* Title */}
                            <Typography
                              sx={{ fontSize: '0.7rem', fontWeight: 600, color: sColors.text, lineHeight: '1.3' }}
                            >
                              {s.title.replace("Mentor Session: ", "")}
                            </Typography>
                            {pxHeight > 56 && (
                              <Typography
                                sx={{ fontSize: '0.6rem', color: sColors.sub, mt: 0.25, lineHeight: '1.2' }}
                                noWrap
                              >
                                {s.sessionType}
                              </Typography>
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })}

                {/* Time-column spacer */}
                <Box sx={{ position: 'relative', gridColumn: 1, gridRow: 1 }} />
              </Box>
            </Box>
          </Box>

          {/* ── Legend bar ──────────────────────────────────────────────── */}
          <Box
            sx={{
              mt: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 2.5,
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700 }}>Key</Typography>
            {[
              { color: 'var(--gl-cal-session-scheduled-border)', label: 'Scheduled' },
              { color: 'var(--gl-cal-session-confirmed-border)', label: 'Confirmed' },
              { color: 'var(--gl-cal-session-declined-border)', label: 'Declined' },
              { color: 'var(--gl-cal-request-pending-border)', label: 'Pending request', dashed: true },
              { color: 'var(--gl-cal-avail-border, rgb(34,197,94))', label: 'Availability', dashed: true },
              { color: 'var(--gl-cal-leave-border, rgb(244,63,94))', label: 'Not available', dashed: true },
              { color: 'var(--gl-cal-busy-border)', label: 'External busy' },
            ].map((item) => (
              <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'dashed' in item && item.dashed ? 'transparent' : item.color,
                    border: 'dashed' in item && item.dashed ? `1.5px dashed ${item.color}` : 'none',
                    flexShrink: 0,
                  }}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* ── Popovers ─────────────────────────────────────────────── */}
          <LeavePopover anchorEl={leaveAnchorEl} />
          <AvailabilityPopover anchorEl={availAnchorEl} blocks={allAvailBlocks} />
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── MONTH VIEW ────────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {hasUserConfiguredAvailability && calendarViewMode === "month" && (
        <>
          <Card variant="outlined" sx={{ mt: 2, p: { xs: 1, md: 2 }, overflow: 'hidden', height: CALENDAR_CARD_HEIGHT, display: 'flex', flexDirection: 'column' }}>
            {/* §9.1 Sunday-first visual month grid — but we use Monday-first to match week view DOW header */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 0.5,
                textAlign: 'center',
                mb: 1,
                flexShrink: 0,
              }}
            >
              {DOW.map((d) => (
                <Typography key={d} variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  {d}
                </Typography>
              ))}
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, flex: 1, gridTemplateRows: 'repeat(6, 1fr)' }}>
              {(() => {
                const dt = new Date(monthStart);
                const day = dt.getDay();
                // Monday-first: shift so Monday = column 0
                const diff = day === 0 ? -6 : 1 - day;
                dt.setDate(dt.getDate() + diff);
                dt.setHours(0, 0, 0, 0);
                const cells = Array.from({ length: 42 }, (_, i) => addDays(dt, i));

                return cells.map((d, i) => {
                  const ymd = toYmd(d);
                  const isCurrentMonth = d.getMonth() === monthStart.getMonth();
                  const isBeyondRange = ymd > rangeEndYmd;
                  const isDisabled = isBeyondRange;

                  /* §9.2 Event composition per day from all sources */
                  const dayLong = DOW_LONG[d.getDay() === 0 ? 6 : d.getDay() - 1]; // map JS day to DOW_LONG index
                  const dayAvail = patterns.filter((p) => p.days.includes(dayLong));
                  const dayOneOff = oneOffAvail.filter((b) => b.dateYmd === ymd);
                  const daySessions = sessions.filter(
                    (s) => s.dateYmd === ymd
                  );
                  const dayRequests = requests.filter((r) => r.dateYmd === ymd);
                  const dayNA = unavailable.filter((n) => n.dateYmd === ymd);

                  /* §9.3 Sorting priority: leave first, session/confirmed next, request next, availability last */
                  type EventChip = { key: string; label: string; type: "leave" | "session" | "request" | "availability"; color: string; bg: string };
                  const chips: EventChip[] = [];

                  // Leave tags
                  dayNA.forEach((n) =>
                    chips.push({
                      key: `na-${n.id}`,
                      label: n.reason || "Unavailable",
                      type: "leave",
                      color: "var(--gl-cal-leave-text)",
                      bg: "var(--gl-cal-leave-bg)",
                    })
                  );

                  // Session tags (tone by confirmed/declined/scheduled)
                  daySessions.forEach((s) => {
                    const declined = !!sessionDeclined[s.id];
                    const confirmed = !!confirmations[s.id];
                    const sColors = sessionColors(confirmed, declined);
                    const shortTitle = s.title.replace("Mentor Session: ", "");
                    chips.push({
                      key: `sess-${s.id}`,
                      label: shortTitle,
                      type: "session",
                      color: sColors.text,
                      bg: sColors.bg,
                    });
                  });

                  // Request tags (tone by response)
                  dayRequests.forEach((r) => {
                    const rColors = requestColors(r.response);
                    chips.push({
                      key: `req-${r.id}`,
                      label: r.title,
                      type: "request",
                      color: rColors.text,
                      bg: rColors.bg,
                    });
                  });

                  // Availability tags (recurring + one-off)
                  dayAvail.forEach((p) =>
                    chips.push({
                      key: `avail-${p.id}`,
                      label: `${fmtTime(p.start)}–${fmtTime(p.end)}`,
                      type: "availability",
                      color: "var(--gl-cal-avail-text)",
                      bg: "var(--gl-cal-avail-bg)",
                    })
                  );
                  dayOneOff.forEach((b) =>
                    chips.push({
                      key: `oneoff-${b.id}`,
                      label: `${fmtTime(b.start)}–${fmtTime(b.end)}`,
                      type: "availability",
                      color: "var(--gl-cal-avail-text)",
                      bg: "var(--gl-cal-avail-bg)",
                    })
                  );

                  // Sort by priority: leave(0) → session(1) → request(2) → availability(3)
                  const priorityMap: Record<string, number> = { leave: 0, session: 1, request: 2, availability: 3 };
                  chips.sort((a, b) => priorityMap[a.type] - priorityMap[b.type]);

                  // §9.1: show up to 2 chips and +N more (compact to avoid scroll)
                  const visibleChips = chips.slice(0, 2);
                  const moreCount = chips.length - 2;

                  return (
                    <Box
                      key={i}
                      onClick={isDisabled ? undefined : () => handleMonthDayClick(d)}
                      role="button"
                      tabIndex={isDisabled ? -1 : 0}
                      onKeyDown={
                        isDisabled
                          ? undefined
                          : (e: React.KeyboardEvent) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleMonthDayClick(d);
                              }
                            }
                      }
                      aria-label={`${ymd}${chips.length > 0 ? `, ${chips.length} events` : ""}${isDisabled ? ", disabled" : ""}`}
                      sx={{
                        borderRadius: 1,
                        border: 1,
                        borderColor: 'divider',
                        p: 0.5,
                        fontSize: '0.75rem',
                        // §9.4: beyond range → disabled, reduced opacity
                        opacity: isDisabled ? 0.35 : isCurrentMonth ? 1 : 0.5,
                        cursor: isDisabled ? 'default' : 'pointer',
                        '&:hover': isDisabled ? {} : { bgcolor: 'action.hover' },
                        transition: 'background-color 0.15s',
                        overflow: 'hidden',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 500,
                          ...(ymd === toYmd(realNow) && {
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            borderRadius: '50%',
                            width: 22,
                            height: 22,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }),
                        }}
                      >
                        {d.getDate()}
                      </Typography>
                      {visibleChips.map((chip) => (
                        <Box
                          key={chip.key}
                          sx={{
                            mt: 0.25,
                            borderRadius: 0.5,
                            bgcolor: chip.bg,
                            color: chip.color,
                            px: 0.5,
                            fontSize: '0.5625rem',
                            lineHeight: '14px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {chip.label}
                        </Box>
                      ))}
                      {moreCount > 0 && (
                        <Typography variant="caption" sx={{ fontSize: '0.5625rem', color: 'text.secondary' }}>
                          +{moreCount} more
                        </Typography>
                      )}
                    </Box>
                  );
                });
              })()}
            </Box>
          </Card>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── SUMMARY CARDS ────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        {/* Your week at a glance */}
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
            Your week at a glance
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '0.5rem', bgcolor: 'var(--gl-cal-session-scheduled-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarMonthIcon sx={{ fontSize: 16, color: 'var(--gl-cal-session-scheduled-border)' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>{weekStats.total}</Typography>
                <Typography variant="caption" color="text.secondary">Events</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '0.5rem', bgcolor: 'var(--gl-cal-session-confirmed-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TaskAltIcon sx={{ fontSize: 16, color: 'var(--gl-cal-session-confirmed-border)' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>{weekStats.confirmedCount}</Typography>
                <Typography variant="caption" color="text.secondary">Confirmed</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '0.5rem', bgcolor: 'var(--gl-cal-request-pending-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AccessTimeIcon sx={{ fontSize: 16, color: 'var(--gl-cal-request-pending-border)' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>{weekStats.pendingReqs}</Typography>
                <Typography variant="caption" color="text.secondary">Pending requests</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '0.5rem', bgcolor: 'var(--gl-cal-avail-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarMonthIcon sx={{ fontSize: 16, color: 'var(--gl-cal-avail-border, rgb(34,197,94))' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>{weekStats.availSlots}</Typography>
                <Typography variant="caption" color="text.secondary">Available slots</Typography>
              </Box>
            </Box>
          </Box>
        </Card>

        {/* Needs your attention */}
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
            Needs your attention
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {weekStats.unconfirmedCount > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ErrorOutlineIcon sx={{ fontSize: 16, color: 'var(--gl-cal-session-scheduled-border)' }} />
                  <Typography variant="body2">
                    {weekStats.unconfirmedCount} unconfirmed event{weekStats.unconfirmedCount > 1 ? "s" : ""}
                  </Typography>
                </Box>
              </Box>
            )}
            {weekStats.pendingReqs > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ErrorOutlineIcon sx={{ fontSize: 16, color: 'var(--gl-warning-icon)' }} />
                  <Typography variant="body2">
                    {weekStats.pendingReqs} pending request{weekStats.pendingReqs > 1 ? "s" : ""}
                  </Typography>
                </Box>
              </Box>
            )}
            {weekStats.unconfirmedCount === 0 && weekStats.pendingReqs === 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                <TaskAltIcon sx={{ fontSize: 16, color: 'var(--gl-cal-avail-border, rgb(34,197,94))' }} />
                <Typography variant="body2" color="text.secondary">
                  All caught up! No actions needed.
                </Typography>
              </Box>
            )}
          </Box>
        </Card>
      </Box>

      {/* ── Mobile FAB ────────────────────────────────────────────────────── */}
      <SpeedDial
        ariaLabel="Calendar actions"
        icon={<SpeedDialIcon />}
        sx={{
          display: { xs: "flex", sm: "none" },
          position: "fixed",
          bottom: "calc(4.5rem + env(safe-area-inset-bottom))",
          right: 20,
          zIndex: 25,
        }}
      >
        <SpeedDialAction
          icon={<EventBusyIcon />}
          tooltipTitle="Mark leave"
          tooltipOpen
          onClick={() => dispatch(setOpenNotAvailable(true))}
          sx={{ "& .MuiSpeedDialAction-staticTooltipLabel": { whiteSpace: "nowrap" } }}
        />
        <SpeedDialAction
          icon={<EditCalendarIcon />}
          tooltipTitle="Add availability"
          tooltipOpen
          onClick={() => dispatch(setOpenAvailability(true))}
          sx={{ "& .MuiSpeedDialAction-staticTooltipLabel": { whiteSpace: "nowrap" } }}
        />
      </SpeedDial>
    </>
  );
}
