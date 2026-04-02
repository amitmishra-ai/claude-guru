import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import RemoveCircleOutlineOutlinedIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import MuiTooltip from "@mui/material/Tooltip";
import Drawer from "@mui/material/Drawer";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
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
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import { SessionCard, STATUS_SCHEDULED, STATUS_CONFIRMED, STATUS_DECLINED } from "@/components/shared/SessionCard";
import { minutes, fmtDateNice, fmtTime12 } from "@/lib/helpers";
import { useAppSelector, useAppDispatch } from "@/store";
import { setSessionFocus } from "@/store/slices/sessionsSlice";
import { setOpenSessionDetails, setOpenCompletedSession } from "@/store/slices/uiSlice";
import type { GuruRole } from "@/store/slices/devPanelSlice";
import type { Poll } from "@/lib/types";
import {
  demoMentoringConfirmed,
  demoMentoringCombinedConfirmed,
  demoMentoringScheduled,
  demoMentoringCombinedScheduled,
  demoMentoringCompletedGathering,
  demoMentoringCompletedNoFeedback,
  demoMentoringCompletedWithRating,
  demoMentoringCombinedCompleted,
  demoCareerConfirmed,
  demoCareerScheduled,
  demoCareerCompletedGathering,
  demoCareerCompletedWithRating,
  demoMockConfirmed,
  demoMockCompleted,
  demoResidencyConfirmed,
  demoResidencyCombined,
  demoResidencyScheduled,
  demoResidencyCompletedGathering,
  demoResidencyCompletedWithRating,
} from "./demo-component-sessions";

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

/** Card title row -chips on top on mobile, beside title on desktop */
function CardTitleRow({ title, chips }: { title: string; chips: React.ReactNode }) {
  return (
    <>
      <Box sx={{ display: { xs: "flex", sm: "none" }, gap: 0.75, mb: 0.75, flexWrap: "wrap" }}>{chips}</Box>
      <Typography variant="h6" fontWeight={600} sx={{ display: { xs: "block", sm: "none" }, fontSize: "0.875rem", mb: 0.5 }}>{title}</Typography>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ display: { xs: "none", sm: "flex" }, mb: 0.5, gap: 1 }}>
        <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem", minWidth: 0 }}>{title}</Typography>
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexShrink: 0 }}>{chips}</Stack>
      </Stack>
    </>
  );
}

/* ── Star rating row (numeric + stars) for Residency & Online Session ── */

function StarRatingNumeric({ rating }: { rating: number }) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center" className="star-rating-numeric" sx={{ flexShrink: 0 }}>
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
          borderRadius: "8px",
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
    <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
      {/* Mobile: chip on top */}
      <Box sx={{ display: { xs: "block", sm: "none" }, mb: 0.75 }}>
        {CHIP_TO_BE_CONFIRMED}
      </Box>
      <Typography variant="h6" fontWeight={600} sx={{ display: { xs: "block", sm: "none" }, fontSize: "0.875rem", mb: 0.5 }}>
        {sessionType}: {title}
      </Typography>
      {/* Desktop: chip beside title */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ display: { xs: "none", sm: "flex" }, mb: 0.5 }}>
        <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem", minWidth: 0 }}>
          {sessionType}: {title}
        </Typography>
        {CHIP_TO_BE_CONFIRMED}
      </Stack>
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary" }}>
        <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
        <Typography variant="caption" color="text.secondary">
          {fmtDateNice(startDateYmd)} &ndash; {fmtDateNice(endDateYmd)} &middot; {batch}
        </Typography>
      </Stack>
      {/* Desktop: text button */}
      {onViewDetails && (
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1, display: { xs: "none", sm: "flex" } }}>
          <Button variant="text" size="small" onClick={onViewDetails}>View details</Button>
        </Stack>
      )}
      {/* Mobile: full-width row */}
      {onViewDetails && (
        <Box
          onClick={onViewDetails}
          sx={{
            display: { xs: "flex", sm: "none" },
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
            mx: -2,
            mb: -2,
            px: 2,
            py: "10px",
            cursor: "pointer",
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "action.hover",
            borderRadius: { xs: "0 0 12px 12px", sm: "0 0 12px 12px" },
            "&:hover": { bgcolor: "action.selected" },
            transition: "background-color 0.15s",
          }}
        >
          <Typography variant="caption" fontWeight={600} sx={{ fontSize: "0.75rem" }}>View details</Typography>
          <ChevronRightIcon sx={{ fontSize: 18, color: "text.secondary" }} />
        </Box>
      )}
    </Card>
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
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ "& .MuiDrawer-paper": { width: { xs: "100vw", sm: 480 }, maxWidth: "100vw", boxShadow: "-4px 0 24px rgba(0,0,0,0.06)", borderLeft: "1px solid", borderColor: "divider" } }}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* ── Sticky header ── */}
        <Box sx={{ position: "sticky", top: 0, zIndex: 10, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", px: 2.5, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.8125rem" }}>Event details</Typography>
            <Chip label="To be confirmed" size="small" sx={{ fontWeight: 600, fontSize: "0.7rem", height: 22, bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)" }} />
          </Stack>
          <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}><CloseOutlinedIcon sx={{ fontSize: 16 }} /></IconButton>
        </Box>

        {/* ── Scrollable content ── */}
        <Box className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto" }}>
          {/* ═══ HERO ═══ */}
          <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ letterSpacing: "0.02em", mb: 0.5, display: "block" }}>
              {sessionType}
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.05rem", lineHeight: 1.3 }}>{title}</Typography>

            {/* Schedule at-a-glance card */}
            <Box sx={{ mt: 2, p: 1.75, borderRadius: "12px", bgcolor: "hsl(var(--md-surface-container) / 0.5)", border: "1px solid", borderColor: "divider" }}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "hsl(var(--md-primary-container))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: "hsl(var(--md-on-primary-container))" }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={700} sx={{ fontSize: "0.875rem", lineHeight: 1.2 }}>
                      {fmtDateNice(startDateYmd)} &ndash; {fmtDateNice(endDateYmd)}
                    </Typography>
                    <Typography variant="caption" color="var(--gl-status-pending-text)" fontWeight={500}>Time to be confirmed</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "hsl(var(--md-surface-container))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <MailOutlineIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.8125rem", lineHeight: 1.2 }}>{contactEmail}</Typography>
                    <Typography variant="caption" color="text.secondary">Program contact</Typography>
                  </Box>
                </Stack>
              </Stack>
            </Box>
          </Box>

          <Divider />

          {/* ═══ DETAIL SECTIONS ═══ */}
          <Stack spacing={0} sx={{ px: 2.5, py: 2 }}>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ fontSize: "0.65rem", letterSpacing: "0.08em", mb: 1, display: "block" }}>Details</Typography>
              <Box sx={{ borderRadius: "8px", border: 1, borderColor: "divider", bgcolor: "hsl(var(--md-surface))", p: 2 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ py: 0.875 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Batch</Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }}>{batch}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" sx={{ py: 0.875 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Program</Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }}>{program}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" sx={{ py: 0.875 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Contact</Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }} component="div">
                    <Stack direction="row" alignItems="center" spacing={0.5}><MailOutlineIcon sx={{ fontSize: 13 }} /><span>{contactEmail}</span></Stack>
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* ── Sticky footer ── */}
        <Box sx={{ position: "sticky", bottom: 0, zIndex: 10, borderTop: 1, borderColor: "divider", bgcolor: "background.paper", px: 2.5, py: 1.5, display: "flex", justifyContent: "flex-end", gap: 1, flexShrink: 0 }}>
          <Button variant="text" color="inherit" size="small" onClick={onClose}>Close</Button>
        </Box>
      </Box>
    </Drawer>
  );
}


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
        borderRadius: "8px",
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
                borderRadius: "8px",
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
        borderRadius: "8px",
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

/* ── Evaluation View Details Dialog ── */

type EvalDialogVariant = "confirmed" | "tentative" | "gathering" | "completed";

