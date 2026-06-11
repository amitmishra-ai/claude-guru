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
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import LanguageIcon from "@mui/icons-material/Language";

import { timeOptions12, DOW_LONG } from "@/lib/constants";
import { parseHHMM } from "@/lib/helpers";
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
 * Date field that shows a clean outlined resting state (label sitting inside,
 * no native dd/mm/yyyy) when empty, and becomes a real date picker on focus.
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
  const [focused, setFocused] = useState(false);
  const asDate = focused || !!value;
  return (
    <TextField
      label={label}
      type={asDate ? "date" : "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      size="small"
      fullWidth
      slotProps={{
        inputLabel: { shrink: asDate },
        htmlInput: min ? { min } : undefined,
      }}
    />
  );
}

/** Day-of-week toggle chips, styled like the shared Weekly slots editor. */
function DayChips({ selected, onToggle }: { selected: string[]; onToggle: (d: string) => void }) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.4 }}>
      {DOW_LONG.map((day) => {
        const on = selected.includes(day);
        return (
          <Chip
            key={day}
            label={day.slice(0, 3)}
            size="small"
            onClick={() => onToggle(day)}
            sx={{
              height: 24,
              width: 44,
              fontSize: "0.65rem",
              fontWeight: 600,
              border: "none",
              "& .MuiChip-label": { px: 0, width: "100%", textAlign: "center" },
              cursor: "pointer",
              transition: "all 0.15s",
              ...(on
                ? { bgcolor: "primary.main", color: "primary.contrastText", "&:hover": { bgcolor: "primary.dark" } }
                : { bgcolor: "hsl(var(--md-surface-container) / 0.8)", color: "text.secondary", "&:hover": { bgcolor: "action.hover" } }),
            }}
          />
        );
      })}
    </Box>
  );
}

export default function MarkAvailabilityDialog({
  open,
  onClose,
  guruName,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  guruName: string;
  onSaved: (message: string) => void;
}) {
  const [mode, setMode] = useState<Mode>("dates");

  // Specific dates — one date (start === end) or a range (end after start).
  // Dates start empty so the user actively picks them.
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [days, setDays] = useState<string[]>([...DOW_LONG]);
  const isRange = !!startDate && !!endDate && endDate > startDate;

  // Weekly slots (shared editor — same flow as the Guru's Update availability)
  const [cards, setCards] = useState<PresetCard[]>(defaultPresets);
  const [drafts, setDrafts] = useState<Pattern[]>([]);
  const [builderDays, setBuilderDays] = useState<string[]>([]);
  const [builderStart, setBuilderStart] = useState("10:00");
  const [builderEnd, setBuilderEnd] = useState("12:00");
  const editorRef = useRef<WeeklySlotsHandle>(null);

  const toggle = (list: string[], d: string) =>
    list.includes(d) ? list.filter((x) => x !== d) : [...list, d];

  const datesFilled = !!startDate && !!endDate;
  const timesFilled = !!fromTime && !!toTime;
  const datesError =
    datesFilled && endDate < startDate
      ? "End date must be on or after the start date."
      : timesFilled && parseHHMM(toTime) <= parseHHMM(fromTime)
        ? "End time must be after start time."
        : datesFilled && isRange && days.length === 0
          ? "Select at least one day."
          : null;
  const weeklyInvalid = !cards.some((c) => c.enabled) && drafts.length === 0;

  const actionDisabled =
    mode === "weekly"
      ? weeklyInvalid
      : !datesFilled || !timesFilled || datesError !== null;

  function handleSave() {
    let msg = `Availability marked for ${guruName}`;
    if (mode === "weekly") {
      const flushed = editorRef.current?.flush() ?? { cards, drafts };
      const count = flushed.cards.filter((c) => c.enabled).length + flushed.drafts.length;
      msg = `${count} weekly slot${count === 1 ? "" : "s"} saved for ${guruName}`;
    }
    onSaved(msg);
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
            {isRange && (
              <Box>
                <Typography variant="subtitle2" sx={{ display: "block", mb: 1.5 }}>
                  Apply on days
                </Typography>
                <DayChips selected={days} onToggle={(d) => setDays((l) => toggle(l, d))} />
              </Box>
            )}
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
