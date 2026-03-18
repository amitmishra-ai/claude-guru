import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type GuruRole =
  | "Career Mentor"
  | "Course Mentor"
  | "CV Review Mentor"
  | "Evaluator"
  | "Industry Expert"
  | "Moderator"
  | "Project Mentor"
  | "Teacher";

export const GURU_ROLES: GuruRole[] = [
  "Career Mentor",
  "Course Mentor",
  "CV Review Mentor",
  "Evaluator",
  "Industry Expert",
  "Moderator",
  "Project Mentor",
  "Teacher",
];

interface DevPanelState {
  isOpen: boolean;
  selectedRole: GuruRole;
}

const savedRole =
  typeof window !== "undefined"
    ? (window.localStorage.getItem("guru-dev-role") as GuruRole | null)
    : null;

const initialState: DevPanelState = {
  isOpen: false,
  selectedRole: savedRole && GURU_ROLES.includes(savedRole) ? savedRole : "Teacher",
};

const devPanelSlice = createSlice({
  name: "devPanel",
  initialState,
  reducers: {
    toggleDevPanel(state) {
      state.isOpen = !state.isOpen;
    },
    setDevPanelOpen(state, action: PayloadAction<boolean>) {
      state.isOpen = action.payload;
    },
    setSelectedRole(state, action: PayloadAction<GuruRole>) {
      state.selectedRole = action.payload;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("guru-dev-role", action.payload);
      }
    },
  },
});

export const { toggleDevPanel, setDevPanelOpen, setSelectedRole } = devPanelSlice.actions;
export default devPanelSlice.reducer;
