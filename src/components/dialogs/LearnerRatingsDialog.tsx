import { useState } from "react";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { blue, green, grey, orange, red } from "@mui/material/colors";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useAppSelector, useAppDispatch } from "@/store";
import { setOpenLearnerRatings, setLearnerRatingsSessionId } from "@/store/slices/uiSlice";
import { demoLearnerRatingsBySessionId, demoFeedbackSummaryBySessionId } from "@/data/demo-sessions";

/* ── Palette — MUI color tokens ── */
const C = {
  five: green[400],
  four: orange[400],
  three: red[400],
} as const;

type Filter = "5star" | "4star" | "3below";

/* ── Card shell — uses theme tokens, not hardcoded colors ── */
function Card({ children, sx }: { children: React.ReactNode; sx?: object }) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        p: 2.5,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

/* ── Dot legend ── */
function Dot({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>{label}</Typography>
    </Stack>
  );
}

/* ── Stacked bar row ── */
function ParamRow({ label, five, four, three, maxTotal }: {
  label: string; five: number; four: number; three: number; maxTotal: number;
}) {
  const total = five + four + three;
  if (total === 0) return null;
  const barWidthPct = maxTotal > 0 ? (total / maxTotal) * 100 : 100;
  const segs = [
    { v: five, c: C.five, tc: "#1b3a1b" },
    { v: four, c: C.four, tc: "#3e2600" },
    { v: three, c: C.three, tc: "#fff" },
  ].filter((s) => s.v > 0);

  return (
    <Box sx={{ mb: 2, "&:last-child": { mb: 0 } }}>
      <Typography variant="caption" sx={{ fontSize: "0.74rem", fontWeight: 500, mb: 0.5, display: "block", color: "text.primary" }}>
        {label}
      </Typography>
      <Box sx={{ width: `${Math.max(barWidthPct, 18)}%` }}>
        <Stack direction="row" sx={{ height: 18, borderRadius: 9, overflow: "hidden" }}>
          {segs.map((s, i) => (
            <Box
              key={i}
              sx={{
                flex: s.v,
                bgcolor: s.c,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 20,
              }}
            >
              <Typography sx={{ fontSize: "0.55rem", fontWeight: 700, color: s.tc, lineHeight: 1 }}>
                {s.v}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
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
    : "-";

  /* ── Benchmark metrics ── */
  const above44 = ratings.length > 0
    ? ((ratings.filter((r) => r.rating >= 4.4).length / ratings.length) * 100)
    : 0;
  const above4 = ratings.length > 0
    ? ((ratings.filter((r) => r.rating >= 4).length / ratings.length) * 100)
    : 0;

  const totalFive = summary?.parameterRatings.reduce((a, p) => a + p.fiveStar, 0) ?? 0;
  const totalFour = summary?.parameterRatings.reduce((a, p) => a + p.fourStar, 0) ?? 0;
  const totalThree = summary?.parameterRatings.reduce((a, p) => a + p.threeAndBelow, 0) ?? 0;
  const donutTotal = totalFive + totalFour + totalThree;

  const donutData = [
    { name: "5 Star", value: totalFive, color: C.five },
    { name: "4 Star", value: totalFour, color: C.four },
    { name: "3 & below", value: totalThree, color: C.three },
  ].filter((d) => d.value > 0);

  const pct = (v: number) => donutTotal > 0 ? ((v / donutTotal) * 100).toFixed(1) : "0";

  const maxParamTotal = summary
    ? Math.max(...summary.parameterRatings.map((p) => p.fiveStar + p.fourStar + p.threeAndBelow))
    : 0;

  const [filter, setFilter] = useState<Filter>("5star");
  const filtered = ratings.filter((r) => {
    if (filter === "5star") return r.rating >= 4.5;
    if (filter === "4star") return r.rating >= 3.5 && r.rating < 4.5;
    return r.rating < 3.5;
  });

  const handleClose = () => {
    dispatch(setOpenLearnerRatings(false));
    dispatch(setLearnerRatingsSessionId(null));
    setFilter("5star");
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100vw", sm: 500 },
          maxWidth: "100vw",
          bgcolor: "hsl(var(--md-surface-container))",
          border: "none",
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* ── Header ── */}
        <Box
          sx={{
            position: "sticky", top: 0, zIndex: 10,
            bgcolor: "background.paper",
            borderBottom: 1, borderColor: "divider",
            px: 2.5, py: 1.5,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight={700}>
              Online session feedback
            </Typography>
            <IconButton size="small" onClick={handleClose} sx={{ color: "text.secondary" }}>
              <CloseOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </Box>

        {/* ── Content ── */}
        <Box className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto", p: 2, pb: 4 }}>
          {session ? (
            <Stack spacing={2}>
              {/* ── Session + Stats ── */}
              <Card>
                <Typography variant="overline" color="text.secondary" sx={{ fontSize: "0.6rem", letterSpacing: "0.06em" }}>
                  {session.sessionType}
                </Typography>
                <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.9rem", lineHeight: 1.3, mt: 0.25 }}>
                  {session.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {session.program} · {session.batch}
                </Typography>

                <Stack direction="row" sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1 }}>
                      {summary?.totalResponses ?? ratings.length}
                      <Typography component="span" variant="caption" color="text.secondary">
                        /{summary?.totalEnrolled ?? "-"}
                      </Typography>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.62rem" }}>
                      No. of feedback
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Stack direction="row" spacing={0.25} justifyContent="flex-end" sx={{ mb: 0.25 }}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <StarOutlinedIcon
                          key={i}
                          sx={{
                            fontSize: 16,
                            color: i <= Math.round(Number(avgRating)) ? "#f59e0b" : "action.disabled",
                          }}
                        />
                      ))}
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.62rem" }}>
                      Session Rating: <b>{avgRating}/5</b>
                    </Typography>
                  </Box>
                </Stack>
              </Card>

              {/* ── Rating distribution (donut) ── */}
              {summary && donutData.length > 0 && (
                <Card>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.82rem", mb: 2 }}>
                    Rating distribution
                  </Typography>

                  <Stack direction="row" spacing={2} alignItems="center">
                    {/* Donut */}
                    <Box sx={{ position: "relative", width: 160, height: 160, flexShrink: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={donutData}
                            dataKey="value"
                            innerRadius={46}
                            outerRadius={70}
                            paddingAngle={3}
                            startAngle={90}
                            endAngle={-270}
                            stroke="none"
                            label={({ cx, cy, midAngle, outerRadius: or, value }: {
                              cx?: number; cy?: number; midAngle?: number; outerRadius?: number; value?: number;
                            }) => {
                              const RAD = Math.PI / 180;
                              const r = (or ?? 70) + 16;
                              const x = (cx ?? 0) + r * Math.cos(-(midAngle ?? 0) * RAD);
                              const y = (cy ?? 0) + r * Math.sin(-(midAngle ?? 0) * RAD);
                              return (
                                <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
                                  fill="currentColor" fontSize={12} fontWeight={700}>
                                  {value}
                                </text>
                              );
                            }}
                            labelLine={false}
                          >
                            {donutData.map((e, i) => <Cell key={i} fill={e.color} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>

                    {/* Legend + percentages */}
                    <Stack spacing={1.5} sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1.5} flexWrap="wrap">
                        <Dot color={C.five} label="5 star" />
                        <Dot color={C.four} label="4 star" />
                        <Dot color={C.three} label="3 & below" />
                      </Stack>

                      <Stack spacing={1} sx={{ pt: 1.5, borderTop: 1, borderColor: "divider" }}>
                        {[
                          { label: "5 Star", val: totalFive },
                          { label: "4 Star", val: totalFour },
                          { label: "3 & below", val: totalThree },
                        ].map((row) => (
                          <Stack key={row.label} direction="row" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>{row.label}</Typography>
                            <Typography variant="caption" fontWeight={600} sx={{ fontSize: "0.7rem" }}>
                              {pct(row.val)}&thinsp;%
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
              )}

              {/* ── Benchmark card ── */}
              {ratings.length > 0 && (
                <Card>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.82rem", mb: 2 }}>
                    Session benchmark
                  </Typography>
                  <Stack spacing={1.5}>
                    {[
                      { label: "Ratings above 4.4", actual: above44, target: 90 },
                      { label: "Ratings above 4.0", actual: above4, target: 98 },
                    ].map((b) => {
                      const met = b.actual >= b.target;
                      return (
                        <Box key={b.label}>
                          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5 }}>
                            <Typography variant="caption" sx={{ fontSize: "0.72rem", color: "text.primary" }}>
                              {b.label}
                            </Typography>
                            <Typography variant="caption" fontWeight={700} sx={{ fontSize: "0.72rem", color: met ? blue[400] : C.three }}>
                              {b.actual.toFixed(1)}%
                              <Typography component="span" variant="caption" color="text.secondary" sx={{ fontSize: "0.62rem", fontWeight: 400 }}>
                                {" "}/ {b.target}% target
                              </Typography>
                            </Typography>
                          </Stack>
                          <Box sx={{ height: 4, borderRadius: "8px", bgcolor: "action.selected", overflow: "hidden" }}>
                            <Box
                              sx={{
                                height: "100%",
                                width: `${Math.min(b.actual, b.target)}%`,
                                borderRadius: "8px",
                                bgcolor: met ? blue[400] : C.three,
                                transition: "width 0.4s ease",
                              }}
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                </Card>
              )}

              {/* ── Parameter wise rating ── */}
              {summary && summary.parameterRatings.length > 0 && (
                <Card>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.82rem", mb: 0.5 }}>
                    Parameter wise rating
                  </Typography>
                  <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
                    <Dot color={C.five} label="5 star" />
                    <Dot color={C.four} label="4 star" />
                    <Dot color={C.three} label="3 & below" />
                  </Stack>
                  {summary.parameterRatings.map((p, i) => (
                    <ParamRow
                      key={i}
                      label={p.label}
                      five={p.fiveStar}
                      four={p.fourStar}
                      three={p.threeAndBelow}
                      maxTotal={maxParamTotal}
                    />
                  ))}
                </Card>
              )}

              {/* ── Student's comments ── */}
              <Card>
                <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.82rem", mb: 2 }}>
                  Student's comments
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  {([
                    { key: "5star" as Filter, label: "5 Star", c: C.five },
                    { key: "4star" as Filter, label: "4 Star", c: C.four },
                    { key: "3below" as Filter, label: "3 & below", c: C.three },
                  ]).map((t) => {
                    const active = filter === t.key;
                    return (
                      <Chip
                        key={t.key}
                        label={t.label}
                        size="small"
                        onClick={() => setFilter(t.key)}
                        sx={{
                          fontWeight: 600, fontSize: "0.68rem", cursor: "pointer",
                          borderRadius: 1, height: 28,
                          bgcolor: active ? t.c : "transparent",
                          color: active ? "#fff" : "text.secondary",
                          border: "1.5px solid",
                          borderColor: active ? t.c : "divider",
                          "&:hover": { bgcolor: active ? t.c : "action.hover" },
                        }}
                      />
                    );
                  })}
                </Stack>

                <Stack spacing={0} divider={<Box sx={{ borderBottom: 1, borderColor: "divider" }} />}>
                  {filtered.map((r, i) => (
                    <Box key={i} sx={{ py: 1.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem", lineHeight: 1.4 }}>
                        {r.feedback || "No comment provided."}
                      </Typography>
                    </Box>
                  ))}
                  {filtered.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                      No feedback in this range.
                    </Typography>
                  )}
                </Stack>
              </Card>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">No session selected.</Typography>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
