import { useCallback, useState, useRef, useEffect, useMemo } from "react";

import EventBusyIcon from "@mui/icons-material/EventBusy";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LanguageIcon from "@mui/icons-material/Language";
import EventNoteIcon from "@mui/icons-material/EventNote";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import Popover from "@mui/material/Popover";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import CheckIcon from "@mui/icons-material/Check";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { keyframes } from "@mui/system";
import { useAppSelector, useAppDispatch } from "@/store";
import { setCalendarViewMode, setAnchorDate, type CalendarViewMode } from "@/store/slices/calendarSlice";
import { setSessionFocus, clearRecentlyConfirmed } from "@/store/slices/sessionsSlice";
import { setRequestFocus } from "@/store/slices/requestsSlice";
import { addOneOffAvail } from "@/store/slices/availabilitySlice";
import {
  setOpenSession,
  setOpenSessionDetails,
  setOpenCompletedSession,
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
  getTimeZoneOffsetMinutes,
  formatGMTOffsetFromMinutesAhead,
  getLocaleFromTimezone,
} from "@/lib/helpers";
import { DOW, DOW_LONG, demoNow } from "@/lib/constants";
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

/** Full-day time range for the calendar grid (midnight to midnight). */
const CAL_START = 0;       // 00:00
const CAL_END = 24 * 60;   // 24:00 (midnight - includes 11 PM–12 AM slot)

/** Convert minutes-since-midnight to a percentage within the visible grid. */
function timeToPercent(mins: number) {
  return ((mins - CAL_START) / (CAL_END - CAL_START)) * 100;
}

/** Hours to render on the time axis (12 AM … 11 PM - 24 rows). */
const HOUR_LABELS: number[] = (() => {
  const arr: number[] = [];
  for (let m = CAL_START; m < CAL_END; m += 60) arr.push(m);
  return arr;
})();

/** Shared sizing constants */
const GRID_ROW_PX = 42;
/** Default scroll target: 8 AM row */
const DEFAULT_SCROLL_HOUR = 8;

