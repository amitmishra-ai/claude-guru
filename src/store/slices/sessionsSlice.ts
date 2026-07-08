import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Session, SessionType } from "@/lib/types";
import { demoSessions } from "@/data/demo-sessions";

interface SessionsState {
  items: Session[];
  confirmations: Record<string, boolean>;
  sessionDeclined: Record<string, boolean>;
  sessionDeclinedAtYmd: Record<string, string>;
  sessionDeclinedReasons: Record<string, string>;
  sessionFocus: Session | null;
  homeSessionsView: "next" | "completed";
  selectedSessionType: "All" | SessionType;
  selectedTimePeriod: "All" | "Last 6 months" | "2025" | "2024" | "2023" | "2022";
  confirmMoveSessionId: string | null;
  recentlyMovedConfirmedId: string | null;
  declineMoveSessionId: string | null;
  declineSessionFocus: Session | null;
  declineReason: string;
  recentlyConfirmedIds: Record<string, number>;
}

const initialState: SessionsState = {
  items: demoSessions,
  confirmations: { s0: true, eval3: true, eval5: true, mod3: true },
  sessionDeclined: {},
  sessionDeclinedAtYmd: {},
  sessionDeclinedReasons: {},
  sessionFocus: null,
  homeSessionsView: "next",
  selectedSessionType: "All",
  selectedTimePeriod: "Last 6 months",
  confirmMoveSessionId: null,
  recentlyMovedConfirmedId: null,
  declineMoveSessionId: null,
  declineSessionFocus: null,
  declineReason: "",
  recentlyConfirmedIds: {},
};

const sessionsSlice = createSlice({
  name: "sessions",
  initialState,
  reducers: {
    setSessions(state, action: PayloadAction<Session[]>) {
      state.items = action.payload;
    },
    confirmSession(state, action: PayloadAction<string>) {
      state.confirmations[action.payload] = true;
      state.recentlyConfirmedIds[action.payload] = Date.now();
    },
    clearRecentlyConfirmed(state, action: PayloadAction<string>) {
      delete state.recentlyConfirmedIds[action.payload];
    },
    unconfirmSession(state, action: PayloadAction<string>) {
      delete state.confirmations[action.payload];
    },
    declineSession(state, action: PayloadAction<{ id: string; dateYmd: string; reason?: string }>) {
      state.sessionDeclined[action.payload.id] = true;
      state.sessionDeclinedAtYmd[action.payload.id] = action.payload.dateYmd;
      if (action.payload.reason) {
        state.sessionDeclinedReasons[action.payload.id] = action.payload.reason;
      }
    },
    /** §8.3 Accept from Declined - undecline + re-confirm */
    acceptSession(state, action: PayloadAction<string>) {
      delete state.sessionDeclined[action.payload];
      delete state.sessionDeclinedAtYmd[action.payload];
      state.confirmations[action.payload] = true;
    },
    setSessionFocus(state, action: PayloadAction<Session | null>) {
      state.sessionFocus = action.payload;
    },
    setHomeSessionsView(state, action: PayloadAction<"next" | "completed">) {
      state.homeSessionsView = action.payload;
    },
    setSelectedSessionType(state, action: PayloadAction<"All" | SessionType>) {
      state.selectedSessionType = action.payload;
    },
    setSelectedTimePeriod(state, action: PayloadAction<SessionsState["selectedTimePeriod"]>) {
      state.selectedTimePeriod = action.payload;
    },
    setConfirmMoveSessionId(state, action: PayloadAction<string | null>) {
      state.confirmMoveSessionId = action.payload;
    },
    setRecentlyMovedConfirmedId(state, action: PayloadAction<string | null>) {
      state.recentlyMovedConfirmedId = action.payload;
    },
    setDeclineMoveSessionId(state, action: PayloadAction<string | null>) {
      state.declineMoveSessionId = action.payload;
    },
    setDeclineSessionFocus(state, action: PayloadAction<Session | null>) {
      state.declineSessionFocus = action.payload;
    },
    setDeclineReason(state, action: PayloadAction<string>) {
      state.declineReason = action.payload;
    },
  },
});

export const {
  setSessions,
  confirmSession,
  clearRecentlyConfirmed,
  unconfirmSession,
  declineSession,
  acceptSession,
  setSessionFocus,
  setHomeSessionsView,
  setSelectedSessionType,
  setSelectedTimePeriod,
  setConfirmMoveSessionId,
  setRecentlyMovedConfirmedId,
  setDeclineMoveSessionId,
  setDeclineSessionFocus,
  setDeclineReason,
} = sessionsSlice.actions;

export default sessionsSlice.reducer;
