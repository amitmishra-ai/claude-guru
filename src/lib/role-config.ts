import type { GuruRole } from "@/store/slices/devPanelSlice";
import type { SessionType, AvailRole } from "@/lib/types";

/* ── Role Category Mapping ───────────────────────────────────────────────── */

export type GuruRoleCategory = "Teaching" | "Mentoring" | "Evaluation & Moderation";

export const ROLE_TO_CATEGORY: Record<GuruRole, GuruRoleCategory> = {
  Teacher: "Teaching",
  "Industry Expert": "Teaching",
  "Secondary Guru": "Teaching",
  "Course Mentor": "Mentoring",
  "Career Mentor": "Mentoring",
  "Career + Course Mentor": "Mentoring",
  "CV Review Mentor": "Mentoring",
  "Project Mentor": "Mentoring",
  Evaluator: "Evaluation & Moderation",
  Moderator: "Evaluation & Moderation",
};

export const ALL_CATEGORIES: GuruRoleCategory[] = [
  "Teaching",
  "Mentoring",
  "Evaluation & Moderation",
];

export function getCategoriesForRoles(roles: GuruRole[]): GuruRoleCategory[] {
  const seen = new Set<GuruRoleCategory>();
  const result: GuruRoleCategory[] = [];
  for (const r of roles) {
    const cat = ROLE_TO_CATEGORY[r];
    if (!seen.has(cat)) {
      seen.add(cat);
      result.push(cat);
    }
  }
  return result;
}

/* ── Role → Session Types ────────────────────────────────────────────────── */

/**
 * Maps each Guru role to the session types visible for that role.
 * "all" means the role sees every session type.
 */
export const ROLE_SESSION_TYPES: Record<GuruRole, SessionType[] | "all"> = {
  Teacher: ["Mentored Learning session", "Online class", "Online session", "Residency"],
  "Course Mentor": ["Mentored Learning session", "Online session", "Online class", "Residency"],
  "Career Mentor": ["Career mentoring session", "Schedule a call"],
  /* Does both career mentoring and course mentoring — union of both roles.
     Also carries Capstone project mentoring so this role can act as the
     single "see every session type" persona for card/CTA review. */
  "Career + Course Mentor": [
    "Career mentoring session",
    "Schedule a call",
    "Mentored Learning session",
    "Online session",
    "Online class",
    "Residency",
    "Capstone project mentoring session",
  ],
  "CV Review Mentor": ["CV Review"],
  Evaluator: ["Evaluation"],
  Moderator: ["Moderation"],
  "Project Mentor": ["Capstone project mentoring session"],
  "Industry Expert": ["Industry session", "Online session"],
  /* Secondary Guru assists on online sessions only — no classes, residencies,
     mentoring, evaluation, or moderation. */
  "Secondary Guru": ["Online session"],
};

/* ── Role-specific availability visuals (Career + Course Mentor) ──────────── */

/** The combined role that can split availability between its two roles. */
export const COMBINED_MENTOR_ROLE: GuruRole = "Career + Course Mentor";

/**
 * Visual treatment for an availability slot tagged to a role.
 * - course → teal theme vars, career → violet theme vars, both/undefined → the existing emerald look.
 * All three use the same theme-adaptive CSS variable pattern (translucent fill +
 * tinted border + text that flips to a light shade in dark mode).
 * Values feed MUI `sx` (theme tokens like "success.main" and CSS vars both work).
 */
export function availRoleVisual(availFor?: AvailRole): {
  bg: string;
  border: string;
  text: string;
  label: string;
} {
  if (availFor === "course") return { bg: "var(--gl-cal-avail-course-bg)", border: "var(--gl-cal-avail-course-border)", text: "var(--gl-cal-avail-course-text)", label: "Course" };
  if (availFor === "career") return { bg: "var(--gl-cal-avail-career-bg)", border: "var(--gl-cal-avail-career-border)", text: "var(--gl-cal-avail-career-text)", label: "Career" };
  // both / undefined — unchanged emerald availability styling
  return { bg: "var(--gl-cal-avail-bg)", border: "success.main", text: "success.dark", label: "" };
}

export function filterSessionsByRole<T extends { sessionType: string }>(
  items: T[],
  role: GuruRole,
): T[] {
  const allowed = ROLE_SESSION_TYPES[role];
  if (allowed === "all") return items;
  return items.filter((item) => (allowed as string[]).includes(item.sessionType));
}
