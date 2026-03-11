import SettingsIcon from "@mui/icons-material/Settings";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAppSelector, useAppDispatch } from "@/store";
import { togglePref } from "@/store/slices/preferencesSlice";
import type { Preferences } from "@/lib/types";

const prefItems: Array<{ key: keyof Preferences; label: string; description: string }> = [
  { key: "essential", label: "Essential updates", description: "Session confirmations, schedule changes, and ops-critical alerts." },
  { key: "learnerCC", label: "Learner CC emails", description: "Get CC'd on emails sent to learners about your sessions." },
  { key: "batchChatter", label: "Batch chatter", description: "Group-level updates, cohort announcements, forum activity." },
  { key: "systemNoise", label: "System notifications", description: "Product updates, tips, and maintenance alerts." },
  { key: "reminders", label: "Session reminders", description: "30-minute and 1-day reminders before your sessions." },
];

export default function PreferencesPage() {
  const dispatch = useAppDispatch();
  const prefs = useAppSelector((s) => s.preferences.prefs);

  return (
    <>
      <PageHeader icon={SettingsIcon} title="Preferences" subtitle="Manage your notification and communication settings." />

      <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 0.5 }}>
        {prefItems.map((item, idx) => (
          <Box key={item.key}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, py: 1.5 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.label}</Typography>
                <Box sx={{ mt: 0.25, fontSize: "0.75rem", color: "hsl(var(--md-on-surface-variant))" }}>{item.description}</Box>
              </Box>
              <Switch
                checked={prefs[item.key]}
                onChange={() => dispatch(togglePref(item.key))}
              />
            </Box>
            {idx < prefItems.length - 1 && <Divider />}
          </Box>
        ))}
      </Box>
    </>
  );
}
