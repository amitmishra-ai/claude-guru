import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import DoNotDisturbOnOutlinedIcon from "@mui/icons-material/DoNotDisturbOnOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import { SessionCard, STATUS_SCHEDULED, STATUS_CONFIRMED, STATUS_DECLINED, STATUS_SUMMARY_NEEDED, STATUS_SUMMARY_SUBMITTED } from "@/components/shared/SessionCard";
import { minutes, fmtDateNice } from "@/lib/helpers";
import { useAppSelector } from "@/store";
import type { GuruRole } from "@/store/slices/devPanelSlice";

/* ══════════════════════════════════════════════════════════════════════════
   CHIP PRESETS
   ══════════════════════════════════════════════════════════════════════════ */

const chipSx = {
  gathering: {
    fontWeight: 500,
    fontSize: "0.75rem",
    flexShrink: 0,
  } as const,
  noFeedback: {
    fontWeight: 500,
    fontSize: "0.75rem",
    flexShrink: 0,
    opacity: 0.7,
  } as const,
  paymentPending: {
    bgcolor: "var(--gl-status-pending-bg)",
    color: "var(--gl-status-pending-text)",
    border: "1px solid var(--gl-status-pending-border)",
    fontWeight: 500,
    fontSize: "0.75rem",
    flexShrink: 0,
  } as const,
  paymentProcessed: {
    bgcolor: "var(--gl-status-confirmed-bg)",
    color: "var(--gl-status-confirmed-text)",
    border: "1px solid var(--gl-status-confirmed-border)",
    fontWeight: 500,
    fontSize: "0.75rem",
    flexShrink: 0,
  } as const,
  confirmed: {
    bgcolor: "var(--gl-status-confirmed-bg)",
    color: "var(--gl-status-confirmed-text)",
    border: "1px solid var(--gl-status-confirmed-border)",
    fontWeight: 500,
    fontSize: "0.75rem",
    flexShrink: 0,
  } as const,
  scheduled: {
    bgcolor: "var(--gl-status-pending-bg)",
    color: "var(--gl-status-pending-text)",
    border: "1px solid var(--gl-status-pending-border)",
    fontWeight: 500,
    fontSize: "0.75rem",
    flexShrink: 0,
  } as const,
  toBeConfirmed: {
    bgcolor: "var(--gl-status-pending-bg)",
    color: "var(--gl-status-pending-text)",
    border: "1px solid var(--gl-status-pending-border)",
    fontWeight: 500,
    fontSize: "0.75rem",
    flexShrink: 0,
  } as const,
  combined: {
    fontWeight: 500,
    fontSize: "0.7rem",
  } as const,
};

const CHIP_GATHERING = <Chip label="Gathering feedback" size="small" variant="outlined" sx={chipSx.gathering} />;
const CHIP_NO_FEEDBACK = <Chip label="No feedback collected" size="small" variant="outlined" sx={chipSx.noFeedback} />;
const CHIP_PAYMENT_PENDING = <Chip label="Payment pending" size="small" sx={chipSx.paymentPending} />;
const CHIP_PAYMENT_PROCESSED = <Chip label="Payment processed" size="small" sx={chipSx.paymentProcessed} />;
const CHIP_CONFIRMED = <Chip label="Confirmed" size="small" sx={chipSx.confirmed} />;
const CHIP_SCHEDULED = <Chip label="Scheduled" size="small" sx={chipSx.scheduled} />;
const CHIP_TO_BE_CONFIRMED = <Chip label="To be confirmed" size="small" sx={chipSx.toBeConfirmed} />;
const CHIP_COMBINED = <Chip label="Combined event" size="small" variant="outlined" sx={chipSx.combined} />;
const CHIP_ALREADY_SUBMITTED = <Chip label="Already submitted" size="small" sx={chipSx.confirmed} />;

/* ── Section wrapper ── */

function ComponentSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.25 }}>{title}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: "block" }}>{description}</Typography>
      {children}
    </Box>
  );
}

/* ── Star rating row (numeric + stars) for Residency & Online Session ── */

function StarRatingNumeric({ rating }: { rating: number }) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
      <StarOutlinedIcon sx={{ fontSize: 14, color: "var(--gl-star-color)" }} />
      <Typography variant="subtitle2" fontWeight={600}>{rating.toFixed(1)}</Typography>
    </Stack>
  );
}

/* ── Star rating row (icons only, no numeric) for Evaluation & Moderation ── */

function StarRatingIcons({ rating }: { rating: number }) {
  return (
    <Stack direction="row" spacing={0.25} alignItems="center">
      {[1, 2, 3, 4, 5].map((i) => (
        <StarOutlinedIcon
          key={i}
          sx={{ fontSize: 14, color: i <= Math.round(rating) ? "var(--gl-star-color)" : "action.disabled" }}
        />
      ))}
    </Stack>
  );
}

/* ── Planned Event Card (Tentative) ── */

function PlannedEventCard({ sessionType, title, batch, startDateYmd, endDateYmd, contactEmail, program, onViewDetails }: {
  sessionType: string; title: string; batch: string; startDateYmd: string; endDateYmd: string;
  contactEmail?: string; program?: string; onViewDetails?: () => void;
}) {
  return (
    <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem", minWidth: 0 }}>
          {sessionType}: {title}
        </Typography>
        {CHIP_TO_BE_CONFIRMED}
      </Stack>
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary" }}>
        <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
        <Typography variant="caption" color="text.secondary">
          {fmtDateNice(startDateYmd)} &ndash; {fmtDateNice(endDateYmd)} &bull; {batch}
        </Typography>
      </Stack>
      {onViewDetails && (
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
          <Button variant="text" size="small" onClick={onViewDetails}>View details</Button>
        </Stack>
      )}
    </Card>
  );
}

/* ── Shared building blocks for View Details dialogs ── */

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 1.25 }}>
      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, minWidth: 120 }}>{label}</Typography>
      <Box sx={{ textAlign: "right" }}>
        <Typography variant="body2" fontWeight={500} component="div">{children}</Typography>
      </Box>
    </Stack>
  );
}

function SectionBox({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ borderRadius: "16px", border: 1, borderColor: "divider", backgroundColor: "hsl(var(--md-surface))", p: 2 }}>
      {children}
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   VIEW DETAILS DIALOGS
   ══════════════════════════════════════════════════════════════════════════ */

/* ── Planned Event View Details Dialog ── */

function PlannedEventDetailDialog({ open, onClose, sessionType, title, batch, program, contactEmail, startDateYmd, endDateYmd }: {
  open: boolean;
  onClose: () => void;
  sessionType: string;
  title: string;
  batch: string;
  program: string;
  contactEmail: string;
  startDateYmd: string;
  endDateYmd: string;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { p: 0, maxHeight: "85vh", overflow: "hidden" } }}>
      <Box sx={{ display: "flex", flexDirection: "column", maxHeight: "85vh" }}>
        <DialogTitle sx={{ position: "sticky", top: 0, zIndex: 10, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Event details
          <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}><CloseOutlinedIcon sx={{ fontSize: 18 }} /></IconButton>
        </DialogTitle>

        <DialogContent className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto", px: 3, py: 2 }}>
          <Stack spacing={2.5}>
            {/* Header: chips + title */}
            <Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1, mb: 1.5 }}>
                <Chip label="To be confirmed" size="small" sx={{ bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)", fontWeight: 600 }} />
                <Chip label={program} size="small" />
                <Chip label={sessionType} size="small" />
              </Stack>
              <Typography variant="h6" fontWeight={600}>{title}</Typography>
            </Box>

            {/* Schedule section */}
            <SectionBox>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Schedule</Typography>
              <Divider sx={{ mb: 0.5 }} />
              <InfoRow label="Date range">
                <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} />
                  <span>{fmtDateNice(startDateYmd)} &ndash; {fmtDateNice(endDateYmd)}</span>
                </Stack>
              </InfoRow>
              <InfoRow label="Time">
                <Typography variant="body2" color="var(--gl-status-pending-text)" fontWeight={500}>To be confirmed</Typography>
              </InfoRow>
            </SectionBox>

            {/* Details section */}
            <SectionBox>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Details</Typography>
              <Divider sx={{ mb: 0.5 }} />
              <InfoRow label="Batch">{batch}</InfoRow>
              <InfoRow label="Program">{program}</InfoRow>
              <InfoRow label="Contact">
                <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                  <MailOutlineIcon sx={{ fontSize: 13 }} />
                  <span>{contactEmail}</span>
                </Stack>
              </InfoRow>
            </SectionBox>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ position: "sticky", bottom: 0, zIndex: 10, borderTop: 1, borderColor: "divider", bgcolor: "background.paper", px: 3, py: 2, justifyContent: "space-between" }}>
          <Button variant="text" color="inherit" onClick={onClose}>Close</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

/* ── Residency View Details Dialog ── */

type ResidencyDialogVariant = "confirmed" | "combined" | "scheduled" | "tentative" | "gathering" | "completed";

