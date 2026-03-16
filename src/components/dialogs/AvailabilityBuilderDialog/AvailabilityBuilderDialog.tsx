import { useState } from "react";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import RemoveOutlinedIcon from "@mui/icons-material/RemoveOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import FlexBox from "@/components/Utils/FlexBox";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  setAvailabilityStep,
  setAvailabilityDraftPatterns,
  setPresetCards,
  setBuilderDays,
  setBuilderStart,
  setBuilderEnd,
  setMaxPerWeek,
  setRangeDays,
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

const RANGE_OPTIONS = [30, 60, 90, 120, 180];

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

const AvailabilityBuilderDialog = () => {
  const dispatch = useAppDispatch();

  // ── Redux state (UI + domain) ──────────────────────────────────────────────
  const open         = useAppSelector((s) => s.ui.openAvailability);
  const step         = useAppSelector((s) => s.availability.availabilityStep);
  const maxPerWeek   = useAppSelector((s) => s.availability.maxPerWeek);
  const rangeDays    = useAppSelector((s) => s.availability.rangeDays);
  const presetCards  = useAppSelector((s) => s.availability.presetCards);
  const draftPatterns = useAppSelector((s) => s.availability.availabilityDraftPatterns);
  const builderDays  = useAppSelector((s) => s.availability.builderDays);
  const builderStart = useAppSelector((s) => s.availability.builderStart);
  const builderEnd   = useAppSelector((s) => s.availability.builderEnd);
  const timeZoneMode   = useAppSelector((s) => s.profile.timeZoneMode);
  const manualTimeZone = useAppSelector((s) => s.profile.manualTimeZone);

  // ── RTK Query mutation ─────────────────────────────────────────────────────
  const [saveAvailability, { isLoading: isSaving }] = useSaveAvailabilityMutation();

  // showCustomForm is transient UI — no need to persist to Redux
  const [showCustomForm, setShowCustomForm] = useState(false);

  const effectiveTimezone =
    timeZoneMode === "manual"
      ? manualTimeZone
      : Intl.DateTimeFormat().resolvedOptions().timeZone;

  const cards = presetCards.length ? presetCards : defaultPresets;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleClose = () => {
    dispatch(setOpenAvailability(false));
    dispatch(setAvailabilityStep(1));
    dispatch(setAvailabilityDraftPatterns([]));
    dispatch(setPresetCards([]));
    setShowCustomForm(false);
  };

  const handleNext = () => {
    dispatch(setMaxPerWeek(maxPerWeek));
    dispatch(setRangeDays(rangeDays));
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
    dispatch(setBuilderDays(["Saturday", "Sunday"]));
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
      // RTK Query mutation — calls availabilityApi.saveAvailability
      await saveAvailability({ patterns: allPatterns, maxPerWeek, rangeDays }).unwrap();

      // Persist confirmed patterns to the Redux availability slice
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
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <FlexBox sx={{ px: 3, pt: 3, pb: 0 }} justifyContent="space-between" alignItems="flex-start">
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.25rem" }}>
          Update availability
        </Typography>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ border: 1, borderColor: "divider", borderRadius: 2, p: 0.75 }}
        >
          <CloseOutlinedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </FlexBox>

      <DialogContent sx={{ px: 3, pt: 2, pb: 1 }}>
        {/* Step 2: info banner (above step indicator) */}
        {step === 2 && (
          <FlexBox sx={{ border: 1, borderColor: "divider", borderRadius: 1, px: 2, py: 1.5, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Set recurring availability (office-hours style). Add exceptions later.
            </Typography>
          </FlexBox>
        )}

        {/* Stepper */}
        <Stepper activeStep={step - 1} sx={{ mb: 3 }}>
          <Step><StepLabel>Pattern</StepLabel></Step>
          <Step><StepLabel>Weekly availability</StepLabel></Step>
        </Stepper>

        {step === 1 ? (
          <FlexBox flexDirection="column" gap={3}>
            {/* Max sessions / week */}
            <FlexBox justifyContent="space-between" alignItems="center" gap={2}>
              <FlexBox flexDirection="column" sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>Max sessions / week</Typography>
                <Typography variant="body2" color="text.secondary">
                  Most Gurus are available for 6 sessions a week.
                </Typography>
              </FlexBox>
              <FlexBox
                alignItems="center"
                sx={{ border: 1, borderColor: "divider", borderRadius: 1, overflow: "hidden" }}
              >
                <IconButton
                  size="small"
                  onClick={() => dispatch(setMaxPerWeek(Math.max(1, maxPerWeek - 1)))}
                  sx={{ borderRadius: 0, px: 1.5, py: 1 }}
                >
                  <RemoveOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <Typography sx={{ minWidth: 36, textAlign: "center", fontWeight: 600, fontSize: "1rem", userSelect: "none" }}>
                  {maxPerWeek}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => dispatch(setMaxPerWeek(maxPerWeek + 1))}
                  sx={{ borderRadius: 0, px: 1.5, py: 1 }}
                >
                  <AddOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </FlexBox>
            </FlexBox>

            {/* Availability for */}
            <FlexBox justifyContent="space-between" alignItems="center" gap={2}>
              <FlexBox flexDirection="column" sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>Availability for</Typography>
                <Typography variant="body2" color="text.secondary">
                  How far ahead you want to share your availability.
                </Typography>
              </FlexBox>
              <Select
                value={RANGE_OPTIONS.includes(rangeDays) ? rangeDays : 60}
                onChange={(e) => dispatch(setRangeDays(Number(e.target.value)))}
                size="small"
                sx={{ borderRadius: 1, minWidth: 140 }}
                renderValue={(v) => `${v} days`}
              >
                {RANGE_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt} days</MenuItem>
                ))}
              </Select>
            </FlexBox>

            {/* Timezone */}
            <FlexBox justifyContent="space-between" alignItems="center" gap={2}>
              <FlexBox flexDirection="column" sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>Timezone</Typography>
                <Typography variant="body2" color="text.secondary">
                  Timezone you will be teaching.
                </Typography>
              </FlexBox>
              <FlexBox
                alignItems="center"
                sx={{ border: 1, borderColor: "divider", borderRadius: 1, px: 2, py: 1, gap: 1, minWidth: 140 }}
              >
                <Typography variant="body2" sx={{ flex: 1, whiteSpace: "nowrap" }}>
                  {fmtTimezoneDisplay(effectiveTimezone)}
                </Typography>
                <IconButton size="small" sx={{ p: 0.25 }}>
                  <EditOutlinedIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </FlexBox>
            </FlexBox>
          </FlexBox>
        ) : (
          <FlexBox flexDirection="column" gap={1.5}>
            {/* Section label */}
            <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main", mb: 0.5 }}>
              Recommended time slots
            </Typography>

            {/* Preset cards */}
            {cards.map((card) => (
              <FlexBox
                key={card.key}
                alignItems="center"
                justifyContent="space-between"
                sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 2, gap: 2 }}
              >
                <FlexBox flexDirection="column" sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{card.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDayGroupShort(card.days)} &bull; {fmtTime(parseHHMM(card.start))}–{fmtTime(parseHHMM(card.end))}
                  </Typography>
                </FlexBox>
                <FlexBox alignItems="center" gap={1} sx={{ flexShrink: 0 }}>
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
                </FlexBox>
              </FlexBox>
            ))}

            {/* Custom slots */}
            {draftPatterns.map((p) => (
              <FlexBox
                key={p.id}
                alignItems="center"
                justifyContent="space-between"
                sx={{ border: 1, borderColor: "primary.main", borderRadius: 1, p: 2, gap: 2 }}
              >
                <FlexBox flexDirection="column" sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{p.label}</Typography>
                  <Typography variant="caption" color="text.secondary">Custom slot</Typography>
                </FlexBox>
                <IconButton
                  size="small"
                  onClick={() => removeCustomSlot(p.id)}
                  sx={{ border: 1, borderColor: "divider", borderRadius: 2, p: 0.5 }}
                >
                  <CloseOutlinedIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </FlexBox>
            ))}

            {/* Add custom slot form */}
            {showCustomForm ? (
              <FlexBox
                flexDirection="column"
                gap={2}
                sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 2 }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Add custom slot</Typography>
                <FlexBox flexWrap="wrap" gap={0.75}>
                  {DOW_LONG.map((day) => (
                    <Chip
                      key={day}
                      label={day.slice(0, 3)}
                      size="small"
                      variant={builderDays.includes(day) ? "filled" : "outlined"}
                      sx={
                        builderDays.includes(day)
                          ? { bgcolor: "primary.main", color: "primary.contrastText", "&:hover": { bgcolor: "primary.dark" } }
                          : {}
                      }
                      onClick={() => toggleDay(day)}
                    />
                  ))}
                </FlexBox>
                <FlexBox sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
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
                </FlexBox>
                <FlexBox gap={1}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={addCustomSlot}
                    disabled={!builderDays.length}
                  >
                    Add
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    color="inherit"
                    onClick={() => setShowCustomForm(false)}
                  >
                    Cancel
                  </Button>
                </FlexBox>
              </FlexBox>
            ) : (
              <FlexBox justifyContent="flex-end" sx={{ mt: 0.5 }}>
                <Button
                  variant="soft"
                  onClick={() => setShowCustomForm(true)}
                >
                  Add another time slot
                </Button>
              </FlexBox>
            )}
          </FlexBox>
        )}
      </DialogContent>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <DialogActions sx={{ px: 3, pb: 3, pt: 2, justifyContent: "space-between" }}>
        {step === 1 ? (
          <>
            <Button variant="text" color="inherit" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          </>
        ) : (
          <>
            <Button variant="text" color="inherit" onClick={handleClose} disabled={isSaving}>
              Cancel
            </Button>
            <FlexBox gap={1}>
              <Button variant="soft" onClick={handleBack} disabled={isSaving}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={isSaving || (!cards.some((c) => c.enabled) && !draftPatterns.length)}
                startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : undefined}
              >
                {isSaving ? "Saving…" : "Update"}
              </Button>
            </FlexBox>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AvailabilityBuilderDialog;
