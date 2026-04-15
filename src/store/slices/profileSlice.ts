import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ProfileState {
  guruName: string;
  guruEmail: string;
  /** Avatar photo as a data URL (base64). null = show initials fallback. */
  guruPhoto: string | null;
  primaryMode: "Online" | "Hybrid" | "In-person";
  guruPrograms: string;
  timeZoneMode: "auto" | "manual";
  manualTimeZone: string;
  /** Offset in minutes from base timezone (Asia/Kolkata) to effective timezone */
  tzOffsetMinutes: number;
  // Draft state for edit dialog
  draftName: string;
  draftMode: "Online" | "Hybrid" | "In-person";
  draftPrograms: string;
}

const savedPhoto = typeof window !== "undefined" ? window.localStorage.getItem("guru-photo") : null;

const initialState: ProfileState = {
  guruName: "Snehanjan Shome",
  guruEmail: "snehanjan.shome@greatlearning.in",
  guruPhoto: savedPhoto,
  primaryMode: "Online",
  guruPrograms: "PGP-DS",
  timeZoneMode: "auto",
  manualTimeZone: "Asia/Kolkata",
  tzOffsetMinutes: 0,
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
    setGuruEmail(state, action: PayloadAction<string>) {
      state.guruEmail = action.payload;
    },
    setGuruPhoto(state, action: PayloadAction<string | null>) {
      state.guruPhoto = action.payload;
      if (typeof window !== "undefined") {
        if (action.payload) window.localStorage.setItem("guru-photo", action.payload);
        else window.localStorage.removeItem("guru-photo");
      }
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
    setTzOffsetMinutes(state, action: PayloadAction<number>) {
      state.tzOffsetMinutes = action.payload;
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
  setGuruEmail,
  setGuruPhoto,
  setPrimaryMode,
  setGuruPrograms,
  setTimeZoneMode,
  setManualTimeZone,
  setTzOffsetMinutes,
  setDraftName,
  setDraftMode,
  setDraftPrograms,
  saveProfileEdits,
  populateDrafts,
} = profileSlice.actions;

export default profileSlice.reducer;
