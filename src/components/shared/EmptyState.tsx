import type { ReactNode } from "react";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { keyframes } from "@mui/system";

/* ── Entrance animation ─────────────────────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const subtlePulse = keyframes`
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.04); }
`;

/* ── Dot-pattern background overlay (via radial-gradient trick) ────── */
const DOT_BG = `radial-gradient(circle, currentColor 0.6px, transparent 0.6px)`;

interface EmptyStateProps {
  /** Custom SVG illustration or MUI icon element */
  icon: ReactNode;
  /** Primary message */
  title: string;
  /** Secondary explanatory text */
  subtitle?: string;
  /** Optional action button or link */
  action?: ReactNode;
  /** Compact mode — smaller padding for inline/card use */
  compact?: boolean;
}

/**
 * Premium empty-state placeholder — consistent, refined visual across all pages.
 * Animated entrance, illustrated icon area, subtle depth treatment.
 */
export function EmptyState({ icon, title, subtitle, action, compact }: EmptyStateProps) {
  return (
    <Box
      sx={{
        py: compact ? 4 : 6,
        px: 3,
        textAlign: "center",
        borderRadius: "12px",
        position: "relative",
        overflow: "hidden",
        /* Soft elevated container — no dashed border */
        bgcolor: (t) => alpha(t.palette.primary.main, t.palette.mode === "light" ? 0.018 : 0.025),
        border: "1px solid",
        borderColor: (t) => alpha(t.palette.primary.main, t.palette.mode === "light" ? 0.07 : 0.08),
        /* Entry animation */
        animation: `${fadeUp} 0.5s cubic-bezier(0.22, 1, 0.36, 1) both`,
      }}
    >
      {/* Subtle dot-pattern overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: DOT_BG,
          backgroundSize: "18px 18px",
          color: (t) => alpha(t.palette.primary.main, 0.04),
          pointerEvents: "none",
        }}
      />

      {/* Soft radial glow behind icon */}
      <Box
        sx={{
          position: "absolute",
          top: compact ? "-20%" : "-10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: (t) =>
            `radial-gradient(circle, ${alpha(t.palette.primary.main, 0.06)} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Content — on top of overlays */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        {/* Icon container with soft circle backdrop */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: "50%",
            mb: 2,
            bgcolor: (t) => alpha(t.palette.primary.main, t.palette.mode === "light" ? 0.07 : 0.08),
            color: "primary.main",
            animation: `${subtlePulse} 4s ease-in-out infinite`,
            "& > svg, & > .MuiSvgIcon-root": {
              fontSize: 28,
            },
          }}
        >
          {icon}
        </Box>

        {/* Title */}
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 650,
            color: "text.primary",
            mb: subtitle ? 0.5 : 0,
            letterSpacing: "-0.01em",
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>

        {/* Subtitle */}
        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              maxWidth: 340,
              mx: "auto",
              lineHeight: 1.55,
              opacity: 0.82,
            }}
          >
            {subtitle}
          </Typography>
        )}

        {/* CTA */}
        {action && (
          <Box sx={{ mt: 2.5 }}>
            {action}
          </Box>
        )}
      </Box>
    </Box>
  );
}
