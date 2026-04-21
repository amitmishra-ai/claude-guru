import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  // Dialog open states
  openAvailability: boolean;
  openNotAvailable: boolean;
  openSession: boolean;
  openCompletedSession: boolean;
  openRequest: boolean;
  openPollBuilder: boolean;
  openTimezone: boolean;
  openGroupProfile: boolean;
  openRatingHistory: boolean;
  openLearnerRatings: boolean;
  openPerformanceMatrix: boolean;
  openAvailabilityNudge: boolean;
  openDeclineReason: boolean;
  openRemoveAvailability: boolean;
  openCustomSlotModal: boolean;
  openProfileEdit: boolean;
  openPreferences: boolean;
  openMarkUnavailable: boolean;
  openAddAvailability: boolean;
  openSessionDetails: boolean;
  openSessionMaterials: boolean;
  impactOpen: boolean;
  openCourseDetail: boolean;
  courseDetailId: string | null;
  // Popover state
  leavePopoverNaId: string | null;
  availPopoverBlockId: string | null;
  // Other UI state
  learnerRatingsSessionId: string | null;
  markUnavailableTarget: { type: "session" | "request"; id: string } | null;
  helloBarDismissed: boolean;
  isDarkMode: boolean;
  themeMode: "system" | "dark" | "light";
  isNavCollapsed: boolean;
  /** Payments-page "Show values" toggle — lifted to Redux so the activity
      drawer, when opened from /payments, can inherit the current visibility. */
  paymentsShowValues: boolean;
}

