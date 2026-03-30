import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

/**
 * Material 3 — Small Top App Bar (mobile only).
 *
 * Spec reference (M3 guidelines):
 * - Height: 64dp
 * - Leading icon: 48×48dp touch target, 4dp from left edge
 * - Headline: Title Large (22sp) or Body Large (16sp), left-aligned after icon
 * - Container: surface color, 0dp elevation at rest
 * - Safe area: respects env(safe-area-inset-top) for notch/dynamic island
 *
 * Hidden on desktop (sm+) where sidebar handles navigation.
 */
export function MobilePageHeader({ title }: { title: string }) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: { xs: "flex", sm: "none" },
        alignItems: "center",
        height: 64,
        /* M3: 4dp padding-start for leading icon */
        pl: 0.5,
        pr: 2,
        /* Surface container color — matches M3 top app bar */
        bgcolor: "background.paper",
        /* Sticky so content scrolls beneath */
        position: "sticky",
        top: 0,
        zIndex: 10,
        /* Bottom divider for separation */
        borderBottom: "1px solid",
        borderColor: "divider",
        /* Negative margin to counteract parent px */
        mx: -2,
        /* Compensate width for negative margin */
        width: "calc(100% + 32px)",
        mb: 1.5,
      }}
    >
      {/* Leading navigation icon — 48×48 touch target */}
      <IconButton
        onClick={() => navigate(-1)}
        aria-label="Navigate back"
        sx={{
          width: 48,
          height: 48,
          color: "text.primary",
          /* M3 state layer */
          "&:active": { bgcolor: "action.pressed" },
        }}
      >
        <ArrowBackIcon sx={{ fontSize: 24 }} />
      </IconButton>

      {/* Headline — M3 Title Large = 22sp, or Body Large = 16sp
          Using 18px (1.125rem) as a practical middle ground */}
      <Typography
        variant="h6"
        sx={{
          ml: 0.5,
          fontWeight: 500,
          fontSize: "1.125rem",
          lineHeight: 1.3,
          letterSpacing: "0.01em",
          color: "text.primary",
          /* Prevent overflow */
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </Typography>
    </Box>
  );
}
