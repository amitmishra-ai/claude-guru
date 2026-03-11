import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
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
import { fmtDateNice, fmtTime12, toYmd } from "@/lib/helpers";
import { demoNow } from "@/lib/constants";

export function DeclineReasonDialog() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.openDeclineReason);
  const declineSessionFocus = useAppSelector((s) => s.sessions.declineSessionFocus);
  const declineReason = useAppSelector((s) => s.sessions.declineReason);

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
            <Box
              sx={{
                borderRadius: "16px",
                border: 1,
                borderColor: "divider",
                backgroundColor: "hsl(var(--md-surface))",
                p: 1.5,
                fontSize: "0.875rem",
              }}
            >
              <Box sx={{ fontWeight: 500 }}>{declineSessionFocus.title}</Box>
              <Box sx={{ mt: 0.5, color: "hsl(var(--md-on-surface-variant))" }}>
                {fmtDateNice(declineSessionFocus.dateYmd)} &bull; {fmtTime12(declineSessionFocus.start)}&ndash;{fmtTime12(declineSessionFocus.end)}
              </Box>
            </Box>
            <TextField
              label="Reason"
              value={declineReason}
              onChange={(e) => dispatch(setDeclineReason(e.target.value))}
              placeholder="E.g., travel / personal commitment / overlap"
              size="small"
              fullWidth
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
        >
          I'm unavailable
        </Button>
      </DialogActions>
    </Dialog>
  );
}
