import { useNavigate } from "react-router-dom";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import SlideshowOutlinedIcon from "@mui/icons-material/SlideshowOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  setSessionFocus,
  confirmSession,
  setDeclineSessionFocus,
  setDeclineReason,
} from "@/store/slices/sessionsSlice";
import { setOpenSessionDetails, setOpenDeclineReason, setOpenPollBuilder } from "@/store/slices/uiSlice";
import { setPollSessionId, setPollEditingId, setPollQuestion, setPollOptions } from "@/store/slices/pollsSlice";
import { pushToast } from "@/store/slices/toastsSlice";
import { fmtDateNice, fmtTime12, fmtDuration, fmtInr, getTimeZoneOffsetMinutes, formatGMTOffsetFromMinutesAhead } from "@/lib/helpers";
import { demoNow } from "@/lib/constants";
import { demoCourseCatalog } from "@/data/demo-sessions";
import { dateTimeMs, sortByDateTime } from "@/lib/helpers";
import type { SessionPrepMaterial } from "@/lib/types";

const MATERIAL_ICONS: Record<SessionPrepMaterial["type"], React.ReactNode> = {
  slides: <SlideshowOutlinedIcon sx={{ fontSize: 14 }} />,
  document: <DescriptionOutlinedIcon sx={{ fontSize: 14 }} />,
  video: <VideocamOutlinedIcon sx={{ fontSize: 14 }} />,
  link: <LinkOutlinedIcon sx={{ fontSize: 14 }} />,
};

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 1.25 }}>
      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, minWidth: 120 }}>
        {label}
      </Typography>
      <Box sx={{ textAlign: "right" }}>
        <Typography variant="body2" fontWeight={500}>{children}</Typography>
      </Box>
    </Stack>
  );
}

function SectionBox({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        borderRadius: "16px",
        border: 1,
        borderColor: "divider",
        backgroundColor: "hsl(var(--md-surface))",
        p: 2,
      }}
    >
      {children}
    </Box>
  );
}

