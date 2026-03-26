import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store";
import { setSessionFocus } from "@/store/slices/sessionsSlice";
import { setOpenCompletedSession, setOpenLearnerRatings, setLearnerRatingsSessionId } from "@/store/slices/uiSlice";
import { pushToast } from "@/store/slices/toastsSlice";
import { demoLearnerRatingsBySessionId } from "@/data/demo-sessions";
import { fmtDateNice, fmtTime12, getTimeZoneOffsetMinutes, formatGMTOffsetFromMinutesAhead } from "@/lib/helpers";

function fmtDuration(start: number, end: number) {
  const mins = end - start;
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

export function CompletedSessionDetailDialog() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const open = useAppSelector((s) => s.ui.openCompletedSession);
  const session = useAppSelector((s) => s.sessions.sessionFocus);
  const close = () => {
    dispatch(setOpenCompletedSession(false));
    dispatch(setSessionFocus(null));
  };

  if (!session) return null;

  const ratings = demoLearnerRatingsBySessionId[session.id];
  const hasRatings = ratings && ratings.length > 0;
  const avg = hasRatings
    ? (ratings.reduce((a, r) => a + r.rating, 0) / ratings.length).toFixed(1)
    : null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={close}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100vw", sm: 480 },
          maxWidth: "100vw",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.06)",
          borderLeft: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>

        {/* ── Header ── */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            px: 2.5,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.8125rem" }}>Event details</Typography>
            <Chip
              label="Completed"
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 22,
                bgcolor: "var(--gl-status-completed-bg)",
                color: "var(--gl-status-completed-text)",
                border: "1px solid var(--gl-status-completed-border)",
              }}
            />
          </Stack>
          <IconButton size="small" onClick={close} sx={{ color: "text.secondary" }}>
            <CloseOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        {/* ── Scrollable content ── */}
        <Box className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto" }}>

          {/* Hero */}
          <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
            {/* Breadcrumb */}
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ letterSpacing: "0.02em", mb: 0.5, display: "block" }}>
              {[session.batch || session.program, session.sessionType].filter(Boolean).join(" · ")}
            </Typography>
            {/* Title + Rating */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.05rem", lineHeight: 1.3, mb: 0.25 }}>
                  {session.title}
                </Typography>
                {session.topic && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>
                    {session.topic}
                  </Typography>
                )}
              </Box>
              {avg && (
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0, mt: 0.5 }}>
                  <StarOutlinedIcon sx={{ fontSize: 16, color: "var(--gl-star-color)" }} />
                  <Typography variant="subtitle2" fontWeight={700}>{avg}</Typography>
                </Stack>
              )}
            </Stack>

            {/* Schedule card */}
            <Box
              sx={{
                mt: 2,
                p: 1.75,
                borderRadius: "10px",
                bgcolor: "hsl(var(--md-surface-container) / 0.5)",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "hsl(var(--md-primary-container))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: "hsl(var(--md-on-primary-container))" }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={700} sx={{ fontSize: "0.875rem", lineHeight: 1.2 }}>
                      {fmtDateNice(session.dateYmd)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      {fmtTime12(session.start)}&ndash;{fmtTime12(session.end)} &middot; {fmtDuration(session.start, session.end)}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "hsl(var(--md-surface-container))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <PlaceOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.8125rem", lineHeight: 1.2 }}>
                      {session.location}
                    </Typography>
                    {session.timeZone && (
                      <Typography variant="caption" color="text.secondary">
                        {session.timeZone} ({formatGMTOffsetFromMinutesAhead(getTimeZoneOffsetMinutes(session.timeZone))})
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Stack>
            </Box>
          </Box>

          <Divider />

          {/* Details section */}
          <Stack spacing={0} sx={{ px: 2.5, py: 2 }}>
            <Box sx={{ mb: 2.5 }}>
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
                <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}>
                  Details
                </Typography>
              </Stack>
              <Box sx={{ borderRadius: "12px", border: 1, borderColor: "divider", bgcolor: "hsl(var(--md-surface))", p: 2 }}>
                {session.scheduledByName && (
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 0.875 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, minWidth: 100, fontSize: "0.8125rem" }}>Scheduled by</Typography>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }}>{session.scheduledByName}</Typography>
                    </Box>
                  </Stack>
                )}
                {session.cohort && (
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 0.875 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, minWidth: 100, fontSize: "0.8125rem" }}>Batch</Typography>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }}>{session.cohort}</Typography>
                    </Box>
                  </Stack>
                )}
                {session.group && (
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 0.875 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, minWidth: 100, fontSize: "0.8125rem" }}>Group</Typography>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }} component="div">
                        <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                          <GroupsOutlinedIcon sx={{ fontSize: 14 }} />
                          <span>{session.group}</span>
                        </Stack>
                      </Typography>
                    </Box>
                  </Stack>
                )}
                {session.scheduledByEmail && (
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 0.875 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, minWidth: 100, fontSize: "0.8125rem" }}>Contact</Typography>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }} component="div">
                        <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                          <MailOutlinedIcon sx={{ fontSize: 13 }} />
                          <span>{session.scheduledByEmail}</span>
                        </Stack>
                      </Typography>
                    </Box>
                  </Stack>
                )}
              </Box>
            </Box>

            {/* Quick actions */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
                <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}>
                  Actions
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {session.recordingUrl && (
                  <Button
                    startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}
                    variant="soft"
                    size="small"
                    onClick={() => dispatch(pushToast({ title: "Opening recording", description: `Launching recording for ${session.title}` }))}
                  >
                    Watch recording
                  </Button>
                )}
                {hasRatings && (
                  <Button
                    startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}
                    variant="soft"
                    size="small"
                    onClick={() => {
                      dispatch(setLearnerRatingsSessionId(session.id));
                      dispatch(setOpenLearnerRatings(true));
                    }}
                  >
                    View ratings
                  </Button>
                )}
                <Button
                  startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 14 }} />}
                  variant="soft"
                  size="small"
                  onClick={() => { close(); navigate("/payments"); }}
                >
                  View in payments
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* ── Footer ── */}
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            zIndex: 10,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            px: 2.5,
            py: 1.5,
            display: "flex",
            justifyContent: "flex-start",
            flexShrink: 0,
          }}
        >
          <Button variant="text" color="inherit" size="small" onClick={close}>
            Close
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
