import { forwardRef, useImperativeHandle, useState } from "react";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import { DOW_LONG, timeOptions24 } from "@/lib/constants";
import { parseHHMM, fmtTime, fmtTime12, formatDayGroupShort } from "@/lib/helpers";
import type { PresetCard, Pattern } from "@/lib/types";

export const defaultPresets: PresetCard[] = [
  { key: "weekends", label: "Weekend morning", days: ["Saturday", "Sunday"], start: "10:00", end: "12:00", enabled: false },
  { key: "weekendAfternoons", label: "Weekend afternoon", days: ["Saturday", "Sunday"], start: "14:00", end: "16:00", enabled: false },
  { key: "weekdayEvenings", label: "Weekday evenings", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], start: "18:00", end: "20:00", enabled: false },
];

export type WeeklySlotsHandle = {
  /**
   * Commits any in-progress inline edit / open custom-slot form and returns the
   * final cards + drafts synchronously (so callers don't have to wait for state).
   * Also applies the commit through the change callbacks and clears edit state.
   */
  flush: () => { cards: PresetCard[]; drafts: Pattern[] };
};

export interface WeeklySlotsEditorProps {
  cards: PresetCard[];
  onCardsChange: (cards: PresetCard[]) => void;
  drafts: Pattern[];
  onDraftsChange: (drafts: Pattern[]) => void;
  builderDays: string[];
  onBuilderDaysChange: (days: string[]) => void;
  builderStart: string;
  onBuilderStartChange: (v: string) => void;
  builderEnd: string;
  onBuilderEndChange: (v: string) => void;
}

/**
 * The "Weekly slots" editor body shared between the Guru's Update availability
 * wizard (AvailabilityBuilderDialog, wired to Redux) and the PM/GM Ninja
 * "Mark availability" dialog (wired to local state). Fully controlled: the
 * committed data (cards + drafts) and the custom-slot scratch inputs come from
 * props; only transient inline-edit UI state lives internally.
 */