function ResidencyDetailDialog({ open, onClose, variant }: { open: boolean; onClose: () => void; variant: ResidencyDialogVariant }) {
  const isTentative = variant === "tentative";
  const isScheduled = variant === "scheduled";
  const isCompleted = variant === "completed";
  const isGathering = variant === "gathering";

  const statusChip = isCompleted ? (
    <Chip label="Completed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }} />
  ) : isGathering ? (
    <Chip label="Completed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }} />
  ) : isScheduled || isTentative ? (
    <Chip label="Scheduled" size="small" sx={{ bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)", fontWeight: 600 }} />
  ) : (
    <Chip label="Confirmed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }} />
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { p: 0, maxHeight: "85vh", overflow: "hidden" } }}>
      <Box sx={{ display: "flex", flexDirection: "column", maxHeight: "85vh" }}>
        <DialogTitle sx={{ position: "sticky", top: 0, zIndex: 10, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Event details
          <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}><CloseOutlinedIcon sx={{ fontSize: 18 }} /></IconButton>
        </DialogTitle>

        <DialogContent className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto", px: 3, py: 2 }}>
          <Stack spacing={2.5}>
            {/* Header: chips + title */}
            <Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1, mb: 1.5 }}>
                {statusChip}
                <Chip label="PGP-AIML" size="small" />
                <Chip label="Residency" size="small" />
              </Stack>
              <Typography variant="h6" fontWeight={600}>Program Overview (All)</Typography>
            </Box>

            {/* Schedule section */}
            <SectionBox>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Schedule</Typography>
              <Divider sx={{ mb: 0.5 }} />
              <InfoRow label="Date">
                <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} />
                  <span>20 &ndash; 22 Mar, 2026</span>
                </Stack>
              </InfoRow>
              <InfoRow label="Location">
                <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                  <LocationOnOutlinedIcon sx={{ fontSize: 13 }} />
                  <span>Bangalore</span>
                </Stack>
                <Typography variant="caption" component="a" href="#" sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                  View on map <OpenInNewOutlinedIcon sx={{ fontSize: 10, verticalAlign: "middle" }} />
                </Typography>
              </InfoRow>
            </SectionBox>

            {/* Details section */}
            <SectionBox>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Details</Typography>
              <Divider sx={{ mb: 0.5 }} />
              <InfoRow label={isTentative ? "Planner" : "PM contact"}>
                <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                  <MailOutlineIcon sx={{ fontSize: 13 }} />
                  <span>{isTentative ? "planner@greatlearning.in" : "pm.contact@greatlearning.in"}</span>
                </Stack>
              </InfoRow>
              <InfoRow label="Batch">AIML Online March 26 A</InfoRow>
            </SectionBox>

            {/* Day-wise slots section */}
            <SectionBox>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Day-wise slots</Typography>
              <Divider sx={{ mb: 0.5 }} />
              {isTentative ? (
                <Typography variant="body2" color="var(--gl-status-pending-text)" fontWeight={500} sx={{ py: 1 }}>To be confirmed</Typography>
              ) : (
                <>
                  {[
                    { day: "Day 1 — Fri, Mar 20", time: "09:00 AM – 05:00 PM" },
                    { day: "Day 2 — Sat, Mar 21", time: "09:00 AM – 01:00 PM" },
                    { day: "Day 3 — Sun, Mar 22", time: "10:00 AM – 02:00 PM" },
                  ].map((slot) => (
                    <InfoRow key={slot.day} label={slot.day}>{slot.time}</InfoRow>
                  ))}
                </>
              )}
            </SectionBox>

            {/* Combined event section */}
            {variant === "combined" && (
              <SectionBox>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
                  <Chip label="Combined event" size="small" variant="outlined" sx={{ fontWeight: 500, fontSize: "0.7rem" }} />
                  <Typography variant="subtitle2" fontWeight={600}>Deep Learning Fundamentals</Typography>
                </Stack>
                <Divider sx={{ mb: 0.5 }} />
                <InfoRow label="Batch">AIML Online Feb 26 B</InfoRow>
                <InfoRow label="Contact">
                  <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                    <MailOutlineIcon sx={{ fontSize: 13 }} />
                    <span>ravi.kumar@greatlearning.in</span>
                  </Stack>
                </InfoRow>
                {[
                  { day: "Day 1 — Fri, Mar 20", time: "09:00 AM – 05:00 PM" },
                  { day: "Day 2 — Sat, Mar 21", time: "09:00 AM – 01:00 PM" },
                ].map((slot) => (
                  <InfoRow key={slot.day} label={slot.day}>{slot.time}</InfoRow>
                ))}
              </SectionBox>
            )}

            {/* Remuneration section */}
            {isCompleted && (
              <SectionBox>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
                  <SavingsOutlinedIcon sx={{ fontSize: 16, color: "var(--gl-status-confirmed-text)" }} />
                  <Typography variant="subtitle2" fontWeight={600}>Remuneration</Typography>
                </Stack>
                <Divider sx={{ mb: 0.5 }} />
                <InfoRow label="Status">
                  <Chip label="Payment Processed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }} />
                </InfoRow>
                <InfoRow label="Transaction ID">
                  <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>TXN-GL-8F3K2Q</Typography>
                </InfoRow>
              </SectionBox>
            )}

            {isGathering && (
              <SectionBox>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
                  <SavingsOutlinedIcon sx={{ fontSize: 16, color: "var(--gl-status-pending-text)" }} />
                  <Typography variant="subtitle2" fontWeight={600}>Remuneration</Typography>
                </Stack>
                <Divider sx={{ mb: 0.5 }} />
                <InfoRow label="Status">
                  <Chip label="Payment Pending" size="small" sx={{ bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)", fontWeight: 600 }} />
                </InfoRow>
              </SectionBox>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ position: "sticky", bottom: 0, zIndex: 10, borderTop: 1, borderColor: "divider", bgcolor: "background.paper", px: 3, py: 2, justifyContent: "space-between" }}>
          <Button variant="text" color="inherit" onClick={onClose}>Close</Button>
          {isScheduled && (
            <Stack direction="row" spacing={1}>
              <Button variant="soft" size="small" startIcon={<DoNotDisturbOnOutlinedIcon sx={{ fontSize: 16 }} />}>I&apos;m unavailable</Button>
              <Button variant="contained" size="small" startIcon={<TaskAltOutlinedIcon sx={{ fontSize: 16 }} />}>Confirm</Button>
            </Stack>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
}

/* ── Online Event View Details Dialog (unified) ── */

type OnlineEventDialogVariant =
  | "mentoring-confirmed" | "mentoring-combined" | "mentoring-scheduled" | "mentoring-tentative"
  | "mentoring-gathering" | "mentoring-noFeedback" | "mentoring-completed"
  | "career-confirmed" | "career-scheduled" | "career-gathering" | "career-completed"
  | "mock-confirmed" | "mock-gathering" | "mock-completed";

function OnlineEventDetailDialog({ open, onClose, variant }: { open: boolean; onClose: () => void; variant: OnlineEventDialogVariant }) {
  const category = variant.split("-")[0] as "mentoring" | "career" | "mock";
  const subType = variant.split("-").slice(1).join("-");

  const isMentoring = category === "mentoring";
  const isCareer = category === "career";
  const isMock = category === "mock";

  const sessionTypeLabel = isMentoring ? "Online session" : isCareer ? "Career mentoring session" : "Mock Interview";
  const programLabel = isMentoring ? "PGP-DS" : "PGP-AIML";
  const title = isMentoring
    ? "M5 W2 | Hypothesis Testing"
    : isCareer
      ? "Resume Review & Interview Prep"
      : "Technical Round — Data Structures";

  const isCompletedState = subType === "completed" || subType === "gathering" || subType === "noFeedback";
  const isScheduledState = subType === "scheduled";
  const isConfirmedState = subType === "confirmed" || subType === "combined";

  const statusChip = isCompletedState ? (
    <Chip label="Completed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }} />
  ) : isScheduledState || subType === "tentative" ? (
    <Chip label="Scheduled" size="small" sx={{ bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)", fontWeight: 600 }} />
  ) : (
    <Chip label="Confirmed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }} />
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { p: 0, maxHeight: "85vh", overflow: "hidden" } }}>
      <Box sx={{ display: "flex", flexDirection: "column", maxHeight: "85vh" }}>
        <DialogTitle sx={{ position: "sticky", top: 0, zIndex: 10, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Event details
          <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}><CloseOutlinedIcon sx={{ fontSize: 18 }} /></IconButton>
        </DialogTitle>

        <DialogContent className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto", px: 3, py: 2 }}>
          <Stack spacing={2.5}>
            {/* Header: chips + title */}
            <Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1, mb: 1.5 }}>
                {statusChip}
                <Chip label={programLabel} size="small" />
                <Chip label={sessionTypeLabel} size="small" />
              </Stack>
              <Typography variant="h6" fontWeight={600}>{title}</Typography>
            </Box>

            {/* Schedule section */}
            <SectionBox>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Schedule</Typography>
              <Divider sx={{ mb: 0.5 }} />
              <InfoRow label="Date">
                <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} />
                  <span>18 Mar, 2026</span>
                </Stack>
              </InfoRow>
              <InfoRow label="Time">
                <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                  <AccessTimeOutlinedIcon sx={{ fontSize: 13 }} />
                  <span>06:00 PM &ndash; 08:00 PM</span>
                </Stack>
              </InfoRow>
              <InfoRow label="Duration">2 hours</InfoRow>
            </SectionBox>

            {/* Details section */}
            <SectionBox>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Details</Typography>
              <Divider sx={{ mb: 0.5 }} />
              <InfoRow label="Contact">
                <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                  <MailOutlineIcon sx={{ fontSize: 13 }} />
                  <span>gurus_support@greatlearning.in</span>
                </Stack>
              </InfoRow>
              {isMentoring && (
                <>
                  <InfoRow label="Group">
                    <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                      <GroupOutlinedIcon sx={{ fontSize: 13 }} />
                      <span>Group 07 (High work, mixed prog)</span>
                    </Stack>
                  </InfoRow>
                  <InfoRow label="Course LMS">
                    <Typography variant="body2" component="a" href="#" sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" }, fontWeight: 500 }}>
                      Open in LMS <OpenInNewOutlinedIcon sx={{ fontSize: 10, verticalAlign: "middle" }} />
                    </Typography>
                  </InfoRow>
                </>
              )}
              {!isMentoring && (
                <InfoRow label="Batch">{isMentoring ? "PGPDS.O.MAR26.A" : "PGP-AIML-BA-UTA-Nov25-C"}</InfoRow>
              )}
            </SectionBox>

            {/* Combined batches section (mentoring combined) */}
            {isMentoring && subType === "combined" && (
              <SectionBox>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Combined event</Typography>
                <Divider sx={{ mb: 0.5 }} />
                <InfoRow label="Participants">48 students (combined)</InfoRow>
                <InfoRow label="Batch A">PGPDS.O.MAR26.A &mdash; Group 07</InfoRow>
                <InfoRow label="Batch B">PGPDS.O.MAR26.B &mdash; Group 03</InfoRow>
              </SectionBox>
            )}

            {/* Event materials section (mentoring confirmed) */}
            {isMentoring && isConfirmedState && (
              <SectionBox>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Event materials</Typography>
                <Divider sx={{ mb: 0.5 }} />
                <Stack spacing={0.75}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 0.75, px: 1, borderRadius: "8px", "&:hover": { bgcolor: "action.hover" }, cursor: "pointer" }}>
                    <Box sx={{ color: "text.secondary", display: "flex" }}><DescriptionOutlinedIcon sx={{ fontSize: 14 }} /></Box>
                    <Typography variant="body2">Session slides — Hypothesis Testing</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 0.75, px: 1, borderRadius: "8px", "&:hover": { bgcolor: "action.hover" }, cursor: "pointer" }}>
                    <Box sx={{ color: "text.secondary", display: "flex" }}><LinkOutlinedIcon sx={{ fontSize: 14 }} /></Box>
                    <Typography variant="body2">Pre-session reading</Typography>
                  </Stack>
                </Stack>
              </SectionBox>
            )}

            {/* Learner context section (career 1:1) */}
            {isCareer && (
              <SectionBox>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Learner context</Typography>
                <Divider sx={{ mb: 0.5 }} />
                <InfoRow label="Name">
                  <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                    <AccountCircleOutlinedIcon sx={{ fontSize: 13 }} />
                    <span>Priya Sharma</span>
                  </Stack>
                </InfoRow>
                <InfoRow label="Background">Data Analyst at TCS &bull; 3 years exp</InfoRow>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                  <Button variant="soft" size="small" startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 14 }} />}>Resume</Button>
                  <Button variant="soft" size="small" startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 14 }} />}>LinkedIn</Button>
                </Stack>
                <Box sx={{ mt: 1.5, p: 1.5, borderRadius: "12px", bgcolor: "hsl(var(--md-surface-container) / 0.3)", fontSize: "0.8125rem", color: "hsl(var(--md-on-surface-variant))" }}>
                  Review updated resume, discuss interview strategies for product companies
                </Box>
              </SectionBox>
            )}

            {/* Mock interview student info */}
            {isMock && (
              <SectionBox>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Learner context</Typography>
                <Divider sx={{ mb: 0.5 }} />
                <InfoRow label="Name">
                  <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                    <AccountCircleOutlinedIcon sx={{ fontSize: 13 }} />
                    <span>Priya Sharma</span>
                  </Stack>
                </InfoRow>
                <InfoRow label="Background">Data Analyst at TCS &bull; 3 years exp</InfoRow>
              </SectionBox>
            )}

            {/* Remuneration section */}
            {subType === "gathering" && (
              <SectionBox>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
                  <SavingsOutlinedIcon sx={{ fontSize: 16, color: "var(--gl-status-pending-text)" }} />
                  <Typography variant="subtitle2" fontWeight={600}>Remuneration</Typography>
                </Stack>
                <Divider sx={{ mb: 0.5 }} />
                <InfoRow label="Status">
                  <Chip label="Payment Pending" size="small" sx={{ bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)", fontWeight: 600 }} />
                </InfoRow>
              </SectionBox>
            )}

            {(subType === "noFeedback" || subType === "completed") && (
              <SectionBox>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
                  <SavingsOutlinedIcon sx={{ fontSize: 16, color: "var(--gl-status-confirmed-text)" }} />
                  <Typography variant="subtitle2" fontWeight={600}>Remuneration</Typography>
                </Stack>
                <Divider sx={{ mb: 0.5 }} />
                <InfoRow label="Status">
                  <Chip label="Payment Processed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }} />
                </InfoRow>
                <InfoRow label="Transaction ID">
                  <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>TXN-GL-7A2P9R</Typography>
                </InfoRow>
              </SectionBox>
            )}

            {/* Recording link */}
            {isCompletedState && (
              <SectionBox>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Recording</Typography>
                <Divider sx={{ mb: 0.5 }} />
                <InfoRow label="Session recording">
                  <Typography variant="body2" component="a" href="#" sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" }, fontWeight: 500 }}>
                    Watch recording <OpenInNewOutlinedIcon sx={{ fontSize: 10, verticalAlign: "middle" }} />
                  </Typography>
                </InfoRow>
              </SectionBox>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ position: "sticky", bottom: 0, zIndex: 10, borderTop: 1, borderColor: "divider", bgcolor: "background.paper", px: 3, py: 2, justifyContent: "space-between" }}>
          <Button variant="text" color="inherit" onClick={onClose}>Close</Button>
          <Stack direction="row" spacing={1}>
            {isMentoring && isConfirmedState && (
              <>
                <Button variant="contained" size="small" startIcon={<LinkOutlinedIcon sx={{ fontSize: 16 }} />}>Join</Button>
                <Button variant="outlined" size="small" startIcon={<PollOutlinedIcon sx={{ fontSize: 16 }} />}>Create Poll</Button>
              </>
            )}
            {isCareer && isConfirmedState && (
              <Button variant="contained" size="small" startIcon={<LinkOutlinedIcon sx={{ fontSize: 16 }} />}>Join</Button>
            )}
            {isScheduledState && (
              <>
                <Button variant="soft" size="small" startIcon={<DoNotDisturbOnOutlinedIcon sx={{ fontSize: 16 }} />}>I&apos;m unavailable</Button>
                <Button variant="contained" size="small" startIcon={<TaskAltOutlinedIcon sx={{ fontSize: 16 }} />}>Confirm</Button>
              </>
            )}
          </Stack>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

/* ── Evaluation View Details Dialog ── */

type EvalDialogVariant = "confirmed" | "tentative" | "gathering" | "completed";

function EvaluationDetailDialog({ open, onClose, variant }: { open: boolean; onClose: () => void; variant: EvalDialogVariant }) {
  const isConfirmed = variant === "confirmed";
  const isTentative = variant === "tentative";
  const isCompleted = variant === "completed";
  const isGathering = variant === "gathering";

  const statusChip = isConfirmed ? (
    <Chip label="Confirmed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }} />
  ) : isTentative ? (
    <Chip label="To be confirmed" size="small" sx={{ bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)", fontWeight: 600 }} />
  ) : (
    <Chip label="Completed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }} />
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { p: 0, maxHeight: "85vh", overflow: "hidden" } }}>
      <Box sx={{ display: "flex", flexDirection: "column", maxHeight: "85vh" }}>
        <DialogTitle sx={{ position: "sticky", top: 0, zIndex: 10, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Event details
          <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}><CloseOutlinedIcon sx={{ fontSize: 18 }} /></IconButton>
        </DialogTitle>

        <DialogContent className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto", px: 3, py: 2 }}>
          <Stack spacing={2.5}>
            {/* Header: chips + title */}
            <Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1, mb: 1.5 }}>
                {statusChip}
                <Chip label="PGP-AIML" size="small" />
                <Chip label="Evaluation" size="small" />
              </Stack>
              <Typography variant="h6" fontWeight={600}>Linear Regression Assignment</Typography>
            </Box>

            {/* Schedule section */}
            <SectionBox>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Schedule</Typography>
              <Divider sx={{ mb: 0.5 }} />
              <InfoRow label="Assessment due">
                <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} />
                  <span>{isTentative ? "1 Apr, 2026" : "15 Mar, 2026"}</span>
                </Stack>
              </InfoRow>
              <InfoRow label="Grading due">
                <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} />
                  <span>{isTentative ? "10 Apr, 2026" : "22 Mar, 2026"}</span>
                </Stack>
              </InfoRow>
            </SectionBox>

            {/* Details section */}
            <SectionBox>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Details</Typography>
              <Divider sx={{ mb: 0.5 }} />
              <InfoRow label="Assignment">
                {isConfirmed || isCompleted || isGathering ? (
                  <Typography variant="body2" component="a" href="#" sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" }, fontWeight: 500 }}>
                    Linear Regression Assignment <OpenInNewOutlinedIcon sx={{ fontSize: 10, verticalAlign: "middle" }} />
                  </Typography>
                ) : (
                  <Typography variant="body2" fontWeight={500}>Linear Regression Assignment</Typography>
                )}
              </InfoRow>
              <InfoRow label="Course template">Applied Statistics</InfoRow>
              <InfoRow label="Batch">PGP-AIML-BA-UTA-Nov25-C</InfoRow>
              <InfoRow label="Contact">
                <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                  <MailOutlineIcon sx={{ fontSize: 13 }} />
                  <span>gurus_support@greatlearning.in</span>
                </Stack>
              </InfoRow>
            </SectionBox>

            {/* Student progress (Confirmed only) */}
            {isConfirmed && (
              <SectionBox>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Student progress</Typography>
                <Divider sx={{ mb: 0.5 }} />
                <InfoRow label="Submissions">42 / 63</InfoRow>
                <InfoRow label="Graded">18 / 42</InfoRow>
              </SectionBox>
            )}

            {/* Tentative: "To be confirmed" in place of progress */}
            {isTentative && (
              <SectionBox>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Student progress</Typography>
                <Divider sx={{ mb: 0.5 }} />
                <Typography variant="body2" color="var(--gl-status-pending-text)" fontWeight={500} sx={{ py: 1 }}>To be confirmed</Typography>
              </SectionBox>
            )}

            {/* Feedback (completed variants) */}
            {isGathering && (
              <SectionBox>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Feedback</Typography>
                <Divider sx={{ mb: 0.5 }} />
                <Typography variant="body2" sx={{ py: 1 }}>Gathering feedback!</Typography>
              </SectionBox>
            )}

            {isCompleted && (
              <SectionBox>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Feedback</Typography>
                <Divider sx={{ mb: 0.5 }} />
                <InfoRow label="Rating">
                  <StarRatingIcons rating={4} />
                </InfoRow>
              </SectionBox>
            )}

            {/* Remuneration section */}
            {isGathering && (
              <SectionBox>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
                  <SavingsOutlinedIcon sx={{ fontSize: 16, color: "var(--gl-status-pending-text)" }} />
                  <Typography variant="subtitle2" fontWeight={600}>Remuneration</Typography>
                </Stack>
                <Divider sx={{ mb: 0.5 }} />
                <InfoRow label="Status">
                  <Chip label="Payment Pending" size="small" sx={{ bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)", fontWeight: 600 }} />
                </InfoRow>
              </SectionBox>
            )}

            {isCompleted && (
              <SectionBox>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
                  <SavingsOutlinedIcon sx={{ fontSize: 16, color: "var(--gl-status-confirmed-text)" }} />
                  <Typography variant="subtitle2" fontWeight={600}>Remuneration</Typography>
                </Stack>
                <Divider sx={{ mb: 0.5 }} />
                <InfoRow label="Status">
                  <Chip label="Payment Processed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }} />
                </InfoRow>
                <InfoRow label="Transaction ID">
                  <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>TXN-GL-5E1M3N</Typography>
                </InfoRow>
              </SectionBox>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ position: "sticky", bottom: 0, zIndex: 10, borderTop: 1, borderColor: "divider", bgcolor: "background.paper", px: 3, py: 2, justifyContent: "space-between" }}>
          <Button variant="text" color="inherit" onClick={onClose}>Close</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

/* ── Moderation View Details Dialog ── */

type ModDialogVariant = "confirmed" | "tentative" | "gathering" | "completed";

function ModerationDetailDialog({ open, onClose, variant }: { open: boolean; onClose: () => void; variant: ModDialogVariant }) {
  const isConfirmed = variant === "confirmed";
  const isTentative = variant === "tentative";
  const isCompleted = variant === "completed";
  const isGathering = variant === "gathering";

  const statusChip = isConfirmed ? (
    <Chip label="Confirmed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }} />
  ) : isTentative ? (
    <Chip label="To be confirmed" size="small" sx={{ bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)", fontWeight: 600 }} />
  ) : (
    <Chip label="Completed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }} />
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { p: 0, maxHeight: "85vh", overflow: "hidden" } }}>
      <Box sx={{ display: "flex", flexDirection: "column", maxHeight: "85vh" }}>
        <DialogTitle sx={{ position: "sticky", top: 0, zIndex: 10, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Event details
          <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}><CloseOutlinedIcon sx={{ fontSize: 18 }} /></IconButton>
        </DialogTitle>

        <DialogContent className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto", px: 3, py: 2 }}>
          <Stack spacing={2.5}>
            {/* Header: chips + title */}
            <Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1, mb: 1.5 }}>
                {statusChip}
                <Chip label="PGP-AIML" size="small" />
                <Chip label="Moderation" size="small" />
              </Stack>
              <Typography variant="h6" fontWeight={600}>{isTentative ? "Ethics in Machine Learning" : "Impact of AI on Healthcare"}</Typography>
            </Box>

            {/* Schedule section — 3 dates (moderation start, concluding remark, grading due) */}
            <SectionBox>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Schedule</Typography>
              <Divider sx={{ mb: 0.5 }} />
              <InfoRow label="Moderation start">
                <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} />
                  <span>{isTentative ? "5 Apr, 2026" : "15 Mar, 2026"}</span>
                </Stack>
              </InfoRow>
              <InfoRow label="Concluding remark">
                <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} />
                  <span>{isTentative ? "12 Apr, 2026" : "20 Mar, 2026"}</span>
                </Stack>
              </InfoRow>
              <InfoRow label="Grading due">
                <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} />
                  <span>{isTentative ? "15 Apr, 2026" : "22 Mar, 2026"}</span>
                </Stack>
              </InfoRow>
            </SectionBox>

            {/* Details section */}
            <SectionBox>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Details</Typography>
              <Divider sx={{ mb: 0.5 }} />
              <InfoRow label="Discussion Question">
                {isConfirmed || isCompleted || isGathering ? (
                  <Typography variant="body2" component="a" href="#" sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" }, fontWeight: 500 }}>
                    {isGathering || isCompleted ? "Impact of AI on Healthcare" : "Open in SpeedGrader"} <OpenInNewOutlinedIcon sx={{ fontSize: 10, verticalAlign: "middle" }} />
                  </Typography>
                ) : (
                  <Typography variant="body2" fontWeight={500}>{isTentative ? "Ethics in Machine Learning" : "Impact of AI on Healthcare"}</Typography>
                )}
              </InfoRow>
              <InfoRow label="Course template">Applied Ethics in AI</InfoRow>
              <InfoRow label="Batch">PGP-AIML-BA-UTA-Nov25-C</InfoRow>
              <InfoRow label="Contact">
                <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                  <MailOutlineIcon sx={{ fontSize: 13 }} />
                  <span>gurus_support@greatlearning.in</span>
                </Stack>
              </InfoRow>
            </SectionBox>

            {/* Student response progress (Confirmed only) — discussion-specific stats */}
            {isConfirmed && (
              <SectionBox>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Student response progress</Typography>
                <Divider sx={{ mb: 0.5 }} />
                <InfoRow label="Posts">
                  <Typography variant="body2" fontWeight={500} sx={{ color: "success.main" }}>87</Typography>
                </InfoRow>
                <InfoRow label="Posts unread">
                  <Typography variant="body2" fontWeight={500} sx={{ color: "success.main" }}>12</Typography>
                </InfoRow>
                <InfoRow label="Graded">
                  <Typography variant="body2" fontWeight={500} sx={{ color: "success.main" }}>54 / 63</Typography>
                </InfoRow>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>Stats shown in green (guru replied within 30 hrs). Turns red if inactive.</Typography>
              </SectionBox>
            )}

            {/* Tentative: "To be confirmed" */}
            {isTentative && (
              <SectionBox>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Student response progress</Typography>
                <Divider sx={{ mb: 0.5 }} />
                <Typography variant="body2" color="var(--gl-status-pending-text)" fontWeight={500} sx={{ py: 1 }}>To be confirmed</Typography>
              </SectionBox>
            )}

            {/* Feedback (completed variants) */}
            {isGathering && (
              <SectionBox>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Feedback</Typography>
                <Divider sx={{ mb: 0.5 }} />
                <Typography variant="body2" sx={{ py: 1 }}>Gathering feedback!</Typography>
              </SectionBox>
            )}

            {isCompleted && (
              <SectionBox>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Feedback</Typography>
                <Divider sx={{ mb: 0.5 }} />
                <InfoRow label="Rating">
                  <StarRatingIcons rating={5} />
                </InfoRow>
              </SectionBox>
            )}

            {/* Remuneration section */}
            {isGathering && (
              <SectionBox>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
                  <SavingsOutlinedIcon sx={{ fontSize: 16, color: "var(--gl-status-pending-text)" }} />
                  <Typography variant="subtitle2" fontWeight={600}>Remuneration</Typography>
                </Stack>
                <Divider sx={{ mb: 0.5 }} />
                <InfoRow label="Status">
                  <Chip label="Payment Pending" size="small" sx={{ bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)", fontWeight: 600 }} />
                </InfoRow>
              </SectionBox>
            )}

            {isCompleted && (
              <SectionBox>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
                  <SavingsOutlinedIcon sx={{ fontSize: 16, color: "var(--gl-status-confirmed-text)" }} />
                  <Typography variant="subtitle2" fontWeight={600}>Remuneration</Typography>
                </Stack>
                <Divider sx={{ mb: 0.5 }} />
                <InfoRow label="Status">
                  <Chip label="Payment Processed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }} />
                </InfoRow>
                <InfoRow label="Transaction ID">
                  <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>TXN-GL-9K4R2L</Typography>
                </InfoRow>
              </SectionBox>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ position: "sticky", bottom: 0, zIndex: 10, borderTop: 1, borderColor: "divider", bgcolor: "background.paper", px: 3, py: 2, justifyContent: "space-between" }}>
          <Button variant="text" color="inherit" onClick={onClose}>Close</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

/* ── Capstone View Details Dialog ── */

type CapstoneDialogVariant = "confirmed" | "paymentPending" | "completed";

function CapstoneDetailDialog({ open, onClose, variant }: { open: boolean; onClose: () => void; variant: CapstoneDialogVariant }) {
  const isConfirmed = variant === "confirmed";
  const isCompleted = variant === "completed";
  const isPaymentPending = variant === "paymentPending";

  const statusChip = (isCompleted || isPaymentPending) ? (
    <Chip label="Completed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }} />
  ) : (
    <Chip label="Confirmed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }} />
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { p: 0, maxHeight: "85vh", overflow: "hidden" } }}>
      <Box sx={{ display: "flex", flexDirection: "column", maxHeight: "85vh" }}>
        <DialogTitle sx={{ position: "sticky", top: 0, zIndex: 10, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Event details
          <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}><CloseOutlinedIcon sx={{ fontSize: 18 }} /></IconButton>
        </DialogTitle>

        <DialogContent className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto", px: 3, py: 2 }}>
          <Stack spacing={2.5}>
            {/* Header: chips + title */}
            <Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1, mb: 1.5 }}>
                {statusChip}
                <Chip label="PGP-DS" size="small" />
                <Chip label="Capstone" size="small" />
              </Stack>
              <Typography variant="h6" fontWeight={600}>Capstone &mdash; {(isPaymentPending || isCompleted) ? "PGPDS.O.JUL25.A" : "PGPDS.O.MAR26.A"}</Typography>
            </Box>

            {/* Schedule section */}
            <SectionBox>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Schedule</Typography>
              <Divider sx={{ mb: 0.5 }} />
              <InfoRow label="Start">
                <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} />
                  <span>15 Jan, 2026</span>
                </Stack>
              </InfoRow>
              <InfoRow label="Synopsis">5 Feb, 2026</InfoRow>
              <InfoRow label="Interim">1 Mar, 2026</InfoRow>
              <InfoRow label="Final">10 Apr, 2026</InfoRow>
              <InfoRow label="Presentation">20 Apr, 2026</InfoRow>
            </SectionBox>

            {/* Details section */}
            <SectionBox>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Details</Typography>
              <Divider sx={{ mb: 0.5 }} />
              <InfoRow label="Group">
                <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                  <GroupOutlinedIcon sx={{ fontSize: 13 }} />
                  <span>{(isPaymentPending || isCompleted) ? "Team Beta" : "Team Alpha"}</span>
                </Stack>
              </InfoRow>
              <InfoRow label="Domain">{(isPaymentPending || isCompleted) ? "Computer Vision" : "NLP"}</InfoRow>
              {isConfirmed && (
                <InfoRow label="Next session">
                  <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} />
                    <span>20 Mar, 2026</span>
                  </Stack>
                </InfoRow>
              )}
              <InfoRow label="Contact">
                <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                  <MailOutlineIcon sx={{ fontSize: 13 }} />
                  <span>gurus_support@greatlearning.in</span>
                </Stack>
              </InfoRow>
            </SectionBox>

            {/* Remuneration section */}
            {isPaymentPending && (
              <SectionBox>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
                  <SavingsOutlinedIcon sx={{ fontSize: 16, color: "var(--gl-status-pending-text)" }} />
                  <Typography variant="subtitle2" fontWeight={600}>Remuneration</Typography>
                </Stack>
                <Divider sx={{ mb: 0.5 }} />
                <InfoRow label="Status">
                  <Chip label="Payment Pending" size="small" sx={{ bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)", fontWeight: 600 }} />
                </InfoRow>
              </SectionBox>
            )}

            {isCompleted && (
              <SectionBox>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
                  <SavingsOutlinedIcon sx={{ fontSize: 16, color: "var(--gl-status-confirmed-text)" }} />
                  <Typography variant="subtitle2" fontWeight={600}>Remuneration</Typography>
                </Stack>
                <Divider sx={{ mb: 0.5 }} />
                <InfoRow label="Status">
                  <Chip label="Payment Processed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }} />
                </InfoRow>
                <InfoRow label="Transaction ID">
                  <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>TXN-GL-3C7W1P</Typography>
                </InfoRow>
              </SectionBox>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ position: "sticky", bottom: 0, zIndex: 10, borderTop: 1, borderColor: "divider", bgcolor: "background.paper", px: 3, py: 2, justifyContent: "space-between" }}>
          <Button variant="text" color="inherit" onClick={onClose}>Close</Button>
          <Stack direction="row" spacing={1}>
            <Button variant="soft" size="small" startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 16 }} />}>View Student Progress</Button>
            {isConfirmed && (
              <Button variant="outlined" size="small" startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 16 }} />}>Group Details (LMS)</Button>
            )}
          </Stack>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

