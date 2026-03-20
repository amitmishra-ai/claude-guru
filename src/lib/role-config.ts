import type { GuruRole } from "@/store/slices/devPanelSlice";
import type { SessionType } from "@/lib/types";

/**
 * Maps each Guru role to the session types visible for that role.
 * "all" means the role sees every session type.
 */
export const ROLE_SESSION_TYPES: Record<GuruRole, SessionType[] | "all"> = {
  Teacher: ["Mentored Learning session", "Online class", "Online session", "Residency"],
  "Course Mentor": ["Mentored Learning session", "Online session", "Online class", "Residency"],
  "Career Mentor": ["Career mentoring session", "Schedule a call"],
  "CV Review Mentor": ["CV Review"],
  Evaluator: ["Evaluation"],
  Moderator: ["Moderation"],
  "Project Mentor": ["Capstone project mentoring session"],
  "Industry Expert": ["Industry session", "Online session"],
};

export function filterSessionsByRole<T extends { sessionType: string }>(
  items: T[],
  role: GuruRole,
): T[] {
  const allowed = ROLE_SESSION_TYPES[role];
  if (allowed === "all") return items;
  return items.filter((item) => (allowed as string[]).includes(item.sessionType));
}
