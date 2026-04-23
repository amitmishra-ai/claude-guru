import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { TIMEZONE_OPTIONS, fmtTimezoneOffset, getSystemTimezone } from "@/lib/timezone";

export interface TimezonePickerProps {
  /** Either "__auto__" (system) or an IANA timezone identifier. */
  value: string;
  /** Called with the new value ("__auto__" or an IANA id). */
  onChange: (next: string) => void;
  /** Overline header label. Defaults to "Select timezone". */
  header?: string;
  /** Set true to render the Select bare without the bordered header container. */
  hideHeader?: boolean;
}

/**
 * Unified timezone picker used across the app (AvailabilityBuilder,
 * TimezoneDialog, Calendar chip, Profile header link, Settings row).
 * Visual reference: the "Select timezone" step in AvailabilityBuilder.
 *
 * - Bordered rounded container with a globe icon overline (unless hidden)
 * - Single MUI Select with a two-column menu row (label on the left, UTC
 *   offset on the right, grey secondary text)
 * - First option is always "System - {resolvedTz}" mapped to "__auto__"
 */
export function TimezonePicker({ value, onChange, header = "Select timezone", hideHeader }: TimezonePickerProps) {
  const sysTz = getSystemTimezone();

  const select = (
    <FormControl fullWidth size="small">
      <Select
        displayEmpty
        value={value}
        onChange={(e) => onChange(e.target.value)}
        renderValue={(selected) => {
          const isAuto = selected === "__auto__";
          const tz = isAuto ? sysTz : (selected as string);
          return (
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: "100%", pr: 1 }}>
              <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.85rem" }}>
                {tz}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {fmtTimezoneOffset(tz)}{isAuto ? " · Auto" : ""}
              </Typography>
            </Stack>
          );
        }}
        sx={{
          bgcolor: "background.paper",
          "& .MuiSelect-select": { py: 1.25 },
        }}
        MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
      >
        {TIMEZONE_OPTIONS.map((tz) => {
          const isAuto = tz.value === "__auto__";
          const offsetTz = isAuto ? sysTz : tz.value;
          return (
            <MenuItem key={tz.value} value={tz.value} sx={{ py: 1, fontSize: "0.85rem" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: "100%" }}>
                <Typography variant="body2" sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                  {isAuto ? `System - ${sysTz}` : tz.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 2, flexShrink: 0 }}>
                  {fmtTimezoneOffset(offsetTz)}
                </Typography>
              </Stack>
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );

  if (hideHeader) return select;

  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: "8px",
        p: 2,
        bgcolor: "action.hover",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.5 }}>
        <PublicOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.03em", fontSize: "0.68rem" }}>
          {header}
        </Typography>
      </Stack>
      {select}
    </Box>
  );
}
