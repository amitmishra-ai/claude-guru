import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Link2,
  ListChecks,
  Star,
  TrendingUp,
  Users,
  Video,
  BookOpen,
  Calendar,
  Pencil,
  Trash2,
} from "lucide-react";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import DoNotDisturbOnOutlinedIcon from "@mui/icons-material/DoNotDisturbOnOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import EventNoteIcon from "@mui/icons-material/EventNote";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { keyframes } from "@mui/system";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  setSessionFocus,
  confirmSession,
  clearRecentlyConfirmed,
  acceptSession,
  setHomeSessionsView,
  setDeclineSessionFocus,
  setDeclineReason,
  setSelectedSessionType,
} from "@/store/slices/sessionsSlice";
import { removeUnavailableBySessionId } from "@/store/slices/availabilitySlice";
import {
  setOpenSession,
  setOpenAvailability,
  setOpenDeclineReason,
  setImpactOpen,
  setOpenLearnerRatings,
  setLearnerRatingsSessionId,
  setOpenPollBuilder,
  setOpenSessionDetails,
} from "@/store/slices/uiSlice";
import { pushToast } from "@/store/slices/toastsSlice";
import {
  setPollSessionId,
  setPollEditingId,
  setPollQuestion,
  setPollOptions,
  removePoll,
} from "@/store/slices/pollsSlice";
import {
  sortByDateTime,
  dateTimeMs,
  fmtTime12,
  fmtDateNice,
  isSessionCompleted,
} from "@/lib/helpers";
import { demoNow } from "@/lib/constants";
import { demoRatingHistory, demoLearnerRatingsBySessionId, demoPreviouslyDeclinedSessions } from "@/data/demo-sessions";
import { StatTile } from "@/components/shared/StatTile";
import { SessionCard, STATUS_SCHEDULED, STATUS_CONFIRMED, STATUS_DECLINED } from "@/components/shared/SessionCard";
import type { Session, SessionType } from "@/lib/types";

const slideOutDown = keyframes`
  0%   { opacity: 1; transform: translateY(0)     scale(1);   }
  100% { opacity: 0; transform: translateY(16px)  scale(0.97); }
`;

const slideInFromAbove = keyframes`
  0%   { opacity: 0; transform: translateY(-16px) scale(0.97); }
  100% { opacity: 1; transform: translateY(0)     scale(1);   }
`;

const SESSION_TYPES: Array<"All" | SessionType> = [
  "All",
  "Online session",
  "Career mentoring session",
  "Capstone project mentoring session",
  "Schedule a call",
  "Industry session",
  "Online class",
  "Others",
];

