import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { demoNow } from "@/lib/constants";

interface CalendarState {
  anchorDate: string; // ISO string for serialization
  calendarViewMode: "week" | "month";
}

const initialState: CalendarState = {
  anchorDate: demoNow.toISOString(),
  calendarViewMode: "week",
};

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    setAnchorDate(state, action: PayloadAction<string>) {
      state.anchorDate = action.payload;
    },
    setCalendarViewMode(state, action: PayloadAction<"week" | "month">) {
      state.calendarViewMode = action.payload;
    },
  },
});

export const { setAnchorDate, setCalendarViewMode } = calendarSlice.actions;
export default calendarSlice.reducer;
