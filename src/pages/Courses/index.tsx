import { useMemo, useState } from "react";
import { CalendarDays, FileText, Lightbulb } from "lucide-react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProgramBadge } from "@/components/shared/ProgramBadge";
import { useAppSelector, useAppDispatch } from "@/store";
import { setSessionFocus } from "@/store/slices/sessionsSlice";
import { setOpenSession } from "@/store/slices/uiSlice";
import { demoCourseCatalog } from "@/data/demo-sessions";
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
        label={`+${sessions.length} more`}
        size="small"
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ cursor: "pointer", fontSize: "0.7rem", height: 22, bgcolor: "action.selected" }}
      />
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{ sx: { mt: 0.5, borderRadius: 1, minWidth: 260 } }}
      >
        <Box sx={{ p: 1 }}>
          {sessions.map((s) => (
            <Box
              key={s.id}
              component="button"
              onClick={() => { onSelect(s); setAnchor(null); }}
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

/* ═══════════════════════════════════════════════════════════════════════════ */

export default function CoursesPage() {
  const dispatch = useAppDispatch();
  const sessions = useAppSelector((s) => s.sessions.items);
  const sessionDeclined = useAppSelector((s) => s.sessions.sessionDeclined);

  /* §5 selectUpcomingSessions */
  const upcomingSessionsSorted = useMemo(() => {
    const nowMs = demoNow.getTime();
    return sortByDateTime(sessions).filter(
      (s) => dateTimeMs(s.dateYmd, s.start) >= nowMs && !sessionDeclined[s.id]
    );
  }, [sessions, sessionDeclined]);

  /* §6.3 Mapped sessions: case-insensitive keyword match */
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

  /* §6.1 Sort: isNew descending */
  const sortedCatalog = useMemo(
    () => [...demoCourseCatalog].sort((a, b) => Number(b.isNew) - Number(a.isNew)),
    []
  );

  const openSession = (s: Session) => {
    dispatch(setSessionFocus(s));
    dispatch(setOpenSession(true));
  };

  return (
    <>
      <PageHeader icon={FileText} title="Courses" subtitle="Your teaching assignments and mapped sessions." />

      <div className="mt-4 space-y-3">
        {sortedCatalog.map((c) => {
          const mapped = courseToMappedSessions[c.id] ?? [];
          const [firstSession, ...rest] = mapped;

          return (
            <Card key={c.id} variant="outlined">
              <CardContent sx={{ p: 2.5 }}>

                {/* §6.2 Top tags row */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1 }}>
                  {c.isNew && (
                    <Chip label="New" size="small" sx={{ bgcolor: "var(--gl-new-badge-bg)", color: "var(--gl-new-badge-text)", fontSize: "0.65rem", height: 20, fontWeight: 700 }} />
                  )}
                  <ProgramBadge program={c.program} />
                </Box>

                {/* §6.2 Course title — 2-line clamp */}
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600, lineHeight: 1.35, mb: 0.75,
                    display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}
                >
                  {c.title}
                </Typography>

                {/* §6.2 Meta tags */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                  <Chip label={`Role: ${c.role}`} size="small" variant="outlined" sx={{ fontSize: "0.65rem", height: 20 }} />
                  <Chip label={`${c.program} • ${c.batch}`} size="small" variant="outlined" sx={{ fontSize: "0.65rem", height: 20 }} />
                </Box>

                <Divider sx={{ mb: 1.5 }} />

                {/* §6.3 Mapped sessions */}
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
                    <CalendarDays size={13} style={{ opacity: 0.6 }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Mapped sessions
                    </Typography>
                  </Box>

                  {mapped.length === 0 ? (
                    <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                      No upcoming sessions mapped yet.
                    </Typography>
                  ) : (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, alignItems: "center" }}>
                      {/* First session pill */}
                      <Chip
                        label={`${firstSession.title.replace("Mentor Session: ", "")} · ${fmtDateNice(firstSession.dateYmd)}`}
                        size="small"
                        onClick={() => openSession(firstSession)}
                        sx={{
                          cursor: "pointer", fontSize: "0.7rem", height: 24,
                          bgcolor: "var(--gl-mapped-session-bg)", color: "var(--gl-mapped-session-text)",
                          "&:hover": { bgcolor: "var(--gl-mapped-session-hover)" },
                          maxWidth: 280,
                          "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
                        }}
                      />
                      {rest.length > 0 && <MappedSessionsOverflow sessions={rest} onSelect={openSession} />}
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          );
        })}

        {/* §6.4 Footer tip */}
        <Card variant="outlined" sx={{ bgcolor: "action.hover" }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
              <Lightbulb size={16} style={{ marginTop: 2, opacity: 0.65, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
                <strong>Tip:</strong> We'll recommend the right course automatically based on your next session topic.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
