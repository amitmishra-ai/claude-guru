import Chip from "@mui/material/Chip";
import type { SxProps, Theme } from "@mui/material/styles";

/**
 * Program badge chip — reads colors from --gl-program-* CSS tokens.
 * Extracted from Courses local PROGRAM_COLORS (lines 72-83).
 *
 * Known programs: PGDM, AIML, PGP-SE, Core, PGP-DS.
 * Falls back to --gl-program-default-* for unknown programs.
 */

const PROGRAM_KEYS: Record<string, string> = {
  PGDM: "pgdm",
  AIML: "aiml",
  "PGP-SE": "pgpse",
  Core: "core",
  "PGP-DS": "pgpds",
};

export function ProgramBadge({
  program,
  sx,
}: {
  program: string;
  sx?: SxProps<Theme>;
}) {
  const key = PROGRAM_KEYS[program] ?? "default";

  return (
    <Chip
      label={program}
      size="small"
      sx={{
        bgcolor: `var(--gl-program-${key}-bg)`,
        color: `var(--gl-program-${key}-text)`,
        fontSize: "0.65rem",
        height: 20,
        fontWeight: 600,
        ...sx,
      }}
    />
  );
}
