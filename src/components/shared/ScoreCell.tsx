import Box from "@mui/material/Box";
import TableCell from "@mui/material/TableCell";

/**
 * Heatmap-colored table cell for rating scores.
 *
 * 3-tier thresholds matched to the dashboard's traffic-light scheme:
 *   ≥ 4.5 → excellent (green)
 *   ≥ 4.0 → good (amber/yellow)
 *   < 4.0 → poor (red)
 */

function scoreTier(value: number): "excellent" | "good" | "poor" {
  if (value >= 4.5) return "excellent";
  if (value >= 4.0) return "good";
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
          borderRadius: "4px",
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
