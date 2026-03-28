import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import { useAppSelector, useAppDispatch } from "@/store";
import { setOpenAvailabilityNudge, setOpenAvailability } from "@/store/slices/uiSlice";
import { availabilityNudgeImageSrc } from "@/lib/constants";

export function AvailabilityNudgeDialog() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.openAvailabilityNudge);

  return (
    <Dialog
      open={open}
      onClose={() => dispatch(setOpenAvailabilityNudge(false))}
      PaperProps={{ sx: { p: 0, overflow: "hidden" } }}
      maxWidth="xs"
      fullWidth
    >
      <Box
        component="img"
        src={availabilityNudgeImageSrc}
        alt="Update availability reminder"
        sx={{ height: 216, width: "100%", borderTopLeftRadius: 16, borderTopRightRadius: 16, objectFit: "cover" }}
      />
      <Box sx={{ p: 3 }}>
        <DialogTitle sx={{ padding: 0 }}>Update your availability</DialogTitle>
        <Box sx={{ mt: 1, fontSize: "0.875rem", color: "hsl(var(--md-on-surface-variant))" }}>
          If you do not update your availability, ops will not be able to schedule sessions with you.
        </Box>
        <DialogActions sx={{ padding: 0, marginTop: "1.25rem", flexDirection: { xs: "column", sm: "row" }, gap: { xs: 1, sm: 0 }, "& > :not(:first-of-type)": { ml: { xs: 0, sm: 1 } } }}>
          <Button variant="text" color="inherit" onClick={() => dispatch(setOpenAvailabilityNudge(false))} sx={{ width: { xs: "100%", sm: "auto" } }}>
            Maybe later
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              dispatch(setOpenAvailabilityNudge(false));
              dispatch(setOpenAvailability(true));
            }}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Update availability
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
