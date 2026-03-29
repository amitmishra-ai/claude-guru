import type { ReactNode } from "react";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CallMergeOutlinedIcon from "@mui/icons-material/CallMergeOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import { fmtDateNice, fmtTime12, applyTzOffset } from "@/lib/helpers";
import { useAppSelector } from "@/store";

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
  /** End date for multi-day events (YYYY-MM-DD) */
  endDateYmd?: string;
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
  /** When provided, renders a mobile-style "View details →" row on xs and a text button on sm+ */
  onViewDetails?: () => void;
  /** When provided, makes the course name (title) a clickable link */
  onCourseClick?: () => void;
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
  endDateYmd,
  start,
  end,
  group,
  locationText,
  status,
  chips,
  topRight,
  actions,
  secondaryAction,
  onViewDetails,
  onCourseClick,
  sx,
}: SessionCardProps) {
  const tzOffset = useAppSelector((s) => s.profile.tzOffsetMinutes);
  const tzStart = applyTzOffset(start, tzOffset);
  const tzEnd = applyTzOffset(end, tzOffset);

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

  const titleContent = sessionType ? (
    <>
      <span>{sessionType}: </span>
      {onCourseClick ? (
        <Box
          component="span"
          onClick={(e) => { e.stopPropagation(); onCourseClick(); }}
          sx={{ color: "primary.main", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
        >
          {title}
        </Box>
      ) : (
        <span>{title}</span>
      )}
    </>
  ) : onCourseClick ? (
    <Box
      component="span"
      onClick={(e) => { e.stopPropagation(); onCourseClick(); }}
      sx={{ color: "primary.main", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
    >
      {title}
    </Box>
  ) : title;

  const titleRow = (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
      <Typography
        variant={titleVariant}
        fontWeight={600}
        sx={{ fontSize: titleVariant === "h5" ? { xs: "1rem", md: "1.125rem" } : "0.875rem", minWidth: 0 }}
      >
        {titleContent}
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
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
        <CalendarTodayOutlinedIcon sx={{ fontSize: 12, flexShrink: 0 }} />
        <Typography variant="caption" color="text.secondary" noWrap sx={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
          {fmtDateNice(dateYmd)}{endDateYmd ? <> &rarr; {fmtDateNice(endDateYmd)}</> : null} &middot; {fmtTime12(tzStart)}&ndash;{fmtTime12(tzEnd)}
          {batch ? <> &middot; {batch}</> : null}
          {locationText ? <> &middot; {locationText}</> : null}
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

  /* Desktop-only secondary for onViewDetails */
  const desktopViewDetailsBtn = onViewDetails && (
    <Box sx={{ display: { xs: "none", sm: "block" } }}>
      <Button variant="text" size="small" onClick={onViewDetails}>View details</Button>
    </Box>
  );

  const resolvedSecondary = onViewDetails ? desktopViewDetailsBtn : secondaryAction;

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
        <Stack direction="row" spacing={1} flexWrap="nowrap" useFlexGap sx={{ width: { xs: "100%", sm: "auto" }, "& .MuiButton-root": { flex: { xs: 1, sm: "0 0 auto" }, fontSize: { xs: "0.78rem", sm: "0.8125rem" }, px: { xs: 1.5, sm: 1.5 }, py: { xs: 0.75, sm: 0.5 }, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 } }}>
          {actions}
        </Stack>
      )}
      {resolvedSecondary}
    </Stack>
  );

  /* Mobile full-width "View details →" row — rendered outside actionsRow to span full card width */
  const mobileViewDetailsRow = onViewDetails && (
    <Box
      onClick={onViewDetails}
      sx={{
        display: { xs: "flex", sm: "none" },
        justifyContent: "space-between",
        alignItems: "center",
        mt: 1.5,
        mx: { xs: -1.5, sm: -2 },
        mb: { xs: -1.5, sm: -2 },
        px: 2,
        py: 1.25,
        cursor: "pointer",
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "action.hover",
        borderRadius: "0 0 12px 12px",
        "&:hover": { bgcolor: "action.selected" },
        transition: "background-color 0.15s",
      }}
    >
      <Typography variant="caption" fontWeight={600} sx={{ fontSize: "0.75rem" }}>View details</Typography>
      <Typography sx={{ fontSize: 14, color: "text.secondary" }}>→</Typography>
    </Box>
  );

  return (
    <Box sx={sx}>
      {topRight ? (
        <>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5, gap: { xs: 0.75, sm: 1 } }}>
            <Typography
              variant={titleVariant}
              fontWeight={600}
              sx={{ fontSize: titleVariant === "h5" ? { xs: "0.9rem", sm: "1rem", md: "1.125rem" } : { xs: "0.8rem", sm: "0.875rem" }, minWidth: 0 }}
            >
              {titleContent}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1 }} flexWrap="wrap" useFlexGap justifyContent="flex-end" sx={{ flexShrink: 0, maxWidth: { xs: "45%", sm: "auto" } }}>
              {statusChip}
              {topRight}
            </Stack>
          </Stack>
          {dateRow}

          {chipsRow}
        </>
      ) : (
        <>
          {titleRow}
          {dateRow}

          {chipsRow}
        </>
      )}
      {actionsRow}
      {mobileViewDetailsRow}
    </Box>
  );
}
