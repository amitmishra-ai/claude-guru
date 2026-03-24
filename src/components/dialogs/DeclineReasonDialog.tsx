import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
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

export function DeclineReasonDialog() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.openDeclineReason);
  const declineSessionFocus = useAppSelector((s) => s.sessions.declineSessionFocus);
  const declineReason = useAppSelector((s) => s.sessions.declineReason);

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
    if (!declineSessionFocus) return;
    const s = declineSessionFocus;
    dispatch(declineSession({ id: s.id, dateYmd: toYmd(demoNow) }));
    dispatch(setOpenDeclineReason(false));
    dispatch(setOpenSession(false));
    dispatch(setSessionFocus(null));
    dispatch(setDeclineSessionFocus(null));
    dispatch(setDeclineReason(""));
    dispatch(pushToast({ title: "Marked unavailable", description: `${s.title}` }));
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Mark unavailable</DialogTitle>
      <DialogContent>
        {declineSessionFocus ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 0.5 }}>
            <Box
              sx={{
                borderRadius: "16px",
                border: 1,
                borderColor: "divider",
                backgroundColor: "hsl(var(--md-surface-container) / 0.3)",
                p: 1.5,
                fontSize: "0.875rem",
                color: "hsl(var(--md-on-surface-variant))",
              }}
            >
              This will mark your calendar as unavailable for this session slot.
            </Box>
            <SessionCard
              title={declineSessionFocus.title}
              sessionType={declineSessionFocus.sessionType}
              topic={declineSessionFocus.topic}
              batch={declineSessionFocus.batch}
              dateYmd={declineSessionFocus.dateYmd}
              start={declineSessionFocus.start}
              end={declineSessionFocus.end}
              sx={{
                borderRadius: "16px",
                border: 1,
                borderColor: "divider",
                backgroundColor: "hsl(var(--md-surface))",
                p: 1.5,
              }}
            />

            {isTooClose && (
              <Box
                sx={{
                  borderRadius: "16px",
                  border: 1,
                  borderColor: "var(--gl-status-declined-border)",
                  bgcolor: "var(--gl-status-declined-bg)",
                  p: 2,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <WarningAmberOutlinedIcon sx={{ fontSize: 18, color: "var(--gl-status-declined-text)", flexShrink: 0, mt: '2px' }} />
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ color: "var(--gl-status-declined-text)", mb: 0.5 }}>
                      This cancellation is very close to the session
                    </Typography>
                    <Typography variant="body2" sx={{ color: "hsl(var(--md-on-surface-variant))", mb: 1.5 }}>
                      Please inform {declineSessionFocus.scheduledByName || "the scheduler"} directly so they can arrange a replacement.
                    </Typography>
                    <Stack spacing={0.75}>
                      {declineSessionFocus.scheduledByEmail && (
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                          <EmailOutlinedIcon sx={{ fontSize: 14, color: "hsl(var(--md-on-surface-variant))" }} />
                          <Typography variant="body2" fontWeight={500}>
                            {declineSessionFocus.scheduledByEmail}
                          </Typography>
                        </Stack>
                      )}
                      {declineSessionFocus.scheduledByPhone && (
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                          <PhoneOutlinedIcon sx={{ fontSize: 14, color: "hsl(var(--md-on-surface-variant))" }} />
                          <Typography variant="body2" fontWeight={500}>
                            {declineSessionFocus.scheduledByPhone}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            )}

            <TextField
              label="Reason (required)"
              value={declineReason}
              onChange={(e) => dispatch(setDeclineReason(e.target.value))}
              placeholder="E.g., travel / personal commitment / overlap"
              size="small"
              fullWidth
              required
            />
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="inherit" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleSubmit}
          disabled={!declineReason.trim()}
        >
          I'm unavailable
        </Button>
      </DialogActions>
    </Dialog>
  );
}
