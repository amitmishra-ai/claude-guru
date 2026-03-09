import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Pattern, Block, NA, BuilderPreset, PresetCard } from "@/lib/types";
import { demoPatterns } from "@/data/demo-availability";
// API calls (save, fetch) live in src/api/ninja/availabilityApi.ts (RTK Query)

interface AvailabilityState {
  patterns: Pattern[];
  oneOffAvail: Block[];
  unavailable: NA[];
  hasUserConfiguredAvailability: boolean;
  userConfiguredPatterns: Array<{ label: string; days: string[]; start: number; end: number }>;
  maxPerWeek: number;
  rangeDays: number;
  calendarConnected: boolean;
  showExternalBusy: boolean;
  availabilityPreviewMode: "week" | "month";
  // Builder state
  builderPreset: BuilderPreset;
  builderDays: string[];
  builderStart: string;
  builderEnd: string;
  availabilityStep: 1 | 2;
  availabilityDraftPatterns: Array<{ id: string; label: string; days: string[]; start: number; end: number }>;
  presetCards: PresetCard[];
  editingPresetKey: "weekends" | "weekendAfternoons" | "weekdayEvenings" | null;
  editingCustomSlotId: string | null;
  // NA dialog state
  naStartDate: string;
  naEndDate: string;
  naReason: string;
  naStart: string;
  naEnd: string;
  // Remove availability state
  availabilityToRemove: Block | null;
  removeAvailabilityAction: "remove" | "reschedule";
  removeAvailabilityStart: string;
  removeAvailabilityEnd: string;
  removedAvailabilityIds: Record<string, boolean>;
  editingLeaveGroupId: string | null;
}

const today = new Date();
const todayYmd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

const initialState: AvailabilityState = {
  patterns: demoPatterns,
  oneOffAvail: [],
  unavailable: [],
  hasUserConfiguredAvailability: false,
  userConfiguredPatterns: [],
  maxPerWeek: 6,
  rangeDays: 60,
  calendarConnected: true,
  showExternalBusy: true,
  availabilityPreviewMode: "week",
  builderPreset: "weekends",
  builderDays: ["Saturday", "Sunday"],
  builderStart: "10:00",
  builderEnd: "12:00",
  availabilityStep: 1,
  availabilityDraftPatterns: [],
  presetCards: [],
  editingPresetKey: null,
  editingCustomSlotId: null,
  naStartDate: todayYmd,
  naEndDate: todayYmd,
  naReason: "",
  naStart: "10:00",
  naEnd: "12:00",
  availabilityToRemove: null,
  removeAvailabilityAction: "remove",
  removeAvailabilityStart: "10:00",
  removeAvailabilityEnd: "12:00",
  removedAvailabilityIds: {},
  editingLeaveGroupId: null,
};

