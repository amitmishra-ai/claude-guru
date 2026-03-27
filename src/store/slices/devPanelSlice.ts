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

export type GuruStage = "experienced" | "new" | "early" | "onboarding" | "empty";

export const GURU_STAGES: { value: GuruStage; label: string; description: string }[] = [
  { value: "onboarding", label: "Onboarding", description: "Code of Conduct acceptance, first-time setup" },
  { value: "experienced", label: "Experienced", description: "Full data, all sections populated" },
  { value: "early", label: "Early (2 weeks)", description: "Has availability & upcoming sessions, no completions" },
  { value: "new", label: "New (Day 0)", description: "Just onboarded, zero data everywhere" },
  { value: "empty", label: "Empty", description: "Zero data everywhere — tests all empty states" },
];

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
  isRoleSwitching: boolean;
  guruStage: GuruStage;
}

const savedRole =
  typeof window !== "undefined"
    ? (window.localStorage.getItem("guru-dev-role") as GuruRole | null)
    : null;

const initialState: DevPanelState = {
  isOpen: false,
  selectedRole: savedRole && GURU_ROLES.includes(savedRole) ? savedRole : "Course Mentor",
  isRoleSwitching: false,
  guruStage: "experienced",
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
      if (state.selectedRole !== action.payload) {
        state.isRoleSwitching = true;
      }
      state.selectedRole = action.payload;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("guru-dev-role", action.payload);
      }
    },
    clearRoleSwitching(state) {
      state.isRoleSwitching = false;
    },
    setGuruStage(state, action: PayloadAction<GuruStage>) {
      state.guruStage = action.payload;
    },
  },
});

export const { toggleDevPanel, setDevPanelOpen, setSelectedRole, clearRoleSwitching, setGuruStage } = devPanelSlice.actions;
export default devPanelSlice.reducer;
