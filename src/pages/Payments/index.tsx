import { useEffect, useMemo, useState } from "react";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import Switch from "@mui/material/Switch";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MuiTooltip from "@mui/material/Tooltip";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableSortLabel from "@mui/material/TableSortLabel";
import TableHead from "@mui/material/TableHead";
import Pagination from "@mui/material/Pagination";
import TableRow from "@mui/material/TableRow";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useSearchParams } from "react-router-dom";
import { keyframes } from "@mui/system";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import { useAppSelector, useAppDispatch } from "@/store";
import { EmptyState } from "@/components/shared/EmptyState";
import { MobilePageHeader } from "@/components/layout/MobilePageHeader";
import { pushToast } from "@/store/slices/toastsSlice";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import FlexBox from "@/components/Utils/FlexBox";
import { demoMonthlyEarnings } from "@/data/demo-sessions";

// ── Demo payments (100 entries: 20 recent pending, 80 completed) ─────────────
const EVENT_NAMES = [
  "Mentor Session: Intro to Machine Learning",
  "Mentor Session: Linear Regression Deep Dive",
  "Workshop: Data Visualization with Python",
  "Mentor Session: Probability for ML",
  "Mentor Session: EDA with Pandas",
  "Mentor Session: Decision Trees & Ensembles",
  "Workshop: NLP Fundamentals",
  "Mentor Session: Logistic Regression",
  "Mentor Session: Clustering Techniques",
  "Mentor Session: Time Series Basics",
  "Mentor Session: Dimensionality Reduction",
  "Workshop: Model Deployment with Flask",
  "Mentor Session: CNNs for Image Classification",
  "Mentor Session: Recommendation Systems",
  "Mentor Session: RNNs & LSTMs",
  "Workshop: GANs & Generative AI",
  "Mentor Session: SQL Window Functions",
  "Mentor Session: A/B Testing & Experimentation",
  "Mentor Session: XGBoost Masterclass",
  "Workshop: End-to-End ML Pipeline",
];
const SESSION_TYPES: { type: string; dur: string; amount: number }[] = [
  { type: "Live", dur: "2h", amount: 12000 },
  { type: "Live", dur: "1.5h", amount: 9000 },
  { type: "Workshop", dur: "3h", amount: 18000 },
  { type: "Recorded", dur: "1h", amount: 6000 },
  { type: "Live", dur: "2h", amount: 15000 },
];

// Payments linked to completed sessions (need summary)
const completedSessionPayments = [
  { event: "Mentor Session: Capstone Project Review", date: "14 Feb 2026", type: "Live", dur: "2h", amount: 12000, status: "Pending", txn: "–", inv: "–", sessionId: "ch30", _date: new Date("2026-02-14") },
  { event: "Mentor Session: Python Fundamentals", date: "12 Feb 2026", type: "Live", dur: "2h", amount: 12000, status: "Pending", txn: "–", inv: "–", sessionId: "c1", _date: new Date("2026-02-12") },
  { event: "Mentor Session: SQL Practice", date: "10 Feb 2026", type: "Live", dur: "2h", amount: 12000, status: "Pending", txn: "–", inv: "–", sessionId: "c2", _date: new Date("2026-02-10") },
  { event: "Workshop: LLM Fine-tuning", date: "9 Feb 2026", type: "Workshop", dur: "3h", amount: 18000, status: "Pending", txn: "–", inv: "–", sessionId: "ch29", _date: new Date("2026-02-09") },
  { event: "Mentor Session: Statistics Foundations", date: "8 Feb 2026", type: "Live", dur: "2h", amount: 12000, status: "Completed", txn: "TXN-GL-9X2M7P", inv: "INV-2026-0208-001", sessionId: "c3", _date: new Date("2026-02-08") },
  { event: "Mentor Session: MLOps Best Practices", date: "6 Feb 2026", type: "Live", dur: "2h", amount: 12000, status: "Completed", txn: "TXN-GL-CC3DD4", inv: "INV-2026-0206-001", sessionId: "ch28", _date: new Date("2026-02-06") },
  { event: "Deep Learning Workshop", date: "5 Feb 2026", type: "Workshop", dur: "3h", amount: 18000, status: "Completed", txn: "TXN-GL-DL0205", inv: "INV-2026-0205-001", sessionId: "c4", _date: new Date("2026-02-05") },
  { event: "Mentor Session: Graph Neural Networks", date: "3 Feb 2026", type: "Live", dur: "2h", amount: 12000, status: "Completed", txn: "TXN-GL-BB2CC3", inv: "INV-2026-0203-001", sessionId: "ch27", _date: new Date("2026-02-03") },
  { event: "Mentor Session: Data Ethics & Bias", date: "1 Feb 2026", type: "Live", dur: "2h", amount: 12000, status: "Completed", txn: "TXN-GL-AA1BB2", inv: "INV-2026-0201-001", sessionId: "ch26", _date: new Date("2026-02-01") },
];

