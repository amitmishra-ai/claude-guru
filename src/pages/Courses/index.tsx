import { useEffect, useMemo, useState } from "react";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputBase from "@mui/material/InputBase";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { FileText } from "lucide-react";
import TuneIcon from "@mui/icons-material/Tune";
import { PageHeader } from "@/components/shared/PageHeader";
import { CoursePatternThumb } from "@/components/shared/CoursePatternThumb";
import { useAppSelector, useAppDispatch } from "@/store";
import { setSessionFocus } from "@/store/slices/sessionsSlice";
import { setOpenSession, setOpenCompletedSession, setOpenCourseDetail, setCourseDetailId } from "@/store/slices/uiSlice";
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
                {s.title.replace("Mentor Session: ", "")}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {fmtDateNice(s.dateYmd)} &bull; {fmtTime12(s.start)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
}

/* ─── Course card skeleton ────────────────────────────────────────────────── */
/* ─── Course card ─────────────────────────────────────────────────────────── */
function CourseCard({
  c,
  mapped,
  onOpenSession,
  isPast = false,
  onCardClick,
  moduleData,
}: {
  c: import("@/lib/types").CourseCatalogItem;
  mapped: Session[];
  onOpenSession: (s: Session) => void;
  isPast?: boolean;
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
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
        <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", flex: 1 }}>

          {/* Thumbnail row: pattern left, chips right */}
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, mb: 1.5 }}>
            <CoursePatternThumb color={c.color} pattern={c.pattern} size={72} />

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, justifyContent: "flex-end", pt: 0.25 }}>
              <Chip label={c.role} size="small" variant="outlined" sx={{ fontSize: "0.7rem", height: 22, fontWeight: 500 }} />
              {c.isNew && !isPast && (
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
          </Box>

          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700, lineHeight: 1.3, mb: 0.5, fontSize: "1rem",
              display: "-webkit-box", WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical", overflow: "hidden",
              color: "text.primary",
            }}
          >
            {c.title}
          </Typography>

          {/* Program · Batch */}
          <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8rem", mb: 1.5 }}>
            {c.program} &bull; {c.batch}
          </Typography>

          {/* Progress + stats (current courses only) */}
          {!isPast && totalSections > 0 && (
            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={overallProgress}
                  sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: "action.selected" }}
                />
                <Typography variant="caption" sx={{ flexShrink: 0, color: "text.secondary", fontSize: "0.7rem" }}>
                  {overallProgress}%
                </Typography>
              </Box>
            </Box>
          )}

          {/* Mapped sessions */}
          <Box sx={{ mt: "auto" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
              <CalendarMonthIcon sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {isPast ? "Sessions taught" : "Upcoming sessions"}
              </Typography>
            </Box>
            {mapped.length === 0 ? (
              <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                {isPast ? "No sessions yet." : "No sessions scheduled yet."}
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, alignItems: "center" }}>
                <Chip
                  label={firstSession.title.replace("Mentor Session: ", "")}
                  size="small"
                  onClick={(e) => { e.stopPropagation(); onOpenSession(firstSession); }}
                  sx={{
                    cursor: "pointer", fontSize: "0.7rem", height: 24,
                    bgcolor: "var(--gl-mapped-session-bg)",
                    color: "var(--gl-mapped-session-text)",
                    "&:hover": { bgcolor: "var(--gl-mapped-session-hover)" },
                    maxWidth: 220,
                    "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
                  }}
                />
                {rest.length > 0 && <MappedSessionsOverflow sessions={rest} onSelect={onOpenSession} />}
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
}

/* ─── Course card skeleton ────────────────────────────────────────────────── */
function CourseCardSkeleton() {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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

/* ─── Search + filter bar ─────────────────────────────────────────────────── */
function SearchFilterBar({
  searchQuery,
  onSearchChange,
  activeFilterCount,
  onOpenDrawer,
  fullWidth = false,
}: {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  activeFilterCount: number;
  onOpenDrawer: () => void;
  fullWidth?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex", alignItems: "center", height: 40,
        border: 1, borderColor: "divider", borderRadius: 1.5,
        overflow: "hidden", bgcolor: "background.paper",
        width: fullWidth ? "100%" : undefined,
        "&:focus-within": { borderColor: "text.secondary" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", px: 1.25, gap: 0.75, flex: 1, minWidth: 0 }}>
        <SearchIcon sx={{ fontSize: 15, color: "text.disabled", flexShrink: 0 }} />
        <InputBase
          placeholder="Search courses…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ fontSize: "0.8125rem", flex: 1, minWidth: 0 }}
        />
      </Box>

      <Divider orientation="vertical" flexItem />

      <Box
        component="button"
        onClick={onOpenDrawer}
        sx={{
          display: "flex", alignItems: "center", gap: 0.75,
          px: 1.5, height: "100%", flexShrink: 0,
          border: "none", bgcolor: activeFilterCount > 0 ? "action.selected" : "transparent",
          cursor: "pointer", fontFamily: "inherit",
          color: activeFilterCount > 0 ? "text.primary" : "text.secondary",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <TuneIcon sx={{ fontSize: 15 }} />
        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.8125rem" }}>
          Filters
        </Typography>
        {activeFilterCount > 0 && (
          <Chip
            label={activeFilterCount}
            size="small"
            sx={{ height: 18, minWidth: 18, fontSize: "0.65rem", fontWeight: 700, px: 0, "& .MuiChip-label": { px: "5px" } }}
          />
        )}
      </Box>
    </Box>
  );
}

/* ─── Filter section label ────────────────────────────────────────────────── */
function FilterSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="caption"
      sx={{ fontWeight: 700, color: "text.disabled", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", mb: 1.25 }}
    >
      {children}
    </Typography>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */

// Module-level flag: survives React Strict Mode double-mount in development
let _coursesInitialLoadDone = false;

export default function CoursesPage() {
  const dispatch = useAppDispatch();
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
    () => [...demoCourseCatalog].sort((a, b) => Number(b.isNew) - Number(a.isNew)),
    []
  );

  /* ── Derive unique filter options from catalog ── */
  const allPrograms = useMemo(() => [...new Set(sortedCatalog.map((c) => c.program))], [sortedCatalog]);
  const allRoles    = useMemo(() => [...new Set(sortedCatalog.map((c) => c.role))],    [sortedCatalog]);
  const allBatches  = useMemo(() => [...new Set(sortedCatalog.map((c) => c.batch))],   [sortedCatalog]);

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

  /* ── Applied filters (committed on "Apply") ── */
  const [appliedPrograms, setAppliedPrograms] = useState<string[]>([]);
  const [appliedRoles,    setAppliedRoles]    = useState<string[]>([]);
  const [appliedBatch,    setAppliedBatch]    = useState("");

  /* ── Pending filters (draft inside drawer) ── */
  const [drawerOpen,      setDrawerOpen]      = useState(false);
  const [pendingPrograms, setPendingPrograms] = useState<string[]>([]);
  const [pendingRoles,    setPendingRoles]    = useState<string[]>([]);
  const [pendingBatch,    setPendingBatch]    = useState("");

  const openDrawer = () => {
    setPendingPrograms(appliedPrograms);
    setPendingRoles(appliedRoles);
    setPendingBatch(appliedBatch);
    setDrawerOpen(true);
  };

  const applyFilters = () => {
    setAppliedPrograms(pendingPrograms);
    setAppliedRoles(pendingRoles);
    setAppliedBatch(pendingBatch);
    setDrawerOpen(false);
  };

  const clearPending = () => {
    setPendingPrograms([]);
    setPendingRoles([]);
    setPendingBatch("");
  };

  const togglePendingProgram = (p: string) =>
    setPendingPrograms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

  const togglePendingRole = (r: string) =>
    setPendingRoles((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]);

  const activeFilterCount = appliedPrograms.length + appliedRoles.length + (appliedBatch ? 1 : 0);

  /* ── Filtered catalog (search + applied filters) ── */
  const filteredCatalog = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sortedCatalog.filter((c) => {
      if (appliedPrograms.length > 0 && !appliedPrograms.includes(c.program)) return false;
      if (appliedRoles.length > 0    && !appliedRoles.includes(c.role))       return false;
      if (appliedBatch               && c.batch !== appliedBatch)              return false;
      if (q && !([c.title, c.program, c.role, c.batch].some((f) => f.toLowerCase().includes(q)))) return false;
      return true;
    });
  }, [sortedCatalog, searchQuery, appliedPrograms, appliedRoles, appliedBatch]);

  const currentCourses = useMemo(() => filteredCatalog.filter((c) => c.status === "current"), [filteredCatalog]);
  const pastCourses    = useMemo(() => filteredCatalog.filter((c) => c.status === "past"),    [filteredCatalog]);

  const [visiblePastCount, setVisiblePastCount] = useState(6);
  useEffect(() => { setVisiblePastCount(6); }, [searchQuery, appliedPrograms, appliedRoles, appliedBatch]);
  const visiblePastCourses = pastCourses.slice(0, visiblePastCount);
  const hasMorePast = visiblePastCount < pastCourses.length;

  const openSession = (s: Session) => {
    dispatch(setSessionFocus(s));
    dispatch(setOpenSession(true));
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
  const hasActiveFilters = activeFilterCount > 0 || searchQuery.trim() !== "";

  return (
    <>
      <PageHeader
        icon={FileText}
        title="Courses"
        subtitle="Track your teaching assignments, sessions and learning content"
        action={
          <Box sx={{ display: { xs: "none", sm: "flex" } }}>
            <SearchFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeFilterCount={activeFilterCount}
              onOpenDrawer={openDrawer}
            />
          </Box>
        }
      />

      <Box sx={{ mt: 2 }}>

        {/* Skeleton loading state */}
        {loading && (
          <>
            {/* Current Courses skeleton */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Skeleton variant="text" width={130} height={24} />
                <Skeleton variant="rounded" width={24} height={20} sx={{ borderRadius: 10 }} />
              </Box>
              <Grid container spacing={2}>
                {Array.from({ length: 3 }).map((_, i) => <CourseCardSkeleton key={i} />)}
              </Grid>
            </Box>

            {/* Completed Courses skeleton */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Skeleton variant="text" width={155} height={24} />
                <Skeleton variant="rounded" width={28} height={20} sx={{ borderRadius: 10 }} />
              </Box>
              <Grid container spacing={2}>
                {Array.from({ length: 3 }).map((_, i) => <CourseCardSkeleton key={`p${i}`} />)}
              </Grid>
            </Box>
          </>
        )}

        {/* Empty state */}
        {!loading && nothingFound && (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <SearchIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              {hasActiveFilters ? "No courses match the current filters." : "No courses found."}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Try adjusting your search or filters.
            </Typography>
          </Box>
        )}

        {/* Current Courses */}
        {!loading && currentCourses.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Current Courses</Typography>
              <Chip label={currentCourses.length} size="small" sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600 }} />
            </Box>
            <Grid container spacing={2}>
              {currentCourses.map((c) => (
                <CourseCard key={c.id} c={c} mapped={courseToMappedSessions[c.id] ?? []} onOpenSession={openSession} onCardClick={() => openCourseDetail(c.id)} moduleData={demoCourseModules[c.id]} />
              ))}
            </Grid>
          </Box>
        )}

        {/* Completed Courses */}
        {!loading && pastCourses.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Completed Courses</Typography>
              <Chip label={pastCourses.length} size="small" sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600 }} />
            </Box>
            <Grid container spacing={2}>
              {visiblePastCourses.map((c) => (
                <CourseCard key={c.id} c={c} mapped={courseToMappedSessions[c.id] ?? []} onOpenSession={openCompletedSessionDialog} isPast onCardClick={() => openCourseDetail(c.id)} />
              ))}
            </Grid>
            {hasMorePast && (
              <Box sx={{ mt: 2.5, display: "flex", justifyContent: "center" }}>
                <Button variant="soft" size="small" endIcon={<ExpandMoreIcon />} onClick={() => setVisiblePastCount((n) => n + 9)}>
                  Show more
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Footer tip */}
        {!loading && (
          <Card variant="outlined" sx={{ mt: 2, bgcolor: "action.hover" }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                <LightbulbOutlinedIcon sx={{ fontSize: 18, mt: "2px", opacity: 0.65, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
                  <strong>Tip:</strong> Click any course to explore its modules, track your progress, and access learning resources. Completed courses are available for reference anytime.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* ── Filter drawer ──────────────────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: "100%", sm: 380 }, display: "flex", flexDirection: "column" },
        }}
      >
        {/* Header */}
        <Box sx={{ px: 3, pt: 3, pb: 2, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>Course Filters</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              Narrow down courses by program, role, or batch.
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setDrawerOpen(false)} sx={{ mt: 0.25 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider />

        {/* Scrollable filter body */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 2.5 }}>
          <Stack spacing={3}>

            {/* Program */}
            <Box>
              <FilterSectionLabel>Program</FilterSectionLabel>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {allPrograms.map((p) => {
                  const active = pendingPrograms.includes(p);
                  return (
                    <Chip
                      key={p}
                      label={p}
                      onClick={() => togglePendingProgram(p)}
                      variant={active ? "filled" : "outlined"}
                      color={active ? "primary" : "default"}
                      sx={{ fontWeight: active ? 600 : 400, cursor: "pointer" }}
                    />
                  );
                })}
              </Box>
            </Box>

            <Divider />

            {/* Role */}
            <Box>
              <FilterSectionLabel>Role</FilterSectionLabel>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {allRoles.map((r) => {
                  const active = pendingRoles.includes(r);
                  return (
                    <Chip
                      key={r}
                      label={r}
                      onClick={() => togglePendingRole(r)}
                      variant={active ? "filled" : "outlined"}
                      color={active ? "primary" : "default"}
                      sx={{ fontWeight: active ? 600 : 400, cursor: "pointer" }}
                    />
                  );
                })}
              </Box>
            </Box>

            <Divider />

            {/* Batch — single select */}
            <Box>
              <FilterSectionLabel>Batch</FilterSectionLabel>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {allBatches.map((b) => {
                  const active = pendingBatch === b;
                  return (
                    <Chip
                      key={b}
                      label={b}
                      onClick={() => setPendingBatch(active ? "" : b)}
                      variant={active ? "filled" : "outlined"}
                      color={active ? "primary" : "default"}
                      sx={{ fontWeight: active ? 600 : 400, cursor: "pointer" }}
                    />
                  );
                })}
              </Box>
            </Box>

          </Stack>
        </Box>

        <Divider />

        {/* Sticky footer */}
        <Box sx={{ px: 3, py: 2, display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
          <Button
            variant="soft"
            onClick={clearPending}
            disabled={pendingPrograms.length === 0 && pendingRoles.length === 0 && pendingBatch === ""}
            sx={{ textTransform: "none", fontWeight: 500 }}
          >
            Clear all
          </Button>
          <Button
            variant="contained"
            onClick={applyFilters}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Apply filters
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
