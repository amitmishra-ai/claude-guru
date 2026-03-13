import { useNavigate } from "react-router-dom";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  Globe,
  MapPin,
  UserCircle,
  FileText,
  Video,
  Link2,
  ExternalLink,
  Presentation,
  Banknote,
  Mail,
  X,
  XCircle,
} from "lucide-react";
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
import { useAppSelector, useAppDispatch } from "@/store";
import {
  setSessionFocus,
  confirmSession,
  setDeclineSessionFocus,
  setDeclineReason,
} from "@/store/slices/sessionsSlice";
import { setOpenSessionDetails, setOpenDeclineReason } from "@/store/slices/uiSlice";
import { pushToast } from "@/store/slices/toastsSlice";
import { fmtDateNice, fmtTime12, fmtDuration, fmtInr, getTimeZoneOffsetMinutes, formatGMTOffsetFromMinutesAhead } from "@/lib/helpers";
import { demoNow } from "@/lib/constants";
import { demoCourseCatalog } from "@/data/demo-sessions";
import { dateTimeMs } from "@/lib/helpers";
import type { SessionPrepMaterial } from "@/lib/types";

const MATERIAL_ICONS: Record<SessionPrepMaterial["type"], React.ReactNode> = {
  slides: <Presentation size={14} />,
  document: <FileText size={14} />,
  video: <Video size={14} />,
  link: <Link2 size={14} />,
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
  const nowMs = demoNow.getTime();

  const handleClose = () => {
    dispatch(setOpenSessionDetails(false));
    dispatch(setSessionFocus(null));
  };

  const isConfirmed = session ? !!confirmations[session.id] : false;
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
            <X size={18} />
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
                      sx={{ borderRadius: 9999, bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }}
                    />
                  )}
                  {!isConfirmed && !isCompleted && (
                    <Chip
                      label="Scheduled"
                      size="small"
                      sx={{ borderRadius: 9999, bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)", fontWeight: 600 }}
                    />
                  )}
                  {isCompleted && (
                    <Chip
                      label="Completed"
                      size="small"
                      sx={{ borderRadius: 9999, bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }}
                    />
                  )}
                  {session.program && <Chip label={session.program} size="small" sx={{ borderRadius: 9999 }} />}
                  {session.cohort && <Chip label={session.cohort} size="small" sx={{ borderRadius: 9999 }} />}
                  {session.sessionType && <Chip label={session.sessionType} size="small" sx={{ borderRadius: 9999 }} />}
                  {session.audienceType && <Chip label={session.audienceType} size="small" sx={{ borderRadius: 9999 }} />}
                </Stack>
                <Typography variant="h6" fontWeight={600}>{session.title}</Typography>
              </Box>

              {/* Schedule info */}
              <SectionBox>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Schedule</Typography>
                <Divider sx={{ mb: 0.5 }} />
                <InfoRow label="Date">
                  <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                    <Calendar size={13} />
                    <span>{fmtDateNice(session.dateYmd)}</span>
                  </Stack>
                </InfoRow>
                <InfoRow label="Time">
                  <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                    <Clock size={13} />
                    <span>{fmtTime12(session.start)}&ndash;{fmtTime12(session.end)}</span>
                  </Stack>
                </InfoRow>
                <InfoRow label="Duration">{fmtDuration(session.start, session.end)}</InfoRow>
                {session.timeZone && (
                  <InfoRow label="Time zone">
                    <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                      <Globe size={13} />
                      <span>{session.timeZone} ({formatGMTOffsetFromMinutesAhead(getTimeZoneOffsetMinutes(session.timeZone))})</span>
                    </Stack>
                  </InfoRow>
                )}
                <InfoRow label="Location">
                  <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                    <MapPin size={13} />
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
                      <UserCircle size={13} />
                      <span>{session.scheduledByName}</span>
                    </Stack>
                    {session.scheduledByEmail && (
                      <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                        <Mail size={12} />
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
                      <Users size={13} />
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
                      <Chip key={g} label={g} size="small" sx={{ borderRadius: 9999 }} />
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
                      startIcon={<ExternalLink size={14} />}
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
                        startIcon={<FileText size={14} />}
                        onClick={() => dispatch(pushToast({ title: "Opening resume", description: "Downloading learner resume..." }))}
                      >
                        Resume
                      </Button>
                    )}
                    {session.learnerContext.linkedInUrl && (
                      <Button
                        variant="soft"
                        size="small"
                        startIcon={<ExternalLink size={14} />}
                        onClick={() => dispatch(pushToast({ title: "Opening LinkedIn", description: "Launching LinkedIn profile..." }))}
                      >
                        LinkedIn
                      </Button>
                    )}
                    {session.learnerContext.learnerProfileUrl && (
                      <Button
                        variant="soft"
                        size="small"
                        startIcon={<UserCircle size={14} />}
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
                    <Banknote size={16} style={{ color: "var(--gl-status-confirmed-text)" }} />
                    <Typography variant="subtitle2" fontWeight={600}>Remuneration</Typography>
                  </Stack>
                  <Divider sx={{ mb: 0.5 }} />
                  {session.paymentModel && (
                    <InfoRow label="Payment model">
                      <Chip
                        label={session.paymentModel === "hourly" ? "Hourly" : "Fixed Price"}
                        size="small"
                        sx={{ borderRadius: 9999 }}
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
                                  borderRadius: 9999,
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
              <Button
                variant="soft"
                size="small"
                startIcon={<XCircle size={16} />}
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
                  startIcon={<CheckCircle2 size={16} />}
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
