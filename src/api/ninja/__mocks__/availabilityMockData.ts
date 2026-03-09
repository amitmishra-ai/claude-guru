import type { Pattern } from "@/lib/types";

export const mockAvailabilityPatterns: Pattern[] = [
  {
    id: "preset-weekends",
    label: "Weekend morning",
    days: ["Saturday", "Sunday"],
    start: 600,
    end: 720,
  },
];

export const mockSaveAvailabilityResponse = {
  message: "Availability saved successfully",
};
