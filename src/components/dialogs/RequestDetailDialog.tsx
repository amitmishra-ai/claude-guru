import { CheckCircle2, XCircle } from "lucide-react";
import Box from "@mui/material/Box";
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
              Confirm if you can take this session. You can still mark yourself unavailable later if plans change.
            </Box>

            <Box
              sx={{
                borderRadius: "16px",
                border: 1,
                borderColor: "divider",
                backgroundColor: "hsl(var(--md-surface))",
                p: 2,
              }}
            >
              <Box sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{requestFocus.title}</Box>
              <Box sx={{ mt: 0.5, fontSize: "0.75rem", color: "hsl(var(--md-on-surface-variant))" }}>
                {fmtDateNice(requestFocus.dateYmd)} &bull; {fmtTime12(requestFocus.start)}&ndash;{fmtTime12(requestFocus.end)} &bull; {requestFocus.location}
              </Box>
              <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
                <Chip variant="outlined" size="small" label={requestFocus.program} />
                <Chip variant="outlined" size="small" label={requestFocus.cohort} />
                <Chip variant="outlined" size="small" label={`Group hint: ${requestFocus.groupHint}`} />
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Button
                variant="contained"
                onClick={() => handleRespond(requestFocus.id, "available")}
              >
                <CheckCircle2 style={{ marginRight: 8, width: 16, height: 16 }} /> Confirm
              </Button>
              <Button
                variant="soft"
                onClick={() => handleRespond(requestFocus.id, "unavailable")}
              >
                <XCircle style={{ marginRight: 8, width: 16, height: 16 }} /> I'm unavailable
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ fontSize: "0.875rem", color: "hsl(var(--md-on-surface-variant))" }}>Select a request from the calendar.</Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="text" color="inherit" onClick={() => dispatch(setOpenRequest(false))}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
