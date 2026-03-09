import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useAppSelector, useAppDispatch } from "@/store";
import { setOpenMarkUnavailable, setMarkUnavailableTarget } from "@/store/slices/uiSlice";
import { declineSession } from "@/store/slices/sessionsSlice";
import { respondToRequest } from "@/store/slices/requestsSlice";
import { pushToast } from "@/store/slices/toastsSlice";

const QUICK_REASONS = [
  "Schedule conflict",
  "Personal reasons",
  "Health reasons",
  "Other",
] as const;

/**
 * Quick "I'm unavailable" modal triggered from SessionDetailDialog / RequestDetailDialog.
 * Shows quick-pick reasons; "Other" reveals a free-text area.
 */
export function MarkUnavailableModal() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.openMarkUnavailable);
  const target = useAppSelector((s) => s.ui.markUnavailableTarget);
  const sessions = useAppSelector((s) => s.sessions.items);
  const requests = useAppSelector((s) => s.requests.items);

  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState("");

  const item =
    target?.type === "session"
      ? sessions.find((s) => s.id === target.id)
      : target?.type === "request"
      ? requests.find((r) => r.id === target.id)
      : null;

  const handleClose = () => {
    dispatch(setOpenMarkUnavailable(false));
    dispatch(setMarkUnavailableTarget(null));
    setSelectedReason(null);
    setCustomReason("");
  };

  const handleSubmit = () => {
    if (!target) return;
    const reason = selectedReason === "Other" ? customReason.trim() || "Other" : selectedReason || "";

    if (target.type === "session") {
      const session = sessions.find((s) => s.id === target.id);
      if (session) {
        dispatch(declineSession({ id: session.id, dateYmd: session.dateYmd }));
        dispatch(
          pushToast({
            title: "Session declined",
            description: `${session.title} — ${reason}`,
          })
        );
      }
    } else if (target.type === "request") {
      dispatch(respondToRequest({ id: target.id, response: "unavailable" }));
      const req = requests.find((r) => r.id === target.id);
      dispatch(
        pushToast({
          title: "Marked unavailable",
          description: `${req?.title || "Request"} — ${reason}`,
        })
      );
    }

    handleClose();
  };

  const canSubmit = selectedReason && (selectedReason !== "Other" || customReason.trim().length > 0);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>I'm unavailable</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0.5 }}>
          {item && (
            <Box sx={{ border: 1, borderColor: 'divider', p: 1.5, bgcolor: 'action.hover' }}>
              <Typography variant="body2" fontWeight={500}>
                {"title" in item ? item.title : ""}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {"dateYmd" in item ? item.dateYmd : ""}
              </Typography>
            </Box>
          )}

          <Typography variant="body2" color="text.secondary">
            Select a reason:
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {QUICK_REASONS.map((reason) => (
              <Chip
                key={reason}
                label={reason}
                variant={selectedReason === reason ? "filled" : "outlined"}
                color={selectedReason === reason ? "primary" : "default"}
                onClick={() => setSelectedReason(reason)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>

          {selectedReason === "Other" && (
            <TextField
              label="Please specify"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              size="small"
              fullWidth
              multiline
              minRows={2}
              autoFocus
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="contained" color="error" onClick={handleSubmit} disabled={!canSubmit}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
