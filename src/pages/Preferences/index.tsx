import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import SettingsBrightnessOutlinedIcon from "@mui/icons-material/SettingsBrightnessOutlined";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { MobilePageHeader } from "@/components/layout/MobilePageHeader";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAppSelector, useAppDispatch } from "@/store";
import { togglePref } from "@/store/slices/preferencesSlice";
import { setThemeMode, setOpenTimezone } from "@/store/slices/uiSlice";
import { setGuruName, setGuruEmail, setGuruPhoto } from "@/store/slices/profileSlice";
import { pushToast } from "@/store/slices/toastsSlice";
import { formatGMTOffsetFromMinutesAhead, getTimeZoneOffsetMinutes } from "@/lib/helpers";
import type { Preferences } from "@/lib/types";

const commItems: Array<{ key: keyof Preferences; label: string; description: string }> = [
  { key: "essential", label: "Essential updates", description: "Event confirmations, schedule changes, and ops-critical alerts." },
  { key: "learnerCC", label: "Learner CC emails", description: "Get CC'd on emails sent to learners about your events." },
  { key: "batchChatter", label: "Batch chatter", description: "Group-level updates, cohort announcements, forum activity." },
  { key: "systemNoise", label: "System notifications", description: "Product updates, tips, and maintenance alerts." },
  { key: "reminders", label: "Event reminders", description: "30-minute and 1-day reminders before your events." },
];

/* ── Shared primitives - Apple/Microsoft Settings row anatomy ──────────────
   Section = overline + rounded group card; group card holds rows separated
   by Dividers. Every row is a flex row: label+description on the left,
   control on the right. Uniform across Profile / Appearance / Communication. */

function SectionTitle({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <Typography
      id={id}
      variant="overline"
      sx={{
        display: "block",
        mt: 3,
        mb: 0.75,
        px: 1,
        fontSize: "0.7rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        color: "text.secondary",
        scrollMarginTop: 80,
      }}
    >
      {children}
    </Typography>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        borderRadius: "12px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      {children}
    </Box>
  );
}

function Row({
  label,
  description,
  control,
}: {
  label: React.ReactNode;
  description?: React.ReactNode;
  control: React.ReactNode;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={2}
      sx={{ px: 2, py: 1.5 }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.35 }}>
          {label}
        </Typography>
        {description && (
          <Typography
            component="div"
            variant="caption"
            sx={{ color: "text.secondary", display: "block", mt: 0.25, lineHeight: 1.4, wordBreak: "break-word" }}
          >
            {description}
          </Typography>
        )}
      </Box>
      <Box sx={{ flexShrink: 0 }}>
        {control}
      </Box>
    </Stack>
  );
}

/* ── Small reusable edit-field dialog (name / email) ─────────────────────
   Keeps Profile rows read-only on the page, opens a focused modal for
   a single field edit with explicit Save / Cancel. Matches how Airbnb /
   Google Account handle atomic field edits. */
