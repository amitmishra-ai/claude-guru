import Chip from "@mui/material/Chip";
import type { SxProps, Theme } from "@mui/material/styles";

/**
 * Semantic status pill — reads colors from --gl-status-* CSS tokens.
 * Replaces 20+ inline Chip sx blocks with hardcoded hex across pages/dialogs.
 *
 * Usage:
 *   <StatusChip status="confirmed" label="Confirmed" />
 *   <StatusChip status="pending" label="Awaiting Response" size="small" />
 */

export type StatusVariant =
  | "confirmed"
  | "scheduled"
  | "pending"
  | "declined";

export function StatusChip({
  status,
  label,
  size = "small",
  sx,
}: {
  status: StatusVariant;
  label: string;
  size?: "small" | "medium";
  sx?: SxProps<Theme>;
}) {
  return (
    <Chip
      label={label}
      size={size}
      sx={{
        bgcolor: `var(--gl-status-${status}-bg)`,
        color: `var(--gl-status-${status}-text)`,
        border: "1px solid",
        borderColor: `var(--gl-status-${status}-border)`,
        fontWeight: 600,
        fontSize: size === "small" ? "0.7rem" : "0.8125rem",
        height: size === "small" ? 22 : 28,
        ...sx,
      }}
    />
  );
}
