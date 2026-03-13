import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  confirmSession,
  setSessionFocus,
  setDeclineSessionFocus,
  setDeclineReason,
} from "@/store/slices/sessionsSlice";
import { setOpenSession, setOpenDeclineReason, setOpenSessionDetails } from "@/store/slices/uiSlice";
import { pushToast } from "@/store/slices/toastsSlice";
import { fmtDateNice } from "@/lib/helpers";
import { SessionCard, STATUS_SCHEDULED, STATUS_CONFIRMED } from "@/components/shared/SessionCard";

export function SessionDetailDialog() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.openSession);
  const sessionFocus = useAppSelector((s) => s.sessions.sessionFocus);
  const sessions = useAppSelector((s) => s.sessions.items);
  const confirmations = useAppSelector((s) => s.sessions.confirmations);

  const [groupAnchor, setGroupAnchor] = useState<HTMLElement | null>(null);

  const displayed = sessionFocus ? [sessionFocus] : sessions;

  return (
    <Dialog
      open={open}
      onClose={() => dispatch(setOpenSession(false))}
      TransitionProps={{ onExited: () => dispatch(setSessionFocus(null)) }}
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

        <DialogContent className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto", p: 0 }}>
          <Box sx={{ px: 3, pt: 2.5, pb: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                borderRadius: 2,
                border: 1,
                borderColor: "divider",
                backgroundColor: "action.hover",
                px: 2, py: 1.25,
                fontSize: "0.8125rem",
                color: "text.secondary",
              }}
            >
              Content is shared Monday. Confirm or raise queries by Wednesday. Reminders sent 1 day and 30 min before your session.
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {displayed.map((s) => {
                const isConfirmed = confirmations[s.id];
                return (
                  <SessionCard
                    key={s.id}
                    title={s.title}
                    dateYmd={s.dateYmd}
                    start={s.start}
                    end={s.end}
                    group={s.group}
                    status={isConfirmed ? STATUS_CONFIRMED() : STATUS_SCHEDULED}
                    chips={[s.program, s.cohort, s.sessionType].filter(Boolean) as string[]}
                    sx={{ py: 2, borderBottom: 1, borderColor: "divider", "&:last-child": { borderBottom: 0 } }}
                    actions={
                      <>
                        <Button
                          variant={isConfirmed ? "soft" : "contained"}
                          size="small"
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
                          size="small"
                          onClick={() => {
                            dispatch(setDeclineSessionFocus(s));
                            dispatch(setDeclineReason(""));
                            dispatch(setOpenDeclineReason(true));
                          }}
                        >
                          <XCircle style={{ marginRight: 8, width: 16, height: 16 }} /> I'm unavailable
                        </Button>
                      </>
                    }
                    secondaryAction={
                      <Button variant="text" size="small" onClick={() => {
                        dispatch(setSessionFocus(s));
                        dispatch(setOpenSessionDetails(true));
                      }}>
                        View details
                      </Button>
                    }
                  />
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
            onClick={() => dispatch(setOpenSession(false))}
          >
            Close
          </Button>
        </DialogActions>
      </Box>

      {/* Group profile popover */}
      <Popover
        open={Boolean(groupAnchor)}
        anchorEl={groupAnchor}
        onClose={() => setGroupAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { mt: 0.75, borderRadius: 2, minWidth: 260, maxWidth: 300, boxShadow: 4 } }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>Group profile</Typography>
            <Chip size="small" color="primary" label="PDF" sx={{ height: 20, fontSize: "0.65rem" }} />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
            Cohort Feb &bull; Group 07
          </Typography>

          <Divider sx={{ mb: 1.5 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {GROUP_STATS.map(({ label, value }) => (
              <Box key={label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Typography variant="body2" fontWeight={500}>{value}</Typography>
              </Box>
            ))}
          </Box>

          <Divider sx={{ mt: 1.5, mb: 1.5 }} />

          <Button variant="soft" size="small" fullWidth onClick={() => setGroupAnchor(null)}>
            Download / open PDF
          </Button>
        </Box>
      </Popover>
    </Dialog>
  );
}