/* ── CV Review View Details Dialog ── */

type CVReviewDialogVariant = "confirmed" | "confirmed-submitted" | "completed";

function CVReviewDetailDialog({ open, onClose, variant }: { open: boolean; onClose: () => void; variant: CVReviewDialogVariant }) {
  const isConfirmed = variant === "confirmed" || variant === "confirmed-submitted";
  const isSubmitted = variant === "confirmed-submitted";
  const isCompleted = variant === "completed";

  const statusChip = isCompleted ? (
    <Chip label="Completed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }} />
  ) : (
    <Chip label="Confirmed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }} />
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { p: 0, maxHeight: "85vh", overflow: "hidden" } }}>
      <Box sx={{ display: "flex", flexDirection: "column", maxHeight: "85vh" }}>
        <DialogTitle sx={{ position: "sticky", top: 0, zIndex: 10, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Event details
          <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}><CloseOutlinedIcon sx={{ fontSize: 18 }} /></IconButton>
        </DialogTitle>

        <DialogContent className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto", px: 3, py: 2 }}>
          <Stack spacing={2.5}>
            {/* Header: chips + title */}
            <Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1, mb: 1.5 }}>
                {statusChip}
                <Chip label="PGP-AIML" size="small" />
                <Chip label="CV Review" size="small" />
              </Stack>
              <Typography variant="h6" fontWeight={600}>CV Review</Typography>
            </Box>

            {/* Schedule section */}
            <SectionBox>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Schedule</Typography>
              <Divider sx={{ mb: 0.5 }} />
              <InfoRow label="Due date">
                <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} />
                  <span>{isCompleted ? "5 Mar, 2026" : "22 Mar, 2026"}</span>
                </Stack>
              </InfoRow>
              {isConfirmed && !isSubmitted && (
                <InfoRow label="Due on">22 March 2026</InfoRow>
              )}
            </SectionBox>

            {/* Details section */}
            <SectionBox>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Details</Typography>
              <Divider sx={{ mb: 0.5 }} />
              <InfoRow label="Batch">PGP-AIML-BA-UTA-Nov25-C</InfoRow>
              {isCompleted && (
                <InfoRow label="Contact">
                  <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                    <MailOutlineIcon sx={{ fontSize: 13 }} />
                    <span>gurus_support@greatlearning.in</span>
                  </Stack>
                </InfoRow>
              )}
            </SectionBox>

            {/* Links & Actions (Confirmed) */}
            {isConfirmed && (
              <SectionBox>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Links &amp; Actions</Typography>
                <Divider sx={{ mb: 0.5 }} />
                <InfoRow label="LinkedIn">
                  <Typography variant="body2" component="a" href="#" sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" }, fontWeight: 500 }}>
                    View LinkedIn Profile <OpenInNewOutlinedIcon sx={{ fontSize: 10, verticalAlign: "middle" }} />
                  </Typography>
                </InfoRow>
                <InfoRow label="CV">
                  <Typography variant="body2" component="a" href="#" sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" }, fontWeight: 500 }}>
                    View CV <OpenInNewOutlinedIcon sx={{ fontSize: 10, verticalAlign: "middle" }} />
                  </Typography>
                </InfoRow>
                <InfoRow label="Comments">
                  <Button variant="text" size="small">View User Comments</Button>
                </InfoRow>
                <Divider sx={{ my: 1 }} />
                {isSubmitted ? (
                  <Typography variant="body2" color="var(--gl-status-confirmed-text)" fontWeight={500} sx={{ py: 0.5 }}>Already Submitted</Typography>
                ) : (
                  <Button variant="contained" size="small" sx={{ mt: 0.5 }}>Submit CV Review</Button>
                )}
              </SectionBox>
            )}

            {/* Completed: View Reviewed CV */}
            {isCompleted && (
              <SectionBox>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Links</Typography>
                <Divider sx={{ mb: 0.5 }} />
                <InfoRow label="Reviewed CV">
                  <Typography variant="body2" component="a" href="#" sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" }, fontWeight: 500 }}>
                    View Reviewed CV <OpenInNewOutlinedIcon sx={{ fontSize: 10, verticalAlign: "middle" }} />
                  </Typography>
                </InfoRow>
              </SectionBox>
            )}

            {/* Remuneration (completed only) */}
            {isCompleted && (
              <SectionBox>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
                  <SavingsOutlinedIcon sx={{ fontSize: 16, color: "var(--gl-status-confirmed-text)" }} />
                  <Typography variant="subtitle2" fontWeight={600}>Remuneration</Typography>
                </Stack>
                <Divider sx={{ mb: 0.5 }} />
                <InfoRow label="Status">
                  <Chip label="Payment Processed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }} />
                </InfoRow>
                <InfoRow label="Transaction ID">
                  <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>TXN-GL-4F2R8K</Typography>
                </InfoRow>
              </SectionBox>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ position: "sticky", bottom: 0, zIndex: 10, borderTop: 1, borderColor: "divider", bgcolor: "background.paper", px: 3, py: 2, justifyContent: "space-between" }}>
          <Button variant="text" color="inherit" onClick={onClose}>Close</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ACTIVITY CARD SECTIONS
   ══════════════════════════════════════════════════════════════════════════ */

