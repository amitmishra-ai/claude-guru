import { CheckCircle2, XCircle } from "lucide-react";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { useAppSelector, useAppDispatch } from "@/store";
import { respondToRequest, setRequestFocus } from "@/store/slices/requestsSlice";
import { setOpenRequest } from "@/store/slices/uiSlice";
import { pushToast } from "@/store/slices/toastsSlice";
import { fmtDateNice, fmtTime12 } from "@/lib/helpers";

export function RequestDetailDialog() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.openRequest);
  const requestFocus = useAppSelector((s) => s.requests.requestFocus);

  const handleRespond = (id: string, response: "available" | "unavailable") => {
    dispatch(respondToRequest({ id, response }));
    if (response === "available")
      dispatch(pushToast({ title: "Marked available", description: "Ops will allocate based on selection." }));
    else
      dispatch(pushToast({ title: "Marked unavailable", description: "We won't consider you for this slot." }));
    dispatch(setOpenRequest(false));
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        dispatch(setOpenRequest(false));
        dispatch(setRequestFocus(null));
      }}
    >
      <DialogTitle>Session request</DialogTitle>

      <DialogContent>
        {requestFocus ? (
          <div className="space-y-4">
            <div className="rounded-2xl border bg-surface-container/30 p-3 text-sm text-on-surface-variant">
              Confirm if you can take this session. You can still mark yourself unavailable later if plans change.
            </div>

            <div className="rounded-2xl border bg-surface p-4">
              <div className="text-sm font-semibold">{requestFocus.title}</div>
              <div className="mt-1 text-xs text-on-surface-variant">
                {fmtDateNice(requestFocus.dateYmd)} &bull; {fmtTime12(requestFocus.start)}&ndash;{fmtTime12(requestFocus.end)} &bull; {requestFocus.location}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Chip variant="outlined" size="small" label={requestFocus.program} />
                <Chip variant="outlined" size="small" label={requestFocus.cohort} />
                <Chip variant="outlined" size="small" label={`Group hint: ${requestFocus.groupHint}`} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="contained"
                onClick={() => handleRespond(requestFocus.id, "available")}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm
              </Button>
              <Button
                variant="outlined"
                sx={requestFocus.response === "unavailable"
                  ? { borderColor: 'transparent', bgcolor: 'transparent', color: 'error.main', '&:hover': { bgcolor: 'var(--gl-status-declined-bg)', color: 'error.dark' } }
                  : {}
                }
                onClick={() => handleRespond(requestFocus.id, "unavailable")}
              >
                <XCircle className="mr-2 h-4 w-4" /> I'm unavailable
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-on-surface-variant">Select a request from the calendar.</div>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={() => dispatch(setOpenRequest(false))}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
