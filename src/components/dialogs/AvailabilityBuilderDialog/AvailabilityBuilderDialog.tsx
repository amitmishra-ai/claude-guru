import { useEffect, useRef, useState } from "react";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import Button from "@mui/material/Button";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import MobileStepper from "@mui/material/MobileStepper";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import Check from "@mui/icons-material/Check";
import StepConnector, { stepConnectorClasses } from "@mui/material/StepConnector";
import type { StepIconProps } from "@mui/material/StepIcon";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import useMediaQuery from "@mui/material/useMediaQuery";
import { styled, useTheme } from "@mui/material/styles";
import { useAppSelector, useAppDispatch } from "@/store";
import {
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
import { parseHHMM, fmtTime, fmtTime12, formatDayGroupShort } from "@/lib/helpers";
import { TimezonePicker } from "@/components/shared/TimezonePicker";
import WeeklySlotsEditor, { defaultPresets, type WeeklySlotsHandle } from "./WeeklySlotsEditor";
import { COMBINED_MENTOR_ROLE, availRoleVisual } from "@/lib/role-config";
import type { AvailRole } from "@/lib/types";

/* ── Qonto-style stepper (tuned to the app's primary color) ── */
const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: "calc(-50% + 16px)",
    right: "calc(50% + 16px)",
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: { borderColor: theme.palette.primary.main },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: { borderColor: theme.palette.primary.main },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: "#eaeaf0",
    borderTopWidth: 3,
    borderRadius: 1,
    ...theme.applyStyles("dark", { borderColor: theme.palette.grey[800] }),
  },
}));

const QontoStepIconRoot = styled("div")<{ ownerState: { active?: boolean } }>(({ theme }) => ({
  color: "#eaeaf0",
  display: "flex",
  height: 22,
  alignItems: "center",
  "& .QontoStepIcon-completedIcon": { color: theme.palette.primary.main, zIndex: 1, fontSize: 18 },
  "& .QontoStepIcon-circle": { width: 8, height: 8, borderRadius: "50%", backgroundColor: "currentColor" },
  ...theme.applyStyles("dark", { color: theme.palette.grey[700] }),
  variants: [
    { props: ({ ownerState }) => ownerState.active, style: { color: theme.palette.primary.main } },
  ],
}));

function QontoStepIcon(props: StepIconProps) {
  const { active, completed, className } = props;
  return (
    <QontoStepIconRoot ownerState={{ active }} className={className}>
      {completed ? (
        <Check className="QontoStepIcon-completedIcon" />
      ) : (
        <div className="QontoStepIcon-circle" />
      )}
    </QontoStepIconRoot>
  );
}

const AvailabilityBuilderDialog = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const open = useAppSelector((s) => s.ui.openAvailability);
  const presetCards = useAppSelector((s) => s.availability.presetCards);
  const hasConfigured = useAppSelector((s) => s.availability.hasUserConfiguredAvailability);
  const existingPatterns = useAppSelector((s) => s.availability.patterns);
  const draftPatterns = useAppSelector((s) => s.availability.availabilityDraftPatterns);
  const builderDays = useAppSelector((s) => s.availability.builderDays);
  const builderStart = useAppSelector((s) => s.availability.builderStart);
  const builderEnd = useAppSelector((s) => s.availability.builderEnd);
  const timeZoneMode = useAppSelector((s) => s.profile.timeZoneMode);
  const manualTimeZone = useAppSelector((s) => s.profile.manualTimeZone);
  const isComboRole = useAppSelector((s) => s.devPanel.selectedRole) === COMBINED_MENTOR_ROLE;

  const [saveAvailability, { isLoading: isSaving }] = useSaveAvailabilityMutation();
  const editorRef = useRef<WeeklySlotsHandle>(null);

  // Per-slot role tags, set in the final review step (combined role only).
  // Keyed by the slot's FINAL pattern id (preset-${key} / draft id).
  const [assignments, setAssignments] = useState<Record<string, AvailRole>>({});
  // Local step navigation (replaces Redux availabilityStep for nav).
  const steps = isComboRole ? ["timezone", "weekly", "review"] : ["timezone", "weekly"];
  const [stepIdx, setStepIdx] = useState(0);
  const currentStep = steps[stepIdx];

  const effectiveTimezone =
    timeZoneMode === "manual"
      ? manualTimeZone
      : Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Reset step whenever the dialog opens.
  useEffect(() => {
    if (!open) return;
    // Already-configured non-combo users skip straight to the slots (prior UX);
    // everyone else starts at the timezone step.
    const alreadyConfigured = hasConfigured && existingPatterns.length > 0;
    setStepIdx(alreadyConfigured && !isComboRole ? steps.indexOf("weekly") : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
    }
  }, [open, hasConfigured, existingPatterns, presetCards.length, dispatch]);

  const cards = presetCards.length ? presetCards : defaultPresets;

  // Ensure each current slot has a role assignment (combo role only). Defaults to
  // the matching existing pattern's availFor (by id) else "both"; user edits kept.
  useEffect(() => {
    if (!isComboRole) return;
    setAssignments((prev) => {
      const next = { ...prev };
      let changed = false;
      const slotIds = [
        ...cards.filter((c) => c.enabled).map((c) => `preset-${c.key}`),
        ...draftPatterns.map((d) => d.id),
      ];
      for (const id of slotIds) {
        if (next[id] === undefined) {
          const match = existingPatterns.find((p) => p.id === id);
          next[id] = match?.availFor ?? "both";
          changed = true;
        }
      }
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx, cards, draftPatterns, open]);

  const handleClose = () => {
    dispatch(setOpenAvailability(false));
    dispatch(setAvailabilityDraftPatterns([]));
    dispatch(setPresetCards([]));
    setStepIdx(0);
    setAssignments({});
  };

  const handleNext = () => {
    // Seed presets when leaving the timezone step into weekly.
    if (steps[stepIdx + 1] === "weekly" && !presetCards.length) {
      dispatch(setPresetCards(defaultPresets));
    }
    // Leaving the slots step: commit any in-progress "Add custom slot" form /
    // inline edit so an un-"Add"ed slot still flows into the configured slots.
    if (currentStep === "weekly") {
      editorRef.current?.flush();
    }
    setStepIdx((i) => Math.min(i + 1, steps.length - 1));
  };

  const handleBack = () => setStepIdx((i) => Math.max(i - 1, 0));

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

    // Tag each built pattern with its per-slot role from the review step.
    const finalPatterns = allPatterns.map((p) => ({
      ...p,
      availFor: isComboRole ? (assignments[p.id] ?? "both") : undefined,
    }));

    try {
      await saveAvailability({ patterns: finalPatterns, maxPerWeek: 6, rangeDays: 60 }).unwrap();
      dispatch(setPatterns(finalPatterns));
      dispatch(setHasUserConfiguredAvailability(true));
      dispatch(pushToast({
        title: "Availability saved",
        description: `${finalPatterns.length} pattern(s) configured.`,
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

        {/* Step indicators — bleed into the dialog's horizontal padding so long
            labels (e.g. "Recurring availability") fit on one line without widening the modal. */}
        <Box sx={{ mx: { xs: -2, sm: -3 }, mb: 2 }}>
          <Stepper
            activeStep={stepIdx}
            alternativeLabel
            connector={<QontoConnector />}
            sx={{
              // Keep the 3 columns equal width even though the middle label is long:
              // let the column shrink and the nowrap label overflow into neighbor slack.
              "& .MuiStep-root": { minWidth: 0 },
              "& .MuiStepLabel-labelContainer": { overflow: "visible" },
              "& .MuiStepLabel-alternativeLabel.MuiStepLabel-label": { mt: 0.75 },
              "& .MuiStepLabel-label": { whiteSpace: "nowrap", overflow: "visible" },
            }}
          >
            {steps.map((s) => (
              <Step key={s}>
                <StepLabel slots={{ stepIcon: QontoStepIcon }}>
                  {s === "timezone" ? "Timezone" : s === "weekly" ? "Recurring availability" : "Review"}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
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
        {currentStep === "timezone" && (
          /* ── Step: Timezone ── */
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

        {currentStep === "weekly" && (
          /* ── Step: Weekly availability ── */
          <Stack spacing={2}>
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
          </Stack>
        )}

        {currentStep === "review" && (
          /* ── Step: Review & tag each slot ── */
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                What will you do in each slot?
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.45, display: "block" }}>
                Choose whether each time is for career mentorship, course mentorship, or both.
              </Typography>
            </Box>
            <Stack spacing={1}>
              {[
                ...cards
                  .filter((c) => c.enabled)
                  .map((c) => ({
                    id: `preset-${c.key}`,
                    title: c.label,
                    days: c.days,
                    startMins: parseHHMM(c.start),
                    endMins: parseHHMM(c.end),
                  })),
                ...draftPatterns.map((d) => ({
                  id: d.id,
                  title: "Custom slot",
                  days: d.days,
                  startMins: d.start,
                  endMins: d.end,
                })),
              ].map((slot) => {
                const role = assignments[slot.id] ?? "both";
                return (
                  <Paper
                    key={slot.id}
                    variant="outlined"
                    sx={{ px: 1.5, py: 1, borderRadius: "8px", bgcolor: "action.hover" }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {slot.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                          {`${formatDayGroupShort(slot.days)} · ${fmtTime12(slot.startMins)} – ${fmtTime12(slot.endMins)}`}
                        </Typography>
                      </Box>
                      <FormControl
                        size="small"
                        sx={{
                          flexShrink: 0,
                          width: 124,
                          "& .MuiInputBase-root": { height: 32, fontSize: "0.75rem" },
                          // Clip the selected value so a long label ellipsizes instead of widening.
                          "& .MuiSelect-select": { display: "flex", alignItems: "center", overflow: "hidden" },
                        }}
                      >
                        <Select
                          value={role}
                          onChange={(e) =>
                            setAssignments((prev) => ({ ...prev, [slot.id]: e.target.value as AvailRole }))
                          }
                          MenuProps={{ PaperProps: { sx: { maxHeight: 220 } } }}
                          renderValue={(val) => {
                            const r = val as AvailRole;
                            return (
                              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
                                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: availRoleVisual(r).border, flexShrink: 0 }} />
                                <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {r === "course" ? "Course mentorship" : r === "career" ? "Career mentorship" : "Both"}
                                </Box>
                              </Stack>
                            );
                          }}
                        >
                          {(["course", "career", "both"] as AvailRole[]).map((r) => (
                            <MenuItem key={r} value={r} sx={{ fontSize: "0.75rem", minHeight: 28 }}>
                              <Stack direction="row" alignItems="center" spacing={0.75}>
                                <Box
                                  sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    bgcolor: availRoleVisual(r).border,
                                    flexShrink: 0,
                                  }}
                                />
                                <span>{r === "course" ? "Course mentorship" : r === "career" ? "Career mentorship" : "Both"}</span>
                              </Stack>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          </Stack>
        )}
      </DialogContent>

      {/* ── Footer (MUI MobileStepper) ── */}
      <Divider />
      {(() => {
        const isLast = stepIdx === steps.length - 1;
        const noSlots = !cards.some((c) => c.enabled) && !draftPatterns.length;
        return (
          <MobileStepper
            variant="dots"
            steps={steps.length}
            position="static"
            activeStep={stepIdx}
            sx={{
              px: { xs: 2, sm: 3 },
              py: { xs: 1.5, sm: 2 },
              bgcolor: "transparent",
              flexShrink: 0,
              "& .MuiMobileStepper-dot": { width: 7, height: 7 },
            }}
            slotProps={{ progress: { "aria-label": "availability steps" } }}
            backButton={
              <Button
                size="small"
                color="inherit"
                onClick={stepIdx === 0 ? handleClose : handleBack}
                disabled={isSaving}
              >
                <KeyboardArrowLeft />
                {stepIdx === 0 ? "Cancel" : "Back"}
              </Button>
            }
            nextButton={
              isLast ? (
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleSave}
                  disabled={isSaving || noSlots}
                  startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : undefined}
                  sx={{ px: 2 }}
                >
                  {isSaving ? "Saving…" : "Update"}
                </Button>
              ) : (
                <Button
                  size="small"
                  onClick={handleNext}
                  disabled={currentStep === "weekly" && noSlots}
                >
                  Next
                  <KeyboardArrowRight />
                </Button>
              )
            }
          />
        );
      })()}
    </Dialog>
  );
};

export default AvailabilityBuilderDialog;