/* ── Task card used in sidebar ── */
function TaskCard({
  chipLabel,
  chipColor,
  chipBg,
  chipBorder,
  title,
  description,
  action,
  extra,
}: {
  chipLabel: string;
  chipColor: string;
  chipBg: string;
  chipBorder?: string;
  title: string;
  description: string;
  action: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 2.5 }}
    >
      <Stack spacing={1.5}>
        <Box>{extra ? <Stack direction="row" justifyContent="space-between" alignItems="center">{<Chip label={chipLabel} size="small" sx={{ borderRadius: 9999, bgcolor: chipBg, color: chipColor, border: chipBorder ? `1px solid ${chipBorder}` : undefined, fontWeight: 600, fontSize: '0.7rem' }} />}{extra}</Stack> : <Chip label={chipLabel} size="small" sx={{ borderRadius: 9999, bgcolor: chipBg, color: chipColor, border: chipBorder ? `1px solid ${chipBorder}` : undefined, fontWeight: 600, fontSize: '0.7rem' }} />}</Box>
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>{title}</Typography>
          <Typography variant="caption" color="text.secondary">{description}</Typography>
        </Box>
        {action}
      </Stack>
    </Paper>
  );
}

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const sessions = useAppSelector((s) => s.sessions.items);
  const confirmations = useAppSelector((s) => s.sessions.confirmations);
  const sessionDeclined = useAppSelector((s) => s.sessions.sessionDeclined);
  const homeSessionsView = useAppSelector((s) => s.sessions.homeSessionsView);
  const impactOpen = useAppSelector((s) => s.ui.impactOpen);
  const hasUserConfiguredAvailability = useAppSelector((s) => s.availability.hasUserConfiguredAvailability);
  const maxPerWeek = useAppSelector((s) => s.availability.maxPerWeek);
  const rangeDays = useAppSelector((s) => s.availability.rangeDays);
  const calendarConnected = useAppSelector((s) => s.availability.calendarConnected);
  const requests = useAppSelector((s) => s.requests.items);
  const guruName = useAppSelector((s) => s.profile.guruName);
  const polls = useAppSelector((s) => s.polls.items);
  const selectedSessionType = useAppSelector((s) => s.sessions.selectedSessionType);
  const recentlyConfirmedIds = useAppSelector((s) => s.sessions.recentlyConfirmedIds);

  /* ── local state for exit animation ─────────────────────────────── */
  const [exitingId, setExitingId] = useState<string | null>(null);

  /* ── clean up recentlyConfirmedIds (same pattern as Calendar) ───── */
  useEffect(() => {
    const ids = Object.keys(recentlyConfirmedIds);
    if (ids.length === 0) return;
    const timers = ids.map((id) => {
      const elapsed = Date.now() - (recentlyConfirmedIds[id] || 0);
      const remaining = Math.max(0, 2000 - elapsed);
      return setTimeout(() => dispatch(clearRecentlyConfirmed(id)), remaining);
    });
    return () => timers.forEach(clearTimeout);
  }, [recentlyConfirmedIds, dispatch]);

  const nowMs = demoNow.getTime();

  const upcomingSessions = useMemo(
    () => sortByDateTime(sessions).filter((s) => dateTimeMs(s.dateYmd, s.start) >= nowMs && !sessionDeclined[s.id]),
    [sessions, sessionDeclined, nowMs]
  );
  const completedSessions = useMemo(
    () => sortByDateTime(sessions).filter((s) => isSessionCompleted(s, nowMs)),
    [sessions, nowMs]
  );
  const filteredCompletedSessions = useMemo(
    () =>
      selectedSessionType === "All"
        ? completedSessions
        : completedSessions.filter((s) => s.sessionType === selectedSessionType),
    [completedSessions, selectedSessionType]
  );
  const declinedSessions = useMemo(
    () => sessions.filter((s) => sessionDeclined[s.id]),
    [sessions, sessionDeclined]
  );

  const confirmedCount = upcomingSessions.filter((s) => confirmations[s.id]).length;
  const scheduled = upcomingSessions.filter((s) => !confirmations[s.id]);
  const confirmedUpcoming = upcomingSessions.filter((s) => confirmations[s.id]);

  // Display lists that account for the exit animation window:
  // Keep the exiting card in the scheduled list until its animation finishes,
  // and hide it from confirmedUpcoming until exitingId is cleared.
  const scheduledDisplay = exitingId
    ? upcomingSessions.filter((s) => !confirmations[s.id] || s.id === exitingId)
    : scheduled;
  const confirmedDisplay = exitingId
    ? confirmedUpcoming.filter((s) => s.id !== exitingId)
    : confirmedUpcoming;

  const needsWednesdayConfirm = scheduled.length > 0;
  const pendingRequestsCount = requests.filter((r) => r.response === "pending").length;
  const nextSessions = upcomingSessions.slice(0, 2);

  const impact = useMemo(() => {
    const rating = demoRatingHistory.length
      ? demoRatingHistory.reduce((a, r) => a + r.score, 0) / demoRatingHistory.length
      : 0;
    return {
      rating,
      engagementHours: 42,
      engagementCount: sessions.length,
      learnersImpacted: 180,
    };
  }, [sessions]);

  return (
    <Stack spacing={3}>
      {/* ── Welcome header ── */}
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
          Welcome {guruName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Mark availability, respond to requests, and confirm by Wednesday.
        </Typography>
      </Box>

      {/* ── Availability gate ── */}
      {!hasUserConfiguredAvailability && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2.5,
            py: 12,
            borderRadius: 3,
            border: '2px dashed',
            borderColor: 'divider',
            bgcolor: 'action.hover',
            textAlign: 'center',
            px: 4,
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <EventNoteIcon sx={{ fontSize: 36, color: 'primary.contrastText' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75 }}>
              Set your availability to get started
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: 'auto' }}>
              Without marking your availability, no sessions will be scheduled with you. Let learners know when you're free so they can book time with you.
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<EditCalendarIcon sx={{ fontSize: 18 }} />}
            sx={{ textTransform: 'none', px: 4 }}
            onClick={() => dispatch(setOpenAvailability(true))}
          >
            Set your availability
          </Button>
        </Box>
      )}

      {/* ── Main layout ── */}
      {hasUserConfiguredAvailability && <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Left column (2/3) */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            {/* Impact card */}
            <Card>
              <Box
                onClick={() => dispatch(setImpactOpen(!impactOpen))}
                sx={{
                  px: 3,
                  py: 2,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  '&:hover': { bgcolor: 'action.hover' },
                  transition: 'background 0.15s',
                }}
              >
                <Box>
                  <Typography variant="h6" fontWeight={600}>Your Impact</Typography>
                  {!impactOpen && (
                    <Typography variant="caption" color="text.secondary">
                      Avg Ratings: {impact.rating.toFixed(1)} &bull; Hours taught: {impact.engagementHours} &bull; Sessions: {impact.engagementCount}
                    </Typography>
                  )}
                </Box>
                <IconButton size="small" sx={{ ml: 1 }}>
                  {impactOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </IconButton>
              </Box>
              {impactOpen && (
                <CardContent sx={{ pt: 0 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <StatTile icon={Star} label="Rating" value={impact.rating.toFixed(1)} color="var(--gl-stat-rating)" />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <StatTile icon={Clock} label="Hours" value={impact.engagementHours} color="var(--gl-stat-hours)" />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <StatTile icon={TrendingUp} label="Sessions" value={impact.engagementCount} color="var(--gl-stat-sessions)" />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <StatTile icon={Users} label="Learners" value={impact.learnersImpacted} color="var(--gl-stat-learners)" />
                    </Grid>
                  </Grid>
                </CardContent>
              )}
            </Card>

            {/* Mobile tasks (horizontal scroll) */}
            {(needsWednesdayConfirm || pendingRequestsCount > 0 || !hasUserConfiguredAvailability) && (
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <ListChecks size={16} />
                  <Typography variant="subtitle2" fontWeight={600}>Tasks</Typography>
                </Stack>
                <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
                  {!hasUserConfiguredAvailability && (
                    <Box sx={{ minWidth: 280, flexShrink: 0 }}>
                      <TaskCard
                        chipLabel="Needs update"
                        chipColor="var(--gl-status-declined-text)"
                        chipBg="var(--gl-status-declined-bg)"
                        chipBorder="var(--gl-status-declined-border)"
                        title="Add your availability"
                        description={`Keep availability up-to-date for next ${rangeDays} days.`}
                        action={
                          <Button size="small" variant="contained" onClick={() => dispatch(setOpenAvailability(true))}>
                            Update availability
                          </Button>
                        }
                      />
                    </Box>
                  )}
                  {needsWednesdayConfirm && (
                    <Box sx={{ minWidth: 280, flexShrink: 0 }}>
                      <TaskCard
                        chipLabel="Action needed"
                        chipColor="var(--gl-status-declined-text)"
                        chipBg="var(--gl-status-declined-bg)"
                        chipBorder="var(--gl-status-declined-border)"
                        title="Confirm sessions by Wednesday"
                        description="Ops needs clarity ~72 hours before weekend sessions."
                        extra={<Chip label={`Confirmed ${confirmedCount} / ${sessions.length}`} size="small" sx={{ borderRadius: 9999, fontSize: '0.65rem' }} />}
                        action={
                          <Button size="small" variant="soft" onClick={() => dispatch(setOpenSession(true))}>
                            Review confirmations
                          </Button>
                        }
                      />
                    </Box>
                  )}
                  {pendingRequestsCount > 0 && (
                    <Box sx={{ minWidth: 280, flexShrink: 0 }}>
                      <TaskCard
                        chipLabel={String(pendingRequestsCount)}
                        chipColor="white"
                        chipBg="primary.main"
                        title="Respond to upcoming requests"
                        description="Indicate availability against real upcoming slots."
                        action={
                          <Button size="small" variant="soft" onClick={() => navigate("/calendar")}>
                            Review calendar
                          </Button>
                        }
                      />
                    </Box>
                  )}
                </Stack>
              </Box>
            )}

            {/* Sessions card */}
            <Card data-testid="home-sessions-card">
              <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, pb: 1 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'flex-start' }} spacing={1} useFlexGap>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>Sessions</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quick access to upcoming, confirmations, and history.
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="soft"
                    sx={{ flexShrink: 0 }}
                    onClick={() => navigate("/calendar")}
                  >
                    View calendar
                  </Button>
                </Stack>
              </Box>
              <Box sx={{ px: { xs: 2, sm: 3 }, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ overflowX: 'auto' }}>
                  <ToggleButtonGroup
                    value={homeSessionsView}
                    exclusive
                    onChange={(_e, v) => { if (v !== null) dispatch(setHomeSessionsView(v)); }}
                    size="small"
                    sx={{
                      bgcolor: 'action.hover',
                      borderRadius: '10px',
                      p: '4px',
                      gap: '4px',
                      whiteSpace: 'nowrap',
                      '& .MuiToggleButtonGroup-grouped': {
                        border: '0 !important',
                        borderRadius: '7px !important',
                      },
                      '& .MuiToggleButton-root': {
                        textTransform: 'none',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        px: 2,
                        py: 0.625,
                        color: 'text.secondary',
                        '&:hover': { bgcolor: 'transparent', color: 'text.primary' },
                        '&.Mui-selected': {
                          bgcolor: 'background.paper',
                          color: 'text.primary',
                          fontWeight: 600,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)',
                          '&:hover': { bgcolor: 'background.paper' },
                        },
                      },
                    }}
                  >
                    <ToggleButton value="next">{`Upcoming (${upcomingSessions.length})`}</ToggleButton>
                    <ToggleButton value="completed">{`Completed (${completedSessions.length})`}</ToggleButton>
                    <ToggleButton value="declined">{`Declined (${declinedSessions.length})`}</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Box>

              <CardContent>
                <Stack spacing={3}>
                  {homeSessionsView === "next" && (
                    <>
                      {/* Next session featured */}
                      <Paper
                        variant="outlined"
                        sx={{
                          p: { xs: 2, sm: 3 },
                          borderLeft: 4,
                          borderLeftColor: 'primary.main',
                        }}
                      >
                        <Typography variant="overline" color="text.secondary">Next session</Typography>
                        {nextSession ? (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="h5" fontWeight={600} sx={{ fontSize: { xs: '1.125rem', md: '1.5rem' } }}>{nextSession.title}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {fmtDateNice(nextSession.dateYmd)} &bull; {fmtTime12(nextSession.start)}&ndash;{fmtTime12(nextSession.end)} &bull; {nextSession.group}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
                              <Chip label={nextSession.program} size="small" variant="outlined" sx={{ borderRadius: 9999 }} />
                              <Chip label={nextSession.cohort} size="small" variant="outlined" sx={{ borderRadius: 9999 }} />
                              <Chip label={nextSession.location} size="small" variant="outlined" sx={{ borderRadius: 9999 }} />
                            </Stack>
                            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5} sx={{ mt: 3 }} useFlexGap>
                              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                {(() => {
                                  const sessionStartMs = dateTimeMs(ns.dateYmd, ns.start);
                                  const joinEnabled = nowMs >= sessionStartMs - 30 * 60 * 1000;
                                  return (
                                    <Button
                                      variant="contained"
                                      size="small"
                                      startIcon={<Link2 size={16} />}
                                      disabled={!joinEnabled}
                                      onClick={() => dispatch(pushToast({ title: "Joining session", description: "Launching join link..." }))}
                                    >
                                      Join link
                                    </Button>
                                  );
                                })()}
                                <Button
                                  variant="soft"
                                  size="small"
                                  startIcon={<BookOpen size={16} />}
                                  onClick={() => dispatch(pushToast({ title: "Downloading slides", description: "Preparing download..." }))}
                                >
                                  Download slides
                                </Button>
                                <Button
                                  variant="soft"
                                  size="small"
                                                                   onClick={() => {
                                    dispatch(setPollSessionId(nextSession.id));
                                    dispatch(setPollEditingId(null));
                                    dispatch(setPollQuestion(""));
                                    dispatch(setPollOptions(["", "", "", ""]));
                                    dispatch(setOpenPollBuilder(true));
                                  }}
                                >
                                  Create poll
                                </Button>
                              </Stack>
                              <Button
                                variant="text"
                                size="small"
                                                               onClick={() => dispatch(setOpenGroupProfile(true))}
                              >
                                Group profile
                              </Button>
                            </Stack>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No upcoming sessions.</Typography>
                        )}
                      </Paper>

                      {/* Up next: scheduled + confirmed sessions */}
                      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography variant="overline" color="text.secondary">Up next</Typography>

                        {/* Scheduled sessions */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 2, gap: 1 }}>
                          <Typography variant="subtitle2" fontWeight={600}>Scheduled sessions</Typography>
                          <Chip label={`${scheduled.length} scheduled`} size="small" sx={{ borderRadius: 9999 }} />
                        </Stack>
                        {scheduled.length > 0 && (
                          <Chip
                            label="Confirm by Wednesday, 6:00 PM to help ops finalize allocations."
                            size="small"
                            sx={{ mt: 1, borderRadius: 9999, bgcolor: 'var(--gl-status-pending-bg)', color: 'var(--gl-status-pending-text)', border: '1px solid var(--gl-status-pending-border)', fontWeight: 500 }}
                          />
                        )}
                        <Stack divider={<Divider />} sx={{ mt: 2 }}>
                          {scheduled.length ? (
                            scheduledDisplay.map((s) => {
                              const isExiting = s.id === exitingId && !!confirmations[s.id];
                              return (
                              <SessionCard
                                key={s.id}
                                title={s.title}
                                dateYmd={s.dateYmd}
                                start={s.start}
                                end={s.end}
                                group={s.group}
                                status={STATUS_SCHEDULED}
                                chips={[s.program, s.cohort, s.location].filter(Boolean)}
                                sx={{
                                  py: 2.5,
                                  ...(isExiting && {
                                    animation: `${slideOutDown} 0.38s ease forwards`,
                                    pointerEvents: 'none',
                                  }),
                                }}
                                actions={
                                  <>
                                    <Button
                                      startIcon={<TaskAltRoundedIcon sx={{ fontSize: 18 }} />}
                                      size="small"
                                      variant={confirmations[s.id] ? "soft" : "contained"}
                                      sx={{
                                        transition: 'background-color 0.4s ease, border-color 0.4s ease, color 0.4s ease',
                                        ...(confirmations[s.id]
                                          ? { borderColor: 'var(--gl-status-confirmed-border)', bgcolor: 'var(--gl-status-confirmed-bg)', color: 'var(--gl-status-confirmed-text)', '&:hover': { bgcolor: 'var(--gl-status-confirmed-bg)' } }
                                          : {}),
                                      }}
                                      onClick={() => {
                                        if (confirmations[s.id]) return;
                                        setExitingId(s.id);
                                        dispatch(confirmSession(s.id));
                                        dispatch(pushToast({ title: "Confirmed", description: `${s.title} \u2022 ${fmtDateNice(s.dateYmd)}` }));
                                        setTimeout(() => setExitingId(null), 420);
                                      }}
                                    >
                                      {confirmations[s.id] ? "Confirmed" : "Confirm"}
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
                            })
                          ) : (
                            <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">No scheduled sessions.</Typography>
                            </Paper>
                          )}
                        </Stack>

                        {/* Confirmed sessions */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 4, gap: 1 }}>
                          <Typography variant="subtitle2" fontWeight={600}>Confirmed sessions</Typography>
                          <Chip label={`${confirmedUpcoming.length} confirmed`} size="small" sx={{ borderRadius: 9999 }} />
                        </Stack>
                        <Stack divider={<Divider />} sx={{ mt: 2 }}>
                          {confirmedUpcoming.length ? (
                            confirmedDisplay.map((s) => (
                              <SessionCard
                                key={s.id}
                                title={s.title}
                                dateYmd={s.dateYmd}
                                start={s.start}
                                end={s.end}
                                group={s.group}
                                status={STATUS_CONFIRMED(<TaskAltRoundedIcon sx={{ fontSize: 14 }} />)}
                                chips={[s.program, s.cohort, s.location].filter(Boolean)}
                                sx={{
                                  py: 2.5,
                                  ...(recentlyConfirmedIds[s.id] && {
                                    animation: `${slideInFromAbove} 0.38s ease forwards`,
                                  }),
                                }}
                              >
                                {/* Row 1: Status chip + category chips */}
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                                  <Chip
                                    icon={<TaskAltRoundedIcon sx={{ fontSize: 14, color: 'var(--gl-status-confirmed-text)' }} />}
                                    label="Confirmed"
                                    size="small"
                                    sx={{ borderRadius: 9999, bgcolor: 'var(--gl-status-confirmed-bg)', color: 'var(--gl-status-confirmed-text)', border: '1px solid var(--gl-status-confirmed-border)', fontWeight: 600 }}
                                  />
                                  {s.program && <Chip label={s.program} size="small" variant="outlined" sx={{ borderRadius: 9999 }} />}
                                  {s.cohort && <Chip label={s.cohort} size="small" variant="outlined" sx={{ borderRadius: 9999 }} />}
                                  {s.location && <Chip label={s.location} size="small" variant="outlined" sx={{ borderRadius: 9999 }} />}
                                </Stack>

                                {/* Row 2: Title */}
                                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>{s.title}</Typography>

                                {/* Row 3: Date + group */}
                                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2.5, color: 'text.secondary' }}>
                                  <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <Calendar size={14} />
                                    <Typography variant="body2" color="text.secondary">
                                      {fmtDateNice(s.dateYmd)} &bull; {fmtTime12(s.start)}&ndash;{fmtTime12(s.end)}
                                    </Typography>
                                  </Stack>
                                  {s.group && (
                                    <>
                                      <Typography variant="body2" color="text.disabled">&middot;</Typography>
                                      <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <Users size={14} />
                                        <Typography variant="body2" color="text.secondary">{s.group}</Typography>
                                      </Stack>
                                    </>
                                  )}
                                </Stack>

                                {/* Row 4: Link-style actions */}
                                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                  <Button
                                    variant="text"
                                    size="small"
                                    startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
                                    onClick={() => dispatch(pushToast({ title: "Downloading slides", description: "Preparing download..." }))}
                                  >
                                    Download Slides
                                  </Button>
                                  <Button
                                    variant="text"
                                    size="small"
                                    startIcon={<OpenInNewRoundedIcon sx={{ fontSize: 16 }} />}
                                    onClick={() => {
                                      navigate("/courses");
                                      dispatch(pushToast({ title: "Course content", description: `Viewing content for ${s.title}` }));
                                    }}
                                  >
                                    View Course content
                                  </Button>
                                </Stack>
                              </Box>
                            ))
                          ) : (
                            <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">No confirmed sessions.</Typography>
                            </Paper>
                          )}
                        </Stack>
                      </Paper>
                    </>
                  )}

                  {homeSessionsView === "completed" && (
                    <>
                      <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 220 } }}>
                        <InputLabel>Filter by session type</InputLabel>
                        <Select
                          label="Filter by session type"
                          value={selectedSessionType}
                          onChange={(e) => dispatch(setSelectedSessionType(e.target.value as typeof selectedSessionType))}
                                                 >
                          {SESSION_TYPES.map((t) => (
                            <MenuItem key={t} value={t}>{t}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {filteredCompletedSessions.length > 0 ? (
                        <Stack divider={<Divider />}>
                          {filteredCompletedSessions.map((s) => {
                            const ratings = demoLearnerRatingsBySessionId[s.id];
                            const hasRatings = ratings && ratings.length > 0;
                            const avg = hasRatings
                              ? (ratings.reduce((a, r) => a + r.rating, 0) / ratings.length).toFixed(1)
                              : null;
                            return (
                              <Box key={s.id} sx={{ py: 2.5 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="h6" fontWeight={600}>{s.title}</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                      {fmtDateNice(s.dateYmd)} &bull; {fmtTime12(s.start)}&ndash;{fmtTime12(s.end)}
                                    </Typography>
                                  </Box>
                                  {avg && (
                                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
                                      <Star size={14} style={{ color: "var(--gl-star-color)" }} />
                                      <Typography variant="subtitle2" fontWeight={600}>{avg}</Typography>
                                    </Stack>
                                  )}
                                </Stack>
                                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
                                  <Chip label={s.sessionType} size="small" variant="outlined" sx={{ borderRadius: 9999, fontSize: '0.7rem' }} />
                                  <Chip label={s.program} size="small" variant="outlined" sx={{ borderRadius: 9999, fontSize: '0.7rem' }} />
                                </Stack>
                                <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
                                  {s.recordingUrl && (
                                    <Button
                                      startIcon={<Video size={14} />}
                                      variant="soft"
                                      size="small"
                                                                           onClick={() => dispatch(pushToast({ title: "Opening recording", description: `Launching recording for ${s.title}` }))}
                                    >
                                      Watch recording
                                    </Button>
                                  )}
                                  {hasRatings && (
                                    <Button
                                      startIcon={<Star size={14} />}
                                      variant="soft"
                                      size="small"
                                                                           onClick={() => {
                                        dispatch(setLearnerRatingsSessionId(s.id));
                                        dispatch(setOpenLearnerRatings(true));
                                      }}
                                    >
                                      View ratings
                                    </Button>
                                  )}
                                  <Button
                                    startIcon={<TrendingUp size={14} />}
                                    variant="soft"
                                    size="small"
                                                                       onClick={() => navigate("/profile")}
                                  >
                                    View in payments
                                  </Button>
                                </Stack>
                              </Box>
                            );
                          })}
                        </Stack>
                      ) : (
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Typography variant="body2" color="text.secondary">No completed sessions yet.</Typography>
                        </Paper>
                      )}
                    </>
                  )}

                  {homeSessionsView === "declined" && (
                    <>
                      {declinedSessions.length > 0 && (
                        <>
                          <Typography variant="overline" color="text.secondary">Active declined</Typography>
                          <Stack divider={<Divider />}>
                            {declinedSessions.map((s) => (
                              <SessionCard
                                key={s.id}
                                title={s.title}
                                dateYmd={s.dateYmd}
                                start={s.start}
                                end={s.end}
                                titleFirst
                                status={STATUS_DECLINED}
                                sx={{ py: 2.5 }}
                                actions={
                                  <Button
                                    startIcon={<TaskAltRoundedIcon sx={{ fontSize: 18 }} />}
                                    variant="soft"
                                    size="small"
                                    onClick={() => {
                                      dispatch(acceptSession(s.id));
                                      dispatch(removeUnavailableBySessionId(s.id));
                                      dispatch(pushToast({ title: "Session accepted", description: `${s.title} · ${fmtDateNice(s.dateYmd)}` }));
                                    }}
                                  >
                                    Accept
                                  </Button>
                                }
                              />
                            ))}
                          </Stack>
                        </>
                      )}

                      {demoPreviouslyDeclinedSessions.length > 0 && (
                        <>
                          <Typography variant="overline" color="text.secondary" sx={{ mt: 2 }}>Previously declined</Typography>
                          <Stack divider={<Divider />}>
                            {demoPreviouslyDeclinedSessions.map((s) => (
                              <SessionCard
                                key={s.id}
                                title={s.title}
                                dateYmd={s.dateYmd}
                                start={s.start}
                                end={s.end}
                                titleFirst
                                status={{ label: "Declined", bg: "action.hover", color: "text.secondary", border: "transparent" }}
                                sx={{ py: 2.5, opacity: 0.6 }}
                                actions={
                                  <Button variant="soft" size="small" disabled>
                                    Confirm
                                  </Button>
                                }
                              />
                            ))}
                          </Stack>
                        </>
                      )}

                      {declinedSessions.length === 0 && demoPreviouslyDeclinedSessions.length === 0 && (
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Typography variant="body2" color="text.secondary">No declined sessions.</Typography>
                        </Paper>
                      )}
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Right column: Tasks sidebar (desktop only) */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Card data-testid="tasks-card" sx={{ position: 'sticky', top: 24 }}>
            <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <ListChecks size={18} />
                <Typography variant="h6" fontWeight={600}>Tasks</Typography>
              </Stack>
            </Box>
            <CardContent>
              <Stack spacing={2}>
                {/* Availability task */}
                <TaskCard
                  chipLabel={hasUserConfiguredAvailability ? "Configured" : "Needs update"}
                  chipColor={hasUserConfiguredAvailability ? "var(--gl-status-confirmed-text)" : "var(--gl-status-declined-text)"}
                  chipBg={hasUserConfiguredAvailability ? "var(--gl-status-confirmed-bg)" : "var(--gl-status-declined-bg)"}
                  chipBorder={hasUserConfiguredAvailability ? "var(--gl-status-confirmed-border)" : "var(--gl-status-declined-border)"}
                  title={hasUserConfiguredAvailability ? "Availability summary" : "Add your availability"}
                  description={
                    hasUserConfiguredAvailability
                      ? `Max/week: ${maxPerWeek} · Window: ${rangeDays} days`
                      : `Keep availability up-to-date for next ${rangeDays} days.`
                  }
                  action={
                    hasUserConfiguredAvailability ? (
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="soft" onClick={() => dispatch(setOpenAvailability(true))}>
                          Edit
                        </Button>
                        <Button size="small" variant="soft" onClick={() => navigate("/calendar")}>
                          View calendar
                        </Button>
                      </Stack>
                    ) : (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => dispatch(setOpenAvailability(true))}
                      >
                        Update availability
                      </Button>
                    )
                  }
                />

                {/* Confirm sessions task */}
                {needsWednesdayConfirm && (
                  <TaskCard
                    chipLabel="Action needed"
                    chipColor="var(--gl-status-declined-text)"
                    chipBg="var(--gl-status-declined-bg)"
                    chipBorder="var(--gl-status-declined-border)"
                    title="Confirm sessions by Wednesday"
                    description="Ops needs clarity ~72 hours before weekend sessions."
                    extra={<Chip label={`${confirmedCount} / ${sessions.length}`} size="small" sx={{ borderRadius: 9999, fontSize: '0.65rem' }} />}
                    action={
                      <Button size="small" variant="soft" onClick={() => dispatch(setOpenSession(true))}>
                        Review confirmations
                      </Button>
                    }
                  />
                )}

                {/* Respond to requests task */}
                {pendingRequestsCount > 0 && (
                  <TaskCard
                    chipLabel={String(pendingRequestsCount)}
                    chipColor="white"
                    chipBg="var(--gl-new-badge-bg)"
                    title="Respond to upcoming requests"
                    description="Indicate availability against real upcoming slots."
                    action={
                      <Button size="small" variant="soft" onClick={() => navigate("/calendar")}>
                        Review calendar
                      </Button>
                    }
                  />
                )}

                {/* Calendar connection task */}
                {!calendarConnected && (
                  <TaskCard
                    chipLabel="Not connected"
                    chipColor="var(--gl-status-pending-text)"
                    chipBg="var(--gl-status-pending-bg)"
                    chipBorder="var(--gl-status-pending-border)"
                    title="Avoid double booking"
                    description="Connect calendar to detect conflicts."
                    action={
                      <Button size="small" variant="contained" sx={{}}>
                        Connect Google Calendar
                      </Button>
                    }
                  />
                )}

                {/* Week at a glance */}
                <Divider />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Your week at a glance</Typography>
                  <Grid container spacing={1.5}>
                    <Grid size={6}>
                      <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight={700} color="primary.main">
                          {upcomingSessions.length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Sessions</Typography>
                      </Paper>
                    </Grid>
                    <Grid size={6}>
                      <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight={700} color="primary.main">
                          {confirmedCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Confirmed</Typography>
                      </Paper>
                    </Grid>
                    <Grid size={6}>
                      <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight={700} color="primary.main">
                          {pendingRequestsCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Requests</Typography>
                      </Paper>
                    </Grid>
                    <Grid size={6}>
                      <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight={700} sx={{ color: calendarConnected ? 'success.main' : 'warning.main' }}>
                          {calendarConnected ? "Synced" : "Off"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Calendar</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>}
    </Stack>
  );
}
