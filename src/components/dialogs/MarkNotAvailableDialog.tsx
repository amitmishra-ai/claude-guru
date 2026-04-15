import { useMemo, useState, useEffect, useRef } from "react";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useAppSelector, useAppDispatch } from "@/store";
import { setOpenNotAvailable } from "@/store/slices/uiSlice";
import {
  addUnavailable,
  setNaStartDate,
  setNaEndDate,
  setNaReason,
  setNaStart,
  setNaEnd,
  setEditingLeaveGroupId,
  removeUnavailableByGroupId,
} from "@/store/slices/availabilitySlice";
import { declineSession } from "@/store/slices/sessionsSlice";
import { respondToRequest } from "@/store/slices/requestsSlice";
import { pushToast } from "@/store/slices/toastsSlice";
import { TIME_START, TIME_END, timeOptions12 } from "@/lib/constants";
import { parseHHMM, fmtTime12, toYmd, addDays, hhmmFromMinutes, getLocaleFromTimezone } from "@/lib/helpers";
import type { NA } from "@/lib/types";

/**
 * §10: Multi-day leave segmentation helper.
 *
 * Given a date range with start/end times, create leave blocks per day segment:
 * - First day: start at selected start time, end at TIME_END (20:00)
 * - Middle days: full calendar window TIME_START (08:00) to TIME_END (20:00)
 * - Last day: start at TIME_START (08:00), end at selected end time
 * - Single day: start at selected start time, end at selected end time
 */
function generateLeaveSegments(
  startDateYmd: string,
  endDateYmd: string,
  startMins: number,
  endMins: number,
  reason: string
): Omit<NA, "id">[] {
  const segments: Omit<NA, "id">[] = [];
  const startDate = new Date(`${startDateYmd}T00:00:00`);
  const now = Date.now();

  // Single day
  if (startDateYmd === endDateYmd) {
    segments.push({
      dateYmd: startDateYmd,
      start: startMins,
      end: endMins,
      reason: reason || "Leave",
      createdAt: now,
    });
    return segments;
  }

  // Multi-day: iterate from start to end date
  let current = startDate;
  let dayIndex = 0;
  while (toYmd(current) <= endDateYmd) {
    const ymd = toYmd(current);
    const isFirst = ymd === startDateYmd;
    const isLast = ymd === endDateYmd;

    const segStart = isFirst ? startMins : TIME_START;
    const segEnd = isLast ? endMins : TIME_END;

    segments.push({
      dateYmd: ymd,
      start: segStart,
      end: segEnd,
      reason: reason || "Leave",
      createdAt: now + dayIndex, // unique createdAt per segment
    });

    current = addDays(current, 1);
    dayIndex++;
  }

  return segments;
}

/** Overlap predicate: aStart < bEnd && bStart < aEnd */
function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