const initialState: UiState = {
  openAvailability: false,
  openNotAvailable: false,
  openSession: false,
  openCompletedSession: false,
  openRequest: false,
  openPollBuilder: false,
  openTimezone: false,
  openGroupProfile: false,
  openRatingHistory: false,
  openLearnerRatings: false,
  openPerformanceMatrix: false,
  openAvailabilityNudge: false,
  openDeclineReason: false,
  openRemoveAvailability: false,
  openCustomSlotModal: false,
  openProfileEdit: false,
  openPreferences: false,
  openMarkUnavailable: false,
  openAddAvailability: false,
  openSessionDetails: false,
  openSessionMaterials: false,
  impactOpen: false,
  openCourseDetail: false,
  courseDetailId: null,
  leavePopoverNaId: null,
  availPopoverBlockId: null,
  learnerRatingsSessionId: null,
  markUnavailableTarget: null,
  helloBarDismissed: false,
  isDarkMode: (() => {
    if (typeof window === "undefined") return true;
    const saved = window.localStorage.getItem("guru-theme");
    if (saved === "light") return false;
    if (saved === "dark") return true;
    // system or no saved value - check OS preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  })(),
  themeMode: (typeof window !== "undefined" ? window.localStorage.getItem("guru-theme") as "system" | "dark" | "light" : null) || "system",
  isNavCollapsed: true,
  paymentsShowValues: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setOpenAvailability(state, action: PayloadAction<boolean>) {
      state.openAvailability = action.payload;
    },
    setOpenNotAvailable(state, action: PayloadAction<boolean>) {
      state.openNotAvailable = action.payload;
    },
    setOpenSession(state, action: PayloadAction<boolean>) {
      state.openSession = action.payload;
    },
    setOpenCompletedSession(state, action: PayloadAction<boolean>) {
      state.openCompletedSession = action.payload;
    },
    setOpenRequest(state, action: PayloadAction<boolean>) {
      state.openRequest = action.payload;
    },
    setOpenPollBuilder(state, action: PayloadAction<boolean>) {
      state.openPollBuilder = action.payload;
    },
    setOpenTimezone(state, action: PayloadAction<boolean>) {
      state.openTimezone = action.payload;
    },
    setOpenGroupProfile(state, action: PayloadAction<boolean>) {
      state.openGroupProfile = action.payload;
    },
    setOpenRatingHistory(state, action: PayloadAction<boolean>) {
      state.openRatingHistory = action.payload;
    },
    setOpenLearnerRatings(state, action: PayloadAction<boolean>) {
      state.openLearnerRatings = action.payload;
    },
    setOpenPerformanceMatrix(state, action: PayloadAction<boolean>) {
      state.openPerformanceMatrix = action.payload;
    },
    setOpenAvailabilityNudge(state, action: PayloadAction<boolean>) {
      state.openAvailabilityNudge = action.payload;
    },
    setOpenDeclineReason(state, action: PayloadAction<boolean>) {
      state.openDeclineReason = action.payload;
    },
    setOpenRemoveAvailability(state, action: PayloadAction<boolean>) {
      state.openRemoveAvailability = action.payload;
    },
    setOpenCustomSlotModal(state, action: PayloadAction<boolean>) {
      state.openCustomSlotModal = action.payload;
    },
    setOpenProfileEdit(state, action: PayloadAction<boolean>) {
      state.openProfileEdit = action.payload;
    },
    setOpenPreferences(state, action: PayloadAction<boolean>) {
      state.openPreferences = action.payload;
    },
    setImpactOpen(state, action: PayloadAction<boolean>) {
      state.impactOpen = action.payload;
    },
    setLearnerRatingsSessionId(state, action: PayloadAction<string | null>) {
      state.learnerRatingsSessionId = action.payload;
    },
    setHelloBarDismissed(state, action: PayloadAction<boolean>) {
      state.helloBarDismissed = action.payload;
    },
    setIsDarkMode(state, action: PayloadAction<boolean>) {
      state.isDarkMode = action.payload;
    },
    setThemeMode(state, action: PayloadAction<"system" | "dark" | "light">) {
      state.themeMode = action.payload;
    },
    setIsNavCollapsed(state, action: PayloadAction<boolean>) {
      state.isNavCollapsed = action.payload;
    },
    setOpenMarkUnavailable(state, action: PayloadAction<boolean>) {
      state.openMarkUnavailable = action.payload;
    },
    setOpenAddAvailability(state, action: PayloadAction<boolean>) {
      state.openAddAvailability = action.payload;
    },
    setOpenSessionDetails(state, action: PayloadAction<boolean>) {
      state.openSessionDetails = action.payload;
    },
    setOpenSessionMaterials(state, action: PayloadAction<boolean>) {
      state.openSessionMaterials = action.payload;
    },
    setLeavePopoverNaId(state, action: PayloadAction<string | null>) {
      state.leavePopoverNaId = action.payload;
    },
    setAvailPopoverBlockId(state, action: PayloadAction<string | null>) {
      state.availPopoverBlockId = action.payload;
    },
    setMarkUnavailableTarget(state, action: PayloadAction<{ type: "session" | "request"; id: string } | null>) {
      state.markUnavailableTarget = action.payload;
    },
    setOpenCourseDetail(state, action: PayloadAction<boolean>) {
      state.openCourseDetail = action.payload;
    },
    setCourseDetailId(state, action: PayloadAction<string | null>) {
      state.courseDetailId = action.payload;
    },
    setPaymentsShowValues(state, action: PayloadAction<boolean>) {
      state.paymentsShowValues = action.payload;
    },
  },
});

export const {
  setOpenAvailability,
  setOpenNotAvailable,
  setOpenSession,
  setOpenCompletedSession,
  setOpenRequest,
  setOpenPollBuilder,
  setOpenTimezone,
  setOpenGroupProfile,
  setOpenRatingHistory,
  setOpenLearnerRatings,
  setOpenPerformanceMatrix,
  setOpenAvailabilityNudge,
  setOpenDeclineReason,
  setOpenRemoveAvailability,
  setOpenCustomSlotModal,
  setOpenProfileEdit,
  setOpenPreferences,
  setImpactOpen,
  setLearnerRatingsSessionId,
  setHelloBarDismissed,
  setIsDarkMode,
  setThemeMode,
  setIsNavCollapsed,
  setOpenMarkUnavailable,
  setOpenAddAvailability,
  setOpenSessionDetails,
  setOpenSessionMaterials,
  setLeavePopoverNaId,
  setAvailPopoverBlockId,
  setMarkUnavailableTarget,
  setOpenCourseDetail,
  setCourseDetailId,
  setPaymentsShowValues,
} = uiSlice.actions;

export default uiSlice.reducer;