import SettingsIcon from "@mui/icons-material/Settings";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import SettingsBrightnessOutlinedIcon from "@mui/icons-material/SettingsBrightnessOutlined";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAppSelector, useAppDispatch } from "@/store";
import { togglePref } from "@/store/slices/preferencesSlice";
import { setThemeMode } from "@/store/slices/uiSlice";
import type { Preferences } from "@/lib/types";

const commItems: Array<{ key: keyof Preferences; label: string; description: string }> = [
  { key: "essential", label: "Essential updates", description: "Event confirmations, schedule changes, and ops-critical alerts." },
  { key: "learnerCC", label: "Learner CC emails", description: "Get CC'd on emails sent to learners about your events." },
  { key: "batchChatter", label: "Batch chatter", description: "Group-level updates, cohort announcements, forum activity." },
  { key: "systemNoise", label: "System notifications", description: "Product updates, tips, and maintenance alerts." },
  { key: "reminders", label: "Event reminders", description: "30-minute and 1-day reminders before your events." },
];

export default function PreferencesPage() {
  const dispatch = useAppDispatch();
  const prefs = useAppSelector((s) => s.preferences.prefs);
  const themeMode = useAppSelector((s) => s.ui.themeMode);

  return (
    <>
      <PageHeader icon={SettingsIcon} title="Settings" subtitle="Manage your appearance, notifications, and communication preferences." />

      {/* ── Appearance ── */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3, mb: 1.5 }}>Appearance</Typography>
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Theme</Typography>
              <Box sx={{ mt: 0.25, fontSize: "0.75rem", color: "hsl(var(--md-on-surface-variant))" }}>
                Choose your preferred appearance.
              </Box>
            </Box>
            <ToggleButtonGroup
              value={themeMode}
              exclusive
              onChange={(_e, val) => { if (val) dispatch(setThemeMode(val)); }}
              size="small"
              sx={{
                "& .MuiToggleButton-root": {
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.8rem",
                  px: 1.5,
                  gap: 0.5,
                },
              }}
            >
              <ToggleButton value="system">
                <SettingsBrightnessOutlinedIcon sx={{ fontSize: 16 }} />
                System
              </ToggleButton>
              <ToggleButton value="light">
                <LightModeOutlinedIcon sx={{ fontSize: 16 }} />
                Light
              </ToggleButton>
              <ToggleButton value="dark">
                <DarkModeOutlinedIcon sx={{ fontSize: 16 }} />
                Dark
              </ToggleButton>
            </ToggleButtonGroup>
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
