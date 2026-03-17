import type { ReactNode } from "react";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import { fmtDateNice, fmtTime12 } from "@/lib/helpers";

export type SessionCardStatus = {
  label: string;
  bg: string;
  color: string;
  border: string;
  icon?: ReactNode;
};

export type SessionCardProps = {
  /** Session title (course name) */
  title: string;
  /** Title variant — defaults to "h6" */
  titleVariant?: "h5" | "h6";
  /** Session type label (e.g. "Mentored Learning session") */
  sessionType?: string;
  /** Session topic (e.g. "Orientation + Industry Landscape") */
  topic?: string;
  /** Batch identifier (e.g. "AIML Online March 26 A") */
  batch?: string;
  /** Date in YYYY-MM-DD */
  dateYmd: string;
  /** Start time (minutes from midnight) */
  start: number;
  /** End time (minutes from midnight) */
  end: number;
  /** Group name (shows Users icon) */
  group?: string;
  /** Extra text appended to date line (e.g. location) */
  locationText?: string;
  /** Status chip config; omit for no status chip */
  status?: SessionCardStatus;
  /** Category chip labels (program, cohort, location, etc.) */
  chips?: string[];
  /** Content in top-right corner (e.g. star rating) */
  topRight?: ReactNode;
  /** Primary action buttons */
  actions?: ReactNode;
  /** Secondary action (right-aligned, e.g. "Group profile") */
  secondaryAction?: ReactNode;
  /** Container sx overrides (animation, opacity, etc.) */
  sx?: SxProps<Theme>;
};

/* ── Status presets ── */

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

export const STATUS_DECLINED: SessionCardStatus = {
  label: "Declined",
  bg: "var(--gl-status-declined-bg)",
  color: "var(--gl-status-declined-text)",
  border: "var(--gl-status-declined-border)",
};

/* ── Component ── */

export function SessionCard({
  title,
  titleVariant = "h6",
  sessionType,
  topic,
  batch,
  dateYmd,
  start,
  end,
  group,
  locationText,
  status,
  chips,
  topRight,
  actions,
  secondaryAction,
  sx,
}: SessionCardProps) {
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

  const chipsRow = (chips && chips.length > 0) && (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
      {chips.map((c) => (
        <Chip key={c} label={c} size="small" />
      ))}
    </Stack>
  );

  const displayTitle = sessionType ? `${sessionType}: ${title}` : title;

  const titleRow = (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
      <Typography
        variant={titleVariant}
        fontWeight={600}
        sx={{ fontSize: titleVariant === "h5" ? { xs: "1rem", md: "1.125rem" } : "0.875rem", minWidth: 0 }}
      >
        {displayTitle}
      </Typography>
      {statusChip}
    </Stack>
  );

  const dateRow = (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      flexWrap="wrap"
      useFlexGap
      sx={{ mb: actions || secondaryAction ? 1.5 : 0, color: "text.secondary" }}
    >
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
        <Typography variant="caption" color="text.secondary">
          {fmtDateNice(dateYmd)} &bull; {fmtTime12(start)}&ndash;{fmtTime12(end)}
          {batch ? <> &bull; {batch}</> : null}
          {locationText ? <> &bull; {locationText}</> : null}
        </Typography>
      </Stack>
      {group && (
        <>
          <Typography variant="body2" color="text.disabled">&middot;</Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <GroupOutlinedIcon sx={{ fontSize: 14 }} />
            <Typography variant="body2" color="text.secondary">{group}</Typography>
          </Stack>
        </>
      )}
    </Stack>
  );

  const actionsRow = (actions || secondaryAction) && (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      spacing={1}
    >
      {actions && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {actions}
        </Stack>
      )}
      {secondaryAction}
    </Stack>
  );

  return (
    <Box sx={sx}>
      {topRight && (
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {titleRow}
            {dateRow}
            {chipsRow}
          </Box>
          {topRight}
        </Stack>
      )}
      {!topRight && (
        <>
          {titleRow}
          {dateRow}
          {chipsRow}
        </>
      )}
      {actionsRow}
    </Box>
  );
}