/* ── Residency Cards (custom layout, NOT SessionCard) ── */

function ResidencyCards() {
  const [detailOpen, setDetailOpen] = useState<ResidencyDialogVariant | null>(null);

  return (
    <>
      <ResidencyDetailDialog open={detailOpen !== null} onClose={() => setDetailOpen(null)} variant={detailOpen ?? "confirmed"} />

      {/* ── Confirmed ── */}
      <ComponentSection
        title="Residency — Confirmed"
        description="Primary: title, Confirmed chip, date range + batch, city. Secondary (View Details): group, course LMS link, topic, PM email, city + map, day-wise slots."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          {/* Row 1: Title + Status */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>Residency: Program Overview (All)</Typography>
            {CHIP_CONFIRMED}
          </Stack>
          {/* Row 2: Date + batch */}
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">20 – 22 Mar, 2026 &bull; AIML Online March 26 A &bull; Bangalore</Typography>
          </Stack>
          {/* Row 3: Actions */}
          <Stack direction="row" justifyContent="flex-end">
            <Button variant="text" size="small" onClick={() => setDetailOpen("confirmed")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Confirmed (Combined Session) ── */}
      <ComponentSection
        title="Residency — Confirmed (Combined event)"
        description="Multi-batch combined residency. Combined event chip on card. Combined batch details inside View Details."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>Residency: Program Overview (All)</Typography>
            <Stack direction="row" spacing={0.75}>
              {CHIP_COMBINED}
              {CHIP_CONFIRMED}
            </Stack>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">20 – 22 Mar, 2026 &bull; AIML Online March 26 A &bull; Bangalore</Typography>
          </Stack>
          <Stack direction="row" justifyContent="flex-end">
            <Button variant="text" size="small" onClick={() => setDetailOpen("combined")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Scheduled ── */}
      <ComponentSection
        title="Residency — Scheduled"
        description="Awaiting guru confirmation. Confirm/Unavailable on card, secondary info in View Details."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>Residency: Program Overview (All)</Typography>
            {CHIP_SCHEDULED}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">25 – 27 Mar, 2026 &bull; AIML Online March 26 A &bull; Bangalore</Typography>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
            <Stack direction="row" spacing={1}>
              <Button startIcon={<TaskAltOutlinedIcon sx={{ fontSize: 18 }} />} size="small" variant="contained">Confirm</Button>
              <Button startIcon={<DoNotDisturbOnOutlinedIcon sx={{ fontSize: 18 }} />} size="small" variant="soft">I&apos;m unavailable</Button>
            </Stack>
            <Button variant="text" size="small" onClick={() => setDetailOpen("scheduled")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Tentative ── */}
      <ComponentSection
        title="Residency — Tentative"
        description="Planned residency. 'To be confirmed' chip. Course plain text (no link). Planner email. All secondary in View Details."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>Residency: Program Overview (All)</Typography>
            {CHIP_TO_BE_CONFIRMED}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">10 – 14 Apr, 2026 &bull; AIML Online March 26 A &bull; Bangalore</Typography>
          </Stack>
          <Stack direction="row" justifyContent="flex-end">
            <Button variant="text" size="small" onClick={() => setDetailOpen("tentative")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Completed — Gathering feedback ── */}
      <ComponentSection
        title="Residency — Completed (Gathering feedback)"
        description="Residency done, no feedback yet. Gathering feedback chip + Payment pending chip on card."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>Residency: Program Overview (All)</Typography>
            {CHIP_GATHERING}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary" }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">5 – 7 Mar, 2026 &bull; AIML Online March 26 A</Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
            {CHIP_PAYMENT_PENDING}
          </Stack>
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.5 }}>
            <Button variant="text" size="small" onClick={() => setDetailOpen("gathering")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Completed — with rating ── */}
      <ComponentSection
        title="Residency — Completed (with feedback)"
        description="Past residency with rating. Star + score top-right. Detailed Feedback + Payment processed chip on card. Secondary in View Details."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>Residency: Program Overview (All)</Typography>
            <StarRatingNumeric rating={4.2} />
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary" }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">5 – 7 Mar, 2026 &bull; AIML Online March 26 A</Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
            {CHIP_PAYMENT_PROCESSED}
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} sx={{ mt: 1.5 }}>
            <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>Detailed Feedback</Button>
            <Button variant="text" size="small" onClick={() => setDetailOpen("completed")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>
    </>
  );
}