function EvaluationDetailDialog({ open, onClose, variant }: { open: boolean; onClose: () => void; variant: EvalDialogVariant }) {
  const isConfirmed = variant === "confirmed";
  const isTentative = variant === "tentative";
  const isCompleted = variant === "completed";
  const isGathering = variant === "gathering";

  const statusLabel = isConfirmed ? "Confirmed" : isTentative ? "To be confirmed" : "Completed";
  const statusSx = isTentative
    ? { bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)" }
    : { bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)" };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ "& .MuiDrawer-paper": { width: { xs: "100vw", sm: 480 }, maxWidth: "100vw", boxShadow: "-4px 0 24px rgba(0,0,0,0.06)", borderLeft: "1px solid", borderColor: "divider" } }}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* ── Sticky header ── */}
        <Box sx={{ position: "sticky", top: 0, zIndex: 10, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", px: 2.5, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.8125rem" }}>Event details</Typography>
            <Chip label={statusLabel} size="small" sx={{ fontWeight: 600, fontSize: "0.7rem", height: 22, ...statusSx }} />
          </Stack>
          <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}><CloseOutlinedIcon sx={{ fontSize: 16 }} /></IconButton>
        </Box>

        {/* ── Scrollable content ── */}
        <Box className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto" }}>
          {/* ═══ HERO ═══ */}
          <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ letterSpacing: "0.02em", mb: 0.5, display: "block" }}>
              PGP-AIML · Evaluation
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.05rem", lineHeight: 1.3 }}>
              Linear Regression Assignment
            </Typography>

            {/* Schedule at-a-glance card */}
            <Box sx={{ mt: 2, p: 1.75, borderRadius: "12px", bgcolor: "hsl(var(--md-surface-container) / 0.5)", border: "1px solid", borderColor: "divider" }}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "hsl(var(--md-primary-container))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: "hsl(var(--md-on-primary-container))" }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={700} sx={{ fontSize: "0.875rem", lineHeight: 1.2 }}>
                      {isTentative ? "1 Apr, 2026" : "15 Mar, 2026"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>Assessment due</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "hsl(var(--md-surface-container))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.8125rem", lineHeight: 1.2 }}>
                      {isTentative ? "10 Apr, 2026" : "22 Mar, 2026"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Grading due</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "hsl(var(--md-surface-container))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <GroupOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.8125rem", lineHeight: 1.2 }}>PGP-AIML-BA-UTA-Nov25-C</Typography>
                    <Typography variant="caption" color="text.secondary">Batch</Typography>
                  </Box>
                </Stack>
              </Stack>
            </Box>
          </Box>

          <Divider />

          {/* ═══ DETAIL SECTIONS ═══ */}
          <Stack spacing={0} sx={{ px: 2.5, py: 2 }}>
            {/* ── Details ── */}
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ fontSize: "0.65rem", letterSpacing: "0.08em", mb: 1, display: "block" }}>Details</Typography>
              <Box sx={{ borderRadius: "8px", border: 1, borderColor: "divider", bgcolor: "hsl(var(--md-surface))", p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 0.875 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, minWidth: 100, fontSize: "0.8125rem" }}>Assignment</Typography>
                  <Box sx={{ textAlign: "right" }}>
                    {isConfirmed || isCompleted || isGathering ? (
                      <Typography variant="body2" component="a" href="#" sx={{ color: "primary.main", textDecoration: "none", fontWeight: 500, fontSize: "0.8125rem", "&:hover": { textDecoration: "underline" } }}>
                        Open in SpeedGrader <OpenInNewOutlinedIcon sx={{ fontSize: 10, verticalAlign: "middle" }} />
                      </Typography>
                    ) : (
                      <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }}>Linear Regression Assignment</Typography>
                    )}
                  </Box>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 0.875 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Course template</Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }}>Applied Statistics</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 0.875 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Contact</Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }} component="div">
                    <Stack direction="row" alignItems="center" spacing={0.5}><MailOutlineIcon sx={{ fontSize: 13 }} /><span>gurus_support@greatlearning.in</span></Stack>
                  </Typography>
                </Stack>
              </Box>
            </Box>

            {/* ── Student Progress (confirmed / tentative) ── */}
            {(isConfirmed || isTentative) && (
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ fontSize: "0.65rem", letterSpacing: "0.08em", mb: 1, display: "block" }}>Student Progress</Typography>
                <Box sx={{ borderRadius: "8px", border: 1, borderColor: "divider", bgcolor: "hsl(var(--md-surface))", p: 2 }}>
                  {isTentative ? (
                    <Typography variant="body2" color="var(--gl-status-pending-text)" fontWeight={500} sx={{ py: 0.5 }}>To be confirmed</Typography>
                  ) : (
                    <>
                      <Stack direction="row" justifyContent="space-between" sx={{ py: 0.875 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Submissions</Typography>
                        <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }}>42 / 63</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" sx={{ py: 0.875 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Graded</Typography>
                        <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }}>18 / 42</Typography>
                      </Stack>
                      <Typography variant="caption" color="primary.main" sx={{ cursor: "pointer", mt: 0.5, display: "inline-block", "&:hover": { textDecoration: "underline" } }}>Reload</Typography>
                    </>
                  )}
                </Box>
              </Box>
            )}

            {/* ── Feedback (gathering / completed) ── */}
            {(isGathering || isCompleted) && (
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ fontSize: "0.65rem", letterSpacing: "0.08em", mb: 1, display: "block" }}>Feedback</Typography>
                <Box sx={{ borderRadius: "8px", border: 1, borderColor: "divider", bgcolor: "hsl(var(--md-surface))", p: 2 }}>
                  {isGathering ? (
                    <Typography variant="body2" fontWeight={500} sx={{ py: 0.5 }}>Gathering feedback</Typography>
                  ) : (
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.875 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Rating</Typography>
                      <StarRatingIcons rating={4} />
                    </Stack>
                  )}
                </Box>
              </Box>
            )}

            {/* ── Remuneration (gathering / completed) ── */}
            {(isGathering || isCompleted) && (
              <Box sx={{ mb: 2.5 }}>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
                  <SavingsOutlinedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                  <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}>Remuneration</Typography>
                </Stack>
                <Box sx={{ borderRadius: "8px", border: 1, borderColor: "divider", bgcolor: "hsl(var(--md-surface))", p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 0.875 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Status</Typography>
                    {isGathering
                      ? <Chip label="Payment Pending" size="small" sx={{ bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)", fontWeight: 600 }} />
                      : <Chip label="Payment Processed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }} />
                    }
                  </Stack>
                  {isCompleted && (
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 0.875 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Transaction ID</Typography>
                      <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem", fontFamily: "monospace" }}>TXN-GL-5E1M3N</Typography>
                    </Stack>
                  )}
                </Box>
              </Box>
            )}
          </Stack>
        </Box>

        {/* ── Sticky footer ── */}
        <Box sx={{ position: "sticky", bottom: 0, zIndex: 10, borderTop: 1, borderColor: "divider", bgcolor: "background.paper", px: 2.5, py: 1.5, display: "flex", justifyContent: "flex-end", gap: 1, flexShrink: 0 }}>
          <Button variant="text" color="inherit" size="small" onClick={onClose}>Close</Button>
        </Box>
      </Box>
    </Drawer>
  );
}

/* ── Moderation View Details Dialog ── */

type ModDialogVariant = "confirmed" | "tentative" | "gathering" | "completed";

function ModerationDetailDialog({ open, onClose, variant }: { open: boolean; onClose: () => void; variant: ModDialogVariant }) {
  const isConfirmed = variant === "confirmed";
  const isTentative = variant === "tentative";
  const isCompleted = variant === "completed";
  const isGathering = variant === "gathering";

  const statusLabel = isConfirmed ? "Confirmed" : isTentative ? "To be confirmed" : "Completed";
  const statusSx = isTentative
    ? { bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)" }
    : { bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)" };
  const dqTitle = isTentative ? "Ethics in Machine Learning" : "Impact of AI on Healthcare";

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ "& .MuiDrawer-paper": { width: { xs: "100vw", sm: 480 }, maxWidth: "100vw", boxShadow: "-4px 0 24px rgba(0,0,0,0.06)", borderLeft: "1px solid", borderColor: "divider" } }}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* ── Sticky header ── */}
        <Box sx={{ position: "sticky", top: 0, zIndex: 10, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", px: 2.5, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.8125rem" }}>Event details</Typography>
            <Chip label={statusLabel} size="small" sx={{ fontWeight: 600, fontSize: "0.7rem", height: 22, ...statusSx }} />
          </Stack>
          <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}><CloseOutlinedIcon sx={{ fontSize: 16 }} /></IconButton>
        </Box>

        {/* ── Scrollable content ── */}
        <Box className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto" }}>
          {/* ═══ HERO ═══ */}
          <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ letterSpacing: "0.02em", mb: 0.5, display: "block" }}>
              PGP-AIML · Moderation
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.05rem", lineHeight: 1.3 }}>{dqTitle}</Typography>

            {/* Schedule at-a-glance card */}
            <Box sx={{ mt: 2, p: 1.75, borderRadius: "12px", bgcolor: "hsl(var(--md-surface-container) / 0.5)", border: "1px solid", borderColor: "divider" }}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "hsl(var(--md-primary-container))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: "hsl(var(--md-on-primary-container))" }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={700} sx={{ fontSize: "0.875rem", lineHeight: 1.2 }}>{isTentative ? "5 Apr, 2026" : "15 Mar, 2026"}</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>Moderation start</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "hsl(var(--md-surface-container))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.8125rem", lineHeight: 1.2 }}>{isTentative ? "12 Apr, 2026" : "20 Mar, 2026"}</Typography>
                    <Typography variant="caption" color="text.secondary">Concluding remark due</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "hsl(var(--md-surface-container))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.8125rem", lineHeight: 1.2 }}>{isTentative ? "15 Apr, 2026" : "22 Mar, 2026"}</Typography>
                    <Typography variant="caption" color="text.secondary">Grading due</Typography>
                  </Box>
                </Stack>
              </Stack>
            </Box>
          </Box>

          <Divider />

          {/* ═══ DETAIL SECTIONS ═══ */}
          <Stack spacing={0} sx={{ px: 2.5, py: 2 }}>
            {/* ── Details ── */}
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ fontSize: "0.65rem", letterSpacing: "0.08em", mb: 1, display: "block" }}>Details</Typography>
              <Box sx={{ borderRadius: "8px", border: 1, borderColor: "divider", bgcolor: "hsl(var(--md-surface))", p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 0.875 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, minWidth: 100, fontSize: "0.8125rem" }}>Discussion Question</Typography>
                  <Box sx={{ textAlign: "right" }}>
                    {isConfirmed || isCompleted || isGathering ? (
                      <Typography variant="body2" component="a" href="#" sx={{ color: "primary.main", textDecoration: "none", fontWeight: 500, fontSize: "0.8125rem", "&:hover": { textDecoration: "underline" } }}>
                        Open in SpeedGrader <OpenInNewOutlinedIcon sx={{ fontSize: 10, verticalAlign: "middle" }} />
                      </Typography>
                    ) : (
                      <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }}>{dqTitle}</Typography>
                    )}
                  </Box>
                </Stack>
                <Stack direction="row" justifyContent="space-between" sx={{ py: 0.875 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Course template</Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }}>Applied Ethics in AI</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" sx={{ py: 0.875 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Contact</Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }} component="div">
                    <Stack direction="row" alignItems="center" spacing={0.5}><MailOutlineIcon sx={{ fontSize: 13 }} /><span>gurus_support@greatlearning.in</span></Stack>
                  </Typography>
                </Stack>
              </Box>
            </Box>

            {/* ── Student Response Progress (confirmed / tentative) ── */}
            {(isConfirmed || isTentative) && (
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ fontSize: "0.65rem", letterSpacing: "0.08em", mb: 1, display: "block" }}>Student Response Progress</Typography>
                <Box sx={{ borderRadius: "8px", border: 1, borderColor: "divider", bgcolor: "hsl(var(--md-surface))", p: 2 }}>
                  {isTentative ? (
                    <Typography variant="body2" color="var(--gl-status-pending-text)" fontWeight={500} sx={{ py: 0.5 }}>To be confirmed</Typography>
                  ) : (
                    <>
                      <Stack direction="row" justifyContent="space-between" sx={{ py: 0.875 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Posts</Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.8125rem", color: "success.main" }}>87</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" sx={{ py: 0.875 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Posts unread</Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.8125rem", color: "success.main" }}>12</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" sx={{ py: 0.875 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Graded</Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.8125rem", color: "success.main" }}>54 / 63</Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>Green = guru replied within 30 hrs. Turns red if inactive.</Typography>
                      <Typography variant="caption" color="primary.main" sx={{ cursor: "pointer", mt: 0.5, display: "inline-block", "&:hover": { textDecoration: "underline" } }}>Reload</Typography>
                    </>
                  )}
                </Box>
              </Box>
            )}

            {/* ── Feedback (gathering / completed) ── */}
            {(isGathering || isCompleted) && (
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ fontSize: "0.65rem", letterSpacing: "0.08em", mb: 1, display: "block" }}>Feedback</Typography>
                <Box sx={{ borderRadius: "8px", border: 1, borderColor: "divider", bgcolor: "hsl(var(--md-surface))", p: 2 }}>
                  {isGathering ? (
                    <Typography variant="body2" fontWeight={500} sx={{ py: 0.5 }}>Gathering feedback</Typography>
                  ) : (
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.875 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Rating</Typography>
                      <StarRatingIcons rating={5} />
                    </Stack>
                  )}
                </Box>
              </Box>
            )}

            {/* ── Remuneration (gathering / completed) ── */}
            {(isGathering || isCompleted) && (
              <Box sx={{ mb: 2.5 }}>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
                  <SavingsOutlinedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                  <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}>Remuneration</Typography>
                </Stack>
                <Box sx={{ borderRadius: "8px", border: 1, borderColor: "divider", bgcolor: "hsl(var(--md-surface))", p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 0.875 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Status</Typography>
                    {isGathering
                      ? <Chip label="Payment Pending" size="small" sx={{ bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)", fontWeight: 600 }} />
                      : <Chip label="Payment Processed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }} />
                    }
                  </Stack>
                  {isCompleted && (
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 0.875 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Transaction ID</Typography>
                      <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem", fontFamily: "monospace" }}>TXN-GL-9K4R2L</Typography>
                    </Stack>
                  )}
                </Box>
              </Box>
            )}
          </Stack>
        </Box>

        {/* ── Sticky footer ── */}
        <Box sx={{ position: "sticky", bottom: 0, zIndex: 10, borderTop: 1, borderColor: "divider", bgcolor: "background.paper", px: 2.5, py: 1.5, display: "flex", justifyContent: "flex-end", gap: 1, flexShrink: 0 }}>
          <Button variant="text" color="inherit" size="small" onClick={onClose}>Close</Button>
        </Box>
      </Box>
    </Drawer>
  );
}

/* ── Capstone View Details Dialog ── */

type CapstoneDialogVariant = "confirmed" | "paymentPending" | "completed";

function CapstoneDetailDialog({ open, onClose, variant }: { open: boolean; onClose: () => void; variant: CapstoneDialogVariant }) {
  const isConfirmed = variant === "confirmed";
  const isCompleted = variant === "completed";
  const isPaymentPending = variant === "paymentPending";
  const isPast = isCompleted || isPaymentPending;

  const statusLabel = isPast ? "Completed" : "Confirmed";
  const statusSx = { bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)" };
  const batchName = isPast ? "PGPDS.O.JUL25.A" : "PGPDS.O.MAR26.A";
  const groupName = isPast ? "Team Beta" : "Team Alpha";
  const domain = isPast ? "Computer Vision" : "NLP";

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ "& .MuiDrawer-paper": { width: { xs: "100vw", sm: 480 }, maxWidth: "100vw", boxShadow: "-4px 0 24px rgba(0,0,0,0.06)", borderLeft: "1px solid", borderColor: "divider" } }}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* ── Sticky header ── */}
        <Box sx={{ position: "sticky", top: 0, zIndex: 10, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", px: 2.5, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.8125rem" }}>Event details</Typography>
            <Chip label={statusLabel} size="small" sx={{ fontWeight: 600, fontSize: "0.7rem", height: 22, ...statusSx }} />
          </Stack>
          <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}><CloseOutlinedIcon sx={{ fontSize: 16 }} /></IconButton>
        </Box>

        {/* ── Scrollable content ── */}
        <Box className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto" }}>
          {/* ═══ HERO ═══ */}
          <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ letterSpacing: "0.02em", mb: 0.5, display: "block" }}>
              PGP-DS · Capstone
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.05rem", lineHeight: 1.3 }}>
              Capstone &mdash; {batchName}
            </Typography>

            {/* Schedule at-a-glance card */}
            <Box sx={{ mt: 2, p: 1.75, borderRadius: "12px", bgcolor: "hsl(var(--md-surface-container) / 0.5)", border: "1px solid", borderColor: "divider" }}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "hsl(var(--md-primary-container))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: "hsl(var(--md-on-primary-container))" }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={700} sx={{ fontSize: "0.875rem", lineHeight: 1.2 }}>15 Jan &ndash; 20 Apr, 2026</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>Start &rarr; Presentation</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "hsl(var(--md-surface-container))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <GroupOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.8125rem", lineHeight: 1.2 }}>{groupName} &middot; {domain}</Typography>
                    <Typography variant="caption" color="text.secondary">Group &middot; Domain</Typography>
                  </Box>
                </Stack>
                {isConfirmed && (
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "hsl(var(--md-surface-container))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <AccessTimeOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.8125rem", lineHeight: 1.2 }}>20 Mar, 2026</Typography>
                      <Typography variant="caption" color="text.secondary">Next session</Typography>
                    </Box>
                  </Stack>
                )}
              </Stack>
            </Box>
          </Box>

          <Divider />

          {/* ═══ DETAIL SECTIONS ═══ */}
          <Stack spacing={0} sx={{ px: 2.5, py: 2 }}>
            {/* ── Milestones ── */}
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ fontSize: "0.65rem", letterSpacing: "0.08em", mb: 1, display: "block" }}>Milestones</Typography>
              <Box sx={{ borderRadius: "8px", border: 1, borderColor: "divider", bgcolor: "hsl(var(--md-surface))", p: 2 }}>
                {[
                  { label: "Start", date: "15 Jan, 2026" },
                  { label: "Synopsis", date: "5 Feb, 2026" },
                  { label: "Interim", date: "1 Mar, 2026" },
                  { label: "Final", date: "10 Apr, 2026" },
                  { label: "Presentation", date: "20 Apr, 2026" },
                ].map((m) => (
                  <Stack key={m.label} direction="row" justifyContent="space-between" sx={{ py: 0.875 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>{m.label}</Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }}>{m.date}</Typography>
                  </Stack>
                ))}
              </Box>
            </Box>

            {/* ── Details ── */}
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ fontSize: "0.65rem", letterSpacing: "0.08em", mb: 1, display: "block" }}>Details</Typography>
              <Box sx={{ borderRadius: "8px", border: 1, borderColor: "divider", bgcolor: "hsl(var(--md-surface))", p: 2 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ py: 0.875 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Batch</Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }}>{batchName}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" sx={{ py: 0.875 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Group</Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }}>{groupName}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" sx={{ py: 0.875 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Domain</Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }}>{domain}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" sx={{ py: 0.875 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Contact</Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }} component="div">
                    <Stack direction="row" alignItems="center" spacing={0.5}><MailOutlineIcon sx={{ fontSize: 13 }} /><span>gurus_support@greatlearning.in</span></Stack>
                  </Typography>
                </Stack>
              </Box>
            </Box>

            {/* ── Remuneration (completed variants) ── */}
            {(isPaymentPending || isCompleted) && (
              <Box sx={{ mb: 2.5 }}>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
                  <SavingsOutlinedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                  <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}>Remuneration</Typography>
                </Stack>
                <Box sx={{ borderRadius: "8px", border: 1, borderColor: "divider", bgcolor: "hsl(var(--md-surface))", p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 0.875 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Status</Typography>
                    {isPaymentPending
                      ? <Chip label="Payment Pending" size="small" sx={{ bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)", fontWeight: 600 }} />
                      : <Chip label="Payment Processed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }} />
                    }
                  </Stack>
                  {isCompleted && (
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 0.875 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Transaction ID</Typography>
                      <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem", fontFamily: "monospace" }}>TXN-GL-3C7W1P</Typography>
                    </Stack>
                  )}
                </Box>
              </Box>
            )}
          </Stack>
        </Box>

        {/* ── Sticky footer ── */}
        <Box sx={{ position: "sticky", bottom: 0, zIndex: 10, borderTop: 1, borderColor: "divider", bgcolor: "background.paper", px: 2.5, py: 1.5, display: "flex", justifyContent: "flex-end", gap: 1, flexShrink: 0 }}>
          <Button variant="soft" size="small" startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 16 }} />}>Progress</Button>
          {isConfirmed && (
            <Button variant="soft" size="small" startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 16 }} />}>Group Details (LMS)</Button>
          )}
          <Button variant="text" color="inherit" size="small" onClick={onClose}>Close</Button>
        </Box>
      </Box>
    </Drawer>
  );
}

