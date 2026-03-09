import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import sessionsReducer from "./slices/sessionsSlice";
import requestsReducer from "./slices/requestsSlice";
import availabilityReducer from "./slices/availabilitySlice";
import calendarReducer from "./slices/calendarSlice";
import profileReducer from "./slices/profileSlice";
import uiReducer from "./slices/uiSlice";
import notificationsReducer from "./slices/notificationsSlice";
import preferencesReducer from "./slices/preferencesSlice";
import toastsReducer from "./slices/toastsSlice";
import pollsReducer from "./slices/pollsSlice";
import { ninjaApi } from "@/api/ninja/ninjaApi";

export const store = configureStore({
  reducer: {
    // Feature slices (local UI state)
    sessions: sessionsReducer,
    requests: requestsReducer,
    availability: availabilityReducer,
    calendar: calendarReducer,
    profile: profileReducer,
    ui: uiReducer,
    notifications: notificationsReducer,
    preferences: preferencesReducer,
    toasts: toastsReducer,
    polls: pollsReducer,
    // RTK Query API cache
    [ninjaApi.reducerPath]: ninjaApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(ninjaApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