/* ── Online Session Cards (use SessionCard) ── */

function OnlineSessionCards() {
  const [detailOpen, setDetailOpen] = useState<OnlineEventDialogVariant | null>(null);
  const [plannedDetailOpen, setPlannedDetailOpen] = useState(false);

  return (
    <>
      <OnlineEventDetailDialog open={detailOpen !== null} onClose={() => setDetailOpen(null)} variant={detailOpen ?? "mentoring-confirmed"} />
      <PlannedEventDetailDialog
        open={plannedDetailOpen}
        onClose={() => setPlannedDetailOpen(false)}
        sessionType="Online session"
        title="Machine Learning"
        batch="PGP-AIML-BA-UTA-Nov25-C"
        program="PGP-AIML"
        contactEmail="gurus_support@greatlearning.in"
        startDateYmd="2026-01-22"
        endDateYmd="2026-02-14"
      />

      {/* 1. Mentoring — Confirmed */}
      <ComponentSection title="Mentoring — Confirmed" description="Virtual mentoring event. Join event + Event Materials on card.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Statistics for Data Science"
            sessionType="Online session"
            batch="PGPDS.O.MAR26.A"
            dateYmd="2026-03-18"
            start={minutes(18)}
            end={minutes(20)}
            status={STATUS_CONFIRMED()}
            actions={
              <>
                <Button variant="contained" size="small" startIcon={<LinkOutlinedIcon sx={{ fontSize: 16 }} />}>Join online session</Button>
                <Button variant="soft" size="small" startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}>Event Materials</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("mentoring-confirmed")}>View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* 2. Mentoring — Combined (Confirmed) */}
      <ComponentSection title="Mentoring — Combined (Confirmed)" description="Combined event across batches. Combined event chip alongside Confirmed.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Statistics for Data Science"
            sessionType="Online session"
            batch="PGPDS.O.MAR26.A"
            dateYmd="2026-03-18"
            start={minutes(18)}
            end={minutes(20)}
            status={STATUS_CONFIRMED()}
            actions={
              <>
                <Button variant="contained" size="small" startIcon={<LinkOutlinedIcon sx={{ fontSize: 16 }} />}>Join online session</Button>
                <Button variant="soft" size="small" startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}>Event Materials</Button>
              </>
            }
            chips={["Combined event"]}
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("mentoring-combined")}>View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* 3. Mentoring — Scheduled */}
      <ComponentSection title="Mentoring — Scheduled" description="Unconfirmed mentoring event awaiting guru action.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Python Fundamentals"
            sessionType="Online session"
            batch="PGPDS.O.MAR26.A"
            dateYmd="2026-03-20"
            start={minutes(9, 30)}
            end={minutes(11)}
            status={STATUS_SCHEDULED}
            actions={
              <>
                <Button startIcon={<TaskAltOutlinedIcon sx={{ fontSize: 18 }} />} size="small" variant="contained">Confirm</Button>
                <Button startIcon={<DoNotDisturbOnOutlinedIcon sx={{ fontSize: 18 }} />} size="small" variant="soft">I&apos;m unavailable</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("mentoring-scheduled")}>View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* 4. Career 1:1 — Confirmed */}
      <ComponentSection title="Career 1:1 — Confirmed" description="1:1 career mentoring. Join online session on card. Student info in View Details.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Career Mentoring"
            sessionType="Career mentoring session"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-03-18"
            start={minutes(14)}
            end={minutes(15)}
            status={STATUS_CONFIRMED()}
            actions={
              <>
                <Button variant="contained" size="small" startIcon={<LinkOutlinedIcon sx={{ fontSize: 16 }} />}>Join online session</Button>
                <Button variant="soft" size="small" startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}>Event Materials</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("career-confirmed")}>View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* 5. Mock Interview — Confirmed (secondary facilitator) */}
      <ComponentSection title="Mock Interview — Confirmed (secondary)" description="Mock interview event. Join online session + Share Feedback on card. Secondary facilitator badge.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Mock Interview"
            sessionType="Career mentoring session"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-03-19"
            start={minutes(16)}
            end={minutes(17)}
            status={STATUS_CONFIRMED()}
            actions={
              <>
                <Button variant="contained" size="small" startIcon={<LinkOutlinedIcon sx={{ fontSize: 16 }} />}>Join online session</Button>
                <Button variant="soft" size="small" startIcon={<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 14 }} />}>Share Feedback</Button>
              </>
            }
            chips={["secondary"]}
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("mock-confirmed")}>View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* 6. Mentoring — Tentative */}
      <ComponentSection title="Mentoring — Tentative" description="Planned mentoring event, time not yet confirmed. View details opens dialog with schedule (to be confirmed), batch, program, contact.">
        <PlannedEventCard
          sessionType="Online session"
          title="Machine Learning"
          batch="PGP-AIML-BA-UTA-Nov25-C"
          program="PGP-AIML"
          contactEmail="gurus_support@greatlearning.in"
          startDateYmd="2026-01-22"
          endDateYmd="2026-02-14"
          onViewDetails={() => setPlannedDetailOpen(true)}
        />
      </ComponentSection>

      {/* 7. Mentoring — Completed (Gathering feedback) */}
      <ComponentSection title="Mentoring — Completed (Gathering feedback)" description="Event done, learners haven't rated yet. Payment pending chip, Watch recording on card.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Statistics for Data Science"
            sessionType="Online session"
            batch="PGPDS.O.MAR26.A"
            dateYmd="2026-03-12"
            start={minutes(18)}
            end={minutes(20)}
            topRight={CHIP_GATHERING}
            actions={
              <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Watch recording</Button>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("mentoring-gathering")}>View details</Button>}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
            {CHIP_PAYMENT_PENDING}
          </Stack>
        </Card>
      </ComponentSection>

      {/* 8. Mentoring — Completed (No feedback) */}
      <ComponentSection title="Mentoring — Completed (No feedback)" description="Event older than 30 days, no learner ratings. Payment processed chip on card.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Python Fundamentals"
            sessionType="Online session"
            batch="PGPDS.O.MAR26.A"
            dateYmd="2026-01-15"
            start={minutes(9, 30)}
            end={minutes(11)}
            topRight={CHIP_NO_FEEDBACK}
            actions={
              <>
                <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Watch recording</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("mentoring-noFeedback")}>View details</Button>}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
            {CHIP_PAYMENT_PROCESSED}
          </Stack>
        </Card>
      </ComponentSection>

      {/* 9. Mentoring — Completed (with rating) */}
      <ComponentSection title="Mentoring — Completed (with rating)" description="Past mentoring event. Star rating top-right. Watch recording + Detailed Feedback on card. Payment processed chip.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Statistics for Data Science"
            sessionType="Online session"
            batch="PGPDS.O.MAR26.A"
            dateYmd="2026-03-05"
            start={minutes(18)}
            end={minutes(20)}
            topRight={<StarRatingNumeric rating={4.5} />}
            actions={
              <>
                <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Watch recording</Button>
                <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>Detailed Feedback</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("mentoring-completed")}>View details</Button>}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
            {CHIP_PAYMENT_PROCESSED}
          </Stack>
        </Card>
      </ComponentSection>

      {/* 10. Mentoring — Completed (Summary needed) */}
      <ComponentSection title="Mentoring — Completed (Summary needed)" description="Event done, summary not yet written. 'Summary needed' chip. Write summary button + Watch recording + View ratings. Italic hint to write summary for invoice.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Statistics for Data Science"
            sessionType="Online session"
            batch="PGPDS.O.MAR26.A"
            dateYmd="2026-03-12"
            start={minutes(18)}
            end={minutes(20)}
            status={STATUS_SUMMARY_NEEDED}
            topRight={<StarRatingNumeric rating={4.5} />}
            actions={
              <>
                <Button
                  startIcon={<EditNoteOutlinedIcon sx={{ fontSize: 14 }} />}
                  variant="contained"
                  size="small"
                >
                  Write summary
                </Button>
                <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Watch recording</Button>
                <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>View ratings</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("mentoring-completed")}>View details</Button>}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block", fontStyle: "italic" }}>
            Write summary to process invoice
          </Typography>
        </Card>
      </ComponentSection>

      {/* 11. Mentoring — Completed (Summary submitted) */}
      <ComponentSection title="Mentoring — Completed (Summary submitted)" description="Summary written and submitted. 'Summary submitted' chip. Summary panel shown with Edit link. View in payments + Watch recording + View ratings.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Statistics for Data Science"
            sessionType="Online session"
            batch="PGPDS.O.MAR26.A"
            dateYmd="2026-03-12"
            start={minutes(18)}
            end={minutes(20)}
            status={STATUS_SUMMARY_SUBMITTED}
            topRight={<StarRatingNumeric rating={4.5} />}
            actions={
              <>
                <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Watch recording</Button>
                <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>View ratings</Button>
                <Button variant="soft" size="small" startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 14 }} />}>View in payments</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("mentoring-completed")}>View details</Button>}
          />
          <Paper variant="outlined" sx={{ p: 1.5, mt: 1.5, borderRadius: 1.5, bgcolor: "action.hover" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="caption" fontWeight={600}>Session summary</Typography>
              <Button
                startIcon={<EditNoteOutlinedIcon sx={{ fontSize: 14 }} />}
                variant="text"
                size="small"
                sx={{ fontSize: 11, minWidth: "auto", p: 0 }}
              >
                Edit
              </Button>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Great session with high learner engagement. Students asked insightful questions about statistical distributions and hypothesis testing. Overall, learners were engaged and the session met its objectives.
            </Typography>
          </Paper>
        </Card>
      </ComponentSection>

      {/* 12. Mock Interview — Completed */}
      <ComponentSection title="Mock Interview — Completed" description="Past mock interview. Star rating top-right. Watch recording + Detailed Feedback + Share Feedback. Payment processed chip.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Mock Interview"
            sessionType="Career mentoring session"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-02-25"
            start={minutes(16)}
            end={minutes(17)}
            topRight={<StarRatingNumeric rating={4.2} />}
            actions={
              <>
                <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Watch recording</Button>
                <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>Detailed Feedback</Button>
                <Button variant="soft" size="small" startIcon={<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 14 }} />}>Share Feedback</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("mock-completed")}>View details</Button>}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
            {CHIP_PAYMENT_PROCESSED}
          </Stack>
        </Card>
      </ComponentSection>
    </>
  );
}