export function SessionDetailsModal() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const open = useAppSelector((s) => s.ui.openSessionDetails);
  const session = useAppSelector((s) => s.sessions.sessionFocus);
  const confirmations = useAppSelector((s) => s.sessions.confirmations);
  const allSessions = useAppSelector((s) => s.sessions.items);
  const sessionDeclined = useAppSelector((s) => s.sessions.sessionDeclined);
  const nowMs = demoNow.getTime();

  // The next upcoming session (first in sorted upcoming list) is always treated as confirmed
  const nextSessionId = sortByDateTime(allSessions).find(
    (s) => dateTimeMs(s.dateYmd, s.start) >= nowMs && !sessionDeclined[s.id]
  )?.id ?? null;

  const handleClose = () => {
    dispatch(setOpenSessionDetails(false));
    dispatch(setSessionFocus(null));
  };

  const isConfirmed = session ? (!!confirmations[session.id] || session.id === nextSessionId) : false;
  const isCompleted = session ? dateTimeMs(session.dateYmd, session.end) < nowMs : false;
  const linkedCourse = session?.linkedCourseId
    ? demoCourseCatalog.find((c) => c.id === session.linkedCourseId)
    : null;
  const isMentoring = session?.sessionType === "Career mentoring session";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          p: 0,
          maxHeight: "85vh",
          overflow: "hidden",
          width: { xs: "calc(100vw - 1.5rem)", sm: "100%" },
          maxWidth: { xs: "calc(100vw - 1.5rem)", sm: "600px" },
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", maxHeight: "85vh" }}>
        <DialogTitle sx={{ position: "sticky", top: 0, zIndex: 10, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Session details
          <IconButton size="small" onClick={handleClose} sx={{ color: "text.secondary" }}>
            <CloseOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto", px: 3, py: 2 }}>
          {session ? (
            <Stack spacing={2.5}>
              {/* Header: Title + chips */}
              <Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1, mb: 1.5 }}>
                  {isConfirmed && (
                    <Chip
                      label="Confirmed"
                      size="small"
                      sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }}
                    />
                  )}
                  {!isConfirmed && !isCompleted && (
                    <Chip
                      label="Scheduled"
                      size="small"
                      sx={{ bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)", fontWeight: 600 }}
                    />
                  )}
                  {isCompleted && (
                    <Chip
                      label="Completed"
                      size="small"
                      sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }}
                    />
                  )}
                  {session.program && <Chip label={session.program} size="small" />}
                  {session.cohort && <Chip label={session.cohort} size="small" />}
                  {session.sessionType && <Chip label={session.sessionType} size="small" />}
                  {session.audienceType && <Chip label={session.audienceType} size="small" />}
                </Stack>
                <Typography variant="h6" fontWeight={600}>{session.title}</Typography>
              </Box>

              {/* Schedule info */}
              <SectionBox>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Schedule</Typography>
                <Divider sx={{ mb: 0.5 }} />
                <InfoRow label="Date">
                  <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} />
                    <span>{fmtDateNice(session.dateYmd)}</span>
                  </Stack>
                </InfoRow>
                <InfoRow label="Time">
                  <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                    <AccessTimeOutlinedIcon sx={{ fontSize: 13 }} />
                    <span>{fmtTime12(session.start)}&ndash;{fmtTime12(session.end)}</span>
                  </Stack>
                </InfoRow>
                <InfoRow label="Duration">{fmtDuration(session.start, session.end)}</InfoRow>
                {session.timeZone && (
                  <InfoRow label="Time zone">
                    <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                      <LanguageOutlinedIcon sx={{ fontSize: 13 }} />
                      <span>{session.timeZone} ({formatGMTOffsetFromMinutesAhead(getTimeZoneOffsetMinutes(session.timeZone))})</span>
                    </Stack>
                  </InfoRow>
                )}
                <InfoRow label="Location">
                  <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                    <PlaceOutlinedIcon sx={{ fontSize: 13 }} />
                    <span>{session.location}</span>
                  </Stack>
                </InfoRow>
              </SectionBox>

              {/* Scheduling metadata */}
              <SectionBox>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Details</Typography>
                <Divider sx={{ mb: 0.5 }} />
                {session.scheduledByName && (
                  <InfoRow label="Scheduled by">
                    <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                      <AccountCircleOutlinedIcon sx={{ fontSize: 13 }} />
                      <span>{session.scheduledByName}</span>
                    </Stack>
                    {session.scheduledByEmail && (
                      <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                        <MailOutlinedIcon sx={{ fontSize: 12 }} />
                        <Typography variant="caption" color="text.secondary">
                          {session.scheduledByEmail}
                        </Typography>
                      </Stack>
                    )}
                    {session.scheduledOnYmd && (
                      <Typography variant="caption" color="text.secondary">
                        on {fmtDateNice(session.scheduledOnYmd)}
                      </Typography>
                    )}
                  </InfoRow>
                )}
                {session.group && (
                  <InfoRow label="Group">
                    <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                      <GroupsOutlinedIcon sx={{ fontSize: 13 }} />
                      <span>{session.group}</span>
                    </Stack>
                  </InfoRow>
                )}
              </SectionBox>

              {/* Predicted groups */}
              {session.predictedGroups && session.predictedGroups.length > 0 && (
                <SectionBox>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Predicted groups</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {session.predictedGroups.map((g) => (
                      <Chip key={g} label={g} size="small" />
                    ))}
                  </Stack>
                </SectionBox>
              )}

              {/* Linked course */}
              {linkedCourse && (
                <SectionBox>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Linked course</Typography>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                    <Typography variant="body2">{linkedCourse.title}</Typography>
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 14 }} />}
                      onClick={() => {
                        handleClose();
                        navigate("/courses");
                        dispatch(pushToast({ title: "Course content", description: `Viewing ${linkedCourse.title}` }));
                      }}
                    >
                      View course
                    </Button>
                  </Stack>
                </SectionBox>
              )}

              {/* Preparation / Session materials */}
              {!isMentoring && session.prepMaterials && session.prepMaterials.length > 0 && (
                <SectionBox>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Session materials</Typography>
                  <Stack spacing={0.75}>
                    {session.prepMaterials.map((m) => (
                      <Stack
                        key={m.id}
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                          py: 0.75,
                          px: 1,
                          borderRadius: "8px",
                          "&:hover": { bgcolor: "action.hover" },
                          cursor: "pointer",
                        }}
                        onClick={() => dispatch(pushToast({ title: "Opening", description: m.label }))}
                      >
                        <Box sx={{ color: "text.secondary", display: "flex" }}>{MATERIAL_ICONS[m.type]}</Box>
                        <Typography variant="body2">{m.label}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </SectionBox>
              )}

              {/* Learner context (1:1 sessions) */}
              {isMentoring && session.learnerContext && (
                <SectionBox>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Learner context</Typography>
                  <Divider sx={{ mb: 0.5 }} />
                  {session.learnerContext.learnerName && (
                    <InfoRow label="Learner">{session.learnerContext.learnerName}</InfoRow>
                  )}
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                    {session.learnerContext.resumeUrl && (
                      <Button
                        variant="soft"
                        size="small"
                        startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 14 }} />}
                        onClick={() => dispatch(pushToast({ title: "Opening resume", description: "Downloading learner resume..." }))}
                      >
                        Resume
                      </Button>
                    )}
                    {session.learnerContext.linkedInUrl && (
                      <Button
                        variant="soft"
                        size="small"
                        startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 14 }} />}
                        onClick={() => dispatch(pushToast({ title: "Opening LinkedIn", description: "Launching LinkedIn profile..." }))}
                      >
                        LinkedIn
                      </Button>
                    )}
                    {session.learnerContext.learnerProfileUrl && (
                      <Button
                        variant="soft"
                        size="small"
                        startIcon={<AccountCircleOutlinedIcon sx={{ fontSize: 14 }} />}
                        onClick={() => dispatch(pushToast({ title: "Opening profile", description: "Launching learner profile..." }))}
                      >
                        Learner profile
                      </Button>
                    )}
                  </Stack>
                  {session.learnerContext.notes && (
                    <Box
                      sx={{
                        mt: 1.5,
                        p: 1.5,
                        borderRadius: "12px",
                        bgcolor: "hsl(var(--md-surface-container) / 0.3)",
                        fontSize: "0.8125rem",
                        color: "hsl(var(--md-on-surface-variant))",
                      }}
                    >
                      {session.learnerContext.notes}
                    </Box>
                  )}
                </SectionBox>
              )}

              {/* Remuneration (confirmed or completed sessions) */}
              {(isConfirmed || isCompleted) && session.paymentAmountInr && (
                <SectionBox>
                  <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
                    <SavingsOutlinedIcon sx={{ fontSize: 16, color: "var(--gl-status-confirmed-text)" }} />
                    <Typography variant="subtitle2" fontWeight={600}>Remuneration</Typography>
                  </Stack>
                  <Divider sx={{ mb: 0.5 }} />
                  {session.paymentModel && (
                    <InfoRow label="Payment model">
                      <Chip
                        label={session.paymentModel === "hourly" ? "Hourly" : "Fixed Price"}
                        size="small"
                                             />
                    </InfoRow>
                  )}
                  {session.paymentModel === "hourly" && session.hourlyRateInr && (
                    <InfoRow label="Hourly rate">{fmtInr(session.hourlyRateInr)}/hr</InfoRow>
                  )}
                  <InfoRow label="Session fee">{fmtInr(session.paymentAmountInr)}</InfoRow>

                  {isCompleted && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                        Post-completion earnings
                      </Typography>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: "12px",
                          bgcolor: "hsl(var(--md-surface-container) / 0.3)",
                        }}
                      >
                        <Stack spacing={1}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">Total earnings</Typography>
                            <Typography variant="subtitle2" fontWeight={700}>
                              {fmtInr(session.totalEarningsInr ?? session.paymentAmountInr)}
                            </Typography>
                          </Stack>
                          {session.paymentModel === "hourly" && session.hourlyRateInr && (
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" color="text.secondary">Breakdown</Typography>
                              <Typography variant="body2">
                                {fmtInr(session.hourlyRateInr)}/hr &times; {fmtDuration(session.start, session.end)}
                              </Typography>
                            </Stack>
                          )}
                          {session.paymentStatus && (
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" color="text.secondary">Status</Typography>
                              <Chip
                                label={
                                  session.paymentStatus === "paid" ? "Paid"
                                    : session.paymentStatus === "invoice_pending" ? "Invoice Pending"
                                    : "Invoice Not Raised"
                                }
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  ...(session.paymentStatus === "paid"
                                    ? { bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)" }
                                    : session.paymentStatus === "invoice_pending"
                                    ? { bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)" }
                                    : {}
                                  ),
                                }}
                              />
                            </Stack>
                          )}
                          {session.transactionId && (
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" color="text.secondary">Transaction ID</Typography>
                              <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                                {session.transactionId}
                              </Typography>
                            </Stack>
                          )}
                          {session.invoiceId && (
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" color="text.secondary">Invoice ID</Typography>
                              <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                                {session.invoiceId}
                              </Typography>
                            </Stack>
                          )}
                        </Stack>
                      </Box>
                    </>
                  )}
                </SectionBox>
              )}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">No session selected.</Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ position: "sticky", bottom: 0, zIndex: 10, borderTop: 1, borderColor: "divider", bgcolor: "background.paper", px: 3, py: 2, justifyContent: "space-between" }}>
          <Button variant="text" color="inherit" onClick={handleClose}>
            Close
          </Button>
          {session && !isCompleted && (
            <Stack direction="row" spacing={1}>
              {isConfirmed && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PollOutlinedIcon sx={{ fontSize: 16 }} />}
                  onClick={() => {
                    dispatch(setPollSessionId(session.id));
                    dispatch(setPollEditingId(null));
                    dispatch(setPollQuestion(""));
                    dispatch(setPollOptions(["", ""]));
                    dispatch(setOpenSessionDetails(false));
                    dispatch(setOpenPollBuilder(true));
                  }}
                >
                  Create New Poll
                </Button>
              )}
              <Button
                variant="soft"
                size="small"
                startIcon={<CancelOutlinedIcon sx={{ fontSize: 16 }} />}
                onClick={() => {
                  dispatch(setDeclineSessionFocus(session));
                  dispatch(setDeclineReason(""));
                  dispatch(setOpenSessionDetails(false));
                  dispatch(setOpenDeclineReason(true));
                }}
              >
                I'm unavailable
              </Button>
              {!isConfirmed && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CheckCircleOutlinedIcon sx={{ fontSize: 16 }} />}
                  onClick={() => {
                    dispatch(confirmSession(session.id));
                    dispatch(pushToast({ title: "Confirmed", description: `${session.title} \u2022 ${fmtDateNice(session.dateYmd)}` }));
                  }}
                >
                  Confirm
                </Button>
              )}
            </Stack>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
}