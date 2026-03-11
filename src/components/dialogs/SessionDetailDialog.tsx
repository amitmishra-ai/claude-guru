import { CheckCircle2, XCircle } from "lucide-react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  confirmSession,
  setSessionFocus,
  setDeclineSessionFocus,
  setDeclineReason,
} from "@/store/slices/sessionsSlice";
import { setOpenSession, setOpenDeclineReason, setOpenGroupProfile } from "@/store/slices/uiSlice";
import { pushToast } from "@/store/slices/toastsSlice";
import { fmtDateNice, fmtTime12 } from "@/lib/helpers";

export function SessionDetailDialog() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.openSession);
  const sessionFocus = useAppSelector((s) => s.sessions.sessionFocus);
  const sessions = useAppSelector((s) => s.sessions.items);
  const confirmations = useAppSelector((s) => s.sessions.confirmations);

  const displayed = sessionFocus ? [sessionFocus] : sessions;

  return (
    <Dialog
      open={open}
      onClose={() => {
        dispatch(setOpenSession(false));
        dispatch(setSessionFocus(null));
      }}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          p: 0,
          maxHeight: "85vh",
          overflow: "hidden",
          width: { xs: "calc(100vw - 1.5rem)", sm: "100%" },
          maxWidth: { xs: "calc(100vw - 1.5rem)", sm: "672px" },
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", maxHeight: "85vh" }}>
        <DialogTitle sx={{ position: "sticky", top: 0, zIndex: 10, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", px: 3, py: 2 }}>
          Session details &amp; confirmation
        </DialogTitle>

        <DialogContent className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
              Cadence: content Monday &rarr; acknowledgement/clarity by Wednesday &rarr; reminders (1 day + 30 min).
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {displayed.map((s) => {
                const isConfirmed = confirmations[s.id];
                return (
                  <Box key={s.id} sx={{ py: 2, borderBottom: 1, borderColor: "divider", "&:last-child": { borderBottom: 0 } }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ fontSize: "1.125rem", fontWeight: 600 }}>{s.title}</Box>
                        <Box sx={{ mt: 0.5, fontSize: "0.875rem", color: "hsl(var(--md-on-surface-variant))" }}>
                          {fmtDateNice(s.dateYmd)} &bull; {fmtTime12(s.start)}&ndash;{fmtTime12(s.end)} &bull; {s.group}
                        </Box>
                        <Box sx={{ mt: 1.5, display: "flex", flexWrap: "wrap", gap: 1 }}>
                          <Chip variant="outlined" size="small" label={s.program} />
                          <Chip variant="outlined" size="small" label={s.cohort} />
                          <Chip variant="outlined" size="small" label={s.sessionType} />
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "center" }, justifyContent: { sm: "space-between" }, gap: 1 }}>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          <Button
                            variant={isConfirmed ? "soft" : "contained"}
                            sx={isConfirmed
                              ? { borderColor: "var(--gl-status-confirmed-border)", bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", "&:hover": { bgcolor: "var(--gl-status-confirmed-bg)" } }
                              : {}
                            }
                            onClick={() => {
                              if (isConfirmed) return;
                              dispatch(confirmSession(s.id));
                              dispatch(pushToast({ title: "Confirmed", description: `${s.title} \u2022 ${fmtDateNice(s.dateYmd)}` }));
                            }}
                          >
                            <CheckCircle2 style={{ marginRight: 8, width: 16, height: 16 }} /> {isConfirmed ? "Confirmed" : "Confirm"}
                          </Button>

                          <Button
                            variant="soft"
                            onClick={() => {
                              dispatch(setDeclineSessionFocus(s));
                              dispatch(setDeclineReason(""));
                              dispatch(setOpenDeclineReason(true));
                            }}
                          >
                            <XCircle style={{ marginRight: 8, width: 16, height: 16 }} /> I'm unavailable
                          </Button>
                        </Box>

                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: { sm: "flex-end" } }}>
                          <Button
                            variant="text"
                            size="small"
                            sx={{ fontSize: "0.75rem" }}
                            onClick={() => dispatch(setOpenGroupProfile(true))}
                          >
                            Group profile
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ position: "sticky", bottom: 0, zIndex: 10, borderTop: 1, borderColor: "divider", bgcolor: "background.paper", px: 3, py: 2 }}>
          <Button
            variant="text"
            color="inherit"
            sx={{ display: { xs: "none", sm: "inline-flex" } }}
            onClick={() => {
              dispatch(setOpenSession(false));
              dispatch(setSessionFocus(null));
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
