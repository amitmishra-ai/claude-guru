import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import { getActivityVisual } from "@/lib/activity-visuals";
import type { SessionType } from "@/lib/types";

/* ════════════════════════════════════════════════════════════════════════
   ActivitySpine
   ────────────────────────────────────────────────────────────────────────
   Vertical date column at the left of every activity card. DOW (in the
   activity-type color) · large day number · month uppercase. No border —
   the parent card draws the surrounding outline; the spine ends in a
   hairline that visually divides it from the content column.

   The component is also exported under its legacy name `ActivityDateTile`
   so existing imports keep working without churn.
   ════════════════════════════════════════════════════════════════════════ */

const MONTHS_SHORT = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const DOWS = ["SUN","MON","TUE","WED","THU","FRI","SAT"];

const HAIRLINE = "rgba(15, 23, 42, 0.10)";
const TABULAR = { fontFeatureSettings: '"tnum", "ss01"', fontVariantNumeric: "tabular-nums" } as const;

function parts(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d);
  return { y, m, d, mon: MONTHS_SHORT[(m || 1) - 1], dow: DOWS[dt.getDay()] };
}

export type ActivitySpineProps = {
  /** Start date (YYYY-MM-DD) */
  dateYmd: string;
  /** Optional end date for multi-day activities — used only to derive cross-month month label. */
  endDateYmd?: string;
  /** Activity type — selects the type accent color used for the DOW */
  sessionType?: SessionType | string;
  /** Compact mode for mobile / dense rows */
  size?: "sm" | "md";
  sx?: SxProps<Theme>;
};

export function ActivitySpine({ dateYmd, sessionType, size = "md", sx }: ActivitySpineProps) {
  const visual = getActivityVisual(sessionType);
  const start = parts(dateYmd);

  const minW = size === "sm" ? 64 : 80;
  const padX = size === "sm" ? 1.25 : 2;
  const padY = size === "sm" ? 1.75 : 2;
  const dayFs = size === "sm" ? "1.25rem" : "1.5rem";

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{
        flex: "0 0 auto",
        minWidth: minW,
        px: padX,
        py: padY,
        borderRight: `1px solid ${HAIRLINE}`,
        ...sx,
      }}
    >
      <Typography
        variant="overline"
        sx={{
          fontWeight: 600,
          color: visual.color,
          lineHeight: 1.4,
          mb: 0.5,
        }}
      >
        {start.dow}
      </Typography>
      <Typography
        sx={{
          fontSize: dayFs,
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: "text.primary",
          ...TABULAR,
        }}
      >
        {start.d}
      </Typography>
      <Typography
        variant="overline"
        sx={{
          fontWeight: 600,
          color: "text.secondary",
          lineHeight: 1.4,
          mt: 0.5,
        }}
      >
        {start.mon}
      </Typography>
    </Stack>
  );
}

/* Legacy export alias — existing imports keep working */
export const ActivityDateTile = ActivitySpine;
export type ActivityDateTileProps = ActivitySpineProps;

/* re-export so any new code reaches for the right component */
export default ActivitySpine;
