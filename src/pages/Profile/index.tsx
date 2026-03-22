import { useMemo, useRef, useState } from "react";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import IosShareOutlinedIcon from "@mui/icons-material/IosShareOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookIcon from "@mui/icons-material/Facebook";
import XIcon from "@mui/icons-material/X";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import { keyframes } from "@mui/system";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import MuiTooltip from "@mui/material/Tooltip";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import MentorImpactCard from "@/components/shared/MentorImpactCard";
import FlexBox from "@/components/Utils/FlexBox";
import { ScoreCell } from "@/components/shared/ScoreCell";
import { useAppSelector, useAppDispatch } from "@/store";
import { setOpenProfileEdit, setOpenTimezone } from "@/store/slices/uiSlice";
import {
  setDraftName, setDraftMode, setDraftPrograms,
  saveProfileEdits, populateDrafts,
} from "@/store/slices/profileSlice";
import { formatGMTOffsetFromMinutesAhead, getTimeZoneOffsetMinutes } from "@/lib/helpers";
import { demoRatingHistory } from "@/data/demo-sessions";

const borderRotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// ── Demo data for course performance ──────────────────────────────────────────
const demoCoursePerf = [
  { name: "Deep Learning Fundamentals", rating: 4.8, delta: +0.15 },
  { name: "NLP Advanced Topics",        rating: 4.7, delta: +0.08 },
  { name: "Reinforcement Learning",     rating: 4.7, delta: -0.03 },
  { name: "MLOps",                      rating: 4.6, delta: +0.21 },
  { name: "Data Engineering Essentials",rating: 4.5, delta: -0.12 },
  { name: "Product Management",         rating: 4.4, delta: +0.05 },
  { name: "Computer Vision",            rating: 4.3, delta:  0.00 },
  { name: "Statistics for ML",          rating: 4.2, delta: -0.08 },
];

// ── Demo data for monthly matrix ──────────────────────────────────────────────
const MONTHS = ["Sep 25", "Oct 25", "Nov 25", "Dec 25", "Jan 26", "Feb 26"];
const demoMatrix = [
  { course: "Deep Learning Fundamentals", scores: [4.7, 4.8, 4.6, 4.9, 4.8, 4.8] },
  { course: "NLP Advanced Topics",        scores: [4.5, 4.6, 4.7, 4.7, 4.8, 4.7] },
  { course: "Reinforcement Learning",     scores: [4.6, 4.7, 4.6, 4.7, 4.7, 4.6] },
  { course: "Data Engineering Essentials",scores: [4.6, 4.5, 4.4, 4.5, 4.5, 4.5] },
  { course: "Product Management",         scores: [4.3, 4.3, null, 4.4, 4.3, 4.4] },
  { course: "Computer Vision",            scores: [null, null, 4.2, 4.3, 4.3, 4.3] },
  { course: "Statistics for ML",          scores: [4.3, 4.3, 4.2, 4.2, 4.2, 4.2] },
];

