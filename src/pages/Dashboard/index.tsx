import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import DoNotDisturbOnOutlinedIcon from "@mui/icons-material/DoNotDisturbOnOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ViewListOutlinedIcon from "@mui/icons-material/ViewListOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
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
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
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
  setSelectedTimePeriod,
  submitSummary,
} from "@/store/slices/sessionsSlice";
import { removeUnavailableBySessionId, setPatterns } from "@/store/slices/availabilitySlice";
import {
  setOpenSession,
  setOpenAvailability,
  setOpenDeclineReason,
  setOpenLearnerRatings,
  setLearnerRatingsSessionId,
  setOpenSessionDetails,
} from "@/store/slices/uiSlice";
import { pushToast } from "@/store/slices/toastsSlice";
import {
  sortByDateTime,
  dateTimeMs,
  fmtTime12,
  fmtDateNice,
  isSessionCompleted,
  formatDayGroupShort,
  parseHHMM,
  fmtTime,
} from "@/lib/helpers";
import { demoNow, DOW_LONG, timeOptions12 } from "@/lib/constants";
import { demoRatingHistory, demoLearnerRatingsBySessionId, demoPreviouslyDeclinedSessions, demoPlannedEvents } from "@/data/demo-sessions";
import { SessionCard, STATUS_SCHEDULED, STATUS_CONFIRMED, STATUS_DECLINED, STATUS_SUMMARY_NEEDED, STATUS_SUMMARY_SUBMITTED } from "@/components/shared/SessionCard";
import { InlineSummaryForm } from "@/components/shared/InlineSummaryForm";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import type { Session, SessionType } from "@/lib/types";
import { filterSessionsByRole } from "@/lib/role-config";

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
  "Mentored Learning session",
  "Residency",
  "Evaluation",
  "Moderation",
  "CV Review",
  "Others",
];

