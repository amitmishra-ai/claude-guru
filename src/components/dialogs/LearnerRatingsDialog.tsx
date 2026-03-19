import { useState } from "react";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { green, amber, red } from "@mui/material/colors";
import { useAppSelector, useAppDispatch } from "@/store";
import { setOpenLearnerRatings, setLearnerRatingsSessionId } from "@/store/slices/uiSlice";
import { demoLearnerRatingsBySessionId, demoFeedbackSummaryBySessionId } from "@/data/demo-sessions";
import type { ParameterRating } from "@/lib/types";

type FeedbackFilter = "all" | "4plus" | "3to4" | "below3";

const COLORS = {
  fiveStar: green[500],
  fourStar: amber[600],
  threeAndBelow: red[500],
} as const;

/* ── SVG Donut Chart ── */
function DonutChart({ fiveStar, fourStar, threeAndBelow }: { fiveStar: number; fourStar: number; threeAndBelow: number }) {
  const total = fiveStar + fourStar + threeAndBelow;
  if (total === 0) return null;

  const radius = 60;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 32;

  const fiveLen = (fiveStar / total) * circumference;
  const fourLen = (fourStar / total) * circumference;
  const threeLen = (threeAndBelow / total) * circumference;

  const fiveOffset = 0;
  const fourOffset = -(fiveLen);
  const threeOffset = -(fiveLen + fourLen);

  return (
    <svg width={160} height={160} viewBox="0 0 160 160">
      {/* 5 star */}
      <circle
        cx={cx} cy={cy} r={radius} fill="none"
        stroke={COLORS.fiveStar} strokeWidth={strokeWidth}
        strokeDasharray={`${fiveLen} ${circumference - fiveLen}`}
        strokeDashoffset={fiveOffset}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      {/* 4 star */}
      <circle
        cx={cx} cy={cy} r={radius} fill="none"
        stroke={COLORS.fourStar} strokeWidth={strokeWidth}
        strokeDasharray={`${fourLen} ${circumference - fourLen}`}
        strokeDashoffset={fourOffset}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      {/* 3 & below */}
      <circle
        cx={cx} cy={cy} r={radius} fill="none"
        stroke={COLORS.threeAndBelow} strokeWidth={strokeWidth}
        strokeDasharray={`${threeLen} ${circumference - threeLen}`}
        strokeDashoffset={threeOffset}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      {/* Center labels */}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="22" fontWeight="700" fill="currentColor">{fiveStar}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.6}>{fourStar} · {threeAndBelow}</text>
    </svg>
  );
}

/* ── Stacked Horizontal Bar ── */
function ParameterBar({ param }: { param: ParameterRating }) {
  const total = param.fiveStar + param.fourStar + param.threeAndBelow;
  if (total === 0) return null;

  const segments = [
    { value: param.fiveStar, color: COLORS.fiveStar },
    { value: param.fourStar, color: COLORS.fourStar },
    { value: param.threeAndBelow, color: COLORS.threeAndBelow },
  ];

  return (
    <Box>
      <Typography variant="caption" sx={{ fontWeight: 500, mb: 0.5, display: "block" }}>
        {param.label}
      </Typography>
      <Stack direction="row" sx={{ height: 22, borderRadius: "6px", overflow: "hidden" }}>
        {segments.map((seg, i) =>
          seg.value > 0 ? (
            <Box
              key={i}
              sx={{
                flex: seg.value,
                backgroundColor: seg.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: seg.value > 0 ? 24 : 0,
              }}
            >
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 600, color: "#fff", lineHeight: 1 }}>
                {seg.value}
              </Typography>
            </Box>
          ) : null
        )}
      </Stack>
    </Box>
  );
}

/* ── Legend Dot ── */
function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Box sx={{ width: 10, height: 10, borderRadius: "3px", backgroundColor: color, flexShrink: 0 }} />
      <Typography variant="caption" sx={{ color: "text.secondary" }}>{label}</Typography>
    </Stack>
  );
}