function EditFieldDialog({
  open,
  title,
  label,
  value,
  type = "text",
  placeholder,
  onSave,
  onClose,
  validate,
}: {
  open: boolean;
  title: string;
  label: string;
  value: string;
  type?: "text" | "email";
  placeholder?: string;
  onSave: (next: string) => void;
  onClose: () => void;
  validate?: (next: string) => string | null; // returns error message or null
}) {
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);

  // Reset draft whenever the dialog opens with a fresh value
  useEffect(() => {
    if (open) {
      setDraft(value);
      setError(null);
    }
  }, [open, value]);

  const handleSave = () => {
    const trimmed = draft.trim();
    const err = validate ? validate(trimmed) : null;
    if (err) {
      setError(err);
      return;
    }
    onSave(trimmed);
    onClose();
  };

  const dirty = draft.trim() !== value.trim();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.05rem", pb: 1 }}>{title}</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <TextField
          autoFocus
          fullWidth
          size="small"
          label={label}
          type={type}
          value={draft}
          onChange={(e) => { setDraft(e.target.value); if (error) setError(null); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
          placeholder={placeholder}
          error={!!error}
          helperText={error ?? " "}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="text" sx={{ textTransform: "none", fontWeight: 600 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!dirty || !draft.trim()}
          sx={{ textTransform: "none", fontWeight: 600, borderRadius: "8px" }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function PreferencesPage() {
  const dispatch = useAppDispatch();
  const prefs = useAppSelector((s) => s.preferences.prefs);
  const themeMode = useAppSelector((s) => s.ui.themeMode);
  const isV1Mode = useAppSelector((s) => s.devPanel.isV1Mode);
  const guruName = useAppSelector((s) => s.profile.guruName);
  const guruEmail = useAppSelector((s) => s.profile.guruEmail);
  const guruPhoto = useAppSelector((s) => s.profile.guruPhoto);
  const timeZoneMode = useAppSelector((s) => s.profile.timeZoneMode);
  const manualTimeZone = useAppSelector((s) => s.profile.manualTimeZone);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const location = useLocation();

  const [editField, setEditField] = useState<"name" | "email" | null>(null);

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
    return () => window.clearTimeout(t);
  }, [location.hash]);

  const guruInitials = guruName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const tzName = timeZoneMode === "auto"
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : manualTimeZone;
  const tzLabel = `${tzName} (${formatGMTOffsetFromMinutesAhead(getTimeZoneOffsetMinutes(tzName))})`;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      dispatch(pushToast({ title: "Invalid file", description: "Please select an image file." }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      dispatch(pushToast({ title: "File too large", description: "Please select an image under 2MB." }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      dispatch(setGuruPhoto(reader.result as string));
      dispatch(pushToast({ title: "Photo updated" }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  /* Inline Edit text-button reused by Full name / Email rows. */
  const EditButton = ({ onClick, ariaLabel }: { onClick: () => void; ariaLabel: string }) => (
    <Button
      variant="text"
      size="small"
      onClick={onClick}
      aria-label={ariaLabel}
      endIcon={<ChevronRightIcon sx={{ fontSize: 18 }} />}
      sx={{
        textTransform: "none",
        fontWeight: 600,
        px: 1,
        color: "primary.main",
        "& .MuiButton-endIcon": { ml: 0 },
      }}
    >
      Edit
    </Button>
  );

  return (
    <>
      <MobilePageHeader title="Settings" />
      <PageHeader title="Settings" subtitle="Manage your profile, appearance, notifications, and communication preferences." />

      {/* No extra max-width wrapper - AppLayout already constrains content to
          72rem, so Settings inherits the same page grid as every other page. */}
      <Box sx={{ pb: 4 }}>

        {/* ═══ Profile ═══════════════════════════════════════════════════ */}
        <SectionTitle id="profile">Profile</SectionTitle>
        <SectionCard>
          {/* Photo - breaks the label/control pattern (avatar + buttons) */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ px: 2, py: 2 }}>
            <Avatar
              variant="circular"
              src={guruPhoto ?? undefined}
              sx={{
                width: 56, height: 56,
                borderRadius: "50%",
                fontSize: "1.25rem", fontWeight: 700,
                bgcolor: "primary.main", color: "primary.contrastText",
                flexShrink: 0,
              }}
            >
              {guruInitials}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.35 }}>
                Profile photo
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.25 }}>
                JPG, PNG, or GIF · max 2 MB
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
              <Button
                variant="soft"
                size="small"
                color="primary"
                startIcon={<PhotoCameraOutlinedIcon sx={{ fontSize: 16 }} />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ textTransform: "none", fontWeight: 600, borderRadius: "8px" }}
              >
                {guruPhoto ? "Change" : "Upload"}
              </Button>
              {guruPhoto && (
                <Button
                  variant="text"
                  size="small"
                  color="inherit"
                  onClick={() => dispatch(setGuruPhoto(null))}
                  sx={{ textTransform: "none", fontWeight: 500, color: "text.secondary", minWidth: 0 }}
                >
                  Remove
                </Button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
            </Stack>
          </Stack>
          <Divider />

          <Row
            label="Full name"
            description={guruName}
            control={<EditButton onClick={() => setEditField("name")} ariaLabel="Edit full name" />}
          />
          <Divider />

          <Row
            label="Email"
            description={guruEmail}
            control={<EditButton onClick={() => setEditField("email")} ariaLabel="Edit email" />}
          />
          <Divider />

          <Row
            label="Timezone"
            description={
              <Stack direction="row" spacing={0.5} alignItems="center">
                <PublicOutlinedIcon sx={{ fontSize: 14 }} />
                <span>{tzLabel}</span>
              </Stack>
            }
            control={
              <Button
                variant="text"
                size="small"
                onClick={() => dispatch(setOpenTimezone(true))}
                endIcon={<ChevronRightIcon sx={{ fontSize: 18 }} />}
                sx={{
                  textTransform: "none", fontWeight: 600, px: 1,
                  color: "primary.main",
                  "& .MuiButton-endIcon": { ml: 0 },
                }}
              >
                Change
              </Button>
            }
          />
        </SectionCard>

        {/* ═══ Appearance ════════════════════════════════════════════════ */}
        <SectionTitle>Appearance</SectionTitle>
        <SectionCard>
          <Row
            label="Theme"
            description="Choose your preferred appearance."
            control={
              <ToggleButtonGroup
                value={themeMode}
                exclusive
                onChange={(_e, val) => { if (val) dispatch(setThemeMode(val)); }}
                size="small"
                sx={{
                  "& .MuiToggleButton-root": {
                    textTransform: "none", fontWeight: 500,
                    fontSize: "0.8rem", px: 1.5, gap: 0.5,
                  },
                }}
              >
                <ToggleButton value="system">
                  <SettingsBrightnessOutlinedIcon sx={{ fontSize: 16 }} /> System
                </ToggleButton>
                <ToggleButton value="light">
                  <LightModeOutlinedIcon sx={{ fontSize: 16 }} /> Light
                </ToggleButton>
                <ToggleButton value="dark">
                  <DarkModeOutlinedIcon sx={{ fontSize: 16 }} /> Dark
                </ToggleButton>
              </ToggleButtonGroup>
            }
          />
        </SectionCard>

        {/* ═══ Communication (hidden in V1 ship scope) ═══════════════════ */}
        {!isV1Mode && (
          <>
            <SectionTitle>Communication</SectionTitle>
            <SectionCard>
              {commItems.map((item, idx) => (
                <Box key={item.key}>
                  <Row
                    label={item.label}
                    description={item.description}
                    control={
                      <Switch
                        checked={prefs[item.key]}
                        onChange={() => dispatch(togglePref(item.key))}
                      />
                    }
                  />
                  {idx < commItems.length - 1 && <Divider />}
                </Box>
              ))}
            </SectionCard>
          </>
        )}
      </Box>

      {/* ── Edit dialogs - atomic field edit with Save/Cancel ─────────── */}
      <EditFieldDialog
        open={editField === "name"}
        title="Edit full name"
        label="Full name"
        value={guruName}
        placeholder="Your full name"
        onClose={() => setEditField(null)}
        onSave={(next) => {
          dispatch(setGuruName(next));
          dispatch(pushToast({ title: "Name updated" }));
        }}
        validate={(v) => v.length < 2 ? "Please enter at least 2 characters." : null}
      />
      <EditFieldDialog
        open={editField === "email"}
        title="Edit email"
        label="Email"
        value={guruEmail}
        type="email"
        placeholder="you@greatlearning.in"
        onClose={() => setEditField(null)}
        onSave={(next) => {
          dispatch(setGuruEmail(next));
          dispatch(pushToast({ title: "Email updated" }));
        }}
        validate={(v) => {
          if (!v.includes("@") || !v.includes(".")) return "Please enter a valid email address.";
          return null;
        }}
      />
    </>
  );
}
