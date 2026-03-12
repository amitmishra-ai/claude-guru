import { minutes } from "@/lib/helpers";
import type { RequestSlot } from "@/lib/types";

export const demoRequestsBase: Array<Omit<RequestSlot, "response">> = [
  {
    id: "r1",
    title: "Extra Session Request: Doubt Clearing",
    program: "PGP-DS",
    cohort: "Cohort Mar",
    groupHint: "High work, mixed prog",
    dateYmd: "2026-03-17",
    start: minutes(10),
    end: minutes(12),
    location: "Online",
  },
  {
    id: "r2",
    title: "Session Request: Data Visualization",
    program: "PGP-DS",
    cohort: "Cohort Mar",
    groupHint: "Low work, high prog",
    dateYmd: "2026-03-19",
    start: minutes(18),
    end: minutes(20),
    location: "Online",
  },
  {
    id: "r3",
    title: "Session Request: Capstone Review",
    program: "PGP-DS",
    cohort: "Cohort Mar",
    groupHint: "Mixed",
    dateYmd: "2026-03-25",
    start: minutes(18),
    end: minutes(20),
    location: "Online",
  },
];

export const demoRequests: RequestSlot[] = demoRequestsBase.map((r) => ({
  ...r,
  response: "pending" as const,
}));
