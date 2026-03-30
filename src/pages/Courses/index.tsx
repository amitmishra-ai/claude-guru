import { useEffect, useMemo, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import InputBase from "@mui/material/InputBase";
import Skeleton from "@mui/material/Skeleton";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import SearchIcon from "@mui/icons-material/Search";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import { EmptyState } from "@/components/shared/EmptyState";
import { CoursePatternThumb } from "@/components/shared/CoursePatternThumb";
import { useAppSelector, useAppDispatch } from "@/store";
import { setSessionFocus } from "@/store/slices/sessionsSlice";
import { setOpenSession, setOpenSessionDetails, setOpenCompletedSession, setOpenCourseDetail, setCourseDetailId } from "@/store/slices/uiSlice";
import { demoCourseCatalog, demoCourseModules } from "@/data/demo-sessions";
import { sortByDateTime, dateTimeMs, fmtDateNice, fmtTime12 } from "@/lib/helpers";
import { demoNow } from "@/lib/constants";
import type { Session } from "@/lib/types";

/* ─── +N popover for remaining mapped sessions ────────────────────────────── */
function MappedSessionsOverflow({
  sessions,
  onSelect,
}: {
  sessions: Session[];
  onSelect: (s: Session) => void;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  return (
    <>
      <Chip
        label={`+${sessions.length}`}
        size="small"
        onClick={(e) => { e.stopPropagation(); setAnchor(e.currentTarget); }}
        sx={{ cursor: "pointer", fontSize: "0.7rem", height: 24, bgcolor: "action.selected", fontWeight: 600 }}
      />
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{ sx: { mt: 0.5, borderRadius: 2, minWidth: 260, boxShadow: 4 } }}
      >
        <Box sx={{ p: 1.5 }}>
          <Typography variant="caption" sx={{ px: 0.5, mb: 1, display: "block", color: "text.secondary", fontWeight: 500 }}>
            More sessions
          </Typography>
          {sessions.map((s) => (
            <Box
              key={s.id}
              component="button"
              onClick={(e) => { e.stopPropagation(); onSelect(s); setAnchor(null); }}
              sx={{
                display: "block", width: "100%", textAlign: "left", px: 1.5, py: 1,
                borderRadius: 1, border: "none", bgcolor: "transparent", cursor: "pointer",
                fontFamily: "inherit", "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.3 }} noWrap>
                {SESSION_TYPE_SHORT[s.sessionType] ?? s.sessionType}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {fmtDateNice(s.dateYmd)} &middot; {fmtTime12(s.start)}&ndash;{fmtTime12(s.end)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
}

/* ─── Mapped-event chip label: session type + date (not the title) ─────────── */
const SESSION_TYPE_SHORT: Record<string, string> = {
  "Online session": "Online session",
  "Mentored Learning session": "Mentored session",
  "Online class": "Online class",
  "Industry session": "Industry session",
  Residency: "Residency",
};

function fmtSessionChipLabel(s: Session) {
  const typeLabel = SESSION_TYPE_SHORT[s.sessionType] ?? s.sessionType;
  return `${typeLabel} · ${fmtDateNice(s.dateYmd)}`;
}

/* ─── Course card skeleton ────────────────────────────────────────────────── */
/* ─── Course card ─────────────────────────────────────────────────────────── */
function CourseCard({
  c,
  mapped,
  onOpenSession,
  isPast = false,
  isLearn = false,
  onCardClick,
  moduleData,
}: {
  c: import("@/lib/types").CourseCatalogItem;
  mapped: Session[];
  onOpenSession: (s: Session) => void;
  isPast?: boolean;
  isLearn?: boolean;
  onCardClick?: () => void;
  moduleData?: import("@/lib/types").CourseModuleData;
}) {
  const [firstSession, ...rest] = mapped;
  const sections = moduleData?.sections ?? [];
  const totalSections = sections.length;
  const overallProgress = totalSections > 0
    ? Math.round(sections.reduce((acc, s) => acc + s.progress, 0) / totalSections)
    : 0;
  return (
    <Grid size={{ xs: 6, sm: 6, md: 4 }}>
      <Card
        variant="outlined"
        onClick={onCardClick}
        sx={{
          height: "100%", display: "flex", flexDirection: "column",
          cursor: onCardClick ? "pointer" : "default",
          transition: "border-color 0.15s, box-shadow 0.15s",
          ...(onCardClick && {
            "&:hover": {
              borderColor: "primary.main",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            },
          }),
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, display: "flex", flexDirection: "column", flex: 1 }}>

          {/* Thumbnail row: pattern left, chips right */}
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, mb: { xs: 1, sm: 1.5 } }}>
            <CoursePatternThumb color={c.color ?? "#1976d2"} pattern={c.pattern ?? 0} size={52} />
            {c.isNew && !isPast && !isLearn && (
              <Chip
                label="New"
                size="small"
                icon={<span style={{ fontSize: 11, marginLeft: 6 }}>✦</span>}
                sx={{
                  bgcolor: "var(--gl-new-badge-bg)", color: "var(--gl-new-badge-text)",
                  fontSize: "0.7rem", height: 22, fontWeight: 700,
                  "& .MuiChip-icon": { color: "var(--gl-new-badge-text)", ml: "4px" },
                }}
              />
            )}
          </Box>

          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700, lineHeight: 1.3, mb: 0.5, fontSize: { xs: "0.8rem", sm: "1rem" },
              display: "-webkit-box", WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical", overflow: "hidden",
              color: "text.primary",
            }}
          >
            {c.title}
          </Typography>

          {/* Program · Batch */}
          <Typography variant="body2" sx={{ color: "text.secondary", fontSize: { xs: "0.68rem", sm: "0.8rem" }, mb: { xs: 1, sm: 1.5 } }}>
            {c.program} &middot; {c.batch}
          </Typography>

          {/* Mapped sessions — only for teach courses */}
          {!isLearn && (
            <>
              <Divider sx={{ mb: { xs: 0.75, sm: 1.5 } }} />
              <Box sx={{ mt: "auto" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
                  <CalendarMonthIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: "text.secondary" }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", fontSize: { xs: "0.6rem", sm: "0.68rem" }, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {isPast ? "Events taught" : "Upcoming"}
                  </Typography>
                </Box>
                {mapped.length === 0 ? (
                  <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic", fontSize: { xs: "0.62rem", sm: "0.75rem" } }}>
                    {isPast ? "No events yet." : "None scheduled."}
                  </Typography>
                ) : (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, alignItems: "center" }}>
                    <Chip
                      label={fmtSessionChipLabel(firstSession)}
                      size="small"
                      onClick={(e) => { e.stopPropagation(); onOpenSession(firstSession); }}
                      sx={{
                        cursor: "pointer", fontSize: { xs: "0.58rem", sm: "0.7rem" }, height: { xs: 20, sm: 24 },
                        bgcolor: "var(--gl-mapped-session-bg)",
                        color: "var(--gl-mapped-session-text)",
                        "&:hover": { bgcolor: "var(--gl-mapped-session-hover)" },
                        maxWidth: { xs: 140, sm: 220 },
                        "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", px: { xs: 0.5, sm: 1 } },
                      }}
                    />
                    {rest.length > 0 && <MappedSessionsOverflow sessions={rest} onSelect={onOpenSession} />}
                  </Box>
                )}
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
}

/* ─── Course card skeleton ────────────────────────────────────────────────── */
function CourseCardSkeleton() {
  return (
    <Grid size={{ xs: 6, sm: 6, md: 4 }}>
      <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", flex: 1 }}>
          {/* Tags row */}
          <Box sx={{ display: "flex", gap: 0.75, mb: 1.25 }}>
            <Skeleton variant="rounded" width={48} height={22} sx={{ borderRadius: 10 }} />
            <Skeleton variant="rounded" width={64} height={22} sx={{ borderRadius: 10 }} />
          </Box>
          {/* Title */}
          <Skeleton variant="text" sx={{ fontSize: "1rem", mb: 0.5 }} />
          <Skeleton variant="text" sx={{ fontSize: "1rem", width: "70%", mb: 1.25 }} />
          {/* Meta */}
          <Skeleton variant="text" sx={{ fontSize: "0.8125rem", width: "55%", mb: 0.5 }} />
          <Skeleton variant="text" sx={{ fontSize: "0.8125rem", width: "75%", mb: 1.5 }} />
          <Divider sx={{ mb: 1.5 }} />
          {/* Sessions label + chip */}
          <Box sx={{ display: "flex", gap: 0.75, alignItems: "center", mb: 0.75 }}>
            <Skeleton variant="circular" width={14} height={14} />
            <Skeleton variant="text" width={100} sx={{ fontSize: "0.68rem" }} />
          </Box>
          <Skeleton variant="rounded" width={140} height={24} sx={{ borderRadius: 10 }} />
        </CardContent>
      </Card>
    </Grid>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */

// Module-level flag: survives React Strict Mode double-mount in development
let _coursesInitialLoadDone = false;

export default function CoursesPage() {
  const dispatch = useAppDispatch();
  const guruStage = useAppSelector((s) => s.devPanel.guruStage);
  const isEmpty = guruStage === "empty";
  const sessions = useAppSelector((s) => s.sessions.items);
  const sessionDeclined = useAppSelector((s) => s.sessions.sessionDeclined);

  const upcomingSessionsSorted = useMemo(() => {
    const nowMs = demoNow.getTime();
    return sortByDateTime(sessions).filter(
      (s) => dateTimeMs(s.dateYmd, s.start) >= nowMs && !sessionDeclined[s.id]
    );
  }, [sessions, sessionDeclined]);

  const courseToMappedSessions = useMemo(() => {
    const normalize = (x: string) => x.toLowerCase();
    const result: Record<string, typeof sessions> = {};
    for (const c of demoCourseCatalog) {
      const keys = c.topics.map(normalize);
      result[c.id] = upcomingSessionsSorted.filter((s) => {
        const hay = normalize(`${s.title} ${s.program} ${s.cohort}`);
        return keys.some((k) => hay.includes(k));
      });
    }
    return result;
  }, [upcomingSessionsSorted]);

  const sortedCatalog = useMemo(
    () => isEmpty ? [] : [...demoCourseCatalog].sort((a, b) => Number(b.isNew) - Number(a.isNew)),
    [isEmpty]
  );

  /* ── Loading skeleton ── */
  const [loading, setLoading] = useState(!_coursesInitialLoadDone);
  useEffect(() => {
    if (_coursesInitialLoadDone) return;
    const t = setTimeout(() => {
      _coursesInitialLoadDone = true;
      setLoading(false);
    }, 1000);
    return () => clearTimeout(t);
  }, []);

  /* ── Search ── */
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCatalog = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sortedCatalog;
    return sortedCatalog.filter((c) =>
      [c.title, c.program, c.batch].some((f) => f.toLowerCase().includes(q))
    );
  }, [sortedCatalog, searchQuery]);

  // Split by enrollment type
  const teachCatalog = useMemo(() => filteredCatalog.filter((c) => c.enrollment !== "learn"), [filteredCatalog]);
  const learnCatalog = useMemo(() => filteredCatalog.filter((c) => c.enrollment === "learn"), [filteredCatalog]);

  const teachCurrent = useMemo(() => teachCatalog.filter((c) => c.status === "current"), [teachCatalog]);
  const teachPast = useMemo(() => teachCatalog.filter((c) => c.status === "past"), [teachCatalog]);
  const learnCurrent = useMemo(() => learnCatalog.filter((c) => c.status === "current"), [learnCatalog]);
  const learnPast = useMemo(() => learnCatalog.filter((c) => c.status === "past"), [learnCatalog]);

  const [visibleTeachPastCount, setVisibleTeachPastCount] = useState(6);
  const [visibleLearnPastCount, setVisibleLearnPastCount] = useState(6);
  const visibleTeachPast = teachPast.slice(0, visibleTeachPastCount);
  const hasMoreTeachPast = visibleTeachPastCount < teachPast.length;
  const visibleLearnPast = learnPast.slice(0, visibleLearnPastCount);
  const hasMoreLearnPast = visibleLearnPastCount < learnPast.length;

  const openSession = (s: Session) => {
    dispatch(setSessionFocus(s));
    dispatch(setOpenSessionDetails(true));
  };

  const openCompletedSessionDialog = (s: Session) => {
    dispatch(setSessionFocus(s));
    dispatch(setOpenCompletedSession(true));
  };

  const openCourseDetail = (courseId: string) => {
    dispatch(setCourseDetailId(courseId));
    dispatch(setOpenCourseDetail(true));
  };

  const nothingFound = filteredCatalog.length === 0;

  return (
    <>
      {/* ── Page header ── */}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2} sx={{ mb: 0.5 }}>
        <Box>
          <Typography variant="h6" sx={{ lineHeight: 1.35, fontWeight: 700, fontSize: { xs: "1rem", sm: "1.25rem" } }}>Courses</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            Your teaching assignments and learning content
          </Typography>
        </Box>
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            gap: 1,
            height: 42,
            px: 2,
            borderRadius: "24px",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            transition: "all 0.2s ease",
            "&:hover": { borderColor: "text.secondary", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" },
            "&:focus-within": {
              borderColor: "primary.main",
              boxShadow: "0 0 0 3px hsl(var(--md-primary) / 0.12)",
            },
          }}
        >
          <SearchIcon sx={{ fontSize: 18, color: "text.secondary", flexShrink: 0 }} />
          <InputBase
            placeholder="Search courses…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ fontSize: "0.875rem", minWidth: 180, "& .MuiInputBase-input::placeholder": { color: "text.secondary", opacity: 0.7 } }}
          />
        </Box>
      </Stack>

      {/* Mobile search bar */}
      <Box
        sx={{
          display: { xs: "flex", sm: "none" },
          alignItems: "center",
          gap: 1,
          height: 40,
          px: 1.5,
          mt: 1.5,
          borderRadius: "12px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          "&:focus-within": { borderColor: "primary.main" },
        }}
      >
        <SearchIcon sx={{ fontSize: 18, color: "text.secondary", flexShrink: 0 }} />
        <InputBase
          placeholder="Search courses…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flex: 1, fontSize: "0.85rem", "& .MuiInputBase-input::placeholder": { color: "text.secondary", opacity: 0.7 } }}
        />
      </Box>

      <Box sx={{ mt: 2.5 }}>

        {/* Skeleton loading state */}
        {loading && (
          <Stack spacing={2.5}>
            {[0, 1].map((section) => (
              <Card key={section} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
                <Box sx={{ px: 2.5, py: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Skeleton variant="circular" width={20} height={20} />
                    <Skeleton variant="text" width={280} height={24} />
                    <Box sx={{ flex: 1 }} />
                    <Skeleton variant="rounded" width={28} height={22} sx={{ borderRadius: 10 }} />
                  </Stack>
                </Box>
                <Box sx={{ px: 2.5, pb: 2.5 }}>
                  <Grid container spacing={2}>
                    {Array.from({ length: 3 }).map((_, i) => <CourseCardSkeleton key={i} />)}
                  </Grid>
                </Box>
              </Card>
            ))}
          </Stack>
        )}

        {/* Empty state */}
        {!loading && nothingFound && (
          searchQuery.trim() ? (
            <EmptyState
              icon={<SearchIcon />}
              title={`No results for \u201c${searchQuery.trim()}\u201d`}
              subtitle="Try adjusting your search term or check the spelling"
            />
          ) : (
            <EmptyState
              icon={<AutoStoriesOutlinedIcon />}
              title="No courses available yet"
              subtitle="Courses you're enrolled in as Teacher or Teaching Assistant (TA) will appear here"
            />
          )
        )}

        {/* ── Courses you teach (Teacher / TA) ── */}
        {!loading && teachCatalog.length > 0 && (
          <Accordion
            defaultExpanded
            disableGutters
            elevation={0}
            sx={{
              border: 1, borderColor: "divider", borderRadius: "12px !important",
              overflow: "hidden", mb: 2.5,
              "&::before": { display: "none" },
              "& .MuiAccordionSummary-root:hover": { bgcolor: "action.hover" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ fontSize: 20 }} />}
              sx={{ px: { xs: 2, sm: 2.5 }, py: 1.25, "& .MuiAccordionSummary-content": { my: 1, alignItems: "center", gap: 1.25 } }}
            >
              <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: "primary.main", display: "flex", flexShrink: 0 }}>
                <SchoolOutlinedIcon sx={{ fontSize: 16, color: "primary.contrastText" }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3, fontSize: { xs: "0.875rem", sm: "0.95rem" } }}>Courses as teacher or TA</Typography>
              </Box>
              <Chip label={teachCatalog.length} size="small" sx={{ fontWeight: 700, fontSize: "0.75rem", height: 24, mr: 0.5 }} />
            </AccordionSummary>
            <AccordionDetails sx={{ px: { xs: 2, sm: 2.5 }, pb: 3, pt: 0.5 }}>
              {/* Current */}
              {teachCurrent.length > 0 && (
                <Box sx={{ mb: teachPast.length > 0 ? 3 : 0 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.secondary" }}>Current</Typography>
                    <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
                    <Typography variant="caption" color="text.disabled" fontWeight={600}>{teachCurrent.length}</Typography>
                  </Stack>
                  <Grid container spacing={2}>
                    {teachCurrent.map((c) => (
                      <CourseCard key={c.id} c={c} mapped={courseToMappedSessions[c.id] ?? []} onOpenSession={openSession} onCardClick={() => openCourseDetail(c.id)} moduleData={demoCourseModules[c.id]} />
                    ))}
                  </Grid>
                </Box>
              )}
              {/* Completed */}
              {teachPast.length > 0 && (
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.secondary" }}>Completed</Typography>
                    <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
                    <Typography variant="caption" color="text.disabled" fontWeight={600}>{teachPast.length}</Typography>
                  </Stack>
                  <Grid container spacing={2}>
                    {visibleTeachPast.map((c) => (
                      <CourseCard key={c.id} c={c} mapped={courseToMappedSessions[c.id] ?? []} onOpenSession={openCompletedSessionDialog} isPast onCardClick={() => openCourseDetail(c.id)} />
                    ))}
                  </Grid>
                  {hasMoreTeachPast && (
                    <Box sx={{ mt: 2.5, display: "flex", justifyContent: "center" }}>
                      <Button variant="soft" size="small" endIcon={<ExpandMoreIcon />} onClick={() => setVisibleTeachPastCount((n) => n + 9)}>
                        Show more
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        )}

        {/* ── Standalone courses you're learning (Student) ── */}
        {!loading && learnCatalog.length > 0 && (
          <Accordion
            defaultExpanded
            disableGutters
            elevation={0}
            sx={{
              border: 1, borderColor: "divider", borderRadius: "12px !important",
              overflow: "hidden", mb: 2,
              "&::before": { display: "none" },
              "& .MuiAccordionSummary-root:hover": { bgcolor: "action.hover" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ fontSize: 20 }} />}
              sx={{ px: { xs: 2, sm: 2.5 }, py: 1.25, "& .MuiAccordionSummary-content": { my: 1, alignItems: "center", gap: 1.25 } }}
            >
              <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: "secondary.main", display: "flex", flexShrink: 0 }}>
                <MenuBookOutlinedIcon sx={{ fontSize: 16, color: "secondary.contrastText" }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3, fontSize: { xs: "0.875rem", sm: "0.95rem" } }}>Courses as student</Typography>
              </Box>
              <Chip label={learnCatalog.length} size="small" sx={{ fontWeight: 700, fontSize: "0.75rem", height: 24, mr: 0.5, alignSelf: "flex-start", mt: 0.5 }} />
            </AccordionSummary>
            <AccordionDetails sx={{ px: { xs: 2, sm: 2.5 }, pb: 3, pt: 0.5 }}>
              <Box sx={{ mb: 2, px: 1.5, py: 1, borderRadius: 1.5, bgcolor: "rgba(25,118,210,0.08)" }}>
                <Typography variant="caption" fontWeight={600} sx={{ color: "primary.main", lineHeight: 1.4 }}>
                  Enrolled in a GL program as a student? Switch to the Learner Dashboard from the menu to access those courses.
                </Typography>
              </Box>
              {/* Current */}
              {learnCurrent.length > 0 && (
                <Box sx={{ mb: learnPast.length > 0 ? 3 : 0 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.secondary" }}>Current</Typography>
                    <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
                    <Typography variant="caption" color="text.disabled" fontWeight={600}>{learnCurrent.length}</Typography>
                  </Stack>
                  <Grid container spacing={2}>
                    {learnCurrent.map((c) => (
                      <CourseCard key={c.id} c={c} mapped={[]} onOpenSession={openSession} isLearn onCardClick={() => openCourseDetail(c.id)} />
                    ))}
                  </Grid>
                </Box>
              )}
              {/* Completed */}
              {learnPast.length > 0 && (
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.secondary" }}>Completed</Typography>
                    <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
                    <Typography variant="caption" color="text.disabled" fontWeight={600}>{learnPast.length}</Typography>
                  </Stack>
                  <Grid container spacing={2}>
                    {visibleLearnPast.map((c) => (
                      <CourseCard key={c.id} c={c} mapped={[]} onOpenSession={openCompletedSessionDialog} isPast isLearn onCardClick={() => openCourseDetail(c.id)} />
                    ))}
                  </Grid>
                  {hasMoreLearnPast && (
                    <Box sx={{ mt: 2.5, display: "flex", justifyContent: "center" }}>
                      <Button variant="soft" size="small" endIcon={<ExpandMoreIcon />} onClick={() => setVisibleLearnPastCount((n) => n + 9)}>
                        Show more
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        )}

      </Box>
    </>
  );
}
