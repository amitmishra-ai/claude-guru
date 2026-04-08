import { useMemo } from "react";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import DoNotDisturbOnOutlinedIcon from "@mui/icons-material/DoNotDisturbOnOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  confirmSession,
  setSessionFocus,
  setDeclineSessionFocus,
  setDeclineReason,
} from "@/store/slices/sessionsSlice";
import { setOpenSession, setOpenDeclineReason, setOpenSessionDetails, setOpenSessionMaterials } from "@/store/slices/uiSlice";
import { pushToast } from "@/store/slices/toastsSlice";
import { sortByDateTime, dateTimeMs, fmtDateNice } from "@/lib/helpers";
import { demoNow } from "@/lib/constants";
import { SessionCard, STATUS_SCHEDULED, STATUS_CONFIRMED } from "@/components/shared/SessionCard";

export function SessionDetailDialog() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.openSession);
  const sessionFocus = useAppSelector((s) => s.sessions.sessionFocus);
  const sessions = useAppSelector((s) => s.sessions.items);
  const confirmations = useAppSelector((s) => s.sessions.confirmations);
  const sessionDeclined = useAppSelector((s) => s.sessions.sessionDeclined);

  const nowMs = demoNow.getTime();
  const todayYmd = demoNow.toISOString().slice(0, 10);
  const upcomingSessions = useMemo(
    () => sortByDateTime(sessions).filter((s) => dateTimeMs(s.dateYmd, s.start) >= nowMs && !sessionDeclined[s.id]),
    [sessions, sessionDeclined, nowMs]
  );
  const nextSessionId = upcomingSessions.find((s) => s.dateYmd === todayYmd)?.id ?? null;

  const displayed = sessionFocus ? [sessionFocus] : upcomingSessions;

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
          Event details &amp; confirmation
        </DialogTitle>

        <DialogContent className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto", scrollbarGutter: "stable", p: 0 }}>
          <Box sx={{ px: 3, pt: 3, pb: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                borderRadius: "8px",
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

            <Stack spacing={1.5}>
              {displayed.map((s) => {
                const isConfirmed = !!confirmations[s.id] || s.id === nextSessionId;
                return (
                  <Card key={s.id} variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <SessionCard
                      title={s.title}
                      sessionType={s.sessionType}
                      topic={s.topic}
                      batch={s.batch}
                      dateYmd={s.dateYmd}
                      start={s.start}
                      end={s.end}
                      status={isConfirmed ? STATUS_CONFIRMED() : STATUS_SCHEDULED}
                      actions={isConfirmed ? (
                        <>
                          <Button
                            variant="soft"
                            size="small"
                            startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 16 }} />}
                            onClick={() => {
                              dispatch(setSessionFocus(s));
                              dispatch(setOpenSessionMaterials(true));
                            }}
                          >
                            View Session Material
                          </Button>
                          <Button
                            variant="soft"
                            size="small"
                            startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 16 }} />}
                            onClick={() => dispatch(pushToast({ title: "Course content", description: `Viewing content for ${s.title}` }))}
                          >
                            View Course content
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            startIcon={<TaskAltOutlinedIcon sx={{ fontSize: 18 }} />}
                            size="small"
                            variant="contained"
                            onClick={() => {
                              dispatch(confirmSession(s.id));
                              dispatch(pushToast({ title: "Confirmed", description: `${s.title} \u2022 ${fmtDateNice(s.dateYmd)}` }));
                            }}
                          >
                            Confirm
                          </Button>
                          <Button
                            startIcon={<DoNotDisturbOnOutlinedIcon sx={{ fontSize: 18 }} />}
                            size="small"
                            variant="soft"
                            onClick={() => {
                              dispatch(setDeclineSessionFocus(s));
                              dispatch(setDeclineReason(""));
                              dispatch(setOpenDeclineReason(true));
                            }}
                          >
                            I'm unavailable
                          </Button>
                        </>
                      )}
                      secondaryAction={
                        <Button variant="text" size="small" onClick={() => {
                          dispatch(setSessionFocus(s));
                          dispatch(setOpenSessionDetails(true));
                        }}>
                          View details
                        </Button>
                      }
                    />
                  </Card>
                );
              })}
            </Stack>
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
    </Dialog>
  );
}