/** Format a Date as "Feb 16" */
function fmtShortDate(d: Date, locale?: string) {
  return d.toLocaleDateString(locale ?? undefined, { month: "short", day: "numeric" });
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
  const userLocale = getLocaleFromTimezone(effectiveTz);
  const patterns = useAppSelector((s) => s.availability.patterns);
  const oneOffAvail = useAppSelector((s) => s.availability.oneOffAvail);
  const unavailable = useAppSelector((s) => s.availability.unavailable);
  const removedAvailabilityIds = useAppSelector((s) => s.availability.removedAvailabilityIds);
  const hasUserConfiguredAvailability = useAppSelector((s) => s.availability.hasUserConfiguredAvailability);
  const guruStage = useAppSelector((s) => s.devPanel.guruStage);
  const isEmpty = guruStage === "empty";
  const requests = useAppSelector((s) => s.requests.items);
  /* ── memoized selectors (§7) ──────────────────────────────────────────── */
  const anchorDate = useAppSelector(selectAnchorDate);
  const weekStart = useAppSelector(selectWeekStart);
  const monthStart = useAppSelector(selectMonthStart);
  const weekDays = useAppSelector(selectWeekDays);
  const rangeDays = useAppSelector((s) => s.availability.rangeDays);
  // Availability horizon is relative to *today* (not a fixed demo date), so the
  // current period is never rendered as disabled when viewed at the real date.
  const rangeEndYmd = toYmd(addDays(realNow, rangeDays));
  const _sessionsThisWeek = useAppSelector(selectSessionsThisWeek);
  const _requestsThisWeek = useAppSelector(selectRequestsThisWeek);
  const _busyThisWeek = useAppSelector(selectBusyThisWeek);
  const sessionsThisWeek = isEmpty ? [] : _sessionsThisWeek;
  const requestsThisWeek = isEmpty ? [] : _requestsThisWeek;
  const busyThisWeek = isEmpty ? [] : _busyThisWeek;
  const isCurrentPeriod = useAppSelector(selectIsCurrentPeriod);

  /* ── navigation ───────────────────────────────────────────────────────── */
  const isWeekLike = calendarViewMode !== "month";
  const navPrev = () => {
    if (calendarViewMode === "day") {
      dispatch(setAnchorDate(addDays(anchorDate, -1).toISOString()));
    } else if (isWeekLike) {
      dispatch(setAnchorDate(addDays(anchorDate, -7).toISOString()));
    } else {
      dispatch(setAnchorDate(addMonths(anchorDate, -1).toISOString()));
    }
  };
  const navNext = () => {
    if (calendarViewMode === "day") {
      dispatch(setAnchorDate(addDays(anchorDate, 1).toISOString()));
    } else if (isWeekLike) {
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

  /* ── View mode menu ──────────────────────────────────────────────── */
  const [viewMenuAnchor, setViewMenuAnchor] = useState<HTMLElement | null>(null);
  const VIEW_OPTIONS: { value: CalendarViewMode; label: string }[] = [
    { value: "weekend", label: "Weekend" },
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
  ];
  const viewLabel = VIEW_OPTIONS.find((v) => v.value === calendarViewMode)?.label ?? "Week";

  /* ── Popover anchor refs ──────────────────────────────────────────── */
  const [leaveAnchorEl, setLeaveAnchorEl] = useState<HTMLElement | null>(null);
  const [availAnchorEl, setAvailAnchorEl] = useState<HTMLElement | null>(null);

  /* ── Drag-to-select spot availability (week/day time-grid) ────────── */
  const SPOT_SNAP = 30; // minutes
  const [dragSel, setDragSel] = useState<{ ymd: string; aMin: number; bMin: number } | null>(null);
  const dragColRef = useRef<HTMLElement | null>(null);
  // Pending selection awaiting confirmation (set on drag-release, committed on confirm).
  const [pendingSpot, setPendingSpot] = useState<{ ymd: string; start: number; end: number } | null>(null);
  const [spotConfirmPos, setSpotConfirmPos] = useState<{ top: number; left: number } | null>(null);

  // Earliest minute selectable on a given day. null → whole day is in the past.
  // Today is clamped to "now" (snapped up); future days start at midnight.
  const earliestSelectableMin = (ymd: string): number | null => {
    if (ymd < todayYmd) return null;
    if (ymd === todayYmd) {
      const nowMins = realNow.getHours() * 60 + realNow.getMinutes();
      return Math.min(Math.ceil(nowMins / SPOT_SNAP) * SPOT_SNAP, CAL_END);
    }
    return CAL_START;
  };

  // Snap a pointer's Y position (within a day column) to minutes-since-midnight,
  // clamped so a selection can never start before `floor` (the present).
  const minsFromPointer = (col: HTMLElement, clientY: number, floor: number) => {
    const rect = col.getBoundingClientRect();
    const frac = (clientY - rect.top) / rect.height;
    const raw = CAL_START + frac * (CAL_END - CAL_START);
    const snapped = Math.round(raw / SPOT_SNAP) * SPOT_SNAP;
    return Math.max(floor, Math.min(CAL_END, snapped));
  };

  const onColPointerDown = (e: React.PointerEvent<HTMLElement>, ymd: string) => {
    // Only start a drag on the empty column background, not on an event/avail block.
    if (e.target !== e.currentTarget || e.button !== 0) return;
    const floor = earliestSelectableMin(ymd);
    if (floor === null) return; // past day — not selectable
    const col = e.currentTarget;
    col.setPointerCapture(e.pointerId);
    dragColRef.current = col;
    const m = minsFromPointer(col, e.clientY, floor);
    setDragSel({ ymd, aMin: m, bMin: m });
  };
  const onColPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragSel || !dragColRef.current) return;
    const floor = earliestSelectableMin(dragSel.ymd) ?? CAL_START;
    const m = minsFromPointer(dragColRef.current, e.clientY, floor);
    setDragSel((d) => (d && m !== d.bMin ? { ...d, bMin: m } : d));
  };
  const onColPointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragSel) return;
    const floor = earliestSelectableMin(dragSel.ymd) ?? CAL_START;
    const start = Math.max(Math.min(dragSel.aMin, dragSel.bMin), floor);
    let end = Math.max(dragSel.aMin, dragSel.bMin);
    if (end - start < SPOT_SNAP) end = Math.min(start + SPOT_SNAP, CAL_END); // single click = one slot
    // Hold as pending; require a confirmation before locking it in.
    setPendingSpot({ ymd: dragSel.ymd, start, end });
    setSpotConfirmPos({ top: e.clientY, left: e.clientX });
    dragColRef.current = null;
    setDragSel(null);
  };

  const confirmSpot = () => {
    if (!pendingSpot) return;
    const { ymd, start, end } = pendingSpot;
    dispatch(addOneOffAvail({ id: `oneoff-${ymd}-${start}-${end}-${Date.now()}`, dateYmd: ymd, start, end }));
    setPendingSpot(null);
    setSpotConfirmPos(null);
  };
  const cancelSpot = () => {
    setPendingSpot(null);
    setSpotConfirmPos(null);
  };

  /* ── Auto-scroll to 8 AM on mount / view change ─────────────────── */
  const desktopGridRef = useRef<HTMLDivElement>(null);
  const mobileGridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scrollTo8AM = (el: HTMLDivElement | null) => {
      if (!el) return;
      el.scrollTop = DEFAULT_SCROLL_HOUR * GRID_ROW_PX;
    };
    scrollTo8AM(desktopGridRef.current);
    scrollTo8AM(mobileGridRef.current);
  }, [calendarViewMode]);

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

  /* ── Visible days based on view mode ─────────────────────────────── */
  const visibleDays = useMemo(() => {
    if (calendarViewMode === "day") {
      // Show only the anchor date's day in the week
      const anchorYmd = toYmd(anchorDate);
      const match = weekDays.find((d) => toYmd(d) === anchorYmd);
      return match ? [match] : [weekDays[0]];
    }
    if (calendarViewMode === "weekdays") {
      return weekDays.filter((d) => d.getDay() !== 0 && d.getDay() !== 6);
    }
    if (calendarViewMode === "weekend") {
      return weekDays.filter((d) => d.getDay() === 0 || d.getDay() === 6);
    }
    return weekDays; // "week"
  }, [calendarViewMode, weekDays, anchorDate]);

  const gridCols = visibleDays.length;

  // Sync mobile selected day when view mode changes
  useEffect(() => {
    const visibleYmds = visibleDays.map(toYmd);
    if (visibleYmds.length > 0 && !visibleYmds.includes(mobileSelectedDay)) {
      setMobileSelectedDay(visibleYmds[0]);
    }
  }, [visibleDays, mobileSelectedDay]);

  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: { md: "calc(100vh - 48px)" }, overflow: "hidden", gap: 2 }}>
      {/* ── Toolbar - single row ── */}
      <Stack direction="row" alignItems="center" sx={{ flexShrink: 0 }}>
        {/* LEFT */}
        <Stack direction="row" alignItems="center" sx={{ gap: 1 }}>
          <Typography variant="h6" sx={{ display: { xs: "none", sm: "block" }, fontWeight: 700, fontSize: "1.25rem" }}>Calendar</Typography>
          <Button
            variant="outlined"
            size="small"
            sx={{ textTransform: "none", fontSize: "0.78rem", fontWeight: 500, height: 32, px: 1.5, borderColor: "divider", color: "text.primary" }}
            onClick={() => { dispatch(setAnchorDate(realNow.toISOString())); if (calendarViewMode === "weekend") dispatch(setCalendarViewMode("week")); }}
          >
            Today
          </Button>
          {/* Desktop: view dropdown in left group */}
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Button
              variant="outlined"
              size="small"
              endIcon={<ArrowDropDownIcon sx={{ fontSize: 18 }} />}
              onClick={(e) => setViewMenuAnchor(e.currentTarget)}
              sx={{ textTransform: "none", fontSize: "0.78rem", fontWeight: 600, height: 32, px: 1.5, borderColor: "divider", color: "text.primary", minWidth: 90, justifyContent: "space-between" }}
            >
              {viewLabel}
            </Button>
          </Box>
        </Stack>

        {/* CENTER - date nav */}
        <Stack direction="row" alignItems="center" justifyContent="center" sx={{ flex: 1, gap: 0.5 }}>
          <Button variant="text" size="small" aria-label="Previous" sx={{ minWidth: 0, height: 32, width: 32, p: 0, color: "text.secondary", borderRadius: "50%", "&:hover": { bgcolor: "action.hover" } }} onClick={navPrev}>
            <ChevronLeftIcon sx={{ fontSize: 22 }} />
          </Button>
          <Typography sx={{ fontSize: { xs: "0.82rem", sm: "0.95rem" }, fontWeight: 600, whiteSpace: "nowrap" }}>
            {calendarViewMode === "month"
              ? monthLabel(anchorDate, userLocale)
              : calendarViewMode === "day"
                ? anchorDate.toLocaleDateString(userLocale, { weekday: "short", month: "short", day: "numeric" })
                : weekLabel(anchorDate, userLocale)}
          </Typography>
          <Button variant="text" size="small" aria-label="Next" sx={{ minWidth: 0, height: 32, width: 32, p: 0, color: "text.secondary", borderRadius: "50%", "&:hover": { bgcolor: "action.hover" } }} onClick={navNext}>
            <ChevronRightIcon sx={{ fontSize: 22 }} />
          </Button>
        </Stack>

        {/* RIGHT */}
        {/* Mobile: view dropdown */}
        <Box sx={{ display: { xs: "block", sm: "none" } }}>
          <Button
            variant="outlined"
            size="small"
            endIcon={<ArrowDropDownIcon sx={{ fontSize: 18 }} />}
            onClick={(e) => setViewMenuAnchor(e.currentTarget)}
            sx={{ textTransform: "none", fontSize: "0.78rem", fontWeight: 600, height: 32, px: 1.5, borderColor: "divider", color: "text.primary", minWidth: 80, justifyContent: "space-between" }}
          >
            {viewLabel}
          </Button>
        </Box>
        {/* Desktop: Leave + Edit availability */}
        <Stack direction="row" spacing={1.5} sx={{ display: { xs: "none", sm: "flex" } }}>
          <Button variant="soft" size="small" startIcon={<EventBusyIcon sx={{ fontSize: 14 }} />} sx={{ textTransform: "none", fontSize: "0.78rem", height: 32, px: 1.5 }} onClick={() => dispatch(setOpenNotAvailable(true))}>Leave</Button>
          <Button variant="contained" size="small" startIcon={<EditCalendarIcon sx={{ fontSize: 14 }} />} sx={{ textTransform: "none", fontSize: "0.78rem", height: 32, px: 1.5 }} onClick={() => dispatch(setOpenAvailability(true))}>{hasUserConfiguredAvailability ? "Edit availability" : "Add availability"}</Button>
        </Stack>
      </Stack>

      {/* View mode menu (shared) */}
      <Menu
        anchorEl={viewMenuAnchor}
        open={Boolean(viewMenuAnchor)}
        onClose={() => setViewMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { minWidth: 160, mt: 0.5 } } }}
      >
        {VIEW_OPTIONS.map((opt) => (
          <Box key={opt.value}>
            {opt.value === "day" && <Divider sx={{ my: 0.5 }} />}
            <MenuItem selected={calendarViewMode === opt.value} onClick={() => { dispatch(setCalendarViewMode(opt.value)); setViewMenuAnchor(null); }} sx={{ fontSize: "0.85rem", py: 0.75 }}>
              {calendarViewMode === opt.value && <CheckIcon sx={{ fontSize: 16, mr: 1, color: "primary.main" }} />}
              <ListItemText sx={{ ml: calendarViewMode === opt.value ? 0 : 3.5 }}>{opt.label}</ListItemText>
            </MenuItem>
          </Box>
        ))}
      </Menu>

      {/* ── Availability gate ─────────────────────────────────────────── */}
      {!hasUserConfiguredAvailability && (
        <Box
          sx={{
            mt: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            py: 10,
            borderRadius: "12px",
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
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
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
      {hasUserConfiguredAvailability && isWeekLike && (
        <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          {/* ── Mobile time-grid view (below md) ────────────────────────── */}
          <Box sx={{ display: { md: "none" } }}>

            {/* Day strip - respects view mode (day/weekend/week) */}
            <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${visibleDays.length}, 1fr)`, mb: 1.5 }}>
              {visibleDays.map((d, i) => {
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
                      {DOW[d.getDay() === 0 ? 6 : d.getDay() - 1]}
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
            <Card variant="outlined" sx={{ overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box ref={mobileGridRef} sx={{ overflowY: 'auto', flex: 1, minHeight: 0, position: 'relative' }}>
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
                        gridTemplateColumns: '62px 1fr',
                        borderTop: idx > 0 ? 1 : 0,
                        borderColor: 'divider',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontWeight: 500, pt: 0.5, pr: 1, textAlign: 'right', fontSize: '0.65rem', whiteSpace: 'nowrap' }}
                      >
                        {fmtTime12(mins)}
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
                          onClick={() => { dispatch(setSessionFocus(s)); dispatch(setOpenSessionDetails(true)); }}
                          sx={{
                            position: 'absolute',
                            top: `${topPct}%`,
                            height: `${blockHeight}%`,
                            left: 52,
                            right: 4,
                            bgcolor: sColors.bg,
                            borderRadius: '8px',
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
                            {fmtTime12(s.start)}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: sColors.text, fontWeight: 700, lineHeight: '16px' }} noWrap>
                            {s.title}
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
                            borderRadius: '8px',
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
                            {fmtTime12(r.start)}
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
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              border: 1,
              borderColor: 'divider',
              borderRadius: "12px",
              bgcolor: 'background.paper',
              overflow: 'hidden',
              boxShadow: 'none',
              flex: 1,
              minHeight: 0,
            }}
          >

            {/* Time grid body - scrollable, auto-scrolled to 8 AM. Header is inside scroll container so columns align perfectly. */}
            <Box ref={desktopGridRef} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', scrollbarWidth: 'thin' }}>
              {/* Day-of-week header row - sticky inside scroll */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: `56px repeat(${gridCols}, 1fr)`,
                  borderBottom: 1,
                  borderColor: 'divider',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  bgcolor: 'background.paper',
                }}
              >
                <Box /> {/* time gutter */}
                {visibleDays.map((d) => {
                  const ymd = toYmd(d);
                  const isToday = ymd === toYmd(realNow);
                  const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
                  return (
                    <Box
                      key={ymd}
                      sx={{
                        py: 1.25,
                        textAlign: 'center',
                        borderLeft: 1,
                        borderColor: 'divider',
                      }}
                      aria-label={`${DOW_LONG[dayIdx]} ${d.getDate()}`}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          color: isToday ? 'primary.main' : 'text.disabled',
                          fontSize: '0.65rem',
                        }}
                      >
                        {DOW[dayIdx]}
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          ml: 0.75,
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          ...(isToday
                            ? {
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                borderRadius: '50%',
                                width: 24,
                                height: 24,
                              }
                            : {
                                color: 'text.primary',
                              }),
                        }}
                      >
                        {d.getDate()}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: `56px repeat(${gridCols}, 1fr)`,
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
                          width: 52,
                          textAlign: 'right',
                          pr: 0.5,
                          top,
                          transform: isFirst ? 'none' : isLast ? 'translateY(-100%)' : 'translateY(-50%)',
                          color: 'text.disabled',
                          fontSize: '0.62rem',
                          fontWeight: 500,
                          fontVariantNumeric: 'tabular-nums',
                          userSelect: 'none',
                          letterSpacing: '0.01em',
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
                          bgcolor: isFirst ? 'transparent' : 'divider',
                          opacity: 0.6,
                        }}
                      />
                    </Box>
                  );
                })}

                {/* ── Day columns with overlap handling (§8.3) ──────────── */}
                {visibleDays.map((d, colIdx) => {
                  const ymd = toYmd(d);
                  const dayLongIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
                  const dayLong = DOW_LONG[dayLongIdx];

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

                  // Declined sessions - their time slots
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

                  // Compute side-by-side column layout using ALL sessions (including declined)
                  // so that positions remain stable when a session is marked unavailable.
                  const combinedLayout = computeEventLayout([
                    ...daySessions.map((s) => ({ id: `sess-${s.id}`, start: s.start, end: s.end })),
                    ...dayRequests.map((r) => ({ id: `req-${r.id}`, start: r.start, end: r.end })),
                  ]);

                  const colIsToday = toYmd(d) === toYmd(realNow);
                  // Past region (not selectable for availability): whole column for past
                  // days, midnight→now for today.
                  const isPastDay = ymd < todayYmd;
                  const pastEndMin = isPastDay
                    ? CAL_END
                    : colIsToday
                    ? Math.min(realNow.getHours() * 60 + realNow.getMinutes(), CAL_END)
                    : 0;
                  return (
                    <Box
                      key={colIdx}
                      onPointerDown={(e) => onColPointerDown(e, ymd)}
                      onPointerMove={onColPointerMove}
                      onPointerUp={onColPointerUp}
                      sx={{
                        position: 'relative',
                        gridColumn: colIdx + 2,
                        gridRow: 1,
                        borderLeft: 1,
                        borderColor: 'divider',
                        bgcolor: colIsToday ? 'hsl(var(--md-primary) / 0.03)' : 'transparent',
                        cursor: isPastDay ? 'default' : 'cell',
                        touchAction: 'none',
                        userSelect: 'none',
                      }}
                    >
                      {/* Past time — dimmed, not available for selection */}
                      {pastEndMin > 0 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            height: `${timeToPercent(pastEndMin)}%`,
                            bgcolor: 'action.disabledBackground',
                            opacity: 0.5,
                            zIndex: 0,
                            pointerEvents: 'none',
                          }}
                        />
                      )}

                      {/* Drag-to-select spot-availability preview (live drag or pending confirmation) */}
                      {(dragSel?.ymd === ymd || pendingSpot?.ymd === ymd) && (() => {
                        const s = dragSel?.ymd === ymd
                          ? Math.min(dragSel.aMin, dragSel.bMin)
                          : pendingSpot!.start;
                        const e2 = dragSel?.ymd === ymd
                          ? Math.max(dragSel.aMin, dragSel.bMin)
                          : pendingSpot!.end;
                        const top = timeToPercent(s);
                        const h = timeToPercent(Math.max(e2, s + SPOT_SNAP)) - top;
                        return (
                          <Box
                            sx={{
                              position: 'absolute',
                              left: 0,
                              right: 0,
                              top: `${top}%`,
                              height: `${h}%`,
                              bgcolor: 'var(--gl-cal-avail-bg)',
                              border: '1.5px solid',
                              borderColor: 'success.main',
                              borderRadius: '8px',
                              zIndex: 8,
                              pointerEvents: 'none',
                              px: 0.5,
                              pt: 0.25,
                              overflow: 'hidden',
                            }}
                          >
                            <Typography sx={{ fontSize: 10, fontWeight: 700, color: 'success.dark' }} noWrap>
                              {fmtTime12(s)} – {fmtTime12(Math.max(e2, s + SPOT_SNAP))}
                            </Typography>
                          </Box>
                        );
                      })()}

                      {/* Current time indicator - today column only */}
                      {colIsToday && (() => {
                        const nowMins = realNow.getHours() * 60 + realNow.getMinutes();
                        if (nowMins < CAL_START || nowMins > CAL_END) return null;
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
                            borderRadius: '8px',
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

                      {/* §8.2 Draw order: 2. Leave (unavailable) - dashed border */}
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
                            borderRadius: '8px',
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

                      {/* §8.2 Draw order: 3. Availability placeholders - dashed emerald */}
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
                              borderRadius: '8px',
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

                      {/* One-off availability blocks - dashed emerald */}
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
                              borderRadius: '8px',
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
                              left: `calc(${rLeftPct}% + 2px)`,
                              width: `calc(${rWidthPct}% - ${rNumCols > 1 ? 4 : 4}px)`,
                              top: `${timeToPercent(r.start)}%`,
                              height: `${timeToPercent(r.end) - timeToPercent(r.start)}%`,
                              bgcolor: rColors.bg,
                              border: `1.5px dashed ${rColors.border}`,
                              borderRadius: '8px',
                              zIndex: 4,
                              px: 0.75,
                              pt: 0.5,
                              textAlign: 'left',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              fontFamily: 'inherit',
                              transition: 'box-shadow 0.2s ease',
                              '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
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

                      {/* §8.2 Draw order: 5. Sessions (top) - with status dot + pulse */}
                      {daySessions.map((s) => {
                        const declined = !!sessionDeclined[s.id];
                        const confirmed = !!confirmations[s.id];
                        const isPastSession = s.dateYmd < todayYmd || (s.dateYmd === todayYmd && s.start < realNow.getHours() * 60 + realNow.getMinutes());
                        const isCompletedSession = isPastSession && confirmed;
                        const isMissedSession = isPastSession && !confirmed && !declined;
                        const sColors = isMissedSession
                          ? { bg: "var(--gl-status-missed-bg)", border: "var(--gl-status-missed-border)", text: "var(--gl-status-missed-text)", sub: "var(--gl-status-missed-sub)" }
                          : isCompletedSession
                            ? { bg: "var(--gl-status-completed-bg)", border: "var(--gl-status-completed-border)", text: "var(--gl-status-completed-text)", sub: "var(--gl-status-completed-text)" }
                            : sessionColors(confirmed, declined);
                        const statusLabel = declined
                          ? "Declined"
                          : isCompletedSession
                            ? "Completed"
                            : isMissedSession
                              ? "Missed"
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
                              if (isCompletedSession) {
                                dispatch(setOpenCompletedSession(true));
                              } else {
                                dispatch(setOpenSessionDetails(true));
                              }
                            }}
                            aria-label={`${statusLabel} session: ${s.title}, ${fmtTime12(s.start)} to ${fmtTime12(s.end)}`}
                            sx={{
                              position: 'absolute',
                              left: `calc(${leftPct}% + 2px)`,
                              width: `calc(${widthPct}% - ${numCols > 1 ? 4 : 4}px)`,
                              top: `${timeToPercent(s.start)}%`,
                              height: `${blockHeight}%`,
                              bgcolor: sColors.bg,
                              border: 'none',
                              borderRadius: '8px',
                              zIndex: 5,
                              px: 0.75,
                              pt: 0.5,
                              pb: 0.5,
                              textAlign: 'left',
                              cursor: 'pointer',
                              textDecoration: declined ? 'line-through' : 'none',
                              opacity: 1,
                              overflow: 'hidden',
                              fontFamily: 'inherit',
                              transition: 'box-shadow 0.2s ease, transform 0.15s ease',
                              '&:hover': {
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                transform: 'scale(1.01)',
                              },
                              ...(isRecentlyConfirmed && {
                                animation: `${confirmPulse} 0.8s ease-in-out 2`,
                              }),
                            }}
                          >
                            {/* Title */}
                            <Typography
                              sx={{ fontSize: '0.68rem', fontWeight: 600, color: sColors.text, lineHeight: 1.3 }}
                              noWrap
                            >
                              {s.title}
                            </Typography>
                            {/* Time */}
                            <Typography
                              sx={{ fontSize: '0.58rem', fontWeight: 500, color: sColors.sub, lineHeight: '14px', mt: 0.25 }}
                              noWrap
                            >
                              {fmtTimeLabel(s.start)} – {fmtTimeLabel(s.end)}
                            </Typography>
                            {pxHeight > 56 && (
                              <Typography
                                sx={{ fontSize: '0.56rem', color: sColors.sub, mt: 0.25, lineHeight: '1.2', opacity: 0.8 }}
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

            {/* ── Legend + timezone bar - inside calendar card ── */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: 1,
                borderColor: 'divider',
                py: 0.75,
                px: 2,
                flexShrink: 0,
              }}
            >
              {/* Left: legend dots */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.25, md: 2 }, flexWrap: 'wrap' }}>
                {[
                  { color: 'var(--gl-cal-session-scheduled-border)', label: 'Scheduled', dot: true },
                  { color: 'var(--gl-cal-session-confirmed-border)', label: 'Confirmed', dot: true },
                  { color: 'var(--gl-status-completed-text)', label: 'Completed', dot: true },
                  { color: 'var(--gl-status-missed-text)', label: 'Missed', dot: true },
                  { color: 'var(--gl-cal-session-declined-border)', label: 'Declined', dot: true },
                  { color: 'var(--gl-cal-avail-border, rgb(34,197,94))', label: 'Available', dashed: true },
                  { color: 'var(--gl-cal-leave-border, rgb(244,63,94))', label: 'Leave', dashed: true },
                ].map((item) => (
                  <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {'dot' in item && item.dot ? (
                      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: item.color, flexShrink: 0 }} />
                    ) : (
                      <Box sx={{ width: 7, height: 7, borderRadius: '50%', border: `1.5px dashed ${item.color}`, flexShrink: 0 }} />
                    )}
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.62rem' }}>
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Right: timezone */}
              <Chip
                icon={<LanguageIcon sx={{ fontSize: 13 }} />}
                label={`${effectiveTz} (${formatGMTOffsetFromMinutesAhead(getTimeZoneOffsetMinutes(effectiveTz, demoNow))})`}
                size="small"
                variant="outlined"
                onClick={() => dispatch(setOpenTimezone(true))}
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  height: 26,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  borderColor: "primary.main",
                  color: "primary.main",
                  "& .MuiChip-icon": { color: "primary.main" },
                  "&:hover": {
                    bgcolor: "hsl(var(--md-primary) / 0.08)",
                    borderColor: "primary.dark",
                  },
                }}
              />
            </Box>
          </Box>

          {/* ── Popovers ─────────────────────────────────────────────── */}
          <LeavePopover anchorEl={leaveAnchorEl} />
          <AvailabilityPopover anchorEl={availAnchorEl} blocks={allAvailBlocks} />

          {/* Confirm drag-selected spot availability */}
          <Popover
            open={!!pendingSpot && !!spotConfirmPos}
            anchorReference="anchorPosition"
            anchorPosition={spotConfirmPos ?? { top: 0, left: 0 }}
            onClose={cancelSpot}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            slotProps={{ paper: { sx: { borderRadius: '12px', p: 2, width: 248 } } }}
          >
            {pendingSpot && (
              <>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary' }}>
                  Mark yourself available?
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>
                  {fmtShortDate(new Date(`${pendingSpot.ymd}T00:00:00`), userLocale)}
                </Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'success.dark', mt: 0.25 }}>
                  {fmtTime12(pendingSpot.start)} – {fmtTime12(pendingSpot.end)}
                </Typography>
                <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 1.75 }}>
                  <Button size="small" color="inherit" onClick={cancelSpot} sx={{ fontSize: 12 }}>
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    disableElevation
                    onClick={confirmSpot}
                    sx={{ fontSize: 12 }}
                  >
                    Confirm
                  </Button>
                </Stack>
              </>
            )}
          </Popover>
        </Box>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── MONTH VIEW ────────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {hasUserConfiguredAvailability && calendarViewMode === "month" && (
        <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          <Card variant="outlined" sx={{ p: { xs: 1, md: 2 }, overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', borderRadius: "16px", bgcolor: 'background.paper', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)' }}>
            {/* §9.1 Sunday-first visual month grid - but we use Monday-first to match week view DOW header */}
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
                    const shortTitle = s.title;
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
                            borderRadius: "8px",
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
        </Box>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── SUMMARY CARDS ────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── Week at a glance ──────────────────────────────────────────── */}
      <Box sx={{ flexShrink: 0 }}>
        <Typography variant="caption" fontWeight={600} color="text.disabled" sx={{ letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "0.65rem", mb: 1, display: "block" }}>
          This week
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(5, 1fr)" }, gap: 1 }}>
          {[
            { value: weekStats.total, label: "Events", color: "text.primary" },
            { value: weekStats.confirmedCount, label: "Confirmed", color: "success.main" },
            { value: weekStats.unconfirmedCount, label: "Unconfirmed", color: weekStats.unconfirmedCount > 0 ? "warning.main" : "text.secondary" },
            { value: weekStats.pendingReqs, label: "Pending", color: weekStats.pendingReqs > 0 ? "info.main" : "text.secondary" },
            { value: weekStats.availSlots, label: "Slots open", color: "text.secondary" },
          ].map((s) => (
            <Box
              key={s.label}
              sx={{
                py: 1.25,
                px: 1.5,
                borderRadius: "12px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 500, color: "text.secondary" }}>{s.label}</Typography>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: s.color, fontVariantNumeric: "tabular-nums" }}>{s.value}</Typography>
            </Box>
          ))}
        </Box>
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
          tooltipTitle={hasUserConfiguredAvailability ? "Edit availability" : "Add availability"}
          tooltipOpen
          onClick={() => dispatch(setOpenAvailability(true))}
          sx={{ "& .MuiSpeedDialAction-staticTooltipLabel": { whiteSpace: "nowrap" } }}
        />
      </SpeedDial>
    </Box>
  );
}
