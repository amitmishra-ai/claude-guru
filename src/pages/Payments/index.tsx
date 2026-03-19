import { useEffect, useMemo, useState } from "react";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
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
import { useAppSelector, useAppDispatch } from "@/store";
import { submitSummary } from "@/store/slices/sessionsSlice";
import { pushToast } from "@/store/slices/toastsSlice";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import FlexBox from "@/components/Utils/FlexBox";
import { demoMonthlyEarnings } from "@/data/demo-sessions";

// ── Demo payments (100 entries: 20 recent pending, 80 completed) ─────────────
const EVENT_NAMES = [
  "Deep Learning", "NLP Advanced", "RL Workshop", "MLOps Masterclass",
  "Data Eng – Pipeline", "CV Intro Session", "Statistics Foundations",
  "Python Warm-up", "SQL Practice", "Probability Refresher",
  "Feature Engineering", "Model Evaluation", "Time Series Basics",
  "Data Storytelling", "Exploratory Data Analysis", "Regression Essentials",
  "Data Viz Deep Dive", "Clustering Workshop", "Neural Networks Intro",
  "Transformer Architectures",
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
  { event: "Mentor Session: Python Fundamentals", type: "Live", dur: "2h", amount: 12000, status: "Pending review", txn: "–", inv: "–", sessionId: "c1" },
  { event: "Mentor Session: SQL Practice", type: "Live", dur: "2h", amount: 12000, status: "Pending review", txn: "–", inv: "–", sessionId: "c2" },
  { event: "Deep Learning Workshop", type: "Workshop", dur: "3h", amount: 18000, status: "Pending review", txn: "–", inv: "–", sessionId: "c4" },
  { event: "Mentor Session: Feature Engineering", type: "Live", dur: "2h", amount: 12000, status: "Pending review", txn: "–", inv: "–", sessionId: "c5" },
  { event: "NLP Advanced – Batch 3", type: "Live", dur: "2h", amount: 15000, status: "Pending review", txn: "–", inv: "–", sessionId: "c6" },
  { event: "Regression Essentials Workshop", type: "Workshop", dur: "3h", amount: 18000, status: "Pending review", txn: "–", inv: "–", sessionId: "c7" },
  { event: "Mentor Session: Data Viz Deep Dive", type: "Live", dur: "1.5h", amount: 9000, status: "Pending review", txn: "–", inv: "–", sessionId: "c8" },
  { event: "Mentor Session: Probability Refresher", type: "Live", dur: "2h", amount: 12000, status: "Pending review", txn: "–", inv: "–", sessionId: "c9" },
];

const generatedPayments = Array.from({ length: 92 }, (_, i) => {
  const idx = i + 9;
  const eventName = EVENT_NAMES[i % EVENT_NAMES.length];
  const batch = Math.ceil(idx / 5);
  const session = SESSION_TYPES[i % SESSION_TYPES.length];
  const isPending = i < 17 ? i % 2 === 0 : (i > 17 && i % 17 === 0);
  const status = isPending ? "Pending" : "Completed";
  const d = new Date(2026, 2, 15);
  d.setDate(d.getDate() - (i + 3) * 3);
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return {
    event: `${eventName} – Batch ${batch}`,
    type: session.type,
    dur: session.dur,
    amount: session.amount,
    status,
    txn: status === "Completed" ? `TXN-${dateStr}-${String(idx).padStart(3, "0")}` : "–",
    inv: status === "Completed" ? `INV-${String(idx).padStart(3, "0")}` : "–",
    sessionId: undefined as string | undefined,
  };
});

const demoPayments = [...completedSessionPayments, ...generatedPayments];

const fmtInr = (n: number) =>
  `₹${n.toLocaleString("en-IN")}`;

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

type PaymentFilter = "All" | "Completed" | "Pending";

const highlightFade = keyframes`
  0%   { background-color: hsl(var(--md-primary) / 0.18); }
  100% { background-color: transparent; }
`;

