import { useState, useEffect } from "react";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  setAvailabilityStep,
  setAvailabilityDraftPatterns,
  setPresetCards,
  setBuilderDays,
  setBuilderStart,
  setBuilderEnd,
  setPatterns,
  setHasUserConfiguredAvailability,
} from "@/store/slices/availabilitySlice";
import { setOpenAvailability } from "@/store/slices/uiSlice";
import { setTimeZoneMode, setManualTimeZone } from "@/store/slices/profileSlice";
import { pushToast } from "@/store/slices/toastsSlice";
import { useSaveAvailabilityMutation } from "@/api/ninja/availabilityApi";
import { DOW_LONG, timeOptions12 } from "@/lib/constants";
import { parseHHMM, fmtTime, fmtTime12, formatDayGroupShort } from "@/lib/helpers";
import type { PresetCard } from "@/lib/types";

const defaultPresets: PresetCard[] = [
  { key: "weekends", label: "Weekend morning", days: ["Saturday", "Sunday"], start: "10:00", end: "12:00", enabled: false },
  { key: "weekendAfternoons", label: "Weekend afternoon", days: ["Saturday", "Sunday"], start: "14:00", end: "16:00", enabled: false },
  { key: "weekdayEvenings", label: "Weekday evenings", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], start: "18:00", end: "20:00", enabled: false },
];

