import { useEffect, useRef } from "react";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
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
import { setTimeZoneMode, setManualTimeZone } from "@/store/slices/profileSlice";
import { pushToast } from "@/store/slices/toastsSlice";
import { useSaveAvailabilityMutation } from "@/api/ninja/availabilityApi";
import { parseHHMM, fmtTime } from "@/lib/helpers";
import { TimezonePicker } from "@/components/shared/TimezonePicker";
import WeeklySlotsEditor, { defaultPresets, type WeeklySlotsHandle } from "./WeeklySlotsEditor";

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
  const editorRef = useRef<WeeklySlotsHandle>(null);

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
  };

  const handleNext = () => {
    if (!presetCards.length) dispatch(setPresetCards(defaultPresets));
    dispatch(setAvailabilityStep(2));
  };

  const handleBack = () => dispatch(setAvailabilityStep(1));

  const handleSave = async () => {
    // Commit any in-progress inline edit / open custom-slot form in the editor.
    const flushed = editorRef.current?.flush() ?? { cards, drafts: draftPatterns };
    const finalCards = flushed.cards;
    const finalDrafts = flushed.drafts;

    const presetPatterns = finalCards
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
      ...finalDrafts.map((d) => ({ id: d.id, label: d.label, days: d.days, start: d.start, end: d.end })),
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
          borderRadius: isMobile ? 0 : "16px",
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
            sx={{ border: 1, borderColor: "divider", borderRadius: "8px", p: 0.75 }}
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
          pt: 2,
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

            {/* Timezone selector — shared picker (unified across the app) */}
            <TimezonePicker
              value={timeZoneMode === "auto" ? "__auto__" : manualTimeZone}
              onChange={(val) => {
                if (val === "__auto__") {
                  dispatch(setTimeZoneMode("auto"));
                } else {
                  dispatch(setTimeZoneMode("manual"));
                  dispatch(setManualTimeZone(val));
                }
              }}
            />

            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
              You can update this later from your profile settings.
            </Typography>
          </Stack>
        )}

        {step === 2 && (
          /* ── Step 2: Weekly availability ── */
          <WeeklySlotsEditor
            ref={editorRef}
            cards={cards}
            onCardsChange={(c) => dispatch(setPresetCards(c))}
            drafts={draftPatterns}
            onDraftsChange={(d) => dispatch(setAvailabilityDraftPatterns(d))}
            builderDays={builderDays}
            onBuilderDaysChange={(d) => dispatch(setBuilderDays(d))}
            builderStart={builderStart}
            onBuilderStartChange={(v) => dispatch(setBuilderStart(v))}
            builderEnd={builderEnd}
            onBuilderEndChange={(v) => dispatch(setBuilderEnd(v))}
          />
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
