import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, ChevronDown, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
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
  setOpenAvailabilityNudge,
  setLeavePopoverNaId,
  setAvailPopoverBlockId,
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

  /* ── redux state ──────────────────────────────────────────────────────── */
  const sessions = useAppSelector((s) => s.sessions.items);
  const confirmations = useAppSelector((s) => s.sessions.confirmations);
  const sessionDeclined = useAppSelector((s) => s.sessions.sessionDeclined);
  const recentlyConfirmedIds = useAppSelector((s) => s.sessions.recentlyConfirmedIds);
  const calendarViewMode = useAppSelector((s) => s.calendar.calendarViewMode);
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
    dispatch(setAnchorDate(demoNow.toISOString()));
  };

  /* ── Month picker dropdown ────────────────────────────────────────────── */
  const [monthMenuOpen, setMonthMenuOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const monthPickerRef = useRef<HTMLDivElement>(null);

  const openMonthMenu = () => {
    if (monthPickerRef.current) {
      const rect = monthPickerRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setMonthMenuOpen(true);
  };

  useEffect(() => {
    if (!monthMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(e.target as Node)) {
        setMonthMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [monthMenuOpen]);

  // Build list: 6 months back → 6 months forward from demoNow
  const monthOptions = Array.from({ length: 13 }, (_, i) => {
    const d = addMonths(demoNow, i - 6);
    return { label: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }), date: d };
  });

  // Build list: 13 weeks back → 13 weeks forward from demoNow (week view)
  const weekOptions = Array.from({ length: 27 }, (_, i) => {
    const d = addDays(demoNow, (i - 13) * 7);
    return { label: weekLabel(d), date: d };
  });

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

  /* ── First-visit nudge delay (§4E) ────────────────────────────────── */
  useEffect(() => {
    if (hasUserConfiguredAvailability) return;
    const timer = setTimeout(() => {
      dispatch(setOpenAvailabilityNudge(true));
    }, 800);
    return () => clearTimeout(timer);
  }, [hasUserConfiguredAvailability, dispatch]);

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
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" aria-hidden="true" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Calendar</Typography>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            size="small"
            aria-label="Mark leave"
            sx={{ textTransform: 'none' }}
            onClick={() => dispatch(setOpenNotAvailable(true))}
          >
            Mark leave
          </Button>
          <Button
            variant="outlined"
            size="small"
            aria-label="Quick add availability"
            sx={{ textTransform: 'none' }}
            onClick={() => dispatch(setOpenAddAvailability(true))}
          >
            + Add slot
          </Button>
          <Button
            variant="contained"
            size="small"
            aria-label="Add availability"
            sx={{ textTransform: 'none', bgcolor: 'text.primary', color: 'background.default', '&:hover': { bgcolor: 'text.secondary' } }}
            onClick={() => dispatch(setOpenAvailability(true))}
          >
            Set availability
          </Button>
        </div>
      </div>

      {/* ── View toggle + navigation ───────────────────────────────────── */}
      <div className="mt-4 flex items-center justify-between gap-3">
        {/* Left side: Week/Month toggle */}
        <Box
          sx={{
            display: 'inline-flex',
            gap: 0.5,
            border: 1,
            borderColor: 'divider',
            borderRadius: '4px',
            p: 0.5,
          }}
        >
          {(["week", "month"] as const).map((mode) => (
            <Button
              key={mode}
              variant={calendarViewMode === mode ? "contained" : "text"}
              size="small"
              sx={{
                fontSize: '0.8rem',
                textTransform: 'capitalize',
                minWidth: 64,
                px: 2,
              }}
              onClick={() => dispatch(setCalendarViewMode(mode))}
              aria-label={`Switch to ${mode} view`}
            >
              {mode}
            </Button>
          ))}
        </Box>

        {/* Right side: date label + Prev/Next */}
        <div className="flex items-center gap-2">
          <div ref={monthPickerRef} style={{ position: 'relative' }}>
            <Chip
              label={
                <span className="flex items-center gap-1">
                  {calendarViewMode === "week" ? weekLabel(anchorDate) : monthLabel(anchorDate)}
                  <ChevronDown className="h-3.5 w-3.5" style={{ transform: monthMenuOpen ? 'rotate(180deg)' : undefined, transition: 'transform 0.15s' }} />
                </span>
              }
              variant="outlined"
              onClick={() => monthMenuOpen ? setMonthMenuOpen(false) : openMonthMenu()}
              sx={{ borderRadius: '4px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
            />
            {monthMenuOpen && (
              <Box
                sx={{
                  position: 'fixed',
                  top: dropdownPos.top,
                  right: dropdownPos.right,
                  zIndex: 1300,
                  minWidth: calendarViewMode === "week" ? 220 : 180,
                  maxHeight: 320,
                  overflowY: 'auto',
                  borderRadius: 0.25,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                {(calendarViewMode === "week" ? weekOptions : monthOptions).map(({ label, date }) => {
                  const isSelected = (calendarViewMode === "week" ? weekLabel(anchorDate) : monthLabel(anchorDate)) === label;
                  return (
                    <Box
                      key={label}
                      onClick={() => {
                        dispatch(setAnchorDate(date.toISOString()));
                        setMonthMenuOpen(false);
                      }}
                      sx={{
                        px: 2,
                        py: 1,
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: isSelected ? 600 : 400,
                        bgcolor: isSelected ? 'action.selected' : undefined,
                        color: isSelected ? 'primary.main' : 'text.primary',
                        '&:hover': {
                          bgcolor: isSelected ? 'action.selected' : 'action.hover',
                        },
                      }}
                    >
                      {label}
                    </Box>
                  );
                })}
              </Box>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outlined"
              size="small"
              aria-label="Previous period"
              sx={{ minWidth: 0, height: 36, width: 36, p: 0 }}
              onClick={navPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outlined"
              size="small"
              aria-label="Next period"
              sx={{ minWidth: 0, height: 36, width: 36, p: 0 }}
              onClick={navNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── WEEK VIEW ─────────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {calendarViewMode === "week" && (
        <>
          {/* ── Mobile list view (below md) ─────────────────────────────── */}
          <div className="mt-3 block md:hidden">
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((d, i) => {
                const ymd = toYmd(d);
                const daySessions = sessionsThisWeek.filter(
                  (s) => s.dateYmd === ymd && !sessionDeclined[s.id]
                );
                const dayRequests = requestsThisWeek.filter(
                  (r) => r.dateYmd === ymd && r.response === "pending"
                );
                const isToday = ymd === toYmd(demoNow);
                return (
                  <div key={i} className="min-h-[120px]">
                    <div className="mb-1 text-center">
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600, ...(isToday && { color: 'primary.main' }) }}
                      >
                        {DOW[i]}
                      </Typography>
                      <Box
                        sx={{
                          mx: 'auto',
                          mt: 0.5,
                          height: 24,
                          width: 24,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          ...(isToday && { bgcolor: 'primary.main', color: 'primary.contrastText' }),
                        }}
                      >
                        {d.getDate()}
                      </Box>
                    </div>
                    <div className="space-y-1">
                      {/* Sessions (§14: preserve status colors) */}
                      {daySessions.map((s) => {
                        const confirmed = !!confirmations[s.id];
                        const colors = sessionColors(confirmed, false);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            className="w-full rounded-lg px-1.5 py-1 text-left text-[10px] leading-tight transition-colors"
                            style={{ backgroundColor: colors.bg }}
                            onClick={() => {
                              dispatch(setSessionFocus(s));
                              dispatch(setOpenSession(true));
                            }}
                            aria-label={`Session: ${s.title}, ${fmtTime12(s.start)} to ${fmtTime12(s.end)}`}
                          >
                            <div className="font-medium truncate">
                              {s.title.replace("Mentor Session: ", "")}
                            </div>
                            <div style={{ color: "var(--mui-palette-text-secondary)" }}>
                              {fmtTime12(s.start)}
                            </div>
                          </button>
                        );
                      })}
                      {/* Requests on mobile */}
                      {dayRequests.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          className="w-full rounded-lg px-1.5 py-1 text-left text-[10px] leading-tight transition-colors"
                          style={{ backgroundColor: "var(--gl-cal-request-pending-bg)", border: "1px dashed var(--gl-cal-request-pending-border)" }}
                          onClick={() => {
                            dispatch(setRequestFocus(r));
                            dispatch(setOpenRequest(true));
                          }}
                          aria-label={`Request: ${r.title}, ${fmtTime12(r.start)} to ${fmtTime12(r.end)}`}
                        >
                          <div className="font-medium truncate">
                            {r.title}
                          </div>
                          <div style={{ color: "var(--mui-palette-text-secondary)" }}>
                            {fmtTime12(r.start)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Desktop time-grid view (md and above) ───────────────────── */}
          <Card variant="outlined" sx={{ mt: 2, overflow: 'hidden', display: { xs: 'none', md: 'block' }, height: CALENDAR_CARD_HEIGHT }}>
            {/* Header + body container — no internal scroll */}
            <Box sx={{ height: '100%' }}>
            {/* Day-of-week header row */}
            <Box
              sx={{
                zIndex: 10,
                bgcolor: 'background.paper',
                display: 'grid',
                gridTemplateColumns: '60px repeat(7, 1fr)',
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              {/* "Time" label */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Time
                </Typography>
              </Box>
              {weekDays.map((d, i) => {
                const ymd = toYmd(d);
                const isToday = ymd === toYmd(demoNow);
                return (
                  <Box
                    key={i}
                    sx={{
                      textAlign: 'center',
                      py: 1.5,
                      borderLeft: 1,
                      borderColor: 'divider',
                    }}
                    aria-label={`${DOW_LONG[i]} ${fmtShortDate(d)}`}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, ...(isToday && { color: 'primary.main' }) }}
                    >
                      {DOW[i]}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {fmtShortDate(d)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Time grid body */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '60px repeat(7, 1fr)',
                  position: 'relative',
                  height: HOUR_LABELS.length * GRID_ROW_PX,
                  mb: 1.5, // bottom breathing room for 20:00 label
                }}
              >
                {/* ── Time labels + horizontal grid lines ──────────────── */}
                {HOUR_LABELS.map((mins) => {
                  const top = `${timeToPercent(mins)}%`;
                  return (
                    <div key={mins} className="contents">
                      {/* time label */}
                      <Typography
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          left: 0,
                          width: 60,
                          textAlign: 'right',
                          pr: 1,
                          top,
                          transform: 'translateY(-50%)',
                          color: 'text.secondary',
                          fontSize: '0.65rem',
                        }}
                      >
                        {fmtTime(mins)}
                      </Typography>
                      {/* horizontal line */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top,
                          left: 60,
                          right: 0,
                          height: '1px',
                          bgcolor: 'divider',
                        }}
                      />
                    </div>
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

                  return (
                    <Box
                      key={colIdx}
                      sx={{
                        position: 'relative',
                        gridColumn: colIdx + 2,
                        gridRow: 1,
                        borderLeft: 1,
                        borderColor: 'divider',
                      }}
                    >
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
                              left: 0,
                              right: 0,
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
                              width: '100%',
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
                              left: 0,
                              right: 0,
                              top: `${timeToPercent(s.start)}%`,
                              height: `${blockHeight}%`,
                              bgcolor: sColors.bg,
                              borderLeft: '3px solid',
                              borderColor: sColors.border,
                              borderRadius: '12px',
                              zIndex: 5,
                              px: 0.5,
                              pt: 0.25,
                              textAlign: 'left',
                              cursor: 'pointer',
                              textDecoration: declined ? 'line-through' : 'none',
                              overflow: 'hidden',
                              border: 'none',
                              borderLeftWidth: '3px',
                              borderLeftStyle: 'solid',
                              width: '100%',
                              fontFamily: 'inherit',
                              ...(isRecentlyConfirmed && {
                                animation: `${confirmPulse} 0.8s ease-in-out 2`,
                              }),
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {/* Status dot */}
                              <Box
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  bgcolor: sColors.border,
                                  flexShrink: 0,
                                }}
                              />
                              <Typography
                                sx={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  lineHeight: '14px',
                                  color: sColors.text,
                                }}
                                noWrap
                              >
                                {statusLabel}
                              </Typography>
                            </Box>
                            <Typography
                              sx={{
                                fontSize: 10,
                                lineHeight: '14px',
                                color: sColors.text,
                              }}
                              noWrap
                            >
                              {s.title.replace("Mentor Session: ", "")}
                            </Typography>
                            {/* Show time only if block height > 36px */}
                            {pxHeight > 36 && (
                              <Typography
                                sx={{
                                  fontSize: 9,
                                  lineHeight: '12px',
                                  color: sColors.sub,
                                }}
                                noWrap
                              >
                                {fmtTime(s.start)}–{fmtTime(s.end)}
                              </Typography>
                            )}
                            {/* Show session type only if block height > 56px */}
                            {pxHeight > 56 && (
                              <Typography
                                sx={{
                                  fontSize: 9,
                                  lineHeight: '12px',
                                  color: sColors.sub,
                                  mt: 0.25,
                                }}
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
          </Card>

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
              <div key={item.label} className="flex items-center gap-1.5">
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
              </div>
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
      {calendarViewMode === "month" && (
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
                          ...(ymd === toYmd(demoNow) && {
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
                <CalendarDays style={{ width: 16, height: 16, color: 'var(--gl-cal-session-scheduled-border)' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>{weekStats.total}</Typography>
                <Typography variant="caption" color="text.secondary">Sessions</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '0.5rem', bgcolor: 'var(--gl-cal-session-confirmed-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--gl-cal-session-confirmed-border)' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>{weekStats.confirmedCount}</Typography>
                <Typography variant="caption" color="text.secondary">Confirmed</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '0.5rem', bgcolor: 'var(--gl-cal-request-pending-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock style={{ width: 16, height: 16, color: 'var(--gl-cal-request-pending-border)' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>{weekStats.pendingReqs}</Typography>
                <Typography variant="caption" color="text.secondary">Pending requests</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '0.5rem', bgcolor: 'var(--gl-cal-avail-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarDays style={{ width: 16, height: 16, color: 'var(--gl-cal-avail-border, rgb(34,197,94))' }} />
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
                  <AlertCircle style={{ width: 16, height: 16, color: 'var(--gl-cal-session-scheduled-border)' }} />
                  <Typography variant="body2">
                    {weekStats.unconfirmedCount} unconfirmed session{weekStats.unconfirmedCount > 1 ? "s" : ""}
                  </Typography>
                </Box>
              </Box>
            )}
            {weekStats.pendingReqs > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AlertCircle style={{ width: 16, height: 16, color: 'var(--gl-warning-icon)' }} />
                  <Typography variant="body2">
                    {weekStats.pendingReqs} pending request{weekStats.pendingReqs > 1 ? "s" : ""}
                  </Typography>
                </Box>
              </Box>
            )}
            {weekStats.unconfirmedCount === 0 && weekStats.pendingReqs === 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--gl-cal-avail-border, rgb(34,197,94))' }} />
                <Typography variant="body2" color="text.secondary">
                  All caught up! No actions needed.
                </Typography>
              </Box>
            )}
          </Box>
        </Card>
      </Box>
    </>
  );
}
