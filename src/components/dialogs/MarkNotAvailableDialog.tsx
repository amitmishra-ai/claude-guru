import { useMemo, useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "@mui/material/Button";
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
import { parseHHMM, fmtTime12, toYmd, addDays, hhmmFromMinutes } from "@/lib/helpers";
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

  const [autoDecline, setAutoDecline] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

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
      setAutoDecline(false);
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
    setAutoDecline(false);
    setStep(1);
  };

  const handleClose = () => {
    dispatch(setOpenNotAvailable(false));
    dispatch(setEditingLeaveGroupId(null));
    dispatch(setNaReason(""));
    setStep(1);
    setAutoDecline(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {editingLeaveGroupId ? "Edit leave" : "Mark not available"}
      </DialogTitle>

      <DialogContent>
        {step === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 0.5 }}>
            <Box sx={{ border: 1, borderColor: 'divider', bgcolor: 'action.hover', p: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                Block off a date or period when you are not available for sessions.
              </Typography>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
              <TextField
                label="Start date"
                type="date"
                value={naStartDate}
                onChange={(e) => dispatch(setNaStartDate(e.target.value))}
                size="small"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="End date"
                type="date"
                value={naEndDate}
                onChange={(e) => dispatch(setNaEndDate(e.target.value))}
                size="small"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>

            {/* Time pickers */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Start time</InputLabel>
                <Select
                  label="Start time"
                  value={naStart}
                  onChange={(e) => dispatch(setNaStart(e.target.value))}
                >
                  {timeOptions12.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>End time</InputLabel>
                <Select
                  label="End time"
                  value={naEnd}
                  onChange={(e) => dispatch(setNaEnd(e.target.value))}
                >
                  {timeOptions12.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Validation error */}
            {naStartDate && naEndDate && !isValid && (
              <Typography variant="caption" sx={{ color: 'error.main' }}>
                End date/time must be after start date/time.
              </Typography>
            )}

            <TextField
              label="Reason (optional)"
              value={naReason}
              onChange={(e) => dispatch(setNaReason(e.target.value))}
              placeholder="E.g., vacation, personal leave"
              size="small"
              fullWidth
            />
          </Box>
        )}

        {step === 2 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 0.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                p: 2,
                bgcolor: 'warning.light',
                border: 1,
                borderColor: 'warning.main',
              }}
            >
              <AlertTriangle style={{ width: 18, height: 18, flexShrink: 0, marginTop: 2, color: 'var(--gl-warning-icon)' }} />
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'warning.dark', fontWeight: 600 }}>
                  {totalConflicts} conflicting item{totalConflicts > 1 ? "s" : ""} found
                </Typography>
                <Typography variant="body2" sx={{ color: 'warning.dark', mt: 0.5 }}>
                  The following sessions/requests overlap with your leave period:
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {conflictingSessions.map((s) => (
                <Box
                  key={s.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1.5,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main', flexShrink: 0 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={500}>{s.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {s.dateYmd} &bull; {fmtTime12(s.start)}–{fmtTime12(s.end)}
                    </Typography>
                  </Box>
                </Box>
              ))}
              {conflictingRequests.map((r) => (
                <Box
                  key={r.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1.5,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main', flexShrink: 0 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={500}>{r.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {r.dateYmd} &bull; {fmtTime12(r.start)}–{fmtTime12(r.end)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Chip
              label="Auto-decline sessions & mark requests unavailable"
              size="small"
              variant={autoDecline ? "filled" : "outlined"}
              onClick={() => setAutoDecline(!autoDecline)}
              sx={{
                borderRadius: 9999,
                cursor: 'pointer',
                ...(autoDecline
                  ? { bgcolor: 'warning.main', color: 'warning.contrastText', '&:hover': { bgcolor: 'warning.dark' } }
                  : { borderColor: 'warning.light', color: 'warning.dark', '&:hover': { bgcolor: 'warning.light' } }),
              }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {step === 1 && (
          <>
            <Button variant="text" color="inherit" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleMarkLeave} disabled={!isValid}>
              {editingLeaveGroupId ? "Update leave" : "Mark leave"}
            </Button>
          </>
        )}
        {step === 2 && (
          <>
            <Button variant="text" color="inherit" onClick={() => setStep(1)}>
              Go back
            </Button>
            <Button variant="contained" onClick={handleConfirm}>
              Continue anyway
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
