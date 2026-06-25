import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type GuruRole =
  | "Career Mentor"
  | "Course Mentor"
  | "Career + Course Mentor"
  | "CV Review Mentor"
  | "Evaluator"
  | "Industry Expert"
  | "Moderator"
  | "Project Mentor"
  | "Secondary Guru"
  | "Teacher";

export type GuruStage = "experienced" | "mid" | "new" | "early" | "onboarding" | "empty";

export const GURU_STAGES: { value: GuruStage; label: string; description: string }[] = [
  { value: "onboarding", label: "Onboarding", description: "Code of Conduct acceptance, first-time setup" },
  { value: "experienced", label: "Experienced", description: "Full data, all sections populated" },
  { value: "mid", label: "Mid (6 months)", description: "6 months in, partial data, building track record" },
  { value: "early", label: "Early (2 weeks)", description: "Has availability & upcoming sessions, no completions" },
  { value: "new", label: "New (Day 0)", description: "Just onboarded, zero data everywhere" },
  { value: "empty", label: "Empty", description: "Zero data everywhere, tests all empty states" },
];

export const GURU_ROLES: GuruRole[] = [
  "Career Mentor",
  "Course Mentor",
  "Career + Course Mentor",
  "CV Review Mentor",
  "Evaluator",
  "Industry Expert",
  "Moderator",
  "Project Mentor",
  "Secondary Guru",
  "Teacher",
];

interface DevPanelState {
  isOpen: boolean;
  selectedRole: GuruRole;
  selectedRoles: GuruRole[];
  isRoleSwitching: boolean;
  guruStage: GuruStage;
  isV1Mode: boolean;
}

const savedRole =
  typeof window !== "undefined"
    ? (window.localStorage.getItem("guru-dev-role") as GuruRole | null)
    : null;

const parseSavedRoles = (): GuruRole[] | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("guru-dev-roles");
    if (!raw) return null;
    const arr = JSON.parse(raw) as GuruRole[];
    if (Array.isArray(arr) && arr.every((r) => GURU_ROLES.includes(r))) return arr;
  } catch { /* ignore */ }
  return null;
};

const resolvedRole = savedRole && GURU_ROLES.includes(savedRole) ? savedRole : "Course Mentor";

const parseSavedV1Mode = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("guru-dev-v1-mode") === "true";
};

const initialState: DevPanelState = {
  isOpen: false,
  selectedRole: resolvedRole,
  selectedRoles: parseSavedRoles() ?? [resolvedRole],
  isRoleSwitching: false,
  guruStage: "experienced",
  isV1Mode: parseSavedV1Mode(),
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
      // Keep selectedRoles in sync - add the new primary role if not present
      if (!state.selectedRoles.includes(action.payload)) {
        state.selectedRoles = [...state.selectedRoles, action.payload];
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem("guru-dev-role", action.payload);
        window.localStorage.setItem("guru-dev-roles", JSON.stringify(state.selectedRoles));
      }
    },
    setSelectedRoles(state, action: PayloadAction<GuruRole[]>) {
      state.selectedRoles = action.payload;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("guru-dev-roles", JSON.stringify(action.payload));
      }
    },
    toggleRole(state, action: PayloadAction<GuruRole>) {
      const role = action.payload;
      if (state.selectedRoles.includes(role)) {
        // Don't allow deselecting the last role
        if (state.selectedRoles.length > 1) {
          state.selectedRoles = state.selectedRoles.filter((r) => r !== role);
        }
      } else {
        state.selectedRoles = [...state.selectedRoles, role];
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem("guru-dev-roles", JSON.stringify(state.selectedRoles));
      }
    },
    clearRoleSwitching(state) {
      state.isRoleSwitching = false;
    },
    setGuruStage(state, action: PayloadAction<GuruStage>) {
      state.guruStage = action.payload;
    },
    setV1Mode(state, action: PayloadAction<boolean>) {
      state.isV1Mode = action.payload;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("guru-dev-v1-mode", String(action.payload));
      }
    },
    toggleV1Mode(state) {
      state.isV1Mode = !state.isV1Mode;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("guru-dev-v1-mode", String(state.isV1Mode));
      }
    },
  },
});

export const { toggleDevPanel, setDevPanelOpen, setSelectedRole, setSelectedRoles, toggleRole, clearRoleSwitching, setGuruStage, setV1Mode, toggleV1Mode } = devPanelSlice.actions;
export default devPanelSlice.reducer;
