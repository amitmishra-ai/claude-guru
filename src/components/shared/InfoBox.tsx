import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";

/**
 * Contextual info/hint box — a rounded bordered container with icon + message.
 * Replaces 10+ identical rounded border+bg inline blocks in dialogs.
 *
 * Variants:
 *   "info"    – primary-tinted bg
 *   "warning" – amber-tinted bg
 *   "success" – green-tinted bg
 *   "error"   – red-tinted bg
 *   "neutral" – surface container bg
 */

type InfoBoxVariant = "info" | "warning" | "success" | "error" | "neutral";

const variantStyles: Record<
  InfoBoxVariant,
  { bgcolor: string; borderColor: string; color: string }
> = {
  info: {
    bgcolor: "var(--gl-status-scheduled-bg)",
    borderColor: "var(--gl-status-scheduled-border)",
    color: "var(--gl-status-scheduled-text)",
  },
  warning: {
    bgcolor: "var(--gl-status-pending-bg)",
    borderColor: "var(--gl-status-pending-border)",
    color: "var(--gl-status-pending-text)",
  },
  success: {
    bgcolor: "var(--gl-status-confirmed-bg)",
    borderColor: "var(--gl-status-confirmed-border)",
    color: "var(--gl-status-confirmed-text)",
  },
  error: {
    bgcolor: "var(--gl-status-declined-bg)",
    borderColor: "var(--gl-status-declined-border)",
    color: "var(--gl-status-declined-text)",
  },
  neutral: {
    bgcolor: "hsl(var(--md-surface-container))",
    borderColor: "hsl(var(--md-outline-variant))",
    color: "hsl(var(--md-on-surface-variant))",
  },
};

export function InfoBox({
  variant = "neutral",
  icon,
  children,
  sx,
}: {
  variant?: InfoBoxVariant;
  /** Optional leading icon (Lucide component, rendered small) */
  icon?: React.ReactNode;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}) {
  const styles = variantStyles[variant];

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        alignItems: "flex-start",
        p: 1.5,
        borderRadius: 0.5,
        border: "1px solid",
        borderColor: styles.borderColor,
        bgcolor: styles.bgcolor,
        ...sx,
      }}
    >
      {icon && (
        <Box
          sx={{
            flexShrink: 0,
            mt: 0.125,
            color: styles.color,
            display: "flex",
          }}
        >
          {icon}
        </Box>
      )}
      <Typography
        variant="body2"
        sx={{ color: styles.color, lineHeight: 1.5 }}
        component="div"
      >
        {children}
      </Typography>
    </Box>
  );
}