const TIMEZONE_OPTIONS = [
  { value: "__auto__", label: "System timezone" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (India)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (UAE)" },
  { value: "Asia/Singapore", label: "Asia/Singapore" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "Europe/Berlin", label: "Europe/Berlin" },
  { value: "America/New_York", label: "America/New_York" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles" },
  { value: "Australia/Sydney", label: "Australia/Sydney" },
];

function fmtTimezoneDisplay(tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    const gmtOffset = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    return `${tz} (${gmtOffset.replace("GMT", "UTC")})`;
  } catch {
    return tz;
  }
}

/* ── Step indicator pill ── */
function StepPill({ stepNum, label, active, done }: { stepNum: number; label: string; active: boolean; done: boolean }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.75rem",
          fontWeight: 700,
          flexShrink: 0,
          bgcolor: done ? "var(--gl-status-confirmed-bg)" : active ? "primary.main" : "action.hover",
          color: done ? "var(--gl-status-confirmed-text)" : active ? "primary.contrastText" : "text.secondary",
          border: !active && !done ? "1px solid" : "none",
          borderColor: "divider",
        }}
      >
        {done ? <CheckCircleOutlinedIcon sx={{ fontSize: 16 }} /> : stepNum}
      </Box>
      <Typography
        variant="caption"
        sx={{
          fontWeight: active || done ? 600 : 400,
          color: active ? "text.primary" : "text.secondary",
          fontSize: { xs: "0.7rem", sm: "0.75rem" },
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
}

const AvailabilityBuilderDialog = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const open = useAppSelector((s) => s.ui.openAvailability);
  const step = useAppSelector((s) => s.availability.availabilityStep);
  const presetCards = useAppSelector((s) => s.availability.presetCards);
  const hasConfigured = useAppSelector((s) => s.availability.hasUserConfiguredAvailability);
  const existingPatterns = useAppSelector((s) => s.availability.patterns);
  const draftPatterns = useAppSelector((s) => s.availability.availabilityDraftPatterns);
  const builderDays = useAppSelector((s) => s.availability.builderDays);
  const builderStart = useAppSelector((s) => s.availability.builderStart);
  const builderEnd = useAppSelector((s) => s.availability.builderEnd);
  const timeZoneMode = useAppSelector((s) => s.profile.timeZoneMode);
  const manualTimeZone = useAppSelector((s) => s.profile.manualTimeZone);

  const [saveAvailability, { isLoading: isSaving }] = useSaveAvailabilityMutation();
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [editingPresetKey, setEditingPresetKey] = useState<string | null>(null);
  const [editPresetStart, setEditPresetStart] = useState("");
  const [editPresetEnd, setEditPresetEnd] = useState("");

  const effectiveTimezone =
    timeZoneMode === "manual"
      ? manualTimeZone
      : Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Pre-populate builder from existing patterns when editing
  useEffect(() => {
    if (open && hasConfigured && existingPatterns.length > 0 && !presetCards.length) {
      const presetKeys = defaultPresets.map((p) => p.label);
      const updatedPresets = defaultPresets.map((preset) => {
        const match = existingPatterns.find((p) => p.label === preset.label);
        if (match) {
          return { ...preset, start: fmtTime(match.start), end: fmtTime(match.end), days: [...match.days], enabled: true };
        }
        return preset;
      });
      dispatch(setPresetCards(updatedPresets));
      const custom = existingPatterns.filter((p) => !presetKeys.includes(p.label));
      if (custom.length > 0) {
        dispatch(setAvailabilityDraftPatterns(custom.map((c) => ({ id: c.id, label: c.label, days: [...c.days], start: c.start, end: c.end }))));
      }
      // Skip to step 2 since timezone is already set
      dispatch(setAvailabilityStep(2));
    }
  }, [open, hasConfigured, existingPatterns, presetCards.length, dispatch]);

  const cards = presetCards.length ? presetCards : defaultPresets;

  const handleClose = () => {
    dispatch(setOpenAvailability(false));
    dispatch(setAvailabilityStep(1));
    dispatch(setAvailabilityDraftPatterns([]));
    dispatch(setPresetCards([]));
    setShowCustomForm(false);
  };

  const handleNext = () => {
    if (!presetCards.length) dispatch(setPresetCards(defaultPresets));
    dispatch(setAvailabilityStep(2));
  };

  const handleBack = () => dispatch(setAvailabilityStep(1));

  const togglePreset = (key: string) => {
    const updated = cards.map((c) =>
      c.key === key ? { ...c, enabled: !c.enabled } : c
    );
    dispatch(setPresetCards(updated));
  };

  const toggleDay = (day: string) => {
    const newDays = builderDays.includes(day)
      ? builderDays.filter((d) => d !== day)
      : [...builderDays, day];
    dispatch(setBuilderDays(newDays));
  };

  const addCustomSlot = () => {
    if (!builderDays.length) return;
    const label = `${formatDayGroupShort(builderDays)} ${fmtTime12(parseHHMM(builderStart))}–${fmtTime12(parseHHMM(builderEnd))}`;
    const newPattern = {
      id: `custom-${Date.now()}`,
      label,
      days: [...builderDays],
      start: parseHHMM(builderStart),
      end: parseHHMM(builderEnd),
    };
    dispatch(setAvailabilityDraftPatterns([...draftPatterns, newPattern]));
    dispatch(setBuilderDays([]));
    dispatch(setBuilderStart("10:00"));
    dispatch(setBuilderEnd("12:00"));
    setShowCustomForm(false);
  };

  const removeCustomSlot = (id: string) => {
    dispatch(setAvailabilityDraftPatterns(draftPatterns.filter((p) => p.id !== id)));
  };

  const handleSave = async () => {
    const presetPatterns = cards
      .filter((c) => c.enabled)
      .map((c) => ({
        id: `preset-${c.key}`,
        label: c.label,
        days: c.days,
        start: parseHHMM(c.start),
        end: parseHHMM(c.end),
      }));
    const allPatterns = [
      ...presetPatterns,
      ...draftPatterns.map((d) => ({ id: d.id, label: d.label, days: d.days, start: d.start, end: d.end })),
    ];

    try {
      await saveAvailability({ patterns: allPatterns, maxPerWeek: 6, rangeDays: 60 }).unwrap();
      dispatch(setPatterns(allPatterns));
      dispatch(setHasUserConfiguredAvailability(true));
      dispatch(pushToast({
        title: "Availability saved",
        description: `${allPatterns.length} pattern(s) configured.`,
      }));
      handleClose();
    } catch {
      dispatch(pushToast({
        title: "Save failed",
        description: "Could not save availability. Please try again.",
        variant: "destructive",
      }));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          width: isMobile ? "100%" : 420,
          borderRadius: isMobile ? 0 : 3,
          maxHeight: isMobile ? "100%" : "90vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* ── Header ── */}
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 }, pb: 0, flexShrink: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
            Update availability
          </Typography>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{ border: 1, borderColor: "divider", borderRadius: 2, p: 0.75 }}
          >
            <CloseOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>

        {/* Step indicators */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <StepPill stepNum={1} label="Timezone" active={step === 1} done={step > 1} />
          <Box sx={{ width: 24, height: 1, bgcolor: step > 1 ? "primary.main" : "divider", flexShrink: 0 }} />
          <StepPill stepNum={2} label="Weekly slots" active={step === 2} done={false} />
        </Stack>
        <Divider />
      </Box>

      {/* ── Content ── */}
      <DialogContent
        className="themed-scrollbar"
        sx={{
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 2.5 },
          pb: 2,
          flex: 1,
          overflowY: "auto",
        }}
      >
        {step === 1 && (
          /* ── Step 1: Timezone ── */
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                Confirm your timezone
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                This ensures your availability shows the correct times to learners.
              </Typography>
            </Box>

            {/* Timezone selector */}
            <Box
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                p: 2,
                bgcolor: "action.hover",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.5 }}>
                <PublicOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.03em", fontSize: "0.68rem" }}>
                  Select timezone
                </Typography>
              </Stack>
              <FormControl fullWidth size="small">
                <Select
                  displayEmpty
                  value={timeZoneMode === "auto" ? "__auto__" : manualTimeZone}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "__auto__") {
                      dispatch(setTimeZoneMode("auto"));
                    } else {
                      dispatch(setTimeZoneMode("manual"));
                      dispatch(setManualTimeZone(val));
                    }
                  }}
                  renderValue={(selected) => {
                    if (selected === "__auto__") {
                      const sysTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                      return (
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: "100%", pr: 1 }}>
                          <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.85rem" }}>
                            {sysTz}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {fmtTimezoneDisplay(sysTz).split("(")[1]?.replace(")", "") || ""} · Auto
                          </Typography>
                        </Stack>
                      );
                    }
                    return (
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: "100%", pr: 1 }}>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.85rem" }}>
                          {selected}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {fmtTimezoneDisplay(selected).split("(")[1]?.replace(")", "") || ""}
                        </Typography>
                      </Stack>
                    );
                  }}
                  sx={{
                    bgcolor: "background.paper",
                    "& .MuiSelect-select": { py: 1.25 },
                  }}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 280 } } }}
                >
                  {TIMEZONE_OPTIONS.map((tz) => {
                    const isAuto = tz.value === "__auto__";
                    const sysTz = isAuto ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";
                    return (
                      <MenuItem key={tz.value} value={tz.value} sx={{ py: 1, fontSize: "0.85rem" }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: "100%" }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                              {isAuto ? `System — ${sysTz}` : tz.label}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 2, flexShrink: 0 }}>
                            {isAuto
                              ? fmtTimezoneDisplay(sysTz).split("(")[1]?.replace(")", "") || ""
                              : fmtTimezoneDisplay(tz.value).split("(")[1]?.replace(")", "") || ""}
                          </Typography>
                        </Stack>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
              You can update this later from your profile settings.
            </Typography>
          </Stack>
        )}

        {step === 2 && (
          /* ── Step 2: Weekly availability ── */
          <Stack spacing={1.5}>
            {/* Active slots — enabled presets + custom drafts */}
            {(cards.filter((c) => c.enabled).length > 0 || draftPatterns.length > 0) && (
              <>
              <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.8rem" }}>Added slots</Typography>
              <Stack spacing={1}>
                {cards.filter((c) => c.enabled).map((card) =>
                  editingPresetKey === card.key ? (
                    <Paper key={card.key} variant="outlined" sx={{ p: 1.25, borderRadius: 1.5, borderColor: "primary.main" }}>
                      <Typography variant="caption" fontWeight={600} sx={{ display: "block", mb: "1rem", fontSize: "0.7rem" }}>{card.label}</Typography>
                      <Stack direction="row" spacing={0.75} sx={{ mb: "1rem" }}>
                        <FormControl fullWidth size="small" sx={{ "& .MuiInputBase-root": { height: 32, fontSize: "0.75rem" }, "& .MuiInputLabel-root": { fontSize: "0.7rem" } }}>
                          <InputLabel>Start</InputLabel>
                          <Select label="Start" value={editPresetStart} onChange={(e) => setEditPresetStart(e.target.value)} MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}>
                            {timeOptions12.map((opt) => <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.75rem", minHeight: 28 }}>{opt.label}</MenuItem>)}
                          </Select>
                        </FormControl>
                        <FormControl fullWidth size="small" sx={{ "& .MuiInputBase-root": { height: 32, fontSize: "0.75rem" }, "& .MuiInputLabel-root": { fontSize: "0.7rem" } }}>
                          <InputLabel>End</InputLabel>
                          <Select label="End" value={editPresetEnd} onChange={(e) => setEditPresetEnd(e.target.value)} MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}>
                            {timeOptions12.map((opt) => <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.75rem", minHeight: 28 }}>{opt.label}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Stack>
                      <Stack direction="row" spacing={0.75}>
                        <Button size="small" variant="contained" sx={{ textTransform: "none", fontSize: "0.7rem", py: 0.25 }} onClick={() => {
                          dispatch(setPresetCards(cards.map((c) => c.key === card.key ? { ...c, start: editPresetStart, end: editPresetEnd } : c)));
                          setEditingPresetKey(null);
                        }}>Save</Button>
                        <Button size="small" variant="text" color="inherit" sx={{ textTransform: "none", fontSize: "0.7rem", py: 0.25 }} onClick={() => setEditingPresetKey(null)}>Cancel</Button>
                      </Stack>
                    </Paper>
                  ) : (
                    <Paper key={card.key} variant="outlined" sx={{ px: 1.5, py: 1, borderRadius: 1.5, bgcolor: "action.hover" }}>
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
                {draftPatterns.map((p) => (
                  <Paper key={p.id} variant="outlined" sx={{ px: 1.5, py: 1, borderRadius: 1.5, bgcolor: "action.hover" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="caption" fontWeight={600} sx={{ display: "block", mb: 0.25 }}>{p.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDayGroupShort(p.days)} · {fmtTime12(p.start)} – {fmtTime12(p.end)}
                        </Typography>
                      </Box>
                      <IconButton size="small" onClick={() => removeCustomSlot(p.id)}>
                        <CloseOutlinedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
              </>
            )}

            {/* Popular slots — unselected presets */}
            {cards.filter((c) => !c.enabled).length > 0 && (
              <>
                {(cards.filter((c) => c.enabled).length > 0 || draftPatterns.length > 0) && <Divider sx={{ my: 0.5 }} />}
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
              <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1.5, borderColor: "primary.main" }}>
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
                    <Select label="Start" value={builderStart} onChange={(e) => dispatch(setBuilderStart(e.target.value))} MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}>
                      {timeOptions12.map((opt) => <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.75rem", minHeight: 28 }}>{opt.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small" sx={{ "& .MuiInputBase-root": { height: 32, fontSize: "0.75rem" }, "& .MuiInputLabel-root": { fontSize: "0.7rem" } }}>
                    <InputLabel>End</InputLabel>
                    <Select label="End" value={builderEnd} onChange={(e) => dispatch(setBuilderEnd(e.target.value))} MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}>
                      {timeOptions12.map((opt) => <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.75rem", minHeight: 28 }}>{opt.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Stack>
                <Stack direction="row" spacing={0.75}>
                  <Button size="small" variant="contained" onClick={addCustomSlot} disabled={!builderDays.length} sx={{ textTransform: "none", fontSize: "0.7rem", py: 0.25 }}>Add</Button>
                  <Button size="small" variant="text" color="inherit" onClick={() => setShowCustomForm(false)} sx={{ textTransform: "none", fontSize: "0.7rem", py: 0.25 }}>Cancel</Button>
                </Stack>
              </Paper>
            ) : (
              <Button variant="soft" size="small" startIcon={<AddOutlinedIcon sx={{ fontSize: 14 }} />} onClick={() => setShowCustomForm(true)} sx={{ alignSelf: "flex-start", textTransform: "none" }}>
                Custom slot
              </Button>
            )}
            <Stack direction="row" alignItems="center" spacing={1} sx={(theme) => ({ mt: 1.5, p: 1.25, borderRadius: 1.5, bgcolor: theme.palette.mode === "dark" ? "hsl(45 30% 12%)" : "hsl(45 100% 95%)", border: "1px solid", borderColor: theme.palette.mode === "dark" ? "hsl(45 30% 22%)" : "hsl(45 80% 80%)" })}>
              <TipsAndUpdatesOutlinedIcon sx={(theme) => ({ fontSize: 16, color: theme.palette.mode === "dark" ? "hsl(40 60% 60%)" : "hsl(40 80% 45%)" })} />
              <Typography variant="caption" sx={(theme) => ({ fontSize: "0.7rem", color: theme.palette.mode === "dark" ? "hsl(40 30% 75%)" : "hsl(40 50% 30%)", lineHeight: 1.3 })}>
                Set recurring availability. Add exceptions later.
              </Typography>
            </Stack>
          </Stack>
        )}
      </DialogContent>

      {/* ── Footer ── */}
      <Divider />
      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          justifyContent: "space-between",
          flexShrink: 0,
          gap: 1,
        }}
      >
        {step === 1 ? (
          <>
            <Button variant="text" color="inherit" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleNext} sx={{ minHeight: { xs: 40, sm: 36 }, px: 3 }}>
              Next
            </Button>
          </>
        ) : (
          <>
            <Button variant="text" color="inherit" onClick={handleClose} disabled={isSaving}>
              Cancel
            </Button>
            <Stack direction="row" spacing={1}>
              <Button variant="soft" onClick={handleBack} disabled={isSaving} sx={{ minHeight: { xs: 40, sm: 36 } }}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={isSaving || (!cards.some((c) => c.enabled) && !draftPatterns.length)}
                startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : undefined}
                sx={{ minHeight: { xs: 40, sm: 36 }, px: 3 }}
              >
                {isSaving ? "Saving…" : "Update"}
              </Button>
            </Stack>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AvailabilityBuilderDialog;
