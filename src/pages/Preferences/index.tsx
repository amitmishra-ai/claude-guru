import SettingsIcon from "@mui/icons-material/Settings";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAppSelector, useAppDispatch } from "@/store";
import { togglePref } from "@/store/slices/preferencesSlice";
import { setIsDarkMode } from "@/store/slices/uiSlice";
import type { Preferences } from "@/lib/types";

const commItems: Array<{ key: keyof Preferences; label: string; description: string }> = [
  { key: "essential", label: "Essential updates", description: "Session confirmations, schedule changes, and ops-critical alerts." },
  { key: "learnerCC", label: "Learner CC emails", description: "Get CC'd on emails sent to learners about your sessions." },
  { key: "batchChatter", label: "Batch chatter", description: "Group-level updates, cohort announcements, forum activity." },
  { key: "systemNoise", label: "System notifications", description: "Product updates, tips, and maintenance alerts." },
  { key: "reminders", label: "Session reminders", description: "30-minute and 1-day reminders before your sessions." },
];

export default function PreferencesPage() {
  const dispatch = useAppDispatch();
  const prefs = useAppSelector((s) => s.preferences.prefs);
  const isDarkMode = useAppSelector((s) => s.ui.isDarkMode);

  return (
    <>
      <PageHeader icon={SettingsIcon} title="Settings" subtitle="Manage your appearance, notifications, and communication preferences." />

      {/* ── Appearance ── */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3, mb: 1.5 }}>Appearance</Typography>
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
              {isDarkMode
                ? <DarkModeOutlinedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                : <LightModeOutlinedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
              }
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Dark mode</Typography>
                <Box sx={{ mt: 0.25, fontSize: "0.75rem", color: "hsl(var(--md-on-surface-variant))" }}>
                  Switch between light and dark theme.
                </Box>
              </Box>
            </Box>
            <Switch
              checked={isDarkMode}
              onChange={() => dispatch(setIsDarkMode(!isDarkMode))}
            />
          </Box>
        </CardContent>
      </Card>

      {/* ── Communication ── */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>Communication</Typography>
      <Card variant="outlined">
        <CardContent sx={{ py: 0.5, "&:last-child": { pb: 0.5 } }}>
          {commItems.map((item, idx) => (
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
              {idx < commItems.length - 1 && <Divider />}
            </Box>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
