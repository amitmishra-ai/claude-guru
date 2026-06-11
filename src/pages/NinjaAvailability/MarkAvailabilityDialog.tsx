import { useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import InputAdornment from "@mui/material/InputAdornment";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import LanguageIcon from "@mui/icons-material/Language";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";

import { timeOptions12 } from "@/lib/constants";
import { parseHHMM, hhmmFromMinutes } from "@/lib/helpers";
import type { Pattern, PresetCard } from "@/lib/types";
import WeeklySlotsEditor, {
  defaultPresets,
  type WeeklySlotsHandle,
} from "@/components/dialogs/AvailabilityBuilderDialog/WeeklySlotsEditor";

/**
 * "Mark availability" dialog for the Ninja Availability mock. Lets a PM / GM
 * mark availability on behalf of a Guru across three modes (Single Day, Date
 * Range, Weekly slots), mirroring the Guru Dashboard flow and built with the
 * same MUI components / theme tokens. Static: Save emits a confirmation and
 * closes (no persistence).
 */

type Mode = "dates" | "weekly";

const MODES: Array<{ key: Mode; label: string }> = [
  { key: "dates", label: "Specific dates" },
  { key: "weekly", label: "Weekly slots" },
];

// ---- Date helpers (native Date, no dependency) ----------------------------
const pad2 = (n: number) => String(n).padStart(2, "0");
const toYmd = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const DAY_INDEX: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};

