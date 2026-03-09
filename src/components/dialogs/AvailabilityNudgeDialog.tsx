import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
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
      PaperProps={{ className: "p-0 overflow-hidden" }}
    >
      <img
        src={availabilityNudgeImageSrc}
        alt="Update availability reminder"
        className="h-[216px] w-full rounded-t-2xl object-cover"
      />
      <div className="p-6">
        <DialogTitle sx={{ padding: 0 }}>Update your availability</DialogTitle>
        <div className="mt-2 text-sm text-on-surface-variant">
          If you do not update your availability, ops will not be able to schedule sessions with you.
        </div>
        <DialogActions sx={{ padding: 0, marginTop: '1.25rem' }}>
          <Button variant="outlined" color="inherit" onClick={() => dispatch(setOpenAvailabilityNudge(false))}>
            Maybe later
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              dispatch(setOpenAvailabilityNudge(false));
              dispatch(setOpenAvailability(true));
            }}
          >
            Update availability
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
}
