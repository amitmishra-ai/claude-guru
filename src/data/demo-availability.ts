import { minutes } from "@/lib/helpers";
import type { Pattern } from "@/lib/types";

export const demoPatterns: Pattern[] = [
  {
    id: "p1",
    label: "Weekends morning",
    days: ["Saturday", "Sunday"],
    start: minutes(10),
    end: minutes(12),
  },
  {
    id: "p2",
    label: "Weekday evenings",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    start: minutes(18),
    end: minutes(20),
  },
];