const generatedPayments = Array.from({ length: 92 }, (_, i) => {
  const idx = i + 9;
  const eventName = EVENT_NAMES[i % EVENT_NAMES.length];
  const cohorts = ["PGP-DS", "PGP-AIML", "PGP-SE", "PGP-BA", "AIML Online"];
  const cohort = cohorts[i % cohorts.length];
  const batch = Math.ceil(idx / 5);
  const session = SESSION_TYPES[i % SESSION_TYPES.length];
  const isPending = i < 17 ? i % 2 === 0 : (i > 17 && i % 17 === 0);
  const status = isPending ? "Pending" : "Completed";
  const d = new Date(2026, 2, 15);
  d.setDate(d.getDate() - (i + 3) * 3);
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const fmtDate = `${d.getDate()} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]} ${d.getFullYear()}`;
  return {
    event: `${eventName} – ${cohort} ${batch}`,
    date: fmtDate,
    type: session.type,
    dur: session.dur,
    amount: session.amount,
    status,
    txn: status === "Completed" ? `TXN-${dateStr}-${String(idx).padStart(3, "0")}` : "–",
    inv: status === "Completed" ? `INV-${String(idx).padStart(3, "0")}` : "–",
    sessionId: undefined as string | undefined,
    _date: d,
  };
});

const demoPayments = [...completedSessionPayments, ...generatedPayments];

const fmtInr = (n: number) =>
  `₹${n.toLocaleString("en-IN")}`;

const maskValue = (val: string) => val.replace(/[0-9]/g, "•");

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Show 12 months starting from the guru's first earning month. Empty future months get amount 0. */
function build12MonthChart(earnings: typeof demoMonthlyEarnings) {
  if (!earnings.length) return [];

  // Start from the guru's first month
  const firstKey = earnings[0].key; // e.g. "2025-10"
  const [firstY, firstM] = firstKey.split("-").map(Number);

  const result: { key: string; label: string; amount: number }[] = [];
  for (let i = 0; i < 12; i++) {
    let m = firstM + i;
    let y = firstY;
    while (m > 12) { m -= 12; y++; }
    const key = `${y}-${String(m).padStart(2, "0")}`;
    const label = `${MONTH_SHORT[m - 1]} ${String(y).slice(-2)}`;
    const existing = earnings.find((e) => e.key === key);
    result.push({ key, label, amount: existing?.amount ?? 0 });
  }
  return result;
}

type PaymentFilter = "All" | "Completed" | "Pending" | "Disputed";

const highlightFade = keyframes`
  0%   { background-color: hsl(var(--md-primary) / 0.18); }
  100% { background-color: transparent; }
`;

