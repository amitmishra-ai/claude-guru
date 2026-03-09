import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { useAppSelector, useAppDispatch } from "@/store";
import { setOpenGroupProfile } from "@/store/slices/uiSlice";

export function GroupProfileDialog() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.openGroupProfile);

  return (
    <Dialog
      open={open}
      onClose={() => dispatch(setOpenGroupProfile(false))}
    >
      <DialogTitle>Group profile (PDF)</DialogTitle>

      <DialogContent>
        <div className="space-y-3">
          <div className="rounded-2xl border bg-surface-container/30 p-3 text-sm text-on-surface-variant">
            In reality this arrives via email as a PDF; here we surface it next to session actions.
          </div>

          <div className="rounded-2xl border bg-surface p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Cohort Feb &bull; Group 07</div>
                <div className="mt-1 text-xs text-on-surface-variant">(Placeholder preview)</div>
              </div>
              <Chip size="small" color="primary" label="PDF" />
            </div>

            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Avg work exp</span>
                <span className="font-medium">6.2 yrs</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Programming exp</span>
                <span className="font-medium">Mixed</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Top industries</span>
                <span className="font-medium">IT, BFSI, Ops</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Learners</span>
                <span className="font-medium">25</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={() => dispatch(setOpenGroupProfile(false))}>
          Close
        </Button>
        <Button
          variant="contained"
        >
          Download / open PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
}