export function LearnerRatingsDialog() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.openLearnerRatings);
  const sessionId = useAppSelector((s) => s.ui.learnerRatingsSessionId);
  const sessions = useAppSelector((s) => s.sessions.items);

  const session = sessionId ? sessions.find((s) => s.id === sessionId) : null;
  const ratings = sessionId ? demoLearnerRatingsBySessionId[sessionId] ?? [] : [];
  const summary = sessionId ? demoFeedbackSummaryBySessionId[sessionId] : null;
  const avgRating = ratings.length
    ? (ratings.reduce((a, r) => a + r.rating, 0) / ratings.length).toFixed(2)
    : "—";

  // Aggregate donut values from parameter ratings
  const totalFive = summary?.parameterRatings.reduce((a, p) => a + p.fiveStar, 0) ?? 0;
  const totalFour = summary?.parameterRatings.reduce((a, p) => a + p.fourStar, 0) ?? 0;
  const totalThree = summary?.parameterRatings.reduce((a, p) => a + p.threeAndBelow, 0) ?? 0;

  const [feedbackFilter, setFeedbackFilter] = useState<FeedbackFilter>("all");

  const filteredRatings = ratings.filter((r) => {
    if (feedbackFilter === "4plus") return r.rating >= 4;
    if (feedbackFilter === "3to4") return r.rating >= 3 && r.rating < 4;
    if (feedbackFilter === "below3") return r.rating < 3;
    return true;
  });

  const handleClose = () => {
    dispatch(setOpenLearnerRatings(false));
    dispatch(setLearnerRatingsSessionId(null));
    setFeedbackFilter("all");
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 0.5 }}>Online event feedback</DialogTitle>
      <DialogContent
        sx={{
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "transparent",
            borderRadius: 2,
            transition: "background-color 0.2s",
          },
          "&:hover::-webkit-scrollbar-thumb": {
            backgroundColor: "action.disabled",
          },
          "&:hover::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "action.active",
          },
          scrollbarWidth: "thin",
          scrollbarColor: "transparent transparent",
          "&:hover": {
            scrollbarColor: "var(--mui-palette-action-disabled) transparent",
          },
        }}
      >
        {session ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 0.5 }}>
            {/* ── Session title ── */}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>
              {session.program}
              <br />
              <Typography component="span" variant="body2" sx={{ fontWeight: 500, color: "text.secondary" }}>
                {session.title}
              </Typography>
            </Typography>

            {/* ── Summary strip ── */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                backgroundColor: "hsl(var(--md-surface-container) / 0.4)",
                borderRadius: "12px",
                px: 2,
                py: 1.25,
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
                  {summary?.totalResponses ?? ratings.length}/{summary?.totalEnrolled ?? "—"}
                </Typography>
                <Typography variant="caption" color="text.secondary">No. of feedback</Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Stack direction="row" spacing={0.25} justifyContent="flex-end" sx={{ mb: 0.25 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <StarOutlinedIcon
                      key={i}
                      sx={{
                        fontSize: 14,
                        color: i <= Math.round(Number(avgRating)) ? "var(--gl-star-color)" : "hsl(var(--md-outline-variant))",
                      }}
                    />
                  ))}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Session Rating: <b>{avgRating}/5</b>
                </Typography>
              </Box>
            </Stack>

            {/* ── Charts row ── */}
            {summary && (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="flex-start">
                {/* Donut */}
                <Box sx={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 1 }}>Rating distribution</Typography>
                  <DonutChart fiveStar={totalFive} fourStar={totalFour} threeAndBelow={totalThree} />
                </Box>

                {/* Parameter bars */}
                <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1.5, width: "100%" }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Parameter wise rating</Typography>
                  {/* Legend */}
                  <Stack direction="row" spacing={2}>
                    <LegendItem color={COLORS.fiveStar} label="5 star" />
                    <LegendItem color={COLORS.fourStar} label="4 star" />
                    <LegendItem color={COLORS.threeAndBelow} label="3 & below" />
                  </Stack>
                  {summary.parameterRatings.map((p, i) => (
                    <ParameterBar key={i} param={p} />
                  ))}
                </Box>
              </Stack>
            )}

            {/* ── Legend ── */}
            <Stack direction="row" spacing={2} justifyContent="center">
              <LegendItem color={COLORS.fiveStar} label="5 Star" />
              <LegendItem color={COLORS.fourStar} label="4 Star" />
              <LegendItem color={COLORS.threeAndBelow} label="3 & below" />
            </Stack>

            <Divider />

            {/* ── Student comments ── */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, textAlign: "center" }}>
                Student&apos;s comments
              </Typography>

              {/* Segmented filter */}
              <ToggleButtonGroup
                value={feedbackFilter}
                exclusive
                onChange={(_, val) => { if (val) setFeedbackFilter(val); }}
                size="small"
                fullWidth
                sx={{ mb: 2 }}
              >
                <ToggleButton value="all" sx={{ textTransform: "none", fontSize: "0.75rem" }}>
                  All ({ratings.length})
                </ToggleButton>
                <ToggleButton value="4plus" sx={{ textTransform: "none", fontSize: "0.75rem", color: green[700] }}>
                  4+ stars ({ratings.filter((r) => r.rating >= 4).length})
                </ToggleButton>
                <ToggleButton value="3to4" sx={{ textTransform: "none", fontSize: "0.75rem", color: amber[800] }}>
                  3–4 stars ({ratings.filter((r) => r.rating >= 3 && r.rating < 4).length})
                </ToggleButton>
                <ToggleButton value="below3" sx={{ textTransform: "none", fontSize: "0.75rem", color: red[600] }}>
                  &lt;3 stars ({ratings.filter((r) => r.rating < 3).length})
                </ToggleButton>
              </ToggleButtonGroup>

              <Stack spacing={0} divider={<Divider />}>
                {filteredRatings.map((r, i) => (
                  <Box key={i} sx={{ py: 1.25 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {r.feedback || "No comment provided."}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <StarOutlinedIcon
                        sx={{
                          fontSize: 12,
                          color: r.rating >= 4 ? green[500] : r.rating >= 3 ? amber[600] : red[500],
                        }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: r.rating >= 4 ? green[700] : r.rating >= 3 ? amber[800] : red[700] }}>
                        {r.rating}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
                {filteredRatings.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                    No feedback in this range.
                  </Typography>
                )}
              </Stack>
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">No event selected.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="inherit" onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