/* ── CV Review View Details Dialog ── */

type CVReviewDialogVariant = "confirmed" | "confirmed-submitted" | "completed";

function CVReviewDetailDialog({ open, onClose, variant }: { open: boolean; onClose: () => void; variant: CVReviewDialogVariant }) {
  const isConfirmed = variant === "confirmed" || variant === "confirmed-submitted";
  const isSubmitted = variant === "confirmed-submitted";
  const isCompleted = variant === "completed";

  const statusLabel = isCompleted ? "Completed" : "Confirmed";
  const statusSx = { bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)" };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ "& .MuiDrawer-paper": { width: { xs: "100vw", sm: 480 }, maxWidth: "100vw", boxShadow: "-4px 0 24px rgba(0,0,0,0.06)", borderLeft: "1px solid", borderColor: "divider" } }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* ── Sticky header ── */}
        <Box sx={{ position: "sticky", top: 0, zIndex: 10, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", px: 2.5, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.8125rem" }}>Event details</Typography>
            <Chip label={statusLabel} size="small" sx={{ fontWeight: 600, fontSize: "0.7rem", height: 22, ...statusSx }} />
          </Stack>
          <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}><CloseOutlinedIcon sx={{ fontSize: 16 }} /></IconButton>
        </Box>

        {/* ── Scrollable content ── */}
        <Box className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto" }}>
          {/* ═══ HERO: Breadcrumb + Title ═══ */}
          <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ letterSpacing: "0.02em", mb: 0.5, display: "block" }}>
              CV Review
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.05rem", lineHeight: 1.3 }}>
              CV Review
            </Typography>

            {/* Schedule at-a-glance card */}
            <Box sx={{ mt: 2, p: 1.75, borderRadius: "12px", bgcolor: "hsl(var(--md-surface-container) / 0.5)", border: "1px solid", borderColor: "divider" }}>
              <Stack spacing={1}>
                {/* Due date */}
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "hsl(var(--md-primary-container))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: "hsl(var(--md-on-primary-container))" }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={700} sx={{ fontSize: "0.875rem", lineHeight: 1.2 }}>
                      {isCompleted ? "5 Mar, 2026" : "22 Mar, 2026"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      Due date
                    </Typography>
                  </Box>
                </Stack>
                {/* Batch */}
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "hsl(var(--md-surface-container))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <GroupOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.8125rem", lineHeight: 1.2 }}>
                      PGP-AIML-BA-UTA-Nov25-C
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Batch</Typography>
                  </Box>
                </Stack>
                {/* Contact */}
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "hsl(var(--md-surface-container))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <MailOutlineIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.8125rem", lineHeight: 1.2 }}>
                      gurus_support@greatlearning.in
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Contact</Typography>
                  </Box>
                </Stack>
              </Stack>
            </Box>
          </Box>

          <Divider />

          {/* ═══ DETAIL SECTIONS ═══ */}
          <Stack spacing={0} sx={{ px: 2.5, py: 2 }}>

            {/* ── Student Info (confirmed only) ── */}
            {isConfirmed && (
              <Box sx={{ mb: 2.5 }}>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
                  <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}>
                    Student Info
                  </Typography>
                </Stack>
                <Box sx={{ borderRadius: "8px", border: 1, borderColor: "divider", bgcolor: "hsl(var(--md-surface))", p: 2 }}>
                  {/* Student avatar + name */}
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: "0.8rem", fontWeight: 700 }}>AM</Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.8125rem" }}>Aarav Mehta</Typography>
                      <Typography variant="caption" color="text.secondary">PGP-AIML-BA-UTA-Nov25-C</Typography>
                    </Box>
                  </Stack>
                  <Divider sx={{ mb: 1 }} />
                  {/* LinkedIn */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.875 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>LinkedIn</Typography>
                    <Typography variant="body2" component="a" href="#" sx={{ color: "primary.main", textDecoration: "none", fontWeight: 500, fontSize: "0.8125rem", "&:hover": { textDecoration: "underline" } }}>
                      View Profile <OpenInNewOutlinedIcon sx={{ fontSize: 10, verticalAlign: "middle" }} />
                    </Typography>
                  </Stack>
                  {/* Resume / CV */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.875 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Resume / CV</Typography>
                    <Typography variant="body2" component="a" href="#" sx={{ color: "primary.main", textDecoration: "none", fontWeight: 500, fontSize: "0.8125rem", "&:hover": { textDecoration: "underline" } }}>
                      View CV <OpenInNewOutlinedIcon sx={{ fontSize: 10, verticalAlign: "middle" }} />
                    </Typography>
                  </Stack>
                  {/* Comments */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.875 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Comments</Typography>
                    <Button variant="text" size="small" sx={{ fontSize: "0.8125rem", textTransform: "none", fontWeight: 500, p: 0, minWidth: 0 }}>View User Comments</Button>
                  </Stack>
                </Box>
              </Box>
            )}

            {/* ── Completed: Reviewed CV link ── */}
            {isCompleted && (
              <Box sx={{ mb: 2.5 }}>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
                  <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}>
                    Links
                  </Typography>
                </Stack>
                <Box sx={{ borderRadius: "8px", border: 1, borderColor: "divider", bgcolor: "hsl(var(--md-surface))", p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.875 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Reviewed CV</Typography>
                    <Typography variant="body2" component="a" href="#" sx={{ color: "primary.main", textDecoration: "none", fontWeight: 500, fontSize: "0.8125rem", "&:hover": { textDecoration: "underline" } }}>
                      Reviewed CV <OpenInNewOutlinedIcon sx={{ fontSize: 10, verticalAlign: "middle" }} />
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            )}

            {/* ── Remuneration (completed) ── */}
            {isCompleted && (
              <Box sx={{ mb: 2.5 }}>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
                  <SavingsOutlinedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                  <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}>
                    Remuneration
                  </Typography>
                </Stack>
                <Box sx={{ borderRadius: "8px", border: 1, borderColor: "divider", bgcolor: "hsl(var(--md-surface))", p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 0.875 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Status</Typography>
                    <Chip label="Payment Processed" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }} />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 0.875 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>Transaction ID</Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem", fontFamily: "monospace" }}>TXN-GL-4F2R8K</Typography>
                  </Stack>
                </Box>
              </Box>
            )}
          </Stack>
        </Box>

        {/* ── Sticky footer ── */}
        <Box sx={{ position: "sticky", bottom: 0, zIndex: 10, borderTop: 1, borderColor: "divider", bgcolor: "background.paper", px: 2.5, py: 1.5, display: "flex", justifyContent: isConfirmed && !isSubmitted ? "space-between" : "flex-end", gap: 1, flexShrink: 0 }}>
          {isConfirmed && !isSubmitted && (
            <Button variant="contained" size="small">Submit CV Review</Button>
          )}
          {isSubmitted && (
            <Chip label="Already Submitted" size="small" sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }} />
          )}
          <Button variant="text" color="inherit" size="small" onClick={onClose}>Close</Button>
        </Box>
      </Box>
    </Drawer>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ACTIVITY CARD SECTIONS
   ══════════════════════════════════════════════════════════════════════════ */

