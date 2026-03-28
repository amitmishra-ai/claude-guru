import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { useAppSelector, useAppDispatch } from "@/store";
import { respondToRequest, setRequestFocus } from "@/store/slices/requestsSlice";
import { setOpenRequest } from "@/store/slices/uiSlice";
import { pushToast } from "@/store/slices/toastsSlice";
import { SessionCard } from "@/components/shared/SessionCard";

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
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Event request</DialogTitle>

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

            <SessionCard
              title={requestFocus.title}
              dateYmd={requestFocus.dateYmd}
              start={requestFocus.start}
              end={requestFocus.end}
              locationText={requestFocus.location}
              chips={[requestFocus.program, requestFocus.cohort, `Group hint: ${requestFocus.groupHint}`].filter(Boolean)}
              sx={{
                borderRadius: "16px",
                border: 1,
                borderColor: "divider",
                backgroundColor: "hsl(var(--md-surface))",
                p: 2,
              }}
            />

            <Box>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleRespond(requestFocus.id, "available")}
                >
                  <CheckCircleOutlinedIcon sx={{ mr: 1, fontSize: 16 }} /> Confirm
                </Button>
                <Button
                  variant="soft"
                  size="small"
                  onClick={() => handleRespond(requestFocus.id, "unavailable")}
                >
                  <CancelOutlinedIcon sx={{ mr: 1, fontSize: 16 }} /> I'm unavailable
                </Button>
              </Box>
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
