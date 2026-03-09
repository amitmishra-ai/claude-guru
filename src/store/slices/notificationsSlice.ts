import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { NotificationItem } from "@/lib/types";
import { demoNotifications } from "@/data/demo-notifications";

interface NotificationsState {
  items: NotificationItem[];
}

const initialState: NotificationsState = {
  items: demoNotifications,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<NotificationItem[]>) {
      state.items = action.payload;
    },
    markRead(state, action: PayloadAction<string>) {
      const n = state.items.find((i) => i.id === action.payload);
      if (n) n.read = true;
    },
    markAllRead(state) {
      for (const n of state.items) n.read = true;
    },
    removeNotification(state, action: PayloadAction<string>) {
      state.items = state.items.filter((n) => n.id !== action.payload);
    },
  },
});

export const { setNotifications, markRead, markAllRead, removeNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
