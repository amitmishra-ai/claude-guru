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
  /** Session title */
  title: string;
  /** Title variant — defaults to "h6" */
  titleVariant?: "h5" | "h6";
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
  /** If true, renders title+date before chips (for completed cards) */
  titleFirst?: boolean;
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
  titleFirst,
}: SessionCardProps) {
  const chipsRow = (status || (chips && chips.length > 0)) && (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
      {status && (
        <Chip
          icon={status.icon ? <>{status.icon}</> : undefined}
          label={status.label}
          size="small"
          sx={{
            borderRadius: 9999,
            bgcolor: status.bg,
            color: status.color,
            border: `1px solid ${status.border}`,
            fontWeight: 600,
            "& .MuiChip-icon": { color: "inherit" },
          }}
        />
      )}
      {chips?.map((c) => (
        <Chip key={c} label={c} size="small" sx={{ borderRadius: 9999 }} />
      ))}
    </Stack>
  );

  const titleRow = (
    <Typography
      variant={titleVariant}
      fontWeight={600}
      sx={{ mb: 1, fontSize: titleVariant === "h5" ? { xs: "1rem", md: "1.125rem" } : "0.95rem" }}
    >
      {title}
    </Typography>
  );

  const dateRow = (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      flexWrap="wrap"
      useFlexGap
      sx={{ mb: actions || secondaryAction ? 2.5 : 0, color: "text.secondary" }}
    >
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <CalendarTodayOutlinedIcon sx={{ fontSize: 14 }} />
        <Typography variant="body2" color="text.secondary">
          {fmtDateNice(dateYmd)} &bull; {fmtTime12(start)}&ndash;{fmtTime12(end)}
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
      spacing={1.5}
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
            {titleFirst ? (
              <>
                {titleRow}
                {dateRow}
                {chipsRow}
              </>
            ) : (
              <>
                {chipsRow}
                {titleRow}
                {dateRow}
              </>
            )}
          </Box>
          {topRight}
        </Stack>
      )}
      {!topRight && (
        <>
          {titleFirst ? (
            <>
              {titleRow}
              {dateRow}
              {chipsRow}
            </>
          ) : (
            <>
              {chipsRow}
              {titleRow}
              {dateRow}
            </>
          )}
        </>
      )}
      {actionsRow}
    </Box>
  );
}
