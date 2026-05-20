/* ══════════════════════════════════════════════════════════════════════════
   Activity Card — A1 (matches the shared Figma)
   ──────────────────────────────────────────────────────────────────────────
   Spine card with the date column on the left and the content on the right,
   separated by a single hairline. Type accent in the eyebrow icon + label
   only. Multiple status chips supported in the top-right of the content
   column. Two tonal CTA buttons + a Details link.
   ══════════════════════════════════════════════════════════════════════════ */

import { Fragment } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

/* ── Type catalog ─────────────────────────────────────────────────── */

type SampleType = {
  label: string;
  color: string;
  Icon: typeof AssignmentOutlinedIcon;
};

const TYPE_ASSIGNMENT: SampleType = {
  label: "Assignment",
  color: "#ea580c",            // orange-600
  Icon: AssignmentOutlinedIcon,
};

const TYPE_DISCUSSION: SampleType = {
  label: "Discussion Question",
  color: "#0d9488",            // teal-600
  Icon: GroupsOutlinedIcon,
};

/* ── Status chip tones ────────────────────────────────────────────── */

type StatusTone = "info" | "success" | "warning" | "danger";

const STATUS_TONE: Record<StatusTone, { bg: string; text: string; border: string }> = {
  info: {
    bg: "#fff",
    text: "#1d4ed8",
    border: "rgba(37, 99, 235, 0.5)",
  },
  success: {
    bg: "#e9f8eb",
    text: "#00880f",
    border: "rgba(34, 187, 52, 0.45)",
  },
  warning: {
    bg: "#fff7e6",
    text: "#b45309",
    border: "rgba(217, 119, 6, 0.45)",
  },
  danger: {
    bg: "#fdecec",
    text: "#b91c1c",
    border: "rgba(220, 38, 38, 0.45)",
  },
};

/* ── Sample shape ─────────────────────────────────────────────────── */

type Stat = { label: string; value: number };
type StatusChip = { label: string; tone: StatusTone };
type CtaButton = { label: string };

type Sample = {
  type: SampleType;
  title: string;
  /* Spine — start date carries the day-of-week as the visual scan signal */
  startDow: string;       // "FRI"
  startDay: number;       // 27
  startMonth: string;     // "MAY"
  /* Meta line — full range with optional DOW prefix + batch */
  metaLine: string;       // "Fri, 27 May - 2 June · JHU-AI in Healthcare March'26-A"
  /* Status chips, rendered top-right of the content column. Multiple
     chips combine (e.g. "Late Submission" + "Confirmed"). */
  statuses: StatusChip[];
  /* Progress data points */
  stats: Stat[];
  /* Two tonal CTA buttons */
  ctas: [CtaButton, CtaButton];
};

const SAMPLE_ASSIGNMENT: Sample = {
  type: TYPE_ASSIGNMENT,
  title: "AI for Intelligent Decision Support",
  startDow: "FRI",
  startDay: 27,
  startMonth: "MAY",
  metaLine: "Fri, 27 May - 2 June · JHU-AI in Healthcare March'26-A",
  statuses: [
    { label: "Late Submission", tone: "info" },
    { label: "Confirmed", tone: "success" },
  ],
  stats: [
    { label: "Submissions", value: 12 },
    { label: "Graded", value: 0 },
  ],
  ctas: [{ label: "Discussion Question" }, { label: "Grade" }],
};

const SAMPLE_DISCUSSION: Sample = {
  type: TYPE_DISCUSSION,
  title: "AI for Intelligent Decision Support",
  startDow: "FRI",
  startDay: 27,
  startMonth: "MAY",
  metaLine: "27 May - 2 June · JHU-AI in Healthcare March'26-A",
  statuses: [{ label: "Scheduled", tone: "warning" }],
  stats: [
    { label: "Submissions", value: 12 },
    { label: "Graded", value: 0 },
  ],
  ctas: [{ label: "Discussion Question" }, { label: "Grade" }],
};

/* ── Tokens ───────────────────────────────────────────────────────── */

const HAIRLINE = "rgba(15, 23, 42, 0.10)";
const HAIRLINE_SOFT = "rgba(15, 23, 42, 0.06)";
const INK_PRIMARY = "#0F172A";
const INK_SECONDARY = "#475569";
const INK_TERTIARY = "#94A3B8";
const TABULAR = { fontFeatureSettings: '"tnum", "ss01"', fontVariantNumeric: "tabular-nums" } as const;

/* ══════════════════════════════════════════════════════════════════════════
   StatsRow
   ══════════════════════════════════════════════════════════════════════════ */
function StatsRow({ stats }: { stats: Stat[] }) {
  return (
    <Stack direction="row" spacing={1} alignItems="baseline" flexWrap="wrap" useFlexGap>
      {stats.map((stat, i) => (
        <Fragment key={stat.label}>
          {i > 0 && (
            <Typography sx={{ color: INK_TERTIARY, fontSize: "0.875rem", mx: 0.25 }}>·</Typography>
          )}
          <Stack direction="row" spacing={0.625} alignItems="baseline">
            <Typography sx={{ fontSize: "0.9375rem", fontWeight: 600, color: INK_PRIMARY, lineHeight: 1, ...TABULAR }}>
              {stat.value}
            </Typography>
            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 500, color: INK_SECONDARY }}>
              {stat.label}
            </Typography>
          </Stack>
        </Fragment>
      ))}
    </Stack>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   StatusChips
   ══════════════════════════════════════════════════════════════════════════ */
function StatusChips({ statuses }: { statuses: StatusChip[] }) {
  return (
    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap justifyContent="flex-end">
      {statuses.map((status) => {
        const tone = STATUS_TONE[status.tone];
        return (
          <Chip
            key={status.label}
            label={status.label}
            size="small"
            sx={{
              height: 24,
              borderRadius: "4px",
              bgcolor: tone.bg,
              color: tone.text,
              border: `1px solid ${tone.border}`,
              fontWeight: 500,
              fontSize: "0.78125rem",
              "& .MuiChip-label": { px: 1.25 },
            }}
          />
        );
      })}
    </Stack>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   A1 — Spine card matching the Figma
   ══════════════════════════════════════════════════════════════════════════ */
function CardA1({ s }: { s: Sample }) {
  const TypeIcon = s.type.Icon;
  return (
    <Card
      variant="outlined"
      sx={{
        p: 0,
        borderRadius: "4px",
        borderColor: HAIRLINE_SOFT,
        overflow: "hidden",
      }}
    >
      <Stack direction="row" alignItems="stretch">
        {/* Spine */}
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{
            flex: "0 0 auto",
            minWidth: 96,
            px: 2.5,
            py: 2.5,
            borderRight: `1px solid ${HAIRLINE}`,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: s.type.color,
              mb: 0.75,
            }}
          >
            {s.startDow}
          </Typography>
          <Typography
            sx={{
              fontSize: "2.125rem",
              fontWeight: 600,
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              color: INK_PRIMARY,
              ...TABULAR,
            }}
          >
            {s.startDay}
          </Typography>
          <Typography
            sx={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: INK_SECONDARY,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              mt: 0.625,
            }}
          >
            {s.startMonth}
          </Typography>
        </Stack>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0, p: 2.5 }}>
          {/* Top row: type eyebrow + status chips */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5} sx={{ mb: 0.5 }}>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
              <TypeIcon sx={{ fontSize: 16, color: s.type.color, flexShrink: 0 }} />
              <Typography
                variant="overline"
                sx={{ fontWeight: 600, color: s.type.color, lineHeight: 1.4 }}
              >
                {s.type.label}
              </Typography>
            </Stack>
            <StatusChips statuses={s.statuses} />
          </Stack>

          {/* Title */}
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, color: INK_PRIMARY, mb: 0.75 }}
          >
            {s.title}
          </Typography>

          {/* Meta line — range + batch */}
          <Typography
            sx={{
              fontSize: "0.875rem",
              color: INK_SECONDARY,
              mb: 1.5,
              ...TABULAR,
            }}
          >
            {s.metaLine}
          </Typography>

          {/* Stats */}
          <Box sx={{ mb: 1.75 }}>
            <StatsRow stats={s.stats} />
          </Box>

          {/* Actions: two tonal CTAs + Details */}
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {s.ctas.map((cta) => (
                <Button
                  key={cta.label}
                  variant="soft"
                  size="small"
                  sx={{
                    borderRadius: "4px",
                    fontSize: "0.8125rem",
                    px: 1.5,
                    py: 0.5,
                  }}
                >
                  {cta.label}
                </Button>
              ))}
            </Stack>
            <Button
              variant="text"
              size="small"
              endIcon={<ChevronRightIcon sx={{ fontSize: 14 }} />}
              sx={{ color: "primary.main", fontSize: "0.8125rem" }}
            >
              Details
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Sandbox surface
   ══════════════════════════════════════════════════════════════════════════ */

function VariantFrame({ label, note, children }: { label: string; note: string; children: React.ReactNode }) {
  return (
    <Box>
      <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 0.875, flexWrap: "wrap" }}>
        <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: INK_PRIMARY }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: "0.75rem", color: INK_SECONDARY }}>
          {note}
        </Typography>
      </Stack>
      <Stack spacing={1.5}>{children}</Stack>
    </Box>
  );
}

export function ActivityCardExplorations() {
  return (
    <Card sx={{ p: 2.5 }}>
      <Stack spacing={0.25} sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: "0.9375rem", fontWeight: 600, color: INK_PRIMARY }}>Activity Card — A1</Typography>
        <Typography sx={{ fontSize: "0.75rem", color: INK_SECONDARY }}>
          Spine + content with multi-status chips on the top right and two tonal CTAs + a Details link in the action row. Matches the shared Figma.
        </Typography>
      </Stack>

      <Stack spacing={2.5} divider={<Divider sx={{ borderColor: HAIRLINE_SOFT }} />}>
        <VariantFrame label="A1" note="Assignment · Late Submission + Confirmed">
          <CardA1 s={SAMPLE_ASSIGNMENT} />
        </VariantFrame>

        <VariantFrame label="A1" note="Discussion Question · Scheduled">
          <CardA1 s={SAMPLE_DISCUSSION} />
        </VariantFrame>
      </Stack>
    </Card>
  );
}
