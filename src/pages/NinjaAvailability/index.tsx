import { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import MarkAvailabilityDialog from "./MarkAvailabilityDialog";

import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";

import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

/**
 * Pixel-static recreation of Great Learning's internal admin console screen:
 * facilitator "Aashish Chauhan" profile with the Availability tab open (Jun 2026 month grid).
 * This replicates an external tool, so its chrome and visuals are self-contained and
 * intentionally diverge from the project's own design tokens (see /marketing-dashboard
 * for the same documented exception). Static data only, no behavior.
 */

// ---- Static data ----------------------------------------------------------

const RAIL_ITEMS = [
  { label: "Programs", Icon: GroupsOutlinedIcon },
  { label: "Batches", Icon: GridViewOutlinedIcon },
  { label: "Learners", Icon: PersonOutlineIcon },
  { label: "Content", Icon: DescriptionOutlinedIcon },
  { label: "Gurus", Icon: VideocamOutlinedIcon, active: true },
  { label: "Payments", Icon: CreditCardOutlinedIcon },
  { label: "Labs", Icon: CodeOutlinedIcon },
  { label: "Administration", Icon: ShieldOutlinedIcon },
  { label: "Excelerate", Icon: WorkOutlineIcon },
  { label: "Support", Icon: HelpOutlineIcon },
  { label: "Reports", Icon: AssessmentOutlinedIcon },
  { label: "GLA", Icon: SchoolOutlinedIcon },
  { label: "Communication", Icon: ChatOutlinedIcon },
  { label: "Others", Icon: SettingsOutlinedIcon },
];

const SUB_TABS = ["Engagements", "Sessions", "Notes", "Roles", "Availability", "Contracts"];

const PERSONAL_DETAILS: Array<{ label: string; value?: string }> = [
  { label: "Industry", value: "-" },
  { label: "Domain", value: "-" },
  { label: "Work Experience", value: "18 Yrs" },
  { label: "Tech Experience", value: "4 Yrs" },
  { label: "Country", value: "-" },
  { label: "Address", value: '"500 w. state st. 2k" illinois usa 62650' },
  { label: "Pincode", value: "-" },
  { label: "Communication skills", value: "Very Good" },
  { label: "Current company", value: "POWER Engineers, Inc." },
  { label: "Current designation", value: "A.I. / M.L. Engineer / Developer" },
  { label: "Demo guru", value: "-" },
];

const REMUNERATIONS: Array<{ label: string; value: string }> = [
  { label: "Type of Association", value: "Part time" },
  { label: "Classroom Teaching($)", value: "-" },
  { label: "Classroom Teaching Per Day($)", value: "-" },
  { label: "Online Mentoring($)", value: "70 / Hr" },
  { label: "Project Mentoring($)", value: "-" },
  { label: "Career Mentoring($)", value: "-" },
  { label: "CV review($)", value: "-" },
  { label: "Moderation($)", value: "-" },
  { label: "Custom Remuneration", value: "-" },
  { label: "Account Number", value: "aashish.chauhan@gmail.com" },
  { label: "Bank Name", value: "PayPal" },
  { label: "Branch Name", value: "-" },
  { label: "Pan Number", value: "-" },
  { label: "Cheque in name", value: "-" },
  { label: "Ifsc vode", value: "-" },
  { label: "GSTIN", value: "-" },
  { label: "Vendor Email", value: "-" },
  { label: "Provide Own Invoice", value: "-" },
];

const SKILLS = ["Data Analytics Python", "Data Visualization:Matplotlib&Seaborn(python)"];

// Jun 2026 month grid. Week starts Sunday (May 31). null number cells never occur;
// out-of-month days are flagged via `muted`.
const WEEKS: Array<Array<{ d: number; muted?: boolean }>> = [
  [{ d: 31, muted: true }, { d: 1 }, { d: 2 }, { d: 3 }, { d: 4 }, { d: 5 }, { d: 6 }],
  [{ d: 7 }, { d: 8 }, { d: 9 }, { d: 10 }, { d: 11 }, { d: 12 }, { d: 13 }],
  [{ d: 14 }, { d: 15 }, { d: 16 }, { d: 17 }, { d: 18 }, { d: 19 }, { d: 20 }],
  [{ d: 21 }, { d: 22 }, { d: 23 }, { d: 24 }, { d: 25 }, { d: 26 }, { d: 27 }],
  [
    { d: 28 },
    { d: 29 },
    { d: 30 },
    { d: 1, muted: true },
    { d: 2, muted: true },
    { d: 3, muted: true },
    { d: 4, muted: true },
  ],
];

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ---- Style constants ------------------------------------------------------

const BLUE = "#196ae5";
const NAVY = "#1b3a73";
const BORDER = "#e2e6eb";
const TEXT = "#1f2733";
const MUTED = "#5b6573";

// Thin, minimal scrollbar (matches the slim track in the reference UI).
const THIN_SCROLL = {
  scrollbarWidth: "thin" as const,
  scrollbarColor: "#c4cad2 transparent",
  "&::-webkit-scrollbar": { width: 6, height: 6 },
  "&::-webkit-scrollbar-track": { background: "transparent" },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#c4cad2",
    borderRadius: 999,
  },
  "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#aab1bb" },
};

