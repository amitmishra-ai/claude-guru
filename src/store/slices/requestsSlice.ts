import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RequestSlot } from "@/lib/types";
import { demoRequests } from "@/data/demo-requests";

interface RequestsState {
  items: RequestSlot[];
  requestFocus: RequestSlot | null;
}

const initialState: RequestsState = {
  items: demoRequests,
  requestFocus: null,
};

const requestsSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {
    setRequests(state, action: PayloadAction<RequestSlot[]>) {
      state.items = action.payload;
    },
    respondToRequest(state, action: PayloadAction<{ id: string; response: "available" | "unavailable" }>) {
      const req = state.items.find((r) => r.id === action.payload.id);
      if (req) req.response = action.payload.response;
    },
    setRequestFocus(state, action: PayloadAction<RequestSlot | null>) {
      state.requestFocus = action.payload;
    },
  },
});

export const { setRequests, respondToRequest, setRequestFocus } = requestsSlice.actions;
export default requestsSlice.reducer;
