import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";

/**
 * Compact stat card - icon avatar + label + value.
 * Extracted from Dashboard local StatTile (lines 91-138).
 *
 * The icon background uses the `color` prop at 8% opacity.
 */
export function StatTile({
  icon: Icon,
  label,
  value,
  color = "primary.main",
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  /** MUI palette path or CSS color for the icon accent */
  color?: string;
  onClick?: () => void;
}) {
  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        p: 2,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.15s",
        "&:hover": onClick
          ? { borderColor: "primary.main", bgcolor: "action.hover" }
          : {},
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: `${color}15`,
            color,
          }}
        >
          <Icon size={20} />
        </Avatar>
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ lineHeight: 1.2 }}
          >
            {label}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}
