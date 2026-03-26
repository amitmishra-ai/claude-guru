import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { demoNow } from "@/lib/constants";

export type CalendarViewMode = "day" | "week" | "month" | "weekdays" | "weekend";

interface CalendarState {
  anchorDate: string; // ISO string for serialization
  calendarViewMode: CalendarViewMode;
}

const initialState: CalendarState = {
  anchorDate: new Date().toISOString(),
  calendarViewMode: "week",
};

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    setAnchorDate(state, action: PayloadAction<string>) {
      state.anchorDate = action.payload;
    },
    setCalendarViewMode(state, action: PayloadAction<CalendarViewMode>) {
      state.calendarViewMode = action.payload;
    },
  },
});

export const { setAnchorDate, setCalendarViewMode } = calendarSlice.actions;
export default calendarSlice.reducer;