const WeeklySlotsEditor = forwardRef<WeeklySlotsHandle, WeeklySlotsEditorProps>(function WeeklySlotsEditor(
  {
    cards,
    onCardsChange,
    drafts,
    onDraftsChange,
    builderDays,
    onBuilderDaysChange,
    builderStart,
    onBuilderStartChange,
    builderEnd,
    onBuilderEndChange,
  },
  ref
) {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [editingPresetKey, setEditingPresetKey] = useState<string | null>(null);
  const [editPresetStart, setEditPresetStart] = useState("");
  const [editPresetEnd, setEditPresetEnd] = useState("");
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editDraftDays, setEditDraftDays] = useState<string[]>([]);
  const [editDraftStart, setEditDraftStart] = useState("");
  const [editDraftEnd, setEditDraftEnd] = useState("");

  const togglePreset = (key: string) => {
    onCardsChange(cards.map((c) => (c.key === key ? { ...c, enabled: !c.enabled } : c)));
  };

  const toggleDay = (day: string) => {
    onBuilderDaysChange(
      builderDays.includes(day) ? builderDays.filter((d) => d !== day) : [...builderDays, day]
    );
  };

  const addCustomSlot = () => {
    if (!builderDays.length) return;
    const label = `${formatDayGroupShort(builderDays)} ${fmtTime12(parseHHMM(builderStart))}–${fmtTime12(parseHHMM(builderEnd))}`;
    onDraftsChange([
      ...drafts,
      { id: `custom-${Date.now()}`, label, days: [...builderDays], start: parseHHMM(builderStart), end: parseHHMM(builderEnd) },
    ]);
    onBuilderDaysChange([]);
    onBuilderStartChange("10:00");
    onBuilderEndChange("12:00");
    setShowCustomForm(false);
  };

  const removeCustomSlot = (id: string) => {
    onDraftsChange(drafts.filter((p) => p.id !== id));
  };

  useImperativeHandle(ref, () => ({
    flush: () => {
      let finalCards = cards;
      if (editingPresetKey && editPresetStart && editPresetEnd) {
        finalCards = cards.map((c) =>
          c.key === editingPresetKey ? { ...c, start: editPresetStart, end: editPresetEnd } : c
        );
        onCardsChange(finalCards);
        setEditingPresetKey(null);
      }

      let finalDrafts = drafts;
      if (editingDraftId && editDraftDays.length > 0 && editDraftStart && editDraftEnd) {
        const label = `${formatDayGroupShort(editDraftDays)} ${fmtTime12(parseHHMM(editDraftStart))}–${fmtTime12(parseHHMM(editDraftEnd))}`;
        finalDrafts = drafts.map((d) =>
          d.id === editingDraftId
            ? { ...d, label, days: editDraftDays, start: parseHHMM(editDraftStart), end: parseHHMM(editDraftEnd) }
            : d
        );
        onDraftsChange(finalDrafts);
        setEditingDraftId(null);
      }

      if (showCustomForm && builderDays.length > 0) {
        const label = `${formatDayGroupShort(builderDays)} ${fmtTime12(parseHHMM(builderStart))}–${fmtTime12(parseHHMM(builderEnd))}`;
        finalDrafts = [
          ...finalDrafts,
          { id: `custom-${Date.now()}`, label, days: [...builderDays], start: parseHHMM(builderStart), end: parseHHMM(builderEnd) },
        ];
        onDraftsChange(finalDrafts);
        setShowCustomForm(false);
      }

      return { cards: finalCards, drafts: finalDrafts };
    },
  }));

  return (
    <Stack spacing={1.5}>
      {/* Active slots - enabled presets + custom drafts */}
      {(cards.filter((c) => c.enabled).length > 0 || drafts.length > 0) && (
        <>
          <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.8rem" }}>
            Added slots
          </Typography>
          <Stack spacing={1}>
            {cards.filter((c) => c.enabled).map((card) =>
              editingPresetKey === card.key ? (
                <Paper key={card.key} variant="outlined" sx={{ p: 1.25, borderRadius: "8px", borderColor: "primary.main" }}>
                  <Typography variant="caption" fontWeight={600} sx={{ display: "block", mb: "1rem", fontSize: "0.7rem" }}>{card.label}</Typography>
                  <Stack direction="row" spacing={0.75} sx={{ mb: "1rem" }}>
                    <FormControl fullWidth size="small" sx={{ "& .MuiInputBase-root": { height: 32, fontSize: "0.75rem" }, "& .MuiInputLabel-root": { fontSize: "0.7rem" } }}>
                      <InputLabel>Start</InputLabel>
                      <Select label="Start" value={editPresetStart} onChange={(e) => setEditPresetStart(e.target.value)} MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}>
                        {timeOptions24.map((opt) => <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.75rem", minHeight: 28 }}>{opt.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small" sx={{ "& .MuiInputBase-root": { height: 32, fontSize: "0.75rem" }, "& .MuiInputLabel-root": { fontSize: "0.7rem" } }}>
                      <InputLabel>End</InputLabel>
                      <Select label="End" value={editPresetEnd} onChange={(e) => setEditPresetEnd(e.target.value)} MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}>
                        {timeOptions24.map((opt) => <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.75rem", minHeight: 28 }}>{opt.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Stack>
                  <Stack direction="row" spacing={0.75}>
                    <Button size="small" variant="contained" sx={{ textTransform: "none", fontSize: "0.7rem", py: 0.25 }} onClick={() => {
                      onCardsChange(cards.map((c) => c.key === card.key ? { ...c, start: editPresetStart, end: editPresetEnd } : c));
                      setEditingPresetKey(null);
                    }}>Save</Button>
                    <Button size="small" variant="text" color="inherit" sx={{ textTransform: "none", fontSize: "0.7rem", py: 0.25 }} onClick={() => setEditingPresetKey(null)}>Cancel</Button>
                  </Stack>
                </Paper>
              ) : (
                <Paper key={card.key} variant="outlined" sx={{ px: 1.5, py: 1, borderRadius: "8px", bgcolor: "action.hover" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" fontWeight={600} sx={{ display: "block", mb: 0.25 }}>{card.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDayGroupShort(card.days)} · {fmtTime12(parseHHMM(card.start))} – {fmtTime12(parseHHMM(card.end))}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.25}>
                      <IconButton size="small" onClick={() => { setEditingPresetKey(card.key); setEditPresetStart(card.start); setEditPresetEnd(card.end); }}>
                        <EditOutlinedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => togglePreset(card.key)}>
                        <CloseOutlinedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Paper>
              )
            )}
            {drafts.map((p) =>
              editingDraftId === p.id ? (
                <Paper key={p.id} variant="outlined" sx={{ p: 1.25, borderRadius: "8px", borderColor: "primary.main" }}>
                  <Typography variant="caption" fontWeight={600} sx={{ display: "block", mb: "1rem", fontSize: "0.7rem" }}>Edit custom slot</Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.4, mb: 1.5 }}>
                    {DOW_LONG.map((day) => {
                      const selected = editDraftDays.includes(day);
                      return (
                        <Chip key={day} label={day.slice(0, 3)} size="small"
                          onClick={() => setEditDraftDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day])}
                          sx={{ height: 24, width: 44, fontSize: "0.65rem", fontWeight: 600, border: "none", "& .MuiChip-label": { px: 0, width: "100%", textAlign: "center" }, cursor: "pointer", transition: "all 0.15s", ...(selected ? { bgcolor: "primary.main", color: "primary.contrastText", "&:hover": { bgcolor: "primary.dark" } } : { bgcolor: "hsl(var(--md-surface-container) / 0.8)", color: "text.secondary", "&:hover": { bgcolor: "action.hover" } }) }}
                        />
                      );
                    })}
                  </Box>
                  <Stack direction="row" spacing={0.75} sx={{ mb: "1rem" }}>
                    <FormControl fullWidth size="small" sx={{ "& .MuiInputBase-root": { height: 32, fontSize: "0.75rem" }, "& .MuiInputLabel-root": { fontSize: "0.7rem" } }}>
                      <InputLabel>Start</InputLabel>
                      <Select label="Start" value={editDraftStart} onChange={(e) => setEditDraftStart(e.target.value)} MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}>
                        {timeOptions24.map((opt) => <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.75rem", minHeight: 28 }}>{opt.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small" sx={{ "& .MuiInputBase-root": { height: 32, fontSize: "0.75rem" }, "& .MuiInputLabel-root": { fontSize: "0.7rem" } }}>
                      <InputLabel>End</InputLabel>
                      <Select label="End" value={editDraftEnd} onChange={(e) => setEditDraftEnd(e.target.value)} MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}>
                        {timeOptions24.map((opt) => <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.75rem", minHeight: 28 }}>{opt.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Stack>
                  <Stack direction="row" spacing={0.75}>
                    <Button size="small" variant="contained" disabled={!editDraftDays.length} sx={{ textTransform: "none", fontSize: "0.7rem", py: 0.25 }} onClick={() => {
                      const label = `${formatDayGroupShort(editDraftDays)} ${fmtTime12(parseHHMM(editDraftStart))}–${fmtTime12(parseHHMM(editDraftEnd))}`;
                      onDraftsChange(drafts.map((d) => d.id === p.id ? { ...d, label, days: editDraftDays, start: parseHHMM(editDraftStart), end: parseHHMM(editDraftEnd) } : d));
                      setEditingDraftId(null);
                    }}>Save</Button>
                    <Button size="small" variant="text" color="inherit" sx={{ textTransform: "none", fontSize: "0.7rem", py: 0.25 }} onClick={() => setEditingDraftId(null)}>Cancel</Button>
                  </Stack>
                </Paper>
              ) : (
                <Paper key={p.id} variant="outlined" sx={{ px: 1.5, py: 1, borderRadius: "8px", bgcolor: "action.hover" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" fontWeight={600} sx={{ display: "block", mb: 0.25 }}>Custom time slot</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDayGroupShort(p.days)} · {fmtTime12(p.start)} – {fmtTime12(p.end)}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.25}>
                      <IconButton size="small" onClick={() => {
                        setEditingDraftId(p.id);
                        setEditDraftDays([...p.days]);
                        setEditDraftStart(fmtTime(p.start));
                        setEditDraftEnd(fmtTime(p.end));
                      }}>
                        <EditOutlinedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => removeCustomSlot(p.id)}>
                        <CloseOutlinedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Paper>
              )
            )}
          </Stack>
        </>
      )}

      {/* Popular slots - unselected presets */}
      {cards.filter((c) => !c.enabled).length > 0 && (
        <>
          {(cards.filter((c) => c.enabled).length > 0 || drafts.length > 0) && <Divider sx={{ my: 0.5 }} />}
          <Box sx={{ mb: 0.75 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.8rem", lineHeight: 1 }}>Popular slots</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem", lineHeight: 1 }}>
              Adding these helps you get scheduled faster.
            </Typography>
          </Box>
          {cards.filter((c) => !c.enabled).map((card) => (
            <Stack key={card.key} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.5 }}>
              <Box>
                <Typography variant="caption" fontWeight={600} sx={{ display: "block" }}>{card.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDayGroupShort(card.days)} · {fmtTime12(parseHHMM(card.start))} – {fmtTime12(parseHHMM(card.end))}
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.5}>
                <Button size="small" variant="text" sx={{ textTransform: "none", minWidth: 0, px: 1 }} onClick={() => { setEditingPresetKey(card.key); setEditPresetStart(card.start); setEditPresetEnd(card.end); togglePreset(card.key); }}>Edit</Button>
                <Button size="small" variant="soft" sx={{ textTransform: "none" }} onClick={() => togglePreset(card.key)}>Add</Button>
              </Stack>
            </Stack>
          ))}
        </>
      )}

      {/* Add custom slot */}
      {showCustomForm ? (
        <Paper variant="outlined" sx={{ p: 1.25, borderRadius: "8px", borderColor: "primary.main" }}>
          <Typography variant="caption" fontWeight={600} sx={{ display: "block", mb: 0.75, fontSize: "0.7rem" }}>Add custom slot</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.4, mb: 1.5 }}>
            {DOW_LONG.map((day) => {
              const selected = builderDays.includes(day);
              return (
                <Chip key={day} label={day.slice(0, 3)} size="small"
                  onClick={() => toggleDay(day)}
                  sx={{ height: 24, width: 44, fontSize: "0.65rem", fontWeight: 600, border: "none", "& .MuiChip-label": { px: 0, width: "100%", textAlign: "center" }, cursor: "pointer", transition: "all 0.15s", ...(selected ? { bgcolor: "primary.main", color: "primary.contrastText", "&:hover": { bgcolor: "primary.dark" } } : { bgcolor: "hsl(var(--md-surface-container) / 0.8)", color: "text.secondary", "&:hover": { bgcolor: "action.hover" } }) }}
                />
              );
            })}
          </Box>
          <Stack direction="row" spacing={0.75} sx={{ mb: 0.75 }}>
            <FormControl fullWidth size="small" sx={{ "& .MuiInputBase-root": { height: 32, fontSize: "0.75rem" }, "& .MuiInputLabel-root": { fontSize: "0.7rem" } }}>
              <InputLabel>Start</InputLabel>
              <Select label="Start" value={builderStart} onChange={(e) => onBuilderStartChange(e.target.value)} MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}>
                {timeOptions24.map((opt) => <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.75rem", minHeight: 28 }}>{opt.label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" sx={{ "& .MuiInputBase-root": { height: 32, fontSize: "0.75rem" }, "& .MuiInputLabel-root": { fontSize: "0.7rem" } }}>
              <InputLabel>End</InputLabel>
              <Select label="End" value={builderEnd} onChange={(e) => onBuilderEndChange(e.target.value)} MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}>
                {timeOptions24.map((opt) => <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.75rem", minHeight: 28 }}>{opt.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={0.75} justifyContent="flex-end">
            <Button size="small" variant="text" color="inherit" onClick={() => setShowCustomForm(false)} sx={{ textTransform: "none", fontSize: "0.7rem", py: 0.25 }}>Cancel</Button>
            <Button size="small" variant="contained" onClick={addCustomSlot} disabled={!builderDays.length} sx={{ textTransform: "none", fontSize: "0.7rem", py: 0.25 }}>Add</Button>
          </Stack>
        </Paper>
      ) : (
        <Button variant="soft" size="small" startIcon={<AddOutlinedIcon sx={{ fontSize: 14 }} />} onClick={() => setShowCustomForm(true)} sx={{ alignSelf: "flex-start", textTransform: "none" }}>
          Custom slot
        </Button>
      )}
    </Stack>
  );
});

export default WeeklySlotsEditor;
