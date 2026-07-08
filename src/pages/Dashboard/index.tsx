import { Fragment, useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Skeleton from "@mui/material/Skeleton";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CallMergeOutlinedIcon from "@mui/icons-material/CallMergeOutlined";
import ViewListOutlinedIcon from "@mui/icons-material/ViewListOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
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
  setHomeSessionsView,
  setDeclineSessionFocus,
  setDeclineReason,
  setSelectedSessionType,
  setSelectedTimePeriod,
} from "@/store/slices/sessionsSlice";
import {
  setOpenSession,
  setOpenAvailability,
  setOpenDeclineReason,
  setOpenLearnerRatings,
  setLearnerRatingsSessionId,
  setOpenSessionDetails,
  setOpenSessionMaterials,
  setOpenPrepMaterialsModal,
  setMaterialViewerId,
} from "@/store/slices/uiSlice";
import { pushToast } from "@/store/slices/toastsSlice";
import {
  sortByDateTime,
  dateTimeMs,
  fmtDateNice,
  isSessionCompleted,
  isOverdueActivity,
  getLocaleFromTimezone,
} from "@/lib/helpers";
import { demoNow } from "@/lib/constants";
import { demoRatingHistory, demoLearnerRatingsBySessionId, demoPlannedEvents } from "@/data/demo-sessions";
import { SessionCard, STATUS_SCHEDULED } from "@/components/shared/SessionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DateRangeOutlinedIcon from "@mui/icons-material/DateRangeOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import type { Session, SessionType } from "@/lib/types";
import { filterSessionsByRole } from "@/lib/role-config";
import { getActivityStats } from "@/lib/activity-stats";

const slideOutDown = keyframes`
  0%   { opacity: 1; transform: translateY(0)     scale(1);   }
  100% { opacity: 0; transform: translateY(16px)  scale(0.97); }
`;

const slideInFromAbove = keyframes`
  0%   { opacity: 0; transform: translateY(-16px) scale(0.97); }
  100% { opacity: 1; transform: translateY(0)     scale(1);   }
`;

/* Session types with nothing to prep beforehand — 1:1 conversations or
   in-person events — so the review-material / mark-prepared workflow is
   omitted entirely rather than shown disabled. */
const NO_MATERIAL_REVIEW_TYPES: SessionType[] = ["Career mentoring session", "Capstone project mentoring session", "Residency"];

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

