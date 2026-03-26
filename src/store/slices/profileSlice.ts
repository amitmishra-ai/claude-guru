import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ProfileState {
  guruName: string;
  primaryMode: "Online" | "Hybrid" | "In-person";
  guruPrograms: string;
  timeZoneMode: "auto" | "manual";
  manualTimeZone: string;
  // Draft state for edit dialog
  draftName: string;
  draftMode: "Online" | "Hybrid" | "In-person";
  draftPrograms: string;
}

const initialState: ProfileState = {
  guruName: "Snehanjan Shome",
  primaryMode: "Online",
  guruPrograms: "PGP-DS",
  timeZoneMode: "auto",
  manualTimeZone: "Asia/Kolkata",
  draftName: "Snehanjan Shome",
  draftMode: "Online",
  draftPrograms: "PGP-DS",
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setGuruName(state, action: PayloadAction<string>) {
      state.guruName = action.payload;
    },
    setPrimaryMode(state, action: PayloadAction<"Online" | "Hybrid" | "In-person">) {
      state.primaryMode = action.payload;
    },
    setGuruPrograms(state, action: PayloadAction<string>) {
      state.guruPrograms = action.payload;
    },
    setTimeZoneMode(state, action: PayloadAction<"auto" | "manual">) {
      state.timeZoneMode = action.payload;
    },
    setManualTimeZone(state, action: PayloadAction<string>) {
      state.manualTimeZone = action.payload;
    },
    setDraftName(state, action: PayloadAction<string>) {
      state.draftName = action.payload;
    },
    setDraftMode(state, action: PayloadAction<"Online" | "Hybrid" | "In-person">) {
      state.draftMode = action.payload;
    },
    setDraftPrograms(state, action: PayloadAction<string>) {
      state.draftPrograms = action.payload;
    },
    saveProfileEdits(state) {
      state.guruName = state.draftName;
      state.primaryMode = state.draftMode;
      state.guruPrograms = state.draftPrograms;
    },
    populateDrafts(state) {
      state.draftName = state.guruName;
      state.draftMode = state.primaryMode;
      state.draftPrograms = state.guruPrograms;
    },
  },
});

export const {
  setGuruName,
  setPrimaryMode,
  setGuruPrograms,
  setTimeZoneMode,
  setManualTimeZone,
  setDraftName,
  setDraftMode,
  setDraftPrograms,
  saveProfileEdits,
  populateDrafts,
} = profileSlice.actions;

export default profileSlice.reducer;
