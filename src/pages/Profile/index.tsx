import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme, ThemeProvider, alpha } from "@mui/material/styles";
import { lightTheme } from "@/theme/theme";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
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
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import CheckIcon from "@mui/icons-material/Check";
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
  LineChart, Line, Area, AreaChart, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
  BarChart, Bar,
} from "recharts";
import MentorImpactCard from "@/components/shared/MentorImpactCard";
import FlexBox from "@/components/Utils/FlexBox";
import { ScoreCell } from "@/components/shared/ScoreCell";
import { useAppSelector, useAppDispatch } from "@/store";
import { EmptyState } from "@/components/shared/EmptyState";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { setOpenProfileEdit, setOpenTimezone } from "@/store/slices/uiSlice";
import {
  setDraftName, setDraftMode, setDraftPrograms,
  saveProfileEdits, populateDrafts,
} from "@/store/slices/profileSlice";
import { formatGMTOffsetFromMinutesAhead, getTimeZoneOffsetMinutes, getLocaleFromTimezone } from "@/lib/helpers";
import { demoRatingHistory, demoRoleCategoryRatings, demoRoleMonthlyShareData, demoRoleTillDateShareData, demoRoleStatCards, demoRoleCoursePerf, demoRoleMatrix, demoRoleRatingHistory } from "@/data/demo-sessions";
import type { ShareMonthDatum } from "@/data/demo-sessions";
import { getCategoriesForRoles, ROLE_TO_CATEGORY } from "@/lib/role-config";
import type { GuruRoleCategory } from "@/lib/role-config";
import type { GuruRole } from "@/store/slices/devPanelSlice";
import { clearRoleSwitching } from "@/store/slices/devPanelSlice";

const borderRotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// ── Demo data for engagement stats (cumulative, monthly) ─────────────────────
/* Engagement Stats run all-time - from joining month (Feb 2023) through
   the current month (Apr 2026) = 39 months. Values are cumulative, so the
   curve ramps from near-zero early on to the final totals shown in each
   card's "Total: X" chip. Labels include year ("Feb 23") to disambiguate
   repeated month names across multiple years. */
const engagementMonths: string[] = (() => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const out: string[] = [];
  // Feb 2023 -> Apr 2026
  let year = 2023;
  for (let m = 1; m < 12; m++) out.push(`${months[m]} ${String(year).slice(2)}`); // Feb..Dec 23
  for (year = 2024; year <= 2025; year++) {
    for (let m = 0; m < 12; m++) out.push(`${months[m]} ${String(year).slice(2)}`);
  }
  for (let m = 0; m < 4; m++) out.push(`${months[m]} ${String(2026).slice(2)}`); // Jan..Apr 26
  return out;
})();

/* S-curve cumulative generator: slow start, steady middle, gentle plateau.
   Endpoint always matches the final total so the card's "Total" chip stays
   consistent with the chart's last point. */
function buildCumulative(total: number): number[] {
  const months = engagementMonths.length;
  const out: number[] = [];
  for (let i = 0; i < months; i++) {
    const t = i / (months - 1);
    const s = t * t * (3 - 2 * t); // smoothstep
    out.push(Math.round(total * s));
  }
  return out;
}

const demoEngagementCount = buildCumulative(800);
const demoEngagementHours = buildCumulative(2266);
const demoLearnersImpacted = buildCumulative(7332);

/* Mid-user engagement: 6 months (Nov 25 → Apr 26), smaller totals */
const midEngagementMonths = ["Nov 25", "Dec 25", "Jan 26", "Feb 26", "Mar 26", "Apr 26"];
function buildMidCumulative(total: number): number[] {
  const n = midEngagementMonths.length;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const s = t * t * (3 - 2 * t);
    out.push(Math.round(total * s));
  }
  return out;
}
const midEngagementCount = buildMidCumulative(95);
const midEngagementHours = buildMidCumulative(248);
const midLearnersImpacted = buildMidCumulative(820);

// ── Demo data for course performance (default fallback) ──────────────────────
const defaultCoursePerf = [
  { name: "Deep Learning Fundamentals", rating: 4.8, delta: +0.15 },
  { name: "NLP Advanced Topics",        rating: 4.7, delta: +0.08 },
  { name: "Reinforcement Learning",     rating: 4.7, delta: -0.03 },
  { name: "MLOps",                      rating: 4.6, delta: +0.21 },
  { name: "Data Engineering Essentials",rating: 4.5, delta: -0.12 },
  { name: "Product Management",         rating: 4.4, delta: +0.05 },
  { name: "Computer Vision",            rating: 4.3, delta:  0.00 },
  { name: "Statistics for ML",          rating: 4.2, delta: -0.08 },
];

// ── Demo data for monthly matrix (default fallback) ──────────────────────────
const MONTHS = ["Apr 25", "May 25", "Jun 25", "Jul 25", "Aug 25", "Sep 25", "Oct 25", "Nov 25", "Dec 25", "Jan 26", "Feb 26", "Mar 26"];
const defaultMatrix = [
  { course: "Deep Learning Fundamentals", scores: [4.5, 4.6, null, 4.7, 4.7, 4.8, 4.6, 4.9, 4.8, 4.8, 4.9, null] },
  { course: "NLP Advanced Topics",        scores: [null, 4.4, 4.5, null, 4.5, 4.6, 4.7, 4.7, 4.8, 4.7, 4.8, 4.7] },
  { course: "Reinforcement Learning",     scores: [4.5, null, 4.5, 4.6, 4.6, 4.7, 4.6, 4.7, 4.7, 4.6, 4.7, 4.7] },
  { course: "Data Engineering Essentials", scores: [4.4, 4.5, 4.5, null, 4.6, 4.5, 4.4, 4.5, 4.5, 4.5, 4.6, 4.5] },
  { course: "Product Management",         scores: [null, null, 4.2, 4.3, 4.3, 4.3, null, 4.4, 4.3, 4.4, 4.4, null] },
  { course: "Computer Vision",            scores: [null, null, null, null, null, null, 4.2, 4.3, 4.3, 4.3, 4.3, 4.4] },
  { course: "Statistics for ML",          scores: [4.2, 4.2, null, 4.3, 4.3, 4.3, 4.2, 4.2, 4.2, 4.2, 4.3, 4.2] },
  { course: "Python for Data Science",    scores: [4.6, 4.7, 4.7, 4.8, null, 4.8, 4.7, 4.8, 4.9, 4.8, 4.9, 4.9] },
  { course: "SQL & Databases",            scores: [4.3, 4.4, 4.4, 4.5, 4.5, null, 4.5, 4.6, 4.5, 4.6, 4.6, 4.7] },
  { course: "MLOps & Deployment",         scores: [null, null, null, 4.3, 4.4, 4.4, 4.5, 4.5, 4.6, 4.5, 4.6, 4.6] },
  { course: "Time Series Analysis",       scores: [4.1, 4.2, 4.3, null, 4.3, 4.4, 4.4, null, 4.5, 4.5, 4.5, 4.6] },
  { course: "Feature Engineering",        scores: [null, 4.3, 4.4, 4.4, 4.5, 4.5, null, 4.5, 4.6, 4.6, null, 4.7] },
  { course: "Linear Algebra Refresher",   scores: [4.0, 4.1, null, 4.2, 4.2, 4.3, 4.3, 4.3, null, 4.4, 4.4, 4.4] },
  { course: "Probability & Inference",    scores: [4.2, null, 4.3, 4.3, 4.4, 4.4, 4.4, 4.5, 4.5, null, 4.5, 4.6] },
  { course: "Data Visualization",         scores: [null, null, 4.5, 4.5, 4.6, 4.6, 4.7, 4.7, null, 4.7, 4.8, 4.8] },
  { course: "Exploratory Data Analysis",  scores: [4.4, 4.4, 4.5, null, 4.5, 4.6, 4.6, 4.6, 4.7, 4.7, 4.7, null] },
  { course: "Generative AI Foundations",  scores: [null, null, null, null, null, null, null, null, 4.5, 4.6, 4.7, 4.8] },
];

