/* Shared timezone option catalog + display helpers.
   Consumed by the reusable TimezonePicker so every timezone surface in
   the app (AvailabilityBuilder, TimezoneDialog, future callers) renders
   the same options in the same format. */

export const TIMEZONE_OPTIONS: { value: string; label: string }[] = [
  { value: "__auto__", label: "System timezone" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (India)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (UAE)" },
  { value: "Asia/Singapore", label: "Asia/Singapore" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "Europe/Berlin", label: "Europe/Berlin" },
  { value: "America/New_York", label: "America/New_York" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles" },
  { value: "Australia/Sydney", label: "Australia/Sydney" },
];

/** Returns just the UTC offset portion, e.g. "UTC+05:30". */
export function fmtTimezoneOffset(tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    const gmtOffset = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    return gmtOffset.replace("GMT", "UTC");
  } catch {
    return "UTC";
  }
}

/** Resolves the system IANA timezone for the "__auto__" option. */
export function getSystemTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
  } catch {
    return "Asia/Kolkata";
  }
}