/** Every YYYY-MM-DD from start to end inclusive. */
function eachDayYmd(startYmd: string, endYmd: string): string[] {
  const out: string[] = [];
  const d = new Date(`${startYmd}T00:00:00`);
  const end = new Date(`${endYmd}T00:00:00`);
  while (d <= end) {
    out.push(toYmd(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/** All dates in the given month matching a weekday name (e.g. "Monday"). */
function weekdayDatesInMonth(year: number, monthIndex: number, dayName: string): string[] {
  const target = DAY_INDEX[dayName];
  const out: string[] = [];
  const d = new Date(year, monthIndex, 1);
  while (d.getMonth() === monthIndex) {
    if (d.getDay() === target) out.push(toYmd(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/** Time picker matching the platform pattern (FormControl + InputLabel + Select). */
function TimeSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        MenuProps={{ PaperProps: { sx: { maxHeight: 280 } } }}
      >
        {timeOptions12.map((o) => (
          <MenuItem key={o.value} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

/**
 * Date field with a clean outlined resting state: when empty + unfocused the
 * label rests inside (the native dd/mm/yyyy is masked) and a calendar icon
 * shows on the right. Clicking anywhere in the field opens the date picker.
 */
function DateField({
  label,
  value,
  onChange,
  min,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  min?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const shrink = focused || !!value;

  const openPicker = () => {
    const el = inputRef.current;
    if (el && typeof el.showPicker === "function") {
      try {
        el.showPicker();
        return;
      } catch {
        /* fall through to focus */
      }
    }
    el?.focus();
  };

  return (
    <TextField
      label={label}
      type="date"
      value={value}
      inputRef={inputRef}
      onChange={(e) => onChange(e.target.value)}
      onClick={openPicker}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      size="small"
      fullWidth
      slotProps={{
        inputLabel: { shrink },
        htmlInput: min ? { min } : undefined,
        input: {
          endAdornment: (
            <InputAdornment position="end" sx={{ pointerEvents: "none" }}>
              <CalendarTodayOutlinedIcon sx={{ fontSize: 17, color: "action.active" }} />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        cursor: "pointer",
        "& input": { cursor: "pointer" },
        // We provide our own calendar icon, so hide the browser's default one.
        "& input::-webkit-calendar-picker-indicator": {
          display: "none",
          WebkitAppearance: "none",
          margin: 0,
        },
        // Mask the dd/mm/yyyy placeholder while empty so the label can rest inside.
        ...(!shrink && {
          "& input::-webkit-datetime-edit": { color: "transparent" },
        }),
      }}
    />
  );
}

export default function MarkAvailabilityDialog({
  open,
  onClose,
  guruName,
  viewYear,
  viewMonthIndex,
  onAddSlots,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  guruName: string;
  viewYear: number;
  viewMonthIndex: number;
  onAddSlots: (slots: Array<{ dateYmd: string; start: string; end: string }>) => void;
  onSaved: (message: string) => void;
}) {
  const [mode, setMode] = useState<Mode>("dates");

  // Specific dates — one date (start === end) or a range (end after start).
  // Dates start empty so the user actively picks them.
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

  // Weekly slots (shared editor — same flow as the Guru's Update availability)
  const [cards, setCards] = useState<PresetCard[]>(defaultPresets);
  const [drafts, setDrafts] = useState<Pattern[]>([]);
  const [builderDays, setBuilderDays] = useState<string[]>([]);
  const [builderStart, setBuilderStart] = useState("10:00");
  const [builderEnd, setBuilderEnd] = useState("12:00");
  const editorRef = useRef<WeeklySlotsHandle>(null);

  const datesFilled = !!startDate && !!endDate;
  const timesFilled = !!fromTime && !!toTime;
  const datesError =
    datesFilled && endDate < startDate
      ? "End date must be on or after the start date."
      : timesFilled && parseHHMM(toTime) <= parseHHMM(fromTime)
        ? "End time must be after start time."
        : null;
  const weeklyInvalid = !cards.some((c) => c.enabled) && drafts.length === 0;

  const actionDisabled =
    mode === "weekly"
      ? weeklyInvalid
      : !datesFilled || !timesFilled || datesError !== null;

  function resetFields() {
    setStartDate("");
    setEndDate("");
    setFromTime("");
    setToTime("");
    setCards(defaultPresets);
    setDrafts([]);
    setBuilderDays([]);
    setBuilderStart("10:00");
    setBuilderEnd("12:00");
    setMode("dates");
  }

  function handleSave() {
    const built: Array<{ dateYmd: string; start: string; end: string }> = [];

    if (mode === "dates") {
      for (const ymd of eachDayYmd(startDate, endDate)) {
        built.push({ dateYmd: ymd, start: fromTime, end: toTime });
      }
    } else {
      // Weekly: expand enabled presets + custom drafts onto matching weekdays
      // within the month currently shown on the calendar.
      const flushed = editorRef.current?.flush() ?? { cards, drafts };
      for (const c of flushed.cards.filter((c) => c.enabled)) {
        for (const day of c.days) {
          for (const ymd of weekdayDatesInMonth(viewYear, viewMonthIndex, day)) {
            built.push({ dateYmd: ymd, start: c.start, end: c.end });
          }
        }
      }
      for (const dr of flushed.drafts) {
        const start = hhmmFromMinutes(dr.start);
        const end = hhmmFromMinutes(dr.end);
        for (const day of dr.days) {
          for (const ymd of weekdayDatesInMonth(viewYear, viewMonthIndex, day)) {
            built.push({ dateYmd: ymd, start, end });
          }
        }
      }
    }

    onAddSlots(built);
    const n = built.length;
    onSaved(`${n} slot${n === 1 ? "" : "s"} added for ${guruName}`);
    resetFields();
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "4px" } }}>
      <DialogTitle sx={{ pb: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Update availability
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              Add availability for this guru.
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.75 }}>
              <LanguageIcon sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                All times shown in Asia/Calcutta (GMT+5:30)
              </Typography>
            </Stack>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ border: 1, borderColor: "divider", borderRadius: "4px", p: 0.75 }}
          >
            <CloseOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Tabs
        value={mode}
        onChange={(_, v: Mode) => setMode(v)}
        variant="fullWidth"
        sx={{ px: 3, borderBottom: 1, borderColor: "divider" }}
      >
        {MODES.map((m) => (
          <Tab key={m.key} value={m.key} label={m.label} />
        ))}
      </Tabs>

      <DialogContent sx={{ minHeight: 220 }}>
        {mode === "dates" && (
          <Stack spacing={3} sx={{ pt: 2, pb: 1 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ display: "block", mb: 1.5 }}>
                Date
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
                <DateField
                  label="Start date"
                  value={startDate}
                  onChange={(v) => {
                    setStartDate(v);
                    // Keep end date in sync so it stays a single day until widened.
                    if (endDate < v) setEndDate(v);
                  }}
                />
                <DateField
                  label="End date"
                  value={endDate}
                  onChange={setEndDate}
                  min={startDate || undefined}
                />
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ display: "block", mb: 1.5 }}>
                Time
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
                <TimeSelect label="Start time" value={fromTime} onChange={setFromTime} />
                <TimeSelect label="End time" value={toTime} onChange={setToTime} />
              </Box>
            </Box>
            {datesError && (
              <Typography variant="caption" sx={{ color: "error.main" }}>
                {datesError}
              </Typography>
            )}
          </Stack>
        )}

        {mode === "weekly" && (
          <Box sx={{ pt: 1 }}>
            <WeeklySlotsEditor
              ref={editorRef}
              cards={cards}
              onCardsChange={setCards}
              drafts={drafts}
              onDraftsChange={setDrafts}
              builderDays={builderDays}
              onBuilderDaysChange={setBuilderDays}
              builderStart={builderStart}
              onBuilderStartChange={setBuilderStart}
              builderEnd={builderEnd}
              onBuilderEndChange={setBuilderEnd}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="text" color="inherit" onClick={onClose} sx={{ textTransform: "uppercase" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={actionDisabled}
          sx={{ textTransform: "uppercase" }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
