import { useState } from "react";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useAppSelector, useAppDispatch } from "@/store";
import { setOpenLearnerRatings, setLearnerRatingsSessionId } from "@/store/slices/uiSlice";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import { demoLearnerRatingsBySessionId, demoFeedbackSummaryBySessionId, demoQualitativeFeedbackBySessionId } from "@/data/demo-sessions";

/* ── Palette — derived from theme ── */
function useRatingColors() {
  const theme = useTheme();
  return {
    five: theme.palette.success.main,
    four: theme.palette.warning.main,
    three: theme.palette.error.main,
  } as const;
}

type Filter = "5star" | "4star" | "3below";

/* ── Card shell — uses theme tokens, not hardcoded colors ── */
function Card({ children, sx }: { children: React.ReactNode; sx?: SxProps<Theme> }) {
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

type RatingColors = ReturnType<typeof useRatingColors>;

/* ── Stacked bar row ── */
function ParamRow({ label, five, four, three, maxTotal, colors }: {
  label: string; five: number; four: number; three: number; maxTotal: number; colors: RatingColors;
}) {
  const total = five + four + three;
  if (total === 0) return null;
  const barWidthPct = maxTotal > 0 ? (total / maxTotal) * 100 : 100;
  const segs = [
    { v: five, c: colors.five, tc: "common.white" },
    { v: four, c: colors.four, tc: "common.white" },
    { v: three, c: colors.three, tc: "common.white" },
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
  const C = useRatingColors();
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.openLearnerRatings);
  const sessionId = useAppSelector((s) => s.ui.learnerRatingsSessionId);
  const sessions = useAppSelector((s) => s.sessions.items);

  const session = sessionId ? sessions.find((s) => s.id === sessionId) : null;
  const isQualitative = session?.sessionType === "Evaluation" || session?.sessionType === "Moderation";
  const qualFeedback = sessionId ? demoQualitativeFeedbackBySessionId[sessionId] : null;
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
          bgcolor: "background.paper",
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
              {isQualitative ? `${session?.sessionType ?? "Session"} feedback` : "Online session feedback"}
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
              {/* ── Session info ── */}
              <Card sx={isQualitative ? { textAlign: "center" } : undefined}>
                {!isQualitative && (
                  <Typography variant="overline" color="text.secondary" sx={{ fontSize: "0.6rem", letterSpacing: "0.06em" }}>
                    {session.sessionType}
                  </Typography>
                )}
                <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.9rem", lineHeight: 1.3, mt: isQualitative ? 0 : 0.25 }}>
                  {session.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isQualitative ? session.program : `${session.program} · ${session.batch}`}
                </Typography>

                {/* Pattern 1: feedback count + rating */}
                {!isQualitative && (
                  <Stack direction="row" sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight={700} sx={{ lineHeight: 1 }}>
                        {summary?.totalResponses ?? ratings.length}/{summary?.totalEnrolled ?? "-"}
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
                            sx={{ fontSize: 16, color: i <= Math.round(Number(avgRating)) ? "var(--gl-star-color)" : "action.disabled" }}
                          />
                        ))}
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.62rem" }}>
                        Session Rating: <b>{avgRating}/5</b>
                      </Typography>
                    </Box>
                  </Stack>
                )}
                {/* Pattern 2: stars + rating, centered */}
                {isQualitative && qualFeedback && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider", textAlign: "center" }}>
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <StarOutlinedIcon
                          key={i}
                          sx={{ fontSize: 22, color: i <= qualFeedback.rating ? "var(--gl-star-color)" : "action.disabled" }}
                        />
                      ))}
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: "block", fontSize: "0.72rem" }}>
                      Rating · {qualFeedback.rating}/5
                    </Typography>
                  </Box>
                )}
              </Card>

              {/* ── Pattern 2: Qualitative feedback (Evaluation / Moderation) ── */}
              {isQualitative && qualFeedback && (
                <>
                  {/* Feedback tags */}
                  {qualFeedback.positiveTags && qualFeedback.positiveTags.length > 0 && (
                    <Card>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.82rem", mb: 2 }}>
                        What went well
                      </Typography>
                      <Box component="ul" sx={{ m: 0, pl: 2.5, display: "flex", flexDirection: "column", gap: 1 }}>
                        {qualFeedback.positiveTags.map((tag, i) => (
                          <Typography key={i} component="li" variant="body2" sx={{ fontSize: "0.8rem", lineHeight: 1.5, "::marker": { color: "success.main", content: "'✓  '" } }}>
                            {tag}
                          </Typography>
                        ))}
                      </Box>
                    </Card>
                  )}

                  {qualFeedback.rating < 5 && qualFeedback.negativeTags && (
                    <Card>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.82rem", mb: 2 }}>
                        Areas for improvement
                      </Typography>
                      <Box component="ul" sx={{ m: 0, pl: 2.5, display: "flex", flexDirection: "column", gap: 1 }}>
                        {qualFeedback.negativeTags.map((tag, i) => (
                          <Typography key={i} component="li" variant="body2" sx={{ fontSize: "0.8rem", lineHeight: 1.5, "::marker": { color: "text.primary" } }}>
                            {tag}
                          </Typography>
                        ))}
                      </Box>

                      {/* Free-text comments */}
                      {qualFeedback.comments && qualFeedback.comments.length > 0 && (
                        <Box sx={{ mt: 2.5, pt: 2, borderTop: 1, borderColor: "divider" }}>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.82rem", mb: 1.5 }}>
                            Student comments
                          </Typography>
                          <Stack spacing={0} divider={<Box sx={{ borderBottom: 1, borderColor: "divider" }} />}>
                            {qualFeedback.comments.map((c, i) => (
                              <Box key={i} sx={{ py: 1.5 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem", lineHeight: 1.4 }}>
                                  {c}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Card>
                  )}
                </>
              )}

              {/* ── Pattern 1: Chart-based feedback (Online, Residency, etc.) ── */}
              {!isQualitative && summary && donutData.length > 0 && (
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
              {!isQualitative && ratings.length > 0 && (
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
                            <Typography variant="caption" fontWeight={700} sx={{ fontSize: "0.72rem", color: met ? "info.main" : C.three }}>
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
                                bgcolor: met ? "info.main" : C.three,
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
              {!isQualitative && summary && summary.parameterRatings.length > 0 && (
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
                      colors={C}
                    />
                  ))}
                </Card>
              )}

              {/* ── Student's comments ── */}
              {!isQualitative && <Card>
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
                          color: active ? "common.white" : "text.secondary",
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
              </Card>}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">No session selected.</Typography>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
