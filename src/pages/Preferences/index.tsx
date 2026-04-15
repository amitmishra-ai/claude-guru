import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import SettingsBrightnessOutlinedIcon from "@mui/icons-material/SettingsBrightnessOutlined";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import CheckIcon from "@mui/icons-material/Check";
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

function SectionTitle({ id, children, first = false }: { id?: string; children: React.ReactNode; first?: boolean }) {
  return (
    <Typography
      id={id}
      variant="overline"
      sx={{
        display: "block",
        // First section on the page: tight on mobile (no PageHeader above),
        // normal on desktop. Subsequent sections: consistent rhythm.
        mt: first ? { xs: 0, sm: 3 } : 3,
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
      {/* Desktop title - mobile uses MobilePageHeader, no need to repeat */}
      <Box sx={{ display: { xs: "none", sm: "block" } }}>
        <PageHeader title="Settings" subtitle="Manage your profile, appearance, notifications, and communication preferences." />
      </Box>

      {/* No extra max-width wrapper - AppLayout already constrains content to
          72rem, so Settings inherits the same page grid as every other page.
          Negative top margin on mobile absorbs the stacked gap from
          AppLayout's gap:3 + MobilePageHeader's mb so Profile sits close to
          the top app bar. Desktop unaffected. */}
      <Box sx={{ pb: 4, mt: { xs: -2.5, sm: 0 } }}>

        {/* ═══ Profile ═══════════════════════════════════════════════════ */}
        <SectionTitle id="profile" first>Profile</SectionTitle>
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
          {/* Visual radio cards with mini app-chrome previews. On mobile:
              full-width below the label. On desktop: smaller, right-aligned
              next to the label (Row pattern, like the rest of Settings).
              Thumbnails mirror the dashboard's actual layout (top bar +
              sidebar + main content card + accent CTA) so users see a real
              preview of the theme they're picking. Inspired by Linear
              settings, Notion appearance picker, macOS System Settings.
              Selected state: 2px primary border + soft glow + check badge. */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
            spacing={{ xs: 1.5, sm: 2 }}
            sx={{ p: { xs: 2, sm: 2 } }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.35 }}>
                Theme
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.25, lineHeight: 1.4 }}>
                Choose your preferred appearance.
              </Typography>
            </Box>
            <Box sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: { xs: 1.25, sm: 1 },
              flexShrink: 0,
              // Mobile: span full width below the label.
              // Desktop: compact right-aligned, ~280px total.
              width: { xs: "100%", sm: 300 },
            }}>
              {([
                {
                  value: "light" as const,
                  label: "Light",
                  icon: <LightModeOutlinedIcon sx={{ fontSize: 14 }} />,
                  palette: {
                    bg: "#f8fafc",
                    sidebar: "#ffffff",
                    surface: "#ffffff",
                    border: "#e5e7eb",
                    text: "#1f2937",
                    textDim: "#9ca3af",
                    accent: "#196ae5",
                    accentSoft: "#dbeafe",
                  },
                },
                {
                  value: "dark" as const,
                  label: "Dark",
                  icon: <DarkModeOutlinedIcon sx={{ fontSize: 14 }} />,
                  palette: {
                    bg: "#0f172a",
                    sidebar: "#1e293b",
                    surface: "#1e293b",
                    border: "#334155",
                    text: "#f1f5f9",
                    textDim: "#64748b",
                    accent: "#60a5fa",
                    accentSoft: "#1e3a8a",
                  },
                },
              ]).map(({ value, label, icon, palette }) => {
                const selected = themeMode === value;
                /* Mini app-chrome preview: top bar + sidebar + main content. */
                const Chrome = (p: typeof palette) => (
                  <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", bgcolor: p.bg }}>
                    {/* Top bar */}
                    <Box sx={{ height: "16%", bgcolor: p.surface, borderBottom: "1px solid", borderColor: p.border, display: "flex", alignItems: "center", px: 0.5, gap: 0.4 }}>
                      <Box sx={{ width: 10, height: 2, borderRadius: 0.5, bgcolor: p.text, opacity: 0.85 }} />
                      <Box sx={{ flex: 1 }} />
                      <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: p.accent }} />
                    </Box>
                    {/* Body: sidebar + main */}
                    <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
                      {/* Sidebar with nav dots */}
                      <Box sx={{ width: "22%", bgcolor: p.sidebar, borderRight: "1px solid", borderColor: p.border, display: "flex", flexDirection: "column", alignItems: "center", pt: 0.5, gap: 0.4 }}>
                        <Box sx={{ width: 5, height: 5, borderRadius: 0.6, bgcolor: p.accent }} />
                        <Box sx={{ width: 5, height: 5, borderRadius: 0.6, bgcolor: p.textDim, opacity: 0.6 }} />
                        <Box sx={{ width: 5, height: 5, borderRadius: 0.6, bgcolor: p.textDim, opacity: 0.6 }} />
                        <Box sx={{ width: 5, height: 5, borderRadius: 0.6, bgcolor: p.textDim, opacity: 0.6 }} />
                      </Box>
                      {/* Main content: card with header + lines + accent CTA */}
                      <Box sx={{ flex: 1, p: 0.5, display: "flex", flexDirection: "column", gap: 0.35 }}>
                        <Box sx={{
                          flex: 1, bgcolor: p.surface, borderRadius: 0.75, border: "1px solid", borderColor: p.border,
                          p: 0.4, display: "flex", flexDirection: "column", justifyContent: "space-between",
                        }}>
                          <Box>
                            <Box sx={{ height: 3, width: "55%", borderRadius: 0.5, bgcolor: p.text, opacity: 0.9, mb: 0.4 }} />
                            <Box sx={{ height: 2, width: "80%", borderRadius: 0.5, bgcolor: p.textDim, mb: 0.25 }} />
                            <Box sx={{ height: 2, width: "65%", borderRadius: 0.5, bgcolor: p.textDim }} />
                          </Box>
                          {/* Accent button + soft chip row */}
                          <Box sx={{ display: "flex", gap: 0.3, alignItems: "center" }}>
                            <Box sx={{ width: 14, height: 4, borderRadius: 0.6, bgcolor: p.accent }} />
                            <Box sx={{ width: 8, height: 4, borderRadius: 0.6, bgcolor: p.accentSoft }} />
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
                return (
                  <Box
                    key={value}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selected}
                    aria-label={`${label} theme`}
                    onClick={() => dispatch(setThemeMode(value))}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); dispatch(setThemeMode(value)); } }}
                    sx={{
                      position: "relative",
                      cursor: "pointer",
                      borderRadius: "12px",
                      border: "2px solid",
                      borderColor: selected ? "primary.main" : "divider",
                      bgcolor: selected ? "action.selected" : "transparent",
                      p: 0.875,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0.75,
                      transition: "border-color 0.18s ease, background-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease",
                      boxShadow: selected ? "0 4px 12px -4px rgba(25,106,229,0.35)" : "none",
                      "&:hover": { borderColor: selected ? "primary.main" : "text.disabled" },
                      "&:active": { transform: "scale(0.98)" },
                      "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 },
                    }}
                  >
                    {/* Selected check badge - top-right corner */}
                    {selected && (
                      <Box sx={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      }}>
                        <CheckIcon sx={{ fontSize: 13 }} />
                      </Box>
                    )}
                    <Box
                      sx={{
                        width: "100%",
                        aspectRatio: "16 / 10",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "1px solid",
                        borderColor: palette.border,
                        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.02)",
                      }}
                    >
                      <Chrome {...palette} />
                    </Box>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: selected ? "primary.main" : "text.primary" }}>
                      {icon}
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: selected ? 700 : 500 }}>
                        {label}
                      </Typography>
                    </Stack>
                  </Box>
                );
              })}
              {/* System: render half-light + half-dark mini chromes side by side
                  so users see exactly what "follows system" produces. */}
              {(() => {
                const value = "system" as const;
                const selected = themeMode === value;
                const lightPalette = { bg: "#f8fafc", sidebar: "#ffffff", surface: "#ffffff", border: "#e5e7eb", text: "#1f2937", textDim: "#9ca3af", accent: "#196ae5", accentSoft: "#dbeafe" };
                const darkPalette = { bg: "#0f172a", sidebar: "#1e293b", surface: "#1e293b", border: "#334155", text: "#f1f5f9", textDim: "#64748b", accent: "#60a5fa", accentSoft: "#1e3a8a" };
                const HalfChrome = (p: typeof lightPalette) => (
                  <Box sx={{ width: "100%", height: "100%", bgcolor: p.bg, display: "flex", flexDirection: "column" }}>
                    <Box sx={{ height: "16%", bgcolor: p.surface, borderBottom: "1px solid", borderColor: p.border, display: "flex", alignItems: "center", px: 0.4, gap: 0.3 }}>
                      <Box sx={{ width: 6, height: 2, borderRadius: 0.5, bgcolor: p.text, opacity: 0.85 }} />
                    </Box>
                    <Box sx={{ flex: 1, p: 0.4, display: "flex", flexDirection: "column", gap: 0.3 }}>
                      <Box sx={{ height: 2, width: "70%", borderRadius: 0.5, bgcolor: p.text, opacity: 0.85 }} />
                      <Box sx={{ height: 2, width: "85%", borderRadius: 0.5, bgcolor: p.textDim }} />
                      <Box sx={{ height: 2, width: "55%", borderRadius: 0.5, bgcolor: p.textDim }} />
                      <Box sx={{ mt: "auto", width: 14, height: 4, borderRadius: 0.6, bgcolor: p.accent }} />
                    </Box>
                  </Box>
                );
                return (
                  <Box
                    key={value}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selected}
                    aria-label="System theme"
                    onClick={() => dispatch(setThemeMode(value))}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); dispatch(setThemeMode(value)); } }}
                    sx={{
                      position: "relative",
                      cursor: "pointer",
                      borderRadius: "12px",
                      border: "2px solid",
                      borderColor: selected ? "primary.main" : "divider",
                      bgcolor: selected ? "action.selected" : "transparent",
                      p: 0.875,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0.75,
                      transition: "border-color 0.18s ease, background-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease",
                      boxShadow: selected ? "0 4px 12px -4px rgba(25,106,229,0.35)" : "none",
                      "&:hover": { borderColor: selected ? "primary.main" : "text.disabled" },
                      "&:active": { transform: "scale(0.98)" },
                      "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 },
                    }}
                  >
                    {selected && (
                      <Box sx={{
                        position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%",
                        bgcolor: "primary.main", color: "primary.contrastText",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      }}>
                        <CheckIcon sx={{ fontSize: 13 }} />
                      </Box>
                    )}
                    <Box
                      sx={{
                        width: "100%",
                        aspectRatio: "16 / 10",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "1px solid",
                        borderColor: lightPalette.border,
                        display: "flex",
                        position: "relative",
                      }}
                    >
                      {/* Two halves - light on left, dark on right, with subtle
                          divider line down the middle */}
                      <Box sx={{ width: "50%", height: "100%" }}>
                        <HalfChrome {...lightPalette} />
                      </Box>
                      <Box sx={{ width: "50%", height: "100%" }}>
                        <HalfChrome {...darkPalette} />
                      </Box>
                      <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none", borderLeft: "0.5px solid rgba(255,255,255,0.15)", left: "50%", width: 1 }} />
                    </Box>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: selected ? "primary.main" : "text.primary" }}>
                      <SettingsBrightnessOutlinedIcon sx={{ fontSize: 14 }} />
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: selected ? 700 : 500 }}>
                        System
                      </Typography>
                    </Stack>
                  </Box>
                );
              })()}
            </Box>
          </Stack>
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
