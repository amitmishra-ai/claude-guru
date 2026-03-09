import { Settings } from "lucide-react";
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
      <PageHeader icon={Settings} title="Preferences" subtitle="Manage your notification and communication settings." />

      <div className="mt-4 space-y-1">
        {prefItems.map((item, idx) => (
          <div key={item.key}>
            <div className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.label}</Typography>
                <div className="mt-0.5 text-xs text-on-surface-variant">{item.description}</div>
              </div>
              <Switch
                checked={prefs[item.key]}
                onChange={() => dispatch(togglePref(item.key))}
              />
            </div>
            {idx < prefItems.length - 1 && <Divider />}
          </div>
        ))}
      </div>
    </>
  );
}
