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
import Drawer from "@mui/material/Drawer";
import TextField from "@mui/material/TextField";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
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
import CallMergeOutlinedIcon from "@mui/icons-material/CallMergeOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import DragIndicatorOutlinedIcon from "@mui/icons-material/DragIndicatorOutlined";
import Paper from "@mui/material/Paper";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import { SessionCard, STATUS_SCHEDULED, STATUS_CONFIRMED, STATUS_DECLINED } from "@/components/shared/SessionCard";
import { minutes, fmtDateNice } from "@/lib/helpers";
import { useAppSelector } from "@/store";
import type { GuruRole } from "@/store/slices/devPanelSlice";
import type { Poll } from "@/lib/types";

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
const CHIP_COMBINED = (
  <Chip
    icon={<CallMergeOutlinedIcon sx={{ fontSize: 13 }} />}
    label="Combined session"
    size="small"
    sx={{
      fontWeight: 600,
      fontSize: "0.7rem",
      bgcolor: "hsl(var(--md-surface-container) / 0.6)",
      border: "1px solid",
      borderColor: "divider",
      "& .MuiChip-icon": { color: "inherit", ml: 0.5 },
    }}
  />
);
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

/* ── Combined Batches Panel (shared across card types) ── */

function CombinedBatchesPanel({ batches, compact }: { batches: { batch: string; group?: string }[]; compact?: boolean }) {
  return (
    <Box
      sx={{
        mt: 1.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      {/* Accent header */}
      <Box
        sx={{
          px: 1.5,
          py: 0.75,
          bgcolor: "hsl(var(--md-surface-container) / 0.5)",
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 0.75,
        }}
      >
        <CallMergeOutlinedIcon sx={{ fontSize: 13, color: "text.secondary" }} />
        <Typography variant="caption" fontWeight={600} color="text.secondary">
          Combined batches
        </Typography>
        <Chip
          label={batches.length}
          size="small"
          sx={{
            height: 18,
            minWidth: 18,
            fontSize: "0.65rem",
            fontWeight: 700,
            bgcolor: "action.selected",
            "& .MuiChip-label": { px: 0.5 },
          }}
        />
      </Box>
      {/* Batch rows */}
      <Stack divider={<Divider />}>
        {batches.map((b) => (
          <Stack
            key={b.batch}
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              px: 1.5,
              py: compact ? 0.5 : 0.75,
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: "text.disabled",
                flexShrink: 0,
              }}
            />
            <Typography variant="caption" fontWeight={500}>
              {b.batch}
            </Typography>
            {b.group && (
              <Typography variant="caption" color="text.secondary">
                &mdash; {b.group}
              </Typography>
            )}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

/* ── Completed Combined Group wrapper ── */

function CombinedCompletedGroup({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        position: "relative",
        pl: { xs: 0, sm: 2 },
        "&::before": {
          content: '""',
          display: { xs: "none", sm: "block" },
          position: "absolute",
          left: 0,
          top: 8,
          bottom: 8,
          width: 3,
          borderRadius: 2,
          bgcolor: "divider",
        },
      }}
    >
      {/* Group header */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.75}
        sx={{ mb: 1.5 }}
      >
        <CallMergeOutlinedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
        <Typography variant="caption" fontWeight={600} color="text.secondary">
          Combined session &mdash; split per batch
        </Typography>
      </Stack>
      <Stack spacing={2}>
        {children}
      </Stack>
    </Box>
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
            {/* Header: breadcrumb + status + title */}
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1, mb: 0.75 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ letterSpacing: "0.02em" }}>
                  {program} · {sessionType}
                </Typography>
                <Chip label="To be confirmed" size="small" sx={{ bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)", fontWeight: 600 }} />
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
            {/* Header: breadcrumb + status + title */}
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1, mb: 0.75 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ letterSpacing: "0.02em" }}>
                  PGP-AIML · Residency
                </Typography>
                {statusChip}
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

            {/* Combined session section */}
            {variant === "combined" && (
              <SectionBox>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
                  <Chip label="Combined session" size="small" variant="outlined" sx={{ fontWeight: 500, fontSize: "0.7rem" }} />
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
  | "mentoring-combinedScheduled"
  | "mentoring-combinedCompleted"
  | "career-confirmed" | "career-scheduled" | "career-gathering" | "career-completed"
  | "mock-confirmed" | "mock-gathering" | "mock-completed";

/* ── Inline Poll Card ── */

function PollCard({ poll, onEdit, onDelete, onToggleStatus }: {
  poll: Poll;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}) {
  const isDraft = poll.status === "draft";
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        transition: "box-shadow 0.15s ease",
        "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
      }}
    >
      {/* Poll header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 1.5,
          py: 0.75,
          bgcolor: isDraft
            ? "hsl(var(--md-surface-container) / 0.4)"
            : "var(--gl-status-confirmed-bg)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <PollOutlinedIcon sx={{ fontSize: 13, color: "text.secondary" }} />
          <Chip
            label={isDraft ? "Draft" : "Queued"}
            size="small"
            sx={{
              height: 20,
              fontSize: "0.65rem",
              fontWeight: 700,
              bgcolor: isDraft ? "action.selected" : "var(--gl-status-confirmed-bg)",
              color: isDraft ? "text.secondary" : "var(--gl-status-confirmed-text)",
              border: isDraft ? "none" : "1px solid var(--gl-status-confirmed-border)",
              "& .MuiChip-label": { px: 0.75 },
            }}
          />
        </Stack>
        <Stack direction="row" spacing={0.25}>
          <IconButton size="small" onClick={onEdit} sx={{ color: "text.secondary", p: 0.5 }}>
            <EditOutlinedIcon sx={{ fontSize: 14 }} />
          </IconButton>
          <IconButton size="small" onClick={onDelete} sx={{ color: "text.secondary", p: 0.5 }}>
            <DeleteOutlineOutlinedIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Stack>
      </Stack>
      {/* Poll body */}
      <Box sx={{ px: 1.5, py: 1.25 }}>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 1, fontSize: "0.8125rem" }}>
          {poll.question}
        </Typography>
        <Stack spacing={0.5}>
          {poll.options.map((opt, i) => (
            <Stack
              key={i}
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                px: 1.25,
                py: 0.5,
                borderRadius: 1.5,
                bgcolor: "hsl(var(--md-surface-container) / 0.3)",
                border: "1px solid transparent",
              }}
            >
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  border: "2px solid",
                  borderColor: "divider",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  color: "text.disabled",
                }}
              >
                {String.fromCharCode(65 + i)}
              </Box>
              <Typography variant="caption" fontWeight={500}>{opt}</Typography>
            </Stack>
          ))}
        </Stack>
        {/* Toggle status action */}
        <Button
          size="small"
          variant="text"
          onClick={onToggleStatus}
          sx={{ mt: 1, fontSize: "0.7rem", fontWeight: 600 }}
          startIcon={<SendOutlinedIcon sx={{ fontSize: 12 }} />}
        >
          {isDraft ? "Queue to Zoom" : "Move to draft"}
        </Button>
      </Box>
    </Box>
  );
}