/* ── Career Mentor Cards (use SessionCard) ── */

function CareerMentorOnlineSessionCards() {
  const [detailOpen, setDetailOpen] = useState<OnlineEventDialogVariant | null>(null);

  return (
    <>
      <OnlineEventDetailDialog open={detailOpen !== null} onClose={() => setDetailOpen(null)} variant={detailOpen ?? "career-confirmed"} />

      {/* 1. Career 1:1 — Confirmed */}
      <ComponentSection title="Career 1:1 — Confirmed" description="1:1 career mentoring. Join online session on card. Student info, LinkedIn, resume in View Details.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Career Mentoring"
            sessionType="Career mentoring session"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-03-18"
            start={minutes(14)}
            end={minutes(15)}
            status={STATUS_CONFIRMED()}
            actions={
              <>
                <Button variant="contained" size="small" startIcon={<LinkOutlinedIcon sx={{ fontSize: 16 }} />}>Join online session</Button>
                <Button variant="soft" size="small" startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}>Event Materials</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("career-confirmed")}>View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* 2. Mock Interview — Confirmed */}
      <ComponentSection title="Mock Interview — Confirmed" description="Mock interview event. Join online session + Share Feedback on card.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Mock Interview"
            sessionType="Career mentoring session"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-03-19"
            start={minutes(16)}
            end={minutes(17)}
            status={STATUS_CONFIRMED()}
            actions={
              <>
                <Button variant="contained" size="small" startIcon={<LinkOutlinedIcon sx={{ fontSize: 16 }} />}>Join online session</Button>
                <Button variant="soft" size="small" startIcon={<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 14 }} />}>Share Feedback</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("mock-confirmed")}>View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* 3. Career 1:1 — Scheduled */}
      <ComponentSection title="Career 1:1 — Scheduled" description="Career mentoring event awaiting guru confirmation.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Career Mentoring"
            sessionType="Career mentoring session"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-03-22"
            start={minutes(14)}
            end={minutes(15)}
            status={STATUS_SCHEDULED}
            actions={
              <>
                <Button startIcon={<TaskAltOutlinedIcon sx={{ fontSize: 18 }} />} size="small" variant="contained">Confirm</Button>
                <Button startIcon={<DoNotDisturbOnOutlinedIcon sx={{ fontSize: 18 }} />} size="small" variant="soft">I&apos;m unavailable</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("career-scheduled")}>View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* 4. Career — Completed (Gathering feedback) */}
      <ComponentSection title="Career — Completed (Gathering feedback)" description="Event done, no ratings yet. Gathering feedback chip + Payment pending chip.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Career Mentoring"
            sessionType="Career mentoring session"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-03-10"
            start={minutes(14)}
            end={minutes(15)}
            topRight={CHIP_GATHERING}
            actions={
              <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Watch recording</Button>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("career-gathering")}>View details</Button>}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
            {CHIP_PAYMENT_PENDING}
          </Stack>
        </Card>
      </ComponentSection>

      {/* 5. Career — Completed (with rating) */}
      <ComponentSection title="Career — Completed (with rating)" description="Past career event. Star rating, Detailed Feedback on card. Payment processed chip.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Career Mentoring"
            sessionType="Career mentoring session"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-02-20"
            start={minutes(14)}
            end={minutes(15)}
            topRight={<StarRatingNumeric rating={4.8} />}
            actions={
              <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>Detailed Feedback</Button>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("career-completed")}>View details</Button>}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
            {CHIP_PAYMENT_PROCESSED}
          </Stack>
        </Card>
      </ComponentSection>

      {/* 6. Career — Completed (Summary needed) */}
      <ComponentSection title="Career — Completed (Summary needed)" description="Career session done, summary not yet written. 'Summary needed' chip. Write summary + Watch recording + View ratings. Italic hint for invoice.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Career Mentoring"
            sessionType="Career mentoring session"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-03-10"
            start={minutes(14)}
            end={minutes(15)}
            status={STATUS_SUMMARY_NEEDED}
            topRight={<StarRatingNumeric rating={4.8} />}
            actions={
              <>
                <Button
                  startIcon={<EditNoteOutlinedIcon sx={{ fontSize: 14 }} />}
                  variant="contained"
                  size="small"
                >
                  Write summary
                </Button>
                <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Watch recording</Button>
                <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>View ratings</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("career-completed")}>View details</Button>}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block", fontStyle: "italic" }}>
            Write summary to process invoice
          </Typography>
        </Card>
      </ComponentSection>

      {/* 7. Career — Completed (Summary submitted) */}
      <ComponentSection title="Career — Completed (Summary submitted)" description="Career summary written. 'Summary submitted' chip. Summary panel with Edit link. View in payments + Watch recording + View ratings.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Career Mentoring"
            sessionType="Career mentoring session"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-03-10"
            start={minutes(14)}
            end={minutes(15)}
            status={STATUS_SUMMARY_SUBMITTED}
            topRight={<StarRatingNumeric rating={4.8} />}
            actions={
              <>
                <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Watch recording</Button>
                <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>View ratings</Button>
                <Button variant="soft" size="small" startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 14 }} />}>View in payments</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("career-completed")}>View details</Button>}
          />
          <Paper variant="outlined" sx={{ p: 1.5, mt: 1.5, borderRadius: 1.5, bgcolor: "action.hover" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="caption" fontWeight={600}>Session summary</Typography>
              <Button
                startIcon={<EditNoteOutlinedIcon sx={{ fontSize: 14 }} />}
                variant="text"
                size="small"
                sx={{ fontSize: 11, minWidth: "auto", p: 0 }}
              >
                Edit
              </Button>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Productive career mentoring session. Discussed career transition strategies and resume optimization. The learner was highly engaged and left with clear next steps.
            </Typography>
          </Paper>
        </Card>
      </ComponentSection>

      {/* 8. Mock — Completed (with Share Feedback) */}
      <ComponentSection title="Mock — Completed (with Share Feedback)" description="Past mock interview. Star rating, Watch recording + Detailed Feedback + Share Feedback. Payment processed chip.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Mock Interview"
            sessionType="Career mentoring session"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-02-18"
            start={minutes(16)}
            end={minutes(17)}
            topRight={<StarRatingNumeric rating={4.0} />}
            actions={
              <>
                <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Watch recording</Button>
                <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>Detailed Feedback</Button>
                <Button variant="soft" size="small" startIcon={<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 14 }} />}>Share Feedback</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("mock-completed")}>View details</Button>}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
            {CHIP_PAYMENT_PROCESSED}
          </Stack>
        </Card>
      </ComponentSection>
    </>
  );
}

