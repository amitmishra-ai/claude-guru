import { useMemo, useState } from "react";
import {
  Star, TrendingUp, Users, Eye, BarChart3,
  Wallet, CreditCard, Pencil, FileText,
} from "lucide-react";
import Box from "@mui/material/Box";
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
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import FlexBox from "@/components/Utils/FlexBox";
import { ScoreCell } from "@/components/shared/ScoreCell";
import { useAppSelector, useAppDispatch } from "@/store";
import { setOpenProfileEdit, setOpenTimezone } from "@/store/slices/uiSlice";
import {
  setDraftName, setDraftMode, setDraftPrograms,
  saveProfileEdits, populateDrafts,
} from "@/store/slices/profileSlice";
import { formatGMTOffsetFromMinutesAhead, getTimeZoneOffsetMinutes } from "@/lib/helpers";
import { demoRatingHistory, demoMonthlyEarnings } from "@/data/demo-sessions";

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

// ── Demo payments ─────────────────────────────────────────────────────────────
const demoPayments = [
  { session: "Deep Learning – Batch 12", type: "Live",     dur: "2h",   amount: 12000, status: "Completed", txn: "TXN-20260215-001", inv: "INV-001" },
  { session: "NLP Advanced – Batch 8",   type: "Live",     dur: "2h",   amount: 12000, status: "Completed", txn: "TXN-20260210-002", inv: "INV-002" },
  { session: "RL Workshop",              type: "Workshop", dur: "3h",   amount: 18000, status: "Pending",   txn: "–",                inv: "–" },
  { session: "MLOps Masterclass",        type: "Live",     dur: "1.5h", amount: 9000,  status: "Completed", txn: "TXN-20260201-003", inv: "INV-003" },
  { session: "Data Eng – Pipeline",      type: "Live",     dur: "2h",   amount: 12000, status: "Pending",   txn: "–",                inv: "–" },
  { session: "CV Intro Session",         type: "Recorded", dur: "1h",   amount: 6000,  status: "Completed", txn: "TXN-20260120-004", inv: "INV-004" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtInr = (n: number) =>
  `₹${n.toLocaleString("en-IN")}`;

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

  const totalEarnings = demoMonthlyEarnings.reduce((a, m) => a + m.amount, 0);
  const avgMonthly    = Math.round(totalEarnings / demoMonthlyEarnings.length);
  const bestMonth     = demoMonthlyEarnings.reduce((a, b) => b.amount > a.amount ? b : a);
  const lastTwo       = demoMonthlyEarnings.slice(-2);
  const momTrend      = lastTwo.length === 2 ? lastTwo[1].amount - lastTwo[0].amount : 0;

  // KPI tiles config for Performance
  const kpiTiles = [
    { icon: <Star size={14} />, label: "Avg rating",     value: avgRating,  delta: "+0.12 MoM", deltaColor: "success.main" },
    { icon: <Eye size={14} />,  label: "Rated sessions", value: demoRatingHistory.length, delta: null },
    { icon: <Users size={14} />,label: "Coverage",       value: "92%",      delta: null },
    { icon: <TrendingUp size={14} />, label: "NPS proxy",value: 74,         delta: null },
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
        <Button
          variant="soft"
          size="small"
          startIcon={<Pencil size={14} />}
          sx={{ borderRadius: 1, flexShrink: 0, mt: 0.5 }}
          onClick={() => { dispatch(populateDrafts()); dispatch(setOpenProfileEdit(true)); }}
        >
          Edit profile
        </Button>
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
          <Typography variant="caption" color="text.disabled" sx={{ mt: 2, display: "block" }}>
            Profile editing is not yet available in this prototype. Use the Edit button to update name, mode, and programs.
          </Typography>
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

      {/* KPI tiles */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mb: 3 }}>
        {kpiTiles.map((t) => (
          <Card key={t.label} variant="outlined" sx={{  }}>
            <CardContent sx={{ p: 2 }}>
              <FlexBox sx={{ alignItems: "center", gap: 0.75, mb: 1, color: "text.secondary" }}>
                {t.icon}
                <Typography variant="caption" color="text.secondary">{t.label}</Typography>
              </FlexBox>
              <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1 }}>
                {t.value}
              </Typography>
              {t.delta && (
                <Typography variant="caption" sx={{ color: "success.main", fontWeight: 500 }}>
                  ↗ {t.delta}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Rating trend chart */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <FlexBox sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>Rating trend (last 6 months)</Typography>
            <FlexBox sx={{ gap: 0.5 }}>
              {(["course", "program"] as const).map((v) => (
                <Button
                  key={v}
                  size="small"
                  variant={ratingView === v ? "contained" : "text"}
                  onClick={() => setRatingView(v)}
                  sx={{
                    borderRadius: 1,
                    textTransform: "capitalize",
                    fontSize: 12,
                    minWidth: 0,
                    px: 1.5,
                    py: 0.25,
                    ...(ratingView !== v && { color: "text.secondary" }),
                  }}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </Button>
              ))}
            </FlexBox>
          </FlexBox>

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
              <Chip label={`Avg ${avgRating}`} size="small" sx={{ fontWeight: 600, fontSize: 11, height: 22, bgcolor: "action.selected" }} />
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
            <Button size="small" variant="text" sx={{ fontSize: 12, textTransform: "none", p: 0, color: "text.secondary" }}>
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

      {/* ══ EARNINGS SECTION ═══════════════════════════════════════════════ */}
      <FlexBox sx={{ justifyContent: "space-between", alignItems: "baseline", mb: 1.5 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Earnings</Typography>
          <Typography variant="body2" color="text.secondary">
            Track your month-on-month payouts and total earnings.
          </Typography>
        </Box>
      </FlexBox>

      {/* Earnings total + KPI row */}
      <FlexBox sx={{ alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>{fmtInr(totalEarnings)}</Typography>
          <Typography variant="caption" color="text.secondary">Total earnings</Typography>
        </Box>
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        {[
          { label: "Avg/month",  value: fmtInr(avgMonthly) },
          { label: "Best month", value: `${bestMonth.label} (${fmtInr(bestMonth.amount)})` },
          { label: "MoM trend",  value: (momTrend >= 0 ? "+" : "") + fmtInr(momTrend), color: momTrend >= 0 ? "success.main" : "error.main" },
        ].map((k) => (
          <Box key={k.label} sx={{ minWidth: 130 }}>
            <Typography variant="caption" color="text.secondary">{k.label}</Typography>
            <Typography variant="body2" fontWeight={600} sx={{ color: (k as any).color ?? "text.primary" }}>
              {k.value}
            </Typography>
          </Box>
        ))}
      </FlexBox>

      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={demoMonthlyEarnings} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--md-outline-variant))" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--md-on-surface))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--md-on-surface))" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => [fmtInr(Number(value ?? 0)), "Earnings"]}
                  labelFormatter={(l) => `${l}`}
                  contentStyle={{ backgroundColor: "hsl(var(--md-surface))", borderColor: "hsl(var(--md-outline-variant))", borderRadius: 8, color: "hsl(var(--md-on-surface))" }}
                  labelStyle={{ color: "hsl(var(--md-on-surface))" }}
                  itemStyle={{ color: "hsl(var(--md-on-surface))" }}
                />
                <Bar dataKey="amount" fill="var(--gl-stat-hours)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* ══ PAYMENTS SECTION ═══════════════════════════════════════════════ */}
      <FlexBox sx={{ justifyContent: "space-between", alignItems: "baseline", mb: 1.5 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Payments</Typography>
          <Typography variant="body2" color="text.secondary">
            Session-wise payout details and status.
          </Typography>
        </Box>
      </FlexBox>

      <Card variant="outlined" sx={{ mb: 4 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                {["Session", "Type", "Duration", "Amount", "Status", "Transaction ID", "Invoice"].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 600, fontSize: 11, color: "text.secondary", py: 1.25 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {demoPayments.map((p, i) => (
                <TableRow key={i} sx={{ "&:last-child td": { border: 0 } }}>
                  <TableCell sx={{ fontSize: 12 }}>{p.session}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>
                    <Chip
                      label={p.type}
                      size="small"
                      sx={{ height: 20, fontSize: 10, borderRadius: 1 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{p.dur}</TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>{fmtInr(p.amount)}</TableCell>
                  <TableCell>
                    <Chip
                      label={p.status}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: 10,
                        borderRadius: 1,
                        fontWeight: 500,
                        ...(p.status === "Completed"
                          ? { bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)" }
                          : { bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)" }),
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: 11, fontFamily: "monospace", color: "text.secondary" }}>
                    {p.txn}
                  </TableCell>
                  <TableCell>
                    {p.inv !== "–" ? (
                      <Button
                        size="small"
                        startIcon={<FileText size={12} />}
                        sx={{ fontSize: 11, textTransform: "none", p: 0, color: "text.secondary" }}
                      >
                        {p.inv}
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.disabled">–</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
    </>
  );
}