/* ── Inline Poll Creation Form ── */

function PollCreationForm({ onSave, onCancel, editingPoll }: {
  onSave: (poll: { question: string; options: string[]; status: "draft" | "queued" }) => void;
  onCancel: () => void;
  editingPoll?: Poll | null;
}) {
  const [question, setQuestion] = useState(editingPoll?.question ?? "");
  const [options, setOptions] = useState<string[]>(editingPoll?.options ?? ["", ""]);

  const updateOption = (index: number, value: string) => {
    const next = [...options];
    next[index] = value;
    setOptions(next);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const canSave = question.trim().length > 0 && options.filter((o) => o.trim()).length >= 2;

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: "primary.main",
        bgcolor: "hsl(var(--md-surface-container) / 0.2)",
        overflow: "hidden",
      }}
    >
      {/* Form header */}
      <Box
        sx={{
          px: 1.5,
          py: 1,
          bgcolor: "hsl(var(--md-surface-container) / 0.5)",
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 0.75,
        }}
      >
        <PollOutlinedIcon sx={{ fontSize: 14, color: "primary.main" }} />
        <Typography variant="caption" fontWeight={700} color="primary.main">
          {editingPoll ? "Edit poll" : "New poll"}
        </Typography>
      </Box>

      {/* Form body */}
      <Stack spacing={1.5} sx={{ px: 1.5, py: 1.5 }}>
        <TextField
          label="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          size="small"
          fullWidth
          placeholder="E.g., Which topic should we cover next?"
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": { fontSize: "0.8125rem" },
            "& .MuiInputLabel-root": { fontSize: "0.8125rem" },
          }}
        />

        <Box>
          <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.75, display: "block" }}>
            Options ({options.filter((o) => o.trim()).length} of {options.length})
          </Typography>
          <Stack spacing={0.75}>
            {options.map((opt, i) => (
              <Stack key={i} direction="row" alignItems="center" spacing={0.5}>
                <DragIndicatorOutlinedIcon sx={{ fontSize: 14, color: "text.disabled", flexShrink: 0 }} />
                <TextField
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  size="small"
                  fullWidth
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": { fontSize: "0.8125rem" },
                  }}
                />
                {options.length > 2 && (
                  <IconButton size="small" onClick={() => removeOption(i)} sx={{ p: 0.5 }}>
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                )}
              </Stack>
            ))}
          </Stack>
          {options.length < 5 && (
            <Button
              size="small"
              variant="text"
              startIcon={<AddOutlinedIcon sx={{ fontSize: 13 }} />}
              onClick={() => setOptions([...options, ""])}
              sx={{ mt: 0.5, fontSize: "0.7rem" }}
            >
              Add option
            </Button>
          )}
        </Box>

        {/* Form actions */}
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ pt: 0.5 }}>
          <Button variant="text" size="small" color="inherit" onClick={onCancel} sx={{ fontSize: "0.75rem" }}>
            Cancel
          </Button>
          <Button
            variant="soft"
            size="small"
            onClick={() => onSave({ question, options: options.filter((o) => o.trim()), status: "draft" })}
            disabled={!canSave}
            sx={{ fontSize: "0.75rem" }}
          >
            Save draft
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => onSave({ question, options: options.filter((o) => o.trim()), status: "queued" })}
            disabled={!canSave}
            startIcon={<SendOutlinedIcon sx={{ fontSize: 13 }} />}
            sx={{ fontSize: "0.75rem" }}
          >
            Queue to Zoom
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