export function MarkNotAvailableDialog() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.openNotAvailable);
  const naStartDate = useAppSelector((s) => s.availability.naStartDate);
  const naEndDate = useAppSelector((s) => s.availability.naEndDate);
  const naReason = useAppSelector((s) => s.availability.naReason);
  const naStart = useAppSelector((s) => s.availability.naStart);
  const naEnd = useAppSelector((s) => s.availability.naEnd);
  const sessions = useAppSelector((s) => s.sessions.items);
  const sessionDeclined = useAppSelector((s) => s.sessions.sessionDeclined);
  const requests = useAppSelector((s) => s.requests.items);
  const editingLeaveGroupId = useAppSelector((s) => s.availability.editingLeaveGroupId);
  const unavailable = useAppSelector((s) => s.availability.unavailable);

  const [autoDecline, setAutoDecline] = useState(true);
  const [step, setStep] = useState<1 | 2>(1);
  const [duration, setDuration] = useState<"full" | "first-half" | "second-half">("full");
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const timeZoneMode = useAppSelector((s) => s.profile.timeZoneMode);
  const manualTimeZone = useAppSelector((s) => s.profile.manualTimeZone);
  const userLocale = getLocaleFromTimezone(timeZoneMode === "manual" ? manualTimeZone : Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Sync duration → time values
  useEffect(() => {
    dispatch(setNaStart(duration === "second-half" ? "13:00" : "00:00"));
    dispatch(setNaEnd(duration === "first-half" ? "13:00" : "23:59"));
  }, [duration, dispatch]);

  /* ── Pre-fill when editing existing leave ───────────────────────── */
  useEffect(() => {
    if (open && editingLeaveGroupId) {
      const blocks = unavailable.filter((n) => n.groupId === editingLeaveGroupId);
      if (blocks.length > 0) {
        // Sort by date
        const sorted = [...blocks].sort((a, b) => a.dateYmd.localeCompare(b.dateYmd));
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        dispatch(setNaStartDate(first.dateYmd));
        dispatch(setNaEndDate(last.dateYmd));
        dispatch(setNaStart(hhmmFromMinutes(first.start)));
        dispatch(setNaEnd(hhmmFromMinutes(last.end)));
        dispatch(setNaReason(first.reason || ""));
      }
    }
  }, [open, editingLeaveGroupId]);

  /* ── Reset step when dialog opens/closes ────────────────────────── */
  useEffect(() => {
    if (!open) {
      setStep(1);
      setAutoDecline(true);
    }
  }, [open]);

  /* ── Validation (§10): end must be after start in datetime terms ── */
  const isValid = useMemo(() => {
    if (!naStartDate || !naEndDate) return false;
    if (naStartDate > naEndDate) return false;
    if (naStartDate === naEndDate) {
      return parseHHMM(naEnd) > parseHHMM(naStart);
    }
    return true;
  }, [naStartDate, naEndDate, naStart, naEnd]);

  /* ── §10: Detect overlapping scheduled sessions ─────────────────── */
  const todayYmd = toYmd(new Date());
  const conflictingSessions = useMemo(() => {
    if (!naStartDate || !naEndDate) return [];
    const segments = generateLeaveSegments(
      naStartDate,
      naEndDate,
      parseHHMM(naStart),
      parseHHMM(naEnd),
      ""
    );

    return sessions.filter((s) => {
      if (sessionDeclined[s.id]) return false;
      // Filter out past sessions
      if (s.dateYmd < todayYmd) return false;
      return segments.some(
        (seg) =>
          seg.dateYmd === s.dateYmd && overlaps(seg.start, seg.end, s.start, s.end)
      );
    });
  }, [sessions, sessionDeclined, naStartDate, naEndDate, naStart, naEnd, todayYmd]);

  /* ── §10: Detect overlapping pending requests ───────────────────── */
  const conflictingRequests = useMemo(() => {
    if (!naStartDate || !naEndDate) return [];
    const segments = generateLeaveSegments(
      naStartDate,
      naEndDate,
      parseHHMM(naStart),
      parseHHMM(naEnd),
      ""
    );

    return requests.filter((r) => {
      if (r.response !== "pending") return false;
      return segments.some(
        (seg) =>
          seg.dateYmd === r.dateYmd && overlaps(seg.start, seg.end, r.start, r.end)
      );
    });
  }, [requests, naStartDate, naEndDate, naStart, naEnd]);

  const totalConflicts = conflictingSessions.length + conflictingRequests.length;

  const handleMarkLeave = () => {
    // If there are conflicts, go to step 2 for confirmation
    if (totalConflicts > 0 && step === 1) {
      setStep(2);
      return;
    }
    handleConfirm();
  };

  const handleConfirm = () => {
    const startMins = parseHHMM(naStart);
    const endMins = parseHHMM(naEnd);
    const reason = naReason.trim() || "Leave";
    const groupId = editingLeaveGroupId || `leave-${Date.now()}`;

    // If editing, remove old blocks first
    if (editingLeaveGroupId) {
      dispatch(removeUnavailableByGroupId(editingLeaveGroupId));
    }

    /* §10: create leave blocks per day segment */
    const segments = generateLeaveSegments(naStartDate, naEndDate, startMins, endMins, reason);
    segments.forEach((seg, i) => {
      dispatch(
        addUnavailable({
          id: `na-${Date.now()}-${i}`,
          groupId,
          ...seg,
        })
      );
    });

    /* §10: on submit with auto-decline */
    if (autoDecline && totalConflicts > 0) {
      conflictingSessions.forEach((s) => {
        dispatch(declineSession({ id: s.id, dateYmd: s.dateYmd }));
      });
      conflictingRequests.forEach((r) => {
        dispatch(respondToRequest({ id: r.id, response: "unavailable" }));
      });

      const parts: string[] = [];
      if (conflictingSessions.length > 0) parts.push(`${conflictingSessions.length} session(s) auto-declined`);
      if (conflictingRequests.length > 0) parts.push(`${conflictingRequests.length} request(s) marked unavailable`);

      dispatch(
        pushToast({
          title: editingLeaveGroupId ? "Leave updated" : "Marked unavailable",
          description: `${naStartDate} to ${naEndDate} • ${parts.join(", ")}`,
        })
      );
    } else {
      dispatch(
        pushToast({
          title: editingLeaveGroupId ? "Leave updated" : "Marked unavailable",
          description: `${naStartDate} to ${naEndDate}${segments.length > 1 ? ` (${segments.length} days)` : ""}`,
        })
      );
    }

    dispatch(setOpenNotAvailable(false));
    dispatch(setNaReason(""));
    dispatch(setEditingLeaveGroupId(null));
    setAutoDecline(true);
    setStep(1);
  };

  const handleClose = () => {
    dispatch(setOpenNotAvailable(false));
    dispatch(setEditingLeaveGroupId(null));
    dispatch(setNaReason(""));
    setStep(1);
    setAutoDecline(true);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      PaperProps={{ sx: { width: { xs: "calc(100vw - 1.5rem)", sm: 420 }, overflow: "hidden" } }}
    >
      {/* ── Header ── */}
      <Box sx={{ px: 2, pt: 2, pb: 1.25, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.9rem" }}>
          {editingLeaveGroupId ? "Edit leave" : step === 2 ? "Conflicts found" : "Mark leave"}
        </Typography>
        <Chip
          label={step === 2 ? `${totalConflicts} conflict${totalConflicts > 1 ? "s" : ""}` : "Leave"}
          size="small"
          sx={{
            height: 20,
            fontSize: "0.65rem",
            fontWeight: 600,
            ...(step === 2
              ? { bgcolor: "var(--gl-status-declined-bg)", color: "var(--gl-status-declined-text)", border: "1px solid var(--gl-status-declined-border)" }
              : { bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)" }),
          }}
        />
      </Box>

      <DialogContent sx={{ px: 2, pt: 0.5, pb: 1.5 }}>
        {step === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
              Block off dates when you're not available for sessions.
            </Typography>

            {/* Date range */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
              <Box sx={{ position: "relative" }}>
                <TextField
                  label="Start date"
                  value={naStartDate ? new Date(`${naStartDate}T00:00:00`).toLocaleDateString(userLocale, { day: "2-digit", month: "short", year: "numeric" }) : ""}
                  size="small"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true }, input: { readOnly: true, sx: { cursor: "pointer" } } }}
                  onClick={() => startDateRef.current?.showPicker()}
                  sx={{ "& .MuiInputBase-root": { height: 36, fontSize: "0.75rem" }, "& .MuiInputLabel-root": { fontSize: "0.7rem" } }}
                />
                <input
                  ref={startDateRef}
                  type="date"
                  value={naStartDate}
                  onChange={(e) => dispatch(setNaStartDate(e.target.value))}
                  style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
                />
              </Box>
              <Box sx={{ position: "relative" }}>
                <TextField
                  label="End date"
                  value={naEndDate ? new Date(`${naEndDate}T00:00:00`).toLocaleDateString(userLocale, { day: "2-digit", month: "short", year: "numeric" }) : ""}
                  size="small"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true }, input: { readOnly: true, sx: { cursor: "pointer" } } }}
                  onClick={() => endDateRef.current?.showPicker()}
                  sx={{ "& .MuiInputBase-root": { height: 36, fontSize: "0.75rem" }, "& .MuiInputLabel-root": { fontSize: "0.7rem" } }}
                />
                <input
                  ref={endDateRef}
                  type="date"
                  value={naEndDate}
                  onChange={(e) => dispatch(setNaEndDate(e.target.value))}
                  style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
                />
              </Box>
            </Box>

            {/* Duration */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem", mb: 0.5, display: "block" }}>Duration</Typography>
              <ToggleButtonGroup
                value={duration}
                exclusive
                onChange={(_, v) => { if (v) setDuration(v); }}
                size="small"
                fullWidth
                sx={{ "& .MuiToggleButton-root": { fontSize: "0.68rem", py: 0.5, textTransform: "none" } }}
              >
                <ToggleButton value="full">Full day</ToggleButton>
                <ToggleButton value="first-half">First half</ToggleButton>
                <ToggleButton value="second-half">Second half</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {naStartDate && naEndDate && !isValid && (
              <Typography variant="caption" sx={{ color: "error.main", fontSize: "0.7rem" }}>
                End date/time must be after start date/time.
              </Typography>
            )}

            <TextField
              label="Reason (optional)"
              value={naReason}
              onChange={(e) => dispatch(setNaReason(e.target.value))}
              placeholder="e.g. Vacation, Personal"
              size="small"
              fullWidth
              sx={{ "& .MuiInputBase-root": { height: 36, fontSize: "0.75rem" }, "& .MuiInputLabel-root": { fontSize: "0.7rem" } }}
            />
          </Box>
        )}

        {step === 2 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Warning banner */}
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.25,
                p: 1.5,
                borderRadius: "8px",
                bgcolor: "var(--gl-status-declined-bg)",
                border: "1px solid var(--gl-status-declined-border)",
              }}
            >
              <WarningAmberOutlinedIcon sx={{ fontSize: 16, flexShrink: 0, mt: "1px", color: "var(--gl-status-declined-text)" }} />
              <Typography variant="body2" sx={{ fontSize: "0.82rem", color: "var(--gl-status-declined-text)", fontWeight: 500 }}>
                These events overlap with your leave and will need attention.
              </Typography>
            </Box>

            {/* Conflict list */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              {conflictingSessions.map((s) => (
                <Box key={s.id} sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 1.5, py: 1, borderRadius: "8px", border: 1, borderColor: "divider" }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "error.main", flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.82rem" }} noWrap>{s.title}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                      {s.dateYmd} · {fmtTime12(s.start)}–{fmtTime12(s.end)}
                    </Typography>
                  </Box>
                </Box>
              ))}
              {conflictingRequests.map((r) => (
                <Box key={r.id} sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 1.5, py: 1, borderRadius: "8px", border: 1, borderColor: "divider" }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "warning.main", flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.82rem" }} noWrap>{r.title}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                      {r.dateYmd} · {fmtTime12(r.start)}–{fmtTime12(r.end)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Auto-decline checkbox - highlighted */}
            <Box
              sx={{
                px: 1.5,
                py: 1,
                borderRadius: "8px",
                bgcolor: autoDecline ? "var(--gl-status-pending-bg)" : "action.hover",
                border: "1px solid",
                borderColor: autoDecline ? "var(--gl-status-pending-border)" : "divider",
                transition: "all 0.2s ease",
              }}
            >
              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Checkbox
                    checked={autoDecline}
                    onChange={(_, c) => setAutoDecline(c)}
                    size="small"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontSize: "0.82rem", fontWeight: 600 }}>
                      Auto-decline overlapping events
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                      Conflicting sessions will be automatically declined
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Box>
        )}
      </DialogContent>

      {/* ── Footer ── */}
      <Box sx={{ px: 2, pb: 2, pt: 0.5, display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button variant="text" color="inherit" size="small" onClick={step === 2 ? () => setStep(1) : handleClose} sx={{ fontSize: "0.75rem" }}>
          {step === 2 ? "Back" : "Cancel"}
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={step === 2 ? handleConfirm : handleMarkLeave}
          disabled={step === 1 && !isValid}
          sx={{ px: 2.5, fontSize: "0.75rem" }}
        >
          {step === 2 ? "Confirm leave" : editingLeaveGroupId ? "Update" : "Mark leave"}
        </Button>
      </Box>
    </Dialog>
  );
}
