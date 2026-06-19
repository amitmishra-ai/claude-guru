import { useState, useEffect } from "react";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  declineSession,
  setDeclineSessionFocus,
  setDeclineReason,
  setSessionFocus,
} from "@/store/slices/sessionsSlice";
import { setOpenDeclineReason, setOpenSession } from "@/store/slices/uiSlice";
import { pushToast } from "@/store/slices/toastsSlice";
import { toYmd, dateTimeMs } from "@/lib/helpers";
import { demoNow } from "@/lib/constants";
import { SessionCard } from "@/components/shared/SessionCard";

const CLOSE_THRESHOLD_MS = 48 * 60 * 60 * 1000; // 48 hours

/** Career Mentor cancellation reasons (single-select), per production flow. */
const CAREER_MENTOR_REASONS = [
  "Getting late due to office work",
  "Personal emergency",
  "Traveling for urgent work",
  "Not keeping well",
  "Session is getting rescheduled",
  "Other",
];

export function DeclineReasonDialog() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.openDeclineReason);
  const declineSessionFocus = useAppSelector((s) => s.sessions.declineSessionFocus);
  const declineReason = useAppSelector((s) => s.sessions.declineReason);
  const selectedRole = useAppSelector((s) => s.devPanel.selectedRole);
  const isCareerMentor = selectedRole === "Career Mentor";

  // Career-mentor single-select reason + free-text detail (local to the dialog).
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  useEffect(() => {
    if (!open) {
      setReason("");
      setDetails("");
    }
  }, [open]);

  // Composed reason string + validity differ by role.
  const composedReason = isCareerMentor
    ? [reason, details.trim()].filter(Boolean).join(" — ")
    : declineReason.trim();
  const canSubmit = isCareerMentor ? !!reason : !!declineReason.trim();

  const nowMs = demoNow.getTime();
  const sessionStartMs = declineSessionFocus
    ? dateTimeMs(declineSessionFocus.dateYmd, declineSessionFocus.start)
    : 0;
  const isTooClose = declineSessionFocus ? (sessionStartMs - nowMs) < CLOSE_THRESHOLD_MS : false;

  const handleClose = () => {
    dispatch(setOpenDeclineReason(false));
    dispatch(setDeclineSessionFocus(null));
    dispatch(setDeclineReason(""));
  };

  const handleSubmit = () => {
    if (!declineSessionFocus || !canSubmit) return;
    const s = declineSessionFocus;
    dispatch(declineSession({ id: s.id, dateYmd: toYmd(demoNow), reason: composedReason }));
    dispatch(setOpenDeclineReason(false));
    dispatch(setOpenSession(false));
    dispatch(setSessionFocus(null));
    dispatch(setDeclineSessionFocus(null));
    dispatch(setDeclineReason(""));
    dispatch(pushToast({ title: "Marked unavailable", description: `${s.title}` }));
  };

  return (
    <Dialog open={open} onClose={handleClose} disableRestoreFocus maxWidth="xs" fullWidth>
      <DialogTitle>Mark unavailable</DialogTitle>
      <DialogContent>
        {declineSessionFocus ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <SessionCard
              title={declineSessionFocus.title}
              sessionType={declineSessionFocus.sessionType}
              topic={declineSessionFocus.topic}
              batch={declineSessionFocus.batch}
              dateYmd={declineSessionFocus.dateYmd}
              start={declineSessionFocus.start}
              end={declineSessionFocus.end}
              sx={{
                borderRadius: "12px",
                border: 1,
                borderColor: "divider",
                backgroundColor: "hsl(var(--md-surface))",
                // SessionCard has its own inner px:2/py:2 — tighten it here so the
                // compact 2-line card in this dialog isn't over-padded.
                "& > .MuiBox-root": { px: 1.5, py: 1.25 },
              }}
            />

            {isTooClose && (
              <Box
                sx={{
                  borderRadius: "12px",
                  border: 1,
                  borderColor: "var(--gl-status-declined-border)",
                  bgcolor: "var(--gl-status-declined-bg)",
                  p: 2,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <WarningAmberOutlinedIcon sx={{ fontSize: 18, color: "var(--gl-status-declined-text)", flexShrink: 0, mt: '2px' }} />
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ color: "var(--gl-status-declined-text)", mb: 0.5, fontSize: { xs: "0.78rem", sm: "0.875rem" } }}>
                      This cancellation is very close to the session
                    </Typography>
                    <Typography variant="body2" sx={{ color: "hsl(var(--md-on-surface-variant))", mb: 1.5, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                      Please inform {declineSessionFocus.scheduledByName || "the scheduler"} directly so they can arrange a replacement.
                    </Typography>
                    <Stack spacing={0.75}>
                      {declineSessionFocus.scheduledByEmail && (
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                          <EmailOutlinedIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: "hsl(var(--md-on-surface-variant))" }} />
                          <Typography variant="body2" fontWeight={500} sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" }, wordBreak: "break-all" }}>
                            {declineSessionFocus.scheduledByEmail}
                          </Typography>
                        </Stack>
                      )}
                      {declineSessionFocus.scheduledByPhone && (
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                          <PhoneOutlinedIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: "hsl(var(--md-on-surface-variant))" }} />
                          <Typography variant="body2" fontWeight={500} sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                            {declineSessionFocus.scheduledByPhone}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            )}

            {isCareerMentor ? (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                  Choose reason for cancelling
                </Typography>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Reason</InputLabel>
                  <Select
                    label="Reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    MenuProps={{ PaperProps: { sx: { maxHeight: 280 } } }}
                  >
                    {CAREER_MENTOR_REASONS.map((r) => (
                      <MenuItem key={r} value={r}>{r}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Specify more details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Add any context for the scheduler (optional)"
                  size="small"
                  fullWidth
                  multiline
                  minRows={2}
                  sx={{ mt: 1.5 }}
                />
              </Box>
            ) : (
              <TextField
                label="Reason (required)"
                value={declineReason}
                onChange={(e) => dispatch(setDeclineReason(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.metaKey && declineReason.trim()) {
                    handleSubmit();
                  }
                }}
                placeholder="E.g., travel / personal commitment / overlap"
                size="small"
                fullWidth
                required
                autoFocus
              />
            )}
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ flexDirection: { xs: "column", sm: "row" }, gap: { xs: 1, sm: 0 }, "& > :not(:first-of-type)": { ml: { xs: 0, sm: 1 } } }}>
        <Button variant="text" color="inherit" onClick={handleClose} sx={{ width: { xs: "100%", sm: "auto" } }}>
          Cancel
        </Button>
        <Button
          variant="soft"
          onClick={handleSubmit}
          disabled={!canSubmit}
          sx={{
            width: { xs: "100%", sm: "auto" },
            fontWeight: 600,
            bgcolor: "rgba(211,47,47,0.08)",
            color: "error.main",
            "&:hover": { bgcolor: "rgba(211,47,47,0.16)" },
            "&.Mui-disabled": { bgcolor: "rgba(211,47,47,0.05)", color: "rgba(211,47,47,0.4)" },
          }}
        >
          I'm unavailable
        </Button>
      </DialogActions>
    </Dialog>
  );
}
