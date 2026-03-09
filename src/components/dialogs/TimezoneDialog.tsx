import { useMemo } from "react";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
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
    <Dialog
      open={open}
      onClose={() => dispatch(setOpenTimezone(false))}
    >
      <DialogTitle>Timezone</DialogTitle>

      <DialogContent>
        <div className="space-y-4">
          <div className="rounded-2xl border bg-surface-container/30 p-3 text-sm text-on-surface-variant">
            Choose which timezone you want to view the schedule in.
          </div>

          <div className="space-y-2">
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
            <div className="text-xs text-on-surface-variant">
              Current: <span className="font-medium text-on-surface">{effectiveTimeZone}</span> ({effectiveGmt})
            </div>
          </div>

          {timeZoneMode === "manual" ? (
            <div className="space-y-2">
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
                      <div className="flex w-full items-center justify-between pr-5">
                        <span className="truncate">
                          {option?.label || selected}
                        </span>
                        <span className="ml-3 shrink-0 text-xs text-on-surface-variant">
                          {utcLabelForTimeZone(selected)}
                        </span>
                      </div>
                    );
                  }}
                  MenuProps={{ PaperProps: { style: { maxHeight: 288 } } }}
                >
                  {manualTimeZoneOptions.map((tz) => {
                    const utcLabel = utcLabelForTimeZone(tz.value);
                    return (
                      <MenuItem key={tz.value} value={tz.value}>
                        <div className="flex w-full items-center justify-between gap-3 pr-1">
                          <span>{tz.label}</span>
                          <span className="text-xs text-on-surface-variant">{utcLabel}</span>
                        </div>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              <div className="text-xs text-on-surface-variant">Offset updates based on today's date (DST aware where applicable).</div>
            </div>
          ) : null}

          <div className="rounded-card border border-status-pending-border bg-status-pending-bg p-3 text-sm text-status-pending-text">
            Prototype note: changing timezone updates the indicator. This demo does not convert session times across timezones.
          </div>
        </div>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={() => dispatch(setOpenTimezone(false))}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