/* ── Residency Cards (custom layout, NOT SessionCard) ── */

const RESIDENCY_COMBINED_ACCORDION = (
  <Accordion
    disableGutters elevation={0} defaultExpanded={false}
    sx={{ mt: 1.5, borderRadius: "12px !important", border: "1px solid", borderColor: "divider", overflow: "hidden", "&::before": { display: "none" } }}
  >
    <AccordionSummary
      expandIcon={<ExpandMoreOutlinedIcon sx={{ fontSize: 16 }} />}
      sx={{ px: 1.5, py: 0, minHeight: "unset", bgcolor: "hsl(var(--md-surface-container) / 0.5)", "& .MuiAccordionSummary-content": { my: 0.75, gap: 0.75, alignItems: "center" } }}
    >
      <CallMergeOutlinedIcon sx={{ fontSize: 13, color: "text.secondary" }} />
      <Typography variant="caption" fontWeight={600} color="text.secondary">Combined session</Typography>
      <Chip label="2" size="small" sx={{ height: 18, minWidth: 18, fontSize: "0.65rem", fontWeight: 700, bgcolor: "action.selected", "& .MuiChip-label": { px: 0.5 } }} />
    </AccordionSummary>
    <AccordionDetails sx={{ p: 0 }}>
      <Stack divider={<Divider />}>
        {[
          { batch: "AIML Online March 26 A", group: "All Groups", learnerCount: 120 },
          { batch: "AIML Online Feb 26 B", group: "All Groups", learnerCount: 95 },
        ].map((cb) => (
          <Box key={cb.batch} sx={{ px: 1.5, py: 0.75 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "text.disabled", flexShrink: 0 }} />
              <Typography variant="caption" fontWeight={500}>{cb.batch}</Typography>
              <Typography variant="caption" color="text.secondary">&mdash; {cb.group}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ ml: 2, mt: 0.25 }}>
              <Chip label={`${cb.learnerCount} learners`} size="small" sx={{ height: 18, fontSize: "0.6rem" }} />
            </Stack>
          </Box>
        ))}
      </Stack>
    </AccordionDetails>
  </Accordion>
);

function ResidencyCards() {
  const dispatch = useAppDispatch();
  const openDetails = (s: import("@/lib/types").Session) => { dispatch(setSessionFocus(s)); dispatch(setOpenSessionDetails(true)); };
  const openCompleted = (s: import("@/lib/types").Session) => { dispatch(setSessionFocus(s)); dispatch(setOpenCompletedSession(true)); };

  return (
    <>

      {/* ── Confirmed ── */}
      <ComponentSection
        title="Residency - Confirmed"
        description="Confirmed residency with 3-day schedule. Date range with → arrow. Material + Course actions."
      >
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
          <SessionCard
            title="AI in Practice Workshop"
            sessionType="Residency"
            batch="AIML Online March 26 A"
            dateYmd="2026-03-20"
            endDateYmd="2026-03-22"
            start={minutes(9)}
            end={minutes(17)}
            locationText="Bangalore"
            status={STATUS_CONFIRMED()}
            actions={
              <>
                <Button variant="soft" size="small" startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 16 }} />}>Material</Button>
                <Button variant="soft" size="small" startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 16 }} />}>Course</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => openDetails(demoResidencyConfirmed)}>View details</Button>}
            onCourseClick={() => {}}
          />
        </Card>
      </ComponentSection>

      {/* ── Confirmed (Combined Session) ── */}
      <ComponentSection
        title="Residency - Confirmed (Combined session)"
        description="Multi-batch combined residency with 3-day schedule + combined session accordion."
      >
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
          <SessionCard
            title="Deep Learning Fundamentals"
            sessionType="Residency"
            batch="AIML Online March 26 A"
            dateYmd="2026-04-02"
            endDateYmd="2026-04-04"
            start={minutes(9)}
            end={minutes(17)}
            locationText="Bangalore"
            status={STATUS_CONFIRMED()}
            actions={
              <>
                <Button variant="soft" size="small" startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 16 }} />}>Material</Button>
                <Button variant="soft" size="small" startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 16 }} />}>Course</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => openDetails(demoResidencyCombined)}>View details</Button>}
            onCourseClick={() => {}}
          />
          {RESIDENCY_COMBINED_ACCORDION}
        </Card>
      </ComponentSection>

      {/* ── Scheduled ── */}
      <ComponentSection
        title="Residency - Scheduled"
        description="Awaiting guru confirmation. Confirm/Unavailable actions with 3-day schedule accordion."
      >
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
          <SessionCard
            title="Deep Learning Fundamentals"
            sessionType="Residency"
            batch="AIML Online March 26 A"
            dateYmd="2026-04-02"
            endDateYmd="2026-04-04"
            start={minutes(9)}
            end={minutes(17)}
            locationText="Bangalore"
            status={STATUS_SCHEDULED}
            actions={
              <>
                <Button startIcon={<TaskAltOutlinedIcon sx={{ fontSize: 18 }} />} size="small" variant="contained">Confirm</Button>
                <Button startIcon={<DoNotDisturbOnOutlinedIcon sx={{ fontSize: 18 }} />} size="small" variant="soft">I&apos;m unavailable</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => openDetails(demoResidencyScheduled)}>View details</Button>}
            onCourseClick={() => {}}
          />
        </Card>
      </ComponentSection>

      {/* ── Scheduled (Combined) ── */}
      <ComponentSection
        title="Residency - Scheduled (Combined session)"
        description="Unconfirmed combined residency. Confirm/Unavailable + schedule + combined session accordions."
      >
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
          <SessionCard
            title="AI in Practice Workshop"
            sessionType="Residency"
            batch="AIML Online March 26 A"
            dateYmd="2026-03-27"
            endDateYmd="2026-03-29"
            start={minutes(9)}
            end={minutes(17)}
            locationText="Bangalore"
            status={STATUS_SCHEDULED}
            actions={
              <>
                <Button startIcon={<TaskAltOutlinedIcon sx={{ fontSize: 18 }} />} size="small" variant="contained">Confirm</Button>
                <Button startIcon={<DoNotDisturbOnOutlinedIcon sx={{ fontSize: 18 }} />} size="small" variant="soft">I&apos;m unavailable</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => openDetails(demoResidencyScheduled)}>View details</Button>}
            onCourseClick={() => {}}
          />
          {RESIDENCY_COMBINED_ACCORDION}
        </Card>
      </ComponentSection>

      {/* ── Completed - Gathering feedback ── */}
      <ComponentSection
        title="Residency - Completed (Gathering feedback)"
        description="Residency done, no feedback yet. Payment pending + Gathering feedback chips."
      >
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
          <SessionCard
            title="Program Overview (All)"
            sessionType="Residency"
            batch="AIML Online March 26 A"
            dateYmd="2026-03-05"
            endDateYmd="2026-03-07"
            start={minutes(9)}
            end={minutes(17)}
            topRight={
              <Stack direction="row" spacing={0.75}>
                {CHIP_PAYMENT_PENDING}
                {CHIP_GATHERING}
              </Stack>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => openCompleted(demoResidencyCompletedGathering)}>View details</Button>}
            onCourseClick={() => {}}
          />
        </Card>
      </ComponentSection>

      {/* ── Completed -with rating ── */}
      <ComponentSection
        title="Residency - Completed (with feedback)"
        description="Past residency with rating. Payment processed chip + star rating. Feedback button."
      >
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
          <SessionCard
            title="Program Overview (All)"
            sessionType="Residency"
            batch="AIML Online March 26 A"
            dateYmd="2026-03-05"
            endDateYmd="2026-03-07"
            start={minutes(9)}
            end={minutes(17)}
            topRight={
              <Stack direction="row" spacing={0.75}>
                {CHIP_PAYMENT_PROCESSED}
                <StarRatingNumeric rating={4.2} />
              </Stack>
            }
            actions={<Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>Feedback</Button>}
            secondaryAction={<Button variant="text" size="small" onClick={() => openCompleted(demoResidencyCompletedWithRating)}>View details</Button>}
            onCourseClick={() => {}}
          />
        </Card>
      </ComponentSection>

      {/* ── Completed - No feedback ── */}
      <ComponentSection
        title="Residency - Completed (No feedback)"
        description="Residency older than 30 days, no learner ratings received. Payment processed + No feedback collected chips."
      >
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
          <SessionCard
            title="Program Overview (All)"
            sessionType="Residency"
            batch="AIML Online March 26 A"
            dateYmd="2026-01-10"
            endDateYmd="2026-01-12"
            start={minutes(9)}
            end={minutes(17)}
            topRight={
              <Stack direction="row" spacing={0.75}>
                {CHIP_PAYMENT_PROCESSED}
                {CHIP_NO_FEEDBACK}
              </Stack>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => openCompleted(demoResidencyCompletedWithRating)}>View details</Button>}
            onCourseClick={() => {}}
          />
        </Card>
      </ComponentSection>

      {/* ── Combined - Completed ── */}
      <ComponentSection
        title="Residency - Combined (Completed)"
        description="Combined residency splits into separate cards per batch when completed. Each batch has its own rating."
      >
        <CombinedCompletedGroup>
          {/* Batch A card */}
          <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
            <SessionCard
              title="AI in Practice Workshop"
              sessionType="Residency"
              batch="AIML Online March 26 A"
              dateYmd="2026-02-10"
              endDateYmd="2026-02-12"
              start={minutes(9)}
              end={minutes(17)}
              topRight={
                <Stack direction="row" spacing={0.75}>
                  {CHIP_PAYMENT_PROCESSED}
                  <StarRatingNumeric rating={4.4} />
                </Stack>
              }
              actions={<Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>Feedback</Button>}
              secondaryAction={<Button variant="text" size="small" onClick={() => openCompleted(demoResidencyCompletedWithRating)}>View details</Button>}
              onCourseClick={() => {}}
            />
          </Card>
          {/* Batch B card */}
          <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
            <SessionCard
              title="AI in Practice Workshop"
              sessionType="Residency"
              batch="AIML Online March 26 B"
              dateYmd="2026-02-10"
              endDateYmd="2026-02-12"
              start={minutes(9)}
              end={minutes(17)}
              topRight={
                <Stack direction="row" spacing={0.75}>
                  {CHIP_PAYMENT_PROCESSED}
                  <StarRatingNumeric rating={3.9} />
                </Stack>
              }
              actions={<Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>Feedback</Button>}
              secondaryAction={<Button variant="text" size="small" onClick={() => openCompleted(demoResidencyCompletedWithRating)}>View details</Button>}
              onCourseClick={() => {}}
            />
          </Card>
        </CombinedCompletedGroup>
      </ComponentSection>
    </>
  );
}