/* ── Evaluation Cards (use SessionCard) ── */

function EvaluationCards() {
  const [detailOpen, setDetailOpen] = useState<EvalDialogVariant | null>(null);

  return (
    <>
      <EvaluationDetailDialog open={detailOpen !== null} onClose={() => setDetailOpen(null)} variant={detailOpen ?? "confirmed"} />

      {/* ── Confirmed ── */}
      <ComponentSection
        title="Evaluation — Confirmed"
        description="Date range (assessment due → grading due), assignment link to SpeedGrader, course template, batch, contact, student progress. No action buttons."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>Evaluation: Linear Regression Assignment</Typography>
            {CHIP_CONFIRMED}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">15 Mar – 22 Mar, 2026 &bull; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="text" size="small" onClick={() => setDetailOpen("confirmed")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Tentative ── */}
      <ComponentSection
        title="Evaluation — Tentative"
        description="Assignment label is plain text (no link). No student progress. 'To be confirmed' instead of submission counts."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>Evaluation: Decision Tree Assignment</Typography>
            {CHIP_TO_BE_CONFIRMED}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">1 Apr – 10 Apr, 2026 &bull; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="text" size="small" onClick={() => setDetailOpen("tentative")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Completed — Gathering feedback ── */}
      <ComponentSection
        title="Evaluation — Completed (Gathering feedback)"
        description="Grading done, no ratings yet. Gathering feedback chip. Payment pending chip. No Detailed Feedback button."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>Evaluation: Linear Regression Assignment</Typography>
            {CHIP_GATHERING}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary" }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">8 Mar – 15 Mar, 2026 &bull; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
            {CHIP_PAYMENT_PENDING}
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} justifyContent="flex-end">
            <Button variant="text" size="small" onClick={() => setDetailOpen("gathering")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Completed — with rating ── */}
      <ComponentSection
        title="Evaluation — Completed (with rating)"
        description="Star icons only (no numeric score). Detailed Feedback button shown alongside rating. Payment processed chip."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>Evaluation: Linear Regression Assignment</Typography>
            <StarRatingIcons rating={4} />
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary" }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">1 Mar – 8 Mar, 2026 &bull; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
            {CHIP_PAYMENT_PROCESSED}
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} sx={{ mt: 1.5 }}>
            <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>Detailed Feedback</Button>
            <Button variant="text" size="small" onClick={() => setDetailOpen("completed")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>
    </>
  );
}