const availabilitySlice = createSlice({
  name: "availability",
  initialState,
  reducers: {
    setPatterns(state, action: PayloadAction<Pattern[]>) {
      state.patterns = action.payload;
    },
    setOneOffAvail(state, action: PayloadAction<Block[]>) {
      state.oneOffAvail = action.payload;
    },
    addOneOffAvail(state, action: PayloadAction<Block>) {
      state.oneOffAvail.push(action.payload);
    },
    setUnavailable(state, action: PayloadAction<NA[]>) {
      state.unavailable = action.payload;
    },
    addUnavailable(state, action: PayloadAction<NA>) {
      state.unavailable.push(action.payload);
    },
    setHasUserConfiguredAvailability(state, action: PayloadAction<boolean>) {
      state.hasUserConfiguredAvailability = action.payload;
    },
    setUserConfiguredPatterns(state, action: PayloadAction<Array<{ label: string; days: string[]; start: number; end: number }>>) {
      state.userConfiguredPatterns = action.payload;
    },
    setMaxPerWeek(state, action: PayloadAction<number>) {
      state.maxPerWeek = action.payload;
    },
    setRangeDays(state, action: PayloadAction<number>) {
      state.rangeDays = action.payload;
    },
    setCalendarConnected(state, action: PayloadAction<boolean>) {
      state.calendarConnected = action.payload;
    },
    setShowExternalBusy(state, action: PayloadAction<boolean>) {
      state.showExternalBusy = action.payload;
    },
    setAvailabilityPreviewMode(state, action: PayloadAction<"week" | "month">) {
      state.availabilityPreviewMode = action.payload;
    },
    setBuilderPreset(state, action: PayloadAction<BuilderPreset>) {
      state.builderPreset = action.payload;
    },
    setBuilderDays(state, action: PayloadAction<string[]>) {
      state.builderDays = action.payload;
    },
    setBuilderStart(state, action: PayloadAction<string>) {
      state.builderStart = action.payload;
    },
    setBuilderEnd(state, action: PayloadAction<string>) {
      state.builderEnd = action.payload;
    },
    setAvailabilityStep(state, action: PayloadAction<1 | 2>) {
      state.availabilityStep = action.payload;
    },
    setAvailabilityDraftPatterns(state, action: PayloadAction<Array<{ id: string; label: string; days: string[]; start: number; end: number }>>) {
      state.availabilityDraftPatterns = action.payload;
    },
    setPresetCards(state, action: PayloadAction<PresetCard[]>) {
      state.presetCards = action.payload;
    },
    setEditingPresetKey(state, action: PayloadAction<"weekends" | "weekendAfternoons" | "weekdayEvenings" | null>) {
      state.editingPresetKey = action.payload;
    },
    setEditingCustomSlotId(state, action: PayloadAction<string | null>) {
      state.editingCustomSlotId = action.payload;
    },
    setNaStartDate(state, action: PayloadAction<string>) {
      state.naStartDate = action.payload;
    },
    setNaEndDate(state, action: PayloadAction<string>) {
      state.naEndDate = action.payload;
    },
    setNaReason(state, action: PayloadAction<string>) {
      state.naReason = action.payload;
    },
    setNaStart(state, action: PayloadAction<string>) {
      state.naStart = action.payload;
    },
    setNaEnd(state, action: PayloadAction<string>) {
      state.naEnd = action.payload;
    },
    setAvailabilityToRemove(state, action: PayloadAction<Block | null>) {
      state.availabilityToRemove = action.payload;
    },
    setRemoveAvailabilityAction(state, action: PayloadAction<"remove" | "reschedule">) {
      state.removeAvailabilityAction = action.payload;
    },
    setRemoveAvailabilityStart(state, action: PayloadAction<string>) {
      state.removeAvailabilityStart = action.payload;
    },
    setRemoveAvailabilityEnd(state, action: PayloadAction<string>) {
      state.removeAvailabilityEnd = action.payload;
    },
    markAvailabilityRemoved(state, action: PayloadAction<string>) {
      state.removedAvailabilityIds[action.payload] = true;
    },
    /** §8.3: Remove the NA block that was created when a session was declined */
    removeUnavailableBySessionId(state, action: PayloadAction<string>) {
      state.unavailable = state.unavailable.filter((n) => n.sessionId !== action.payload);
    },
    setEditingLeaveGroupId(state, action: PayloadAction<string | null>) {
      state.editingLeaveGroupId = action.payload;
    },
    removeUnavailableByGroupId(state, action: PayloadAction<string>) {
      state.unavailable = state.unavailable.filter((n) => n.groupId !== action.payload);
    },
  },
});

export const {
  setPatterns,
  setOneOffAvail,
  addOneOffAvail,
  setUnavailable,
  addUnavailable,
  setHasUserConfiguredAvailability,
  setUserConfiguredPatterns,
  setMaxPerWeek,
  setRangeDays,
  setCalendarConnected,
  setShowExternalBusy,
  setAvailabilityPreviewMode,
  setBuilderPreset,
  setBuilderDays,
  setBuilderStart,
  setBuilderEnd,
  setAvailabilityStep,
  setAvailabilityDraftPatterns,
  setPresetCards,
  setEditingPresetKey,
  setEditingCustomSlotId,
  setNaStartDate,
  setNaEndDate,
  setNaReason,
  setNaStart,
  setNaEnd,
  setAvailabilityToRemove,
  setRemoveAvailabilityAction,
  setRemoveAvailabilityStart,
  setRemoveAvailabilityEnd,
  markAvailabilityRemoved,
  removeUnavailableBySessionId,
  setEditingLeaveGroupId,
  removeUnavailableByGroupId,
} = availabilitySlice.actions;

export default availabilitySlice.reducer;