/* ── Task card used in sidebar ── */
function TaskCard({
  chipLabel,
  chipColor,
  chipBg,
  chipBorder,
  title,
  description,
  shortDescription,
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
  shortDescription?: string;
  action?: React.ReactNode;
  extra?: React.ReactNode;
  body?: React.ReactNode;
}) {
  return (
    <Card
      variant="outlined"
      sx={{ p: 2, height: "100%", transition: "border-color 0.2s", "&:hover": { borderColor: "primary.main" } }}
    >
      <Stack spacing={1.5}>
        <Box>
          {/* Chip above title on mobile */}
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ display: { xs: "flex", sm: "none" }, mb: 0.5 }}>
            <Chip label={chipLabel} size="small" sx={{ bgcolor: chipBg, color: chipColor, border: chipBorder ? `1px solid ${chipBorder}` : undefined, fontWeight: 500, fontSize: "0.75rem" }} />
            {extra}
          </Stack>
          {/* Title + chip side by side on desktop */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>{title}</Typography>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ display: { xs: "none", sm: "flex" } }}>
              <Chip label={chipLabel} size="small" sx={{ bgcolor: chipBg, color: chipColor, border: chipBorder ? `1px solid ${chipBorder}` : undefined, fontWeight: 500, fontSize: "0.75rem" }} />
              {extra}
            </Stack>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: shortDescription ? { xs: "none", sm: "block" } : "block" }}>{description}</Typography>
          {shortDescription && <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "block", sm: "none" } }}>{shortDescription}</Typography>}
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
  const guruStage = useAppSelector((s) => s.devPanel.guruStage);
  const isEmpty = guruStage === "empty";
  const allSessions = useAppSelector((s) => s.sessions.items);
  const selectedRole = useAppSelector((s) => s.devPanel.selectedRole);
  const sessions = useMemo(() => isEmpty ? [] : filterSessionsByRole(allSessions, selectedRole), [allSessions, selectedRole, isEmpty]);
  const confirmations = useAppSelector((s) => s.sessions.confirmations);
  const sessionDeclined = useAppSelector((s) => s.sessions.sessionDeclined);
  const homeSessionsView = useAppSelector((s) => s.sessions.homeSessionsView);
  const hasUserConfiguredAvailability = useAppSelector((s) => s.availability.hasUserConfiguredAvailability);
  const maxPerWeek = useAppSelector((s) => s.availability.maxPerWeek);
  const rangeDays = useAppSelector((s) => s.availability.rangeDays);
  const calendarConnected = useAppSelector((s) => s.availability.calendarConnected);
  const patterns = useAppSelector((s) => s.availability.patterns);
  const requests = useAppSelector((s) => s.requests.items);
  const guruName = useAppSelector((s) => s.profile.guruName);
  const timeZoneMode = useAppSelector((s) => s.profile.timeZoneMode);
  const manualTimeZone = useAppSelector((s) => s.profile.manualTimeZone);
  const userLocale = getLocaleFromTimezone(timeZoneMode === "manual" ? manualTimeZone : Intl.DateTimeFormat().resolvedOptions().timeZone);
  const polls = useAppSelector((s) => s.polls.items);
  const _supportTickets = useAppSelector((s) => s.support.tickets);
  const supportTickets = isEmpty ? [] : _supportTickets;
  const openTicketCount = supportTickets.filter((t) => t.status === "open" || t.status === "awaiting_reply").length;
  const escalatedTicketCount = supportTickets.filter((t) => t.status === "escalated").length;
  const selectedSessionType = useAppSelector((s) => s.sessions.selectedSessionType);
  const selectedTimePeriod = useAppSelector((s) => s.sessions.selectedTimePeriod);
  const recentlyConfirmedIds = useAppSelector((s) => s.sessions.recentlyConfirmedIds);

  /* ── loading states ─────────────────────────────── */
  const [pageLoading, setPageLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  useEffect(() => { const t = setTimeout(() => setPageLoading(false), 800); return () => clearTimeout(t); }, []);
  useEffect(() => { setTabLoading(true); const t = setTimeout(() => setTabLoading(false), 500); return () => clearTimeout(t); }, [homeSessionsView]);

  /* ── local state for exit animation ─────────────────────────────── */
  const [exitingId, setExitingId] = useState<string | null>(null);

  /* ── highlight unconfirmed sessions ─────────────────────────────── */
  const [highlightUnconfirmed, setHighlightUnconfirmed] = useState(false);
  const upcomingRef = useRef<HTMLDivElement>(null);
  const handleHighlightUnconfirmed = () => {
    dispatch(setHomeSessionsView("next"));
    setHighlightUnconfirmed(true);
    setTimeout(() => {
      upcomingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    setTimeout(() => setHighlightUnconfirmed(false), 3000);
  };

  /* ── planned event detail dialog state ───────────────────────── */
  const [plannedEventDetailId, setPlannedEventDetailId] = useState<string | null>(null);
  const plannedEventDetail = demoPlannedEvents.find((pe) => pe.id === plannedEventDetailId) ?? null;


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
    () => sortByDateTime(sessions).filter((s) => {
      /* Range activities (Evaluation, Moderation, Residency) stay in
         Upcoming while their window is still open — until endDateYmd
         passes. Single-day sessions use the original start-time check. */
      const stillOpen = s.endDateYmd
        ? dateTimeMs(s.endDateYmd, 24 * 60 - 1) >= nowMs
        : dateTimeMs(s.dateYmd, s.start) >= nowMs;
      return stillOpen && !sessionDeclined[s.id];
    }),
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

    if (selectedTimePeriod === "Last 6 months") {
      const sixMonthsAgo = new Date(demoNow);
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      filtered = filtered.filter((s) => new Date(s.dateYmd) >= sixMonthsAgo);
    } else if (["2025", "2024", "2023", "2022"].includes(selectedTimePeriod)) {
      filtered = filtered.filter((s) => s.dateYmd.startsWith(selectedTimePeriod));
    }

    return filtered;
  }, [completedSessions, selectedSessionType, selectedTimePeriod]);

  /* Overdue (Evaluation / Moderation only) — activities that slid into
     Completed because their due date passed while grading was unfinished.
     Pulled out of the normal month groups and pinned to the top so the Guru
     can still find and finish them. */
  const overdueCompletedSessions = useMemo(
    () => filteredCompletedSessions.filter(isOverdueActivity),
    [filteredCompletedSessions],
  );
  const settledCompletedSessions = useMemo(
    () => filteredCompletedSessions.filter((s) => !isOverdueActivity(s)),
    [filteredCompletedSessions],
  );

  /* Group completed sessions by month for accordion rendering. Order is
     preserved (input is already most-recent-first), so the first group in
     the list is the current / latest month. Overdue items are excluded —
     they live in the pinned Overdue section instead. */
  const currentMonthKey = demoNow.toISOString().slice(0, 7); // "YYYY-MM"
  const completedMonthGroups = useMemo(() => {
    const map = new Map<string, { key: string; label: string; sessions: typeof settledCompletedSessions }>();
    for (const s of settledCompletedSessions) {
      const key = s.dateYmd.slice(0, 7);
      if (!map.has(key)) {
        const label = new Date(s.dateYmd + "T00:00:00").toLocaleDateString(userLocale, { month: "long", year: "numeric" });
        map.set(key, { key, label, sessions: [] });
      }
      map.get(key)!.sessions.push(s);
    }
    return Array.from(map.values());
  }, [settledCompletedSessions, userLocale]);
  /* Overdue accordion — collapsed by default so it stays an at-a-glance flag. */
  const [overdueExpanded, setOverdueExpanded] = useState(false);
  /* Accordion expand state — prefer current month. If the current month has
     no completed activities (group missing), fall back to the latest month
     that does have data (first in the most-recent-first list). Re-seeds
     whenever the group list changes (filter/period swap). */
  const [expandedCompletedMonths, setExpandedCompletedMonths] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (!completedMonthGroups.length) { setExpandedCompletedMonths({}); return; }
    const defaultOpenKey = completedMonthGroups.some((g) => g.key === currentMonthKey)
      ? currentMonthKey
      : completedMonthGroups[0].key;
    const seed: Record<string, boolean> = {};
    for (const g of completedMonthGroups) seed[g.key] = g.key === defaultOpenKey;
    setExpandedCompletedMonths(seed);
  }, [completedMonthGroups, currentMonthKey]);

  // Career Mentor: learners self-schedule from the guru's calendar, so there are no tentative/planned events
  const rolePlannedEvents = useMemo(
    () => (isEmpty || selectedRole === "Career Mentor")
      ? []
      : filterSessionsByRole(demoPlannedEvents, selectedRole),
    [selectedRole, isEmpty],
  );

  const todayYmd = demoNow.toISOString().slice(0, 10);
  const todaySessions = upcomingSessions.filter((s) => s.dateYmd === todayYmd);
  const todaySessionIds = new Set(todaySessions.map((s) => s.id));
  const confirmedCount = upcomingSessions.filter((s) => confirmations[s.id] || todaySessionIds.has(s.id)).length;
  const scheduled = upcomingSessions
    .filter((s) => !confirmations[s.id] && !todaySessionIds.has(s.id))
    .sort((a, b) => {
      // Combined sessions first, then by date
      const aCombined = a.combinedBatches ? 1 : 0;
      const bCombined = b.combinedBatches ? 1 : 0;
      if (aCombined !== bCombined) return bCombined - aCombined;
      return dateTimeMs(a.dateYmd, a.start) - dateTimeMs(b.dateYmd, b.start);
    });
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

  const getOnCourseClick = (s: Session) => {
    if (!s.linkedCourseId) return undefined;
    return () => navigate("/courses");
  };

  /** Multiple prep modules → picker modal; exactly one → straight to the learner view. */
  const handleReviewMaterial = (s: Session) => {
    dispatch(setSessionFocus(s));
    const modules = s.prepModules ?? [];
    if (modules.length > 1) {
      dispatch(setOpenPrepMaterialsModal(true));
    } else if (modules.length === 1 && modules[0].materials.length > 0) {
      dispatch(setMaterialViewerId(modules[0].materials[0].id));
    } else {
      dispatch(pushToast({ title: "No materials added", description: "There's no prep material attached to this session yet." }));
    }
  };

  const isNewUser = guruStage === "new" || isEmpty;
  const isEarlyUser = guruStage === "early";
  const isNewOrEarly = isNewUser || isEarlyUser;

  const homeStatCards = isNewUser ? [
    { label: "Avg Rating", value: "-", delta: null, positive: true, accent: "var(--gl-accent-primary)", bg: "var(--gl-accent-primary-bg)", bars: [] as number[] },
    { label: "Avg Sessions", value: "-", delta: null, positive: true, accent: "var(--gl-accent-amber)", bg: "var(--gl-accent-amber-bg)", bars: [] as number[] },
    { label: "Avg Quality", value: "-", delta: null, positive: true, accent: "var(--gl-accent-purple)", bg: "var(--gl-accent-purple-bg)", bars: [] as number[] },
    { label: "Avg Confirm", value: "-", delta: null, positive: true, accent: "var(--gl-accent-success)", bg: "var(--gl-accent-success-bg)", bars: [] as number[] },
  ] : isEarlyUser ? [
    { label: "Avg Rating", value: "4.7", delta: null, positive: true, accent: "var(--gl-accent-primary)", bg: "var(--gl-accent-primary-bg)", bars: [] as number[] },
    { label: "Avg Sessions", value: "2/mo", delta: null, positive: true, accent: "var(--gl-accent-amber)", bg: "var(--gl-accent-amber-bg)", bars: [] as number[] },
    { label: "Avg Quality", value: "100%", delta: null, positive: true, accent: "var(--gl-accent-purple)", bg: "var(--gl-accent-purple-bg)", bars: [] as number[] },
    { label: "Avg Confirm", value: "3.5h", delta: null, positive: true, accent: "var(--gl-accent-success)", bg: "var(--gl-accent-success-bg)", bars: [] as number[] },
  ] : [
    { label: "Avg Rating", value: "4.65", delta: "+0.12", positive: true, accent: "var(--gl-accent-primary)", bg: "var(--gl-accent-primary-bg)", bars: [4.52, 4.58, 4.71, 4.65, 4.68, 4.74] },
    { label: "Avg Sessions", value: "6/mo", delta: "+2", positive: true, accent: "var(--gl-accent-amber)", bg: "var(--gl-accent-amber-bg)", bars: [5, 5, 6, 6, 8, 7] },
    { label: "Avg Quality", value: "96.8%", delta: "+0.5%", positive: true, accent: "var(--gl-accent-purple)", bg: "var(--gl-accent-purple-bg)", bars: [95.2, 96.0, 96.8, 97.1, 97.5, 98.0] },
    { label: "Avg Confirm", value: "7.2h", delta: "-1.3h", positive: true, accent: "var(--gl-accent-success)", bg: "var(--gl-accent-success-bg)", bars: [12, 9, 7, 6, 5, 4.2] },
  ];

  if (pageLoading) {
    return (
      <Stack spacing={2}>
        {/* Welcome skeleton */}
        <Skeleton variant="text" width={220} height={32} />

        <Grid container spacing={{ xs: 2, md: 3 }} alignItems="flex-start">
          {/* Left column skeleton */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Up next skeleton */}
            <Card sx={{ p: 2, mb: 2, borderRadius: "16px" }}>
              <Skeleton variant="text" width={80} height={20} sx={{ mb: 1.5 }} />
              {[0, 1].map((i) => (
                <Card key={i} variant="outlined" sx={{ p: 2, mb: 1.5 }}>
                  {i === 0 && <Skeleton variant="rounded" width={90} height={20} sx={{ mb: 1, borderRadius: 9999 }} />}
                  <Skeleton variant="text" width="65%" height={18} />
                  <Skeleton variant="text" width="45%" height={14} sx={{ mt: 0.5 }} />
                  <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                    <Skeleton variant="rounded" width={100} height={28} />
                    <Skeleton variant="rounded" width={130} height={28} />
                  </Stack>
                </Card>
              ))}
            </Card>

            {/* Activities card skeleton */}
            <Card sx={{ p: 2, borderRadius: "16px" }}>
              <Skeleton variant="text" width={90} height={22} sx={{ mb: 1.5 }} />
              {/* Tabs skeleton */}
              <Stack direction="row" spacing={3} sx={{ mb: 2, borderBottom: 1, borderColor: "divider", pb: 1 }}>
                {[130, 130, 110].map((w, i) => (
                  <Skeleton key={i} variant="text" width={w} height={22} />
                ))}
              </Stack>
              {/* Header */}
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <Skeleton variant="text" width={140} height={18} />
                <Skeleton variant="text" width={90} height={14} />
              </Stack>
              {/* Session cards skeleton */}
              {[0, 1, 2].map((i) => (
                <Card key={i} variant="outlined" sx={{ p: 2, mb: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" height={18} />
                      <Skeleton variant="text" width="40%" height={14} sx={{ mt: 0.5 }} />
                    </Box>
                    <Skeleton variant="rounded" width={70} height={20} sx={{ borderRadius: 9999 }} />
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                    <Skeleton variant="rounded" width={85} height={28} />
                    <Skeleton variant="rounded" width={105} height={28} />
                  </Stack>
                </Card>
              ))}
            </Card>
          </Grid>

          {/* Right column skeleton */}
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: { xs: "none", md: "block" } }}>
            {/* Tasks skeleton */}
            <Card sx={{ p: 2, mb: 2, borderRadius: "16px" }}>
              <Skeleton variant="text" width={50} height={20} sx={{ mb: 1.5 }} />
              <Stack spacing={1.5}>
                {/* Task card skeletons */}
                {[0, 1].map((i) => (
                  <Card key={i} variant="outlined" sx={{ px: 2, py: 1.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Skeleton variant="text" width={140} height={18} />
                        <Skeleton variant="text" width={180} height={14} sx={{ mt: 0.25 }} />
                      </Box>
                      <Skeleton variant="rounded" width={70} height={20} sx={{ borderRadius: 9999 }} />
                    </Stack>
                  </Card>
                ))}
                {/* Availability card skeleton */}
                <Card variant="outlined" sx={{ px: 2, py: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Skeleton variant="text" width={150} height={18} />
                      <Skeleton variant="text" width={120} height={14} sx={{ mt: 0.25 }} />
                    </Box>
                    <Skeleton variant="rounded" width={80} height={20} sx={{ borderRadius: 9999 }} />
                  </Stack>
                </Card>
                {/* Support tickets skeleton */}
                <Card variant="outlined" sx={{ px: 2, py: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Skeleton variant="text" width={120} height={18} />
                      <Skeleton variant="text" width={160} height={14} sx={{ mt: 0.25 }} />
                    </Box>
                    <Skeleton variant="rounded" width={60} height={20} sx={{ borderRadius: 9999 }} />
                  </Stack>
                </Card>
              </Stack>
            </Card>

            {/* Performance skeleton */}
            <Card sx={{ p: 2, borderRadius: "16px" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Skeleton variant="text" width={120} height={20} />
                <Skeleton variant="text" width={70} height={16} />
              </Stack>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                {[0, 1, 2, 3].map((i) => (
                  <Box key={i} sx={{ p: 1.25, border: "1px solid", borderColor: "divider", borderRadius: "12px" }}>
                    <Skeleton variant="text" width={60} height={10} />
                    <Skeleton variant="text" width={40} height={20} sx={{ mt: 0.25 }} />
                    <Skeleton variant="rectangular" width="100%" height={18} sx={{ mt: 0.5, borderRadius: 1 }} />
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    );
  }

  return (
    <Stack spacing={2} sx={{ ...(isEmpty && { minHeight: { xs: "calc(100vh - 5rem - env(safe-area-inset-bottom) - 32px)", sm: "auto" } }) }}>
      {/* ── Welcome header ── */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: -0.5, fontSize: { xs: "1.05rem", sm: "1.25rem" } }}>
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
            gap: 2,
            py: { xs: 6, md: 12 },
            borderRadius: "12px",
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
              Without marking your availability, no activities will be scheduled with you. Let learners know when you're free so they can book time with you.
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
        <Grid size={{ xs: 12, md: 8 }} sx={{ ...(isEmpty && { display: "flex", flexDirection: "column", flex: { xs: 1, sm: "unset" } }) }}>
          <Stack sx={{ ...(isEmpty && { flex: 1 }) }}>
            {/* Mobile tasks (horizontal scroll). On xs the card framing is
                stripped so task items get the full page width; tablets and
                up keep the original paper card. */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 1.5 }}>
              <Card sx={(theme) => ({
                p: 2,
                borderRadius: "16px",
                [theme.breakpoints.down("sm")]: {
                  p: 0,
                  borderRadius: 0,
                  border: "none",
                  boxShadow: "none",
                  bgcolor: "transparent",
                },
              })}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Tasks</Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    overflowX: "auto",
                    scrollSnapType: "x mandatory",
                    /* Break out to the viewport edge on xs (counter AppLayout's
                       `px: 2`); sm+ counters the parent Card's `p: 2`. */
                    mx: -2,
                    pb: 0.5,
                    "&::-webkit-scrollbar": { display: "none" },
                    scrollbarWidth: "none",
                    /* `scrollPaddingInline` matches the ::before inset so the
                       first snap-point lands with the first card aligned to
                       the heading. */
                    scrollPaddingInline: "16px",
                    /* ::before adds a 16px leading inset so the first card
                       lines up with the "Tasks" heading (16px page padding).
                       ::after adds a 16px trailing cushion on sm+ only so
                       the last card can reach the viewport's right edge on
                       mobile (matching the expected carousel pattern). */
                    "&::before": { content: '""', minWidth: 16, flexShrink: 0 },
                    "&::after": {
                      content: { xs: "none", sm: '""' },
                      minWidth: { xs: 0, sm: 16 },
                      flexShrink: 0,
                    },
                  }}
                >
                {/* Priority-sorted task cards:
                    Confirm pending=true → position 1, false → hidden
                    Availability configured=false → position 2, true → position 3
                    Support open=true → position 2, false → hidden
                    Calendar not connected → last
                */}
                {(() => {
                  const taskCardSx = { width: "70%", minWidth: "70%", maxWidth: "70%", flexShrink: 0, scrollSnapAlign: "start" } as const;
                  const tasks: { priority: number; key: string; node: React.ReactNode }[] = [];

                  if (needsWednesdayConfirm) {
                    tasks.push({ priority: 1, key: "confirm", node: (
                      <Box onClick={handleHighlightUnconfirmed} sx={{ ...taskCardSx, cursor: "pointer" }}>
                        <TaskCard chipLabel={`${upcomingSessions.length - confirmedCount} pending`} chipColor="var(--gl-status-declined-text)" chipBg="var(--gl-status-declined-bg)" chipBorder="var(--gl-status-declined-border)" title="Confirm upcoming activities" description="Confirm by Wed 6 PM to finalize allocations." shortDescription="Confirm by Wed 6 PM." />
                      </Box>
                    )});
                  }

                  if (!hasUserConfiguredAvailability) {
                    tasks.push({ priority: 2, key: "avail-setup", node: (
                      <Box sx={taskCardSx}>
                        <TaskCard chipLabel="Needs update" chipColor="var(--gl-status-declined-text)" chipBg="var(--gl-status-declined-bg)" chipBorder="var(--gl-status-declined-border)" title="Add your availability" description={`Keep availability up-to-date for next ${rangeDays} days.`} action={<Button size="small" variant="contained" onClick={() => dispatch(setOpenAvailability(true))}>Update availability</Button>} />
                      </Box>
                    )});
                  } else {
                    tasks.push({ priority: 3, key: "avail-summary", node: (
                      <Box sx={{ ...taskCardSx, cursor: "pointer" }} onClick={() => dispatch(setOpenAvailability(true))}>
                        <TaskCard chipLabel="Configured" chipColor="var(--gl-status-confirmed-text)" chipBg="var(--gl-status-confirmed-bg)" chipBorder="var(--gl-status-confirmed-border)" title="Availability summary" description={`${patterns.length} slot${patterns.length !== 1 ? "s" : ""} configured`} />
                      </Box>
                    )});
                  }

                  if (openTicketCount > 0) {
                    tasks.push({ priority: hasUserConfiguredAvailability ? 2 : 3, key: "support", node: (
                      <Box sx={{ ...taskCardSx, cursor: "pointer" }} onClick={() => navigate("/support")}>
                        <TaskCard chipLabel={`${openTicketCount} open`} chipColor="var(--gl-status-declined-text)" chipBg="var(--gl-status-declined-bg)" chipBorder="var(--gl-status-declined-border)" title="Support tickets" description={`${openTicketCount} open ticket${openTicketCount !== 1 ? "s" : ""}${escalatedTicketCount > 0 ? ` · ${escalatedTicketCount} escalated` : ""}`} />
                      </Box>
                    )});
                  }

                  if (!calendarConnected) {
                    tasks.push({ priority: 4, key: "calendar", node: (
                      <Box sx={taskCardSx}>
                        <TaskCard chipLabel="Not connected" chipColor="var(--gl-status-pending-text)" chipBg="var(--gl-status-pending-bg)" chipBorder="var(--gl-status-pending-border)" title="Avoid double booking" description="Connect calendar to detect conflicts." action={<Button size="small" variant="contained">Connect Google Calendar</Button>} />
                      </Box>
                    )});
                  }

                  return tasks.sort((a, b) => a.priority - b.priority).map((t) => <Fragment key={t.key}>{t.node}</Fragment>);
                })()}
              </Box>
              </Card>
            </Box>

            {/* ── Big container for entire left section ──
                On xs the framing dissolves (no border/padding/shadow) so
                inner cards get the full page width; sm+ keeps the original
                paper card exactly as before. */}
            <Card sx={(theme) => ({
              p: 2,
              borderRadius: "16px",
              [theme.breakpoints.down("sm")]: {
                p: 0,
                borderRadius: 0,
                border: "none",
                boxShadow: "none",
                bgcolor: "transparent",
              },
              ...(isEmpty && { flex: { xs: 1, sm: "unset" }, display: "flex", flexDirection: "column" }),
            })}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: { xs: 1, sm: 1.5 }, fontSize: { xs: "0.875rem", sm: "1rem" } }}>Activities</Typography>
              <Stack spacing={2} sx={{ ...(isEmpty && { flex: 1 }) }}>
                {/* Next Activities - hidden when no today sessions */}
                {todaySessions.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                    {todaySessions.length > 1 ? "Up next" : "Up next"}
                  </Typography>
                    <Stack spacing={1.5}>
                      {todaySessions.map((s) => {
                        const sessionStartMs = dateTimeMs(s.dateYmd, s.start);
                        const startsWithin30 = sessionStartMs - nowMs <= 30 * 60 * 1000 && sessionStartMs >= nowMs;
                        const joinEnabled = nowMs >= sessionStartMs - 30 * 60 * 1000;
                        /* Secondary Guru: no Join button, show a "Secondary" badge on the card. */
                        const isSecondaryGuru = selectedRole === "Secondary Guru";
                        const hasNoMaterialReview = NO_MATERIAL_REVIEW_TYPES.includes(s.sessionType);
                        return (
                          <Card
                            key={s.id}
                            variant="outlined"
                            sx={{
                              p: 0,
                              overflow: "hidden",
                              ...(startsWithin30
                                ? { bgcolor: 'hsl(var(--md-primary-container) / 0.12)', borderColor: 'hsl(var(--md-primary) / 0.4)' }
                                : {}),
                            }}
                          >
                            <SessionCard
                              title={s.title}
                              sessionType={s.sessionType}
                              topic={s.topic}
                              batch={s.batch}
                              dateYmd={s.dateYmd}
                              endDateYmd={s.endDateYmd}
                              start={s.start}
                              end={s.end}
                              onCourseClick={getOnCourseClick(s)}
                              status={STATUS_SCHEDULED}
                              topRight={startsWithin30 ? (
                                <Chip
                                  label="Starting soon"
                                  size="small"
                                  sx={{
                                    fontWeight: 500,
                                    fontSize: "0.7rem",
                                    height: 22,
                                    borderRadius: "4px",
                                    bgcolor: "var(--gl-status-declined-bg)",
                                    color: "var(--gl-status-declined-text)",
                                    border: "1px solid var(--gl-status-declined-border)",
                                    "& .MuiChip-label": { px: 1 },
                                  }}
                                />
                              ) : undefined}
                              actions={
                                <>
                                  {!isSecondaryGuru && (
                                    <Button
                                      variant={joinEnabled ? "contained" : "soft"}
                                      size="small"
                                      startIcon={<VideocamOutlinedIcon sx={{ fontSize: 16 }} />}
                                      disabled={!joinEnabled}
                                      onClick={() => dispatch(pushToast({ title: "Joining session", description: "Launching join link..." }))}
                                    >
                                      Join session
                                    </Button>
                                  )}
                                  {!hasNoMaterialReview && (
                                    <Button
                                      variant="soft"
                                      size="small"
                                      onClick={() => handleReviewMaterial(s)}
                                      startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 16 }} />}
                                      endIcon={<ChevronRightIcon sx={{ fontSize: 12 }} />}
                                      sx={{ "& .MuiButton-endIcon": { ml: 0.25 } }}
                                    >
                                      Review Material
                                    </Button>
                                  )}
                                </>
                              }
                              onViewDetails={() => {
                                dispatch(setSessionFocus(s));
                                dispatch(setOpenSessionDetails(true));
                              }}
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
                  <Tab icon={<EventNoteOutlinedIcon sx={{ fontSize: { xs: 14, sm: 18 } }} />} iconPosition="start" label={`Upcoming (${upcomingSessions.length})`} value="next" sx={{ "& .MuiTab-iconWrapper": { display: { xs: "none", sm: "flex" } } }} />
                  <Tab icon={<TaskAltOutlinedIcon sx={{ fontSize: { xs: 14, sm: 18 } }} />} iconPosition="start" label={`Completed (${completedSessions.length})`} value="completed" sx={{ "& .MuiTab-iconWrapper": { display: { xs: "none", sm: "flex" } } }} />
                </Tabs>

                {/* ── Tab loading skeleton ── */}
                {tabLoading ? (
                  <Stack spacing={1.5} sx={{ pt: 1 }}>
                    {[0, 1, 2].map((i) => (
                      <Card key={i} variant="outlined" sx={{ p: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="55%" height={20} />
                            <Skeleton variant="text" width="35%" height={16} sx={{ mt: 0.5 }} />
                          </Box>
                          <Skeleton variant="rounded" width={70} height={22} sx={{ borderRadius: 9999 }} />
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                          <Skeleton variant="rounded" width={85} height={28} />
                          <Skeleton variant="rounded" width={105} height={28} />
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                ) : null}

                {/* ── Upcoming tab ── */}
                {!tabLoading && homeSessionsView === "next" && (
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                      <Typography ref={upcomingRef} variant="subtitle2" fontWeight={600}>Upcoming activities</Typography>
                      <Typography variant="caption" color="text.secondary">{confirmedCount}/{upcomingSessions.length} confirmed</Typography>
                    </Stack>
                    <Stack spacing={1.5}>
                      {upcomingSessions.filter((s) => !todaySessionIds.has(s.id)).length ? (
                        upcomingSessions.filter((s) => !todaySessionIds.has(s.id)).map((s) => {
                          const isConfirmed = !!confirmations[s.id];
                          const isExiting = s.id === exitingId && isConfirmed;
                          const isEvaluation = s.sessionType === "Evaluation";
                          const isModeration = s.sessionType === "Moderation";
                          const isEvalOrMod = isEvaluation || isModeration;
                          const hasNoMaterialReview = NO_MATERIAL_REVIEW_TYPES.includes(s.sessionType);
                          /* Progress stats — Evaluation: Submissions + Graded;
                             Moderation: Posts + Posts unread + Graded. Sourced from
                             getActivityStats so the card matches the Activity Details drawer. */
                          const hasLateSubmissions = s.id === "eval5";
                          const upcomingStats = getActivityStats(s);
                          /* Join session becomes available only close to the start
                             (within 30 min before) — same rule as the "Up next" cards. */
                          const joinEnabled = nowMs >= dateTimeMs(s.dateYmd, s.start) - 30 * 60 * 1000;
                          return (
                            <Card key={s.id} variant="outlined" sx={{
                              p: 0,
                              overflow: "hidden",
                              transition: "box-shadow 0.3s ease, border-color 0.3s ease",
                              ...(highlightUnconfirmed && !isConfirmed && {
                                borderColor: "primary.main",
                                boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}40`,
                              }),
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
                                endDateYmd={s.endDateYmd}
                                start={s.start}
                                end={s.end}
                                hideTime={isEvalOrMod}
                                stats={upcomingStats}
                                onCourseClick={isEvalOrMod ? undefined : getOnCourseClick(s)}
                                eyebrowExtra={hasLateSubmissions ? (
                                  <Chip
                                    label="Late submission"
                                    size="small"
                                    sx={{
                                      height: 20,
                                      borderRadius: "4px",
                                      bgcolor: "primary.main",
                                      color: "primary.contrastText",
                                      border: "none",
                                      fontWeight: 500,
                                      fontSize: "0.7rem",
                                      "& .MuiChip-label": { px: 1 },
                                    }}
                                  />
                                ) : undefined}
                                /* Chip always reads Scheduled — it reflects the backend-published
                                   state, not prep-review progress. "Prepared" surfaces on the
                                   Mark Prepared button itself instead. */
                                status={STATUS_SCHEDULED}
                                chips={undefined}
                                actions={isEvalOrMod ? (
                                  isConfirmed ? (
                                    <>
                                      <Button
                                        variant="soft"
                                        size="small"
                                        onClick={() => dispatch(pushToast({ title: "Opening discussion", description: `Launching discussion thread for ${s.title}` }))}
                                      >
                                        Discussion Question
                                      </Button>
                                      <Button
                                        variant="soft"
                                        size="small"
                                        onClick={() => dispatch(pushToast({ title: "Opening SpeedGrader", description: `Launching SpeedGrader for ${s.title}` }))}
                                      >
                                        Grade
                                      </Button>
                                    </>
                                  ) : (
                                    <Button
                                      startIcon={<TaskAltOutlinedIcon sx={{ fontSize: 18 }} />}
                                      size="small"
                                      variant="soft"
                                      onClick={() => {
                                        dispatch(confirmSession(s.id));
                                        dispatch(pushToast({ title: "Marked as prepared", description: `${s.title} \u2022 ${fmtDateNice(s.dateYmd)}` }));
                                      }}
                                    >
                                      Mark Prepared
                                    </Button>
                                  )
                                ) : (
                                  <>
                                    {/* Career mentoring / Capstone project mentoring sessions are
                                        1:1 conversations with nothing to review beforehand, so they
                                        skip the material-review + prepared workflow entirely. */}
                                    {!hasNoMaterialReview && (
                                      <Button
                                        variant="soft"
                                        size="small"
                                        onClick={() => handleReviewMaterial(s)}
                                        startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 16 }} />}
                                        endIcon={<ChevronRightIcon sx={{ fontSize: 12 }} />}
                                        sx={{ "& .MuiButton-endIcon": { ml: 0.25 } }}
                                      >
                                        Review Material
                                      </Button>
                                    )}
                                    {/* Join session \u2014 only surfaces close to the start time. */}
                                    {joinEnabled && (
                                      <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<VideocamOutlinedIcon sx={{ fontSize: 16 }} />}
                                        onClick={() => dispatch(pushToast({ title: "Joining session", description: "Launching join link..." }))}
                                      >
                                        Join session
                                      </Button>
                                    )}
                                    {/* Stays in the same slot after being marked \u2014 swaps to a
                                        disabled, ticked "Prepared" state rather than disappearing. */}
                                    {!hasNoMaterialReview && (
                                      isConfirmed ? (
                                        <Button
                                          startIcon={<TaskAltOutlinedIcon sx={{ fontSize: 18 }} />}
                                          size="small"
                                          variant="soft"
                                          disabled
                                        >
                                          Prepared
                                        </Button>
                                      ) : (
                                        <Button
                                          startIcon={<TaskAltOutlinedIcon sx={{ fontSize: 18 }} />}
                                          size="small"
                                          variant="soft"
                                          onClick={() => {
                                            dispatch(confirmSession(s.id));
                                            dispatch(pushToast({ title: "Marked as prepared", description: `${s.title} \u2022 ${fmtDateNice(s.dateYmd)}` }));
                                          }}
                                        >
                                          Mark Prepared
                                        </Button>
                                      )
                                    )}
                                  </>
                                )}
                                onViewDetails={() => {
                                  dispatch(setSessionFocus(s));
                                  dispatch(setOpenSessionDetails(true));
                                }}
                                hideMobileViewDetails={!!s.combinedBatches && s.sessionType !== "Career mentoring session"}
                              />
                              {s.combinedBatches && s.sessionType !== "Career mentoring session" && (
                                <>
                                <Accordion
                                  disableGutters
                                  elevation={0}
                                  defaultExpanded={false}
                                  square
                                  sx={{
                                    borderTop: "1px solid",
                                    borderColor: "divider",
                                    bgcolor: "transparent",
                                    boxShadow: "none",
                                    "&::before": { display: "none" },
                                    "& .MuiAccordion-region": { bgcolor: "transparent" },
                                  }}
                                >
                                  <AccordionSummary
                                    expandIcon={<ExpandMoreOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />}
                                    sx={{
                                      px: 2,
                                      py: 0,
                                      minHeight: "unset",
                                      bgcolor: "hsl(var(--md-surface-container) / 0.35)",
                                      "&:hover": { bgcolor: "hsl(var(--md-surface-container) / 0.6)" },
                                      transition: "background-color 0.15s",
                                      "& .MuiAccordionSummary-content": { my: 1, gap: 0.75, alignItems: "center" },
                                    }}
                                  >
                                    <CallMergeOutlinedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                                    <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                                      Combined session
                                    </Typography>
                                    <Chip label={s.combinedBatches.length} size="small" sx={{ height: 18, minWidth: 18, fontSize: "0.65rem", fontWeight: 700, bgcolor: "action.selected", "& .MuiChip-label": { px: 0.5 } }} />
                                    {s.audienceType === "Individual" && s.combinedBatches[0]?.learnerName && (
                                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>· {s.combinedBatches[0].learnerName}</Typography>
                                    )}
                                  </AccordionSummary>
                                  <AccordionDetails sx={{ p: 0, borderTop: "1px solid", borderColor: "divider" }}>
                                  <Stack divider={<Divider />}>
                                    {s.combinedBatches.flatMap((cb) => {
                                      const rows = cb.audienceType === "Individual"
                                        ? (cb.members && cb.members.length > 0
                                            ? cb.members.map((_m, i) => ({ key: cb.batch + "-ind-" + i, label: cb.batch, count: 1, chip: "Individual" }))
                                            : [{ key: cb.batch + "-ind", label: cb.batch, count: cb.learnerCount ?? 1, chip: "Individual" }])
                                        : [{
                                            key: cb.batch + (cb.group || ""),
                                            label: cb.batch,
                                            count: cb.learnerCount ?? 0,
                                            chip: cb.audienceType === "Batch" ? "Whole batch" : "Group",
                                          }];
                                      return rows.map((row) => (
                                        <Box key={row.key} sx={{ px: 2, py: 1 }}>
                                          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, minWidth: 0 }} noWrap>
                                              {row.label}
                                              <Box component="span" sx={{ fontWeight: 400, color: "text.secondary", ml: 0.5 }}>
                                                &middot; {row.count} learner{row.count !== 1 ? "s" : ""}
                                              </Box>
                                            </Typography>
                                            <Chip
                                              label={row.chip}
                                              size="small"
                                              variant="outlined"
                                              sx={{ fontWeight: 500, fontSize: "0.75rem", height: 20, flexShrink: 0, color: "text.secondary", borderColor: "divider" }}
                                            />
                                          </Stack>
                                        </Box>
                                      ));
                                    })}
                                  </Stack>
                                  </AccordionDetails>
                                </Accordion>
                                {/* Mobile view details row - spans full card width below accordion */}
                                <Box
                                  onClick={() => { dispatch(setSessionFocus(s)); dispatch(setOpenSessionDetails(true)); }}
                                  sx={{
                                    display: { xs: "flex", sm: "none" },
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    px: 2, py: "10px",
                                    cursor: "pointer",
                                    borderTop: 1, borderColor: "divider",
                                    bgcolor: "action.hover",
                                    "&:hover": { bgcolor: "action.selected" },
                                    transition: "background-color 0.15s",
                                  }}
                                >
                                  <Typography variant="caption" fontWeight={600} sx={{ fontSize: "0.75rem" }}>Details</Typography>
                                  <ChevronRightIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                                </Box>
                                </>
                              )}
                            </Card>
                          );
                        })
                      ) : (
                        <EmptyState
                          icon={<EventNoteOutlinedIcon />}
                          title="No upcoming activities"
                          subtitle="Scheduled activities will appear here once they're assigned to you by the program team"
                          compact
                        />
                      )}
                    </Stack>

                    {/* ── Planned Events (subject to change) - only show when data exists ── */}
                    {rolePlannedEvents.length > 0 && (
                      <>
                        <Divider sx={{ mt: 2.5, mb: 0 }} />
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2, mb: 1.5 }}>
                          <Typography variant="subtitle2" fontWeight={600}>Planned activities</Typography>
                          <Typography variant="caption" color="text.secondary">(subject to change)</Typography>
                        </Stack>
                        {/* Planned Event Detail Drawer (right-side, matching confirmed events) */}
                        <Drawer
                          anchor="right"
                          open={plannedEventDetail !== null}
                          onClose={() => setPlannedEventDetailId(null)}
                          sx={(t) => ({
                            "& .MuiDrawer-paper": {
                              width: { xs: "100vw", sm: 480 },
                              maxWidth: "100vw",
                              boxShadow: `-4px 0 24px ${t.palette.mode === "light" ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.24)"}`,
                              borderLeft: "1px solid",
                              borderColor: "divider",
                            },
                          })}
                        >
                          {plannedEventDetail && (() => {
                            /* Planned events are inherently tentative — "(subject to
                               change)" already says so — so we only surface a chip once
                               it's actually confirmed, not a redundant "To be confirmed". */
                            const peIsConfirmed = plannedEventDetail.status === "confirmed";
                            return (
                              <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
                                {/* Header - matches SessionDetailsModal */}
                                <Box
                                  sx={{
                                    position: "sticky",
                                    top: 0,
                                    zIndex: 10,
                                    borderBottom: 1,
                                    borderColor: "divider",
                                    bgcolor: "background.paper",
                                    px: 2,
                                    py: 1.5,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    flexShrink: 0,
                                  }}
                                >
                                  <Stack direction="row" alignItems="center" spacing={1.5}>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.8125rem" }}>Event details</Typography>
                                    {peIsConfirmed && (
                                      <Chip label="Confirmed" size="small" sx={{ fontWeight: 600, fontSize: "0.7rem", height: 22, bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)" }} />
                                    )}
                                  </Stack>
                                  <IconButton size="small" onClick={() => setPlannedEventDetailId(null)} sx={{ color: "text.secondary" }}>
                                    <CloseOutlinedIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Box>

                                {/* Scrollable content - matches SessionDetailsModal layout */}
                                <Box className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto" }}>
                                  {/* Hero: Title + Schedule */}
                                  <Box sx={{ px: 2, pt: 2, pb: 2 }}>
                                    {/* Breadcrumb */}
                                    <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ letterSpacing: "0.02em", mb: 0.5, display: "block" }}>
                                      {[plannedEventDetail.batch, plannedEventDetail.sessionType].filter(Boolean).join(" · ")}
                                    </Typography>
                                    {/* Title */}
                                    <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: "0.95rem", sm: "1.05rem" }, lineHeight: 1.3, mb: 0.25 }}>
                                      {plannedEventDetail.title}
                                    </Typography>

                                    {/* Schedule at-a-glance card */}
                                    <Box
                                      sx={{
                                        mt: 2,
                                        p: 1.75,
                                        borderRadius: "12px",
                                        bgcolor: "hsl(var(--md-surface-container) / 0.5)",
                                        border: "1px solid",
                                        borderColor: "divider",
                                      }}
                                    >
                                      <Stack spacing={1}>
                                        {/* Date */}
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                          <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "hsl(var(--md-primary-container))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: "hsl(var(--md-on-primary-container))" }} />
                                          </Box>
                                          <Box>
                                            <Typography variant="body2" fontWeight={700} sx={{ fontSize: "0.875rem", lineHeight: 1.2 }}>
                                              {fmtDateNice(plannedEventDetail.startDateYmd)} &ndash; {fmtDateNice(plannedEventDetail.endDateYmd)}
                                            </Typography>
                                            <Typography variant="caption" color="var(--gl-status-pending-text)" fontWeight={500}>
                                              Time to be confirmed
                                            </Typography>
                                          </Box>
                                        </Stack>

                                        {/* Contact */}
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                          <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "hsl(var(--md-surface-container))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <MailOutlineIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                                          </Box>
                                          <Box>
                                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.8125rem", lineHeight: 1.2 }}>
                                              {plannedEventDetail.contactEmail}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              Program contact
                                            </Typography>
                                          </Box>
                                        </Stack>
                                      </Stack>
                                    </Box>
                                  </Box>

                                  <Divider />

                                  {/* ═══ DETAIL SECTIONS - same pattern as SessionDetailsModal ═══ */}
                                  <Stack spacing={0} sx={{ px: 2, py: 2 }}>
                                    <Box sx={{ mb: 2.5 }}>
                                      {/* SectionHeading */}
                                      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
                                        <Box sx={{ color: "text.secondary", display: "flex", flexShrink: 0 }}>
                                          <InfoOutlinedIcon sx={{ fontSize: 14 }} />
                                        </Box>
                                        <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}>
                                          Details
                                        </Typography>
                                      </Stack>
                                      {/* SectionCard */}
                                      <Box sx={{ borderRadius: "8px", border: 1, borderColor: "divider", bgcolor: "hsl(var(--md-surface))", p: 2 }}>
                                        {/* DetailRow: Batch */}
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 0.875 }}>
                                          <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, minWidth: 100, fontSize: "0.8125rem" }}>Batch</Typography>
                                          <Box sx={{ textAlign: "right" }}>
                                            <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }}>{plannedEventDetail.batch}</Typography>
                                          </Box>
                                        </Stack>
                                        {/* DetailRow: Program */}
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 0.875 }}>
                                          <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, minWidth: 100, fontSize: "0.8125rem" }}>Program</Typography>
                                          <Box sx={{ textAlign: "right" }}>
                                            <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }}>{plannedEventDetail.program}</Typography>
                                          </Box>
                                        </Stack>
                                        {/* DetailRow: Contact */}
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 0.875 }}>
                                          <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, minWidth: 100, fontSize: "0.8125rem" }}>Contact</Typography>
                                          <Box sx={{ textAlign: "right" }}>
                                            <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }} component="div">
                                              <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                                                <MailOutlineIcon sx={{ fontSize: 13 }} />
                                                <span>{plannedEventDetail.contactEmail}</span>
                                                <IconButton size="small" onClick={() => navigator.clipboard.writeText(plannedEventDetail.contactEmail)} sx={{ p: 0.25, ml: 0.25 }}>
                                                  <ContentCopyOutlinedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                                                </IconButton>
                                              </Stack>
                                            </Typography>
                                          </Box>
                                        </Stack>
                                      </Box>
                                    </Box>
                                  </Stack>
                                </Box>
                              </Box>
                            );
                          })()}
                        </Drawer>

                        <Stack spacing={1.5}>
                          {rolePlannedEvents.map((pe) => {
                            /* Planned events are inherently tentative — only surface a
                               chip once actually confirmed, not a redundant "To be confirmed". */
                            const peIsConfirmed = pe.status === "confirmed";
                            const confirmedChip = (
                              <Chip label="Confirmed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 500, fontSize: "0.75rem" }} />
                            );
                            return (
                              <Card key={pe.id} variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
                                {/* Mobile: chip on top */}
                                {peIsConfirmed && (
                                  <Box sx={{ display: { xs: "block", sm: "none" }, mb: 0.75 }}>
                                    {confirmedChip}
                                  </Box>
                                )}
                                <Typography variant="h6" fontWeight={600} sx={{ display: { xs: "block", sm: "none" }, fontSize: "0.875rem", mb: 0.5 }}>
                                  {pe.sessionType}: <Box component="span" onClick={(e) => { e.stopPropagation(); navigate("/courses"); }} sx={{ color: "primary.main", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>{pe.title}</Box>
                                </Typography>
                                {/* Desktop: chip beside title */}
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ display: { xs: "none", sm: "flex" }, mb: 0.5 }}>
                                  <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem", minWidth: 0 }}>
                                    {pe.sessionType}: <Box component="span" onClick={(e) => { e.stopPropagation(); navigate("/courses"); }} sx={{ color: "primary.main", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>{pe.title}</Box>
                                  </Typography>
                                  {peIsConfirmed && confirmedChip}
                                </Stack>
                                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", minWidth: 0 }}>
                                  <CalendarTodayOutlinedIcon sx={{ fontSize: 12, flexShrink: 0 }} />
                                  <Typography variant="caption" color="text.secondary" noWrap sx={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {fmtDateNice(pe.startDateYmd)} &ndash; {fmtDateNice(pe.endDateYmd)} &middot; {pe.batch}
                                  </Typography>
                                </Stack>
                                {/* Desktop: text button */}
                                <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1, display: { xs: "none", sm: "flex" } }}>
                                  <Button variant="text" size="small" endIcon={<ChevronRightIcon sx={{ fontSize: 14 }} />} onClick={() => setPlannedEventDetailId(pe.id)}>Details</Button>
                                </Stack>
                                {/* Mobile: full-width row */}
                                <Box
                                  onClick={() => setPlannedEventDetailId(pe.id)}
                                  sx={{
                                    display: { xs: "flex", sm: "none" },
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mt: 2,
                                    mx: -2,
                                    mb: -2,
                                    px: 2,
                                    py: "10px",
                                    cursor: "pointer",
                                    borderTop: 1,
                                    borderColor: "divider",
                                    bgcolor: "action.hover",
                                    borderRadius: { xs: "0 0 12px 12px", sm: "0 0 12px 12px" },
                                    "&:hover": { bgcolor: "action.selected" },
                                    transition: "background-color 0.15s",
                                  }}
                                >
                                  <Typography variant="caption" fontWeight={600} sx={{ fontSize: "0.75rem" }}>Details</Typography>
                                  <ChevronRightIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                                </Box>
                              </Card>
                            );
                          })}
                        </Stack>
                      </>
                    )}
                  </Box>
                )}

                {/* ── Completed tab ── */}
                {!tabLoading && homeSessionsView === "completed" && (
                  <>
                    <Stack direction="row" justifyContent="flex-end">
                      <Select
                        size="small"
                        variant="outlined"
                        value={selectedTimePeriod}
                        onChange={(e) => dispatch(setSelectedTimePeriod(e.target.value as typeof selectedTimePeriod))}
                        sx={{
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          minWidth: 140,
                          "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
                          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "text.secondary" },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderWidth: 1 },
                          "& .MuiSelect-select": { py: 0.75, px: 1.5 },
                        }}
                      >
                        <MenuItem value="Last 6 months">Last 6 months</MenuItem>
                        <MenuItem value="2025">2025</MenuItem>
                        <MenuItem value="2024">2024</MenuItem>
                        <MenuItem value="2023">2023</MenuItem>
                        <MenuItem value="2022">2022</MenuItem>
                      </Select>
                    </Stack>

                    {filteredCompletedSessions.length > 0 ? (
                      <Stack spacing={1} useFlexGap>
                        {/* ── Overdue (pinned, Evaluation / Moderation) ── */}
                        {overdueCompletedSessions.length > 0 && (
                          <Accordion
                            elevation={0}
                            disableGutters
                            expanded={overdueExpanded}
                            onChange={(_, isOpen) => setOverdueExpanded(isOpen)}
                            sx={{
                              border: "1px solid",
                              borderColor: "var(--gl-status-declined-border)",
                              borderRadius: "12px",
                              overflow: "hidden",
                              "&:before": { display: "none" },
                              "&.Mui-expanded": { m: 0 },
                            }}
                          >
                            <AccordionSummary
                              expandIcon={<ExpandMoreOutlinedIcon sx={{ fontSize: 20, color: "var(--gl-status-declined-text)" }} />}
                              sx={{
                                px: 2,
                                bgcolor: "var(--gl-status-declined-bg)",
                                "& .MuiAccordionSummary-content": { alignItems: "center", gap: 1, my: 1 },
                              }}
                            >
                              <ErrorOutlineOutlinedIcon sx={{ fontSize: 18, color: "var(--gl-status-declined-text)" }} />
                              <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.875rem", color: "var(--gl-status-declined-text)" }}>
                                Overdue
                              </Typography>
                              <Chip
                                label={overdueCompletedSessions.length}
                                size="small"
                                sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600, bgcolor: "var(--gl-status-declined-text)", color: "common.white" }}
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, display: { xs: "none", sm: "block" } }}>
                                Past due date with grading unfinished
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: { xs: 1.25, sm: 1.5 } }}>
                              <Stack spacing={1.5}>
                                {overdueCompletedSessions.map((s) => {
                                  const isMod = s.sessionType === "Moderation";
                                  const overdueStats = getActivityStats(s, { overdue: true });
                                  return (
                                    <Card key={s.id} variant="outlined" sx={{ p: 0, overflow: "hidden", borderColor: "var(--gl-status-declined-border)" }}>
                                      <SessionCard
                                        title={s.title}
                                        sessionType={s.sessionType}
                                        topic={s.topic}
                                        batch={s.batch}
                                        dateYmd={s.dateYmd}
                                        endDateYmd={s.endDateYmd}
                                        start={s.start}
                                        end={s.end}
                                        hideTime
                                        stats={overdueStats}
                                        status={{ label: "Overdue", bg: "var(--gl-status-declined-bg)", color: "var(--gl-status-declined-text)", border: "var(--gl-status-declined-border)" }}
                                        actions={
                                          <>
                                            {isMod && (
                                              <Button variant="soft" size="small"
                                                onClick={() => dispatch(pushToast({ title: "Opening discussion", description: `Launching discussion thread for ${s.title}` }))}>
                                                Discussion Question
                                              </Button>
                                            )}
                                            <Button variant="soft" size="small"
                                              onClick={() => dispatch(pushToast({ title: "Opening SpeedGrader", description: `Resume grading for ${s.title}` }))}>
                                              {isMod ? "Grade" : "Evaluate"}
                                            </Button>
                                          </>
                                        }
                                        onViewDetails={() => {
                                          dispatch(setSessionFocus(s));
                                          dispatch(setOpenSessionDetails(true));
                                        }}
                                      />
                                    </Card>
                                  );
                                })}
                              </Stack>
                            </AccordionDetails>
                          </Accordion>
                        )}

                        {completedMonthGroups.map((group) => (
                          <Accordion
                            key={group.key}
                            elevation={0}
                            disableGutters
                            expanded={!!expandedCompletedMonths[group.key]}
                            onChange={(_, isOpen) => setExpandedCompletedMonths((prev) => ({ ...prev, [group.key]: isOpen }))}
                            sx={{
                              border: "1px solid",
                              borderColor: "divider",
                              borderRadius: "12px",
                              overflow: "hidden",
                              "&:before": { display: "none" },
                              "&.Mui-expanded": { m: 0 },
                            }}
                          >
                            <AccordionSummary
                              expandIcon={<ExpandMoreOutlinedIcon sx={{ fontSize: 20 }} />}
                              sx={{
                                px: 2,
                                bgcolor: "hsl(var(--md-surface-container) / 0.4)",
                                "& .MuiAccordionSummary-content": { alignItems: "center", gap: 1, my: 1 },
                              }}
                            >
                              <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.875rem" }}>
                                {group.label}
                              </Typography>
                              <Chip
                                label={group.sessions.length}
                                size="small"
                                sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600, bgcolor: "action.hover" }}
                              />
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: { xs: 1.25, sm: 1.5 } }}>
                              <Stack spacing={1.5}>
                                {group.sessions.map((s) => {
                          const ratings = demoLearnerRatingsBySessionId[s.id];
                          const hasRatings = ratings && ratings.length > 0;
                          const avg = hasRatings
                            ? (ratings.reduce((a, r) => a + r.rating, 0) / ratings.length).toFixed(1)
                            : null;
                          const avgNum = hasRatings
                            ? ratings.reduce((a, r) => a + r.rating, 0) / ratings.length
                            : 0;
                          const daysSinceSession = (nowMs - new Date(s.dateYmd).getTime()) / (1000 * 60 * 60 * 24);
                          const isMockInterview = s.title.toLowerCase().includes("mock");
                          const isPaid = s.paymentStatus === "paid";
                          const hasPaymentStatus = !!s.paymentStatus;
                          const st = s.sessionType;
                          const isResidency = st === "Residency";
                          const isEvaluation = st === "Evaluation";
                          const isModeration = st === "Moderation";
                          const isCapstone = st === "Capstone project mentoring session";
                          const isCVReview = st === "CV Review";

                          // Payment chip helper
                          const paymentChip = isPaid
                            ? <Chip label="Payment Processed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 500, fontSize: { xs: "0.65rem", sm: "0.75rem" } }} />
                            : hasPaymentStatus
                              ? <Chip label="Payment Pending" size="small" sx={{ bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)", fontWeight: 500, fontSize: { xs: "0.65rem", sm: "0.75rem" } }} />
                              : null;

                          // No-rating placeholder: star + "--"
                          const noRatingPlaceholder = (
                            <Stack direction="row" spacing={0.5} alignItems="center" className="star-rating-numeric" sx={{ flexShrink: 0 }}>
                              <StarOutlinedIcon sx={{ fontSize: 14, color: "action.disabled" }} />
                              <Typography variant="subtitle2" fontWeight={600} sx={{ color: "action.disabled" }}>--</Typography>
                            </Stack>
                          );

                          // Star rating helpers - numeric for Online/Residency, icons-only for Evaluation/Moderation
                          const numericRating = avg ? (
                            <Stack direction="row" spacing={0.5} alignItems="center" className="star-rating-numeric">
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

                          // Rating element (always present for rated types)
                          const ratingElement = (isCapstone || isCVReview) ? null : (numericRating ?? noRatingPlaceholder);

                          // Build top-right per activity type
                          let topRightContent: React.ReactNode;
                          if (isCapstone || isCVReview) {
                            topRightContent = paymentChip;
                          } else if (paymentChip) {
                            // Payment chip + rating side by side
                            topRightContent = (
                              <Stack direction="row" spacing={0.75} alignItems="center">
                                {paymentChip}
                                {ratingElement}
                              </Stack>
                            );
                          } else {
                            // No payment chip - rating will be placed inline with title
                            topRightContent = null;
                          }

                          // Build actions per activity type
                          const handleViewDetails = () => {
                            dispatch(setSessionFocus(s));
                            dispatch(setOpenSessionDetails(true));
                          };

                          let cardActions: React.ReactNode;
                          if (isCapstone) {
                            cardActions = (
                              <Button variant="soft" size="small" startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 14 }} />}
                                onClick={() => dispatch(pushToast({ title: "Student Progress", description: "Loading student progress..." }))}>
                                Progress
                              </Button>
                            );
                          } else if (isCVReview) {
                            cardActions = (
                              <Button variant="soft" size="small" startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 14 }} />}
                                onClick={() => dispatch(pushToast({ title: "View CV", description: "Opening reviewed CV..." }))}>
                                Reviewed CV
                              </Button>
                            );
                          } else if (isEvaluation || isModeration) {
                            cardActions = hasRatings ? (
                              <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}
                                onClick={() => { dispatch(setLearnerRatingsSessionId(s.id)); dispatch(setOpenLearnerRatings(true)); }}>
                                Feedback
                              </Button>
                            ) : null;
                          } else if (isResidency) {
                            cardActions = hasRatings ? (
                              <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}
                                onClick={() => { dispatch(setLearnerRatingsSessionId(s.id)); dispatch(setOpenLearnerRatings(true)); }}>
                                Feedback
                              </Button>
                            ) : null;
                          } else {
                            // Online session types
                            cardActions = (
                              <>
                                {s.recordingUrl && (
                                  <Button startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />} variant="soft" size="small"
                                    onClick={() => dispatch(pushToast({ title: "Opening recording", description: `Launching recording for ${s.title}` }))}>
                                    Recording
                                  </Button>
                                )}
                                {hasRatings && (
                                  <Button startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />} variant="soft" size="small"
                                    onClick={() => { dispatch(setLearnerRatingsSessionId(s.id)); dispatch(setOpenLearnerRatings(true)); }}>
                                    Feedback
                                  </Button>
                                )}
                                {isMockInterview && (
                                  <Button startIcon={<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 14 }} />} variant="soft" size="small"
                                    onClick={() => dispatch(pushToast({ title: "Share Feedback", description: "Opening mock interview feedback form..." }))}>
                                    Share Feedback
                                  </Button>
                                )}
                                <Button startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 14 }} />} variant="soft" size="small"
                                  onClick={() => navigate(`/payments?highlight=${s.id}`)}>
                                  Payments
                                </Button>
                              </>
                            );
                          }

                          // Date-only activity types (no time component)
                          const isDateOnly = isEvaluation || isModeration || isCapstone || isCVReview;
                          // Progress stats for Evaluation / Moderation — completed, so fully graded.
                          // Sourced from getActivityStats so the card matches the Activity Details drawer.
                          const cardStats = getActivityStats(s, { completed: true });

                          return (
                            <Card key={s.id} variant="outlined" sx={{ p: 0, overflow: "hidden" }}>
                              <SessionCard
                                title={s.title}
                                sessionType={s.sessionType}
                                topic={s.topic}
                                batch={s.batch}
                                dateYmd={s.dateYmd}
                                endDateYmd={s.endDateYmd}
                                start={s.start}
                                end={s.end}
                                hideTime={isDateOnly}
                                onCourseClick={isResidency || isCapstone || isCVReview ? undefined : getOnCourseClick(s)}
                                topRight={topRightContent}
                                titleRight={!topRightContent ? ratingElement : undefined}
                                stats={cardStats}
                                chips={undefined}
                                actions={cardActions}
                                onViewDetails={handleViewDetails}
                              />
                            </Card>
                          );
                        })}
                              </Stack>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </Stack>
                    ) : (
                      <EmptyState
                        icon={<CheckCircleOutlinedIcon />}
                        title="No activities completed yet"
                        subtitle="Once you complete your first activity, it'll appear here with feedback and payment info"
                        compact
                      />
                    )}
                  </>
                )}

              </Stack>
            </Card>
          </Stack>
        </Grid>

        {/* Right column: Tasks sidebar (desktop only) */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ display: { xs: 'none', md: 'block' }, alignSelf: 'flex-start', position: 'sticky', top: 24 }}>
            <Card sx={{ p: 2, mb: 2, borderRadius: "16px" }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Tasks</Typography>
              <Stack spacing={2}>
                {/* Priority-sorted desktop tasks - same logic as mobile */}
                {(() => {
                  const dt: { p: number; k: string; n: React.ReactNode }[] = [];

                  if (needsWednesdayConfirm) {
                    dt.push({ p: 1, k: "confirm", n: (
                      <Box onClick={handleHighlightUnconfirmed} sx={{ cursor: "pointer" }}>
                        <TaskCard chipLabel={`${upcomingSessions.length - confirmedCount} pending`} chipColor="var(--gl-status-declined-text)" chipBg="var(--gl-status-declined-bg)" chipBorder="var(--gl-status-declined-border)" title="Confirm upcoming activities" description="Confirm by Wed 6 PM to finalize allocations." />
                      </Box>
                    )});
                  }

                  if (!hasUserConfiguredAvailability) {
                    dt.push({ p: 2, k: "avail-setup", n: (
                      <TaskCard chipLabel="Needs update" chipColor="var(--gl-status-declined-text)" chipBg="var(--gl-status-declined-bg)" chipBorder="var(--gl-status-declined-border)" title="Add your availability" description={`Keep availability up-to-date for next ${rangeDays} days.`} />
                    )});
                  } else {
                    dt.push({ p: 3, k: "avail-summary", n: (
                      <Card variant="outlined" sx={{ px: 2, py: 1.5, cursor: "pointer", "&:hover": { borderColor: "primary.main" }, transition: "border-color 0.2s" }} onClick={() => dispatch(setOpenAvailability(true))}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>Availability summary</Typography>
                            <Typography variant="caption" color="text.secondary">{patterns.length} slot{patterns.length !== 1 ? "s" : ""} configured</Typography>
                          </Box>
                          <Chip label="Configured" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 500, fontSize: "0.75rem" }} />
                        </Stack>
                      </Card>
                    )});
                  }

                  if (openTicketCount > 0) {
                    dt.push({ p: hasUserConfiguredAvailability ? 2 : 3, k: "support", n: (
                      <Card variant="outlined" sx={{ px: 2, py: 1.5, cursor: "pointer", "&:hover": { borderColor: "primary.main" }, transition: "border-color 0.2s" }} onClick={() => navigate("/support")}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>Support tickets</Typography>
                            <Typography variant="caption" color="text.secondary">{openTicketCount} open ticket{openTicketCount !== 1 ? "s" : ""}{escalatedTicketCount > 0 ? ` · ${escalatedTicketCount} escalated` : ""}</Typography>
                          </Box>
                          <Chip label={`${openTicketCount} open`} size="small" sx={{ bgcolor: "var(--gl-status-declined-bg)", color: "var(--gl-status-declined-text)", border: "1px solid var(--gl-status-declined-border)", fontWeight: 500, fontSize: "0.75rem" }} />
                        </Stack>
                      </Card>
                    )});
                  }

                  if (!calendarConnected) {
                    dt.push({ p: 4, k: "calendar", n: (
                      <TaskCard chipLabel="Not connected" chipColor="var(--gl-status-pending-text)" chipBg="var(--gl-status-pending-bg)" chipBorder="var(--gl-status-pending-border)" title="Avoid double booking" description="Connect calendar to detect conflicts." action={<Button size="small" variant="contained">Connect Google Calendar</Button>} />
                    )});
                  }

                  return dt.sort((a, b) => a.p - b.p).map((t) => <Fragment key={t.k}>{t.n}</Fragment>);
                })()}
              </Stack>
            </Card>

          {/* Performance stats 2×2 grid */}
          <Card sx={{ p: 2, borderRadius: "16px" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>Your Performance</Typography>
            <Button variant="text" size="small" sx={{ textTransform: "none", fontSize: "0.75rem" }} onClick={() => navigate("/profile")}>
              View profile
            </Button>
          </Stack>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
            {homeStatCards.map((s) => {
              const minV = Math.min(...s.bars);
              const maxV = Math.max(...s.bars);
              const range = maxV - minV || 1;
              const w = 80;
              const h = 20;
              const pts = s.bars.map((v, i) => {
                const x = (i / (s.bars.length - 1)) * w;
                const y = h - ((v - minV) / range) * (h - 4) - 2;
                return `${x},${y}`;
              });
              const polyPoints = pts.join(" ");
              return (
                <Card
                  key={s.label}
                  elevation={0}
                  sx={{
                    p: 1.25,
                    bgcolor: s.bg,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                    "&:hover": { borderColor: s.accent },
                  }}
                  onClick={() => navigate("/profile")}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
                    <Box>
                      <Typography variant="caption" sx={{ color: s.accent, fontWeight: 700, fontSize: "0.55rem", letterSpacing: "0.06em" }}>
                        {s.label.toUpperCase()}
                      </Typography>
                      <Typography fontWeight={700} sx={{ fontSize: "1rem", lineHeight: 1.1, mt: 0.25, ...(s.value === "-" ? { opacity: 0.3 } : {}) }}>
                        {s.value}
                      </Typography>
                      {s.delta && (
                        <Typography variant="caption" sx={{ color: s.positive ? "success.main" : "error.main", fontWeight: 600, fontSize: "0.6rem" }}>
                          {s.positive ? "↗" : "↘"} {s.delta}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ width: 48, flexShrink: 0 }}>
                      {s.bars.length > 1 ? (
                        <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
                          <polygon points={`0,${h} ${polyPoints} ${w},${h}`} fill={s.accent} opacity={0.1} />
                          <polyline points={polyPoints} fill="none" stroke={s.accent} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
                          <circle cx={pts[pts.length - 1].split(",")[0]} cy={pts[pts.length - 1].split(",")[1]} r={2} fill={s.accent} />
                        </svg>
                      ) : (
                        <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
                          <line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke={s.accent} strokeWidth={1} strokeDasharray="3 3" opacity={0.25} />
                        </svg>
                      )}
                    </Box>
                  </Stack>
                </Card>
              );
            })}
          </Box>
          </Card>
        </Grid>
      </Grid>}

    </Stack>
  );
}