/* ── Online Session Cards (use SessionCard) ── */

function OnlineSessionCards() {
  const dispatch = useAppDispatch();
  const [plannedDetailOpen, setPlannedDetailOpen] = useState(false);
  const openDetails = (s: import("@/lib/types").Session) => { dispatch(setSessionFocus(s)); dispatch(setOpenSessionDetails(true)); };
  const openCompleted = (s: import("@/lib/types").Session) => { dispatch(setSessionFocus(s)); dispatch(setOpenCompletedSession(true)); };

  return (
    <>
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

      {/* 1. Mentoring - Confirmed */}
      <ComponentSection title="Mentoring - Confirmed" description="Virtual mentoring event. Disabled Join session + Material on card.">
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
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
                <Button variant="soft" size="small" disabled startIcon={<VideocamOutlinedIcon sx={{ fontSize: 16 }} />}>Join session</Button>
                <Button variant="soft" size="small" startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 16 }} />}>Material</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => openDetails(demoMentoringConfirmed)}>View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* 2. Mentoring - Combined (Confirmed) */}
      <ComponentSection title="Mentoring - Combined (Confirmed)" description="Combined session across batches. Combined session accordion with batch details.">
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
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
                <Button variant="soft" size="small" disabled startIcon={<VideocamOutlinedIcon sx={{ fontSize: 16 }} />}>Join session</Button>
                <Button variant="soft" size="small" startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 16 }} />}>Material</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => openDetails(demoMentoringCombinedConfirmed)}>View details</Button>}
          />
          <Accordion
            disableGutters elevation={0} defaultExpanded
            sx={{ mt: 1.5, borderRadius: "12px !important", border: "1px solid", borderColor: "divider", overflow: "hidden", "&::before": { display: "none" } }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{ px: 1.5, py: 0, minHeight: "unset", bgcolor: "hsl(var(--md-surface-container) / 0.5)", "& .MuiAccordionSummary-content": { my: 0.75, gap: 0.75, alignItems: "center" } }}
            >
              <CallMergeOutlinedIcon sx={{ fontSize: 13, color: "text.secondary" }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary">Combined session</Typography>
              <Chip label="2" size="small" sx={{ height: 18, minWidth: 18, fontSize: "0.65rem", fontWeight: 700, bgcolor: "action.selected", "& .MuiChip-label": { px: 0.5 } }} />
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <Stack divider={<Divider />}>
                {[
                  { batch: "PGPDS.O.MAR26.A", group: "Group 07", learnerCount: 20 },
                  { batch: "PGPDS.O.MAR26.B", group: "Group 03", learnerCount: 18 },
                ].map((cb) => (
                  <Box key={cb.batch} sx={{ px: 1.5, py: 0.75 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "text.disabled", flexShrink: 0 }} />
                      <Typography variant="caption" fontWeight={500}>{cb.batch}</Typography>
                      <Typography variant="caption" color="text.secondary">&mdash; {cb.group}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ ml: 2, mt: 0.25 }}>
                      <Chip label={`${cb.learnerCount} learners`} size="small" sx={{ height: 18, fontSize: "0.6rem" }} />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Card>
      </ComponentSection>

      {/* 3. Mentoring - Scheduled */}
      <ComponentSection title="Mentoring - Scheduled" description="Unconfirmed mentoring event awaiting guru action.">
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
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
            secondaryAction={<Button variant="text" size="small" onClick={() => openDetails(demoMentoringScheduled)}>View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* 3b. Mentoring - Combined (Scheduled) */}
      <ComponentSection title="Mentoring - Combined (Scheduled)" description="Unconfirmed combined event awaiting guru action. Combined session accordion.">
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
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
            secondaryAction={<Button variant="text" size="small" onClick={() => openDetails(demoMentoringCombinedScheduled)}>View details</Button>}
          />
          <Accordion
            disableGutters elevation={0} defaultExpanded={false}
            sx={{ mt: 1.5, borderRadius: "12px !important", border: "1px solid", borderColor: "divider", overflow: "hidden", "&::before": { display: "none" } }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{ px: 1.5, py: 0, minHeight: "unset", bgcolor: "hsl(var(--md-surface-container) / 0.5)", "& .MuiAccordionSummary-content": { my: 0.75, gap: 0.75, alignItems: "center" } }}
            >
              <CallMergeOutlinedIcon sx={{ fontSize: 13, color: "text.secondary" }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary">Combined session</Typography>
              <Chip label="2" size="small" sx={{ height: 18, minWidth: 18, fontSize: "0.65rem", fontWeight: 700, bgcolor: "action.selected", "& .MuiChip-label": { px: 0.5 } }} />
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <Stack divider={<Divider />}>
                {[
                  { batch: "PGPDS.O.MAR26.A", group: "Group 07" },
                  { batch: "PGPDS.O.MAR26.B", group: "Group 03" },
                ].map((cb) => (
                  <Box key={cb.batch} sx={{ px: 1.5, py: 0.75 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "text.disabled", flexShrink: 0 }} />
                      <Typography variant="caption" fontWeight={500}>{cb.batch}</Typography>
                      <Typography variant="caption" color="text.secondary">&mdash; {cb.group}</Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Card>
      </ComponentSection>

      {/* 4. Mock Interview - Confirmed (secondary facilitator) */}
      <ComponentSection title="Mock Interview - Confirmed (secondary)" description="Mock interview event. Join session + Share Feedback on card. Secondary facilitator badge.">
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
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
                <Button variant="contained" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 16 }} />}>Join session</Button>
                <Button variant="soft" size="small" startIcon={<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 14 }} />}>Share Feedback</Button>
              </>
            }
            chips={["secondary"]}
            secondaryAction={<Button variant="text" size="small" onClick={() => openDetails(demoMockConfirmed)}>View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* 6. Mentoring - Tentative */}
      <ComponentSection title="Mentoring - Tentative" description="Planned mentoring event, time not yet confirmed. View details opens dialog with schedule (to be confirmed), batch, program, contact.">
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

      {/* 7. Mentoring - Completed (Gathering feedback) */}
      <ComponentSection title="Mentoring - Completed (Gathering feedback)" description="Event done, learners haven't rated yet. Payment pending + Gathering feedback chips top-right. Recording on card.">
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
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
              <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Recording</Button>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => openCompleted(demoMentoringCompletedGathering)}>View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* 7b. Mentoring - Completed (Recording processing) */}
      <ComponentSection title="Mentoring - Completed (Recording processing)" description="Session just ended, recording not yet processed. Recording button is disabled. Typically takes up to an hour.">
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
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
                Recording
              </Button>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => openCompleted(demoMentoringCompletedGathering)}>View details</Button>}
          />
          <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: "block", fontStyle: "italic" }}>
            Recording is being processed and will be available shortly.
          </Typography>
        </Card>
      </ComponentSection>

      {/* 8. Mentoring - Completed (No feedback) */}
      <ComponentSection title="Mentoring - Completed (No feedback)" description="Event older than 30 days, no learner ratings. Payment processed + No feedback collected chips top-right.">
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
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
              <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Recording</Button>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => openCompleted(demoMentoringCompletedNoFeedback)}>View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* 9. Mentoring - Completed (with rating) */}
      <ComponentSection title="Mentoring - Completed (with rating)" description="Past mentoring event. Payment processed chip + star rating top-right. Recording + Feedback on card.">
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
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
                <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Recording</Button>
                <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>Feedback</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => openCompleted(demoMentoringCompletedWithRating)}>View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* 10. Mentoring - Combined (Completed) */}
      <ComponentSection title="Mentoring - Combined (Completed)" description="Combined session splits into separate cards per batch when completed -each batch has its own rating. Two cards shown below for Batch A and Batch B.">
        <CombinedCompletedGroup>
          {/* Batch A card */}
          <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
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
                  <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Recording</Button>
                  <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>Feedback</Button>
                </>
              }
              secondaryAction={<Button variant="text" size="small" onClick={() => openCompleted(demoMentoringCombinedCompleted)}>View details</Button>}
            />
          </Card>
          {/* Batch B card */}
          <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
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
                  <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Recording</Button>
                  <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>Feedback</Button>
                </>
              }
              secondaryAction={<Button variant="text" size="small" onClick={() => openCompleted(demoMentoringCombinedCompleted)}>View details</Button>}
            />
          </Card>
        </CombinedCompletedGroup>
      </ComponentSection>

    </>
  );
}

/* ── Career Mentor Cards (use SessionCard) ── */

