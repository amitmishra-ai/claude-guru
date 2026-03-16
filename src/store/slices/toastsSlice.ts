import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ToastMsg } from "@/lib/types";

interface ToastsState {
  items: ToastMsg[];
}

const initialState: ToastsState = {
  items: [],
};

const toastsSlice = createSlice({
  name: "toasts",
  initialState,
  reducers: {
    pushToast(state, action: PayloadAction<Omit<ToastMsg, "id">>) {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      state.items.push({ id, ...action.payload });
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
    clearToasts(state) {
      state.items = [];
    },
  },
});

export const { pushToast, dismissToast, clearToasts } = toastsSlice.actions;
export default toastsSlice.reducer;
