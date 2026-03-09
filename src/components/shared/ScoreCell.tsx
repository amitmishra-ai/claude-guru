import Box from "@mui/material/Box";
import TableCell from "@mui/material/TableCell";

/**
 * Heatmap-colored table cell for rating scores.
 * Extracted from Profile local ScoreCell (lines 90-107).
 *
 * Colors read from --gl-score-* CSS tokens with 4-tier thresholds:
 *   ≥ 4.7 → excellent (green)
 *   ≥ 4.4 → good (amber)
 *   ≥ 4.0 → fair (orange)
 *   < 4.0 → poor (red)
 */

function scoreTier(value: number): "excellent" | "good" | "fair" | "poor" {
  if (value >= 4.7) return "excellent";
  if (value >= 4.4) return "good";
  if (value >= 4.0) return "fair";
  return "poor";
}

export function ScoreCell({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <TableCell
        sx={{ fontSize: 12, color: "text.disabled", textAlign: "center" }}
      >
        –
      </TableCell>
    );
  }

  const tier = scoreTier(value);

  return (
    <TableCell sx={{ textAlign: "center", px: 1, py: 0.5 }}>
      <Box
        sx={{
          bgcolor: `var(--gl-score-${tier}-bg)`,
          color: `var(--gl-score-${tier}-text)`,
          borderRadius: 1,
          px: 0.75,
          py: 0.25,
          fontSize: 11,
          fontWeight: 500,
          display: "inline-block",
        }}
      >
        {value.toFixed(1)}
      </Box>
    </TableCell>
  );
}