function CareerMentorOnlineSessionCards() {
  const dispatch = useAppDispatch();
  const openDetails = (s: import("@/lib/types").Session) => { dispatch(setSessionFocus(s)); dispatch(setOpenSessionDetails(true)); };
  const openCompleted = (s: import("@/lib/types").Session) => { dispatch(setSessionFocus(s)); dispatch(setOpenCompletedSession(true)); };

  return (
    <>

      {/* 1. Career 1:1 - Confirmed */}
      <ComponentSection title="Career 1:1 - Confirmed" description="1:1 career mentoring. Join session on card. Student info, LinkedIn, resume in View Details.">
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
          <SessionCard
            title="Career Mentoring"
            sessionType="Career mentoring session"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-03-18"
            start={minutes(14)}
            end={minutes(15)}
            status={STATUS_CONFIRMED()}
            actions={
              <Button variant="contained" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 16 }} />}>Join session</Button>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => openDetails(demoCareerConfirmed)}>View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* 2. Mock Interview - Confirmed */}
      <ComponentSection title="Mock Interview - Confirmed" description="Mock interview event. Join session + Share Feedback on card.">
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
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
                <Button variant="contained" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 16 }} />}>Join session</Button>
                <Button variant="soft" size="small" startIcon={<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 14 }} />}>Share Feedback</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => openDetails(demoMockConfirmed)}>View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* 3. Career 1:1 - Scheduled */}
      <ComponentSection title="Career 1:1 - Scheduled" description="Career mentoring event awaiting guru confirmation.">
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
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
            secondaryAction={<Button variant="text" size="small" onClick={() => openDetails(demoCareerScheduled)}>View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* 4. Career - Completed (Gathering feedback) */}
      <ComponentSection title="Career - Completed (Gathering feedback)" description="Event done, no ratings yet. Payment pending + Gathering feedback chips top-right.">
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
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
              <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Recording</Button>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => openCompleted(demoCareerCompletedGathering)}>View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* 5. Career - Completed (with rating) */}
      <ComponentSection title="Career - Completed (with rating)" description="Past career event. Payment processed chip + star rating top-right. Recording + Feedback on card.">
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
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
              <>
                <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Recording</Button>
                <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>Feedback</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => openCompleted(demoCareerCompletedWithRating)}>View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* 6. Mock - Completed (with Share Feedback) */}
      <ComponentSection title="Mock - Completed (with Share Feedback)" description="Past mock interview. Payment processed chip + star rating top-right. Recording + Feedback + Share Feedback.">
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
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
                <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Recording</Button>
                <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>Feedback</Button>
                <Button variant="soft" size="small" startIcon={<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 14 }} />}>Share Feedback</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => openCompleted(demoMockCompleted)}>View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* 7. Career - Completed (No feedback) */}
      <ComponentSection title="Career - Completed (No feedback)" description="Career session older than 30 days, no learner ratings received. Payment processed + No feedback collected chips. Recording on card.">
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
          <SessionCard
            title="Career Mentoring"
            sessionType="Career mentoring session"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-01-08"
            start={minutes(14)}
            end={minutes(15)}
            topRight={
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                {CHIP_PAYMENT_PROCESSED}
                {CHIP_NO_FEEDBACK}
              </Stack>
            }
            actions={
              <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Recording</Button>
            }
            secondaryAction={<Button variant="text" size="small" onClick={() => openCompleted(demoCareerCompletedWithRating)}>View details</Button>}
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
        title="Evaluation - Confirmed"
        description="Date range (assessment due → grading due), primary CTA to open SpeedGrader, submission progress, course template, batch, contact."
      >
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
          <CardTitleRow title="Evaluation: Linear Regression Assignment" chips={CHIP_CONFIRMED} />
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 0.75 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">15 Mar – 22 Mar, 2026 &middot; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: "block" }}>18 / 42 graded &middot; 42 submissions</Typography>
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Button variant="contained" size="small" startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 14 }} />}>Open SpeedGrader</Button>
            <Button variant="text" size="small" onClick={() => setDetailOpen("confirmed")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Scheduled (unconfirmed) ── */}
      <ComponentSection
        title="Evaluation - Scheduled"
        description="Assigned to guru but not yet confirmed. Primary CTA is Confirm, secondary is I'm unavailable. No SpeedGrader link until confirmed."
      >
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
          <CardTitleRow title="Evaluation: Linear Regression Assignment" chips={CHIP_SCHEDULED} />
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">15 Mar – 22 Mar, 2026 &middot; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1}>
              <Button variant="contained" size="small" startIcon={<TaskAltOutlinedIcon sx={{ fontSize: 16 }} />}>Confirm</Button>
              <Button variant="soft" size="small" startIcon={<DoNotDisturbOnOutlinedIcon sx={{ fontSize: 16 }} />}>I'm unavailable</Button>
            </Stack>
            <Button variant="text" size="small" onClick={() => setDetailOpen("confirmed")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Tentative ── */}
      <ComponentSection
        title="Evaluation - Tentative"
        description="Assignment label is plain text (no link). No student progress. 'To be confirmed' instead of submission counts."
      >
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
          <CardTitleRow title="Evaluation: Decision Tree Assignment" chips={CHIP_TO_BE_CONFIRMED} />
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">1 Apr – 10 Apr, 2026 &middot; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="text" size="small" onClick={() => setDetailOpen("tentative")}>View details</Button>
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
        title="Moderation - Confirmed"
        description="Date range (moderation start → concluding remark), primary CTA to open discussion in SpeedGrader, response progress, course template, batch, contact."
      >
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
          <CardTitleRow title="Moderation: Impact of AI on Healthcare" chips={CHIP_CONFIRMED} />
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 0.75 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">15 Mar – 20 Mar, 2026 &middot; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: "block" }}>34 posts &middot; 8 unread &middot; 12 / 34 graded</Typography>
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Button variant="contained" size="small" startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 14 }} />}>Open Discussion</Button>
            <Button variant="text" size="small" onClick={() => setDetailOpen("confirmed")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Scheduled (unconfirmed) ── */}
      <ComponentSection
        title="Moderation - Scheduled"
        description="Assigned to guru but not yet confirmed. Primary CTA is Confirm, secondary is I'm unavailable. No SpeedGrader link until confirmed."
      >
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
          <CardTitleRow title="Moderation: Impact of AI on Healthcare" chips={CHIP_SCHEDULED} />
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">15 Mar – 20 Mar, 2026 &middot; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1}>
              <Button variant="contained" size="small" startIcon={<TaskAltOutlinedIcon sx={{ fontSize: 16 }} />}>Confirm</Button>
              <Button variant="soft" size="small" startIcon={<DoNotDisturbOnOutlinedIcon sx={{ fontSize: 16 }} />}>I'm unavailable</Button>
            </Stack>
            <Button variant="text" size="small" onClick={() => setDetailOpen("confirmed")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Tentative ── */}
      <ComponentSection
        title="Moderation - Tentative"
        description="DQ label is plain text (no link). No student progress. 'To be confirmed' instead of progress stats."
      >
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
          <CardTitleRow title="Moderation: Ethics in Machine Learning" chips={CHIP_TO_BE_CONFIRMED} />
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">5 Apr – 15 Apr, 2026 &middot; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="text" size="small" onClick={() => setDetailOpen("tentative")}>View details</Button>
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

      {/* ── Scheduled ── */}
      <ComponentSection
        title="Capstone Project - Scheduled"
        description="Assigned to guru but not yet confirmed. Guru must confirm to participate. Confirm / I'm unavailable actions."
      >
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
          <CardTitleRow title="Capstone - PGPDS.O.MAR26.A" chips={CHIP_SCHEDULED} />
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">15 Jan – 20 Apr, 2026</Typography>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1}>
              <Button variant="contained" size="small" startIcon={<TaskAltOutlinedIcon sx={{ fontSize: 16 }} />}>Confirm</Button>
              <Button variant="soft" size="small" startIcon={<DoNotDisturbOnOutlinedIcon sx={{ fontSize: 16 }} />}>I&apos;m unavailable</Button>
            </Stack>
            <Button variant="text" size="small" onClick={() => setDetailOpen("confirmed")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Confirmed ── */}
      <ComponentSection
        title="Capstone Project - Confirmed"
        description="Date range (start → presentation), 'Capstone -[Batch]', group, domain, next session date, contact. Progress + Group Details in dialog."
      >
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
          <CardTitleRow title="Capstone - PGPDS.O.MAR26.A" chips={CHIP_CONFIRMED} />
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">15 Jan – 20 Apr, 2026</Typography>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="text" size="small" onClick={() => setDetailOpen("confirmed")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Completed -payment pending ── */}
      <ComponentSection
        title="Capstone Project - Completed (Payment pending)"
        description="No rating for capstones. Payment pending chip top-right. Progress button always shown."
      >
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
          <CardTitleRow title="Capstone - PGPDS.O.JUL25.A" chips={CHIP_PAYMENT_PENDING} />
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">15 Jul – 20 Nov, 2025</Typography>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
            <Button variant="soft" size="small" startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 14 }} />}>Progress</Button>
            <Button variant="text" size="small" onClick={() => setDetailOpen("paymentPending")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Completed -payment processed ── */}
      <ComponentSection
        title="Capstone Project - Completed"
        description="No rating. Payment processed chip top-right. Progress always shown."
      >
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
          <CardTitleRow title="Capstone - PGPDS.O.JUL25.A" chips={CHIP_PAYMENT_PROCESSED} />
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">15 Jul – 20 Nov, 2025</Typography>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
            <Button variant="soft" size="small" startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 14 }} />}>Progress</Button>
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

      {/* ── Scheduled ── */}
      <ComponentSection
        title="CV Review - Scheduled"
        description="Assigned to guru but not yet confirmed. Guru must confirm to accept the CV review task. Confirm / I'm unavailable actions."
      >
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
          <CardTitleRow title="CV Review" chips={CHIP_SCHEDULED} />
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">22 Mar, 2026 &middot; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1}>
              <Button variant="contained" size="small" startIcon={<TaskAltOutlinedIcon sx={{ fontSize: 16 }} />}>Confirm</Button>
              <Button variant="soft" size="small" startIcon={<DoNotDisturbOnOutlinedIcon sx={{ fontSize: 16 }} />}>I&apos;m unavailable</Button>
            </Stack>
            <Button variant="text" size="small" onClick={() => setDetailOpen("confirmed")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Confirmed (not yet submitted) ── */}
      <ComponentSection
        title="CV Review - Confirmed"
        description="Due date, batch, 'Due on' line. View LinkedIn, View CV, View User Comments, Submit CV Review as primary actions."
      >
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
          <CardTitleRow title="CV Review" chips={CHIP_CONFIRMED} />
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">22 Mar, 2026 &middot; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Button variant="contained" size="small">Submit CV Review</Button>
            <Button variant="text" size="small" onClick={() => setDetailOpen("confirmed")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Confirmed (already submitted) ── */}
      <ComponentSection
        title="CV Review - Confirmed (Already Submitted)"
        description="Submit button replaced by 'Already Submitted' text. 'Due on' line hidden once submitted."
      >
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
          <CardTitleRow title="CV Review" chips={<>{CHIP_ALREADY_SUBMITTED}{CHIP_CONFIRMED}</>} />
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">22 Mar, 2026 &middot; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="text" size="small" onClick={() => setDetailOpen("confirmed-submitted")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Completed - Payment Pending ── */}
      <ComponentSection
        title="CV Review - Completed (Payment pending)"
        description="Review submitted, payment not yet processed. Payment pending chip top-right. Reviewed CV button shown."
      >
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
          <CardTitleRow title="CV Review" chips={CHIP_PAYMENT_PENDING} />
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">5 Mar, 2026 &middot; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
            <Button variant="soft" size="small" startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 14 }} />}>Reviewed CV</Button>
            <Button variant="text" size="small" onClick={() => setDetailOpen("completed")}>View details</Button>
          </Stack>
        </Card>
      </ComponentSection>

      {/* ── Completed - Payment Processed ── */}
      <ComponentSection
        title="CV Review - Completed (Payment processed)"
        description="Review done, payment processed. Payment processed chip top-right. No rating, no feedback."
      >
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2 } }}>
          <CardTitleRow title="CV Review" chips={CHIP_PAYMENT_PROCESSED} />
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary", mb: 1.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" color="text.secondary">5 Mar, 2026 &middot; PGP-AIML-BA-UTA-Nov25-C</Typography>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
            <Button variant="soft" size="small" startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 14 }} />}>Reviewed CV</Button>
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
   AUDIT DATA
   ══════════════════════════════════════════════════════════════════════════ */

