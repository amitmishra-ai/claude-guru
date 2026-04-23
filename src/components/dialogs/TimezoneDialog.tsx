import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { useAppSelector, useAppDispatch } from "@/store";
import { setTimeZoneMode, setManualTimeZone, setTzOffsetMinutes } from "@/store/slices/profileSlice";
import { setOpenTimezone } from "@/store/slices/uiSlice";
import { getTimeZoneOffsetMinutes } from "@/lib/helpers";
import { demoNow } from "@/lib/constants";
import { TimezonePicker } from "@/components/shared/TimezonePicker";
import { getSystemTimezone } from "@/lib/timezone";

/**
 * Timezone picker dialog — opened from Calendar bottom-right chip,
 * the Profile header link, and the Settings timezone row.
 *
 * Uses the shared TimezonePicker so the UI is identical to the
 * "Update availability" Step 1 picker. Draft state + Save button
 * mean changes apply when the user confirms rather than immediately.
 */
export function TimezoneDialog() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.openTimezone);
  const timeZoneMode = useAppSelector((s) => s.profile.timeZoneMode);
  const manualTimeZone = useAppSelector((s) => s.profile.manualTimeZone);

  /* Local draft so closing without Save doesn't mutate global state. */
  const initial = timeZoneMode === "auto" ? "__auto__" : manualTimeZone;
  const [draft, setDraft] = useState(initial);
  useEffect(() => { if (open) setDraft(initial); }, [open, initial]);

  const handleClose = () => dispatch(setOpenTimezone(false));
  const handleSave = () => {
    const baseTzOffset = getTimeZoneOffsetMinutes("Asia/Kolkata", demoNow);
    if (draft === "__auto__") {
      dispatch(setTimeZoneMode("auto"));
      const sysTz = getSystemTimezone();
      const targetTzOffset = getTimeZoneOffsetMinutes(sysTz, demoNow);
      dispatch(setTzOffsetMinutes(targetTzOffset - baseTzOffset));
    } else {
      dispatch(setTimeZoneMode("manual"));
      dispatch(setManualTimeZone(draft));
      const targetTzOffset = getTimeZoneOffsetMinutes(draft, demoNow);
      dispatch(setTzOffsetMinutes(targetTzOffset - baseTzOffset));
    }
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth={false} PaperProps={{ sx: { width: { xs: "calc(100vw - 1.5rem)", sm: 420 } } }}>
      <DialogTitle sx={{ pb: 1 }}>Timezone</DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Choose which timezone you want to view your schedule and availability in.
          </Typography>

          <TimezonePicker value={draft} onChange={setDraft} />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit">Cancel</Button>
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
