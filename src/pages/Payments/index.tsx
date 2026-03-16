import { useMemo } from "react";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import FlexBox from "@/components/Utils/FlexBox";
import { demoMonthlyEarnings } from "@/data/demo-sessions";

// ── Demo payments ─────────────────────────────────────────────────────────────
const demoPayments = [
  { session: "Deep Learning – Batch 12", type: "Live",     dur: "2h",   amount: 12000, status: "Completed", txn: "TXN-20260215-001", inv: "INV-001" },
  { session: "NLP Advanced – Batch 8",   type: "Live",     dur: "2h",   amount: 12000, status: "Completed", txn: "TXN-20260210-002", inv: "INV-002" },
  { session: "RL Workshop",              type: "Workshop", dur: "3h",   amount: 18000, status: "Pending",   txn: "–",                inv: "–" },
  { session: "MLOps Masterclass",        type: "Live",     dur: "1.5h", amount: 9000,  status: "Completed", txn: "TXN-20260201-003", inv: "INV-003" },
  { session: "Data Eng – Pipeline",      type: "Live",     dur: "2h",   amount: 12000, status: "Pending",   txn: "–",                inv: "–" },
  { session: "CV Intro Session",         type: "Recorded", dur: "1h",   amount: 6000,  status: "Completed", txn: "TXN-20260120-004", inv: "INV-004" },
];

const fmtInr = (n: number) =>
  `₹${n.toLocaleString("en-IN")}`;

export default function PaymentsPage() {
  const totalEarnings = useMemo(() => demoMonthlyEarnings.reduce((a, m) => a + m.amount, 0), []);
  const avgMonthly    = useMemo(() => Math.round(totalEarnings / demoMonthlyEarnings.length), [totalEarnings]);
  const bestMonth     = useMemo(() => demoMonthlyEarnings.reduce((a, b) => b.amount > a.amount ? b : a), []);
  const momTrend      = useMemo(() => {
    const lastTwo = demoMonthlyEarnings.slice(-2);
    return lastTwo.length === 2 ? lastTwo[1].amount - lastTwo[0].amount : 0;
  }, []);

  return (
    <>
      {/* ── Page header ── */}
      <FlexBox sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Payments</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Track your month-on-month payouts and session-wise details.
          </Typography>
        </Box>
      </FlexBox>

      {/* ── Earnings overview ── */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>Earnings</Typography>

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
                <CartesianGrid strokeDasharray="3 3" stroke="var(--mui-palette-divider, #e0e0e0)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--md-on-surface, #333)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--md-on-surface, #333)" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => [fmtInr(Number(value ?? 0)), "Earnings"]}
                  labelFormatter={(l) => `${l}`}
                  contentStyle={{ backgroundColor: "var(--md-surface, #fff)", borderColor: "var(--md-outline-variant, #e0e0e0)", borderRadius: 8, color: "var(--md-on-surface, #333)" }}
                  labelStyle={{ color: "var(--md-on-surface, #333)" }}
                  itemStyle={{ color: "var(--md-on-surface, #333)" }}
                />
                <Bar dataKey="amount" fill="var(--gl-stat-hours)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* ── Payment details table ── */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>Payment details</Typography>

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
                        startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 12 }} />}
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
    </>
  );
}