export default function PaymentsPage() {
  const dispatch = useAppDispatch();
  const summaries = useAppSelector((s) => s.sessions.summaries);
  const [searchParams, setSearchParams] = useSearchParams();
  const [highlightSessionId, setHighlightSessionId] = useState<string | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("All");
  const [page, setPage] = useState(0);
  const [chartLoading, setChartLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const rowsPerPage = 30;

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

  // Summary modal state
  const [summaryModalSessionId, setSummaryModalSessionId] = useState<string | null>(null);
  const [summaryModalTitle, setSummaryModalTitle] = useState("");
  const [summaryNotes, setSummaryNotes] = useState("");
  const [isRefining, setIsRefining] = useState(false);

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

  type SortKey = "event" | "type" | "dur" | "amount" | "status" | "txn" | "inv";
  const [sortBy, setSortBy] = useState<SortKey>("event");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
    setPage(0);
  };
  const chartData = useMemo(() => build12MonthChart(demoMonthlyEarnings), []);
  const earningsOnly = useMemo(() => chartData.filter((d) => d.amount > 0), [chartData]);
  const totalEarnings = useMemo(() => earningsOnly.reduce((a, m) => a + m.amount, 0), [earningsOnly]);
  const avgMonthly    = useMemo(() => earningsOnly.length ? Math.round(totalEarnings / earningsOnly.length) : 0, [totalEarnings, earningsOnly]);
  const bestMonth     = useMemo(() => earningsOnly.reduce((a, b) => b.amount > a.amount ? b : a, earningsOnly[0]), [earningsOnly]);
  const momTrend      = useMemo(() => {
    const lastTwo = earningsOnly.slice(-2);
    return lastTwo.length === 2 ? lastTwo[1].amount - lastTwo[0].amount : 0;
  }, [earningsOnly]);

  return (
    <>
      {/* ── Page header ── */}
      <FlexBox sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Payments</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            Track your month-on-month payouts and event-wise details.
          </Typography>
        </Box>
      </FlexBox>

      {/* ── Earnings overview + chart ── */}
      <Card variant="outlined" sx={{ mb: 2 }}>
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
                  <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>{fmtInr(totalEarnings)}</Typography>
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
                      {k.value}
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
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--md-outline-variant))", opacity: 0.15 }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const val = Number(payload[0].value ?? 0);
                    return (
                      <Chip
                        size="small"
                        label={val > 0 ? `${label} · ${fmtInr(val)}` : `${label} · –`}
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

      {/* ── Pending summary card ── */}
      {(() => {
        const pendingReview = completedSessionPayments.filter(
          (p) => p.sessionId && !summaries[p.sessionId]
        );
        if (!pendingReview.length) return null;
        return (
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <FlexBox sx={{ justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <FlexBox alignItems="center" gap={1}>
                  <Typography variant="subtitle2" fontWeight={700}>Pending session summaries</Typography>
                  <Chip
                    label={`${pendingReview.length} pending`}
                    size="small"
                    sx={{ height: 20, fontSize: 10, borderRadius: 1, fontWeight: 600, bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)" }}
                  />
                </FlexBox>
                <Typography variant="caption" color="text.secondary">Write summaries to unlock invoice processing</Typography>
              </FlexBox>
              <Stack spacing={1}>
                {pendingReview.map((p) => (
                  <FlexBox
                    key={p.sessionId}
                    sx={{
                      border: 1, borderColor: "divider", borderRadius: 1, px: 2, py: 1.25,
                      justifyContent: "space-between", alignItems: "center",
                      ...(highlightSessionId && p.sessionId === highlightSessionId
                        ? { animation: `${highlightFade} 1s ease-out forwards` }
                        : {}),
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: 12 }}>{p.event}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {p.type} · {p.dur} · {fmtInr(p.amount)}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="soft"
                      startIcon={<EditNoteOutlinedIcon sx={{ fontSize: 14 }} />}
                      onClick={() => {
                        setSummaryModalSessionId(p.sessionId);
                        setSummaryModalTitle(p.event);
                        setSummaryNotes("");
                      }}
                    >
                      Write summary
                    </Button>
                  </FlexBox>
                ))}
              </Stack>
            </CardContent>
          </Card>
        );
      })()}

      {/* ── Payment details table ── */}
      <FlexBox sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
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
        </Select>
      </FlexBox>

      <Card variant="outlined" sx={{ mb: 4 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                {([
                  { label: "Event", key: "event" },
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
              </TableRow>
            </TableHead>
            <TableBody>
              {tableLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                    <TableCell><Skeleton variant="rounded" width={48} height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width={30} /></TableCell>
                    <TableCell><Skeleton variant="text" width={60} /></TableCell>
                    <TableCell><Skeleton variant="rounded" width={64} height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width={120} /></TableCell>
                    <TableCell><Skeleton variant="text" width={56} /></TableCell>
                  </TableRow>
                ))
              ) : demoPayments
                .map((p) => {
                  // If session summary was submitted, upgrade "Pending review" → "Pending"
                  if (p.status === "Pending review" && p.sessionId && summaries[p.sessionId]) {
                    return { ...p, status: "Pending" };
                  }
                  return p;
                })
                // Exclude unsolved "Pending review" — shown in separate card above
                .filter((p) => p.status !== "Pending review")
                .filter((p) => paymentFilter === "All" || p.status === paymentFilter)
                .sort((a, b) => {
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
                    ...(highlightSessionId && p.sessionId === highlightSessionId
                      ? { animation: `${highlightFade} 1s ease-out forwards` }
                      : {}),
                  }}
                >
                  <TableCell sx={{ fontSize: 12 }}>{p.event}</TableCell>
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
                      <FlexBox alignItems="center" gap={0.5}>
                        <Button
                          size="small"
                          startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 12 }} />}
                          sx={{ fontSize: 11, textTransform: "none", p: 0, color: "text.secondary" }}
                        >
                          {p.inv}
                        </Button>
                        <IconButton size="small" sx={{ p: 0.25 }}>
                          <FileDownloadOutlinedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                        </IconButton>
                      </FlexBox>
                    ) : (
                      <Typography variant="caption" color="text.disabled">–</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </TableContainer>
        <FlexBox sx={{ justifyContent: "center", py: 1.5, borderTop: 1, borderColor: "divider" }}>
          <Pagination
            count={Math.ceil(demoPayments
              .map((p) => (p.status === "Pending review" && p.sessionId && summaries[p.sessionId]) ? { ...p, status: "Pending" } : p)
              .filter((p) => p.status !== "Pending review")
              .filter((p) => paymentFilter === "All" || p.status === paymentFilter).length / rowsPerPage)}
            page={page + 1}
            onChange={(_e, v) => setPage(v - 1)}
            size="small"
            shape="rounded"
          />
        </FlexBox>
      </Card>

      {/* ── Write summary modal ── */}
      <Dialog
        open={!!summaryModalSessionId}
        onClose={() => setSummaryModalSessionId(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.1rem", pb: 0 }}>
          Write session summary
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {summaryModalTitle}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
            Help us capture the impact you made — your notes help learners revisit key takeaways
            and help ops improve future sessions.
          </Typography>
          <TextField
            multiline
            rows={4}
            fullWidth
            size="small"
            placeholder="What stood out in this session? Note attendance, participation level, questions asked, or anything memorable..."
            value={summaryNotes}
            onChange={(e) => setSummaryNotes(e.target.value)}
            disabled={isRefining}
            sx={{ "& .MuiInputBase-input": { fontSize: "0.85rem" } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
          <Button variant="text" color="inherit" onClick={() => setSummaryModalSessionId(null)} disabled={isRefining}>
            Cancel
          </Button>
          <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="soft"
            startIcon={isRefining ? <CircularProgress size={14} color="inherit" /> : <AutoAwesomeOutlinedIcon sx={{ fontSize: 14 }} />}
            disabled={summaryNotes.trim().length < 10 || isRefining}
            onClick={async () => {
              setIsRefining(true);
              await new Promise((r) => setTimeout(r, 1200));
              const sentences = summaryNotes.trim().split(/(?<=[.!?])\s+/).filter(Boolean);
              const refined = sentences.length > 0
                ? sentences.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ") +
                  (summaryNotes.trim().endsWith(".") ? "" : ".") +
                  " Overall, learners were engaged and the session met its objectives."
                : summaryNotes.trim() + ". The session covered key topics with good learner participation and engagement.";
              setSummaryNotes(refined);
              setIsRefining(false);
              dispatch(pushToast({ title: "Summary refined", description: "Review the updated text before submitting." }));
            }}
          >
            {isRefining ? "Refining..." : "Refine with AI"}
          </Button>
          <Button
            variant="contained"
            disabled={summaryNotes.trim().length < 10 || isRefining}
            onClick={() => {
              if (!summaryModalSessionId) return;
              dispatch(submitSummary({ sessionId: summaryModalSessionId, learnerEngagementNotes: summaryNotes.trim() }));
              dispatch(pushToast({ title: "Summary submitted", description: summaryModalTitle }));
              setSummaryModalSessionId(null);
            }}
          >
            Submit
          </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
}