const PRESET_SLOTS = [
  { key: "weekendMorning", label: "Weekend morning", days: ["Saturday", "Sunday"], start: "10:00", end: "12:00" },
  { key: "weekendAfternoon", label: "Weekend afternoon", days: ["Saturday", "Sunday"], start: "14:00", end: "16:00" },
  { key: "weekdayEvenings", label: "Weekday evenings", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], start: "18:00", end: "20:00" },
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
  body,
}: {
  chipLabel: string;
  chipColor: string;
  chipBg: string;
  chipBorder?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  extra?: React.ReactNode;
  body?: React.ReactNode;
}) {
  return (
    <Card
      variant="outlined"
      sx={{ p: 2.5 }}
    >
      <Stack spacing={1.5}>
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>{title}</Typography>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Chip label={chipLabel} size="small" sx={{ bgcolor: chipBg, color: chipColor, border: chipBorder ? `1px solid ${chipBorder}` : undefined, fontWeight: 500, fontSize: "0.75rem" }} />
              {extra}
            </Stack>
          </Stack>
          <Typography variant="caption" color="text.secondary">{description}</Typography>
        </Box>
        {body}
        {action}
      </Stack>
    </Card>
  );
}

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const allSessions = useAppSelector((s) => s.sessions.items);
  const selectedRole = useAppSelector((s) => s.devPanel.selectedRole);
  const sessions = useMemo(() => filterSessionsByRole(allSessions, selectedRole), [allSessions, selectedRole]);
  const confirmations = useAppSelector((s) => s.sessions.confirmations);
  const summaries = useAppSelector((s) => s.sessions.summaries);
  const sessionDeclined = useAppSelector((s) => s.sessions.sessionDeclined);
  const homeSessionsView = useAppSelector((s) => s.sessions.homeSessionsView);
  const hasUserConfiguredAvailability = useAppSelector((s) => s.availability.hasUserConfiguredAvailability);
  const maxPerWeek = useAppSelector((s) => s.availability.maxPerWeek);
  const rangeDays = useAppSelector((s) => s.availability.rangeDays);
  const calendarConnected = useAppSelector((s) => s.availability.calendarConnected);
  const patterns = useAppSelector((s) => s.availability.patterns);
  const requests = useAppSelector((s) => s.requests.items);
  const guruName = useAppSelector((s) => s.profile.guruName);
  const polls = useAppSelector((s) => s.polls.items);
  const selectedSessionType = useAppSelector((s) => s.sessions.selectedSessionType);
  const selectedTimePeriod = useAppSelector((s) => s.sessions.selectedTimePeriod);
  const recentlyConfirmedIds = useAppSelector((s) => s.sessions.recentlyConfirmedIds);

  /* ── local state for exit animation ─────────────────────────────── */
  const [exitingId, setExitingId] = useState<string | null>(null);

  /* ── inline summary state ──────────────────────────────────────── */
  const [summarizingSessionId, setSummarizingSessionId] = useState<string | null>(null);
  const [editingSummaryId, setEditingSummaryId] = useState<string | null>(null);

  /* ── planned event detail dialog state ───────────────────────── */
  const [plannedEventDetailId, setPlannedEventDetailId] = useState<string | null>(null);
  const plannedEventDetail = demoPlannedEvents.find((pe) => pe.id === plannedEventDetailId) ?? null;

  /* ── inline availability editing state ───────────────────────────── */
  const [editingPatternId, setEditingPatternId] = useState<string | null>(null);
  const [editDays, setEditDays] = useState<string[]>([]);
  const [editStart, setEditStart] = useState("10:00");
  const [editEnd, setEditEnd] = useState("12:00");
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [addDays, setAddDays] = useState<string[]>(["Saturday", "Sunday"]);
  const [addStart, setAddStart] = useState("10:00");
  const [addEnd, setAddEnd] = useState("12:00");
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

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
    () => sortByDateTime(sessions).filter((s) => isSessionCompleted(s, nowMs)).reverse(),
    [sessions, nowMs]
  );
  const filteredCompletedSessions = useMemo(() => {
    let filtered = selectedSessionType === "All"
      ? completedSessions
      : completedSessions.filter((s) => s.sessionType === selectedSessionType);

    if (selectedTimePeriod === "Pending Summaries") {
      const onlineTypes = ["Online session", "Career mentoring session", "Mentored Learning session", "Online class", "Industry session", "Schedule a call"];
      filtered = filtered.filter((s) => onlineTypes.includes(s.sessionType) && !summaries[s.id]);
    } else if (selectedTimePeriod === "Last 6 months") {
      const sixMonthsAgo = new Date(demoNow);
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      filtered = filtered.filter((s) => new Date(s.dateYmd) >= sixMonthsAgo);
    } else if (["2025", "2024", "2023", "2022"].includes(selectedTimePeriod)) {
      filtered = filtered.filter((s) => s.dateYmd.startsWith(selectedTimePeriod));
    }

    return filtered;
  }, [completedSessions, selectedSessionType, selectedTimePeriod, summaries]);
  const declinedSessions = useMemo(
    () => sessions.filter((s) => sessionDeclined[s.id]),
    [sessions, sessionDeclined]
  );

  const rolePlannedEvents = useMemo(() => filterSessionsByRole(demoPlannedEvents, selectedRole), [selectedRole]);
  const rolePreviouslyDeclined = useMemo(() => filterSessionsByRole(demoPreviouslyDeclinedSessions, selectedRole), [selectedRole]);

  const todayYmd = demoNow.toISOString().slice(0, 10);
  const todaySessions = upcomingSessions.filter((s) => s.dateYmd === todayYmd);
  const nextSession = todaySessions[0] ?? null;
  const todaySessionIds = new Set(todaySessions.map((s) => s.id));
  const confirmedCount = upcomingSessions.filter((s) => confirmations[s.id] || todaySessionIds.has(s.id)).length;
  const scheduled = upcomingSessions.filter((s) => !confirmations[s.id] && !todaySessionIds.has(s.id));
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
  const pendingSummaryCount = completedSessions.filter((s) => !summaries[s.id]).length;

  return (
    <Stack spacing={2}>
      {/* ── Welcome header ── */}
      <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1.125rem', md: '1.25rem' }, mb: -0.5 }}>
        Welcome {guruName}
      </Typography>

      {/* ── Availability gate ── */}
      {!hasUserConfiguredAvailability && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 2, md: 2.5 },
            py: { xs: 6, md: 12 },
            borderRadius: 3,
            border: '2px dashed',
            borderColor: 'divider',
            bgcolor: 'action.hover',
            textAlign: 'center',
            px: { xs: 2, sm: 4 },
          }}
        >
          <Box
            sx={{
              width: { xs: 56, md: 72 },
              height: { xs: 56, md: 72 },
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <EventNoteOutlinedIcon sx={{ fontSize: { xs: 28, md: 36 }, color: 'primary.contrastText' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75, fontSize: { xs: '1rem', md: '1.25rem' } }}>
              Set your availability to get started
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: 'auto', fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
              Without marking your availability, no events will be scheduled with you. Let learners know when you're free so they can book time with you.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<EditCalendarOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{ textTransform: 'none', px: { xs: 3, md: 4 } }}
            onClick={() => dispatch(setOpenAvailability(true))}
          >
            Set your availability
          </Button>
        </Box>
      )}

      {/* ── Main layout ── */}
      {hasUserConfiguredAvailability && <Grid container spacing={{ xs: 2, md: 3 }} alignItems="flex-start">
        {/* Left column (2/3) */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack>
            {/* Mobile tasks (horizontal scroll) */}
            {(needsWednesdayConfirm || !hasUserConfiguredAvailability) && (
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}><AssignmentOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} /><Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: "0.9rem" }}>Tasks</Typography></Stack>
                <Stack spacing={1.5}>
                  {!hasUserConfiguredAvailability && (
                    <Box>
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
                    <Box>
                      <TaskCard
                        chipLabel={`${upcomingSessions.length - confirmedCount} pending`}
                        chipColor="var(--gl-status-declined-text)"
                        chipBg="var(--gl-status-declined-bg)"
                        chipBorder="var(--gl-status-declined-border)"
                        title="Confirm upcoming events"
                        description="Confirm by Wednesday 6 PM so our team can finalize allocations."
                        action={
                          <Button size="small" variant="soft" onClick={() => dispatch(setOpenSession(true))}>
                            Review confirmations
                          </Button>
                        }
                      />
                    </Box>
                  )}
                </Stack>
              </Box>
            )}

            {/* ── Big container for entire left section ── */}
            <Card sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Stack spacing={{ xs: 2, md: 2.5 }}>
                {/* Next Events — hidden when no today sessions */}
                {todaySessions.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                    {todaySessions.length > 1 ? "Next Events" : "Next Event"}
                  </Typography>
                    <Stack spacing={1.5}>
                      {todaySessions.map((s) => {
                        const sessionStartMs = dateTimeMs(s.dateYmd, s.start);
                        const startsWithin30 = sessionStartMs - nowMs <= 30 * 60 * 1000 && sessionStartMs >= nowMs;
                        const joinEnabled = nowMs >= sessionStartMs - 30 * 60 * 1000;
                        return (
                          <Card
                            key={s.id}
                            variant="outlined"
                            sx={{
                              p: { xs: 1.5, sm: 2 },
                              ...(startsWithin30
                                ? { bgcolor: 'hsl(var(--md-primary-container) / 0.12)', borderColor: 'hsl(var(--md-primary) / 0.4)' }
                                : {}),
                            }}
                          >
                            {startsWithin30 && (
                              <Chip
                                label="Starting soon"
                                size="small"
                                sx={{
                                  mb: 1,
                                  height: 20,
                                  fontSize: 10,
                                  fontWeight: 600,
                                  borderRadius: 1,
                                  bgcolor: "var(--gl-status-declined-bg)",
                                  color: "var(--gl-status-declined-text)",
                                }}
                              />
                            )}
                            <SessionCard
                              title={s.title}
                              sessionType={s.sessionType}
                              topic={s.topic}
                              batch={s.batch}
                              dateYmd={s.dateYmd}
                              start={s.start}
                              end={s.end}
                              actions={
                                <>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<LinkOutlinedIcon sx={{ fontSize: 16 }} />}
                                    disabled={!joinEnabled}
                                    onClick={() => dispatch(pushToast({ title: "Joining event", description: "Launching join link..." }))}
                                  >
                                    Join event
                                  </Button>
                                  <Button
                                    variant="soft"
                                    size="small"
                                    startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
                                    onClick={() => dispatch(pushToast({ title: "Event Materials", description: "Opening event materials..." }))}
                                  >
                                    Event Materials
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
                          </Card>
                        );
                      })}
                    </Stack>
                </Box>
                )}

                {/* Tabs */}
                <Tabs
                  value={homeSessionsView}
                  onChange={(_e, v) => dispatch(setHomeSessionsView(v))}
                  variant="fullWidth"
                  data-testid="home-sessions-card"
                  sx={{
                  minHeight: { xs: 36, sm: 40 },
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    fontWeight: 600,
                    minHeight: { xs: 36, sm: 40 },
                    py: 1,
                    px: { xs: 0.5, sm: 1.5 },
                    gap: 0.5,
                    borderBottom: '1px solid',
                    borderColor: 'hsl(var(--md-outline-variant) / 0.5)',
                  },
                  }}
                >
                  <Tab icon={<EventNoteOutlinedIcon sx={{ fontSize: { xs: 14, sm: 18 } }} />} iconPosition="start" label={`Upcoming (${upcomingSessions.length})`} value="next" />
                  <Tab icon={<TaskAltOutlinedIcon sx={{ fontSize: { xs: 14, sm: 18 } }} />} iconPosition="start" label={`Completed (${completedSessions.length})`} value="completed" />
                  <Tab icon={<DoNotDisturbOnOutlinedIcon sx={{ fontSize: { xs: 14, sm: 18 } }} />} iconPosition="start" label={`Declined (${declinedSessions.length})`} value="declined" />
                </Tabs>

                {/* ── Upcoming tab ── */}
                {homeSessionsView === "next" && (
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" fontWeight={600}>Events</Typography>
                      <Typography variant="caption" color="text.secondary">{confirmedCount}/{upcomingSessions.length} confirmed</Typography>
                    </Stack>
                    <Stack spacing={1.5}>
                      {upcomingSessions.length ? (
                        upcomingSessions.map((s) => {
                          const isNextSession = nextSession?.id === s.id;
                          const isConfirmed = !!confirmations[s.id] || isNextSession;
                          const isExiting = s.id === exitingId && isConfirmed;
                          return (
                            <Card key={s.id} variant="outlined" sx={{
                              p: { xs: 1.5, sm: 2 },
                              ...(isExiting && {
                                animation: `${slideOutDown} 0.38s ease forwards`,
                                pointerEvents: 'none',
                              }),
                              ...(recentlyConfirmedIds[s.id] && {
                                animation: `${slideInFromAbove} 0.38s ease forwards`,
                              }),
                            }}>
                              <SessionCard
                                title={s.title}
                                sessionType={s.sessionType}
                                topic={s.topic}
                                batch={s.batch}
                                dateYmd={s.dateYmd}
                                start={s.start}
                                end={s.end}
                                status={isConfirmed
                                  ? STATUS_CONFIRMED()
                                  : STATUS_SCHEDULED
                                }
                                actions={isConfirmed ? (
                                  <>
                                    <Button
                                      variant="soft"
                                      size="small"
                                      startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
                                      onClick={() => dispatch(pushToast({ title: "Downloading event materials", description: "Preparing download..." }))}
                                    >
                                      Event Materials
                                    </Button>
                                    <Button
                                      variant="soft"
                                      size="small"
                                      startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 16 }} />}
                                      onClick={() => {
                                        navigate("/courses");
                                        dispatch(pushToast({ title: "Course content", description: `Viewing content for ${s.title}` }));
                                      }}
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
                                        setExitingId(s.id);
                                        dispatch(confirmSession(s.id));
                                        dispatch(pushToast({ title: "Confirmed", description: `${s.title} \u2022 ${fmtDateNice(s.dateYmd)}` }));
                                        setTimeout(() => setExitingId(null), 420);
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
                        })
                      ) : (
                        <Typography variant="body2" color="text.secondary">No upcoming events.</Typography>
                      )}
                    </Stack>

                    {/* ── Planned Events (subject to change) ── */}
                    <Divider sx={{ mt: 2.5, mb: 0 }} />
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2, mb: 1.5 }}>
                      <Typography variant="subtitle2" fontWeight={600}>Planned Events</Typography>
                      <Typography variant="caption" color="text.secondary">(subject to change)</Typography>
                    </Stack>
                    {rolePlannedEvents.length > 0 ? (
                      <>
                        {/* Planned Event Detail Dialog */}
                        <Dialog
                          open={plannedEventDetail !== null}
                          onClose={() => setPlannedEventDetailId(null)}
                          maxWidth="sm"
                          fullWidth
                          PaperProps={{ sx: { p: 0, maxHeight: "85vh", overflow: "hidden" } }}
                        >
                          {plannedEventDetail && (
                            <Box sx={{ display: "flex", flexDirection: "column", maxHeight: "85vh" }}>
                              <DialogTitle sx={{ position: "sticky", top: 0, zIndex: 10, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                Event details
                                <IconButton size="small" onClick={() => setPlannedEventDetailId(null)} sx={{ color: "text.secondary" }}><CloseOutlinedIcon sx={{ fontSize: 18 }} /></IconButton>
                              </DialogTitle>
                              <DialogContent className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto", px: 3, py: 2 }}>
                                <Stack spacing={2.5}>
                                  <Box>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1, mb: 1.5 }}>
                                      <Chip
                                        label={plannedEventDetail.status === "to_be_confirmed" ? "To be confirmed" : "Confirmed"}
                                        size="small"
                                        sx={{
                                          bgcolor: plannedEventDetail.status === "to_be_confirmed" ? "var(--gl-status-pending-bg)" : "var(--gl-status-confirmed-bg)",
                                          color: plannedEventDetail.status === "to_be_confirmed" ? "var(--gl-status-pending-text)" : "var(--gl-status-confirmed-text)",
                                          border: `1px solid ${plannedEventDetail.status === "to_be_confirmed" ? "var(--gl-status-pending-border)" : "var(--gl-status-confirmed-border)"}`,
                                          fontWeight: 600,
                                        }}
                                      />
                                      <Chip label={plannedEventDetail.program} size="small" />
                                      <Chip label={plannedEventDetail.sessionType} size="small" />
                                    </Stack>
                                    <Typography variant="h6" fontWeight={600}>{plannedEventDetail.title}</Typography>
                                  </Box>

                                  {/* Schedule */}
                                  <Paper variant="outlined" sx={{ borderRadius: "16px", p: 2 }}>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Schedule</Typography>
                                    <Divider sx={{ mb: 0.5 }} />
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 1.25 }}>
                                      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, minWidth: 120 }}>Date range</Typography>
                                      <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} />
                                        <Typography variant="body2" fontWeight={500}>{fmtDateNice(plannedEventDetail.startDateYmd)} &ndash; {fmtDateNice(plannedEventDetail.endDateYmd)}</Typography>
                                      </Stack>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 1.25 }}>
                                      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, minWidth: 120 }}>Time</Typography>
                                      <Typography variant="body2" color="var(--gl-status-pending-text)" fontWeight={500}>To be confirmed</Typography>
                                    </Stack>
                                  </Paper>

                                  {/* Details */}
                                  <Paper variant="outlined" sx={{ borderRadius: "16px", p: 2 }}>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Details</Typography>
                                    <Divider sx={{ mb: 0.5 }} />
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 1.25 }}>
                                      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, minWidth: 120 }}>Batch</Typography>
                                      <Typography variant="body2" fontWeight={500}>{plannedEventDetail.batch}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 1.25 }}>
                                      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, minWidth: 120 }}>Program</Typography>
                                      <Typography variant="body2" fontWeight={500}>{plannedEventDetail.program}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 1.25 }}>
                                      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, minWidth: 120 }}>Contact</Typography>
                                      <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <MailOutlineIcon sx={{ fontSize: 13 }} />
                                        <Typography variant="body2" fontWeight={500}>{plannedEventDetail.contactEmail}</Typography>
                                      </Stack>
                                    </Stack>
                                  </Paper>
                                </Stack>
                              </DialogContent>
                              <DialogActions sx={{ position: "sticky", bottom: 0, zIndex: 10, borderTop: 1, borderColor: "divider", bgcolor: "background.paper", px: 3, py: 2 }}>
                                <Button variant="text" color="inherit" onClick={() => setPlannedEventDetailId(null)}>Close</Button>
                              </DialogActions>
                            </Box>
                          )}
                        </Dialog>

                        <Stack spacing={1.5}>
                          {rolePlannedEvents.map((pe) => {
                            const statusCfg = pe.status === "to_be_confirmed"
                              ? { label: "To be confirmed", bg: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "var(--gl-status-pending-border)" }
                              : { label: "Confirmed", bg: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "var(--gl-status-confirmed-border)" };
                            return (
                              <Card key={pe.id} variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                                  <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem", minWidth: 0 }}>
                                    {pe.sessionType}: {pe.title}
                                  </Typography>
                                  <Chip
                                    label={statusCfg.label}
                                    size="small"
                                    sx={{ bgcolor: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}`, fontWeight: 500, fontSize: "0.75rem", flexShrink: 0 }}
                                  />
                                </Stack>
                                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary" }}>
                                  <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {fmtDateNice(pe.startDateYmd)} &ndash; {fmtDateNice(pe.endDateYmd)} &bull; {pe.batch}
                                  </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
                                  <Button variant="text" size="small" onClick={() => setPlannedEventDetailId(pe.id)}>View details</Button>
                                </Stack>
                              </Card>
                            );
                          })}
                        </Stack>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                        No planned events at this moment!
                      </Typography>
                    )}
                  </Box>
                )}

                {/* ── Completed tab ── */}
                {homeSessionsView === "completed" && (
                  <>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ width: "100%" }}>
                      <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
                        <InputLabel>Summaries</InputLabel>
                        <Select
                          label="Summaries"
                          value={selectedTimePeriod === "Pending Summaries" ? "Pending Summaries" : "All"}
                          onChange={(e) => {
                            const val = e.target.value as string;
                            if (val === "Pending Summaries") {
                              dispatch(setSelectedTimePeriod("Pending Summaries"));
                            } else {
                              if (selectedTimePeriod === "Pending Summaries") dispatch(setSelectedTimePeriod("All"));
                            }
                          }}
                        >
                          <MenuItem value="All">All Sessions</MenuItem>
                          <MenuItem value="Pending Summaries">Pending Summaries ({completedSessions.filter((s) => ["Online session", "Career mentoring session", "Mentored Learning session", "Online class", "Industry session", "Schedule a call"].includes(s.sessionType) && !summaries[s.id]).length})</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
                        <InputLabel>Time period</InputLabel>
                        <Select
                          label="Time period"
                          value={selectedTimePeriod === "Pending Summaries" ? "All" : selectedTimePeriod}
                          onChange={(e) => dispatch(setSelectedTimePeriod(e.target.value as typeof selectedTimePeriod))}
                        >
                          <MenuItem value="All">All time</MenuItem>
                          <MenuItem value="Last 6 months">Last 6 months</MenuItem>
                          <MenuItem value="2025">2025</MenuItem>
                          <MenuItem value="2024">2024</MenuItem>
                          <MenuItem value="2023">2023</MenuItem>
                          <MenuItem value="2022">2022</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>

                    {filteredCompletedSessions.length > 0 ? (
                      <Stack spacing={1.5}>
                        {filteredCompletedSessions.map((s) => {
                          const ratings = demoLearnerRatingsBySessionId[s.id];
                          const hasRatings = ratings && ratings.length > 0;
                          const avg = hasRatings
                            ? (ratings.reduce((a, r) => a + r.rating, 0) / ratings.length).toFixed(1)
                            : null;
                          const avgNum = hasRatings
                            ? ratings.reduce((a, r) => a + r.rating, 0) / ratings.length
                            : 0;
                          const hasSummary = !!summaries[s.id];
                          const isSummarizing = summarizingSessionId === s.id;
                          const isEditing = editingSummaryId === s.id;
                          const daysSinceSession = (nowMs - new Date(s.dateYmd).getTime()) / (1000 * 60 * 60 * 24);
                          const feedbackLabel = daysSinceSession > 30 ? "No feedback collected" : "Gathering feedback";
                          const isMockInterview = s.title.toLowerCase().includes("mock");
                          const isPaid = s.paymentStatus === "paid";
                          const hasPaymentStatus = !!s.paymentStatus;
                          const st = s.sessionType;
                          const isOnlineType = ["Online session", "Career mentoring session", "Mentored Learning session", "Online class", "Industry session", "Schedule a call"].includes(st);
                          const isResidency = st === "Residency";
                          const isEvaluation = st === "Evaluation";
                          const isModeration = st === "Moderation";
                          const isCapstone = st === "Capstone project mentoring session";
                          const isCVReview = st === "CV Review";
                          const hasSummaryFlow = isOnlineType; // only online-type sessions have summary

                          // Payment chip helper
                          const paymentChip = isPaid
                            ? <Chip label="Payment Processed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 500, fontSize: "0.75rem" }} />
                            : hasPaymentStatus
                              ? <Chip label="Payment Pending" size="small" sx={{ bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)", fontWeight: 500, fontSize: "0.75rem" }} />
                              : null;

                          // Feedback chip helper
                          const feedbackChip = (
                            <Chip label={feedbackLabel} size="small" variant="outlined" sx={{ fontWeight: 500, fontSize: "0.75rem", ...(daysSinceSession > 30 ? { opacity: 0.7 } : {}) }} />
                          );

                          // Star rating helpers — numeric for Online/Residency, icons-only for Evaluation/Moderation
                          const numericRating = avg ? (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <StarOutlinedIcon sx={{ fontSize: 14, color: "var(--gl-star-color)" }} />
                              <Typography variant="subtitle2" fontWeight={600}>{avg}</Typography>
                            </Stack>
                          ) : null;

                          const iconRating = hasRatings ? (
                            <Stack direction="row" spacing={0.25} alignItems="center">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <StarOutlinedIcon key={i} sx={{ fontSize: 14, color: i <= Math.round(avgNum) ? "var(--gl-star-color)" : "action.disabled" }} />
                              ))}
                            </Stack>
                          ) : null;

                          // Build top-right per activity type
                          let topRightContent: React.ReactNode;
                          if (isCapstone || isCVReview) {
                            // No rating — just payment chip
                            topRightContent = paymentChip;
                          } else if (isEvaluation || isModeration) {
                            // Star icons only (no numeric)
                            topRightContent = (
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                                {paymentChip}
                                {numericRating ?? feedbackChip}
                              </Stack>
                            );
                          } else {
                            // Online/Residency — numeric star rating
                            topRightContent = (
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                                {paymentChip}
                                {numericRating ?? feedbackChip}
                              </Stack>
                            );
                          }

                          // Build actions per activity type
                          const viewDetailsBtn = (
                            <Button variant="text" size="small" onClick={() => {
                              dispatch(setSessionFocus(s));
                              dispatch(setOpenSessionDetails(true));
                            }}>
                              View details
                            </Button>
                          );

                          let cardActions: React.ReactNode;
                          if (isCapstone) {
                            cardActions = (
                              <Button variant="soft" size="small" startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 14 }} />}
                                onClick={() => dispatch(pushToast({ title: "Student Progress", description: "Loading student progress..." }))}>
                                View Student Progress
                              </Button>
                            );
                          } else if (isCVReview) {
                            cardActions = (
                              <Button variant="soft" size="small" startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 14 }} />}
                                onClick={() => dispatch(pushToast({ title: "View CV", description: "Opening reviewed CV..." }))}>
                                View Reviewed CV
                              </Button>
                            );
                          } else if (isEvaluation || isModeration) {
                            cardActions = hasRatings ? (
                              <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}
                                onClick={() => { dispatch(setLearnerRatingsSessionId(s.id)); dispatch(setOpenLearnerRatings(true)); }}>
                                Detailed Feedback
                              </Button>
                            ) : null;
                          } else if (isResidency) {
                            cardActions = hasRatings ? (
                              <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}
                                onClick={() => { dispatch(setLearnerRatingsSessionId(s.id)); dispatch(setOpenLearnerRatings(true)); }}>
                                Detailed Feedback
                              </Button>
                            ) : null;
                          } else {
                            // Online session types — full summary flow
                            cardActions = (
                              <>
                                {!hasSummary && !isSummarizing && (
                                  <Button startIcon={<EditNoteOutlinedIcon sx={{ fontSize: 14 }} />} variant="contained" size="small"
                                    onClick={() => setSummarizingSessionId(s.id)}>
                                    Write summary
                                  </Button>
                                )}
                                {s.recordingUrl && (
                                  <Button startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />} variant="soft" size="small"
                                    onClick={() => dispatch(pushToast({ title: "Opening recording", description: `Launching recording for ${s.title}` }))}>
                                    Watch recording
                                  </Button>
                                )}
                                {hasRatings && (
                                  <Button startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />} variant="soft" size="small"
                                    onClick={() => { dispatch(setLearnerRatingsSessionId(s.id)); dispatch(setOpenLearnerRatings(true)); }}>
                                    Detailed Feedback
                                  </Button>
                                )}
                                {isMockInterview && (
                                  <Button startIcon={<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 14 }} />} variant="soft" size="small"
                                    onClick={() => dispatch(pushToast({ title: "Share Feedback", description: "Opening mock interview feedback form..." }))}>
                                    Share Feedback
                                  </Button>
                                )}
                                {hasSummary && (
                                  <Button startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 14 }} />} variant="soft" size="small"
                                    onClick={() => navigate(`/payments?highlight=${s.id}`)}>
                                    View in payments
                                  </Button>
                                )}
                              </>
                            );
                          }

                          // Card title — Residency/Capstone use custom prefix
                          const cardTitle = isResidency
                            ? s.title
                            : isCapstone
                              ? `Capstone — ${s.batch}`
                              : isCVReview
                                ? "CV Review"
                                : isEvaluation
                                  ? `Evaluation: ${s.title}`
                                  : isModeration
                                    ? `Moderation: ${s.title}`
                                    : s.title;

                          return (
                            <Card key={s.id} variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
                              {/* Card header: title row + date + actions — custom for non-SessionCard types */}
                              {(isResidency || isEvaluation || isModeration || isCapstone || isCVReview) ? (
                                <>
                                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5, gap: 1 }}>
                                    <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem", minWidth: 0 }}>{cardTitle}</Typography>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                                      {topRightContent}
                                    </Stack>
                                  </Stack>
                                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
                                    <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
                                    <Typography variant="caption" color="text.secondary">
                                      {fmtDateNice(s.dateYmd)} &bull; {s.batch}
                                    </Typography>
                                  </Stack>
                                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>{cardActions}</Stack>
                                    {viewDetailsBtn}
                                  </Stack>
                                </>
                              ) : (
                                <SessionCard
                                  title={s.title}
                                  sessionType={s.sessionType}
                                  topic={s.topic}
                                  batch={s.batch}
                                  dateYmd={s.dateYmd}
                                  start={s.start}
                                  end={s.end}
                                  topRight={topRightContent}
                                  actions={cardActions}
                                  secondaryAction={viewDetailsBtn}
                                />
                              )}
                              {/* Summary flow — only for online-type sessions */}
                              {hasSummaryFlow && !hasSummary && !isSummarizing && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block", fontStyle: "italic" }}>
                                  Write summary to process invoice
                                </Typography>
                              )}
                              {hasSummaryFlow && isSummarizing && (
                                <InlineSummaryForm
                                  sessionId={s.id}
                                  sessionTitle={s.title}
                                  onCancel={() => setSummarizingSessionId(null)}
                                />
                              )}
                              {hasSummaryFlow && hasSummary && !isEditing && (
                                <Paper variant="outlined" sx={{ p: 1.5, mt: 1.5, borderRadius: 1.5, bgcolor: "action.hover" }}>
                                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                                    <Typography variant="caption" fontWeight={600}>Session summary</Typography>
                                    <Button
                                      startIcon={<EditNoteOutlinedIcon sx={{ fontSize: 14 }} />}
                                      variant="text"
                                      size="small"
                                      sx={{ fontSize: 11, minWidth: "auto", p: 0 }}
                                      onClick={() => setEditingSummaryId(s.id)}
                                    >
                                      Edit
                                    </Button>
                                  </Stack>
                                  <Typography variant="body2" color="text.secondary">
                                    {summaries[s.id].learnerEngagementNotes}
                                  </Typography>
                                </Paper>
                              )}
                              {hasSummaryFlow && isEditing && hasSummary && (
                                <InlineSummaryForm
                                  sessionId={s.id}
                                  sessionTitle={s.title}
                                  initialNotes={summaries[s.id].learnerEngagementNotes}
                                  onCancel={() => setEditingSummaryId(null)}
                                />
                              )}
                            </Card>
                          );
                        })}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No completed events yet.</Typography>
                    )}
                  </>
                )}

                {/* ── Declined tab ── */}
                {homeSessionsView === "declined" && (
                  <>
                    {declinedSessions.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Active declined</Typography>
                        <Stack spacing={1.5}>
                          {declinedSessions.map((s) => (
                            <Card key={s.id} variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
                              <SessionCard
                                title={s.title}
                                sessionType={s.sessionType}
                                topic={s.topic}
                                batch={s.batch}
                                dateYmd={s.dateYmd}
                                start={s.start}
                                end={s.end}
                                status={STATUS_DECLINED}
                                actions={
                                  <Button
                                    startIcon={<TaskAltOutlinedIcon sx={{ fontSize: 18 }} />}
                                    variant="soft"
                                    size="small"
                                    onClick={() => {
                                      dispatch(acceptSession(s.id));
                                      dispatch(removeUnavailableBySessionId(s.id));
                                      dispatch(pushToast({ title: "Event accepted", description: `${s.title} · ${fmtDateNice(s.dateYmd)}` }));
                                    }}
                                  >
                                    Accept
                                  </Button>
                                }
                              />
                            </Card>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {rolePreviouslyDeclined.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Previously declined</Typography>
                        <Stack spacing={1.5}>
                          {rolePreviouslyDeclined.map((s) => (
                            <Card key={s.id} variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, opacity: 0.6 }}>
                              <SessionCard
                                title={s.title}
                                topic={s.topic}
                                batch={s.batch}
                                dateYmd={s.dateYmd}
                                start={s.start}
                                end={s.end}
                                status={{ label: "Declined", bg: "action.hover", color: "text.secondary", border: "transparent" }}
                                actions={
                                  <Button variant="soft" size="small" disabled>
                                    Confirm
                                  </Button>
                                }
                              />
                            </Card>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {declinedSessions.length === 0 && rolePreviouslyDeclined.length === 0 && (
                      <Typography variant="body2" color="text.secondary">No declined events.</Typography>
                    )}
                  </>
                )}

              </Stack>
            </Card>
          </Stack>
        </Grid>

        {/* Right column: Tasks sidebar (desktop only) */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ display: { xs: 'none', md: 'block' }, alignSelf: 'flex-start', position: 'sticky', top: 24 }}>
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Tasks</Typography>
              <Stack spacing={2}>
                {/* Confirm events task */}
                {needsWednesdayConfirm && (
                  <TaskCard
                    chipLabel={`${upcomingSessions.length - confirmedCount} pending`}
                    chipColor="var(--gl-status-declined-text)"
                    chipBg="var(--gl-status-declined-bg)"
                    chipBorder="var(--gl-status-declined-border)"
                    title="Confirm upcoming events"
                    description="Confirm by Wednesday 6 PM so our team can finalize allocations."
                    action={
                      <Button size="small" variant="soft" onClick={() => dispatch(setOpenSession(true))}>
                        Review Confirmations
                      </Button>
                    }
                  />
                )}

                {/* Session summaries task */}
                {pendingSummaryCount > 0 && (
                  <TaskCard
                    chipLabel={`${pendingSummaryCount} pending`}
                    chipColor="var(--gl-status-pending-text)"
                    chipBg="var(--gl-status-pending-bg)"
                    chipBorder="var(--gl-status-pending-border)"
                    title="Write session summaries"
                    description="Capture learner impact to unlock invoice processing."
                    action={
                      <Button size="small" variant="soft" onClick={() => dispatch(setHomeSessionsView("completed"))}>
                        Go to completed events
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
                      <Button size="small" variant="contained">
                        Connect Google Calendar
                      </Button>
                    }
                  />
                )}

                {/* Availability task */}
                {hasUserConfiguredAvailability ? (
                  <Card variant="outlined" sx={{ p: 0, overflow: "hidden" }}>
                    <Accordion
                      defaultExpanded={false}
                      disableGutters
                      elevation={0}
                      sx={{ bgcolor: "transparent", "&::before": { display: "none" } }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreOutlinedIcon sx={{ fontSize: 18 }} />}
                        sx={{ px: 2.5, py: 0.5, minHeight: "unset", "& .MuiAccordionSummary-content": { my: 1.5 } }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: "100%", mr: 1 }}>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>Availability summary</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {patterns.length} slot{patterns.length !== 1 ? "s" : ""} configured
                            </Typography>
                          </Box>
                          <Chip label="Configured" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 500, fontSize: "0.75rem" }} />
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2 }}>
                        <Stack spacing={1}>
                          {patterns.map((p) =>
                            editingPatternId === p.id ? (
                              <Paper key={p.id} variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, borderColor: "primary.main" }}>
                                <Typography variant="caption" fontWeight={600} sx={{ display: "block", mb: 1 }}>Edit slot</Typography>
                                <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mb: 1 }}>
                                  {DOW_LONG.map((day) => (
                                    <Chip
                                      key={day}
                                      label={day.slice(0, 3)}
                                      size="small"
                                      variant={editDays.includes(day) ? "filled" : "outlined"}
                                      sx={editDays.includes(day) ? { bgcolor: "primary.main", color: "primary.contrastText", "&:hover": { bgcolor: "primary.dark" } } : { cursor: "pointer" }}
                                      onClick={() => setEditDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day])}
                                    />
                                  ))}
                                </Stack>
                                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                  <FormControl size="small" fullWidth>
                                    <InputLabel>Start</InputLabel>
                                    <Select label="Start" value={editStart} onChange={(e) => setEditStart(e.target.value)}>
                                      {timeOptions12.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                    </Select>
                                  </FormControl>
                                  <FormControl size="small" fullWidth>
                                    <InputLabel>End</InputLabel>
                                    <Select label="End" value={editEnd} onChange={(e) => setEditEnd(e.target.value)}>
                                      {timeOptions12.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                    </Select>
                                  </FormControl>
                                </Stack>
                                <Stack direction="row" spacing={1}>
                                  <Button size="small" variant="contained" disabled={!editDays.length} onClick={() => {
                                    const label = `${formatDayGroupShort(editDays)} ${fmtTime12(parseHHMM(editStart))}–${fmtTime12(parseHHMM(editEnd))}`;
                                    const updated = patterns.map((pat) => pat.id === p.id ? { ...pat, label, days: editDays, start: parseHHMM(editStart), end: parseHHMM(editEnd) } : pat);
                                    dispatch(setPatterns(updated));
                                    dispatch(pushToast({ title: "Slot updated", description: label }));
                                    setEditingPatternId(null);
                                  }}>Save</Button>
                                  <Button size="small" variant="text" color="inherit" onClick={() => setEditingPatternId(null)}>Cancel</Button>
                                </Stack>
                              </Paper>
                            ) : (
                              <Paper key={p.id} variant="outlined" sx={{ px: 1.5, py: 1, borderRadius: 1.5, bgcolor: "action.hover" }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Box>
                                    <Typography variant="caption" fontWeight={600} sx={{ display: "block", mb: 0.25 }}>{p.label}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatDayGroupShort(p.days)} · {fmtTime12(p.start)} – {fmtTime12(p.end)}
                                    </Typography>
                                  </Box>
                                  <Stack direction="row" spacing={0.25}>
                                    <IconButton size="small" onClick={() => {
                                      setEditingPatternId(p.id);
                                      setEditDays([...p.days]);
                                      setEditStart(fmtTime(p.start));
                                      setEditEnd(fmtTime(p.end));
                                    }}>
                                      <EditOutlinedIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => setConfirmRemoveId(p.id)}>
                                      <DeleteOutlinedIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                  </Stack>
                                </Stack>
                              </Paper>
                            )
                          )}
                          {PRESET_SLOTS.filter((ps) => !patterns.some((p) => p.label === ps.label)).length > 0 && (
                            <>
                              <Divider sx={{ my: 0.5 }} />
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>Quick add</Typography>
                              {PRESET_SLOTS.filter((ps) => !patterns.some((p) => p.label === ps.label)).map((ps) => (
                                <Stack key={ps.key} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.5 }}>
                                  <Box>
                                    <Typography variant="caption" fontWeight={600} sx={{ display: "block" }}>{ps.label}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatDayGroupShort(ps.days)} · {fmtTime12(parseHHMM(ps.start))} – {fmtTime12(parseHHMM(ps.end))}
                                    </Typography>
                                  </Box>
                                  <Button size="small" variant="soft" onClick={() => {
                                    const newPattern = { id: `preset-${ps.key}-${Date.now()}`, label: ps.label, days: [...ps.days], start: parseHHMM(ps.start), end: parseHHMM(ps.end) };
                                    dispatch(setPatterns([...patterns, newPattern]));
                                    dispatch(pushToast({ title: "Slot added", description: ps.label }));
                                  }}>Add</Button>
                                </Stack>
                              ))}
                            </>
                          )}
                          <Button
                            size="small"
                            variant="soft"
                            startIcon={<AddOutlinedIcon sx={{ fontSize: 14 }} />}
                            onClick={() => setShowAddSlotModal(true)}
                            fullWidth
                          >
                            Custom slot
                          </Button>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  </Card>
                ) : (
                  <TaskCard
                    chipLabel="Needs update"
                    chipColor="var(--gl-status-declined-text)"
                    chipBg="var(--gl-status-declined-bg)"
                    chipBorder="var(--gl-status-declined-border)"
                    title="Add your availability"
                    description={`Keep availability up-to-date for next ${rangeDays} days.`}
                  />
                )}
              </Stack>
            </Card>
        </Grid>
      </Grid>}

      {/* ── Add custom slot modal ── */}
      <Dialog open={showAddSlotModal} onClose={() => setShowAddSlotModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.1rem", pb: 0 }}>
          Add custom slot
          <IconButton size="small" onClick={() => setShowAddSlotModal(false)} sx={{ position: "absolute", right: 12, top: 12 }}>
            <CloseOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="caption" fontWeight={600} sx={{ display: "block", mb: 1 }}>Select days</Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mb: 2 }}>
            {DOW_LONG.map((day) => (
              <Chip
                key={day}
                label={day.slice(0, 3)}
                size="small"
                variant={addDays.includes(day) ? "filled" : "outlined"}
                sx={addDays.includes(day) ? { bgcolor: "primary.main", color: "primary.contrastText", "&:hover": { bgcolor: "primary.dark" } } : { cursor: "pointer" }}
                onClick={() => setAddDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day])}
              />
            ))}
          </Stack>
          <Stack direction="row" spacing={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Start time</InputLabel>
              <Select label="Start time" value={addStart} onChange={(e) => setAddStart(e.target.value)}>
                {timeOptions12.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>End time</InputLabel>
              <Select label="End time" value={addEnd} onChange={(e) => setAddEnd(e.target.value)}>
                {timeOptions12.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="text" color="inherit" onClick={() => setShowAddSlotModal(false)}>Cancel</Button>
          <Button variant="contained" disabled={!addDays.length} onClick={() => {
            const label = `${formatDayGroupShort(addDays)} ${fmtTime12(parseHHMM(addStart))}–${fmtTime12(parseHHMM(addEnd))}`;
            const newPattern = { id: `custom-${Date.now()}`, label, days: [...addDays], start: parseHHMM(addStart), end: parseHHMM(addEnd) };
            dispatch(setPatterns([...patterns, newPattern]));
            dispatch(pushToast({ title: "Slot added", description: label }));
            setAddDays(["Saturday", "Sunday"]);
            setAddStart("10:00");
            setAddEnd("12:00");
            setShowAddSlotModal(false);
          }}>Add slot</Button>
        </DialogActions>
      </Dialog>

      {/* ── Confirm remove slot dialog ── */}
      <Dialog open={!!confirmRemoveId} onClose={() => setConfirmRemoveId(null)} maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.1rem" }}>Remove availability slot?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {confirmRemoveId && patterns.find((p) => p.id === confirmRemoveId)
              ? `This will remove "${patterns.find((p) => p.id === confirmRemoveId)!.label}" from your availability. You can add it back anytime.`
              : "This slot will be removed from your availability."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="text" color="inherit" onClick={() => setConfirmRemoveId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => {
            if (!confirmRemoveId) return;
            const removed = patterns.find((p) => p.id === confirmRemoveId);
            const updated = patterns.filter((p) => p.id !== confirmRemoveId);
            dispatch(setPatterns(updated));
            dispatch(pushToast({ title: "Slot removed", description: removed?.label ?? "" }));
            setConfirmRemoveId(null);
          }}>Remove</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