const ACTIVITY_TYPES = ["Online Session", "Residency", "Career / Mock", "CV Review", "Evaluation", "Moderation", "Capstone"] as const;
type ActivityType = typeof ACTIVITY_TYPES[number];

const CARD_STATES = [
  "Confirmed",
  "Combined - Confirmed",
  "Scheduled",
  "Combined - Scheduled",
  "Tentative",
  "Completed - Payment Pending",
  "Completed - Payment Processed",
  "Completed - Gathering Feedback",
  "Completed - Recording Processing",
  "Completed - No Feedback",
  "Completed - With Rating",
  "Combined - Completed",
  "Confirmed - Already Submitted",
] as const;

type CellStatus = "present" | "missing-by-design" | "potential-gap";

const COVERAGE: Record<string, Record<ActivityType, CellStatus>> = {
  "Confirmed":                              { "Online Session": "present", Residency: "present", "Career / Mock": "present", "CV Review": "present", Evaluation: "present", Moderation: "present", Capstone: "present" },
  "Combined - Confirmed":                   { "Online Session": "present", Residency: "present", "Career / Mock": "missing-by-design", "CV Review": "missing-by-design", Evaluation: "missing-by-design", Moderation: "missing-by-design", Capstone: "missing-by-design" },
  "Scheduled":                              { "Online Session": "present", Residency: "present", "Career / Mock": "present", "CV Review": "present", Evaluation: "present", Moderation: "present", Capstone: "present" },
  "Combined - Scheduled":                   { "Online Session": "present", Residency: "present", "Career / Mock": "missing-by-design", "CV Review": "missing-by-design", Evaluation: "missing-by-design", Moderation: "missing-by-design", Capstone: "missing-by-design" },
  "Tentative":                              { "Online Session": "present", Residency: "missing-by-design", "Career / Mock": "missing-by-design", "CV Review": "missing-by-design", Evaluation: "present", Moderation: "present", Capstone: "missing-by-design" },
  "Completed - Payment Pending":            { "Online Session": "present", Residency: "present", "Career / Mock": "present", "CV Review": "present", Evaluation: "present", Moderation: "present", Capstone: "present" },
  "Completed - Payment Processed":           { "Online Session": "present", Residency: "present", "Career / Mock": "present", "CV Review": "present", Evaluation: "present", Moderation: "present", Capstone: "present" },
  "Completed - Gathering Feedback":         { "Online Session": "present", Residency: "present", "Career / Mock": "present", "CV Review": "missing-by-design", Evaluation: "missing-by-design", Moderation: "missing-by-design", Capstone: "missing-by-design" },
  "Completed - Recording Processing":       { "Online Session": "present", Residency: "missing-by-design", "Career / Mock": "missing-by-design", "CV Review": "missing-by-design", Evaluation: "missing-by-design", Moderation: "missing-by-design", Capstone: "missing-by-design" },
  "Completed - No Feedback":                { "Online Session": "present", Residency: "present", "Career / Mock": "present", "CV Review": "missing-by-design", Evaluation: "missing-by-design", Moderation: "missing-by-design", Capstone: "missing-by-design" },
  "Completed - With Rating":                { "Online Session": "present", Residency: "present", "Career / Mock": "present", "CV Review": "missing-by-design", Evaluation: "missing-by-design", Moderation: "missing-by-design", Capstone: "missing-by-design" },
  "Combined - Completed":                   { "Online Session": "present", Residency: "present", "Career / Mock": "missing-by-design", "CV Review": "missing-by-design", Evaluation: "missing-by-design", Moderation: "missing-by-design", Capstone: "missing-by-design" },
  "Confirmed - Already Submitted":          { "Online Session": "missing-by-design", Residency: "missing-by-design", "Career / Mock": "missing-by-design", "CV Review": "present", Evaluation: "missing-by-design", Moderation: "missing-by-design", Capstone: "missing-by-design" },
};

const ROLE_ACTIVITIES: Record<GuruRole, { activities: ActivityType[]; note?: string }> = {
  Teacher:          { activities: ["Online Session", "Residency"] },
  "Course Mentor":  { activities: ["Online Session", "Residency"], note: "Same as Teacher (different order)" },
  "Career Mentor":  { activities: ["Career / Mock"] },
  "CV Review Mentor": { activities: ["CV Review"] },
  Evaluator:        { activities: ["Evaluation"] },
  Moderator:        { activities: ["Moderation"] },
  "Project Mentor": { activities: ["Capstone"] },
  "Industry Expert":{ activities: ["Online Session"], note: "Subset of Teacher (no Residency)" },
};

const DUPLICATES: { roles: string; shared: string; diff: string }[] = [
  { roles: "Teacher & Course Mentor", shared: "OnlineSessionCards + ResidencyCards", diff: "Render order only" },
  { roles: "Teacher & Industry Expert", shared: "OnlineSessionCards", diff: "Industry Expert has no Residency" },
  { roles: "Online & Career (Mock)", shared: "Mock Interview card", diff: "Online shows secondary facilitator badge; Career shows primary" },
];

const ACTIVITY_DETAILS: Record<ActivityType, { usedBy: string; totalStates: number; hasRating: boolean; hasCombined: boolean; hasTentative: boolean; hasRecording: boolean; uniqueFeature?: string }> = {
  "Online Session": { usedBy: "Teacher, Course Mentor, Industry Expert", totalStates: 11, hasRating: true, hasCombined: true, hasTentative: true, hasRecording: true },
  Residency:        { usedBy: "Teacher, Course Mentor", totalStates: 8, hasRating: true, hasCombined: true, hasTentative: false, hasRecording: false, uniqueFeature: "Location, multi-day schedule" },
  "Career / Mock":  { usedBy: "Career Mentor", totalStates: 7, hasRating: true, hasCombined: false, hasTentative: false, hasRecording: true, uniqueFeature: "Share Feedback (Mock), Learner context in drawer" },
  "CV Review":      { usedBy: "CV Review Mentor", totalStates: 5, hasRating: false, hasCombined: false, hasTentative: false, hasRecording: false, uniqueFeature: "Submit flow, Already Submitted state" },
  Evaluation:       { usedBy: "Evaluator", totalStates: 3, hasRating: false, hasCombined: false, hasTentative: true, hasRecording: false, uniqueFeature: "SpeedGrader, submission progress" },
  Moderation:       { usedBy: "Moderator", totalStates: 3, hasRating: false, hasCombined: false, hasTentative: true, hasRecording: false, uniqueFeature: "Discussion progress (posts, unread, graded)" },
  Capstone:         { usedBy: "Project Mentor", totalStates: 4, hasRating: false, hasCombined: false, hasTentative: false, hasRecording: false, uniqueFeature: "Long duration, Progress button, no rating" },
};

/* ── Audit Panel Component ── */

function CoverageCell({ status }: { status: CellStatus }) {
  if (status === "present") return <CheckCircleOutlinedIcon sx={{ fontSize: 16, color: "success.main" }} />;
  if (status === "potential-gap") return <MuiTooltip title="Potential gap" arrow><WarningAmberOutlinedIcon sx={{ fontSize: 16, color: "warning.main" }} /></MuiTooltip>;
  return <RemoveCircleOutlineOutlinedIcon sx={{ fontSize: 14, color: "text.disabled", opacity: 0.4 }} />;
}