/* ── Online Event Detail Drawer (right-side panel) ── */

function OnlineEventDetailDialog({ open, onClose, variant }: { open: boolean; onClose: () => void; variant: OnlineEventDialogVariant }) {
  const category = variant.split("-")[0] as "mentoring" | "career" | "mock";
  const subType = variant.split("-").slice(1).join("-");

  const isMentoring = category === "mentoring";
  const isCareer = category === "career";
  const isMock = category === "mock";

  const sessionTypeLabel = isMentoring ? "Online session" : isCareer ? "Career mentoring session" : "Mock Interview";
  const batchLabel = isMentoring ? "PGPDS.O.MAR26.A" : "PGP-AIML-BA-UTA-Nov25-C";
  const title = isMentoring
    ? "M5 W2 | Hypothesis Testing"
    : isCareer
      ? "Resume Review & Interview Prep"
      : "Technical Round — Data Structures";

  const isCombinedVariant = subType === "combined" || subType === "combinedScheduled" || subType === "combinedCompleted";
  const isCompletedState = subType === "completed" || subType === "gathering" || subType === "noFeedback" || subType === "combinedCompleted";
  const isScheduledState = subType === "scheduled" || subType === "combinedScheduled";
  const isConfirmedState = subType === "confirmed" || subType === "combined";

  // Show polls section for mentoring confirmed (the state where guru would create polls)
  const showPolls = isMentoring && isConfirmedState;

  // ── Local poll state for the Components showcase ──
  const [polls, setPolls] = useState<Poll[]>([
    {
      id: "poll-demo-1",
      sessionId: "demo-session",
      question: "Which topic should we deep-dive into next week?",
      options: ["Neural Networks", "Decision Trees", "Ensemble Methods"],
      status: "queued",
    },
  ]);
  const [showPollForm, setShowPollForm] = useState(false);
  const [editingPollId, setEditingPollId] = useState<string | null>(null);

  const handleSavePoll = (data: { question: string; options: string[]; status: "draft" | "queued" }) => {
    if (editingPollId) {
      setPolls((prev) => prev.map((p) => p.id === editingPollId ? { ...p, ...data } : p));
    } else {
      setPolls((prev) => [...prev, { id: `poll-${Date.now()}`, sessionId: "demo-session", ...data }]);
    }
    setShowPollForm(false);
    setEditingPollId(null);
  };

  const handleDeletePoll = (id: string) => {
    setPolls((prev) => prev.filter((p) => p.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setPolls((prev) => prev.map((p) => p.id === id ? { ...p, status: p.status === "draft" ? "queued" as const : "draft" as const } : p));
  };

  const handleEditPoll = (id: string) => {
    setEditingPollId(id);
    setShowPollForm(true);
  };

  const statusChip = isCompletedState ? (
    <Chip label="Completed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }} />
  ) : isScheduledState || subType === "tentative" ? (
    <Chip label="Scheduled" size="small" sx={{ bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)", fontWeight: 600 }} />
  ) : (
    <Chip label="Confirmed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }} />
  );

  const drawerWidth = { xs: "100vw", sm: 520 };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          maxWidth: "100vw",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.08)",
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* ── Sticky header ── */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700}>Event details</Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
            <CloseOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* ── Scrollable content ── */}
        <Box className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto", px: 3, py: 2.5 }}>
          <Stack spacing={2.5}>
            {/* Header: breadcrumb + status + title */}
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ letterSpacing: "0.02em" }}>
                  {batchLabel} · {sessionTypeLabel}
                </Typography>
                {statusChip}
              </Stack>
              <Typography variant="h6" fontWeight={600}>{title}</Typography>
              {isMentoring && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  M5 W2 | Hypothesis Testing &amp; Confidence Intervals
                </Typography>
              )}
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
            {isMentoring && isCombinedVariant && (
              <SectionBox>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Combined session</Typography>
                <Divider sx={{ mb: 0.5 }} />
                <InfoRow label="Participants">48 students (combined)</InfoRow>
                <InfoRow label="Batch A">PGPDS.O.MAR26.A &mdash; Group 07</InfoRow>
                <InfoRow label="Batch B">PGPDS.O.MAR26.B &mdash; Group 03</InfoRow>
              </SectionBox>
            )}

            {/* Session materials section (mentoring confirmed) */}
            {isMentoring && isConfirmedState && (
              <SectionBox>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Session materials</Typography>
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

            {/* ═══ POLLS SECTION (mentoring confirmed) ═══ */}
            {showPolls && (
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <PollOutlinedIcon sx={{ fontSize: 16, color: "primary.main" }} />
                    <Typography variant="subtitle2" fontWeight={700}>Polls</Typography>
                    {polls.length > 0 && (
                      <Chip
                        label={polls.length}
                        size="small"
                        sx={{
                          height: 20,
                          minWidth: 20,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          "& .MuiChip-label": { px: 0.5 },
                        }}
                      />
                    )}
                  </Stack>
                  {!showPollForm && (
                    <Button
                      size="small"
                      variant="soft"
                      startIcon={<AddOutlinedIcon sx={{ fontSize: 14 }} />}
                      onClick={() => { setEditingPollId(null); setShowPollForm(true); }}
                      sx={{ fontSize: "0.75rem" }}
                    >
                      Add poll
                    </Button>
                  )}
                </Stack>

                <Stack spacing={1.5}>
                  {/* Existing polls */}
                  {polls.map((poll) => (
                    <PollCard
                      key={poll.id}
                      poll={poll}
                      onEdit={() => handleEditPoll(poll.id)}
                      onDelete={() => handleDeletePoll(poll.id)}
                      onToggleStatus={() => handleToggleStatus(poll.id)}
                    />
                  ))}

                  {/* Inline creation / edit form */}
                  <Collapse in={showPollForm} unmountOnExit>
                    <PollCreationForm
                      editingPoll={editingPollId ? polls.find((p) => p.id === editingPollId) : null}
                      onSave={handleSavePoll}
                      onCancel={() => { setShowPollForm(false); setEditingPollId(null); }}
                    />
                  </Collapse>

                  {/* Empty state */}
                  {polls.length === 0 && !showPollForm && (
                    <Box
                      sx={{
                        py: 3,
                        px: 2,
                        borderRadius: 2,
                        border: "1px dashed",
                        borderColor: "divider",
                        textAlign: "center",
                      }}
                    >
                      <PollOutlinedIcon sx={{ fontSize: 28, color: "text.disabled", mb: 0.5 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        No polls created yet
                      </Typography>
                      <Button
                        size="small"
                        variant="soft"
                        startIcon={<AddOutlinedIcon sx={{ fontSize: 14 }} />}
                        onClick={() => setShowPollForm(true)}
                      >
                        Create your first poll
                      </Button>
                    </Box>
                  )}
                </Stack>
              </Box>
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

            {(subType === "noFeedback" || subType === "completed" || subType === "combinedCompleted") && (
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

            {/* Feedback section (completed states) */}
            {isCompletedState && (
              <SectionBox>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
                  <StarOutlinedIcon sx={{ fontSize: 16, color: "var(--gl-star-color)" }} />
                  <Typography variant="subtitle2" fontWeight={600}>Feedback</Typography>
                </Stack>
                <Divider sx={{ mb: 0.5 }} />
                {(subType === "completed" || subType === "combinedCompleted") ? (
                  <>
                    <InfoRow label="Avg. rating">
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <StarOutlinedIcon sx={{ fontSize: 14, color: "var(--gl-star-color)" }} />
                        <Typography variant="body2" fontWeight={700}>4.5</Typography>
                        <Typography variant="caption" color="text.secondary">(24 responses)</Typography>
                      </Stack>
                    </InfoRow>
                    <Box sx={{ mt: 1 }}>
                      <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>
                        Detailed Feedback
                      </Button>
                    </Box>
                  </>
                ) : subType === "gathering" ? (
                  <InfoRow label="Status">
                    <Chip label="Gathering feedback" size="small" variant="outlined" sx={{ fontWeight: 500, fontSize: "0.75rem" }} />
                  </InfoRow>
                ) : (
                  <InfoRow label="Status">
                    <Chip label="No feedback collected" size="small" variant="outlined" sx={{ fontWeight: 500, fontSize: "0.75rem", opacity: 0.7 }} />
                  </InfoRow>
                )}
              </SectionBox>
            )}
          </Stack>
        </Box>

        {/* ── Sticky footer ── */}
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            zIndex: 10,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            px: 3,
            py: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <Button variant="text" color="inherit" onClick={onClose}>Close</Button>
          <Stack direction="row" spacing={1}>
            {isMentoring && isConfirmedState && (
              <Button variant="contained" size="small" startIcon={<LinkOutlinedIcon sx={{ fontSize: 16 }} />}>Join session</Button>
            )}
            {isCareer && isConfirmedState && (
              <Button variant="contained" size="small" startIcon={<LinkOutlinedIcon sx={{ fontSize: 16 }} />}>Join session</Button>
            )}
            {isScheduledState && (
              <>
                <Button variant="soft" size="small" startIcon={<DoNotDisturbOnOutlinedIcon sx={{ fontSize: 16 }} />}>I&apos;m unavailable</Button>
                <Button variant="contained" size="small" startIcon={<TaskAltOutlinedIcon sx={{ fontSize: 16 }} />}>Confirm</Button>
              </>
            )}
          </Stack>
        </Box>
      </Box>
    </Drawer>
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
            {/* Header: breadcrumb + status + title */}
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1, mb: 0.75 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ letterSpacing: "0.02em" }}>
                  PGP-AIML · Evaluation
                </Typography>
                {statusChip}
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
                <Typography variant="caption" color="primary.main" sx={{ cursor: "pointer", mt: 0.5, display: "inline-block", "&:hover": { textDecoration: "underline" } }}>
                  Reload
                </Typography>
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
            {/* Header: breadcrumb + status + title */}
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1, mb: 0.75 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ letterSpacing: "0.02em" }}>
                  PGP-AIML · Moderation
                </Typography>
                {statusChip}
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
                <Typography variant="caption" color="primary.main" sx={{ cursor: "pointer", mt: 0.5, display: "inline-block", "&:hover": { textDecoration: "underline" } }}>
                  Reload
                </Typography>
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
            {/* Header: breadcrumb + status + title */}
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1, mb: 0.75 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ letterSpacing: "0.02em" }}>
                  PGP-DS · Capstone
                </Typography>
                {statusChip}
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
            {/* Header: breadcrumb + status + title */}
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1, mb: 0.75 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ letterSpacing: "0.02em" }}>
                  PGP-AIML · CV Review
                </Typography>
                {statusChip}
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
        title="Residency — Confirmed (Combined session)"
        description="Multi-batch combined residency. Combined session chip on card. Combined batch details shown upfront."
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
          <CombinedBatchesPanel
            compact
            batches={[
              { batch: "AIML Online March 26 A" },
              { batch: "AIML Online Feb 26 B" },
            ]}
          />
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
        description="Residency done, no feedback yet. Payment pending + Gathering feedback chips top-right."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5, gap: 1 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>Residency: Program Overview (All)</Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
              {CHIP_PAYMENT_PENDING}
              {CHIP_GATHERING}
            </Stack>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">5 – 7 Mar, 2026 &bull; AIML Online March 26 A</Typography>
          </Stack>
          <Stack direction="row" justifyContent="flex-end">
            <Button variant="text" size="small" onClick={() => setDetailOpen("gathering")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Completed — with rating ── */}
      <ComponentSection
        title="Residency — Completed (with feedback)"
        description="Past residency with rating. Payment processed chip + star rating top-right. Detailed Feedback on card."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5, gap: 1 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>Residency: Program Overview (All)</Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
              {CHIP_PAYMENT_PROCESSED}
              <StarRatingNumeric rating={4.2} />
            </Stack>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">5 – 7 Mar, 2026 &bull; AIML Online March 26 A</Typography>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
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
      <ComponentSection title="Mentoring — Confirmed" description="Virtual mentoring event. Join event + View Session Material on card.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Statistics for Data Science"
            sessionType="Online session"
            onCourseClick={() => {}}
            batch="PGPDS.O.MAR26.A"
            dateYmd="2026-03-18"
            start={minutes(18)}
            end={minutes(20)}
            status={STATUS_CONFIRMED()}
            actions={
              <>
                <Button variant="contained" size="small" startIcon={<LinkOutlinedIcon sx={{ fontSize: 16 }} />}>Join online session</Button>
                <Button variant="soft" size="small" startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 16 }} />}>View Session Material</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("mentoring-confirmed")}>View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* 2. Mentoring — Combined (Confirmed) */}
      <ComponentSection title="Mentoring — Combined (Confirmed)" description="Combined session across batches. Combined session chip alongside Confirmed. Combined batch details shown upfront.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Statistics for Data Science"
            sessionType="Online session"
            onCourseClick={() => {}}
            batch="PGPDS.O.MAR26.A"
            dateYmd="2026-03-18"
            start={minutes(18)}
            end={minutes(20)}
            status={STATUS_CONFIRMED()}
            actions={
              <>
                <Button variant="contained" size="small" startIcon={<LinkOutlinedIcon sx={{ fontSize: 16 }} />}>Join online session</Button>
                <Button variant="soft" size="small" startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 16 }} />}>View Session Material</Button>
              </>
            }
            chips={["Combined session"]}
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("mentoring-combined")}>View details</Button>}
          />
          <CombinedBatchesPanel
            batches={[
              { batch: "PGPDS.O.MAR26.A", group: "Group 07" },
              { batch: "PGPDS.O.MAR26.B", group: "Group 03" },
            ]}
          />
        </Card>
      </ComponentSection>

      {/* 3. Mentoring — Scheduled */}
      <ComponentSection title="Mentoring — Scheduled" description="Unconfirmed mentoring event awaiting guru action.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Python Fundamentals"
            sessionType="Online session"
            onCourseClick={() => {}}
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

      {/* 3b. Mentoring — Combined (Scheduled) */}
      <ComponentSection title="Mentoring — Combined (Scheduled)" description="Unconfirmed combined event awaiting guru action. Combined batch details shown upfront.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Statistics for Data Science"
            sessionType="Online session"
            onCourseClick={() => {}}
            batch="PGPDS.O.MAR26.A"
            dateYmd="2026-03-20"
            start={minutes(18)}
            end={minutes(20)}
            status={STATUS_SCHEDULED}
            actions={
              <>
                <Button startIcon={<TaskAltOutlinedIcon sx={{ fontSize: 18 }} />} size="small" variant="contained">Confirm</Button>
                <Button startIcon={<DoNotDisturbOnOutlinedIcon sx={{ fontSize: 18 }} />} size="small" variant="soft">I&apos;m unavailable</Button>
              </>
            }
            chips={["Combined session"]}
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("mentoring-combinedScheduled")}>View details</Button>}
          />
          <CombinedBatchesPanel
            batches={[
              { batch: "PGPDS.O.MAR26.A", group: "Group 07" },
              { batch: "PGPDS.O.MAR26.B", group: "Group 03" },
            ]}
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
              <Button variant="contained" size="small" startIcon={<LinkOutlinedIcon sx={{ fontSize: 16 }} />}>Join online session</Button>
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
      <ComponentSection title="Mentoring — Completed (Gathering feedback)" description="Event done, learners haven't rated yet. Payment pending + Gathering feedback chips top-right. Watch recording on card.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Statistics for Data Science"
            sessionType="Online session"
            onCourseClick={() => {}}
            batch="PGPDS.O.MAR26.A"
            dateYmd="2026-03-12"
            start={minutes(18)}
            end={minutes(20)}
            topRight={
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                {CHIP_PAYMENT_PENDING}
                {CHIP_GATHERING}
              </Stack>
            }
            actions={
              <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Watch recording</Button>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("mentoring-gathering")}>View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* 7b. Mentoring — Completed (Recording processing) */}
      <ComponentSection title="Mentoring — Completed (Recording processing)" description="Session just ended, recording not yet processed. Watch recording button is disabled. Typically takes up to an hour.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Statistics for Data Science"
            sessionType="Online session"
            onCourseClick={() => {}}
            batch="PGPDS.O.MAR26.A"
            dateYmd="2026-03-12"
            start={minutes(18)}
            end={minutes(20)}
            topRight={
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                {CHIP_PAYMENT_PENDING}
                {CHIP_GATHERING}
              </Stack>
            }
            actions={
              <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />} disabled>
                Watch recording
              </Button>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("mentoring-gathering")}>View details</Button>}
          />
          <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: "block", fontStyle: "italic" }}>
            Recording is being processed and will be available shortly.
          </Typography>
        </Card>
      </ComponentSection>

      {/* 8. Mentoring — Completed (No feedback) */}
      <ComponentSection title="Mentoring — Completed (No feedback)" description="Event older than 30 days, no learner ratings. Payment processed + No feedback collected chips top-right.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Python Fundamentals"
            sessionType="Online session"
            onCourseClick={() => {}}
            batch="PGPDS.O.MAR26.A"
            dateYmd="2026-01-15"
            start={minutes(9, 30)}
            end={minutes(11)}
            topRight={
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                {CHIP_PAYMENT_PROCESSED}
                {CHIP_NO_FEEDBACK}
              </Stack>
            }
            actions={
              <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Watch recording</Button>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("mentoring-noFeedback")}>View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* 9. Mentoring — Completed (with rating) */}
      <ComponentSection title="Mentoring — Completed (with rating)" description="Past mentoring event. Payment processed chip + star rating top-right. Watch recording + Detailed Feedback on card.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Statistics for Data Science"
            sessionType="Online session"
            onCourseClick={() => {}}
            batch="PGPDS.O.MAR26.A"
            dateYmd="2026-03-05"
            start={minutes(18)}
            end={minutes(20)}
            topRight={
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                {CHIP_PAYMENT_PROCESSED}
                <StarRatingNumeric rating={4.5} />
              </Stack>
            }
            actions={
              <>
                <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Watch recording</Button>
                <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>Detailed Feedback</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("mentoring-completed")}>View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* 10. Mentoring — Combined (Completed) */}
      <ComponentSection title="Mentoring — Combined (Completed)" description="Combined session splits into separate cards per batch when completed — each batch has its own rating. Two cards shown below for Batch A and Batch B.">
        <CombinedCompletedGroup>
          {/* Batch A card */}
          <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
            <SessionCard
              title="Statistics for Data Science"
              sessionType="Online session"
              batch="PGPDS.O.MAR26.A"
              dateYmd="2026-03-05"
              start={minutes(18)}
              end={minutes(20)}
              topRight={
                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                  {CHIP_PAYMENT_PROCESSED}
                  <StarRatingNumeric rating={4.5} />
                </Stack>
              }
              actions={
                <>
                  <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Watch recording</Button>
                  <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>Detailed Feedback</Button>
                </>
              }
              chips={["Combined session"]}
              secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("mentoring-combinedCompleted")}>View details</Button>}
            />
          </Card>
          {/* Batch B card */}
          <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
            <SessionCard
              title="Statistics for Data Science"
              sessionType="Online session"
              batch="PGPDS.O.MAR26.B"
              dateYmd="2026-03-05"
              start={minutes(18)}
              end={minutes(20)}
              topRight={
                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                  {CHIP_PAYMENT_PROCESSED}
                  <StarRatingNumeric rating={3.8} />
                </Stack>
              }
              actions={
                <>
                  <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Watch recording</Button>
                  <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>Detailed Feedback</Button>
                </>
              }
              chips={["Combined session"]}
              secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("mentoring-combinedCompleted")}>View details</Button>}
            />
          </Card>
        </CombinedCompletedGroup>
      </ComponentSection>

      {/* 12. Mock Interview — Completed */}
      <ComponentSection title="Mock Interview — Completed" description="Past mock interview. Payment processed chip + star rating top-right. Watch recording + Detailed Feedback + Share Feedback.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Mock Interview"
            sessionType="Career mentoring session"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-02-25"
            start={minutes(16)}
            end={minutes(17)}
            topRight={
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                {CHIP_PAYMENT_PROCESSED}
                <StarRatingNumeric rating={4.2} />
              </Stack>
            }
            actions={
              <>
                <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Watch recording</Button>
                <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>Detailed Feedback</Button>
                <Button variant="soft" size="small" startIcon={<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 14 }} />}>Share Feedback</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("mock-completed")}>View details</Button>}
          />
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
              <Button variant="contained" size="small" startIcon={<LinkOutlinedIcon sx={{ fontSize: 16 }} />}>Join online session</Button>
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
      <ComponentSection title="Career — Completed (Gathering feedback)" description="Event done, no ratings yet. Payment pending + Gathering feedback chips top-right.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Career Mentoring"
            sessionType="Career mentoring session"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-03-10"
            start={minutes(14)}
            end={minutes(15)}
            topRight={
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                {CHIP_PAYMENT_PENDING}
                {CHIP_GATHERING}
              </Stack>
            }
            actions={
              <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Watch recording</Button>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("career-gathering")}>View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* 5. Career — Completed (with rating) */}
      <ComponentSection title="Career — Completed (with rating)" description="Past career event. Payment processed chip + star rating top-right. Detailed Feedback on card.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Career Mentoring"
            sessionType="Career mentoring session"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-02-20"
            start={minutes(14)}
            end={minutes(15)}
            topRight={
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                {CHIP_PAYMENT_PROCESSED}
                <StarRatingNumeric rating={4.8} />
              </Stack>
            }
            actions={
              <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>Detailed Feedback</Button>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("career-completed")}>View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* 6. Mock — Completed (with Share Feedback) */}
      <ComponentSection title="Mock — Completed (with Share Feedback)" description="Past mock interview. Payment processed chip + star rating top-right. Watch recording + Detailed Feedback + Share Feedback.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Mock Interview"
            sessionType="Career mentoring session"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-02-18"
            start={minutes(16)}
            end={minutes(17)}
            topRight={
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                {CHIP_PAYMENT_PROCESSED}
                <StarRatingNumeric rating={4.0} />
              </Stack>
            }
            actions={
              <>
                <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Watch recording</Button>
                <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>Detailed Feedback</Button>
                <Button variant="soft" size="small" startIcon={<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 14 }} />}>Share Feedback</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => setDetailOpen("mock-completed")}>View details</Button>}
          />
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
        description="Date range (assessment due → grading due), assignment link to SpeedGrader, course template, batch, contact, student progress. Late submission badge if applicable."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>Evaluation: Linear Regression Assignment</Typography>
            <Stack direction="row" spacing={0.75}>
              <Chip label="Late submission" size="small" sx={{ bgcolor: "var(--gl-status-declined-bg)", color: "var(--gl-status-declined-text)", border: "1px solid var(--gl-status-declined-border)", fontWeight: 500, fontSize: "0.75rem" }} />
              {CHIP_CONFIRMED}
            </Stack>
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
        description="Grading done, no ratings yet. Payment pending + Gathering feedback chips top-right."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5, gap: 1 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>Evaluation: Linear Regression Assignment</Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
              {CHIP_PAYMENT_PENDING}
              {CHIP_GATHERING}
            </Stack>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">8 Mar – 15 Mar, 2026 &bull; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Stack direction="row" justifyContent="flex-end">
            <Button variant="text" size="small" onClick={() => setDetailOpen("gathering")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Completed — with rating ── */}
      <ComponentSection
        title="Evaluation — Completed (with rating)"
        description="Star icons only (no numeric score). Payment processed chip + star rating top-right. Detailed Feedback button."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5, gap: 1 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>Evaluation: Linear Regression Assignment</Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
              {CHIP_PAYMENT_PROCESSED}
              <StarRatingNumeric rating={4.0} />
            </Stack>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">1 Mar – 8 Mar, 2026 &bull; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
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
        description="Moderation done, no ratings yet. Payment pending + Gathering feedback chips top-right."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5, gap: 1 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>Moderation: Impact of AI on Healthcare</Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
              {CHIP_PAYMENT_PENDING}
              {CHIP_GATHERING}
            </Stack>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">8 Mar – 15 Mar, 2026 &bull; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Stack direction="row" justifyContent="flex-end">
            <Button variant="text" size="small" onClick={() => setDetailOpen("gathering")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Completed — with rating ── */}
      <ComponentSection
        title="Moderation — Completed (with rating)"
        description="Star icons only (no numeric score). Payment processed chip + star rating top-right. Detailed Feedback button."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5, gap: 1 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>Moderation: Impact of AI on Healthcare</Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
              {CHIP_PAYMENT_PROCESSED}
              <StarRatingNumeric rating={4.5} />
            </Stack>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">25 Feb – 5 Mar, 2026 &bull; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
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
        description="No rating for capstones. Payment pending chip top-right. View Student Progress button always shown."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5, gap: 1 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>Capstone &mdash; PGPDS.O.JUL25.A</Typography>
            {CHIP_PAYMENT_PENDING}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">15 Jul – 20 Nov, 2025</Typography>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
            <Button variant="soft" size="small" startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 14 }} />}>View Student Progress</Button>
            <Button variant="text" size="small" onClick={() => setDetailOpen("paymentPending")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Completed — payment processed ── */}
      <ComponentSection
        title="Capstone Project — Completed"
        description="No rating. Payment processed chip top-right. View Student Progress always shown."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5, gap: 1 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>Capstone &mdash; PGPDS.O.JUL25.A</Typography>
            {CHIP_PAYMENT_PROCESSED}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">15 Jul – 20 Nov, 2025</Typography>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
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
        description="No LinkedIn, no comments, no submit. 'View CV' becomes 'View Reviewed CV'. Payment processed chip top-right. No rating, no feedback."
      >
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5, gap: 1 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem" }}>CV Review</Typography>
            {CHIP_PAYMENT_PROCESSED}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">5 Mar, 2026 &bull; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
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
