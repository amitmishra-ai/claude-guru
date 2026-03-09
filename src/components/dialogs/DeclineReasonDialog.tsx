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
    <Dialog
      open={open}
      onClose={handleClose}
    >
      <DialogTitle>Mark unavailable</DialogTitle>
      <DialogContent>
        {declineSessionFocus ? (
          <div className="space-y-4">
            <div className="rounded-2xl border bg-surface-container/30 p-3 text-sm text-on-surface-variant">
              This will mark your calendar as unavailable for this session slot.
            </div>
            <div className="rounded-2xl border bg-surface p-3 text-sm">
              <div className="font-medium">{declineSessionFocus.title}</div>
              <div className="mt-1 text-on-surface-variant">
                {fmtDateNice(declineSessionFocus.dateYmd)} &bull; {fmtTime12(declineSessionFocus.start)}&ndash;{fmtTime12(declineSessionFocus.end)}
              </div>
            </div>
            <TextField
              label="Reason"
              value={declineReason}
              onChange={(e) => dispatch(setDeclineReason(e.target.value))}
              placeholder="E.g., travel / personal commitment / overlap"
              size="small"
              fullWidth
            />
          </div>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          sx={{ bgcolor: 'error.main', color: 'error.contrastText', '&:hover': { bgcolor: 'error.dark' } }}
          onClick={handleSubmit}
        >
          I'm unavailable
        </Button>
      </DialogActions>
    </Dialog>
  );
}