// ---- Sub-components --------------------------------------------------------

function DetailRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <Stack direction="row" spacing={0.75} sx={{ py: 0.45, alignItems: "flex-start" }}>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: TEXT, whiteSpace: "nowrap" }}>
        {label}:
      </Typography>
      <Typography sx={{ fontSize: 13, color: MUTED }}>{value}</Typography>
    </Stack>
  );
}

function OutlinedPill({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        border: `1px solid ${BORDER}`,
        borderRadius: 999,
        px: 1.25,
        py: 0.4,
        fontSize: 12.5,
        color: TEXT,
      }}
    >
      {children}
    </Box>
  );
}

// ---- Page -----------------------------------------------------------------

export default function NinjaAvailability() {
  const [availOpen, setAvailOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#fff", color: TEXT, overflow: "hidden" }}>
      {/* A. Left icon rail */}
      <Box
        sx={{
          width: 96,
          flexShrink: 0,
          borderRight: `1px solid ${BORDER}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 1.75,
          px: 0.25,
          gap: 1.9,
          overflowY: "auto",
          ...THIN_SCROLL,
        }}
      >
        <Box
          sx={{
            fontWeight: 800,
            fontSize: 26,
            color: BLUE,
            fontFamily: "Inter, sans-serif",
            mb: 0.75,
          }}
        >
          G
        </Box>
        {RAIL_ITEMS.map(({ label, Icon, active }) => (
          <Stack key={label} alignItems="center" spacing={0.35} sx={{ width: "100%" }}>
            <Box
              sx={{
                width: 40,
                height: 28,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: active ? "#e7f0ff" : "transparent",
              }}
            >
              <Icon sx={{ fontSize: 19, color: active ? BLUE : "#454e5a" }} />
            </Box>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: active ? 600 : 400,
                color: active ? BLUE : TEXT,
                textAlign: "center",
                lineHeight: 1.1,
              }}
            >
              {label}
            </Typography>
          </Stack>
        ))}
      </Box>

      {/* Right of rail: header + workspace */}
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* B. Top header bar */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
          spacing={1}
          sx={{ height: 56, px: 2, flexShrink: 0, bgcolor: "#fff" }}
        >
          <IconButton size="small"><BookmarkBorderOutlinedIcon sx={{ color: TEXT }} /></IconButton>
          <IconButton size="small"><HelpOutlineOutlinedIcon sx={{ color: TEXT }} /></IconButton>
          <IconButton size="small"><SyncOutlinedIcon sx={{ color: TEXT }} /></IconButton>
          <IconButton size="small"><NotificationsNoneOutlinedIcon sx={{ color: TEXT }} /></IconButton>
          <Avatar sx={{ width: 30, height: 30, bgcolor: "#19b899", fontSize: 13, fontWeight: 600 }}>
            S
          </Avatar>
        </Stack>

        {/* C. Workspace tab strip */}
        <Stack direction="row" sx={{ bgcolor: "#f4f5f7", px: 1.5, pt: 1, gap: 0.5, flexShrink: 0 }}>
          <Box
            sx={{
              px: 2,
              py: 0.9,
              fontSize: 13,
              color: MUTED,
              cursor: "default",
            }}
          >
            All Facilitators
          </Box>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              px: 2,
              py: 0.9,
              bgcolor: "#fff",
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
              border: `1px solid ${BORDER}`,
              borderBottom: "none",
              color: BLUE,
              fontSize: 13,
            }}
          >
            <span>Aashish Chauhan</span>
            <CloseIcon sx={{ fontSize: 15, color: BLUE }} />
          </Stack>
        </Stack>

        {/* D. Body: two columns */}
        <Box sx={{ flex: 1, display: "flex", minHeight: 0, borderTop: `1px solid ${BORDER}` }}>
          {/* Left column: profile + details */}
          <Box
            sx={{
              width: 404,
              flexShrink: 0,
              borderRight: `1px solid ${BORDER}`,
              overflowY: "auto",
              ...THIN_SCROLL,
            }}
          >
            {/* Blue profile header card */}
            <Box sx={{ bgcolor: NAVY, color: "#fff", p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Typography sx={{ fontSize: 20, fontWeight: 700 }}>Aashish Chauhan</Typography>
                <Button
                  startIcon={<EditOutlinedIcon sx={{ fontSize: 15 }} />}
                  sx={{
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.7)",
                    borderRadius: "4px",
                    fontSize: 12,
                    px: 1.25,
                    py: 0.3,
                    "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.08)" },
                  }}
                >
                  EDIT
                </Button>
              </Stack>
              <Typography sx={{ fontSize: 13, mt: 0.6, color: "rgba(255,255,255,0.9)" }}>
                aashish.chauhan@gmail.com · 1-7755251845
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                <Box
                  sx={{
                    bgcolor: "#f0444c",
                    color: "#fff",
                    borderRadius: 999,
                    px: 1.5,
                    py: 0.3,
                    fontSize: 12.5,
                  }}
                >
                  Part time
                </Box>
                <Box
                  sx={{
                    bgcolor: "#3aab5a",
                    color: "#fff",
                    borderRadius: 999,
                    px: 1.5,
                    py: 0.3,
                    fontSize: 12.5,
                  }}
                >
                  Active
                </Box>
              </Stack>
            </Box>

            {/* Personal Details */}
            <Box sx={{ p: 2.5 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 1.25 }}>Personal Details</Typography>
              {PERSONAL_DETAILS.map((row) => (
                <DetailRow key={row.label} label={row.label} value={row.value} />
              ))}

              <DetailRow
                label="Engagement Status"
                value={
                  <Box
                    component="span"
                    sx={{
                      display: "inline-block",
                      border: "1px solid #3aab5a",
                      color: "#2f8f4a",
                      borderRadius: 999,
                      px: 1.1,
                      py: 0.1,
                      fontSize: 12,
                    }}
                  >
                    Active
                  </Box>
                }
              />

              <Stack direction="row" spacing={1} sx={{ py: 0.45, alignItems: "center" }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Linkedin Profile:</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: BLUE, letterSpacing: 0.3 }}>
                  VIEW PROFILE
                </Typography>
                <ContentCopyOutlinedIcon sx={{ fontSize: 15, color: MUTED }} />
              </Stack>

              <Typography sx={{ fontSize: 13, fontWeight: 600, color: TEXT, mt: 1, mb: 0.6 }}>
                Primary Guru Managers:
              </Typography>
              <OutlinedPill>Monica P (monica.p2@mygreatlearning.com)</OutlinedPill>

              <Typography sx={{ fontSize: 13, fontWeight: 600, color: TEXT, mt: 1.5, mb: 0.6 }}>
                Skills:
              </Typography>
              <Stack spacing={1} alignItems="flex-start">
                {SKILLS.map((s) => (
                  <OutlinedPill key={s}>{s}</OutlinedPill>
                ))}
              </Stack>
            </Box>

            {/* Remunerations details */}
            <Box sx={{ px: 2.5, pb: 4 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 1.25 }}>
                Remunerations details(INR)
              </Typography>
              {REMUNERATIONS.map((row) => (
                <DetailRow key={row.label} label={row.label} value={row.value} />
              ))}
            </Box>
          </Box>

          {/* Right column: tabs + availability calendar */}
          <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
            {/* Sub-tabs */}
            <Stack
              direction="row"
              spacing={3}
              sx={{ px: 2.5, pt: 1.25, borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}
            >
              {SUB_TABS.map((tab) => {
                const active = tab === "Availability";
                return (
                  <Box
                    key={tab}
                    sx={{
                      pb: 1,
                      fontSize: 14,
                      color: active ? BLUE : MUTED,
                      fontWeight: active ? 600 : 400,
                      borderBottom: active ? `2px solid ${BLUE}` : "2px solid transparent",
                      cursor: "default",
                    }}
                  >
                    {tab}
                  </Box>
                );
              })}
            </Stack>

            <Box sx={{ p: 2.5, flex: 1, overflowY: "auto", ...THIN_SCROLL }}>
              {/* Heading + AVAILABILITY button */}
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Guru Availability</Typography>
                <Button
                  startIcon={<CalendarMonthOutlinedIcon sx={{ fontSize: 16 }} />}
                  onClick={() => setAvailOpen(true)}
                  sx={{
                    color: BLUE,
                    border: `1px solid ${BLUE}`,
                    borderRadius: "4px",
                    fontSize: 13,
                    fontWeight: 600,
                    px: 1.5,
                    "&:hover": { bgcolor: "#e7f0ff" },
                  }}
                >
                  AVAILABILITY
                </Button>
              </Stack>

              {/* Legend + month nav */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.75 }}>
                <Stack direction="row" spacing={2.5}>
                  <Stack direction="row" spacing={0.9} alignItems="center">
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#9c52d6" }} />
                    <Typography sx={{ fontSize: 13 }}>Career Mentor</Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.9} alignItems="center">
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#19b899" }} />
                    <Typography sx={{ fontSize: 13 }}>Course Mentor</Typography>
                  </Stack>
                </Stack>
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{ border: `1px solid ${BORDER}`, borderRadius: "4px" }}
                >
                  <IconButton size="small" sx={{ borderRadius: 0 }}>
                    <ChevronLeftIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                  <Typography sx={{ fontSize: 14, px: 1.25, minWidth: 78, textAlign: "center" }}>
                    Jun 2026
                  </Typography>
                  <IconButton size="small" sx={{ borderRadius: 0 }}>
                    <ChevronRightIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Stack>
              </Stack>

              <Typography sx={{ fontSize: 13, color: TEXT, mt: 1.75 }}>
                Note: Time slots in the calendar are in IST timezone.
              </Typography>

              {/* Month grid */}
              <Box sx={{ mt: 1.75, border: `1px solid ${BORDER}`, borderRadius: "4px", overflow: "hidden" }}>
                {/* DOW header */}
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", bgcolor: "#f4f5f7" }}>
                  {DOW.map((d) => (
                    <Box
                      key={d}
                      sx={{
                        py: 1.25,
                        textAlign: "center",
                        fontSize: 13,
                        color: TEXT,
                        borderRight: `1px solid ${BORDER}`,
                        "&:last-of-type": { borderRight: "none" },
                      }}
                    >
                      {d}
                    </Box>
                  ))}
                </Box>
                {/* Week rows */}
                {WEEKS.map((week, wi) => (
                  <Box
                    key={wi}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      borderTop: `1px solid ${BORDER}`,
                    }}
                  >
                    {week.map((cell, ci) => (
                      <Box
                        key={ci}
                        sx={{
                          height: 118,
                          p: 0.9,
                          borderRight: `1px solid ${BORDER}`,
                          "&:last-of-type": { borderRight: "none" },
                          bgcolor: cell.muted ? "#fafbfc" : "#fff",
                        }}
                      >
                        <Typography sx={{ fontSize: 13, color: cell.muted ? "#9aa3af" : TEXT }}>
                          {cell.d}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <MarkAvailabilityDialog
        open={availOpen}
        onClose={() => setAvailOpen(false)}
        guruName="Aashish Chauhan"
        onSaved={(msg) => setToast(msg)}
      />

      <Snackbar
        open={!!toast}
        autoHideDuration={3500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast(null)}
          severity="success"
          variant="filled"
          sx={{ borderRadius: "4px" }}
        >
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}
