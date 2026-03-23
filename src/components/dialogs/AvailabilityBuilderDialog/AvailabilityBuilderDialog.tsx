import { useState } from "react";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
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
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
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
          <Stack spacing={3}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "action.hover", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <PublicOutlinedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600}>Confirm your timezone</Typography>
                <Typography variant="caption" color="text.secondary">
                  This ensures your availability shows the correct times to learners.
                </Typography>
              </Box>
            </Stack>

            {/* Timezone card */}
            <Box
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                p: { xs: 2, sm: 2.5 },
                bgcolor: "action.hover",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack spacing={0.25}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Current timezone
                  </Typography>
                  <Typography variant="body1" fontWeight={700} sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                    {effectiveTimezone}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {fmtTimezoneDisplay(effectiveTimezone).split("(")[1]?.replace(")", "") || ""}
                  </Typography>
                </Stack>
                <Button
                  variant="soft"
                  size="small"
                  startIcon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
                >
                  Change
                </Button>
              </Stack>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
              You can update this later from your profile settings.
            </Typography>
          </Stack>
        )}

        {step === 2 && (
          /* ── Step 2: Weekly availability ── */
          <Stack spacing={2}>
            {/* Info */}
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "action.hover", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <AccessTimeOutlinedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600}>Set your weekly slots</Typography>
                <Typography variant="caption" color="text.secondary">
                  Choose from recommended times or add your own.
                </Typography>
              </Box>
            </Stack>

            {/* Recommended slots */}
            <Box>
              <Typography variant="caption" fontWeight={600} color="primary.main" sx={{ mb: 1, display: "block", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Recommended
              </Typography>

              <Stack spacing={1}>
                {cards.map((card) =>
                  editingPresetKey === card.key ? (
                    /* ── Editing preset ── */
                    <Box
                      key={card.key}
                      sx={{ border: 2, borderColor: "primary.main", borderRadius: 2, p: { xs: 1.5, sm: 2 } }}
                    >
                      <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5 }}>{card.label}</Typography>
                      <Stack spacing={1.5}>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Start</InputLabel>
                            <Select label="Start" value={editPresetStart} onChange={(e) => setEditPresetStart(e.target.value)}>
                              {timeOptions12.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                            </Select>
                          </FormControl>
                          <FormControl fullWidth size="small">
                            <InputLabel>End</InputLabel>
                            <Select label="End" value={editPresetEnd} onChange={(e) => setEditPresetEnd(e.target.value)}>
                              {timeOptions12.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                            </Select>
                          </FormControl>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => {
                              const updated = cards.map((c) =>
                                c.key === card.key ? { ...c, start: editPresetStart, end: editPresetEnd, enabled: true } : c
                              );
                              dispatch(setPresetCards(updated));
                              setEditingPresetKey(null);
                            }}
                          >
                            Save
                          </Button>
                          <Button size="small" variant="text" color="inherit" onClick={() => setEditingPresetKey(null)}>
                            Cancel
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  ) : (
                    /* ── Preset card ── */
                    <Box
                      key={card.key}
                      sx={{
                        border: 1,
                        borderColor: card.enabled ? "var(--gl-status-confirmed-border)" : "divider",
                        borderRadius: 2,
                        p: { xs: 1.5, sm: 2 },
                        bgcolor: card.enabled ? "var(--gl-status-confirmed-bg)" : "transparent",
                        transition: "all 150ms",
                      }}
                    >
                      {/* Desktop (sm+): single row — info left, actions right */}
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ display: { xs: "none", sm: "flex" }, gap: 2 }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={700}>{card.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDayGroupShort(card.days)} &bull; {fmtTime(parseHHMM(card.start))}–{fmtTime(parseHHMM(card.end))}
                          </Typography>
                        </Box>
                        <Stack direction="row" alignItems="center" gap={1} sx={{ flexShrink: 0 }}>
                          <Button
                            variant={card.enabled ? "soft" : "contained"}
                            size="small"
                            onClick={() => togglePreset(card.key)}
                            sx={card.enabled ? { bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)" } : { px: 2 }}
                          >
                            {card.enabled ? "Added" : "Add"}
                          </Button>
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => {
                              setEditingPresetKey(card.key);
                              setEditPresetStart(card.start);
                              setEditPresetEnd(card.end);
                            }}
                          >
                            Edit
                          </Button>
                          <IconButton
                            size="small"
                            onClick={() => dispatch(setPresetCards(cards.filter((c) => c.key !== card.key)))}
                            sx={{ border: 1, borderColor: "divider", borderRadius: 2, p: 0.5 }}
                          >
                            <CloseOutlinedIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Stack>
                      </Stack>

                      {/* Mobile (xs): stacked — info top, actions bottom */}
                      <Box sx={{ display: { xs: "block", sm: "none" } }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={700} sx={{ fontSize: "0.8rem" }}>
                              {card.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDayGroupShort(card.days)} &bull; {fmtTime(parseHHMM(card.start))}–{fmtTime(parseHHMM(card.end))}
                            </Typography>
                          </Box>
                          {card.enabled && (
                            <CheckCircleOutlinedIcon sx={{ fontSize: 18, color: "var(--gl-status-confirmed-text)", flexShrink: 0, mt: 0.25 }} />
                          )}
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Button
                            variant={card.enabled ? "soft" : "contained"}
                            size="small"
                            onClick={() => togglePreset(card.key)}
                            sx={{
                              minHeight: 32,
                              fontSize: "0.75rem",
                              ...(card.enabled ? { bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)" } : {}),
                            }}
                          >
                            {card.enabled ? "Remove" : "Add"}
                          </Button>
                          <Button
                            variant="text"
                            size="small"
                            sx={{ minHeight: 32, fontSize: "0.75rem" }}
                            onClick={() => {
                              setEditingPresetKey(card.key);
                              setEditPresetStart(card.start);
                              setEditPresetEnd(card.end);
                            }}
                          >
                            Edit
                          </Button>
                          <IconButton
                            size="small"
                            onClick={() => dispatch(setPresetCards(cards.filter((c) => c.key !== card.key)))}
                            sx={{ border: 1, borderColor: "divider", borderRadius: 2, p: 0.5, ml: "auto !important" }}
                          >
                            <CloseOutlinedIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Stack>
                      </Box>
                    </Box>
                  )
                )}
              </Stack>
            </Box>

            {/* Custom slots */}
            {draftPatterns.length > 0 && (
              <Box>
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: "block", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Custom slots
                </Typography>
                <Stack spacing={1}>
                  {draftPatterns.map((p) => (
                    <Box
                      key={p.id}
                      sx={{ border: 1, borderColor: "primary.main", borderRadius: 2, p: { xs: 1.5, sm: 2 } }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={700} sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>{p.label}</Typography>
                          <Typography variant="caption" color="primary.main">Custom slot</Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => removeCustomSlot(p.id)}
                          sx={{ border: 1, borderColor: "divider", borderRadius: 2, p: 0.5 }}
                        >
                          <CloseOutlinedIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Add custom slot */}
            {showCustomForm ? (
              <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, p: { xs: 1.5, sm: 2 } }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                  Add custom slot
                </Typography>

                {/* Day chips — larger touch targets on mobile */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2 }}>
                  {DOW_LONG.map((day) => {
                    const selected = builderDays.includes(day);
                    return (
                      <Chip
                        key={day}
                        label={day.slice(0, 3)}
                        size="small"
                        variant={selected ? "filled" : "outlined"}
                        onClick={() => toggleDay(day)}
                        sx={{
                          height: { xs: 32, sm: 28 },
                          fontSize: { xs: "0.75rem", sm: "0.7rem" },
                          fontWeight: 500,
                          "& .MuiChip-label": { px: { xs: 1.5, sm: 1 } },
                          ...(selected
                            ? { bgcolor: "primary.main", color: "primary.contrastText", "&:hover": { bgcolor: "primary.dark" } }
                            : {}),
                        }}
                      />
                    );
                  })}
                </Box>

                {/* Time selectors — stacked on mobile */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Start time</InputLabel>
                    <Select
                      label="Start time"
                      value={builderStart}
                      onChange={(e) => dispatch(setBuilderStart(e.target.value))}
                    >
                      {timeOptions12.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small">
                    <InputLabel>End time</InputLabel>
                    <Select
                      label="End time"
                      value={builderEnd}
                      onChange={(e) => dispatch(setBuilderEnd(e.target.value))}
                    >
                      {timeOptions12.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={addCustomSlot}
                    disabled={!builderDays.length}
                    sx={{ minHeight: 36 }}
                  >
                    Add slot
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    color="inherit"
                    onClick={() => setShowCustomForm(false)}
                    sx={{ minHeight: 36 }}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Button
                variant="soft"
                startIcon={<AddOutlinedIcon sx={{ fontSize: 16 }} />}
                onClick={() => setShowCustomForm(true)}
                sx={{ alignSelf: "flex-start", minHeight: 36 }}
              >
                Add custom time
              </Button>
            )}
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
