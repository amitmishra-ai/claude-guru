import type { ReactNode } from "react";
import { Fragment } from "react";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CallMergeOutlinedIcon from "@mui/icons-material/CallMergeOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import { fmtTime12, applyTzOffset, fmtDateNice } from "@/lib/helpers";
import { useAppSelector } from "@/store";
import { getActivityVisual } from "@/lib/activity-visuals";

const HAIRLINE_SOFT = "rgba(15, 23, 42, 0.06)";
const TABULAR = { fontFeatureSettings: '"tnum", "ss01"', fontVariantNumeric: "tabular-nums" } as const;

export type SessionCardStatus = {
  label: string;
  bg: string;
  color: string;
  border: string;
  icon?: ReactNode;
};

export type SessionCardStat = {
  label: string;
  value: number | string;
};

export type SessionCardProps = {
  /** Session title (course name) */
  title: string;
  /** Title variant - defaults to "h6" (kept for API compat; subtitle2 styling applied) */
  titleVariant?: "h5" | "h6";
  /** Session type — used to derive the eyebrow icon + color label */
  sessionType?: string;
  /** Session topic */
  topic?: string;
  /** Batch identifier */
  batch?: string;
  /** Date in YYYY-MM-DD */
  dateYmd: string;
  /** End date for multi-day events */
  endDateYmd?: string;
  /** Start time (minutes from midnight); pass NaN to suppress time in meta */
  start: number;
  /** End time (minutes from midnight) */
  end: number;
  /** When true, suppress the time range in the meta line (date-only activities) */
  hideTime?: boolean;
  /** Group name (shows Users icon in meta) */
  group?: string;
  /** Extra text appended to meta line (e.g. location) */
  locationText?: string;
  /** Status chip config; omit for no status chip */
  status?: SessionCardStatus;
  /** Category chip labels (program, cohort, location, etc.) */
  chips?: string[];
  /** Content in top-right corner of content column (e.g. additional chips, star rating) */
  topRight?: ReactNode;
  /** Content rendered to the right of the eyebrow on the LEFT side of the
      top row — used for attention chips like "Late submission" that should
      visually attach to the activity-type label rather than the status
      cluster on the right. */
  eyebrowExtra?: ReactNode;
  /** Content rendered inline to the right of the title */
  titleRight?: ReactNode;
  /** Progress stats — rendered as a "12 Submissions · 0 Graded" row */
  stats?: SessionCardStat[];
  /** Primary action buttons */
  actions?: ReactNode;
  /** Secondary action (right-aligned, e.g. "Group profile") */
  secondaryAction?: ReactNode;
  /** When provided, renders a "View details →" affordance */
  onViewDetails?: () => void;
  /** When true, suppresses the mobile "View details" row */
  hideMobileViewDetails?: boolean;
  /** When provided, makes the title clickable */
  onCourseClick?: () => void;
  sx?: SxProps<Theme>;
};

/* ── Status presets — chip styling matches the A1 tonal palette ── */

export const STATUS_SCHEDULED: SessionCardStatus = {
  label: "Scheduled",
  bg: "var(--gl-status-pending-bg)",
  color: "var(--gl-status-pending-text)",
  border: "var(--gl-status-pending-border)",
};

export const STATUS_CONFIRMED: (icon?: ReactNode) => SessionCardStatus = (icon) => ({
  label: "Confirmed",
  bg: "var(--gl-status-confirmed-bg)",
  color: "var(--gl-status-confirmed-text)",
  border: "var(--gl-status-confirmed-border)",
  icon,
});

export const STATUS_PREPARED: (icon?: ReactNode) => SessionCardStatus = (icon) => ({
  label: "Prepared",
  bg: "var(--gl-status-completed-bg)",
  color: "var(--gl-status-completed-text)",
  border: "var(--gl-status-completed-border)",
  icon,
});

export const STATUS_DECLINED: SessionCardStatus = {
  label: "Declined",
  bg: "var(--gl-status-declined-bg)",
  color: "var(--gl-status-declined-text)",
  border: "var(--gl-status-declined-border)",
};

/* ── Stats row helper ── */

function StatsRow({ stats }: { stats: SessionCardStat[] }) {
  return (
    <Stack direction="row" spacing={1} alignItems="baseline" flexWrap="wrap" useFlexGap>
      {stats.map((stat, i) => (
        <Fragment key={stat.label}>
          {i > 0 && (
            <Typography sx={{ color: "text.disabled", fontSize: "0.8125rem", mx: 0.25 }}>·</Typography>
          )}
          <Stack direction="row" spacing={0.625} alignItems="baseline">
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "text.primary", lineHeight: 1, ...TABULAR }}>
              {stat.value}
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 500, color: "text.secondary" }}>
              {stat.label}
            </Typography>
          </Stack>
        </Fragment>
      ))}
    </Stack>
  );
}

/* ── Component ── */

export function SessionCard({
  title,
  sessionType,
  batch,
  dateYmd,
  endDateYmd,
  start,
  end,
  hideTime,
  group,
  locationText,
  status,
  chips,
  topRight,
  eyebrowExtra,
  titleRight,
  stats,
  actions,
  secondaryAction,
  onViewDetails,
  hideMobileViewDetails,
  onCourseClick,
  sx,
}: SessionCardProps) {
  const tzOffset = useAppSelector((s) => s.profile.tzOffsetMinutes);
  const tzStart = applyTzOffset(start, tzOffset);
  const tzEnd = applyTzOffset(end, tzOffset);
  const visual = getActivityVisual(sessionType);

  /* Secondary Guru tag — auto-injected when the current Guru role is Secondary */
  const selectedRole = useAppSelector((s) => s.devPanel.selectedRole);
  const secondaryChip = selectedRole === "Secondary Guru" ? (
    <Chip
      label="Secondary"
      size="small"
      sx={{
        height: 22,
        fontSize: "0.7rem",
        fontWeight: 500,
        borderRadius: "4px",
        bgcolor: "var(--gl-status-pending-bg)",
        color: "var(--gl-status-pending-text)",
        border: "1px solid var(--gl-status-pending-border)",
        flexShrink: 0,
        "& .MuiChip-label": { px: 1 },
      }}
    />
  ) : null;

  /* Status chip — slimmer, 4px radius, sentence-case label */
  const statusChip = status && (
    <Chip
      icon={status.icon ? <>{status.icon}</> : undefined}
      label={status.label}
      size="small"
      sx={{
        bgcolor: status.bg,
        color: status.color,
        border: `1px solid ${status.border}`,
        fontWeight: 500,
        fontSize: "0.75rem",
        "& .MuiChip-icon": { color: "inherit" },
        flexShrink: 0,
      }}
    />
  );

  /* Combined / Full batch chips (kept for legacy callers) */
  const chipsRow = (chips && chips.length > 0) && (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
      {chips.map((c) =>
        ["Combined session", "Full batch", "1:1 Session"].includes(c) ? (
          <Chip
            key={c}
            icon={<CallMergeOutlinedIcon sx={{ fontSize: 13 }} />}
            label={c}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: "0.7rem",
              bgcolor: "hsl(var(--md-surface-container) / 0.6)",
              border: "1px solid",
              borderColor: "divider",
              "& .MuiChip-icon": { color: "inherit", ml: 0.5 },
            }}
          />
        ) : (
          <Chip key={c} label={c} size="small" />
        ),
      )}
    </Stack>
  );

  /* Title (subtitle2 styling, optionally clickable). Type label carried
     inline as a "Type: Title" prefix (not a separate overline eyebrow). */
  const titleBody = onCourseClick ? (
    <Box
      component="span"
      onClick={(e) => { e.stopPropagation(); onCourseClick(); }}
      sx={{ color: "primary.main", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
    >
      {title}
    </Box>
  ) : title;
  const titleContent = sessionType ? (
    <>
      <Box component="span">{visual.label}: </Box>
      {titleBody}
    </>
  ) : titleBody;

  /* Eyebrow — type label now lives inline in the title, so the eyebrow row
     only carries `eyebrowExtra` attention chips like "Late submission". */
  const eyebrow = eyebrowExtra ? (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, flexWrap: "wrap" }} useFlexGap>
      {eyebrowExtra}
    </Stack>
  ) : null;

  /* Right cluster (status chip(s) + topRight content) */
  const rightCluster = (statusChip || secondaryChip || topRight) ? (
    <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap justifyContent="flex-end" sx={{ flexShrink: 0 }}>
      {secondaryChip}
      {statusChip}
      {topRight}
    </Stack>
  ) : null;

  /* Meta line — date always carried inline (with a leading calendar icon)
     so the card stays scalable on any width. Composes
     date · time · batch · location in one row. */
  const showTime = !hideTime && Number.isFinite(start) && Number.isFinite(end);
  const hasRange = !!endDateYmd && endDateYmd !== dateYmd;
  const timeText = showTime ? `${fmtTime12(tzStart)}–${fmtTime12(tzEnd)}` : null;

  const meta: string[] = [];
  if (hasRange) {
    meta.push(`${fmtDateNice(dateYmd)} → ${fmtDateNice(endDateYmd!)}`);
  } else {
    meta.push(fmtDateNice(dateYmd));
  }
  if (timeText) meta.push(timeText);
  if (batch) meta.push(batch);
  if (locationText) meta.push(locationText);
  const metaText = meta.join(" · ");

  const hasMeta = metaText.length > 0 || !!group;

  /* Desktop "View details" text button (right side of action row) */
  const desktopViewDetailsBtn = onViewDetails && (
    <Box sx={{ display: { xs: "none", sm: "block" } }}>
      <Button
        variant="text"
        size="small"
        endIcon={<ChevronRightIcon sx={{ fontSize: 14 }} />}
        onClick={onViewDetails}
        sx={{ color: "primary.main", fontSize: "0.8125rem" }}
      >
        Details
      </Button>
    </Box>
  );

  const resolvedSecondary = onViewDetails
    ? desktopViewDetailsBtn
    : secondaryAction
      ? <Box sx={{ display: { xs: "none", sm: "block" } }}>{secondaryAction}</Box>
      : null;

  const actionsRow = (actions || resolvedSecondary) && (
    <Stack
      direction="row"
      justifyContent={actions ? "space-between" : "flex-end"}
      alignItems="center"
      spacing={1}
      flexWrap="wrap"
      useFlexGap
    >
      {actions && (
        <Stack
          direction="row"
          spacing={1}
          flexWrap="nowrap"
          useFlexGap
          sx={{
            width: { xs: "100%", sm: "auto" },
            "& .MuiButton-root": {
              flex: { xs: 1, sm: "0 0 auto" },
              fontSize: { xs: "0.78rem", sm: "0.8125rem" },
              px: { xs: 1.5, sm: 1.5 },
              py: { xs: 0.75, sm: 0.5 },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              minWidth: 0,
            },
            "& .MuiButton-startIcon": { display: { xs: "none", sm: "inline-flex" } },
          }}
        >
          {actions}
        </Stack>
      )}
      {resolvedSecondary}
    </Stack>
  );

  /* Mobile full-width "View details" footer — spans the full card width
     (under the spine + content), so kept OUTSIDE the row-flex below. */
  const mobileViewDetailsRow = onViewDetails && !hideMobileViewDetails && (
    <Box
      onClick={onViewDetails}
      sx={{
        display: { xs: "flex", sm: "none" },
        justifyContent: "space-between",
        alignItems: "center",
        px: 2,
        py: "10px",
        cursor: "pointer",
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "action.hover",
        "&:hover": { bgcolor: "action.selected" },
        transition: "background-color 0.15s",
      }}
    >
      <Typography variant="caption" fontWeight={600} sx={{ fontSize: "0.75rem" }}>View details</Typography>
      <ChevronRightIcon sx={{ fontSize: 18, color: "text.secondary" }} />
    </Box>
  );

  /* Mobile secondary action footer (used when no onViewDetails). Same
     full-card-width footer pattern. */
  const mobileSecondaryRow = !onViewDetails && secondaryAction && (
    <Box
      sx={{
        display: { xs: "flex", sm: "none" },
        justifyContent: "space-between",
        alignItems: "center",
        px: 2,
        py: "10px",
        cursor: "pointer",
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "action.hover",
        "&:hover": { bgcolor: "action.selected" },
        transition: "background-color 0.15s",
        "& .MuiButton-root": { p: 0, minHeight: "unset", minWidth: "unset" },
      }}
    >
      {secondaryAction}
      <ChevronRightIcon sx={{ fontSize: 18, color: "text.secondary" }} />
    </Box>
  );

  return (
    <Box sx={sx}>
      {/* Content column */}
      <Box sx={{ minWidth: 0, px: 2, py: 2 }}>
        {/* Eyebrow row — only attention chips (e.g. "Late submission") */}
          {eyebrow && (
            <Stack
              direction="row"
              justifyContent="flex-start"
              alignItems="flex-start"
              spacing={1}
              sx={{ mb: 0.5, gap: 1, flexWrap: { xs: "wrap", sm: "nowrap" } }}
            >
              {eyebrow}
            </Stack>
          )}

          {/* Title — status chip sits inline on the right of the title row */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 0.5, gap: 1, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: "text.primary", minWidth: 0, lineHeight: 1.35 }}
            >
              {titleContent}
            </Typography>
            {(rightCluster || titleRight) && (
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexShrink: 0 }}>
                {rightCluster}
                {titleRight}
              </Stack>
            )}
          </Stack>

          {/* Meta line — date carried inline with a leading calendar icon */}
          {hasMeta && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              sx={{ mb: stats ? 1.25 : (actions || secondaryAction ? 1.5 : 0), color: "text.secondary" }}
            >
              {metaText && (
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 12, flexShrink: 0 }} />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={{ fontSize: "0.75rem", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", ...TABULAR }}
                  >
                    {metaText}
                  </Typography>
                </Stack>
              )}
              {group && (
                <>
                  <Typography variant="body2" color="text.disabled">·</Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <GroupOutlinedIcon sx={{ fontSize: 14 }} />
                    <Typography variant="body2" color="text.secondary">{group}</Typography>
                  </Stack>
                </>
              )}
            </Stack>
          )}

          {/* Stats row */}
          {stats && stats.length > 0 && (
            <Box sx={{ mb: actions || secondaryAction ? 1.5 : 0 }}>
              <StatsRow stats={stats} />
            </Box>
          )}

          {chipsRow}

          {actionsRow}
      </Box>
      {mobileViewDetailsRow}
      {mobileSecondaryRow}
    </Box>
  );
}