/* ── Moderation Cards (use SessionCard) ── */

function ModerationCards() {
  const [detailOpen, setDetailOpen] = useState<ModDialogVariant | null>(null);

  return (
    <>
      <ModerationDetailDialog open={detailOpen !== null} onClose={() => setDetailOpen(null)} variant={detailOpen ?? "confirmed"} />

      {/* ── Confirmed ── */}
      <ComponentSection
        title="Moderation — Confirmed"
        description="Date range (moderation start → concluding remark), DQ link to SpeedGrader, course template, batch, contact, student response progress (posts/unread/graded with activity color). No action buttons."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>Moderation: Impact of AI on Healthcare</Typography>
            {CHIP_CONFIRMED}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">15 Mar – 20 Mar, 2026 &bull; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="text" size="small" onClick={() => setDetailOpen("confirmed")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Tentative ── */}
      <ComponentSection
        title="Moderation — Tentative"
        description="DQ label is plain text (no link). No student progress. 'To be confirmed' instead of progress stats."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>Moderation: Ethics in Machine Learning</Typography>
            {CHIP_TO_BE_CONFIRMED}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">5 Apr – 15 Apr, 2026 &bull; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="text" size="small" onClick={() => setDetailOpen("tentative")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Completed — Gathering feedback ── */}
      <ComponentSection
        title="Moderation — Completed (Gathering feedback)"
        description="Moderation done, no ratings yet. Gathering feedback chip. Payment pending chip. No Detailed Feedback button."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>Moderation: Impact of AI on Healthcare</Typography>
            {CHIP_GATHERING}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary" }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">8 Mar – 15 Mar, 2026 &bull; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
            {CHIP_PAYMENT_PENDING}
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} justifyContent="flex-end">
            <Button variant="text" size="small" onClick={() => setDetailOpen("gathering")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Completed — with rating ── */}
      <ComponentSection
        title="Moderation — Completed (with rating)"
        description="Star icons only (no numeric score). Detailed Feedback button shown alongside rating. Payment processed chip. Identical layout to Evaluation completed."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>Moderation: Impact of AI on Healthcare</Typography>
            <StarRatingIcons rating={5} />
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary" }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">25 Feb – 5 Mar, 2026 &bull; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
            {CHIP_PAYMENT_PROCESSED}
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} sx={{ mt: 1.5 }}>
            <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>Detailed Feedback</Button>
            <Button variant="text" size="small" onClick={() => setDetailOpen("completed")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>
    </>
  );
}

/* ── Capstone Cards (use SessionCard) ── */

function CapstoneCards() {
  const [detailOpen, setDetailOpen] = useState<CapstoneDialogVariant | null>(null);

  return (
    <>
      <CapstoneDetailDialog open={detailOpen !== null} onClose={() => setDetailOpen(null)} variant={detailOpen ?? "confirmed"} />

      {/* ── Confirmed ── */}
      <ComponentSection
        title="Capstone Project — Confirmed"
        description="Date range (start → presentation), 'Capstone — [Batch]', group, domain, next session date, contact. View Student Progress + Group Details in dialog. No tentative state."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>Capstone &mdash; PGPDS.O.MAR26.A</Typography>
            {CHIP_CONFIRMED}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">15 Jan – 20 Apr, 2026</Typography>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="text" size="small" onClick={() => setDetailOpen("confirmed")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Completed — payment pending ── */}
      <ComponentSection
        title="Capstone Project — Completed (Payment pending)"
        description="No rating for capstones. View Student Progress button always shown. Payment pending chip."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>Capstone &mdash; PGPDS.O.JUL25.A</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary" }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">15 Jul – 20 Nov, 2025</Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
            {CHIP_PAYMENT_PENDING}
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} sx={{ mt: 1.5 }}>
            <Button variant="soft" size="small" startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 14 }} />}>View Student Progress</Button>
            <Button variant="text" size="small" onClick={() => setDetailOpen("paymentPending")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Completed — payment processed ── */}
      <ComponentSection
        title="Capstone Project — Completed"
        description="No rating. View Student Progress always shown. Payment processed chip. Group, domain, milestones in View Details."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>Capstone &mdash; PGPDS.O.JUL25.A</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary" }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">15 Jul – 20 Nov, 2025</Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
            {CHIP_PAYMENT_PROCESSED}
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} sx={{ mt: 1.5 }}>
            <Button variant="soft" size="small" startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 14 }} />}>View Student Progress</Button>
            <Button variant="text" size="small" onClick={() => setDetailOpen("completed")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>
    </>
  );
}

/* ── CV Review Cards (use SessionCard) ── */

function CVReviewCards() {
  const [detailOpen, setDetailOpen] = useState<CVReviewDialogVariant | null>(null);

  return (
    <>
      <CVReviewDetailDialog open={detailOpen !== null} onClose={() => setDetailOpen(null)} variant={detailOpen ?? "confirmed"} />

      {/* ── Confirmed (not yet submitted) ── */}
      <ComponentSection
        title="CV Review — Confirmed"
        description="Due date, batch, 'Due on' line. View LinkedIn, View CV, View User Comments, Submit CV Review as primary actions. No tentative state exists."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>CV Review</Typography>
            {CHIP_CONFIRMED}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">22 Mar, 2026 &bull; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Button variant="contained" size="small">Submit CV Review</Button>
            <Button variant="text" size="small" onClick={() => setDetailOpen("confirmed")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Confirmed (already submitted) ── */}
      <ComponentSection
        title="CV Review — Confirmed (Already Submitted)"
        description="Submit button replaced by 'Already Submitted' text. 'Due on' line hidden once submitted."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>CV Review</Typography>
            <Stack direction="row" spacing={0.75}>
              {CHIP_ALREADY_SUBMITTED}
              {CHIP_CONFIRMED}
            </Stack>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">22 Mar, 2026 &bull; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="text" size="small" onClick={() => setDetailOpen("confirmed-submitted")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Completed ── */}
      <ComponentSection
        title="CV Review — Completed"
        description="No LinkedIn, no comments, no submit. 'View CV' becomes 'View Reviewed CV'. Contact email appears. No rating, no feedback. Payment TXN if applicable."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>CV Review</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary" }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">5 Mar, 2026 &bull; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
            {CHIP_PAYMENT_PROCESSED}
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} sx={{ mt: 1.5 }}>
            <Button variant="soft" size="small" startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 14 }} />}>View Reviewed CV</Button>
            <Button variant="text" size="small" onClick={() => setDetailOpen("completed")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ROLE → ACTIVITY MAPPING
   ══════════════════════════════════════════════════════════════════════════ */

const ROLE_SECTIONS: Record<GuruRole, { label: string; render: () => React.ReactNode }[]> = {
  Teacher: [
    { label: "Residency", render: () => <ResidencyCards /> },
    { label: "Online Event", render: () => <OnlineSessionCards /> },
  ],
  "Course Mentor": [
    { label: "Online Event", render: () => <OnlineSessionCards /> },
    { label: "Residency", render: () => <ResidencyCards /> },
  ],
  "Career Mentor": [
    { label: "Career / Mock Interview", render: () => <CareerMentorOnlineSessionCards /> },
    { label: "CV Review", render: () => <CVReviewCards /> },
  ],
  "CV Review Mentor": [
    { label: "CV Review", render: () => <CVReviewCards /> },
  ],
  Evaluator: [
    { label: "Evaluation (Assignment)", render: () => <EvaluationCards /> },
  ],
  Moderator: [
    { label: "Moderation (Discussion Question)", render: () => <ModerationCards /> },
  ],
  "Project Mentor": [
    { label: "Capstone Project", render: () => <CapstoneCards /> },
  ],
  "Industry Expert": [
    { label: "Online Event", render: () => <OnlineSessionCards /> },
  ],
};

/* ══════════════════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ══════════════════════════════════════════════════════════════════════════ */

export default function ComponentsPage() {
  const selectedRole = useAppSelector((s) => s.devPanel.selectedRole);
  const sections = ROLE_SECTIONS[selectedRole];

  return (
    <Stack spacing={3} sx={{ maxWidth: 800 }}>
      <Box>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.25 }}>
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: "1.125rem", md: "1.25rem" } }}>
            Components
          </Typography>
          <Chip label={selectedRole} size="small" sx={{ fontWeight: 600 }} />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Session card variants for the <strong>{selectedRole}</strong> persona. Switch roles in the Dev Panel to see other activity types.
        </Typography>
      </Box>

      {sections.map((section) => (
        <Card key={section.label} sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>{section.label}</Typography>
          <Stack spacing={3} divider={<Divider />}>
            {section.render()}
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}