function AuditPanel() {
  const [auditTab, setAuditTab] = useState(0);

  const gapCount = useMemo(() => {
    let count = 0;
    CARD_STATES.forEach((state) => {
      ACTIVITY_TYPES.forEach((act) => {
        if (COVERAGE[state][act] === "potential-gap") count++;
      });
    });
    return count;
  }, []);

  return (
    <Stack spacing={3} sx={{ maxWidth: 1100 }}>
      {/* Tab bar */}
      <Tabs
        value={auditTab}
        onChange={(_, v) => setAuditTab(v)}
        sx={{ minHeight: 36, "& .MuiTab-root": { minHeight: 36, textTransform: "none", fontWeight: 600, fontSize: "0.8rem" } }}
      >
        <Tab label="Coverage Matrix" />
        <Tab label="Role Overview" />
        <Tab label="Activity Details" />
        <Tab label="Duplicates" />
      </Tabs>

      {/* ── Tab 0: Coverage Matrix ── */}
      {auditTab === 0 && (
        <Card variant="outlined" sx={{ overflow: "auto" }}>
          {/* Legend */}
          <Stack direction="row" spacing={2.5} sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider", bgcolor: "action.hover" }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <CheckCircleOutlinedIcon sx={{ fontSize: 14, color: "success.main" }} />
              <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>Implemented</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <WarningAmberOutlinedIcon sx={{ fontSize: 14, color: "warning.main" }} />
              <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>Potential gap ({gapCount})</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <RemoveCircleOutlineOutlinedIcon sx={{ fontSize: 14, color: "text.disabled", opacity: 0.4 }} />
              <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>N/A by design</Typography>
            </Stack>
          </Stack>
          <Box sx={{ overflowX: "auto" }}>
            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", minWidth: 700, "& th, & td": { px: 1.5, py: 1, fontSize: "0.7rem", borderBottom: 1, borderColor: "divider", whiteSpace: "nowrap" }, "& th": { fontWeight: 700, color: "text.secondary", textAlign: "left", bgcolor: "action.hover", position: "sticky", top: 0 }, "& td": { textAlign: "center" }, "& td:first-of-type": { textAlign: "left", fontWeight: 500, color: "text.primary", minWidth: 200 } }}>
              <thead>
                <tr>
                  <th>Card State</th>
                  {ACTIVITY_TYPES.map((a) => <th key={a} style={{ textAlign: "center" }}>{a}</th>)}
                </tr>
              </thead>
              <tbody>
                {CARD_STATES.map((state) => (
                  <tr key={state}>
                    <td>{state}</td>
                    {ACTIVITY_TYPES.map((act) => (
                      <td key={act}><CoverageCell status={COVERAGE[state][act]} /></td>
                    ))}
                  </tr>
                ))}
                {/* Totals row */}
                <tr>
                  <td style={{ fontWeight: 700 }}>Total</td>
                  {ACTIVITY_TYPES.map((act) => {
                    const count = CARD_STATES.filter((s) => COVERAGE[s][act] === "present").length;
                    return <td key={act}><Typography variant="caption" fontWeight={700} sx={{ fontSize: "0.75rem" }}>{count}</Typography></td>;
                  })}
                </tr>
              </tbody>
            </Box>
          </Box>
        </Card>
      )}

      {/* ── Tab 1: Role Overview ── */}
      {auditTab === 1 && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 1.5 }}>
          {(Object.entries(ROLE_ACTIVITIES) as [GuruRole, typeof ROLE_ACTIVITIES[GuruRole]][]).map(([role, info]) => {
            const totalStates = info.activities.reduce((sum, a) => sum + ACTIVITY_DETAILS[a].totalStates, 0);
            const gaps = info.activities.reduce((sum, a) => {
              return sum + CARD_STATES.filter((s) => COVERAGE[s][a] === "potential-gap").length;
            }, 0);
            return (
              <Card key={role} variant="outlined" sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>{role}</Typography>
                  {info.note && <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.65rem" }}>{info.note}</Typography>}
                </Box>
                {/* Activity chips */}
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
                  {info.activities.map((a) => (
                    <Chip key={a} label={a} size="small" sx={{ fontSize: "0.65rem", height: 22, fontWeight: 600, bgcolor: "action.selected" }} />
                  ))}
                </Stack>
                {/* Stats row */}
                <Stack direction="row" spacing={2} sx={{ mt: "auto" }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem" }}>Card States</Typography>
                    <Typography variant="body2" fontWeight={700}>{totalStates}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem" }}>Activities</Typography>
                    <Typography variant="body2" fontWeight={700}>{info.activities.length}</Typography>
                  </Box>
                  {gaps > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem" }}>Gaps</Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ color: "warning.main" }}>{gaps}</Typography>
                    </Box>
                  )}
                </Stack>
                {/* Feature flags */}
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
                  {info.activities.some((a) => ACTIVITY_DETAILS[a].hasRating) && <Chip label="Rating" size="small" variant="outlined" sx={{ fontSize: "0.6rem", height: 18, "& .MuiChip-label": { px: 0.75 } }} />}
                  {info.activities.some((a) => ACTIVITY_DETAILS[a].hasCombined) && <Chip label="Combined" size="small" variant="outlined" sx={{ fontSize: "0.6rem", height: 18, "& .MuiChip-label": { px: 0.75 } }} />}
                  {info.activities.some((a) => ACTIVITY_DETAILS[a].hasTentative) && <Chip label="Tentative" size="small" variant="outlined" sx={{ fontSize: "0.6rem", height: 18, "& .MuiChip-label": { px: 0.75 } }} />}
                  {info.activities.some((a) => ACTIVITY_DETAILS[a].hasRecording) && <Chip label="Recording" size="small" variant="outlined" sx={{ fontSize: "0.6rem", height: 18, "& .MuiChip-label": { px: 0.75 } }} />}
                  {!info.activities.some((a) => ACTIVITY_DETAILS[a].hasRating) && <Chip label="No Rating" size="small" sx={{ fontSize: "0.6rem", height: 18, bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", "& .MuiChip-label": { px: 0.75 } }} />}
                </Stack>
              </Card>
            );
          })}
        </Box>
      )}

      {/* ── Tab 2: Activity Details ── */}
      {auditTab === 2 && (
        <Stack spacing={1.5}>
          {ACTIVITY_TYPES.map((act) => {
            const d = ACTIVITY_DETAILS[act];
            const states = CARD_STATES.filter((s) => COVERAGE[s][act] === "present");
            const gaps = CARD_STATES.filter((s) => COVERAGE[s][act] === "potential-gap");
            return (
              <Card key={act} variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>{act}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>Used by: {d.usedBy}</Typography>
                  </Box>
                  <Chip label={`${d.totalStates} states`} size="small" sx={{ fontWeight: 700, fontSize: "0.7rem" }} />
                </Stack>

                {/* Feature row */}
                <Stack direction="row" spacing={0.5} sx={{ mb: 1.5, flexWrap: "wrap", gap: 0.5 }}>
                  {d.hasRating && <Chip label="Has Rating" size="small" sx={{ height: 20, fontSize: "0.6rem", bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)" }} />}
                  {d.hasCombined && <Chip label="Combined Sessions" size="small" sx={{ height: 20, fontSize: "0.6rem", bgcolor: "var(--gl-accent-primary-bg)", color: "var(--gl-accent-primary)" }} />}
                  {d.hasTentative && <Chip label="Tentative State" size="small" sx={{ height: 20, fontSize: "0.6rem", bgcolor: "var(--gl-accent-purple-bg)", color: "var(--gl-accent-violet)" }} />}
                  {d.hasRecording && <Chip label="Recording" size="small" sx={{ height: 20, fontSize: "0.6rem", bgcolor: "var(--gl-accent-amber-bg)", color: "var(--gl-accent-amber)" }} />}
                  {!d.hasRating && <Chip label="Never Rated" size="small" sx={{ height: 20, fontSize: "0.6rem", bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)" }} />}
                  {d.uniqueFeature && <Chip label={d.uniqueFeature} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.6rem" }} />}
                </Stack>

                {/* Implemented states */}
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: "0.65rem", mb: 0.5, display: "block" }}>Implemented States</Typography>
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5, mb: gaps.length ? 1.5 : 0 }}>
                  {states.map((s) => (
                    <Chip key={s} icon={<CheckCircleOutlinedIcon sx={{ fontSize: "12px !important" }} />} label={s} size="small" sx={{ height: 22, fontSize: "0.65rem", bgcolor: "hsl(var(--md-primary) / 0.06)", "& .MuiChip-icon": { color: "success.main" } }} />
                  ))}
                </Stack>

                {/* Potential gaps */}
                {gaps.length > 0 && (
                  <>
                    <Typography variant="caption" fontWeight={600} sx={{ fontSize: "0.65rem", mb: 0.5, display: "block", color: "warning.main" }}>Potential Gaps</Typography>
                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
                      {gaps.map((s) => (
                        <Chip key={s} icon={<WarningAmberOutlinedIcon sx={{ fontSize: "12px !important" }} />} label={s} size="small" sx={{ height: 22, fontSize: "0.65rem", bgcolor: "hsl(var(--md-warning) / 0.08)", "& .MuiChip-icon": { color: "warning.main" } }} />
                      ))}
                    </Stack>
                  </>
                )}
              </Card>
            );
          })}
        </Stack>
      )}

      {/* ── Tab 3: Duplicates ── */}
      {auditTab === 3 && (
        <Stack spacing={1.5}>
          {/* Duplicate roles */}
          <Card variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <ContentCopyOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="subtitle2" fontWeight={700}>Duplicate Role Rendering</Typography>
            </Stack>
            <Stack spacing={1.5} divider={<Divider />}>
              {DUPLICATES.map((d, i) => (
                <Box key={i}>
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.8rem" }}>{d.roles}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    <Chip label={`Shared: ${d.shared}`} size="small" sx={{ fontSize: "0.65rem", height: 22, bgcolor: "var(--gl-accent-primary-bg)" }} />
                    <Chip label={`Diff: ${d.diff}`} size="small" variant="outlined" sx={{ fontSize: "0.65rem", height: 22 }} />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Card>

          {/* Shared components */}
          <Card variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Shared UI Components</Typography>
            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", "& th, & td": { px: 1.5, py: 0.75, fontSize: "0.7rem", borderBottom: 1, borderColor: "divider", textAlign: "left" }, "& th": { fontWeight: 700, color: "text.secondary", bgcolor: "action.hover" } }}>
              <thead>
                <tr><th>Component</th><th>Used By</th><th>Notes</th></tr>
              </thead>
              <tbody>
                {[
                  { comp: "SessionCard", used: "Online, Residency, Career/Mock", note: "Title, type chip, batch, date, time, actions" },
                  { comp: "CardTitleRow", used: "Evaluation, Moderation, Capstone, CV Review", note: "Simpler: title + chips row" },
                  { comp: "StarRatingNumeric", used: "All rated types (5)", note: "Numeric rating with star icon" },
                  { comp: "PlannedEventCard", used: "Online Sessions only", note: "Tentative / planned events" },
                  { comp: "CombinedCompletedGroup", used: "Online Sessions only", note: "Split completed cards grouping" },
                ].map((r) => (
                  <tr key={r.comp}><td style={{ fontWeight: 600 }}>{r.comp}</td><td>{r.used}</td><td style={{ color: "var(--md-on-surface-variant, #666)" }}>{r.note}</td></tr>
                ))}
              </tbody>
            </Box>
          </Card>

          {/* Shared chips */}
          <Card variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Shared Chip Constants</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 1 }}>
              {[
                { label: "Confirmed", scope: "All activity types", color: "var(--gl-status-confirmed-bg)" },
                { label: "Payment pending", scope: "All activity types", color: "var(--gl-status-pending-bg)" },
                { label: "Payment processed", scope: "All activity types", color: "var(--gl-status-confirmed-bg)" },
                { label: "Gathering feedback", scope: "Online, Residency, Career, Eval, Mod", color: "transparent" },
                { label: "No feedback collected", scope: "Online Sessions only", color: "transparent" },
                { label: "To be confirmed", scope: "Online, Evaluation, Moderation", color: "var(--gl-status-pending-bg)" },
                { label: "Already submitted", scope: "CV Review only", color: "var(--gl-status-confirmed-bg)" },
                { label: "Scheduled", scope: "Evaluation, Moderation (inline)", color: "var(--gl-status-pending-bg)" },
              ].map((c) => (
                <Stack key={c.label} direction="row" spacing={1} alignItems="center" sx={{ py: 0.5, px: 1, borderRadius: 1, border: 1, borderColor: "divider" }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: c.color, border: c.color === "transparent" ? "1.5px solid" : "none", borderColor: "text.disabled", flexShrink: 0 }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" fontWeight={600} sx={{ fontSize: "0.7rem", display: "block" }}>{c.label}</Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.6rem" }}>{c.scope}</Typography>
                  </Box>
                </Stack>
              ))}
            </Box>
          </Card>
        </Stack>
      )}
    </Stack>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ══════════════════════════════════════════════════════════════════════════ */

export default function ComponentsPage() {
  const selectedRole = useAppSelector((s) => s.devPanel.selectedRole);
  const sections = ROLE_SECTIONS[selectedRole];
  const [pageTab, setPageTab] = useState(0);

  return (
    <Stack spacing={3} sx={{ maxWidth: pageTab === 1 ? 1100 : 800 }}>
      <Box>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.25 }}>
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: "1.125rem", md: "1.25rem" } }}>
            Components
          </Typography>
          {pageTab === 0 && <Chip label={selectedRole} size="small" sx={{ fontWeight: 600 }} />}
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {pageTab === 0
            ? <>Session card variants for the <strong>{selectedRole}</strong> persona. Switch roles in the Dev Panel to see other activity types.</>
            : "Visual audit of all card states, roles, and coverage across activity types."
          }
        </Typography>
      </Box>

      <Tabs
        value={pageTab}
        onChange={(_, v) => setPageTab(v)}
        sx={{ minHeight: 36, mb: -1, "& .MuiTab-root": { minHeight: 36, textTransform: "none", fontWeight: 600, fontSize: "0.85rem" } }}
      >
        <Tab label="Card Demos" />
        <Tab label="Audit Overview" />
      </Tabs>

      {pageTab === 0 ? (
        <>
          {sections.map((section) => (
            <Card key={section.label} sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>{section.label}</Typography>
              <Stack spacing={3} divider={<Divider />}>
                {section.render()}
              </Stack>
            </Card>
          ))}
        </>
      ) : (
        <AuditPanel />
      )}
    </Stack>
  );
}