function DeltaLabel({ value }: { value: number }) {
  if (value === 0) return <Typography sx={{ fontSize: 11, color: "text.secondary" }}>0.00</Typography>;
  const color = value > 0 ? "success.main" : "error.main";
  return (
    <Typography sx={{ fontSize: 11, color, fontWeight: 500 }}>
      {value > 0 ? "↗" : "↘"} {value > 0 ? "+" : ""}{value.toFixed(2)}
    </Typography>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const guruName      = useAppSelector((s) => s.profile.guruName);
  const primaryMode   = useAppSelector((s) => s.profile.primaryMode);
  const guruPrograms  = useAppSelector((s) => s.profile.guruPrograms);
  const timeZoneMode  = useAppSelector((s) => s.profile.timeZoneMode);
  const manualTimeZone= useAppSelector((s) => s.profile.manualTimeZone);
  const openProfileEdit = useAppSelector((s) => s.ui.openProfileEdit);
  const draftName     = useAppSelector((s) => s.profile.draftName);
  const draftMode     = useAppSelector((s) => s.profile.draftMode);
  const draftPrograms = useAppSelector((s) => s.profile.draftPrograms);

  const [ratingView, setRatingView] = useState<"course" | "program">("course");
  const [reportModal, setReportModal] = useState<string | null>(null);
  const [showCourseReport, setShowCourseReport] = useState(false);
  const testimonialRef = useRef<HTMLDivElement>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const tzLabel = useMemo(() => {
    const tz = timeZoneMode === "auto"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : manualTimeZone;
    const offset = getTimeZoneOffsetMinutes(tz);
    return `${tz} (${formatGMTOffsetFromMinutesAhead(offset)})`;
  }, [timeZoneMode, manualTimeZone]);

  // Build monthly rating chart data grouped by month label
  const ratingChartData = useMemo(() => {
    const byMonth: Record<string, number[]> = {};
    demoRatingHistory.forEach((r) => {
      const d = new Date(r.dateYmd);
      const lbl = `${d.toLocaleString("en-US", { month: "short" })} ${String(d.getFullYear()).slice(2)}`;
      (byMonth[lbl] ??= []).push(r.score);
    });
    return MONTHS.map((m) => ({
      month: m,
      avg: byMonth[m]
        ? +(byMonth[m].reduce((a, b) => a + b, 0) / byMonth[m].length).toFixed(2)
        : null,
    }));
  }, []);

  const avgRating = useMemo(() => {
    if (!demoRatingHistory.length) return "—";
    return (demoRatingHistory.reduce((a, r) => a + r.score, 0) / demoRatingHistory.length).toFixed(2);
  }, []);

  // KPI stat cards config for Performance
  const statCards = [
    {
      label: "AVG RATING",
      value: avgRating,
      description: "Consistent high ratings across all programs and cohorts.",
      delta: "+0.12",
      deltaLabel: "vs last month",
      deltaPositive: true,
      bars: [52, 98, 88, 37, 61],
      barLabels: ["Oct", "Nov", "Dec", "Jan", "Feb"],
      bg: "rgba(25, 106, 229, 0.06)",
      accent: "#196ae5",
      reportTitle: "Average Rating Report",
      reportSummary: "Your average rating across all programs over the last 6 months.",
      chartData: [
        { month: "Sep 25", value: 4.52 }, { month: "Oct 25", value: 4.58 }, { month: "Nov 25", value: 4.71 },
        { month: "Dec 25", value: 4.65 }, { month: "Jan 26", value: 4.68 }, { month: "Feb 26", value: 4.74 },
      ],
      chartKey: "value",
      breakdown: [
        { name: "Deep Learning Fundamentals", value: "4.8" },
        { name: "NLP Advanced Topics", value: "4.7" },
        { name: "Reinforcement Learning", value: "4.7" },
        { name: "MLOps", value: "4.6" },
        { name: "Data Engineering Essentials", value: "4.5" },
      ],
    },
    {
      label: "RATED EVENTS",
      value: String(demoRatingHistory.length),
      description: "Total events with learner feedback across all programs.",
      delta: null,
      deltaLabel: null,
      deltaPositive: false,
      bars: [40, 65, 80, 55, 72],
      barLabels: ["Oct", "Nov", "Dec", "Jan", "Feb"],
      bg: "rgba(245, 158, 11, 0.06)",
      accent: "#f59e0b",
      reportTitle: "Rated Events Report",
      reportSummary: "Monthly breakdown of events that received learner ratings.",
      chartData: [
        { month: "Sep 25", value: 8 }, { month: "Oct 25", value: 12 }, { month: "Nov 25", value: 15 },
        { month: "Dec 25", value: 10 }, { month: "Jan 26", value: 14 }, { month: "Feb 26", value: 18 },
      ],
      chartKey: "value",
      breakdown: [
        { name: "PGP-DS", value: "32 events" },
        { name: "PGP-AIML", value: "18 events" },
        { name: "PGP-SE", value: "12 events" },
        { name: "Core Programs", value: "8 events" },
        { name: "Workshops", value: "7 events" },
      ],
    },
    {
      label: "COVERAGE",
      value: "92%",
      description: "Percentage of scheduled sessions with ratings submitted.",
      delta: "+3%",
      deltaLabel: "vs last quarter",
      deltaPositive: true,
      bars: [70, 75, 85, 90, 92],
      barLabels: ["Oct", "Nov", "Dec", "Jan", "Feb"],
      bg: "rgba(34, 187, 52, 0.06)",
      accent: "#22bb34",
      reportTitle: "Coverage Report",
      reportSummary: "Percentage of scheduled sessions that received feedback each month.",
      chartData: [
        { month: "Sep 25", value: 68 }, { month: "Oct 25", value: 72 }, { month: "Nov 25", value: 78 },
        { month: "Dec 25", value: 85 }, { month: "Jan 26", value: 90 }, { month: "Feb 26", value: 92 },
      ],
      chartKey: "value",
      breakdown: [
        { name: "PGP-DS", value: "96%" },
        { name: "PGP-AIML", value: "93%" },
        { name: "PGP-SE", value: "90%" },
        { name: "Core Programs", value: "88%" },
        { name: "Workshops", value: "85%" },
      ],
    },
    {
      label: "NPS PROXY",
      value: "74",
      description: "Learner satisfaction score derived from 4 & 5 star ratings.",
      delta: null,
      deltaLabel: null,
      deltaPositive: false,
      bars: [60, 68, 72, 70, 74],
      barLabels: ["Oct", "Nov", "Dec", "Jan", "Feb"],
      bg: "rgba(156, 39, 176, 0.06)",
      accent: "#9c27b0",
      reportTitle: "NPS Proxy Report",
      reportSummary: "Net Promoter Score proxy based on 4 & 5 star rating percentage minus 1-3 star percentage.",
      chartData: [
        { month: "Sep 25", value: 58 }, { month: "Oct 25", value: 62 }, { month: "Nov 25", value: 68 },
        { month: "Dec 25", value: 72 }, { month: "Jan 26", value: 70 }, { month: "Feb 26", value: 74 },
      ],
      chartKey: "value",
      breakdown: [
        { name: "5-star ratings", value: "62%" },
        { name: "4-star ratings", value: "32%" },
        { name: "3-star ratings", value: "4%" },
        { name: "2-star ratings", value: "1.5%" },
        { name: "1-star ratings", value: "0.5%" },
      ],
    },
  ];

  return (
    <>
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <FlexBox sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Profile</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Your identity, performance trends, and financial overview.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexShrink: 0, mt: 0.5 }}>
          <Button
            variant="soft"
            size="small"
            startIcon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
            sx={{ borderRadius: 1 }}
            onClick={() => { dispatch(populateDrafts()); dispatch(setOpenProfileEdit(true)); }}
          >
            Edit profile
          </Button>
          <Box
            sx={{
              position: "relative",
              borderRadius: "8px",
              padding: "2px",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: "-50%",
                left: "-50%",
                width: "200%",
                height: "200%",
                background: "conic-gradient(from 0deg, transparent 0deg, rgba(25,106,229,0.8) 60deg, transparent 120deg)",
                animation: `${borderRotate} 2.5s linear infinite`,
              },
            }}
          >
            <Button
              variant="contained"
              size="small"
              startIcon={<IosShareOutlinedIcon sx={{ fontSize: 14 }} />}
              onClick={() => setShowShareModal(true)}
              sx={{
                borderRadius: "6px",
                position: "relative",
                zIndex: 1,
                width: "100%",
              }}
            >
              Share
            </Button>
          </Box>
        </Stack>
      </FlexBox>

      {/* ── Identity card ────────────────────────────────────────────────── */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent sx={{ px: 3, py: 2.5 }}>
          <FlexBox sx={{ flexWrap: "wrap", gap: 4 }}>
            <Box sx={{ minWidth: 160 }}>
              <Typography variant="caption" color="text.secondary">Name</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ mt: 0.25 }}>{guruName}</Typography>
            </Box>
            <Box sx={{ minWidth: 200 }}>
              <Typography variant="caption" color="text.secondary">Timezone</Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ mt: 0.25, color: "primary.main", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                onClick={() => dispatch(setOpenTimezone(true))}
              >
                {tzLabel}
              </Typography>
            </Box>
            <Box sx={{ minWidth: 140 }}>
              <Typography variant="caption" color="text.secondary">Primary mode</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ mt: 0.25 }}>{primaryMode}</Typography>
            </Box>
            <Box sx={{ minWidth: 160 }}>
              <Typography variant="caption" color="text.secondary">Programs</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ mt: 0.25 }}>{guruPrograms}</Typography>
            </Box>
          </FlexBox>
        </CardContent>
      </Card>

      {/* ══ PERFORMANCE SECTION ════════════════════════════════════════════ */}
      <FlexBox sx={{ justifyContent: "space-between", alignItems: "baseline", mb: 1.5 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Performance</Typography>
          <Typography variant="body2" color="text.secondary">
            Understand trends quickly and drill into course-level patterns.
          </Typography>
        </Box>
      </FlexBox>

      {/* KPI stat cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
        {statCards.map((card) => {
          const maxBar = Math.max(...card.bars);
          return (
            <Card
              key={card.label}
              elevation={0}
              sx={{
                borderRadius: 3,
                bgcolor: card.bg,
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ p: 2.5, flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Label */}
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{ letterSpacing: "0.08em", color: card.accent, fontSize: "0.65rem", mb: 1.5 }}
                >
                  {card.label}
                </Typography>

                {/* Hero number */}
                <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1, letterSpacing: "-0.02em", mb: 1 }}>
                  {card.value}
                </Typography>

                {/* Description */}
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4, mb: 1 }}>
                  {card.description}
                </Typography>

                {/* Delta */}
                {card.delta && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: card.deltaPositive ? "success.main" : "error.main", fontWeight: 600 }}>
                      {card.deltaPositive ? "↗" : "↘"} {card.delta}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ ml: 0.5, fontSize: "0.65rem" }}>
                      {card.deltaLabel}
                    </Typography>
                  </Box>
                )}

                {/* Mini line chart (SVG sparkline with tooltips) */}
                {(() => {
                  const h = 48;
                  const w = 140;
                  const minVal = Math.min(...card.bars);
                  const range = maxBar - minVal || 1;
                  const coords = card.bars.map((v, i) => ({
                    x: (i / (card.bars.length - 1)) * w,
                    y: h - ((v - minVal) / range) * (h - 4) - 2,
                    val: v,
                    label: card.barLabels[i],
                  }));
                  const polyPoints = coords.map((c) => `${c.x},${c.y}`).join(" ");
                  const areaPoints = `0,${h} ${polyPoints} ${w},${h}`;
                  return (
                    <Box sx={{ mt: "auto", mb: 0.5, position: "relative" }}>
                      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
                        <polygon points={areaPoints} fill={card.accent} opacity={0.1} />
                        <polyline points={polyPoints} fill="none" stroke={card.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
                      </svg>
                      {/* Tooltip hover targets */}
                      {coords.map((c, i) => (
                        <MuiTooltip
                          key={i}
                          title={`${c.label}: ${c.val}`}
                          placement="top"
                          arrow
                          slotProps={{ tooltip: { sx: { fontSize: "0.7rem", py: 0.25, px: 1 } } }}
                        >
                          <Box
                            sx={{
                              position: "absolute",
                              left: `${(c.x / w) * 100}%`,
                              top: `${(c.y / h) * 100}%`,
                              transform: "translate(-50%, -50%)",
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              cursor: "pointer",
                              "&:hover .spark-dot": { opacity: 1 },
                            }}
                          >
                            <Box
                              className="spark-dot"
                              sx={{
                                width: 6, height: 6, borderRadius: "50%",
                                bgcolor: card.accent,
                                position: "absolute", top: "50%", left: "50%",
                                transform: "translate(-50%, -50%)",
                                opacity: i === card.bars.length - 1 ? 1 : 0.4,
                                transition: "opacity 0.15s ease",
                              }}
                            />
                          </Box>
                        </MuiTooltip>
                      ))}
                    </Box>
                  );
                })()}
                {/* Line labels */}
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  {card.barLabels.map((lbl, i) => (
                    <Typography key={i} variant="caption" color="text.disabled" sx={{ fontSize: "0.55rem" }}>
                      {lbl}
                    </Typography>
                  ))}
                </Box>

              </CardContent>

              {/* CTA footer */}
              <Divider />
              <Box
                sx={{ px: 2.5, py: 1.5, cursor: "pointer", "&:hover": { bgcolor: "action.hover" }, transition: "background-color 0.15s" }}
                onClick={() => setReportModal(card.label)}
              >
                <FlexBox sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="caption" fontWeight={600} sx={{ fontSize: "0.75rem" }}>
                    See detailed report
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: "text.secondary" }}>→</Typography>
                </FlexBox>
              </Box>
            </Card>
          );
        })}
      </Box>

      {/* ── Testimonials horizontal scroll ────────────────────────────── */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={600}>What learners say</Typography>
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              onClick={() => testimonialRef.current?.scrollBy({ left: -320, behavior: "smooth" })}
              sx={{ width: 30, height: 30, bgcolor: "action.hover", "&:hover": { bgcolor: "action.selected" } }}
            >
              <ChevronLeftIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => testimonialRef.current?.scrollBy({ left: 320, behavior: "smooth" })}
              sx={{ width: 30, height: 30, bgcolor: "action.hover", "&:hover": { bgcolor: "action.selected" } }}
            >
              <ChevronRightIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </Stack>
        <Box
          ref={testimonialRef}
          sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {[
            { quote: "One of the most structured and engaging sessions I've attended. The real-world examples made complex concepts feel intuitive and easy to follow.", name: "Priya S.", info: "PGP-DS · Cohort 26A", avatar: "P" },
            { quote: "Truly inspiring mentor — always goes above and beyond to ensure every learner understands the material. The Q&A sessions are incredibly helpful.", name: "Aarav M.", info: "PGP-AIML · Cohort 25B", avatar: "A" },
            { quote: "The session on neural networks was phenomenal. Clear explanations, great pacing, and very approachable for questions even after class.", name: "Neha K.", info: "PGP-DS · Cohort 25A", avatar: "N" },
            { quote: "Hands-down the best mentor I've had in this program. Every session has practical takeaways I can immediately apply at work.", name: "Rohan D.", info: "PGP-SE · Cohort 26A", avatar: "R" },
            { quote: "Amazing depth of knowledge and an incredible ability to simplify difficult topics. Made the statistics module genuinely enjoyable.", name: "Sneha T.", info: "PGP-DS · Cohort 25B", avatar: "S" },
            { quote: "Very patient with questions and always brings interesting industry examples. The best part is the follow-up resources shared after each session.", name: "Vikram P.", info: "PGP-AIML · Cohort 26A", avatar: "V" },
          ].map((t) => (
            <Card
              key={t.name}
              variant="outlined"
              sx={{
                minWidth: 280,
                maxWidth: 320,
                flexShrink: 0,
                scrollSnapAlign: "start",
                borderRadius: 3,
                borderColor: "divider",
              }}
            >
              <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", height: "100%", "&:last-child": { pb: 2.5 } }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", lineHeight: 1.6, flex: 1, mb: 2 }}>
                  &ldquo;{t.quote}&rdquo;
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1.25}>
                  <Box sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: "action.selected", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Typography variant="caption" fontWeight={600}>{t.avatar}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" fontWeight={600} sx={{ display: "block", lineHeight: 1.2 }}>
                      {t.name}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.65rem" }}>
                      {t.info}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Rating trend chart */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Rating trend (last 6 months)</Typography>

          <Box sx={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={ratingChartData} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--md-outline-variant))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--md-on-surface))" }} axisLine={false} tickLine={false} />
                <YAxis domain={[4.2, 5]} tick={{ fontSize: 11, fill: "hsl(var(--md-on-surface))" }} tickCount={5} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <Card variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                        <Typography variant="caption" fontWeight={600}>{d.month}</Typography>
                        <Typography variant="caption" display="block">Avg: {d.avg ?? "—"}</Typography>
                      </Card>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke="var(--gl-stat-hours)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "hsl(var(--md-surface))", stroke: "var(--gl-stat-hours)", strokeWidth: 2 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          <FlexBox sx={{ justifyContent: "space-between", alignItems: "center", mt: 1.5 }}>
            <FlexBox sx={{ gap: 1, alignItems: "center" }}>
              <Chip label={`Avg ${avgRating}`} size="small" sx={{ fontWeight: 600, bgcolor: "action.selected" }} />
              <Typography variant="caption" color="text.secondary">
                Biggest gain: <strong style={{ color: "var(--gl-stat-sessions)" }}>+0.17</strong> from Nov 25 to Dec 25
              </Typography>
            </FlexBox>
            <Button
              size="small"
              variant="text"
              sx={{ fontSize: 12, textTransform: "none", p: 0, color: "text.secondary" }}
            >
              View rating history
            </Button>
          </FlexBox>
        </CardContent>
      </Card>

      {/* Course performance — horizontal bars */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <FlexBox sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>Course performance</Typography>
            <Button size="small" variant="text" sx={{ fontSize: 12, textTransform: "none", p: 0, color: "text.secondary" }} onClick={() => setShowCourseReport(true)}>
              View full
            </Button>
          </FlexBox>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {demoCoursePerf.map((c) => (
              <FlexBox key={c.name} sx={{ alignItems: "center", gap: 1.5 }}>
                <Typography variant="caption" sx={{ minWidth: 210, flexShrink: 0, color: "text.secondary" }}>
                  {c.name}
                </Typography>
                <Box sx={{ flex: 1, bgcolor: "action.hover", borderRadius: 1, height: 8, overflow: "hidden" }}>
                  <Box
                    sx={{
                      height: "100%",
                      bgcolor: "text.primary",
                      borderRadius: 1,
                      width: `${((c.rating - 1) / 4) * 100}%`,
                    }}
                  />
                </Box>
                <Typography variant="caption" fontWeight={600} sx={{ minWidth: 28, textAlign: "right" }}>
                  {c.rating.toFixed(1)}
                </Typography>
                <DeltaLabel value={c.delta} />
              </FlexBox>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Monthly matrix — compact heatmap */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Monthly matrix</Typography>
          <TableContainer>
            <Table size="small" sx={{ tableLayout: "auto" }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: 11, borderBottom: "1px solid", borderColor: "divider", pl: 0 }}>
                    Course
                  </TableCell>
                  {MONTHS.map((m) => (
                    <TableCell key={m} sx={{ fontWeight: 600, fontSize: 11, textAlign: "center", borderBottom: "1px solid", borderColor: "divider", px: 1 }}>
                      {m}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {demoMatrix.map((row) => (
                  <TableRow key={row.course} sx={{ "&:last-child td": { border: 0 } }}>
                    <TableCell sx={{ fontSize: 11, color: "text.secondary", pl: 0, whiteSpace: "nowrap" }}>
                      {row.course}
                    </TableCell>
                    {row.scores.map((s, i) => (
                      <ScoreCell key={i} value={s} />
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>


      {/* ── Edit profile dialog ───────────────────────────────────────────── */}
      <Dialog
        open={openProfileEdit}
        onClose={() => dispatch(setOpenProfileEdit(false))}
        PaperProps={{ sx: { minWidth: 360 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Edit your details</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Name"
              size="small"
              fullWidth
              value={draftName}
              onChange={(e) => dispatch(setDraftName(e.target.value))}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Primary mode</InputLabel>
              <Select
                label="Primary mode"
                value={draftMode}
                onChange={(e) => dispatch(setDraftMode(e.target.value as any))}
              >
                <MenuItem value="Online">Online</MenuItem>
                <MenuItem value="Hybrid">Hybrid</MenuItem>
                <MenuItem value="In-person">In-person</MenuItem>
                <MenuItem value="Industry Expert">Industry Expert</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Programs"
              size="small"
              fullWidth
              value={draftPrograms}
              onChange={(e) => dispatch(setDraftPrograms(e.target.value))}
            />
            <Box>
              <Typography variant="caption" color="text.secondary">Timezone</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>{tzLabel}</Typography>
              <Typography variant="caption" color="text.disabled">
                Use the Timezone setting in Preferences to change this.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="soft" sx={{ borderRadius: 1 }} onClick={() => dispatch(setOpenProfileEdit(false))}>
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{ borderRadius: 1 }}
            onClick={() => { dispatch(saveProfileEdits()); dispatch(setOpenProfileEdit(false)); }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Share Impact Modal ────────────────────────────────────────────── */}
      <Dialog
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, maxWidth: 560 } }}
      >
        <Box sx={{ px: 3, pt: 3, pb: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6" fontWeight={700}>Share your impact</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Download your stats card or share directly to social media.
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setShowShareModal(false)}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </Box>

        <DialogContent sx={{ px: 3, pt: 2.5 }}>
          {/* Preview card — 4:3 landscape */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              mb: 3,
              background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 40%, #93c5fd 100%)",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: 0,
                background: `
                  radial-gradient(ellipse 120% 80% at 20% 80%, rgba(255,255,255,0.4) 0%, transparent 60%),
                  radial-gradient(ellipse 100% 60% at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%),
                  radial-gradient(ellipse 80% 100% at 60% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)
                `,
                filter: "blur(40px)",
              },
              color: "#0f172a",
              aspectRatio: "4 / 3",
            }}
          >
            <Box sx={{ p: 2.5, height: "100%", display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>
              {/* Header: Logo + Title + FY */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Box>
                  <Typography sx={{ color: "#1e40af", letterSpacing: "0.1em", fontWeight: 600, fontSize: "0.45rem" }}>
                    MENTOR IMPACT REPORT
                  </Typography>
                  <Typography sx={{ color: "#0f172a", fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.1 }}>
                    {guruName}
                  </Typography>
                </Box>
                <Stack alignItems="flex-end" spacing={0.5}>
                  <Box component="img" src="/gl-logo-navy.svg" alt="Great Learning" sx={{ height: 18 }} />
                  <Typography sx={{ color: "#1e3a5f", fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.05em" }}>2025–26</Typography>
                </Stack>
              </Stack>

              {/* Main content: 2 columns */}
              <Stack direction="row" spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
                {/* Left column: Stats */}
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                  {/* 6-stat grid: 4 main + 2 secondary */}
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gridTemplateRows: "repeat(3, 1fr)", gap: 0.75, flex: 1 }}>
                    {[
                      { label: "Learners", value: "1,240", delta: "+213", accent: "#3b82f6" },
                      { label: "Hours", value: "186h", delta: "+32h", accent: "#22c55e" },
                      { label: "Avg rating", value: avgRating, delta: "+0.12", accent: "#f59e0b" },
                      { label: "NPS proxy", value: "74", delta: null, accent: "#a855f7" },
                      { label: "Coverage", value: "92%", delta: "+3%", accent: "#22c55e" },
                      { label: "Rated events", value: String(demoRatingHistory.length), delta: null, accent: "#3b82f6" },
                    ].map((s) => (
                      <Box key={s.label} sx={{ bgcolor: "rgba(255,255,255,0.5)", borderRadius: 1.5, backdropFilter: "blur(8px)", px: 1.25, py: 0.75, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <Stack direction="row" alignItems="center" spacing={0.4} sx={{ mb: 0.15 }}>
                          <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: s.accent }} />
                          <Typography sx={{ color: "#475569", fontSize: "0.5rem" }}>{s.label}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="baseline" spacing={0.5}>
                          <Typography sx={{ color: "#0f172a", fontWeight: 700, fontSize: "1rem", lineHeight: 1 }}>{s.value}</Typography>
                          {s.delta && <Typography sx={{ color: "#22c55e", fontWeight: 600, fontSize: "0.5rem" }}>{s.delta}</Typography>}
                        </Stack>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Right column: Courses + Sparkline */}
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                  {/* Top courses */}
                  <Box sx={{ bgcolor: "rgba(255,255,255,0.5)", borderRadius: 1.5, backdropFilter: "blur(8px)", px: 1.25, py: 0.75, flex: 1 }}>
                    <Typography sx={{ color: "rgba(148,163,184,0.7)", fontSize: "0.45rem", letterSpacing: "0.08em", mb: 0.5 }}>
                      TOP COURSES
                    </Typography>
                    {demoCoursePerf.slice(0, 4).map((c) => (
                      <Stack key={c.name} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.15 }}>
                        <Typography sx={{ color: "#334155", fontSize: "0.55rem" }}>{c.name}</Typography>
                        <Stack direction="row" alignItems="center" spacing={0.3}>
                          <Typography sx={{ color: "#0f172a", fontWeight: 700, fontSize: "0.55rem" }}>{c.rating.toFixed(1)}</Typography>
                          <Typography sx={{ color: c.delta >= 0 ? "#22c55e" : "#ef4444", fontSize: "0.45rem" }}>
                            {c.delta > 0 ? "↗" : c.delta < 0 ? "↘" : "—"}
                          </Typography>
                        </Stack>
                      </Stack>
                    ))}
                  </Box>

                  {/* Rating sparkline */}
                  <Box sx={{ bgcolor: "rgba(255,255,255,0.5)", borderRadius: 1.5, backdropFilter: "blur(8px)", px: 1.25, py: 0.75 }}>
                    <Typography sx={{ color: "rgba(148,163,184,0.7)", fontSize: "0.45rem", letterSpacing: "0.08em", mb: 0.25 }}>
                      RATING TREND
                    </Typography>
                    {(() => {
                      const vals = ratingChartData.filter((d) => d.avg !== null).map((d) => d.avg as number);
                      if (vals.length < 2) return null;
                      const minV = Math.min(...vals);
                      const maxV = Math.max(...vals);
                      const range = maxV - minV || 0.1;
                      const h = 28;
                      const w = 200;
                      const pts = vals.map((v, i) => {
                        const x = (i / (vals.length - 1)) * w;
                        const y = h - ((v - minV) / range) * (h - 4) - 2;
                        return `${x},${y}`;
                      });
                      const areaPoints = `0,${h} ${pts.join(" ")} ${w},${h}`;
                      return (
                        <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
                          <polygon points={areaPoints} fill="#3b82f6" opacity={0.08} />
                          <polyline points={pts.join(" ")} fill="none" stroke="#3b82f6" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                          {vals.map((v, i) => {
                            const x = (i / (vals.length - 1)) * w;
                            const y = h - ((v - minV) / range) * (h - 4) - 2;
                            return <circle key={i} cx={x} cy={y} r={1.5} fill="#3b82f6" />;
                          })}
                        </svg>
                      );
                    })()}
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.15 }}>
                      {ratingChartData.filter((d) => d.avg !== null).map((d) => (
                        <Typography key={d.month} sx={{ color: "#64748b", fontSize: "0.4rem" }}>
                          {d.month.split(" ")[0]}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              </Stack>

              {/* Footer */}
              <Divider sx={{ borderColor: "rgba(0,0,0,0.08)", mt: 1, mb: 0.5 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ color: "#334155", fontSize: "0.55rem", fontWeight: 500 }}>
                  {demoCoursePerf.length} courses · {primaryMode}
                </Typography>
                <Typography sx={{ color: "#475569", fontSize: "0.55rem", fontWeight: 500 }}>
                  mygreatlearning.com
                </Typography>
              </Stack>
            </Box>
          </Card>

          {/* Download */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<DownloadOutlinedIcon />}
            sx={{ borderRadius: 2, mb: 2.5, textTransform: "none", fontWeight: 600 }}
          >
            Download stats card
          </Button>

          {/* Social share buttons */}
          <Stack direction="row" spacing={1}>
            <Button
              variant="soft"
              size="small"
              startIcon={<LinkedInIcon sx={{ fontSize: 16 }} />}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, flex: 1 }}
            >
              LinkedIn
            </Button>
            <Button
              variant="soft"
              size="small"
              startIcon={<XIcon sx={{ fontSize: 14 }} />}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, flex: 1 }}
            >
              X
            </Button>
            <Button
              variant="soft"
              size="small"
              startIcon={<FacebookIcon sx={{ fontSize: 16 }} />}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, flex: 1 }}
            >
              Facebook
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* ── Course Performance Report Modal ────────────────────────────────── */}
      <Dialog
        open={showCourseReport}
        onClose={() => setShowCourseReport(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <Box sx={{ px: 3, pt: 2.5, pb: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h5" fontWeight={700}>Course Performance</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Detailed ratings across all courses with monthly trends and learner feedback volume.
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setShowCourseReport(false)} sx={{ mt: -0.5 }}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>

          {/* Summary stats row */}
          <Stack direction="row" spacing={3} sx={{ mt: 2.5 }} divider={<Divider orientation="vertical" flexItem />}>
            <Box>
              <Typography variant="caption" color="text.secondary">Courses taught</Typography>
              <Typography variant="h6" fontWeight={700}>{demoCoursePerf.length}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Highest rated</Typography>
              <Typography variant="h6" fontWeight={700}>{demoCoursePerf[0].name.split(" ").slice(0, 2).join(" ")}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Biggest gain</Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color: "success.main" }}>
                +{Math.max(...demoCoursePerf.map((c) => c.delta)).toFixed(2)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Needs attention</Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color: "error.main" }}>
                {demoCoursePerf.filter((c) => c.delta < 0).length} courses
              </Typography>
            </Box>
          </Stack>
        </Box>

        <DialogContent sx={{ px: 3, pt: 2.5 }}>
          {/* Per-course detail cards */}
          <Stack spacing={2}>
            {demoCoursePerf.map((course) => {
              const matrixRow = demoMatrix.find((m) => m.course === course.name);
              const chartData = matrixRow
                ? MONTHS.map((m, i) => ({ month: m, rating: matrixRow.scores[i] }))
                : [];
              return (
                <Card key={course.name} variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ md: "center" }}>
                      {/* Left: course info */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={700}>{course.name}</Typography>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                          <Box>
                            <Typography variant="h4" fontWeight={700} sx={{ lineHeight: 1 }}>{course.rating.toFixed(1)}</Typography>
                            <Typography variant="caption" color="text.secondary">Current</Typography>
                          </Box>
                          <Divider orientation="vertical" flexItem />
                          <Box>
                            <Typography variant="body1" fontWeight={600} sx={{ color: course.delta > 0 ? "success.main" : course.delta < 0 ? "error.main" : "text.secondary" }}>
                              {course.delta > 0 ? "↗" : course.delta < 0 ? "↘" : "—"} {course.delta > 0 ? "+" : ""}{course.delta.toFixed(2)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">MoM change</Typography>
                          </Box>
                          <Divider orientation="vertical" flexItem />
                          <Box>
                            {/* Rating bar */}
                            <Box sx={{ width: 120, bgcolor: "action.hover", borderRadius: 1, height: 8, overflow: "hidden" }}>
                              <Box sx={{ height: "100%", bgcolor: course.delta >= 0 ? "success.main" : "error.main", borderRadius: 1, width: `${((course.rating - 1) / 4) * 100}%`, opacity: 0.7 }} />
                            </Box>
                            <Typography variant="caption" color="text.secondary">out of 5.0</Typography>
                          </Box>
                        </Stack>
                      </Box>

                      {/* Right: sparkline */}
                      {chartData.length > 0 && (
                        <Box sx={{ width: 200, flexShrink: 0 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem", mb: 0.5, display: "block" }}>
                            6-month trend
                          </Typography>
                          <Box sx={{ height: 60 }}>
                            <ResponsiveContainer>
                              <LineChart data={chartData} margin={{ top: 2, right: 4, left: -24, bottom: 0 }}>
                                <XAxis dataKey="month" tick={{ fontSize: 9, fill: "hsl(var(--md-on-surface-variant))" }} axisLine={false} tickLine={false} />
                                <YAxis domain={[4, 5]} tick={false} axisLine={false} tickLine={false} />
                                <Tooltip
                                  content={({ active, payload }) => {
                                    if (!active || !payload?.length) return null;
                                    const d = payload[0].payload;
                                    return (
                                      <Card variant="outlined" sx={{ p: 0.75, borderRadius: 1, fontSize: "0.7rem" }}>
                                        <Typography variant="caption" fontWeight={600}>{d.month}</Typography>
                                        <Typography variant="caption" display="block">{d.rating ?? "—"}</Typography>
                                      </Card>
                                    );
                                  }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="rating"
                                  stroke={course.delta >= 0 ? "#22bb34" : "#f44336"}
                                  strokeWidth={1.5}
                                  dot={{ r: 2.5, fill: "hsl(var(--md-surface))", stroke: course.delta >= 0 ? "#22bb34" : "#f44336", strokeWidth: 1.5 }}
                                  connectNulls
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </Box>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="soft" size="small" onClick={() => setShowCourseReport(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Detailed Report Modal ─────────────────────────────────────────── */}
      {(() => {
        const activeCard = statCards.find((c) => c.label === reportModal);
        if (!activeCard) return null;
        return (
          <Dialog
            open={!!reportModal}
            onClose={() => setReportModal(null)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
          >
            <Box sx={{ px: 3, pt: 2.5, pb: 0 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: "0.08em", color: activeCard.accent, fontSize: "0.65rem" }}>
                    {activeCard.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
                    {activeCard.reportTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {activeCard.reportSummary}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => setReportModal(null)} sx={{ mt: -0.5 }}>
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Stack>

              {/* Hero stat */}
              <Stack direction="row" alignItems="baseline" spacing={1.5} sx={{ mt: 2.5 }}>
                <Typography variant="h3" fontWeight={700} sx={{ letterSpacing: "-0.02em" }}>
                  {activeCard.value}
                </Typography>
                {activeCard.delta && (
                  <Typography variant="body2" sx={{ color: activeCard.deltaPositive ? "success.main" : "error.main", fontWeight: 600 }}>
                    {activeCard.deltaPositive ? "↗" : "↘"} {activeCard.delta} <Typography component="span" variant="caption" color="text.disabled">{activeCard.deltaLabel}</Typography>
                  </Typography>
                )}
              </Stack>
            </Box>

            <DialogContent sx={{ px: 3, pt: 2 }}>
              {/* Expanded chart */}
              <Card variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1.5, display: "block" }}>
                    6-month trend
                  </Typography>
                  <Box sx={{ width: "100%", height: 180 }}>
                    <ResponsiveContainer>
                      <LineChart data={activeCard.chartData} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--md-outline-variant))" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--md-on-surface))" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--md-on-surface))" }} axisLine={false} tickLine={false} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0].payload;
                            return (
                              <Card variant="outlined" sx={{ p: 1, borderRadius: 1, fontSize: "0.75rem" }}>
                                <Typography variant="caption" fontWeight={600}>{d.month}</Typography>
                                <Typography variant="caption" display="block">{d[activeCard.chartKey]}</Typography>
                              </Card>
                            );
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey={activeCard.chartKey}
                          stroke={activeCard.accent}
                          strokeWidth={2}
                          dot={{ r: 4, fill: "hsl(var(--md-surface))", stroke: activeCard.accent, strokeWidth: 2 }}
                          connectNulls
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>

              {/* Breakdown table */}
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: "block" }}>
                Breakdown
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {activeCard.breakdown.map((row, i) => (
                      <TableRow key={i} sx={{ "&:last-child td": { border: 0 } }}>
                        <TableCell sx={{ pl: 0, fontSize: 12, color: "text.secondary" }}>{row.name}</TableCell>
                        <TableCell align="right" sx={{ pr: 0, fontSize: 12, fontWeight: 600 }}>{row.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button variant="soft" size="small" onClick={() => setReportModal(null)}>
                Close
              </Button>
            </DialogActions>
          </Dialog>
        );
      })()}
    </>
  );
}
