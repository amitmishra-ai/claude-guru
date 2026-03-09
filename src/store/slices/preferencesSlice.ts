import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Preferences } from "@/lib/types";

interface PreferencesState {
  prefs: Preferences;
}

const initialState: PreferencesState = {
  prefs: {
    essential: true,
    learnerCC: false,
    batchChatter: false,
    systemNoise: false,
    reminders: true,
  },
};

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setPrefs(state, action: PayloadAction<Preferences>) {
      state.prefs = action.payload;
    },
    togglePref(state, action: PayloadAction<keyof Preferences>) {
      const key = action.payload;
      state.prefs[key] = !state.prefs[key];
    },
  },
});

export const { setPrefs, togglePref } = preferencesSlice.actions;
export default preferencesSlice.reducer;
