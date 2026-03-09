import { CheckCircle2, XCircle } from "lucide-react";
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
        className: "p-0 max-h-[85vh] overflow-hidden w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-2xl",
      }}
    >
      <div className="flex max-h-[85vh] flex-col">
        <DialogTitle sx={{ position: 'sticky', top: 0, zIndex: 10, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', px: 3, py: 2 }}>
          Session details &amp; confirmation
        </DialogTitle>

        <DialogContent className="flex-1 overflow-y-auto themed-scrollbar" sx={{ padding: '1rem 1.5rem' }}>
          <div className="space-y-4">
            <div className="rounded-2xl border bg-surface-container/30 p-3 text-sm text-on-surface-variant">
              Cadence: content Monday &rarr; acknowledgement/clarity by Wednesday &rarr; reminders (1 day + 30 min).
            </div>

            <div className="space-y-2">
              {displayed.map((s) => {
                const isConfirmed = confirmations[s.id];
                return (
                  <div key={s.id} className="py-4 border-b last:border-b-0">
                    <div className="space-y-3">
                      <div className="min-w-0">
                        <div className="text-lg font-semibold">{s.title}</div>
                        <div className="mt-1 text-sm text-on-surface-variant">
                          {fmtDateNice(s.dateYmd)} &bull; {fmtTime12(s.start)}&ndash;{fmtTime12(s.end)} &bull; {s.group}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Chip variant="outlined" size="small" label={s.program} />
                          <Chip variant="outlined" size="small" label={s.cohort} />
                          <Chip variant="outlined" size="small" label={s.sessionType} />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant={isConfirmed ? "outlined" : "contained"}
                            sx={isConfirmed
                              ? { borderColor: 'var(--gl-status-confirmed-border)', bgcolor: 'var(--gl-status-confirmed-bg)', color: 'var(--gl-status-confirmed-text)', '&:hover': { bgcolor: 'var(--gl-status-confirmed-bg)', borderColor: 'var(--gl-status-confirmed-border)' } }
                              : { bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }
                            }
                            onClick={() => {
                              if (isConfirmed) return;
                              dispatch(confirmSession(s.id));
                              dispatch(pushToast({ title: "Confirmed", description: `${s.title} \u2022 ${fmtDateNice(s.dateYmd)}` }));
                            }}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" /> {isConfirmed ? "Confirmed" : "Confirm"}
                          </Button>

                          <Button
                            variant={!isConfirmed ? "outlined" : "outlined"}
                            color="inherit"
                            onClick={() => {
                              dispatch(setDeclineSessionFocus(s));
                              dispatch(setDeclineReason(""));
                              dispatch(setOpenDeclineReason(true));
                            }}
                          >
                            <XCircle className="mr-2 h-4 w-4" /> I'm unavailable
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2 sm:justify-end">
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{ fontSize: '0.75rem' }}
                            onClick={() => dispatch(setOpenGroupProfile(true))}
                          >
                            Group profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>

        <DialogActions sx={{ position: 'sticky', bottom: 0, zIndex: 10, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper', px: 3, py: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            onClick={() => {
              dispatch(setOpenSession(false));
              dispatch(setSessionFocus(null));
            }}
          >
            Close
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
}