function DeltaLabel({ value }: { value: number }) {
  if (value === 0) return <Typography sx={{ fontSize: 11, color: "text.secondary" }}>0.00</Typography>;
  const color = value > 0 ? "success.main" : "error.main";
  return (
    <Typography sx={{ fontSize: 11, color, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 0.25 }}>
      {value > 0 ? <TrendingUpIcon sx={{ fontSize: 11 }} /> : <TrendingDownIcon sx={{ fontSize: 11 }} />} {value > 0 ? "+" : ""}{value.toFixed(2)}
    </Typography>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

  const guruName      = useAppSelector((s) => s.profile.guruName);
  const guruEmail     = useAppSelector((s) => s.profile.guruEmail);
  const primaryMode   = useAppSelector((s) => s.profile.primaryMode);
  const guruPrograms  = useAppSelector((s) => s.profile.guruPrograms);
  const timeZoneMode  = useAppSelector((s) => s.profile.timeZoneMode);
  const manualTimeZone= useAppSelector((s) => s.profile.manualTimeZone);
  const userLocale = getLocaleFromTimezone(timeZoneMode === "manual" ? manualTimeZone : Intl.DateTimeFormat().resolvedOptions().timeZone);
  const openProfileEdit = useAppSelector((s) => s.ui.openProfileEdit);
  const guruStage = useAppSelector((s) => s.devPanel.guruStage);
  const selectedRole = useAppSelector((s) => s.devPanel.selectedRole);
  const selectedRoles = useAppSelector((s) => s.devPanel.selectedRoles);
  const isRoleSwitching = useAppSelector((s) => s.devPanel.isRoleSwitching);
  const isV1Mode = useAppSelector((s) => s.devPanel.isV1Mode);
  const isEmpty = guruStage === "empty";
  const isNewUser = guruStage === "new" || isEmpty;
  const isEarlyUser = guruStage === "early";
  const isMidUser = guruStage === "mid";
  const isNewOrEarly = isNewUser || isEarlyUser;

  // Role switch animation - show skeleton briefly
  const [roleLoading, setRoleLoading] = useState(false);
  useEffect(() => {
    if (isRoleSwitching) {
      setRoleLoading(true);
      const t = setTimeout(() => { setRoleLoading(false); dispatch(clearRoleSwitching()); }, 500);
      return () => clearTimeout(t);
    }
  }, [isRoleSwitching, dispatch]);

  // Active role categories for multi-role rating display
  const activeCategories = useMemo(() => getCategoriesForRoles(selectedRoles), [selectedRoles]);

  // Display label for a role category - expands the "Evaluation & Moderation"
  // bucket to the specific role(s) the user actually has, to avoid the ambiguous
  // "Eval & Mod" abbreviation.
  const categoryDisplayLabel = (category: GuruRoleCategory): string => {
    if (category !== "Evaluation & Moderation") return category;
    const hasEvaluator = selectedRoles.includes("Evaluator");
    const hasModerator = selectedRoles.includes("Moderator");
    if (hasEvaluator && hasModerator) return "Evaluation & Moderation";
    if (hasEvaluator) return "Evaluation";
    if (hasModerator) return "Moderation";
    return "Evaluation & Moderation";
  };

  // Role-aware course performance & matrix
  const demoCoursePerf = useMemo(() => demoRoleCoursePerf[selectedRole] ?? defaultCoursePerf, [selectedRole]);
  const demoMatrix = useMemo(() => demoRoleMatrix[selectedRole] ?? defaultMatrix, [selectedRole]);

  // Monthly Rating Trends grouped by category - one table per active category,
  // aggregating the course rows from every selected role in that category.
  const matricesByCategory = useMemo(() => {
    return activeCategories.map((cat) => {
      const rolesInCat = selectedRoles.filter((r) => ROLE_TO_CATEGORY[r] === cat);
      const rowsFromRoles = rolesInCat.flatMap((r) => demoRoleMatrix[r] ?? []);
      // Dedupe course name - keep first occurrence so each table row is unique.
      const seen = new Set<string>();
      const rows = rowsFromRoles.filter((row) => {
        if (seen.has(row.course)) return false;
        seen.add(row.course);
        return true;
      });
      return { category: cat, rows: rows.length ? rows : defaultMatrix };
    });
  }, [activeCategories, selectedRoles]);

  // Performance section label adapts for non-teaching roles
  const isEvalOrMod = selectedRole === "Evaluator" || selectedRole === "Moderator";
  const coursePerfLabel = isEvalOrMod ? "Session Performance" : "Course Performance";

  const draftName     = useAppSelector((s) => s.profile.draftName);
  const draftMode     = useAppSelector((s) => s.profile.draftMode);
  const draftPrograms = useAppSelector((s) => s.profile.draftPrograms);

  const [ratingView, setRatingView] = useState<"course" | "program">("course");
  const [reportModal, setReportModal] = useState<string | null>(null);
  const [engagementModal, setEngagementModal] = useState<string | null>(null);

  /* Engagement Stats cards - shared config used by the grid tiles and by
     the detail drawer. Title acts as the lookup key for `engagementModal`. */
  type EngagementChart = {
    title: string;
    description: string;
    total: string;
    color: string;
    data: number[];
  };
  const engagementCharts: EngagementChart[] = isMidUser ? [
    {
      title: "Engagement Count",
      description: "Total number of activities you've delivered across every role since you joined.",
      total: "95",
      color: "#4caf50",
      data: midEngagementCount,
    },
    {
      title: "Engagement Hours",
      description: "Cumulative hours spent delivering sessions across every role.",
      total: "248",
      color: "#3f51b5",
      data: midEngagementHours,
    },
    {
      title: "Learners Impacted",
      description: "Unique learners you've reached through your sessions.",
      total: "820",
      color: "#ff9800",
      data: midLearnersImpacted,
    },
  ] : [
    {
      title: "Engagement Count",
      description: "Total number of activities you've delivered across every role since you joined.",
      total: "800",
      color: "#4caf50",
      data: demoEngagementCount,
    },
    {
      title: "Engagement Hours",
      description: "Cumulative hours spent delivering sessions across every role.",
      total: "2,266",
      color: "#3f51b5",
      data: demoEngagementHours,
    },
    {
      title: "Learners Impacted",
      description: "Unique learners you've reached through your sessions.",
      total: "7,332",
      color: "#ff9800",
      data: demoLearnersImpacted,
    },
  ];
  const [showCourseReport, setShowCourseReport] = useState(false);

  // Operational tab items - splits "Evaluation & Moderation" into separate
  // Evaluation / Moderation tabs when both roles are selected, so each gets
  // its own stats. Teaching and Mentoring stay as single category tabs.
  const tabItems = useMemo(() => {
    const items: { key: string; label: string; dataRole: GuruRole; isEvalMod: boolean }[] = [];
    for (const cat of activeCategories) {
      if (cat === "Evaluation & Moderation") {
        const hasEvaluator = selectedRoles.includes("Evaluator");
        const hasModerator = selectedRoles.includes("Moderator");
        if (hasEvaluator) items.push({ key: "Evaluation", label: "Evaluation", dataRole: "Evaluator", isEvalMod: true });
        if (hasModerator) items.push({ key: "Moderation", label: "Moderation", dataRole: "Moderator", isEvalMod: true });
      } else {
        const firstRole = selectedRoles.find((r) => ROLE_TO_CATEGORY[r] === cat) ?? selectedRole;
        items.push({ key: cat, label: cat, dataRole: firstRole, isEvalMod: false });
      }
    }
    return items;
  }, [activeCategories, selectedRoles, selectedRole]);

  const [shareMonth, setShareMonth] = useState("2026-03");
  const [shareAllTime, setShareAllTime] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [monthSheetOpen, setMonthSheetOpen] = useState(false);
  const [monthMenuAnchor, setMonthMenuAnchor] = useState<null | HTMLElement>(null);
  const [dialogMonthMenuAnchor, setDialogMonthMenuAnchor] = useState<null | HTMLElement>(null);
  const shareContainerRef = useRef<HTMLDivElement>(null);
  const [shareScale, setShareScale] = useState(1);

  // Generate last 6 months for the share card month dropdown
  const shareMonthOptions = useMemo(() => {
    const base = new Date("2026-03-24");
    const months: { value: string; label: string }[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString(userLocale, { month: "long", year: "numeric" });
      months.push({ value: val, label: i === 0 ? `${label} (Current)` : label });
    }
    return months;
  }, []);

  // Measure share card container for scaling
  const SHARE_CARD_WIDTH = 520;
  useEffect(() => {
    const container = shareContainerRef.current;
    if (!container) return;
    const measure = () => {
      const w = container.clientWidth;
      setShareScale(w >= SHARE_CARD_WIDTH ? 1 : w / SHARE_CARD_WIDTH);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Seasonal theme config per month
  const MONTH_THEMES: Record<string, {
    bg: string; circles: [string, string, string];
    chipBg: string; chipColor: string;
    stats: { bg: string; color: string }[];
    headingColor: string; taglineColor: string;
    spotlightColor: string; nameColor: string; subtitleColor: string;
    pattern?: string;
  }> = {
    "2025-09": {
      bg: "#e0f2f1", circles: ["#4db6ac", "#b2dfdb", "#80cbc4"],
      chipBg: "#b2dfdb", chipColor: "#00695c",
      stats: [{ bg: "#b2dfdb", color: "#004d40" }, { bg: "#4db6ac", color: "common.white" }, { bg: "#e0f2f1", color: "#00695c" }, { bg: "#80cbc4", color: "#004d40" }, { bg: "#e0f2f1", color: "#00695c" }],
      headingColor: "#00695c", taglineColor: "#00897b", spotlightColor: "#00897b", nameColor: "#004d40", subtitleColor: "#4db6ac",
      pattern: "repeating-linear-gradient(135deg, transparent, transparent 8px, rgba(0,105,92,0.03) 8px, rgba(0,105,92,0.03) 9px)",
    },
    "2025-10": {
      bg: "#fff3e0", circles: ["#ffd54f", "#ff8a65", "#ffcc80"],
      chipBg: "#ffd54f", chipColor: "#bf360c",
      stats: [{ bg: "#ffd54f", color: "#4e342e" }, { bg: "#ff8a65", color: "common.white" }, { bg: "#ffe0b2", color: "#bf360c" }, { bg: "#ffcc80", color: "#4e342e" }, { bg: "#fff3e0", color: "#bf360c" }],
      headingColor: "#bf360c", taglineColor: "#e65100", spotlightColor: "#e65100", nameColor: "#3e2723", subtitleColor: "#ff8a65",
      pattern: "repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(191,54,12,0.025) 12px, rgba(191,54,12,0.025) 24px, transparent 24px, transparent 36px)",
    },
    "2025-11": {
      bg: "#fce4ec", circles: ["#f48fb1", "#ce93d8", "#f8bbd0"],
      chipBg: "#f48fb1", chipColor: "#880e4f",
      stats: [{ bg: "#f48fb1", color: "common.white" }, { bg: "#ce93d8", color: "common.white" }, { bg: "#fce4ec", color: "#880e4f" }, { bg: "#e1bee7", color: "#4a148c" }, { bg: "#fce4ec", color: "#880e4f" }],
      headingColor: "#880e4f", taglineColor: "#ad1457", spotlightColor: "#ad1457", nameColor: "#4a148c", subtitleColor: "#ce93d8",
      pattern: "radial-gradient(circle 40px at 20% 30%, rgba(136,14,79,0.03) 0%, transparent 60%), radial-gradient(circle 30px at 70% 60%, rgba(74,20,140,0.03) 0%, transparent 60%)",
    },
    "2025-12": {
      bg: "#e8eaf6", circles: ["#81d4fa", "#b0bec5", "#c5cae9"],
      chipBg: "#81d4fa", chipColor: "#0d47a1",
      stats: [{ bg: "#81d4fa", color: "#0d47a1" }, { bg: "#42a5f5", color: "common.white" }, { bg: "#e3f2fd", color: "#0d47a1" }, { bg: "#bbdefb", color: "#0d47a1" }, { bg: "#e3f2fd", color: "#0d47a1" }],
      headingColor: "#1a237e", taglineColor: "#283593", spotlightColor: "#1565c0", nameColor: "#0d47a1", subtitleColor: "#7986cb",
      pattern: "radial-gradient(circle 2px at 15% 20%, rgba(13,71,161,0.06) 0%, transparent 50%), radial-gradient(circle 2px at 45% 70%, rgba(13,71,161,0.06) 0%, transparent 50%), radial-gradient(circle 2px at 75% 35%, rgba(13,71,161,0.06) 0%, transparent 50%), radial-gradient(circle 2px at 90% 80%, rgba(13,71,161,0.06) 0%, transparent 50%)",
    },
    "2026-01": {
      bg: "#eceff1", circles: ["#90a4ae", "#b0bec5", "#cfd8dc"],
      chipBg: "#b0bec5", chipColor: "#263238",
      stats: [{ bg: "#cfd8dc", color: "#263238" }, { bg: "#90a4ae", color: "common.white" }, { bg: "#eceff1", color: "#263238" }, { bg: "#b0bec5", color: "#1a237e" }, { bg: "#eceff1", color: "#263238" }],
      headingColor: "#263238", taglineColor: "#37474f", spotlightColor: "#455a64", nameColor: "#263238", subtitleColor: "#78909c",
      pattern: "radial-gradient(circle 1.5px at 10% 15%, rgba(38,50,56,0.05) 0%, transparent 50%), radial-gradient(circle 1.5px at 35% 55%, rgba(38,50,56,0.05) 0%, transparent 50%), radial-gradient(circle 1.5px at 60% 25%, rgba(38,50,56,0.05) 0%, transparent 50%), radial-gradient(circle 1.5px at 85% 75%, rgba(38,50,56,0.05) 0%, transparent 50%)",
    },
    "2026-02": {
      bg: "#dbeafe", circles: ["#fde68a", "#bfdbfe", "#93c5fd"],
      chipBg: "#fde68a", chipColor: "#1e3a5f",
      stats: [{ bg: "#fde68a", color: "#1e3a5f" }, { bg: "#60a5fa", color: "common.white" }, { bg: "#bfdbfe", color: "#1e3a5f" }, { bg: "#93c5fd", color: "#1e3a5f" }, { bg: "#e0f2fe", color: "#1e3a5f" }],
      headingColor: "#2563eb", taglineColor: "#2563eb", spotlightColor: "#2563eb", nameColor: "#0f172a", subtitleColor: "#64748b",
    },
    "2026-03": {
      bg: "#ecfdf5", circles: ["#6ee7b7", "#a7f3d0", "#d1fae5"],
      chipBg: "#6ee7b7", chipColor: "#064e3b",
      stats: [{ bg: "#6ee7b7", color: "#064e3b" }, { bg: "#34d399", color: "common.white" }, { bg: "#a7f3d0", color: "#064e3b" }, { bg: "#d1fae5", color: "#065f46" }, { bg: "#ecfdf5", color: "#065f46" }],
      headingColor: "#059669", taglineColor: "#059669", spotlightColor: "#059669", nameColor: "#064e3b", subtitleColor: "#6ee7b7",
    },
    "till-date": {
      bg: "#1e293b", circles: ["#334155", "#475569", "#64748b"],
      chipBg: "#fbbf24", chipColor: "#1e293b",
      stats: [{ bg: "#334155", color: "#f8fafc" }, { bg: "#475569", color: "#f8fafc" }, { bg: "#334155", color: "#f8fafc" }, { bg: "#475569", color: "#f8fafc" }, { bg: "#334155", color: "#f8fafc" }],
      headingColor: "#94a3b8", taglineColor: "#94a3b8", spotlightColor: "#fbbf24", nameColor: "#f8fafc", subtitleColor: "#94a3b8",
      pattern: "radial-gradient(circle 2px at 15% 20%, rgba(251,191,36,0.06) 0%, transparent 50%), radial-gradient(circle 2px at 75% 60%, rgba(251,191,36,0.06) 0%, transparent 50%)",
    },
  };

  // Role-aware monthly data for the share card
  const roleMonthlyData = useMemo(
    () => demoRoleMonthlyShareData[selectedRole] ?? demoRoleMonthlyShareData.Teacher,
    [selectedRole],
  );

  // All-time cumulative data for the share card
  const shareTillDateData = useMemo((): ShareMonthDatum => {
    const tillDate = demoRoleTillDateShareData[selectedRole] ?? demoRoleTillDateShareData.Teacher;
    return { ...tillDate, monthLabel: "ALL TIME" };
  }, [selectedRole]);

  // Active share data - "All Time" toggle takes precedence over month selector
  const isTillDate = shareAllTime;
  const activeShareData = useMemo((): ShareMonthDatum => {
    if (shareAllTime) return shareTillDateData;
    return roleMonthlyData[shareMonth] ?? roleMonthlyData["2026-03"];
  }, [shareMonth, shareAllTime, roleMonthlyData, shareTillDateData]);

  // Category-aware labels for the share card: percentile badge, hours verb,
  // and learners verb all adapt to the selected role so a Mentor isn't told
  // they "taught" anything and a Moderator isn't ranked against Faculty.
  const shareLabels = useMemo(() => {
    switch (selectedRole) {
      case "Teacher":
      case "Industry Expert":
        return {
          percentile: "Top 10% of Faculty",
          hoursTillDate: "Total hours taught",
          hoursMonthly: "Taught this month",
          learnersTillDate: "Learners impacted",
          learnersMonthly: "Learners taught",
        };
      case "Evaluator":
        return {
          percentile: "Top 10% of Evaluators",
          hoursTillDate: "Total hours of evaluation",
          hoursMonthly: "Evaluated this month",
          learnersTillDate: "Learners impacted",
          learnersMonthly: "Learners evaluated",
        };
      case "Moderator":
        return {
          percentile: "Top 10% of Moderators",
          hoursTillDate: "Total hours of moderation",
          hoursMonthly: "Moderated this month",
          learnersTillDate: "Learners impacted",
          learnersMonthly: "Learners moderated",
        };
      default:
        // All Mentor roles (Course, Career, CV Review, Project)
        return {
          percentile: "Top 10% of Mentors",
          hoursTillDate: "Total hours of mentoring",
          hoursMonthly: "Mentored this month",
          learnersTillDate: "Learners impacted",
          learnersMonthly: "Learners mentored",
        };
    }
  }, [selectedRole]);

  const shareTheme = shareAllTime
    ? MONTH_THEMES["till-date"] ?? MONTH_THEMES["2026-03"]
    : MONTH_THEMES[shareMonth] ?? MONTH_THEMES["2026-03"];

  const tzLabel = useMemo(() => {
    const tz = timeZoneMode === "auto"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : manualTimeZone;
    const offset = getTimeZoneOffsetMinutes(tz);
    return `${tz} (${formatGMTOffsetFromMinutesAhead(offset)})`;
  }, [timeZoneMode, manualTimeZone]);

  // Role-aware rating history
  const roleRatingHistory = useMemo(
    () => demoRoleRatingHistory[selectedRole] ?? demoRatingHistory,
    [selectedRole],
  );

  // Build monthly rating chart data grouped by month label
  const ratingChartData = useMemo(() => {
    const byMonth: Record<string, number[]> = {};
    roleRatingHistory.forEach((r) => {
      const d = new Date(r.dateYmd);
      const lbl = `${d.toLocaleString(userLocale, { month: "short" })} ${String(d.getFullYear()).slice(2)}`;
      (byMonth[lbl] ??= []).push(r.score);
    });
    return MONTHS.map((m) => ({
      month: m,
      avg: byMonth[m]
        ? +(byMonth[m].reduce((a, b) => a + b, 0) / byMonth[m].length).toFixed(2)
        : null,
    }));
  }, [roleRatingHistory]);

  const avgRating = useMemo(() => {
    if (!roleRatingHistory.length) return "-";
    return (roleRatingHistory.reduce((a, r) => a + r.score, 0) / roleRatingHistory.length).toFixed(2);
  }, [roleRatingHistory]);

  // Role-aware category rating data for AVG RATING card
  const categoryRatings = useMemo(
    () => activeCategories.map((cat) => ({ category: cat, ...demoRoleCategoryRatings[cat] })),
    [activeCategories],
  );

  // Weighted average across active categories for hero value
  const weightedAvgRating = useMemo(() => {
    if (!categoryRatings.length) return "-";
    return (categoryRatings.reduce((s, c) => s + c.overall, 0) / categoryRatings.length).toFixed(2);
  }, [categoryRatings]);

  // ══ ZONE 1: Rating cards (one per active category, always visible) ══════
  const monthLabels = ["Sep 25", "Oct 25", "Nov 25", "Dec 25", "Jan 26", "Feb 26"];
  const ratingCards = useMemo(() =>
    categoryRatings.map((cr) => ({
      label: categoryDisplayLabel(cr.category).toUpperCase(),
      value: cr.overall.toFixed(2),
      numericValue: cr.overall,
      description: `Average ${categoryDisplayLabel(cr.category).toLowerCase()} rating across all feedback received.`,
      delta: `+${cr.delta.toFixed(2)}`,
      deltaLabel: "vs last month",
      deltaPositive: cr.delta >= 0,
      bars: cr.trend.map((t: { month: string; value: number }) => t.value),
      barLabels: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"],
      bg: "var(--gl-accent-primary-bg)",
      accent: "var(--gl-accent-primary)",
      reportTitle: `${categoryDisplayLabel(cr.category)} Rating Report`,
      reportSummary: `Your average ${categoryDisplayLabel(cr.category).toLowerCase()} rating over the last 6 months.`,
      chartData: cr.trend,
      chartKey: "value",
      breakdown: cr.breakdown,
      peerValue: demoRoleStatCards[selectedRole].peerAvgRating,
      peerLabel: demoRoleStatCards[selectedRole].peerAvgRating.toFixed(2),
      lowerIsBetter: false,
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  [categoryRatings, selectedRole]);

  // ══ HERO: On-time confirmation rate (universal, always visible) ═════════
  // This metric is shared across all roles - pulled out of the tabbed section
  // so it doesn't repeat per tab. Uses the dropdown-controlled selectedRole.
  const heroRd = demoRoleStatCards[selectedRole];
  const onTimeHeroCard = useMemo(() => ({
    label: "ON-TIME CONFIRMS",
    value: heroRd.onTimeConfirmRate,
    numericValue: parseFloat(heroRd.onTimeConfirmRate),
    description: "Work you confirmed within 24 hours of being assigned.",
    delta: heroRd.onTimeConfirmDelta,
    deltaLabel: "vs last quarter",
    deltaPositive: true,
    bars: heroRd.onTimeConfirmBars,
    barLabels: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"],
    bg: "var(--gl-accent-success-bg)",
    accent: "var(--gl-accent-success)",
    reportTitle: "On-time Confirmation Report",
    reportSummary: "Share of work you confirmed within 24 hours of being assigned. Higher is better.",
    chartData: heroRd.onTimeConfirmBars.map((v: number, i: number) => ({ month: monthLabels[i], value: v })),
    chartKey: "value",
    breakdown: heroRd.onTimeConfirmBreakdown,
    peerValue: heroRd.peerOnTimeConfirmRate,
    peerLabel: `${heroRd.peerOnTimeConfirmRate}%`,
    lowerIsBetter: false,
    supportingStat: { label: "Average time to confirm", value: heroRd.avgConfirmTime },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [selectedRole, heroRd]);

  // ══ ZONE 2: Operational cards - flat list across ALL tabItems ═════════
  // No tab switching - every category's operational metrics are visible at
  // once so nothing is hidden behind a tab.
  // ══ ZONE 2: Operational cards grouped by category ═════════════════════
  // Each tab (Evaluation, Moderation, Teaching, Mentoring) becomes its own
  // group with its own overline heading and a 2-col grid of its 2 cards.
  const operationalGroups = useMemo(() => {
    return tabItems.map((tab) => {
      const tabRole = tab.dataRole;
      const rd = demoRoleStatCards[tabRole];
      if (tab.isEvalMod) {
        const wN = tabRole === "Moderator" ? "moderations" : "evaluations";
        return {
          key: tab.key,
          title: tab.label,
          cards: [
            {
              id: `${tab.key}:${wN.toUpperCase()} / MONTH`,
              neutral: true,
              label: `${wN.toUpperCase()} / MONTH`,
              value: rd.avgSessions, numericValue: parseFloat(rd.avgSessions),
              description: `${wN.charAt(0).toUpperCase() + wN.slice(1)} delivered per month across your assignments.`,
              delta: rd.avgSessionsDelta, deltaLabel: "vs last month", deltaPositive: true,
              bars: rd.avgSessionsBars, barLabels: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"],
              bg: "var(--gl-accent-info-bg)", accent: "var(--gl-accent-info)",
              reportTitle: `${wN.charAt(0).toUpperCase() + wN.slice(1)} per Month Report`,
              reportSummary: `Monthly breakdown of ${wN} delivered as ${tabRole}.`,
              chartData: rd.avgSessionsBars.map((v: number, i: number) => ({ month: monthLabels[i], value: v })),
              chartKey: "value", breakdown: rd.sessionsBreakdown,
              peerValue: rd.peerAvgSessions, peerLabel: String(rd.peerAvgSessions), lowerIsBetter: false,
            },
          ],
        };
      }
      return {
        key: tab.key,
        title: tab.label,
        cards: [
          {
            id: `${tab.key}:AVG SESSIONS / MONTH`,
            neutral: true,
            label: "AVG SESSIONS / MONTH",
            value: rd.avgSessions, numericValue: parseFloat(rd.avgSessions),
            description: `Average sessions delivered per month as ${tabRole}.`,
            delta: rd.avgSessionsDelta, deltaLabel: "vs last month", deltaPositive: true,
            bars: rd.avgSessionsBars, barLabels: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"],
            bg: "var(--gl-accent-amber-bg)", accent: "var(--gl-accent-amber)",
            reportTitle: "Sessions per Month Report",
            reportSummary: `Monthly breakdown of sessions delivered as ${tabRole}.`,
            chartData: rd.avgSessionsBars.map((v: number, i: number) => ({ month: monthLabels[i], value: v })),
            chartKey: "value", breakdown: rd.sessionsBreakdown,
            peerValue: rd.peerAvgSessions, peerLabel: String(rd.peerAvgSessions), lowerIsBetter: false,
          },
          {
            id: `${tab.key}:AVG SESSION QUALITY`,
            neutral: true,
            label: "AVG SESSION QUALITY",
            value: rd.avgQuality, numericValue: parseFloat(rd.avgQuality),
            description: "Sessions rated 4.0 or above.",
            delta: rd.avgQualityDelta, deltaLabel: "vs last month", deltaPositive: true,
            bars: rd.avgQualityBars, barLabels: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"],
            bg: "var(--gl-accent-purple-bg)", accent: "var(--gl-accent-purple)",
            reportTitle: "Session Quality Report",
            reportSummary: "Percentage of sessions rated 4.0 or above. Higher is better.",
            chartData: rd.avgQualityBars.map((v: number, i: number) => ({ month: monthLabels[i], value: v })),
            chartKey: "value", breakdown: rd.qualityBreakdown,
            peerValue: rd.peerAvgQuality, peerLabel: `${rd.peerAvgQuality}%`, lowerIsBetter: false,
          },
        ],
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabItems, selectedRoles, selectedRole]);

  // V1 ship scope - hide ON-TIME * and AVG SESSION QUALITY cards site-wide.
  // Filtering at the memo level keeps statCards (drawer lookup) consistent
  // with what the user can actually see.
  const v1HiddenLabels = useMemo(
    () => new Set(["ON-TIME EVALUATIONS", "ON-TIME MODERATIONS", "AVG SESSION QUALITY"]),
    [],
  );
  const visibleOperationalGroups = useMemo(() => {
    if (!isV1Mode) return operationalGroups;
    return operationalGroups
      .map((g) => ({ ...g, cards: g.cards.filter((c) => !v1HiddenLabels.has(c.label)) }))
      .filter((g) => g.cards.length > 0);
  }, [operationalGroups, isV1Mode, v1HiddenLabels]);

  // Flat list for drawer lookup (reportModal matches on card.label)
  const operationalCards = useMemo(
    () => visibleOperationalGroups.flatMap((g) => g.cards),
    [visibleOperationalGroups],
  );

  // Map operational cards to their role category so each Monthly Rating
  // Trends card can embed its own performance stats above the matrix.
  // Evaluation + Moderation groups both roll up to "Evaluation & Moderation".
  type OperationalCard = typeof visibleOperationalGroups[number]["cards"][number];
  const operationalCardsByCategory = useMemo(() => {
    const map = new Map<string, OperationalCard[]>();
    for (const group of visibleOperationalGroups) {
      const cat = (group.key === "Evaluation" || group.key === "Moderation")
        ? "Evaluation & Moderation"
        : group.key;
      const existing = map.get(cat) ?? [];
      map.set(cat, [...existing, ...group.cards]);
    }
    return map;
  }, [visibleOperationalGroups]);

  // Combined for the drawer (which card was clicked - could be hero, rating, or operational).
  // onTimeHeroCard is hidden for Evaluator/Moderator (confirmation doesn't apply)
  // and hidden in V1 ship scope.
  const statCards = isEvalOrMod || isV1Mode
    ? [...ratingCards, ...operationalCards]
    : [onTimeHeroCard, ...ratingCards, ...operationalCards];

  /* ══ KPI Card Renderer (used by top Ratings row + per-category blocks) ══
     Extracted to component scope so both sites can share one card template. */
  const zeroMessages: Record<string, string> = {
    "AVG RATING": "Complete your first session to see your rating",
    "TEACHING": "Complete your first teaching session to see your rating",
    "MENTORING": "Complete your first mentoring session to see your rating",
    "EVALUATION": "Complete your first evaluation to see your rating",
    "MODERATION": "Complete your first moderation to see your rating",
    "EVALUATION & MODERATION": "Complete your first assignment to see your rating",
    "AVG SESSIONS / MONTH": "Sessions will appear here as you teach",
    "AVG SESSION QUALITY": "Quality score unlocks after your first rating",
    "ON-TIME CONFIRMS": "Confirm your first session to start tracking",
    "EVALUATIONS / MONTH": "Evaluations will appear here as you complete assignments",
    "MODERATIONS / MONTH": "Moderations will appear here as you respond to discussions",
    "ON-TIME EVALUATIONS": "Complete your first evaluation to start tracking",
    "ON-TIME MODERATIONS": "Respond to your first discussion to start tracking",
    "LEARNERS IMPACTED": "Learners count appears as you evaluate assignments",
  };
  const earlyValues: Record<string, string> = {
    "AVG RATING": "4.7", "TEACHING": "4.7", "MENTORING": "4.7",
    "EVALUATION": "4.8", "MODERATION": "4.8", "EVALUATION & MODERATION": "4.8",
    "AVG SESSIONS / MONTH": "2", "AVG SESSION QUALITY": "100%", "ON-TIME CONFIRMS": "100%",
    "EVALUATIONS / MONTH": "5", "MODERATIONS / MONTH": "3",
    "ON-TIME EVALUATIONS": "100%", "ON-TIME MODERATIONS": "100%", "LEARNERS IMPACTED": "12",
  };
  const earlyDescriptions: Record<string, string> = {
    "AVG RATING": "Based on 2 sessions so far. Keep going!",
    "TEACHING": "Based on your first teaching sessions. Keep going!",
    "MENTORING": "Based on your first mentoring sessions. Keep going!",
    "EVALUATION": "Based on your first evaluations. Keep going!",
    "MODERATION": "Based on your first moderations. Keep going!",
    "EVALUATION & MODERATION": "Based on your first assignments. Keep going!",
    "AVG SESSIONS / MONTH": "You've completed 2 sessions in your first weeks.",
    "AVG SESSION QUALITY": "All sessions rated 4.0+ so far. Great start!",
    "ON-TIME CONFIRMS": "On-time confirmation rate appears as you confirm sessions.",
    "EVALUATIONS / MONTH": "You've completed a few evaluations in your first weeks.",
    "MODERATIONS / MONTH": "You've responded to a few discussions in your first weeks.",
    "ON-TIME EVALUATIONS": "On-time evaluation rate appears as you complete more.",
    "ON-TIME MODERATIONS": "On-time moderation rate appears as you respond to more discussions.",
    "LEARNERS IMPACTED": "Learner count grows with every evaluation you complete.",
  };

  const renderCard = (card: typeof statCards[number]) => {
    const maxBar = Math.max(...card.bars);
    const cardId: string = (card as { id?: string }).id ?? card.label;
    const isNeutral = (card as { neutral?: boolean }).neutral === true;
    const cardBg = isNeutral ? "background.paper" : card.bg;
    const labelColor = isNeutral ? "text.secondary" : card.accent;
    const hoverBorder = isNeutral ? "text.disabled" : `color-mix(in srgb, ${card.accent} 55%, transparent)`;
    const hoverShadow = isNeutral
      ? "0 6px 18px -6px rgba(0,0,0,0.08)"
      : `0 6px 18px -6px color-mix(in srgb, ${card.accent} 35%, transparent)`;
    const activeShadow = isNeutral
      ? "0 3px 10px -4px rgba(0,0,0,0.06)"
      : `0 3px 10px -4px color-mix(in srgb, ${card.accent} 30%, transparent)`;
    const ctaBg = isNeutral
      ? "rgba(0,0,0,0.06)"
      : `color-mix(in srgb, ${card.accent} 16%, transparent)`;
    const ctaBgHover = isNeutral
      ? "rgba(0,0,0,0.1)"
      : `color-mix(in srgb, ${card.accent} 26%, transparent)`;
    const ctaColor = isNeutral ? "text.secondary" : card.accent;
    return (
      <Card
        key={cardId}
        elevation={0}
        onClick={() => { if (!isNewOrEarly) setReportModal(cardId); }}
        sx={{
          borderRadius: "12px",
          bgcolor: cardBg,
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          cursor: isNewOrEarly ? "default" : "pointer",
          transition: "border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
          ...(isNewOrEarly ? {} : {
            "&:hover": { borderColor: hoverBorder, transform: "translateY(-2px)", boxShadow: hoverShadow },
            "&:active": { transform: "translateY(-1px)", boxShadow: activeShadow },
          }),
        }}
      >
        <CardContent sx={{ p: { xs: 1.25, sm: 1.5 }, flex: 1, display: "flex", flexDirection: "column" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: { xs: 0.75, sm: 1 } }}>
            <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: "0.08em", color: labelColor, fontSize: { xs: "0.55rem", sm: "0.65rem" } }}>
              {card.label}
            </Typography>
            {!isNewOrEarly && (
              <MuiTooltip title="See detailed report" arrow placement="top">
                <IconButton
                  size="small"
                  aria-label="See detailed report"
                  onClick={(e) => { e.stopPropagation(); setReportModal(cardId); }}
                  disableRipple
                  sx={{
                    width: 30, height: 20, borderRadius: "999px", p: 0,
                    bgcolor: ctaBg, color: ctaColor,
                    transition: "background-color 0.18s ease, transform 0.18s ease",
                    "& .arrow": { transition: "transform 0.18s ease" },
                    "&:hover": { bgcolor: ctaBgHover, "& .arrow": { transform: "translateX(2px)" } },
                    "&:active": { transform: "scale(0.96)" },
                  }}
                >
                  <ArrowForwardIcon className="arrow" sx={{ fontSize: 12 }} />
                </IconButton>
              </MuiTooltip>
            )}
          </Stack>
          <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ mb: { xs: 0.5, sm: 1 }, flexWrap: "wrap" }}>
            <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1, letterSpacing: "-0.02em", fontSize: { xs: "1.15rem", sm: "1.4rem" }, ...(isNewUser ? { opacity: 0.3 } : {}) }}>
              {isNewUser ? "-" : isEarlyUser ? (earlyValues[card.label] ?? card.value) : card.value}
            </Typography>
            {!isNewOrEarly && card.delta && (
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ display: { xs: "none", sm: "inline-flex" }, lineHeight: 1 }}>
                {card.deltaPositive
                  ? <TrendingUpIcon sx={{ fontSize: 14, color: "success.main", display: "block" }} />
                  : <TrendingDownIcon sx={{ fontSize: 14, color: "error.main", display: "block" }} />}
                <Typography variant="caption" sx={{ color: card.deltaPositive ? "success.main" : "error.main", fontWeight: 600, fontSize: "0.75rem", lineHeight: 1 }}>
                  {card.delta}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem", lineHeight: 1 }}>
                  {card.deltaLabel}
                </Typography>
              </Stack>
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4, mb: 1, display: { xs: "none", sm: "-webkit-box" }, WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontSize: "0.68rem" }}>
            {isNewUser ? zeroMessages[card.label] ?? card.description : isEarlyUser ? (earlyDescriptions[card.label] ?? card.description) : card.description}
          </Typography>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            {!isV1Mode && !isNewOrEarly && card.peerValue != null && (() => {
              const you = card.numericValue;
              const peer = card.peerValue;
              const isAhead = card.lowerIsBetter ? you < peer : you > peer;
              const isEqual = Math.abs(you - peer) < 0.01;
              const diff = Math.abs(you - peer);
              const labelIsPercent = card.label.startsWith("ON-TIME") || card.label === "AVG SESSION QUALITY";
              const labelIsInteger = card.label.includes("/ MONTH") || card.label === "LEARNERS IMPACTED";
              const diffStr = labelIsPercent ? `${diff.toFixed(1)}%` : labelIsInteger ? Math.round(diff).toString() : diff.toFixed(2);
              const sentiment = isEqual ? "You're on par" : isAhead ? `You're ${diffStr} ahead` : `${diffStr} to go`;
              const sentimentColor = isEqual ? "text.secondary" : isAhead ? "success.main" : "warning.dark";
              return (
                <Typography variant="caption" sx={{ fontSize: { xs: "0.68rem", sm: "0.75rem" }, color: "text.secondary", display: "block", lineHeight: 1.4 }}>
                  Peer avg {card.peerLabel}
                  <Typography component="span" sx={{ fontSize: { xs: "0.68rem", sm: "0.75rem" }, fontWeight: 600, color: sentimentColor, ml: 0.5 }}>· {sentiment}</Typography>
                </Typography>
              );
            })()}
          </Box>
          <Box sx={{ mt: "auto", pt: { xs: 1.5, sm: 2 }, mb: 0.25 }}>
            {isNewOrEarly ? (
              <svg width="100%" height={32} viewBox="0 0 140 32" preserveAspectRatio="none" style={{ display: "block" }}>
                <line x1="0" y1="16" x2="140" y2="16" stroke={card.accent} strokeWidth={1} strokeDasharray="4 4" opacity={0.25} />
              </svg>
            ) : (() => {
              const h = 32, w = 140;
              const minVal = Math.min(...card.bars);
              const range = maxBar - minVal || 1;
              const coords = card.bars.map((v: number, i: number) => ({
                x: (i / (card.bars.length - 1)) * w,
                y: h - ((v - minVal) / range) * (h - 4) - 2,
                val: v, label: card.barLabels[i],
              }));
              const polyPoints = coords.map((c) => `${c.x},${c.y}`).join(" ");
              const areaPoints = `0,${h} ${polyPoints} ${w},${h}`;
              return (
                <Box sx={{ position: "relative" }}>
                  <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
                    <polygon points={areaPoints} fill={card.accent} opacity={0.1} />
                    <polyline points={polyPoints} fill="none" stroke={card.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
                  </svg>
                  {coords.map((c, i) => (
                    <MuiTooltip key={i} title={`${c.label}: ${c.val}`} placement="top" arrow slotProps={{ tooltip: { sx: { fontSize: "0.7rem", py: 0.25, px: 1 } } }}>
                      <Box sx={{ position: "absolute", left: `${(c.x / w) * 100}%`, top: `${(c.y / h) * 100}%`, transform: "translate(-50%, -50%)", width: 12, height: 12, borderRadius: "50%", cursor: "pointer", "&:hover .spark-dot": { opacity: 1 } }}>
                        <Box className="spark-dot" sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: card.accent, position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: i === card.bars.length - 1 ? 1 : 0.4, transition: "opacity 0.15s ease" }} />
                      </Box>
                    </MuiTooltip>
                  ))}
                </Box>
              );
            })()}
          </Box>
          {!isNewOrEarly && (
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              {card.barLabels.map((lbl: string, i: number) => (
                <Typography key={i} variant="caption" color="text.disabled" sx={{ fontSize: "0.55rem" }}>{lbl}</Typography>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading || roleLoading) {
    return (
      <>
        {/* Header skeleton */}
        <FlexBox sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
          <Box>
            <Skeleton variant="text" width={120} height={32} />
            <Skeleton variant="text" width={260} height={18} />
          </Box>
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rounded" width={100} height={32} />
            <Skeleton variant="rounded" width={80} height={32} />
          </Stack>
        </FlexBox>

        {/* Identity card skeleton */}
        <Card variant="outlined" sx={{ mb: 4, borderRadius: "16px" }}>
          <CardContent sx={{ px: 3, py: 2 }}>
            <Stack spacing={1.5}>
              <Skeleton variant="text" width={180} height={28} />
              <Skeleton variant="text" width={240} height={18} />
              <Skeleton variant="text" width={140} height={18} />
              <Skeleton variant="text" width={200} height={18} />
            </Stack>
          </CardContent>
        </Card>

        {/* Performance heading skeleton */}
        <Box sx={{ mb: 1.5 }}>
          <Skeleton variant="text" width={140} height={28} />
          <Skeleton variant="text" width={320} height={18} />
        </Box>

        {/* Stat cards skeleton - 4 cards */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} elevation={0} sx={{ borderRadius: "12px", border: "1px solid", borderColor: "divider", p: 2 }}>
              <Skeleton variant="text" width={80} height={14} sx={{ mb: 1.5 }} />
              <Skeleton variant="text" width={100} height={40} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="90%" height={14} />
              <Skeleton variant="text" width={120} height={14} sx={{ mt: 1 }} />
              <Skeleton variant="rectangular" width="100%" height={48} sx={{ mt: 2, borderRadius: 1 }} />
            </Card>
          ))}
        </Box>

        {/* Testimonials skeleton */}
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={160} height={24} sx={{ mb: 1.5 }} />
          <Stack direction="row" spacing={2}>
            {[0, 1].map((i) => (
              <Card key={i} variant="outlined" sx={{ flex: 1, p: 2 }}>
                <Skeleton variant="text" width="100%" height={16} />
                <Skeleton variant="text" width="80%" height={16} />
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }}>
                  <Skeleton variant="circular" width={28} height={28} />
                  <Box>
                    <Skeleton variant="text" width={80} height={14} />
                    <Skeleton variant="text" width={100} height={12} />
                  </Box>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Box>

        {/* Rating chart skeleton */}
        <Card variant="outlined" sx={{ mb: 3, borderRadius: "16px" }}>
          <CardContent sx={{ p: 2 }}>
            <Skeleton variant="text" width={200} height={24} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 1 }} />
          </CardContent>
        </Card>

        {/* Course performance skeleton */}
        <Card variant="outlined" sx={{ mb: 3, borderRadius: "16px" }}>
          <CardContent sx={{ p: 2 }}>
            <Skeleton variant="text" width={180} height={24} sx={{ mb: 2 }} />
            {[0, 1, 2, 3, 4].map((i) => (
              <Stack key={i} direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.25 }}>
                <Skeleton variant="text" width={210} height={16} />
                <Skeleton variant="rectangular" sx={{ flex: 1, height: 8, borderRadius: 1 }} />
                <Skeleton variant="text" width={28} height={16} />
              </Stack>
            ))}
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <Stack spacing={2}>
      {/* ── Identity header - two-line flat row ────────────────────────────
          Line 1: name (page title). Line 2: email · timezone (clickable).
          Right-aligned pencil icon opens the inline edit dialog. */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ px: { xs: 0, sm: 0.5 }, py: { xs: 0.25, sm: 0.5 } }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              fontSize: { xs: "1.05rem", sm: "1.25rem" },
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {guruName}
          </Typography>
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            sx={{ mt: 0.25, minWidth: 0 }}
            divider={<Typography component="span" sx={{ color: "text.disabled", fontSize: { xs: "0.75rem", sm: "0.8125rem" }, lineHeight: 1 }}>·</Typography>}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                lineHeight: 1.3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                minWidth: 0,
              }}
            >
              {guruEmail}
            </Typography>
            <Box
              component="span"
              onClick={() => dispatch(setOpenTimezone(true))}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                color: "text.secondary",
                cursor: "pointer",
                flexShrink: 0,
                "&:hover": { color: "primary.main", textDecoration: "underline" },
              }}
            >
              <PublicOutlinedIcon sx={{ fontSize: 13 }} />
              {tzLabel}
            </Box>
          </Stack>
        </Box>
        {/* Mobile: plain icon button (no tonal bg). Desktop: soft pill with text. */}
        <IconButton
          size="small"
          aria-label="Edit profile"
          onClick={() => navigate("/preferences#profile")}
          sx={{
            display: { xs: "inline-flex", sm: "none" },
            flexShrink: 0,
            color: "primary.main",
          }}
        >
          <EditOutlinedIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Button
          variant="soft"
          size="small"
          color="primary"
          startIcon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
          onClick={() => navigate("/preferences#profile")}
          sx={{
            display: { xs: "none", sm: "inline-flex" },
            flexShrink: 0,
            borderRadius: "8px",
            textTransform: "none",
            fontSize: "0.75rem",
            fontWeight: 600,
            px: 1.25,
            py: 0.25,
            minHeight: 30,
            "& .MuiButton-startIcon": { mr: 0.5 },
          }}
        >
          Edit Profile
        </Button>
      </Stack>

      {/* ══ SHARE YOUR IMPACT ═════════════════════════════════════════════ */}
      {!isNewOrEarly && (() => {
        /* Shared card JSX - rendered identically in thumbnail & dialog */
        const shareCardContent = (
          <ThemeProvider theme={lightTheme}>
          <Card
            elevation={0}
            sx={{ borderRadius: "12px", bgcolor: shareTheme.bg, position: "relative", overflow: "hidden", transition: "background-color 0.4s ease" }}
          >
            <Box sx={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", bgcolor: shareTheme.circles[0], opacity: 0.3 }} />
            <Box sx={{ p: 3, position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Box component="img" src={isTillDate ? "/gl-logo-white.svg" : "/gl-logo-navy.svg"} alt="Great Learning" sx={{ height: 20 }} />
                <Typography sx={{ color: shareTheme.headingColor, fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.05em" }}>{activeShareData.monthLabel}</Typography>
              </Stack>
              <Typography sx={{ color: shareTheme.headingColor, letterSpacing: "0.1em", fontWeight: 700, fontSize: "0.45rem", mb: 0.15 }}>GURU SPOTLIGHT</Typography>
              <Typography sx={{ color: shareTheme.nameColor, fontWeight: 800, fontSize: "1.3rem", lineHeight: 1.1 }}>{guruName}</Typography>
              <Typography sx={{ color: shareTheme.headingColor, fontSize: "0.65rem", mb: 1.5 }}>Machine Learning · Data Science</Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, flex: 1, minHeight: 0, mb: 1.5 }}>
                <Stack spacing={1}>
                  <Box sx={{ flex: 1, bgcolor: isTillDate ? "rgba(255,255,255,0.08)" : "var(--gl-accent-primary-bg)", borderRadius: "8px", p: 1.5, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <Box>
                      <Typography sx={{ color: shareTheme.nameColor, fontWeight: 600, fontSize: "1.6rem", lineHeight: 1.17, letterSpacing: "-0.025em" }}>{activeShareData.sessions}</Typography>
                      <Typography sx={{ color: shareTheme.headingColor, fontSize: "0.7rem", fontWeight: 400, mt: 0.5, lineHeight: 1.43 }}>{isTillDate ? "Total activities delivered" : "Activities delivered this month"}</Typography>
                    </Box>
                    <Chip icon={<TrendingUpOutlinedIcon sx={{ fontSize: 16 }} />} label={shareLabels.percentile} size="small" variant="outlined" sx={{ alignSelf: "flex-start", mt: 1, height: 24, fontSize: "0.6rem", fontWeight: 500, borderColor: isTillDate ? "rgba(255,255,255,0.5)" : "rgba(33,33,33,0.3)", color: isTillDate ? "#fff" : "inherit", "& .MuiChip-icon": { ml: 0.5, color: isTillDate ? "#fff" : "inherit" } }} />
                  </Box>
                  <Box sx={{ flex: 1, bgcolor: isTillDate ? "rgba(255,255,255,0.08)" : "var(--gl-accent-primary-bg)", borderRadius: "8px", p: 1.5, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <Box>
                      <Typography sx={{ color: shareTheme.nameColor, fontWeight: 600, fontSize: "1.6rem", lineHeight: 1.17, letterSpacing: "-0.025em" }}>{activeShareData.hours} Hrs</Typography>
                      <Typography sx={{ color: shareTheme.headingColor, fontSize: "0.8rem", fontWeight: 400, mt: 0.5, lineHeight: 1.5 }}>{isTillDate ? shareLabels.hoursTillDate : shareLabels.hoursMonthly}</Typography>
                    </Box>
                    <Chip icon={<TrendingUpOutlinedIcon sx={{ fontSize: 16 }} />} label={shareLabels.percentile} size="small" variant="outlined" sx={{ alignSelf: "flex-start", mt: 1, height: 24, fontSize: "0.6rem", fontWeight: 500, borderColor: isTillDate ? "rgba(255,255,255,0.5)" : "rgba(33,33,33,0.3)", color: isTillDate ? "#fff" : "inherit", "& .MuiChip-icon": { ml: 0.5, color: isTillDate ? "#fff" : "inherit" } }} />
                  </Box>
                </Stack>
                <Stack spacing={1}>
                  <Box sx={{ flex: 1, bgcolor: isTillDate ? "rgba(255,255,255,0.08)" : "var(--gl-accent-primary-bg)", borderRadius: "8px", p: 1.5 }}>
                    <Typography sx={{ color: shareTheme.nameColor, fontWeight: 600, fontSize: "1.6rem", lineHeight: 1.17, letterSpacing: "-0.025em" }}>{activeShareData.learners}</Typography>
                    <Typography sx={{ color: shareTheme.headingColor, fontSize: "0.8rem", fontWeight: 400, mt: 0.5, lineHeight: 1.5 }}>{isTillDate ? shareLabels.learnersTillDate : shareLabels.learnersMonthly}</Typography>
                  </Box>
                  <Box sx={{ flex: 1, bgcolor: isTillDate ? "rgba(255,255,255,0.08)" : "var(--gl-accent-primary-bg)", borderRadius: "8px", p: 1.5 }}>
                    <Typography sx={{ color: shareTheme.nameColor, fontWeight: 600, fontSize: "1.6rem", lineHeight: 1.17, letterSpacing: "-0.025em" }}>{activeShareData.rating}/5</Typography>
                    <Typography sx={{ color: shareTheme.headingColor, fontSize: "0.8rem", fontWeight: 400, mt: 0.5, lineHeight: 1.5 }}>{isTillDate ? "Overall avg rating" : "Avg ratings this month"}</Typography>
                  </Box>
                  <Box sx={{ flex: 1, bgcolor: isTillDate ? "rgba(255,255,255,0.08)" : "var(--gl-accent-primary-bg)", borderRadius: "8px", p: 1.5 }}>
                    <Typography sx={{ color: shareTheme.nameColor, fontWeight: 600, fontSize: "1.6rem", lineHeight: 1.17, letterSpacing: "-0.025em" }}>{activeShareData.rated4Plus === activeShareData.sessions ? "100%" : `${Math.round((+activeShareData.rated4Plus / +activeShareData.sessions) * 100)}%`}</Typography>
                    <Typography sx={{ color: shareTheme.headingColor, fontSize: "0.8rem", fontWeight: 400, mt: 0.5, lineHeight: 1.5 }}>Activities rated 4+</Typography>
                  </Box>
                </Stack>
              </Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1, borderTop: "1px dashed", borderColor: "divider" }}>
                <Typography sx={{ color: shareTheme.headingColor, fontSize: "0.55rem", fontWeight: 600 }}>Empowering careers, one lesson at a time.</Typography>
              </Stack>
            </Box>
          </Card>
          </ThemeProvider>
        );

        const heroLearners = activeShareData.learners;
        const prettyMonth = shareMonthOptions.find((m) => m.value === shareMonth)?.label?.replace(" (Current)", "") ?? activeShareData.monthLabel;
        const heroTail = isTillDate
          ? "since you joined Great Learning"
          : `in ${prettyMonth}`;
        const thumbW = 180;           // lg+ desktop
        const thumbWTablet = 272;     // sm/md tablets — yields ~220px tall
        const thumbWMobile = 320;     // xs phones
        const thumbScale = thumbW / SHARE_CARD_WIDTH;
        const thumbScaleTablet = thumbWTablet / SHARE_CARD_WIDTH;
        const thumbScaleMobile = thumbWMobile / SHARE_CARD_WIDTH;
        const thumbH = Math.round(420 * thumbScale);
        const thumbHTablet = Math.round(420 * thumbScaleTablet);
        const thumbHMobile = Math.round(420 * thumbScaleMobile);

        return (
        <>
        {/* Editorial impact block — app-theme-aware surface, confident typography,
            one hero stat + 4 supporting tiles + single share CTA. Downloadable
            share card preview lives in the Dialog below, not on-page. Uses the
            app palette (not shareTheme) so light/dark both have proper contrast. */}
        <Box sx={{
          position: "relative",
          borderRadius: "16px",
          overflow: "hidden",
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          backgroundImage: (theme) => `radial-gradient(circle at 100% 0%, ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.16 : 0.07)} 0%, transparent 55%)`,
          px: { xs: 2, sm: 2.5 },
          py: { xs: 2, sm: 2.25 },
        }}>
          {/* Top bar: overline + period controls (tight single row) */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: { xs: 1.5, sm: 1.75 }, position: "relative", zIndex: 1 }}>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary">
              Share Your Impact
            </Typography>

            {/* Desktop: All Time + Month buttons — both neutral-toned so the
                Share my impact CTA remains the sole primary action. Selected
                state is indicated with a subtle filled background, not primary. */}
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ display: { xs: "none", sm: "flex" } }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setShareAllTime(true)}
                sx={{
                  borderRadius: "8px", textTransform: "none", fontWeight: 600, fontSize: "0.72rem",
                  px: 1.25, py: 0.25, minWidth: 0, minHeight: 26,
                  borderColor: "divider",
                  color: shareAllTime ? "text.primary" : "text.secondary",
                  bgcolor: (theme) => shareAllTime ? alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.08 : 0.05) : "transparent",
                  "&:hover": { bgcolor: (theme) => alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.1 : 0.06), borderColor: "divider" },
                }}
              >
                All Time
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => setMonthMenuAnchor(e.currentTarget)}
                endIcon={<ChevronRightIcon sx={{ fontSize: "14px !important", transform: "rotate(90deg)", ml: -0.5 }} />}
                sx={{
                  borderRadius: "8px", textTransform: "none", fontWeight: 600, fontSize: "0.72rem",
                  px: 1.25, py: 0.25, minWidth: 0, minHeight: 26,
                  borderColor: "divider",
                  color: !shareAllTime ? "text.primary" : "text.secondary",
                  bgcolor: (theme) => !shareAllTime ? alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.08 : 0.05) : "transparent",
                  "&:hover": { bgcolor: (theme) => alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.1 : 0.06), borderColor: "divider" },
                }}
              >
                {shareMonthOptions.find((m) => m.value === shareMonth)?.label?.replace(" (Current)", "") ?? "Month"}
              </Button>
              <Menu
                anchorEl={monthMenuAnchor}
                open={Boolean(monthMenuAnchor)}
                onClose={() => setMonthMenuAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { sx: { borderRadius: "10px", mt: 0.5, minWidth: 200 } } }}
              >
                {shareMonthOptions.map((m) => (
                  <MenuItem
                    key={m.value}
                    selected={!shareAllTime && m.value === shareMonth}
                    onClick={() => { setShareMonth(m.value); setShareAllTime(false); setMonthMenuAnchor(null); }}
                    sx={{ fontSize: "0.8rem", py: 1, display: "flex", justifyContent: "space-between" }}
                  >
                    <ListItemText primaryTypographyProps={{ fontSize: "0.8rem" }}>{m.label}</ListItemText>
                    {!shareAllTime && m.value === shareMonth && <CheckIcon sx={{ fontSize: 16, ml: 1.5, color: "primary.main" }} />}
                  </MenuItem>
                ))}
              </Menu>
            </Stack>

            {/* Mobile: single dropdown — neutral-toned so Share CTA stays primary */}
            <Button
              size="small"
              variant="outlined"
              onClick={() => setMonthSheetOpen(true)}
              endIcon={<ChevronRightIcon sx={{ fontSize: "14px !important", transform: "rotate(90deg)", ml: -0.5 }} />}
              sx={{
                display: { xs: "inline-flex", sm: "none" },
                borderRadius: "8px", textTransform: "none", fontWeight: 600, fontSize: "0.72rem",
                px: 1.25, py: 0.25, minWidth: 0, minHeight: 26,
                borderColor: "divider",
                color: "text.primary",
                bgcolor: (theme) => alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.08 : 0.05),
                "&:hover": { bgcolor: (theme) => alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.1 : 0.06), borderColor: "divider" },
              }}
            >
              {shareAllTime ? "All Time" : (shareMonthOptions.find((m) => m.value === shareMonth)?.label?.replace(" (Current)", "") ?? "Month")}
            </Button>
          </Stack>

          {/* Body grid: thumbnail preview on left, editorial content on right.
              Stacks on mobile (thumbnail first). Right content is vertically
              centered against the thumbnail height on desktop. */}
          <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: `${thumbWTablet}px 1fr`, lg: `${thumbW}px 1fr` },
            gap: { xs: 1.5, sm: 2 },
            alignItems: { xs: "start", sm: "center" },
            position: "relative",
            zIndex: 1,
          }}>
            {/* Thumbnail - pixel-perfect scaled share card. Sized per breakpoint:
                xs=320 (mobile, full row), sm/md=272 (tablets, ~220 tall),
                lg+=180 (desktop beside editorial content). */}
            <Box
              onClick={() => setShareOpen(true)}
              sx={{
                justifySelf: { xs: "center", sm: "start" },
                width: { xs: thumbWMobile, sm: thumbWTablet, lg: thumbW },
                height: { xs: thumbHMobile, sm: thumbHTablet, lg: thumbH },
                flexShrink: 0,
                overflow: "hidden",
                cursor: "pointer",
                position: "relative",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
                "&:hover .share-thumb-overlay": { opacity: 1 },
              }}
            >
              <Box sx={{ width: SHARE_CARD_WIDTH, height: 420, transform: { xs: `scale(${thumbScaleMobile})`, sm: `scale(${thumbScaleTablet})`, lg: `scale(${thumbScale})` }, transformOrigin: "top left", pointerEvents: "none" }}>
                {shareCardContent}
              </Box>
              <Box
                className="share-thumb-overlay"
                sx={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  bgcolor: "rgba(0,0,0,0.35)", opacity: 0,
                  transition: "opacity 0.2s",
                  borderRadius: "8px",
                }}
              >
                <Stack alignItems="center" spacing={0.5}>
                  <VisibilityOutlinedIcon sx={{ fontSize: 22, color: "common.white" }} />
                  <Typography sx={{ fontSize: "0.65rem", color: "common.white", fontWeight: 600 }}>Preview</Typography>
                </Stack>
              </Box>
            </Box>

            {/* Editorial content column — hero above, stat-row + Share below */}
            <Stack spacing={{ xs: 1.5, sm: 1.75 }}>
              {/* Hero text + chip */}
              <Box>
                <Stack direction="row" alignItems="baseline" spacing={1} flexWrap="wrap">
                  <Typography sx={{
                    fontWeight: 800,
                    fontSize: { xs: "1.75rem", sm: "2.25rem" },
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                    color: "text.primary",
                  }}>
                    {heroLearners}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.95rem", sm: "1.1rem" }, color: "text.secondary", letterSpacing: "-0.01em" }}>
                    learners impacted · {heroTail}
                  </Typography>
                </Stack>
                <Chip
                  icon={<TrendingUpOutlinedIcon sx={{ fontSize: 13 }} />}
                  label={shareLabels.percentile}
                  size="small"
                  sx={{ mt: 1, height: 22, fontSize: "0.68rem", fontWeight: 600, bgcolor: (theme) => alpha(theme.palette.success.main, theme.palette.mode === "dark" ? 0.18 : 0.1), border: "1px solid", borderColor: (theme) => alpha(theme.palette.success.main, theme.palette.mode === "dark" ? 0.35 : 0.25), color: "success.main", "& .MuiChip-icon": { color: "success.main", ml: "4px" }, "& .MuiChip-label": { px: 0.75 } }}
                />
              </Box>

              {/* Stat pills + Share button — uses container queries so the
                  layout reacts to the ACTUAL block width, not viewport width.
                  This handles both sidebar-collapsed wide layouts and
                  sidebar-expanded narrow layouts correctly.
                  • block narrower than ~760px: 2×2 pills + full-width Share
                  • block wider: all 5 items on one line, pills flex equally */}
              <Box sx={{ containerType: "inline-size" }}>
                <Box sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: { xs: 0.75, sm: 1 },
                  alignItems: "stretch",
                  "& > .stat-pill": { flex: "1 1 calc(50% - 4px)" },
                  "& > .share-cta": { flex: "1 1 100%" },
                  "@container (min-width: 900px)": {
                    flexWrap: "nowrap",
                    "& > .stat-pill": { flex: "1 1 0" },
                    "& > .share-cta": { flex: "0 0 auto", width: "auto" },
                  },
                }}>
                  {[
                    { value: activeShareData.sessions, label: "Activities" },
                    { value: `${activeShareData.hours}`, suffix: "hrs", label: (isTillDate ? shareLabels.hoursTillDate : shareLabels.hoursMonthly).replace(/ this month$/, "").replace(/^Total hours of /, "Total ").replace(/^Total hours /, "Total ") },
                    { value: `${activeShareData.rating}`, suffix: "/5", label: "Avg rating" },
                    { value: activeShareData.rated4Plus === activeShareData.sessions ? "100%" : `${Math.round((+activeShareData.rated4Plus / +activeShareData.sessions) * 100)}%`, label: "Activities rated 4+" },
                  ].map((s) => (
                    <Box key={s.label} className="stat-pill" sx={{
                      minWidth: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      bgcolor: (theme) => alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.04 : 0.025),
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "10px",
                      px: { xs: 1, sm: 1.25 },
                      py: 1,
                      minHeight: 44,
                    }}>
                      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: { xs: "1rem", sm: "1.05rem" }, lineHeight: 1.1, letterSpacing: "-0.02em", color: "text.primary", flexShrink: 0 }}>
                          {s.value}
                          {s.suffix && <Box component="span" sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" }, fontWeight: 600, color: "text.secondary", ml: 0.25 }}>{s.suffix}</Box>}
                        </Typography>
                        <Typography sx={{ fontSize: { xs: "0.7rem", sm: "0.72rem" }, color: "text.secondary", fontWeight: 500, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>
                          {s.label}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                  <Button
                    className="share-cta"
                    variant="contained"
                    startIcon={<IosShareOutlinedIcon sx={{ fontSize: 16 }} />}
                    onClick={() => setShareOpen(true)}
                    sx={{
                      borderRadius: "10px",
                      textTransform: "none", fontWeight: 600, fontSize: "0.8rem",
                      px: 2, py: 1, minHeight: 44,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Share my impact
                  </Button>
                </Box>
              </Box>
            </Stack>
          </Box>
        </Box>

        {/* Month picker bottom sheet (mobile only) */}
        <Drawer
          anchor="bottom"
          open={monthSheetOpen}
          onClose={() => setMonthSheetOpen(false)}
          sx={{ "& .MuiDrawer-paper": { borderRadius: "16px 16px 0 0", maxHeight: "50vh" } }}
        >
          <Box sx={{ pt: 1.5, pb: 1 }}>
            <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: "divider", mx: "auto", mb: 1.5 }} />
            <Typography variant="subtitle2" fontWeight={700} sx={{ px: 2, mb: 1 }}>Select period</Typography>
            <Box
              component="button"
              onClick={() => { setShareAllTime(true); setMonthSheetOpen(false); }}
              sx={{
                display: "flex", alignItems: "center", width: "100%",
                px: 2, py: 1.5, border: "none",
                bgcolor: shareAllTime ? "primary.50" : "transparent",
                cursor: "pointer", fontFamily: "inherit",
                "&:hover": { bgcolor: shareAllTime ? "primary.100" : "action.hover" },
                "&:active": { bgcolor: "action.selected" },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: shareAllTime ? 700 : 500, color: shareAllTime ? "primary.main" : "text.primary" }}>
                All Time
              </Typography>
            </Box>
            <Divider sx={{ my: 0.5 }} />
            {shareMonthOptions.map((m) => (
              <Box
                key={m.value}
                component="button"
                onClick={() => { setShareMonth(m.value); setShareAllTime(false); setMonthSheetOpen(false); }}
                sx={{
                  display: "flex", alignItems: "center", width: "100%",
                  px: 2, py: 1.5, border: "none",
                  bgcolor: !shareAllTime && m.value === shareMonth ? "primary.50" : "transparent",
                  cursor: "pointer", fontFamily: "inherit",
                  "&:hover": { bgcolor: !shareAllTime && m.value === shareMonth ? "primary.100" : "action.hover" },
                  "&:active": { bgcolor: "action.selected" },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: !shareAllTime && m.value === shareMonth ? 700 : 400, color: !shareAllTime && m.value === shareMonth ? "primary.main" : "text.primary" }}>
                  {m.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Drawer>

        {/* ── Share Impact Dialog ─────────────────────────────────────── */}
        <Dialog
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          fullScreen={isMobile}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: isMobile ? 0 : "16px", ...(!isMobile && { maxWidth: 560 }) } }}
        >
          <Box sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 }, pb: 0 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>Share your impact</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Download your stats card or share directly to social media.
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setShareOpen(false)}>
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Stack>
          </Box>

          <DialogContent sx={{ px: { xs: 2, sm: 3 }, pt: 2, display: "flex", flexDirection: "column", alignItems: { xs: "center", sm: "stretch" } }}>
            {/* Two independent buttons: [All Time]  [Month ▾] */}
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.5 }}>
              <Button
                size="small"
                variant={shareAllTime ? "contained" : "outlined"}
                onClick={() => setShareAllTime(true)}
                sx={{
                  borderRadius: "8px", textTransform: "none",
                  fontWeight: 600, fontSize: "0.8rem",
                  px: 1.5, py: 0.4, minWidth: 0,
                  ...(!shareAllTime && { borderColor: "divider", color: "text.secondary" }),
                }}
              >
                All Time
              </Button>
              <Button
                size="small"
                variant={!shareAllTime ? "contained" : "outlined"}
                onClick={(e) => setDialogMonthMenuAnchor(e.currentTarget)}
                endIcon={<ChevronRightIcon sx={{ fontSize: "14px !important", transform: "rotate(90deg)", ml: -0.5 }} />}
                sx={{
                  borderRadius: "8px", textTransform: "none",
                  fontWeight: 600, fontSize: "0.8rem",
                  px: 1.5, py: 0.4, minWidth: 0,
                  ...(!shareAllTime ? {} : { borderColor: "divider", color: "text.secondary" }),
                }}
              >
                {shareMonthOptions.find((m) => m.value === shareMonth)?.label?.replace(" (Current)", "") ?? "Month"}
              </Button>
              <Menu
                anchorEl={dialogMonthMenuAnchor}
                open={Boolean(dialogMonthMenuAnchor)}
                onClose={() => setDialogMonthMenuAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { sx: { borderRadius: "10px", mt: 0.5, minWidth: 200 } } }}
              >
                {shareMonthOptions.map((m) => (
                  <MenuItem
                    key={m.value}
                    selected={!shareAllTime && m.value === shareMonth}
                    onClick={() => { setShareMonth(m.value); setShareAllTime(false); setDialogMonthMenuAnchor(null); }}
                    sx={{ fontSize: "0.8rem", py: 1, display: "flex", justifyContent: "space-between" }}
                  >
                    <ListItemText primaryTypographyProps={{ fontSize: "0.8rem" }}>{m.label}</ListItemText>
                    {!shareAllTime && m.value === shareMonth && <CheckIcon sx={{ fontSize: 16, ml: 1.5, color: "primary.main" }} />}
                  </MenuItem>
                ))}
              </Menu>
            </Stack>

            {/* Preview card - 340px on mobile via transform scale, zoom on desktop */}
            {isMobile ? (
              <Box sx={{ width: 340, height: Math.round(420 * (340 / SHARE_CARD_WIDTH)), overflow: "hidden", mb: 3, borderRadius: "8px" }}>
                <Box sx={{ width: SHARE_CARD_WIDTH, height: 420, transform: `scale(${340 / SHARE_CARD_WIDTH})`, transformOrigin: "top left" }}>
                  {shareCardContent}
                </Box>
              </Box>
            ) : (
              <Box ref={shareContainerRef} sx={{ mb: 3 }}>
                <Box sx={{ width: SHARE_CARD_WIDTH, zoom: shareScale }}>
                  {shareCardContent}
                </Box>
              </Box>
            )}

            {/* Download */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<DownloadOutlinedIcon />}
              sx={{ borderRadius: "8px", mb: 2.5, textTransform: "none", fontWeight: 600, maxWidth: { xs: 340, sm: "none" } }}
            >
              Download stats card
            </Button>

            {/* Social share buttons */}
            <Stack direction="row" spacing={1} sx={{ width: "100%", maxWidth: { xs: 340, sm: "none" } }}>
              <Button variant="soft" size="small" startIcon={<LinkedInIcon sx={{ fontSize: 16 }} />} sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, flex: 1 }}>
                LinkedIn
              </Button>
              <Button variant="soft" size="small" startIcon={<XIcon sx={{ fontSize: 14 }} />} sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, flex: 1 }}>
                X
              </Button>
              <Button variant="soft" size="small" startIcon={<FacebookIcon sx={{ fontSize: 16 }} />} sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, flex: 1 }}>
                Facebook
              </Button>
            </Stack>
          </DialogContent>
        </Dialog>
        </>
        );
      })()}

      {/* ══ PERFORMANCE SECTION ════════════════════════════════════════════ */}
      <FlexBox sx={{ justifyContent: "space-between", alignItems: "baseline", mb: 1.5 }}>
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>Performance</Typography>
          <Typography variant="body2" color="text.secondary">
            {isNewUser
              ? "Your stats will build as you complete sessions. Here's what you'll track:"
              : isEarlyUser
                ? "You're just getting started. Stats will become richer as you complete more sessions."
                : isEvalOrMod ? "Understand trends quickly and drill into session-level patterns." : "Understand trends quickly and drill into course-level patterns."}
          </Typography>
        </Box>
      </FlexBox>

      {/* ══ ZONE 1: Ratings row (headline cross-category scan) ══════════ */}
      {(() => {
        const topRowCards = isEvalOrMod || isV1Mode ? [...ratingCards] : [...ratingCards, onTimeHeroCard];
        return (
          <>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 1, display: "block" }}>
              Ratings
            </Typography>
            <Box sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: topRowCards.length === 1 ? "1fr" : "repeat(2, 1fr)",
                sm: `repeat(${Math.min(topRowCards.length, 4)}, 1fr)`,
              },
              gap: 2, mb: 5, pb: 0.5,
            }}>
              {topRowCards.map(renderCard)}
            </Box>
          </>
        );
      })()}

      {/* ── Engagement Stats - 3-column row (all-time cumulative) ─────── */}
      {!isNewOrEarly && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: { xs: "0.875rem", sm: "1rem" }, mb: 0.5 }}>
            Engagement Stats
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
            All-time cumulative metrics since you joined.
          </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          {engagementCharts.map((chart) => (
            <Card
              key={chart.title}
              variant="outlined"
              onClick={() => setEngagementModal(chart.title)}
              sx={{
                cursor: "pointer",
                transition: "border-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease",
                "&:hover": {
                  borderColor: `color-mix(in srgb, ${chart.color} 55%, transparent)`,
                  transform: "translateY(-2px)",
                  boxShadow: `0 6px 18px -6px color-mix(in srgb, ${chart.color} 35%, transparent)`,
                },
                "&:active": { transform: "translateY(-1px)" },
              }}>
              <CardContent sx={{ p: { xs: 1.25, sm: 1.5 } }}>
                {/* Header row: title + pill CTA (mirrors Performance stat cards
                    so the click affordance is consistent across both sets) */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: { xs: 0.5, sm: 0.75 } }}>
                  <Typography variant="caption" fontWeight={700} sx={{ fontSize: { xs: "0.55rem", sm: "0.65rem" }, letterSpacing: "0.08em", textTransform: "uppercase", color: chart.color }}>
                    {chart.title}
                  </Typography>
                  <MuiTooltip title="See detailed report" arrow placement="top">
                    <IconButton
                      size="small"
                      aria-label={`See ${chart.title} report`}
                      onClick={(e) => { e.stopPropagation(); setEngagementModal(chart.title); }}
                      disableRipple
                      sx={{
                        width: 30, height: 20, borderRadius: "999px", p: 0,
                        bgcolor: `color-mix(in srgb, ${chart.color} 16%, transparent)`,
                        color: chart.color,
                        transition: "background-color 0.18s ease, transform 0.18s ease",
                        "& .arrow": { transition: "transform 0.18s ease" },
                        "&:hover": { bgcolor: `color-mix(in srgb, ${chart.color} 26%, transparent)`, "& .arrow": { transform: "translateX(2px)" } },
                        "&:active": { transform: "scale(0.96)" },
                      }}
                    >
                      <ArrowForwardIcon className="arrow" sx={{ fontSize: 12 }} />
                    </IconButton>
                  </MuiTooltip>
                </Stack>
                {/* Total value */}
                <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1, letterSpacing: "-0.02em", fontSize: { xs: "1.15rem", sm: "1.4rem" }, mb: 0.5 }}>
                  {chart.total}
                </Typography>
                <Box sx={{ width: "100%", height: { xs: 70, sm: 90 } }}>
                  <ResponsiveContainer>
                    {(() => {
                      const months = isMidUser ? midEngagementMonths : engagementMonths;
                      const tickInterval = months.length > 12 ? 11 : 0;
                      const chartData = chart.data.map((v, i) => ({ month: months[i], value: v }));
                      return (
                        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id={`grad-${chart.title.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={chart.color} stopOpacity={0.22} />
                              <stop offset="100%" stopColor={chart.color} stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="month" tick={{ fontSize: 8, fill: "hsl(var(--md-on-surface) / 0.45)" }} axisLine={false} tickLine={false} interval={tickInterval} minTickGap={12} />
                          <YAxis hide domain={["auto", "auto"]} />
                          <Tooltip
                            cursor={{ stroke: chart.color, strokeDasharray: "3 3", strokeOpacity: 0.55, strokeWidth: 1 }}
                            content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              const d = payload[0].payload;
                              return (
                                <Card variant="outlined" sx={{ p: 1, borderRadius: "8px", boxShadow: 1 }}>
                                  <Typography variant="caption" fontWeight={600} sx={{ fontSize: "0.65rem" }}>{d.month}: <b>{d.value.toLocaleString()}</b></Typography>
                                </Card>
                              );
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke={chart.color}
                            strokeWidth={2}
                            fill={`url(#grad-${chart.title.replace(/\s/g, "")})`}
                            dot={false}
                            activeDot={{ r: 5, fill: chart.color, stroke: "hsl(var(--md-surface))", strokeWidth: 2 }}
                          />
                        </AreaChart>
                      );
                    })()}
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
        </Box>
      )}

      {/* Rating trend chart (hidden - moved into Engagement Stats grid) */}
      {false && <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{  fontSize: { xs: "0.875rem", sm: "1rem" } }}>Rating trend (last 6 months)</Typography>

          {isNewOrEarly ? (
            <EmptyState
              icon={<StarOutlinedIcon />}
              title={isEarlyUser ? "Building your trend" : "No ratings yet"}
              subtitle={
                isEarlyUser
                  ? "Your rating chart needs at least 2 months of session data to display a trend"
                  : "Your rating trend will appear here after your first rated session"
              }
              compact
            />
          ) : (
            <>
              <Box sx={{ width: "100%", height: 200 }}>
                <ResponsiveContainer>
                  <LineChart data={ratingChartData} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(217, 70%, 55%)" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="hsl(217, 70%, 55%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--md-outline-variant) / 0.4)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--md-on-surface) / 0.6)" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[4.2, 5]} tick={{ fontSize: 10, fill: "hsl(var(--md-on-surface) / 0.6)" }} tickCount={5} axisLine={false} tickLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <Card variant="outlined" sx={{ p: 1.25, borderRadius: "8px", boxShadow: 1 }}>
                            <Typography variant="caption" fontWeight={600} sx={{ fontSize: "0.7rem" }}>{d.month}</Typography>
                            <Typography variant="caption" display="block" sx={{ fontSize: "0.65rem" }}>Avg: <b>{d.avg ?? "-"}</b></Typography>
                          </Card>
                        );
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="avg"
                      fill="url(#ratingGradient)"
                      stroke="none"
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="avg"
                      stroke="hsl(217, 70%, 55%)"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "hsl(217, 70%, 55%)", stroke: "hsl(var(--md-surface))", strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: "hsl(217, 70%, 55%)", stroke: "hsl(var(--md-surface))", strokeWidth: 2 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>

              <FlexBox sx={{ justifyContent: "space-between", mt: 1.5, flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, gap: { xs: 0.75, sm: 0 } }}>
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
            </>
          )}
        </CardContent>
      </Card>}

      {/* Course performance - horizontal bars (hidden for now) */}
      {false && <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <FlexBox sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>{coursePerfLabel}</Typography>
            {!isNewOrEarly && (
              <Button size="small" variant="text" sx={{ fontSize: 12, textTransform: "none", p: 0, color: "text.secondary" }} onClick={() => setShowCourseReport(true)}>
                View full
              </Button>
            )}
          </FlexBox>

          {isNewUser ? (
            <Typography variant="body2" color="text.disabled" sx={{ textAlign: "center", py: 3 }}>
              Course ratings will populate as learners submit feedback.
            </Typography>
          ) : isEarlyUser ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
              {demoCoursePerf.slice(0, 2).map((c) => (
                <FlexBox key={c.name} sx={{ alignItems: "center", gap: 1.5 }}>
                  <Typography variant="caption" sx={{ minWidth: 210, flexShrink: 0, color: "text.secondary" }}>
                    {c.name}
                  </Typography>
                  <Box sx={{ flex: 1, bgcolor: "action.hover", borderRadius: 1, height: 8, overflow: "hidden" }}>
                    <Box sx={{ height: "100%", bgcolor: "text.primary", borderRadius: 1, width: `${((c.rating - 1) / 4) * 100}%` }} />
                  </Box>
                  <Typography variant="caption" fontWeight={600} sx={{ minWidth: 28, textAlign: "right" }}>
                    {c.rating.toFixed(1)}
                  </Typography>
                </FlexBox>
              ))}
              <Typography variant="caption" color="text.disabled" sx={{ textAlign: "center", mt: 1 }}>
                More courses will appear as you teach across programs.
              </Typography>
            </Box>
          ) : (
          <>
            {/* Mobile: stacked list layout */}
            <Stack spacing={1.5} sx={{ display: { xs: "flex", sm: "none" } }}>
              {demoCoursePerf.map((c) => (
                <Box key={c.name}>
                  <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontSize: "0.72rem", color: "text.primary", fontWeight: 500 }}>
                      {c.name}
                    </Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ fontSize: "0.75rem", flexShrink: 0, ml: 1 }}>
                      {c.rating.toFixed(1)}
                    </Typography>
                  </Stack>
                  <Box sx={{ height: 6, bgcolor: "action.hover", borderRadius: 1, overflow: "hidden" }}>
                    <Box sx={{ height: "100%", bgcolor: "hsl(217, 70%, 55%)", borderRadius: 1, width: `${((c.rating - 1) / 4) * 100}%` }} />
                  </Box>
                </Box>
              ))}
            </Stack>
            {/* Desktop: horizontal bar chart */}
            <Box sx={{ display: { xs: "none", sm: "block" }, width: "100%", height: demoCoursePerf.length * 36 + 10 }}>
              <ResponsiveContainer>
                <BarChart
                  data={demoCoursePerf.map((c) => ({ ...c, shortName: c.name.length > 22 ? c.name.slice(0, 22) + "…" : c.name }))}
                  layout="vertical"
                  margin={{ top: 0, right: 40, left: 10, bottom: 0 }}
                  barCategoryGap="30%"
                >
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--md-outline-variant) / 0.3)" />
                  <XAxis type="number" domain={[0, 5]} hide />
                  <YAxis
                    type="category"
                    dataKey="shortName"
                    width={160}
                    tick={{ fontSize: 10, fill: "hsl(var(--md-on-surface) / 0.7)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--md-surface-container) / 0.3)" }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <Card variant="outlined" sx={{ p: 1.25, borderRadius: "8px", boxShadow: 1 }}>
                          <Typography variant="caption" fontWeight={600} sx={{ fontSize: "0.7rem" }}>{d.name}</Typography>
                          <Typography variant="caption" display="block" sx={{ fontSize: "0.65rem" }}>Rating: <b>{d.rating.toFixed(1)}</b></Typography>
                          {d.delta !== 0 && (
                            <Typography variant="caption" sx={{ fontSize: "0.6rem", color: d.delta > 0 ? "hsl(130, 50%, 45%)" : "hsl(0, 60%, 55%)" }}>
                              {d.delta > 0 ? "+" : ""}{d.delta.toFixed(2)} vs prev
                            </Typography>
                          )}
                        </Card>
                      );
                    }}
                  />
                  <Bar
                    dataKey="rating"
                    fill="hsl(217, 70%, 55%)"
                    radius={[0, 6, 6, 0]}
                    barSize={14}
                    label={{ position: "right", fontSize: 10, fontWeight: 600, fill: "hsl(var(--md-on-surface))", formatter: (v) => typeof v === "number" ? v.toFixed(1) : String(v) }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </>
          )}
        </CardContent>
      </Card>}

      {/* Per-category Performance blocks - one card per active role category.
          Each card holds: (1) compact clickable stat summaries (volume /
          month), (2) course x month rating matrix. Merges the old separate
          "Operational" zone with "Monthly Rating Trends" so a user sees
          everything about one category in one block (Gestalt proximity). */}
      {matricesByCategory.map(({ category, rows }) => {
        const displayRows = isNewUser
          ? rows.map((r) => ({ ...r, scores: r.scores.map(() => null) }))
          : isEarlyUser
            ? rows.slice(0, 2).map((r) => ({ ...r, scores: r.scores.map((s, i) => i === 5 ? s : null) }))
            : isMidUser
              ? rows.map((r) => ({ ...r, scores: r.scores.map((s, i) => i >= 6 ? s : null) }))
              : rows;
        const categoryStats = operationalCardsByCategory.get(category) ?? [];
        return (
          <Card key={category} variant="outlined" sx={{ mb: 3 }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: "0.95rem", sm: "1.05rem" }, mb: 2 }}>
                {category} Performance
              </Typography>

              {/* Subsection 1: KPI cards - no overline label, cards self-describe */}
              {categoryStats.length > 0 && (
                <Box sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: categoryStats.length === 1 ? "1fr" : "repeat(2, 1fr)",
                    sm: `repeat(${Math.min(categoryStats.length, 2)}, 1fr)`,
                    md: `repeat(${Math.min(categoryStats.length, 4)}, 1fr)`,
                  },
                  gap: 2,
                  mb: 3,
                }}>
                  {categoryStats.map(renderCard)}
                </Box>
              )}

              {/* Subsection 2: Avg. month-on-month Course Ratings */}
              <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ fontSize: "0.6rem", letterSpacing: "0.12em", mb: 1, display: "block" }}>
                Avg. month-on-month Course Ratings
              </Typography>
              <TableContainer>
                <Table size="small" sx={{ tableLayout: "auto" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, fontSize: { xs: 10, sm: 11 }, borderBottom: "1px solid", borderColor: "divider", pl: 0, px: { xs: 0.5, sm: 1 }, position: "sticky", left: 0, bgcolor: "background.paper", zIndex: 1 }}>
                        Course
                      </TableCell>
                      {MONTHS.map((m) => (
                        <TableCell key={m} sx={{ fontWeight: 600, fontSize: { xs: 10, sm: 11 }, textAlign: "center", borderBottom: "1px solid", borderColor: "divider", px: { xs: 0.5, sm: 1 }, whiteSpace: "nowrap" }}>
                          {m}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayRows.map((row) => (
                      <TableRow key={row.course} sx={{ "&:last-child td": { border: 0 } }}>
                        <TableCell sx={{ fontSize: { xs: 10, sm: 11 }, color: isNewOrEarly ? "text.disabled" : "text.secondary", pl: 0, whiteSpace: "nowrap", px: { xs: 0.5, sm: 1 }, position: "sticky", left: 0, bgcolor: "background.paper", zIndex: 1 }}>
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
        );
      })}


      {/* ── Edit profile dialog ───────────────────────────────────────────── */}
      <Dialog
        open={openProfileEdit}
        onClose={() => dispatch(setOpenProfileEdit(false))}
        PaperProps={{ sx: { minWidth: { xs: "auto", sm: 360 } } }}
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
          <Button variant="soft" sx={{ borderRadius: "8px" }} onClick={() => dispatch(setOpenProfileEdit(false))}>
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{ borderRadius: "8px" }}
            onClick={() => { dispatch(saveProfileEdits()); dispatch(setOpenProfileEdit(false)); }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Course Performance Report Modal ────────────────────────────────── */}
      <Dialog
        open={showCourseReport}
        onClose={() => setShowCourseReport(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px" } }}
      >
        <Box sx={{ px: 3, pt: 3, pb: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: "1.1rem", sm: "1.5rem" } }}>{coursePerfLabel}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Detailed ratings across all courses with monthly trends and learner feedback volume.
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setShowCourseReport(false)} sx={{ mt: -0.5 }}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>

          {/* Summary stats row */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, auto)" }, gap: { xs: 1.5, sm: 3 }, mt: 2.5 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Courses taught</Typography>
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>{demoCoursePerf.length}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Highest rated</Typography>
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>{demoCoursePerf[0].name.split(" ").slice(0, 2).join(" ")}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Biggest gain</Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color: "success.main", fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                +{Math.max(...demoCoursePerf.map((c) => c.delta)).toFixed(2)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Needs attention</Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color: "warning.dark", fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                {demoCoursePerf.filter((c) => c.delta < 0).length} courses
              </Typography>
            </Box>
          </Box>
        </Box>

        <DialogContent sx={{ px: 3, pt: 3 }}>
          {/* Per-course detail cards */}
          <Stack spacing={2}>
            {demoCoursePerf.map((course) => {
              const matrixRow = demoMatrix.find((m) => m.course === course.name);
              const chartData = matrixRow
                ? MONTHS.map((m, i) => ({ month: m, rating: matrixRow.scores[i] }))
                : [];
              return (
                <Card key={course.name} variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
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
                            <Typography variant="body1" fontWeight={600} sx={{ color: course.delta > 0 ? "success.main" : course.delta < 0 ? "warning.dark" : "text.secondary", display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                              {course.delta > 0 ? <TrendingUpIcon sx={{ fontSize: 16 }} /> : course.delta < 0 ? <TrendingDownIcon sx={{ fontSize: 16 }} /> : "-"} {course.delta > 0 ? "+" : ""}{course.delta.toFixed(2)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">MoM change</Typography>
                          </Box>
                          <Divider orientation="vertical" flexItem />
                          <Box>
                            {/* Rating bar */}
                            <Box sx={{ width: 120, bgcolor: "action.hover", borderRadius: 1, height: 8, overflow: "hidden" }}>
                              <Box sx={{ height: "100%", bgcolor: course.delta >= 0 ? "success.main" : "warning.main", borderRadius: 1, width: `${((course.rating - 1) / 4) * 100}%`, opacity: 0.7 }} />
                            </Box>
                            <Typography variant="caption" color="text.secondary">out of 5.0</Typography>
                          </Box>
                        </Stack>
                      </Box>

                      {/* Right: sparkline */}
                      {chartData.length > 0 && (
                        <Box sx={{ width: { xs: "100%", md: 240 }, flexShrink: 0 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem", mb: 0.5, display: "block" }}>
                            12-month trend
                          </Typography>
                          <Box sx={{ height: 60 }}>
                            <ResponsiveContainer>
                              <LineChart data={chartData} margin={{ top: 2, right: 4, left: -24, bottom: 0 }}>
                                <XAxis dataKey="month" tick={{ fontSize: 9, fill: "hsl(var(--md-on-surface-variant))" }} axisLine={false} tickLine={false} interval={1} />
                                <YAxis domain={["dataMin - 0.2", "dataMax + 0.1"]} tick={false} axisLine={false} tickLine={false} />
                                <Tooltip
                                  content={({ active, payload }) => {
                                    if (!active || !payload?.length) return null;
                                    const d = payload[0].payload;
                                    return (
                                      <Card variant="outlined" sx={{ p: 0.75, borderRadius: "8px", fontSize: "0.7rem" }}>
                                        <Typography variant="caption" fontWeight={600}>{d.month}</Typography>
                                        <Typography variant="caption" display="block">{d.rating != null ? d.rating.toFixed(1) : "-"}</Typography>
                                      </Card>
                                    );
                                  }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="rating"
                                  stroke={course.delta >= 0 ? "var(--gl-accent-primary)" : "var(--gl-status-declined-text)"}
                                  strokeWidth={1.5}
                                  dot={{ r: 2.5, fill: "hsl(var(--md-surface))", stroke: course.delta >= 0 ? "var(--gl-accent-primary)" : "var(--gl-status-declined-text)", strokeWidth: 1.5 }}
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

      {/* ── Detailed Report Drawer (right-side, full height) ──────────────── */}
      {(() => {
        const activeCard = statCards.find((c) => ((c as { id?: string }).id ?? c.label) === reportModal);
        if (!activeCard) return null;
        return (
          <Drawer
            anchor="right"
            open={!!reportModal}
            onClose={() => setReportModal(null)}
            PaperProps={{
              sx: {
                width: { xs: "100%", sm: 480 },
                maxWidth: "100vw",
                display: "flex",
                flexDirection: "column",
              },
            }}
          >
            <Box sx={{ px: 3, pt: 3, pb: 0 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: "0.08em", color: activeCard.accent, fontSize: "0.65rem" }}>
                    {activeCard.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, fontSize: { xs: "1.1rem", sm: "1.5rem" } }}>
                    {activeCard.reportTitle}
                  </Typography>
                  {activeCard.reportSummary && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {activeCard.reportSummary}
                    </Typography>
                  )}
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
                  <Typography variant="body2" sx={{ color: activeCard.deltaPositive ? "success.main" : "error.main", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                    {activeCard.deltaPositive ? <TrendingUpIcon sx={{ fontSize: 16 }} /> : <TrendingDownIcon sx={{ fontSize: 16 }} />} {activeCard.delta} <Typography component="span" variant="caption" color="text.disabled">{activeCard.deltaLabel}</Typography>
                  </Typography>
                )}
              </Stack>

              {/* Supporting stat - used by ON-TIME CONFIRMS to surface the raw average
                  confirm time (which used to be the hero on the card). Kept as a small
                  contextual line under the hero so the modal carries detail the card no
                  longer leads with. */}
              {(activeCard as any).supportingStat && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block", fontSize: "0.75rem" }}>
                  {(activeCard as any).supportingStat.label}:{" "}
                  <Typography component="span" fontWeight={700} sx={{ fontSize: "0.85rem", color: "text.primary" }}>
                    {(activeCard as any).supportingStat.value}
                  </Typography>
                </Typography>
              )}

              {/* Peer comparison - same data and sentiment logic as the inline card pill,
                  rendered here as a soft pill so the modal carries the comparison context
                  the user just clicked through from. Hidden in V1 ship scope. */}
              {!isV1Mode && activeCard.peerValue != null && (() => {
                const you = activeCard.numericValue;
                const peer = activeCard.peerValue;
                const isAhead = activeCard.lowerIsBetter ? you < peer : you > peer;
                const isEqual = Math.abs(you - peer) < 0.01;
                const diff = Math.abs(you - peer);
                // Same per-label formatting rules as the inline card peer pill.
                const labelIsPercent = activeCard.label === "AVG SESSION QUALITY"
                  || activeCard.label === "ON-TIME CONFIRMS"
                  || activeCard.label === "ON-TIME EVALUATIONS"
                  || activeCard.label === "ON-TIME MODERATIONS";
                const labelIsHours = activeCard.label === "AVG CONFIRM TIME";
                const labelIsInteger = activeCard.label === "AVG SESSIONS / MONTH"
                  || activeCard.label === "EVALUATIONS / MONTH"
                  || activeCard.label === "MODERATIONS / MONTH"
                  || activeCard.label === "LEARNERS IMPACTED";
                const diffStr = labelIsPercent
                  ? `${diff.toFixed(1)}%`
                  : labelIsHours
                    ? `${diff.toFixed(1)}h`
                    : labelIsInteger
                      ? Math.round(diff).toString()
                      : diff.toFixed(2);
                const sentiment = isEqual
                  ? "You're on par with peers"
                  : isAhead
                    ? `You're ${diffStr} ahead of peers`
                    : `${diffStr} to go to reach peer average`;
                const sentimentColor = isEqual ? "text.secondary" : isAhead ? "success.main" : "warning.dark";
                return (
                  <Box
                    sx={{
                      mt: 1.5,
                      display: "inline-flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 0.75,
                      px: 1.25,
                      py: 0.75,
                      borderRadius: "8px",
                      // Neutral background so the foreground text (sentiment color)
                      // reads clearly against it, rather than competing with a tinted
                      // card accent.
                      bgcolor: "action.hover",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                      Peer average
                    </Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ fontSize: "0.8rem" }}>
                      {activeCard.peerLabel}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 600, color: sentimentColor }}>
                      · {sentiment}
                    </Typography>
                  </Box>
                );
              })()}
            </Box>

            <Box sx={{ px: 3, pt: 2, pb: 2, flex: 1, overflowY: "auto" }}>
              {/* Expanded chart */}
              <Card variant="outlined" sx={{ borderRadius: "8px", mb: 3 }}>
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
                              <Card variant="outlined" sx={{ p: 1, borderRadius: "8px", fontSize: "0.75rem" }}>
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

              {/* Per-category breakdown removed - each category now gets its own
                  rating card on the card surface, so the drill-through drawer shows
                  one category's trend + breakdown directly. */}

              {/* Quality thresholds (moved from the card surface) - two parallel rows
                  so the user can see at a glance what share of sessions hit each rating
                  bar, alongside the target for that bar. AVG SESSION QUALITY only.
                  These benchmark fields only exist on the AVG SESSION QUALITY card,
                  so we alias `activeCard` to `any` to read them without TS narrowing. */}
              {((activeCard as any).primaryBenchmark || (activeCard as any).secondaryValue) && (() => {
                const ac = activeCard as any;
                const heroThreshold = (() => {
                  const m = (ac.description ?? "").match(/([\d.]+)/);
                  return m ? m[1] : "4.0";
                })();
                const secondaryThreshold = (() => {
                  const m = (ac.secondaryLabel ?? "").match(/([\d.]+)/);
                  return m ? m[1] : null;
                })();
                const stripTargetPrefix = (s?: string) =>
                  (s ?? "").replace(/^Target:\s*/i, "Target ");
                const parseTarget = (benchmark: string | undefined) => {
                  if (!benchmark) return null;
                  const m = benchmark.match(/([<>]=?)\s*([\d.]+)/);
                  return m ? { op: m[1], threshold: parseFloat(m[2]) } : null;
                };
                const evaluate = (you: number, t: { op: string; threshold: number } | null) => {
                  if (!t) return null;
                  return t.op === ">" ? you > t.threshold : t.op === ">=" ? you >= t.threshold : t.op === "<" ? you < t.threshold : t.op === "<=" ? you <= t.threshold : null;
                };
                const primaryMet = evaluate(ac.numericValue, parseTarget(ac.primaryBenchmark));
                const secondaryNum = ac.secondaryValue ? parseFloat(ac.secondaryValue) : null;
                const secondaryMet = secondaryNum != null ? evaluate(secondaryNum, parseTarget(ac.secondaryBenchmark)) : null;
                const Row = ({ label, you, target, met }: { label: string; you: string; target: string; met: boolean | null }) => (
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1 }}>
                    <Box sx={{ flex: 1, pr: 1 }}>
                      <Typography variant="caption" fontWeight={600} sx={{ fontSize: "0.8rem", display: "block", mb: 0.25 }}>
                        Sessions rated {label}
                      </Typography>
                      <Stack direction="row" spacing={1.5} alignItems="baseline">
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                          You <Typography component="span" fontWeight={700} sx={{ fontSize: "0.8rem", color: "text.primary", ml: 0.25 }}>{you}</Typography>
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                          {target}
                        </Typography>
                      </Stack>
                    </Box>
                    {met != null && (
                      <Chip
                        size="small"
                        label={met ? "Met" : "Below target"}
                        sx={{ fontSize: "0.65rem", fontWeight: 600, height: 22, bgcolor: met ? "success.main" : "warning.main", color: met ? "success.contrastText" : "warning.contrastText" }}
                      />
                    )}
                  </Stack>
                );
                return (
                  <Card variant="outlined" sx={{ borderRadius: "8px", mb: 3 }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
                        Quality thresholds
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.7rem", mb: 1, display: "block", lineHeight: 1.4 }}>
                        Share of your sessions that meet each rating bar. Higher is better.
                      </Typography>
                      {ac.primaryBenchmark && (
                        <Row
                          label={`${heroThreshold} or above`}
                          you={ac.value}
                          target={stripTargetPrefix(ac.primaryBenchmark)}
                          met={primaryMet}
                        />
                      )}
                      {ac.primaryBenchmark && ac.secondaryValue && (
                        <Divider sx={{ borderStyle: "dashed" }} />
                      )}
                      {ac.secondaryValue && secondaryThreshold && (
                        <Row
                          label={`${secondaryThreshold} or above`}
                          you={ac.secondaryValue}
                          target={stripTargetPrefix(ac.secondaryBenchmark)}
                          met={secondaryMet}
                        />
                      )}
                    </CardContent>
                  </Card>
                );
              })()}

            </Box>

            <Box sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider", display: "flex", justifyContent: "flex-end" }}>
              <Button variant="soft" size="small" onClick={() => setReportModal(null)}>
                Close
              </Button>
            </Box>
          </Drawer>
        );
      })()}

      {/* ── Engagement Stats detail drawer (right-side, detailed chart) ──── */}
      {(() => {
        const chart = engagementCharts.find((c) => c.title === engagementModal);
        if (!chart) return null;
        const gradientId = `grad-engagement-drawer-${chart.title.replace(/\s/g, "")}`;
        return (
          <Drawer
            anchor="right"
            open={!!engagementModal}
            onClose={() => setEngagementModal(null)}
            PaperProps={{
              sx: { width: { xs: "100%", sm: 520 }, maxWidth: "100vw", display: "flex", flexDirection: "column" },
            }}
          >
            <Box sx={{ px: 3, pt: 3, pb: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: "0.08em", color: chart.color, fontSize: "0.65rem", textTransform: "uppercase" }}>
                    {chart.title}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, fontSize: { xs: "1.1rem", sm: "1.5rem" } }}>
                    {chart.title} Report
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {chart.description}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => setEngagementModal(null)} sx={{ mt: -0.5 }}>
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Stack>

              {/* Hero total */}
              <Stack direction="row" alignItems="baseline" spacing={1.5} sx={{ mt: 2.5 }}>
                <Typography variant="h3" fontWeight={700} sx={{ letterSpacing: "-0.02em" }}>
                  {chart.total}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                  all-time cumulative
                </Typography>
              </Stack>
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto", px: 3, pb: 3 }}>
              {/* Detailed chart - much bigger, full axes, grid lines, all tick labels */}
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mt: 1, mb: 1, display: "block", letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "0.65rem" }}>
                {(() => { const m = isMidUser ? midEngagementMonths : engagementMonths; return `${m.length > 12 ? "Yearly" : "Monthly"} trend (${m[0]} – ${m[m.length - 1]})`; })()}
              </Typography>
              <Box sx={{ width: "100%", height: 320, mb: 3 }}>
                <ResponsiveContainer>
                  <LineChart
                    data={chart.data.map((v, i) => ({ month: (isMidUser ? midEngagementMonths : engagementMonths)[i], value: v }))}
                    margin={{ top: 8, right: 16, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chart.color} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={chart.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--md-outline-variant) / 0.35)" vertical={false} />
                    {(() => {
                      const m = isMidUser ? midEngagementMonths : engagementMonths;
                      const isLong = m.length > 12;
                      return (
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 10, fill: "hsl(var(--md-on-surface) / 0.6)" }}
                          axisLine={false}
                          tickLine={false}
                          ticks={isLong ? m.filter((l) => l.startsWith("Jan")) : undefined}
                          interval={isLong ? undefined : "preserveStartEnd"}
                          minTickGap={isLong ? undefined : 36}
                          tickFormatter={isLong ? (v: string) => "20" + v.slice(-2) : undefined}
                        />
                      );
                    })()}
                    <YAxis
                      tick={{ fontSize: 10, fill: "hsl(var(--md-on-surface) / 0.6)" }}
                      axisLine={false}
                      tickLine={false}
                      width={44}
                      tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)}
                    />
                    <Tooltip
                      cursor={{ stroke: chart.color, strokeDasharray: "3 3", strokeOpacity: 0.55, strokeWidth: 1 }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <Card variant="outlined" sx={{ p: 1.25, borderRadius: "8px", boxShadow: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem", display: "block" }}>
                              {d.month}
                            </Typography>
                            <Typography variant="body2" fontWeight={700} sx={{ fontSize: "0.9rem", color: chart.color }}>
                              {d.value.toLocaleString()}
                            </Typography>
                          </Card>
                        );
                      }}
                    />
                    <Area type="monotone" dataKey="value" fill={`url(#${gradientId})`} stroke="none" />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={chart.color}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 6, fill: chart.color, stroke: "hsl(var(--md-surface))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>

            </Box>

            <Box sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider", display: "flex", justifyContent: "flex-end" }}>
              <Button variant="soft" size="small" onClick={() => setEngagementModal(null)}>
                Close
              </Button>
            </Box>
          </Drawer>
        );
      })()}
    </Stack>
  );
}