export default function PaymentsPage() {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [highlightSessionId, setHighlightSessionId] = useState<string | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("All");
  const [page, setPage] = useState(0);
  const [chartLoading, setChartLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [showNumbers, setShowNumbers] = useState(false);
  const rowsPerPage = 30;

  // Dispute state
  const [disputes, setDisputes] = useState<Record<number, { reason: string; notes: string }>>({});
  const [disputeModal, setDisputeModal] = useState<{ index: number; event: string; amount: number } | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeNotes, setDisputeNotes] = useState("");
  const [isRefiningDispute, setIsRefiningDispute] = useState(false);
  const disputeCutoff = new Date("2025-12-18"); // 60 days before demoNow (2026-02-16)

  // Pick up highlight param from URL
  useEffect(() => {
    const id = searchParams.get("highlight");
    if (id) {
      setHighlightSessionId(id);
      setSearchParams({}, { replace: true });
      const t = setTimeout(() => setHighlightSessionId(null), 1500);
      return () => clearTimeout(t);
    }
  }, [searchParams, setSearchParams]);

  // Simulate initial page load
  useEffect(() => {
    const t = setTimeout(() => setChartLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  // Simulate table loading on page/filter change
  useEffect(() => {
    setTableLoading(true);
    const t = setTimeout(() => setTableLoading(false), 600);
    return () => clearTimeout(t);
  }, [page, paymentFilter]);

  type SortKey = "event" | "date" | "type" | "dur" | "amount" | "status" | "txn" | "inv";
  const [sortBy, setSortBy] = useState<SortKey>("event");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const guruStage = useAppSelector((s) => s.devPanel.guruStage);
  const isEmpty = guruStage === "empty";

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
    setPage(0);
  };
  const _chartData = useMemo(() => build12MonthChart(demoMonthlyEarnings), []);
  const chartData = isEmpty ? _chartData.map((d) => ({ ...d, amount: 0 })) : _chartData;
  const earningsOnly = useMemo(() => chartData.filter((d) => d.amount > 0), [chartData]);
  const totalEarnings = useMemo(() => earningsOnly.reduce((a, m) => a + m.amount, 0), [earningsOnly]);
  const avgMonthly    = useMemo(() => earningsOnly.length ? Math.round(totalEarnings / earningsOnly.length) : 0, [totalEarnings, earningsOnly]);
  const bestMonth     = useMemo(() => earningsOnly.length ? earningsOnly.reduce((a, b) => b.amount > a.amount ? b : a, earningsOnly[0]) : { label: "-", amount: 0 }, [earningsOnly]);
  const momTrend      = useMemo(() => {
    const lastTwo = earningsOnly.slice(-2);
    return lastTwo.length === 2 ? lastTwo[1].amount - lastTwo[0].amount : 0;
  }, [earningsOnly]);

  return (
    <>
      <MobilePageHeader title="Payments" />
      {/* ── Page header ── */}
      <FlexBox sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ display: { xs: "none", sm: "block" } }}>Payments</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            Track your month-on-month payouts and event-wise details.
          </Typography>
        </Box>
        <FlexBox
          component="label"
          sx={{
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            userSelect: "none",
            bgcolor: showNumbers ? "action.hover" : "transparent",
            border: "1px solid",
            borderColor: showNumbers ? "text.disabled" : "divider",
            borderRadius: "20px",
            pl: 1.5,
            pr: 0.5,
            py: 0.25,
            transition: "all 0.2s ease",
          }}
        >
          <VisibilityOffOutlinedIcon sx={{ fontSize: 16, color: "text.secondary", opacity: showNumbers ? 1 : 0.5, transition: "opacity 0.2s" }} />
          <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 600, color: "text.secondary", whiteSpace: "nowrap" }}>
            Show values
          </Typography>
          <Switch
            size="small"
            checked={showNumbers}
            onChange={() => setShowNumbers((v) => !v)}
            sx={{
              width: 32,
              height: 18,
              p: 0,
              "& .MuiSwitch-switchBase": {
                p: "2px",
                "&.Mui-checked": {
                  transform: "translateX(14px)",
                  "& + .MuiSwitch-track": { bgcolor: "primary.main", opacity: 0.35 },
                },
              },
              "& .MuiSwitch-thumb": { width: 14, height: 14, boxShadow: "none" },
              "& .MuiSwitch-track": { borderRadius: 9, bgcolor: "action.disabled", opacity: 1 },
            }}
          />
        </FlexBox>
      </FlexBox>

      {/* ── Earnings overview + chart ── */}
      <Card variant="outlined" sx={{ mb: 1 }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          {chartLoading ? (
            <>
              <FlexBox sx={{ alignItems: "center", gap: 2, mb: 1.5, flexWrap: "wrap" }}>
                <Box>
                  <Skeleton variant="text" width={160} height={36} />
                  <Skeleton variant="text" width={80} height={16} />
                </Box>
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                {[1, 2, 3].map((k) => (
                  <Box key={k} sx={{ minWidth: 100 }}>
                    <Skeleton variant="text" width={60} height={14} />
                    <Skeleton variant="text" width={90} height={18} />
                  </Box>
                ))}
              </FlexBox>
              <Skeleton variant="rounded" width="100%" height={160} />
            </>
          ) : (
            <>
              <FlexBox sx={{ alignItems: "center", gap: 2, mb: 1.5, flexWrap: "wrap" }}>
                <Box>
                  <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>{showNumbers ? fmtInr(totalEarnings) : maskValue(fmtInr(totalEarnings))}</Typography>
                  <Typography variant="caption" color="text.secondary">Total earnings</Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                {[
                  { label: "Avg/month",  value: fmtInr(avgMonthly) },
                  { label: "Best month", value: `${bestMonth.label} (${fmtInr(bestMonth.amount)})` },
                  { label: "MoM trend",  value: (momTrend >= 0 ? "+" : "") + fmtInr(momTrend), color: momTrend >= 0 ? "success.main" : "error.main" },
                ].map((k) => (
                  <Box key={k.label} sx={{ minWidth: 100 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>{k.label}</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: (k as any).color ?? "text.primary", fontSize: "0.8rem" }}>
                      {showNumbers ? k.value : maskValue(k.value)}
                    </Typography>
                  </Box>
                ))}
              </FlexBox>
              <Box sx={{ width: "100%", height: 160 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--md-outline-variant))" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "hsl(var(--md-on-surface))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--md-on-surface))" }}
                  tickFormatter={(v) => showNumbers ? `${(v / 1000).toFixed(0)}k` : "••"}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--md-outline-variant))", opacity: 0.15 }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const val = Number(payload[0].value ?? 0);
                    const amtStr = val > 0 ? fmtInr(val) : "–";
                    return (
                      <Chip
                        size="small"
                        label={`${label} · ${showNumbers ? amtStr : maskValue(amtStr)}`}
                        sx={{
                          fontSize: 11,
                          fontWeight: 600,
                          height: 24,
                          bgcolor: "background.paper",
                          border: 1,
                          borderColor: "divider",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                        }}
                      />
                    );
                  }}
                />
                <Bar
                  dataKey="amount"
                  radius={[4, 4, 0, 0]}
                  fill="var(--gl-stat-hours)"
                  fillOpacity={0.85}
                  activeBar={{ fillOpacity: 1 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Payment details table ── */}
      {isEmpty ? (
        <>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Payment details</Typography>
        <Box sx={{ mb: 4 }}>
          <EmptyState
            icon={<SavingsOutlinedIcon />}
            title="No payments recorded yet"
            subtitle="Activity-wise payment details, transaction IDs, and invoices will appear here post completion"
          />
        </Box>
        </>
      ) : (
      <>
      <FlexBox sx={{ justifyContent: "space-between", alignItems: "center", mb: 0 }}>
        <Typography variant="subtitle1" fontWeight={700}>Payment details</Typography>
        <Select
          value={paymentFilter}
          onChange={(e) => { setPaymentFilter(e.target.value as PaymentFilter); setPage(0); }}
          size="small"
          sx={{ fontSize: "0.8rem", height: 32, minWidth: 120 }}
        >
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Disputed">Disputed</MenuItem>
        </Select>
      </FlexBox>

      <Card variant="outlined" sx={{ mb: 4 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                {([
                  { label: "Event", key: "event" },
                  { label: "Date", key: "date" },
                  { label: "Type", key: "type" },
                  { label: "Duration", key: "dur" },
                  { label: "Amount", key: "amount" },
                  { label: "Status", key: "status" },
                  { label: "Transaction ID", key: "txn" },
                  { label: "Invoice", key: "inv" },
                ] as { label: string; key: SortKey }[]).map((h) => (
                  <TableCell key={h.key} sx={{ fontWeight: 600, fontSize: 11, color: "text.secondary", py: 1.25 }} sortDirection={sortBy === h.key ? sortDir : false}>
                    <TableSortLabel
                      active={sortBy === h.key}
                      direction={sortBy === h.key ? sortDir : "asc"}
                      onClick={() => handleSort(h.key)}
                      sx={{ "& .MuiTableSortLabel-icon": { fontSize: 14 } }}
                    >
                      {h.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell sx={{ fontWeight: 600, fontSize: 11, color: "text.secondary", py: 1.25, width: 48 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {tableLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                    <TableCell><Skeleton variant="text" width={70} /></TableCell>
                    <TableCell><Skeleton variant="rounded" width={48} height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width={30} /></TableCell>
                    <TableCell><Skeleton variant="text" width={60} /></TableCell>
                    <TableCell><Skeleton variant="rounded" width={64} height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width={120} /></TableCell>
                    <TableCell><Skeleton variant="text" width={56} /></TableCell>
                  </TableRow>
                ))
              ) : demoPayments
                .map((p, origIdx) => ({ ...(p.status === "Pending review" ? { ...p, status: "Pending" } : p), _idx: origIdx }))
                .map((p) => disputes[p._idx] ? { ...p, status: "Disputed" } : p)
                .filter((p) => paymentFilter === "All" || p.status === paymentFilter)
                .sort((a, b) => {
                  if (sortBy === "date") {
                    const cmp = ((a as { _date?: Date })._date?.getTime() ?? 0) - ((b as { _date?: Date })._date?.getTime() ?? 0);
                    return sortDir === "asc" ? cmp : -cmp;
                  }
                  const av = a[sortBy];
                  const bv = b[sortBy];
                  const cmp = typeof av === "number" ? av - (bv as number) : String(av).localeCompare(String(bv));
                  return sortDir === "asc" ? cmp : -cmp;
                })
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((p, i) => (
                <TableRow
                  key={i}
                  sx={{
                    "&:last-child td": { border: 0 },
                    "& .flag-action": { opacity: 1, transition: "color 0.15s ease" },
                    "& .flag-action svg": { color: "text.disabled" },
                    "&:hover .flag-action svg": { color: "warning.main" },
                    ...(highlightSessionId && p.sessionId === highlightSessionId
                      ? { animation: `${highlightFade} 1s ease-out forwards` }
                      : {}),
                  }}
                >
                  <TableCell sx={{ fontSize: 12, maxWidth: 280 }} title={p.event}>
                    <Typography variant="body2" sx={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.event}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: 11, color: "text.secondary", whiteSpace: "nowrap" }}>{p.date}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>
                    <Chip
                      label={p.type}
                      size="small"
                      sx={{ height: 20, fontSize: 10, borderRadius: 1 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{p.dur}</TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>{showNumbers ? fmtInr(p.amount) : maskValue(fmtInr(p.amount))}</TableCell>
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
                          : p.status === "Disputed"
                            ? { bgcolor: "var(--gl-status-disputed-bg)", color: "var(--gl-status-disputed-text)" }
                            : { bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)" }),
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: 11, fontFamily: "monospace", color: "text.secondary", maxWidth: 110 }}>
                    <MuiTooltip title={showNumbers && p.txn !== "–" ? p.txn : ""} arrow enterDelay={400} slotProps={{ tooltip: { sx: { fontSize: "0.75rem", fontWeight: 500, py: 0.75, px: 1.5, borderRadius: "8px" } } }}>
                      <Typography variant="body2" sx={{ fontSize: 11, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {showNumbers ? p.txn : (p.txn === "–" ? "–" : maskValue(p.txn))}
                      </Typography>
                    </MuiTooltip>
                  </TableCell>
                  <TableCell>
                    {p.inv !== "–" ? (
                      <FlexBox alignItems="center" gap={0.5}>
                        <Button
                          size="small"
                          startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 12 }} />}
                          sx={{ fontSize: 11, textTransform: "none", p: 0, color: "text.secondary" }}
                        >
                          {showNumbers ? (p.inv.length > 7 ? `${p.inv.slice(0, 7)}…` : p.inv) : maskValue(p.inv.length > 7 ? `${p.inv.slice(0, 7)}…` : p.inv)}
                        </Button>
                        <IconButton size="small" sx={{ p: 0.25 }}>
                          <FileDownloadOutlinedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                        </IconButton>
                      </FlexBox>
                    ) : (
                      <Typography variant="caption" color="text.disabled">–</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ px: 0.5 }}>
                    {(() => {
                      const paymentDate = (p as { _date?: Date })._date;
                      const isRecent = paymentDate ? paymentDate >= disputeCutoff : false;
                      const isDisputed = !!disputes[(p as { _idx: number })._idx];

                      if (isDisputed) {
                        return (
                          <MuiTooltip title={`Reason: ${disputes[(p as { _idx: number })._idx].reason}`} arrow>
                            <InfoOutlinedIcon sx={{ fontSize: 16, color: "var(--gl-status-disputed-text)", cursor: "pointer" }} />
                          </MuiTooltip>
                        );
                      }
                      if (isRecent) {
                        return (
                            <IconButton
                              size="small"
                              className="flag-action"
                              title="Report incorrect value"
                              sx={{ p: 0.25 }}
                              onClick={() => {
                                setDisputeModal({ index: (p as { _idx: number })._idx, event: p.event, amount: p.amount });
                                setDisputeReason("");
                                setDisputeNotes("");
                              }}
                            >
                              <FlagOutlinedIcon sx={{ fontSize: 16, color: "warning.main" }} />
                            </IconButton>
                        );
                      }
                      return null;
                    })()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </TableContainer>
        <FlexBox sx={{ justifyContent: "center", py: 1.5, borderTop: 1, borderColor: "divider" }}>
          <Pagination
            count={Math.ceil(demoPayments
              .map((p) => p.status === "Pending review" ? { ...p, status: "Pending" } : p)
              .filter((p) => paymentFilter === "All" || p.status === paymentFilter).length / rowsPerPage)}
            page={page + 1}
            onChange={(_e, v) => setPage(v - 1)}
            size="small"
            shape="rounded"
          />
        </FlexBox>
      </Card>
      </>
      )}

      {/* ── Dispute Modal ── */}
      <Dialog
        open={!!disputeModal}
        onClose={() => setDisputeModal(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", pb: 0.5 }}>Report payment issue</DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          {disputeModal && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">Session</Typography>
                <Typography variant="body2" fontWeight={600}>{disputeModal.event}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Amount</Typography>
                <Typography variant="body2" fontWeight={600}>{showNumbers ? fmtInr(disputeModal.amount) : maskValue(fmtInr(disputeModal.amount))}</Typography>
              </Box>
              <FormControl size="small" fullWidth>
                <InputLabel>Reason</InputLabel>
                <Select
                  label="Reason"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                >
                  <MenuItem value="Incorrect amount">Incorrect amount</MenuItem>
                  <MenuItem value="Wrong session duration">Wrong session duration</MenuItem>
                  <MenuItem value="Missing payment">Missing payment</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <Box>
                <TextField
                  label="Additional notes"
                  placeholder="Describe the issue..."
                  multiline
                  rows={3}
                  size="small"
                  fullWidth
                  value={disputeNotes}
                  onChange={(e) => setDisputeNotes(e.target.value)}
                />
                <Button
                  size="small"
                  variant="text"
                  startIcon={isRefiningDispute
                    ? <Box sx={{ width: 14, height: 14, border: "2px solid", borderColor: "primary.main", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", "@keyframes spin": { to: { transform: "rotate(360deg)" } } }} />
                    : <AutoAwesomeOutlinedIcon sx={{ fontSize: 14 }} />
                  }
                  disabled={!disputeNotes.trim() || isRefiningDispute}
                  onClick={() => {
                    setIsRefiningDispute(true);
                    const refinedResponses: Record<string, string> = {
                      "Incorrect amount": `The payment of ${disputeModal ? fmtInr(disputeModal.amount) : ""} for "${disputeModal?.event}" does not match the agreed rate. ${disputeNotes.trim() ? `Specifically: ${disputeNotes.trim()}.` : ""} Requesting a review and correction of the invoiced amount.`,
                      "Wrong session duration": `The recorded duration for "${disputeModal?.event}" is inaccurate. ${disputeNotes.trim() ? `Details: ${disputeNotes.trim()}.` : ""} Please verify the session logs and update the duration accordingly.`,
                      "Missing payment": `Payment for "${disputeModal?.event}" has not been received or reflected in the records. ${disputeNotes.trim() ? `Additional context: ${disputeNotes.trim()}.` : ""} Kindly investigate and process the outstanding payment.`,
                      "Other": disputeNotes.trim() ? `Regarding "${disputeModal?.event}": ${disputeNotes.trim()}. Please review and take appropriate action.` : disputeNotes,
                    };
                    setTimeout(() => {
                      setDisputeNotes(refinedResponses[disputeReason] ?? disputeNotes);
                      setIsRefiningDispute(false);
                    }, 1200);
                  }}
                  sx={{ mt: 0.5, textTransform: "none", fontSize: "0.75rem" }}
                >
                  {isRefiningDispute ? "Refining..." : "Refine with AI"}
                </Button>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="text" color="inherit" onClick={() => setDisputeModal(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!disputeReason}
            onClick={() => {
              if (!disputeModal) return;
              setDisputes((prev) => ({ ...prev, [disputeModal.index]: { reason: disputeReason, notes: disputeNotes } }));
              dispatch(pushToast({ title: "Issue reported", description: `${disputeModal.event} has been flagged for review.` }));
              setDisputeModal(null);
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
