import { useMemo } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { useAppSelector, useAppDispatch } from "@/store";
import { setTimeZoneMode, setManualTimeZone } from "@/store/slices/profileSlice";
import { setOpenTimezone } from "@/store/slices/uiSlice";
import { getTimeZoneOffsetMinutes, formatGMTOffsetFromMinutesAhead } from "@/lib/helpers";
import { demoNow } from "@/lib/constants";

const manualTimeZoneOptions = [
  { value: "Asia/Kolkata", label: "Asia/Kolkata (India)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (UAE)" },
  { value: "Asia/Singapore", label: "Asia/Singapore" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "Europe/Berlin", label: "Europe/Berlin" },
  { value: "America/New_York", label: "America/New_York" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles" },
  { value: "Australia/Sydney", label: "Australia/Sydney" },
];

function utcLabelForTimeZone(timeZone: string) {
  try {
    const ahead = getTimeZoneOffsetMinutes(timeZone, demoNow);
    return formatGMTOffsetFromMinutesAhead(ahead).replace("GMT", "UTC");
  } catch {
    return "UTC";
  }
}

export function TimezoneDialog() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.openTimezone);
  const timeZoneMode = useAppSelector((s) => s.profile.timeZoneMode);
  const manualTimeZone = useAppSelector((s) => s.profile.manualTimeZone);

  const effectiveTimeZone = useMemo(() => {
    if (timeZoneMode === "manual") return manualTimeZone;
    const tz = Intl.DateTimeFormat().resolvedOptions?.().timeZone;
    return tz || "Asia/Kolkata";
  }, [timeZoneMode, manualTimeZone]);

  const effectiveGmt = useMemo(() => {
    try {
      const ahead = getTimeZoneOffsetMinutes(effectiveTimeZone, demoNow);
      return formatGMTOffsetFromMinutesAhead(ahead);
    } catch {
      return "GMT+5:30";
    }
  }, [effectiveTimeZone]);

  return (
    <Dialog open={open} onClose={() => dispatch(setOpenTimezone(false))}>
      <DialogTitle>Timezone</DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box
            sx={{
              borderRadius: "16px",
              border: 1,
              borderColor: "divider",
              backgroundColor: "hsl(var(--md-surface-container) / 0.3)",
              p: 1.5,
              fontSize: "0.875rem",
              color: "hsl(var(--md-on-surface-variant))",
            }}
          >
            Choose which timezone you want to view the schedule in.
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="timezone-mode-label">Timezone</InputLabel>
              <Select
                labelId="timezone-mode-label"
                value={timeZoneMode}
                label="Timezone"
                onChange={(e: SelectChangeEvent) => dispatch(setTimeZoneMode(e.target.value as "auto" | "manual"))}
              >
                <MenuItem value="auto">Use system timezone</MenuItem>
                <MenuItem value="manual">Choose another timezone</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ fontSize: "0.75rem", color: "hsl(var(--md-on-surface-variant))" }}>
              Current: <Typography component="span" sx={{ fontWeight: 500, fontSize: "0.75rem", color: "hsl(var(--md-on-surface))" }}>{effectiveTimeZone}</Typography> ({effectiveGmt})
            </Box>
          </Box>

          {timeZoneMode === "manual" ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="manual-timezone-label">Select a timezone</InputLabel>
                <Select
                  labelId="manual-timezone-label"
                  value={manualTimeZone}
                  label="Select a timezone"
                  onChange={(e: SelectChangeEvent) => dispatch(setManualTimeZone(e.target.value))}
                  renderValue={(selected) => {
                    const option = manualTimeZoneOptions.find((tz) => tz.value === selected);
                    return (
                      <Box sx={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", pr: 2.5 }}>
                        <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {option?.label || selected}
                        </Box>
                        <Box component="span" sx={{ ml: 1.5, flexShrink: 0, fontSize: "0.75rem", color: "hsl(var(--md-on-surface-variant))" }}>
                          {utcLabelForTimeZone(selected)}
                        </Box>
                      </Box>
                    );
                  }}
                  MenuProps={{ PaperProps: { style: { maxHeight: 288 } } }}
                >
                  {manualTimeZoneOptions.map((tz) => {
                    const utcLabel = utcLabelForTimeZone(tz.value);
                    return (
                      <MenuItem key={tz.value} value={tz.value}>
                        <Box sx={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", gap: 1.5, pr: 0.5 }}>
                          <span>{tz.label}</span>
                          <Box component="span" sx={{ fontSize: "0.75rem", color: "hsl(var(--md-on-surface-variant))" }}>{utcLabel}</Box>
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              <Box sx={{ fontSize: "0.75rem", color: "hsl(var(--md-on-surface-variant))" }}>
                Offset updates based on today's date (DST aware where applicable).
              </Box>
            </Box>
          ) : null}

          <Box
            sx={{
              borderRadius: "12px",
              border: 1,
              borderColor: "var(--gl-status-pending-border)",
              backgroundColor: "var(--gl-status-pending-bg)",
              p: 1.5,
              fontSize: "0.875rem",
              color: "var(--gl-status-pending-text)",
            }}
          >
            Prototype note: changing timezone updates the indicator. This demo does not convert session times across timezones.
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={() => dispatch(setOpenTimezone(false))}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
