import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import SlideshowOutlinedIcon from "@mui/icons-material/SlideshowOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import DragIndicatorOutlinedIcon from "@mui/icons-material/DragIndicatorOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Typography from "@mui/material/Typography";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  setSessionFocus,
  confirmSession,
  setDeclineSessionFocus,
  setDeclineReason,
} from "@/store/slices/sessionsSlice";
import { setOpenSessionDetails, setOpenDeclineReason, setOpenLearnerRatings, setLearnerRatingsSessionId } from "@/store/slices/uiSlice";
import { addPoll, updatePoll, removePoll } from "@/store/slices/pollsSlice";
import { pushToast } from "@/store/slices/toastsSlice";
import { fmtDateNice, fmtTime12, fmtDuration, fmtInr, getTimeZoneOffsetMinutes, formatGMTOffsetFromMinutesAhead, applyTzOffset } from "@/lib/helpers";
import { demoNow } from "@/lib/constants";
import { demoCourseCatalog, demoLearnerRatingsBySessionId } from "@/data/demo-sessions";
import { dateTimeMs, sortByDateTime } from "@/lib/helpers";
import type { SessionPrepMaterial, Poll } from "@/lib/types";

const MATERIAL_ICONS: Record<SessionPrepMaterial["type"], React.ReactNode> = {
  slides: <SlideshowOutlinedIcon sx={{ fontSize: 15 }} />,
  document: <DescriptionOutlinedIcon sx={{ fontSize: 15 }} />,
  video: <VideocamOutlinedIcon sx={{ fontSize: 15 }} />,
  link: <LinkOutlinedIcon sx={{ fontSize: 15 }} />,
};

/* ── Shared layout primitives ── */

function DetailRow({ label, children, compact }: { label: string; children: React.ReactNode; compact?: boolean }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: compact ? 0.625 : 0.875 }}>
      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, minWidth: 100, fontSize: "0.8125rem" }}>
        {label}
      </Typography>
      <Box sx={{ textAlign: "right" }}>
        <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }} component="div">{children}</Typography>
      </Box>
    </Stack>
  );
}

function SectionHeading({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
      {icon && <Box sx={{ color: "text.secondary", display: "flex", flexShrink: 0 }}>{icon}</Box>}
      <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}>
        {children}
      </Typography>
    </Stack>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        borderRadius: "12px",
        border: 1,
        borderColor: "divider",
        bgcolor: "hsl(var(--md-surface))",
        p: 2,
      }}
    >
      {children}
    </Box>
  );
}

function AttendeeRow({
  title,
  subtitle,
  chipLabel,
}: {
  title: string;
  subtitle?: string;
  chipLabel: string;
}) {
  return (
    <Box
      sx={{
        borderRadius: "10px",
        border: 1,
        borderColor: "divider",
        bgcolor: "hsl(var(--md-surface))",
        px: 1.5,
        py: 0.875,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ display: "block", fontSize: "0.75rem", fontWeight: 600, lineHeight: 1.3 }} noWrap>
            {title}
          </Typography>
          {subtitle && (
            <Typography color="text.secondary" sx={{ display: "block", fontSize: "0.75rem", fontWeight: 400, lineHeight: 1.4 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Chip
          label={chipLabel}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 500, fontSize: "0.75rem", flexShrink: 0, height: 20, color: "text.secondary", borderColor: "divider" }}
        />
      </Stack>
    </Box>
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
  onSave: (data: { question: string; options: string[]; status: "draft" | "queued" }) => void;
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
                  sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.8125rem" } }}
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

/* ── Polls Section (Redux-connected) ── */

function PollsSection({ sessionId }: { sessionId: string }) {
  const dispatch = useAppDispatch();
  const allPolls = useAppSelector((s) => s.polls.items);
  const sessionPolls = allPolls.filter((p) => p.sessionId === sessionId);

  const [showForm, setShowForm] = useState(false);
  const [editingPollId, setEditingPollId] = useState<string | null>(null);

  const handleSave = (data: { question: string; options: string[]; status: "draft" | "queued" }) => {
    if (editingPollId) {
      dispatch(updatePoll({ id: editingPollId, sessionId, ...data }));
      dispatch(pushToast({ title: "Poll updated" }));
    } else {
      dispatch(addPoll({ id: `poll-${Date.now()}`, sessionId, ...data }));
      dispatch(pushToast({ title: data.status === "queued" ? "Poll queued to Zoom" : "Poll saved as draft" }));
    }
    setShowForm(false);
    setEditingPollId(null);
  };

  const handleDelete = (id: string) => {
    dispatch(removePoll(id));
    dispatch(pushToast({ title: "Poll deleted" }));
  };

  const handleToggleStatus = (poll: Poll) => {
    const newStatus = poll.status === "draft" ? "queued" as const : "draft" as const;
    dispatch(updatePoll({ ...poll, status: newStatus }));
    dispatch(pushToast({ title: newStatus === "queued" ? "Poll queued to Zoom" : "Poll moved to draft" }));
  };

  const handleEdit = (id: string) => {
    setEditingPollId(id);
    setShowForm(true);
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <PollOutlinedIcon sx={{ fontSize: 16, color: "primary.main" }} />
          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}>
            Polls
          </Typography>
          {sessionPolls.length > 0 && (
            <Chip
              label={sessionPolls.length}
              size="small"
              sx={{
                height: 18,
                minWidth: 18,
                fontSize: "0.6rem",
                fontWeight: 700,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                "& .MuiChip-label": { px: 0.5 },
              }}
            />
          )}
        </Stack>
        {!showForm && (
          <Button
            size="small"
            variant="soft"
            startIcon={<AddOutlinedIcon sx={{ fontSize: 14 }} />}
            onClick={() => { setEditingPollId(null); setShowForm(true); }}
            sx={{ fontSize: "0.75rem" }}
          >
            Add poll
          </Button>
        )}
      </Stack>

      <Stack spacing={1.5}>
        {sessionPolls.map((poll) => (
          <PollCard
            key={poll.id}
            poll={poll}
            onEdit={() => handleEdit(poll.id)}
            onDelete={() => handleDelete(poll.id)}
            onToggleStatus={() => handleToggleStatus(poll)}
          />
        ))}

        <Collapse in={showForm} unmountOnExit>
          <PollCreationForm
            editingPoll={editingPollId ? sessionPolls.find((p) => p.id === editingPollId) : null}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingPollId(null); }}
          />
        </Collapse>

        {sessionPolls.length === 0 && !showForm && (
          <Box
            sx={{
              py: 3,
              px: 2,
              borderRadius: "8px",
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
              onClick={() => setShowForm(true)}
            >
              Create your first poll
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SESSION DETAILS DRAWER (right-side panel)
   ══════════════════════════════════════════════════════════════════════════ */

export function SessionDetailsModal() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const open = useAppSelector((s) => s.ui.openSessionDetails);
  const session = useAppSelector((s) => s.sessions.sessionFocus);
  const confirmations = useAppSelector((s) => s.sessions.confirmations);
  const allSessions = useAppSelector((s) => s.sessions.items);
  const sessionDeclined = useAppSelector((s) => s.sessions.sessionDeclined);
  const paymentsShowValues = useAppSelector((s) => s.ui.paymentsShowValues);
  const nowMs = demoNow.getTime();
  const tzOffset = useAppSelector((s) => s.profile.tzOffsetMinutes);

  /* Drawer-scoped Remuneration visibility. When opened on /payments the
     drawer inherits the page-level toggle, so a guru who already revealed
     their values keeps seeing them. Everywhere else it defaults hidden so
     remuneration isn't leaked in over-the-shoulder / screen-share scenarios.
     Toggling inside the drawer is local — it never writes back to the
     Payments page state. The state resets on each open. */
  const isOnPaymentsPage = location.pathname.startsWith("/payments");
  const [drawerShowValues, setDrawerShowValues] = useState(false);
  useEffect(() => {
    if (open) setDrawerShowValues(isOnPaymentsPage ? paymentsShowValues : false);
    // intentionally omit paymentsShowValues — we only want the initial snapshot
    // at open-time; later edits on Payments shouldn't retroactively flip the drawer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isOnPaymentsPage]);

  const maskInr = (value: string) => drawerShowValues ? value : value.replace(/[0-9]/g, "•");

  const nextSessionId = sortByDateTime(allSessions).find(
    (s) => dateTimeMs(s.dateYmd, s.start) >= nowMs && !sessionDeclined[s.id]
  )?.id ?? null;

  const handleClose = () => {
    dispatch(setOpenSessionDetails(false));
    dispatch(setSessionFocus(null));
  };

  const isConfirmed = session ? (!!confirmations[session.id] || session.id === nextSessionId) : false;
  const isCompleted = session ? dateTimeMs(session.dateYmd, session.end) < nowMs : false;
  const isPast = session ? dateTimeMs(session.dateYmd, session.start) < nowMs : false;
  const isMissed = isPast && !isConfirmed && !isCompleted;
  const linkedCourse = session?.linkedCourseId
    ? demoCourseCatalog.find((c) => c.id === session.linkedCourseId)
    : null;
  const isMentoring = session?.sessionType === "Career mentoring session";
  const selectedRole = useAppSelector((s) => s.devPanel.selectedRole);
  const isSecondaryGuru = selectedRole === "Secondary Guru";
  /* Polls: hidden for Secondary Gurus per spec (no create / no view). */
  const showPolls = session && isConfirmed && !isCompleted && !isSecondaryGuru;

  /* Status chip config */
  const statusLabel = isCompleted ? "Completed" : isMissed ? "Missed" : isConfirmed ? "Confirmed" : isPast ? "Past" : "Scheduled";
  const statusSx = isCompleted
    ? { bgcolor: "var(--gl-status-completed-bg)", color: "var(--gl-status-completed-text)", border: "1px solid var(--gl-status-completed-border)" }
    : isConfirmed
      ? { bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)" }
      : isMissed || isPast
        ? { bgcolor: "var(--gl-status-declined-bg)", color: "var(--gl-status-declined-text)", border: "1px solid var(--gl-status-declined-border)" }
        : { bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)" };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      slotProps={{ transition: { onExited: () => dispatch(setSessionFocus(null)) } }}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100vw", sm: 480 },
          maxWidth: "100vw",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.06)",
          borderLeft: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>

        {/* ── Sticky header with status ── */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.8125rem" }}>Activity Details</Typography>
            {session && (
              <Chip
                label={statusLabel}
                size="small"
                sx={{ fontWeight: 600, fontSize: "0.7rem", height: 22, ...statusSx }}
              />
            )}
          </Stack>
          <IconButton size="small" onClick={handleClose} sx={{ color: "text.secondary" }}>
            <CloseOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        {/* ── Scrollable content ── */}
        <Box className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto", scrollbarGutter: "stable" }}>
          {session ? (
            <>
              {/* ═══ HERO: Title + Schedule at-a-glance ═══ */}
              <Box sx={{ px: 2, pt: 2, pb: 2 }}>
                {/* Session type */}
                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ letterSpacing: "0.02em", mb: 0.5, display: "block" }}>
                  {session.sessionType}
                </Typography>
                {/* Title */}
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.05rem", lineHeight: 1.3, mb: 0.25 }}>
                  {session.title}
                </Typography>
                {session.topic && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>
                    {session.topic}
                  </Typography>
                )}

                {/* Schedule at-a-glance */}
                <Box
                  sx={{
                    mt: 2,
                    p: 1.75,
                    borderRadius: "12px",
                    bgcolor: "hsl(var(--md-surface-container) / 0.5)",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Stack spacing={1}>
                    {/* Date + Time - hero line */}
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "hsl(var(--md-primary-container))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: "hsl(var(--md-on-primary-container))" }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ fontSize: "0.875rem", lineHeight: 1.2 }}>
                          {fmtDateNice(session.dateYmd)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          {fmtTime12(applyTzOffset(session.start, tzOffset))}&ndash;{fmtTime12(applyTzOffset(session.end, tzOffset))} &middot; {fmtDuration(session.start, session.end)}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Location */}
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "hsl(var(--md-surface-container))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <PlaceOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.8125rem", lineHeight: 1.2 }}>
                          {session.location}
                        </Typography>
                        {session.timeZone && (
                          <Typography variant="caption" color="text.secondary">
                            {session.timeZone} ({formatGMTOffsetFromMinutesAhead(getTimeZoneOffsetMinutes(session.timeZone))})
                          </Typography>
                        )}
                      </Box>
                      {session.location.toLowerCase() !== "online" ? (
                        <Button
                          variant="soft"
                          size="small"
                          startIcon={<PlaceOutlinedIcon sx={{ fontSize: 14 }} />}
                          onClick={() => {
                            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(session.location)}`, "_blank");
                          }}
                          sx={{ flexShrink: 0 }}
                        >
                          View map
                        </Button>
                      ) : (() => {
                        const sessionStartMs = dateTimeMs(session.dateYmd, session.start);
                        const sessionEndMs = dateTimeMs(session.dateYmd, session.end);
                        const nowMs = demoNow.getTime();
                        const joinEnabled = nowMs >= sessionStartMs - 15 * 60 * 1000 && nowMs < sessionEndMs;
                        return (
                          <Button
                            variant={joinEnabled ? "contained" : "soft"}
                            size="small"
                            disabled={!joinEnabled}
                            startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}
                            sx={{ flexShrink: 0 }}
                          >
                            Join session
                          </Button>
                        );
                      })()}
                    </Stack>

                    {/* Residency day-by-day schedule */}
                    {session.residencySchedule && session.residencySchedule.length > 0 && (() => {
                      // Group schedule entries by day number based on unique dates
                      const uniqueDates = [...new Set(session.residencySchedule.map((d) => d.dateYmd))];
                      return (
                        <>
                          <Divider />
                          <Box>
                            <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ fontSize: "0.65rem", letterSpacing: "0.08em", mb: 1, display: "block" }}>
                              {uniqueDates.length}-day schedule
                            </Typography>
                            <Box sx={{ borderRadius: "8px", border: 1, borderColor: "divider", overflow: "hidden" }}>
                              {session.residencySchedule.map((day, idx) => {
                                const dayNum = uniqueDates.indexOf(day.dateYmd) + 1;
                                return (
                                  <Stack
                                    key={idx}
                                    direction="row"
                                    alignItems="center"
                                    sx={{
                                      px: 1.5,
                                      py: 1,
                                      ...(idx < session.residencySchedule!.length - 1 && { borderBottom: 1, borderColor: "divider" }),
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      fontWeight={700}
                                      sx={{
                                        fontSize: "0.7rem",
                                        color: "primary.main",
                                        minWidth: 44,
                                        lineHeight: 1.2,
                                      }}
                                    >
                                      Day {dayNum}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem", ml: 2, minWidth: 90 }}>
                                      {fmtDateNice(day.dateYmd)}
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.8rem", ml: "auto", whiteSpace: "nowrap" }}>
                                      {fmtTime12(applyTzOffset(day.start, tzOffset))} – {fmtTime12(applyTzOffset(day.end, tzOffset))}
                                    </Typography>
                                  </Stack>
                                );
                              })}
                            </Box>
                          </Box>
                        </>
                      );
                    })()}
                  </Stack>
                </Box>
              </Box>

              <Divider />

              {/* ═══ DETAIL SECTIONS ═══ */}
              <Stack spacing={0} sx={{ px: 2, py: 2 }}>

                {/* ── Details ── */}
                <Box sx={{ mb: 2.5 }}>
                  <SectionHeading icon={<InfoOutlinedIcon sx={{ fontSize: 14 }} />}>Details</SectionHeading>
                  <SectionCard>
                    {session.cohort && <DetailRow label="Batch">{session.cohort}</DetailRow>}
                    {session.group && !session.groupMembers && !isMentoring && (
                      <DetailRow label="Group">
                        <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                          <GroupsOutlinedIcon sx={{ fontSize: 14 }} />
                          <span>{session.group}</span>
                        </Stack>
                      </DetailRow>
                    )}
                    {session.scheduledByEmail && (
                      <DetailRow label="Contact">
                        <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                          <MailOutlinedIcon sx={{ fontSize: 13 }} />
                          <span>{session.scheduledByEmail}</span>
                          <IconButton size="small" onClick={() => navigator.clipboard.writeText(session.scheduledByEmail!)} sx={{ p: 0.25, ml: 0.25 }}>
                            <ContentCopyOutlinedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                          </IconButton>
                        </Stack>
                      </DetailRow>
                    )}
                  </SectionCard>
                </Box>

                {/* ── Attendees ── (hidden for Career mentoring 1:1 — single learner shown in Learner Details) */}
                {!isMentoring && ((session.group && session.groupMembers && session.groupMembers.length > 0) ||
                  (session.combinedBatches && session.combinedBatches.length > 0)) && (
                  <Box sx={{ mb: 2.5 }}>
                    <SectionHeading icon={<GroupsOutlinedIcon sx={{ fontSize: 14 }} />}>Attendees</SectionHeading>

                    {/* Group sub-section */}
                    {session.group && session.groupMembers && session.groupMembers.length > 0 && (
                      <Box sx={{ mb: session.combinedBatches && session.combinedBatches.length > 0 ? 2 : 0 }}>
                        <Typography variant="overline" fontWeight={600} color="text.secondary" sx={{ display: "block", mb: 0.75, fontSize: "0.625rem", lineHeight: 1.6 }}>
                          Group
                        </Typography>
                        <AttendeeRow
                          title={`${session.group} · ${session.batch ?? session.cohort}`}
                          subtitle={`${session.groupMembers.length} learner${session.groupMembers.length !== 1 ? "s" : ""}`}
                          chipLabel="Group"
                        />
                      </Box>
                    )}

                    {/* Combined sub-section */}
                    {session.combinedBatches && session.combinedBatches.length > 0 && (
                      <Box>
                        <Typography variant="overline" fontWeight={600} color="text.secondary" sx={{ display: "block", mb: 0.75, fontSize: "0.625rem", lineHeight: 1.6 }}>
                          Combined session &middot; {session.combinedBatches.reduce((sum, cb) => sum + (cb.audienceType === "Individual" ? (cb.members?.length ?? cb.learnerCount ?? 0) : (cb.learnerCount ?? 0)), 0)} members
                        </Typography>
                        <Stack spacing={1}>
                          {session.combinedBatches.flatMap((cb) => {
                            if (cb.audienceType === "Individual") {
                              const individuals = cb.members && cb.members.length > 0
                                ? cb.members.map((_m, i) => ({ key: cb.batch + "-ind-" + i }))
                                : [{ key: cb.batch + "-ind" }];
                              return individuals.map((row) => (
                                <AttendeeRow
                                  key={row.key}
                                  title={cb.batch}
                                  subtitle="1 learner"
                                  chipLabel="Individual"
                                />
                              ));
                            }
                            return [
                              <AttendeeRow
                                key={cb.batch + (cb.group || "")}
                                title={cb.batch}
                                subtitle={cb.learnerCount != null ? `${cb.learnerCount} learner${cb.learnerCount !== 1 ? "s" : ""}` : undefined}
                                chipLabel={cb.audienceType === "Batch" ? "Whole batch" : "Group"}
                              />,
                            ];
                          })}
                        </Stack>
                      </Box>
                    )}
                  </Box>
                )}

                {/* ── Linked course ── (hidden for Career mentoring 1:1 — no course attached) */}
                {linkedCourse && !isMentoring && (
                  <Box sx={{ mb: 2.5 }}>
                    <SectionHeading icon={<MenuBookOutlinedIcon sx={{ fontSize: 14 }} />}>Linked course</SectionHeading>
                    <SectionCard>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }}>{linkedCourse.title}</Typography>
                        <Button
                          variant="text"
                          size="small"
                          startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 13 }} />}
                          onClick={() => {
                            handleClose();
                            navigate("/courses");
                            dispatch(pushToast({ title: "Course content", description: `Viewing ${linkedCourse.title}` }));
                          }}
                          sx={{ fontSize: "0.75rem", flexShrink: 0 }}
                        >
                          View
                        </Button>
                      </Stack>
                    </SectionCard>
                  </Box>
                )}

                {/* ── Session materials ── */}
                {session.prepMaterials && session.prepMaterials.length > 0 && (
                  <Box sx={{ mb: 2.5 }}>
                    <SectionHeading icon={<FolderOutlinedIcon sx={{ fontSize: 14 }} />}>Session materials</SectionHeading>
                    <Stack spacing={0.5}>
                      {session.prepMaterials.map((m) => {
                        const isVideo = m.type === "video";
                        return (
                          <Stack
                            key={m.id}
                            direction="row"
                            alignItems="center"
                            sx={{
                              py: 0.875,
                              px: 1.25,
                              borderRadius: "12px",
                              border: "1px solid",
                              borderColor: "divider",
                              "&:hover": { bgcolor: "action.hover", borderColor: "text.disabled" },
                              transition: "all 0.12s ease",
                            }}
                          >
                            <Box sx={{ color: "text.secondary", display: "flex", mr: 1.25 }}>{MATERIAL_ICONS[m.type]}</Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }}>{m.label}</Typography>
                              <Typography variant="caption" color="text.disabled" sx={{ textTransform: "uppercase", fontSize: "0.6rem", letterSpacing: "0.04em" }}>
                                {m.type === "slides" ? "Slides" : m.type === "document" ? "Document" : m.type === "video" ? "Video" : "Link"}
                              </Typography>
                            </Box>
                            {isVideo ? (
                              <Button
                                variant="text"
                                size="small"
                                startIcon={<PlayCircleOutlinedIcon sx={{ fontSize: 14 }} />}
                                onClick={() => dispatch(pushToast({ title: "Playing video", description: m.label }))}
                                sx={{ fontSize: "0.7rem", flexShrink: 0 }}
                              >
                                Watch
                              </Button>
                            ) : (
                              <Button
                                variant="text"
                                size="small"
                                startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 14 }} />}
                                onClick={() => dispatch(pushToast({ title: "Downloading", description: m.label }))}
                                sx={{ fontSize: "0.7rem", flexShrink: 0 }}
                              >
                                Download
                              </Button>
                            )}
                          </Stack>
                        );
                      })}
                    </Stack>
                  </Box>
                )}

                {/* ── Learner Details (every Career mentoring session) ── */}
                {isMentoring && (() => {
                  const lc = session.learnerContext ?? {};
                  const displayName = lc.learnerName ?? "Learner";
                  const initials = displayName.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
                  const subline = [lc.designation, lc.companyName].filter(Boolean).join(" · ");
                  const hasLinks = Boolean(lc.linkedInUrl || lc.resumeUrl || lc.learnerProfileUrl);
                  return (
                    <Box sx={{ mb: 2.5 }}>
                      <SectionHeading icon={<PersonOutlinedIcon sx={{ fontSize: 14 }} />}>Learner Details</SectionHeading>
                      <SectionCard>
                        {/* Identity row */}
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            src={lc.imageUrl || undefined}
                            alt={displayName}
                            sx={{
                              width: 48, height: 48,
                              bgcolor: "hsl(var(--md-primary-container))",
                              color: "hsl(var(--md-on-primary-container))",
                              fontSize: "0.9rem",
                              fontWeight: 600,
                            }}
                          >
                            {initials || "L"}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body1" fontWeight={600} sx={{ fontSize: "0.95rem", lineHeight: 1.3, color: "hsl(var(--md-on-surface))" }} noWrap>
                              {displayName}
                            </Typography>
                            {subline && (
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem", lineHeight: 1.4 }} noWrap>
                                {subline}
                              </Typography>
                            )}
                            {typeof lc.experience === "number" && (
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", display: "block", mt: 0.25 }}>
                                {lc.experience} {lc.experience === 1 ? "year" : "years"} experience
                              </Typography>
                            )}
                          </Box>
                        </Stack>

                        {/* Agenda */}
                        <Box sx={{ mt: 2 }}>
                          <Typography
                            variant="overline"
                            sx={{ display: "block", fontWeight: 700, fontSize: "0.65rem", color: "text.secondary", letterSpacing: "0.08em", mb: 0.75 }}
                          >
                            Agenda
                          </Typography>
                          <Box
                            sx={{
                              p: 1.25,
                              borderRadius: "10px",
                              bgcolor: "hsl(var(--md-surface-container) / 0.4)",
                              fontSize: "0.8125rem",
                              lineHeight: 1.55,
                              color: lc.agenda ? "hsl(var(--md-on-surface))" : "hsl(var(--md-on-surface-variant))",
                              whiteSpace: "pre-wrap",
                              fontStyle: lc.agenda ? "normal" : "italic",
                            }}
                          >
                            {lc.agenda || "The learner has not shared an agenda yet."}
                          </Box>
                        </Box>

                        {/* Action links */}
                        {hasLinks && (
                          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
                            {lc.linkedInUrl && (
                              <Button
                                variant="soft" size="small"
                                startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 14 }} />}
                                component="a" href={lc.linkedInUrl} target="_blank" rel="noopener"
                                sx={{ fontSize: "0.75rem" }}
                              >
                                View LinkedIn
                              </Button>
                            )}
                            {lc.resumeUrl && (
                              <Button
                                variant="soft" size="small"
                                startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 14 }} />}
                                component="a" href={lc.resumeUrl} target="_blank" rel="noopener"
                                sx={{ fontSize: "0.75rem" }}
                              >
                                View Resume
                              </Button>
                            )}
                            {lc.learnerProfileUrl && (
                              <Button
                                variant="soft" size="small"
                                startIcon={<AccountCircleOutlinedIcon sx={{ fontSize: 14 }} />}
                                component="a" href={lc.learnerProfileUrl} target="_blank" rel="noopener"
                                sx={{ fontSize: "0.75rem" }}
                              >
                                View Profile
                              </Button>
                            )}
                          </Stack>
                        )}

                        {/* Notes (carry-over from older data shape) */}
                        {lc.notes && (
                          <Box
                            sx={{
                              mt: 1.5,
                              p: 1.25,
                              borderRadius: "10px",
                              bgcolor: "hsl(var(--md-surface-container) / 0.3)",
                              fontSize: "0.8rem",
                              color: "hsl(var(--md-on-surface-variant))",
                              lineHeight: 1.5,
                            }}
                          >
                            {lc.notes}
                          </Box>
                        )}
                      </SectionCard>
                    </Box>
                  );
                })()}

                {/* ── Polls ── */}
                {showPolls && (
                  <Box sx={{ mb: 2.5 }}>
                    <PollsSection sessionId={session.id} />
                  </Box>
                )}

                {/* ── Recording ── */}
                {isCompleted && session.recordingUrl && (
                  <Box sx={{ mb: 2.5 }}>
                    <SectionHeading icon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Recording</SectionHeading>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1.25}
                      sx={{
                        py: 0.875,
                        px: 1.25,
                        borderRadius: "12px",
                        border: "1px solid",
                        borderColor: "divider",
                        "&:hover": { bgcolor: "action.hover", borderColor: "text.disabled" },
                        cursor: "pointer",
                        transition: "all 0.12s ease",
                      }}
                      onClick={() => dispatch(pushToast({ title: "Opening recording", description: `Launching recording for ${session.title}` }))}
                    >
                      <VideocamOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
                      <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }}>Watch session recording</Typography>
                    </Stack>
                  </Box>
                )}

                {/* ── Feedback ── */}
                {isCompleted && (() => {
                  const ratings = demoLearnerRatingsBySessionId[session.id];
                  const hasRatings = ratings && ratings.length > 0;
                  const avg = hasRatings
                    ? (ratings.reduce((a, r) => a + r.rating, 0) / ratings.length).toFixed(1)
                    : null;
                  const daysSince = (nowMs - new Date(session.dateYmd).getTime()) / (1000 * 60 * 60 * 24);
                  return (
                    <Box sx={{ mb: 2.5 }}>
                      <SectionHeading icon={<StarOutlinedIcon sx={{ fontSize: 14, color: "var(--gl-star-color)" }} />}>Feedback</SectionHeading>
                      <SectionCard>
                        {hasRatings ? (
                          <>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                              <Stack direction="row" alignItems="center" spacing={0.75}>
                                <StarOutlinedIcon sx={{ fontSize: 18, color: "var(--gl-star-color)" }} />
                                <Typography variant="body1" fontWeight={700} sx={{ fontSize: "1.1rem" }}>{avg}</Typography>
                                <Typography variant="caption" color="text.secondary">({ratings.length})</Typography>
                              </Stack>
                              <Button
                                variant="soft"
                                size="small"
                                onClick={() => {
                                  dispatch(setLearnerRatingsSessionId(session.id));
                                  dispatch(setOpenLearnerRatings(true));
                                }}
                                sx={{ fontSize: "0.75rem" }}
                              >
                                View details
                              </Button>
                            </Stack>
                          </>
                        ) : (
                          <Stack direction="row" alignItems="center" spacing={0.75}>
                            <StarOutlinedIcon sx={{ fontSize: 18, color: "action.disabled" }} />
                            <Typography variant="body1" fontWeight={700} sx={{ color: "action.disabled", fontSize: "1.1rem" }}>--</Typography>
                            <Typography variant="caption" sx={{ color: "action.disabled" }}>
                              {daysSince > 30 ? "No feedback" : "Gathering feedback"}
                            </Typography>
                          </Stack>
                        )}
                      </SectionCard>
                    </Box>
                  );
                })()}

                {/* ── Remuneration ── */}
                {(isConfirmed || isCompleted) && session.paymentAmountInr && (
                  <Box sx={{ mb: 1 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                      <SectionHeading icon={<SavingsOutlinedIcon sx={{ fontSize: 14 }} />}>Remuneration</SectionHeading>
                      {/* Per-drawer show-values toggle — visually matches the
                          Payments page pill toggle so users see a consistent
                          affordance across surfaces. */}
                      <Box
                        component="label"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          cursor: "pointer",
                          userSelect: "none",
                          bgcolor: drawerShowValues ? "action.hover" : "transparent",
                          border: "1px solid",
                          borderColor: drawerShowValues ? "text.disabled" : "divider",
                          borderRadius: "20px",
                          pl: 1.5,
                          pr: 0.5,
                          py: 0.25,
                          transition: "all 0.2s ease",
                        }}
                      >
                        <VisibilityOffOutlinedIcon sx={{ fontSize: 16, color: "text.secondary", opacity: drawerShowValues ? 1 : 0.5, transition: "opacity 0.2s" }} />
                        <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 600, color: "text.secondary", whiteSpace: "nowrap" }}>
                          Show values
                        </Typography>
                        <Switch
                          size="small"
                          checked={drawerShowValues}
                          onChange={() => setDrawerShowValues((v) => !v)}
                          sx={{
                            width: 32,
                            height: 18,
                            p: 0,
                            "& .MuiSwitch-switchBase": {
                              p: "2px",
                              "&.Mui-checked": {
                                transform: "translateX(14px)",
                                "& + .MuiSwitch-track": { bgcolor: "primary.main", opacity: 0.35 },
                              },
                            },
                            "& .MuiSwitch-thumb": { width: 14, height: 14, boxShadow: "none" },
                            "& .MuiSwitch-track": { borderRadius: 9, bgcolor: "action.disabled", opacity: 1 },
                          }}
                        />
                      </Box>
                    </Stack>
                    {(() => {
                      /* Five-row summary spec: Type, Status, Transaction ID,
                         Amount, Net amount. Model/Rate/Breakdown and the
                         nested "total earnings" sub-card are intentionally
                         dropped in favor of this flat layout. */
                      const statusLabel =
                        session.paymentStatus === "paid" ? "Completed"
                          : session.paymentStatus === "invoice_pending" ? "Invoice Pending"
                          : session.paymentStatus === "invoice_not_raised" ? "Invoice Not Raised"
                          : isCompleted ? "Completed"
                          : "Pending";
                      const gross = session.paymentAmountInr ?? 0;
                      const net = session.totalEarningsInr ?? gross;
                      const inrAmount = `INR ${gross.toLocaleString("en-IN")}`;
                      const inrNet = `INR ${net.toLocaleString("en-IN")}`;
                      const txn = session.transactionId;
                      const txnDisplay = txn
                        ? (drawerShowValues ? txn : txn.replace(/[A-Za-z0-9]/g, "•"))
                        : "–";
                      return (
                        <SectionCard>
                          <DetailRow label="Type" compact>Fee Payment</DetailRow>
                          <DetailRow label="Status" compact>{statusLabel}</DetailRow>
                          <DetailRow label="Transaction ID" compact>
                            <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem", fontFamily: txn ? "monospace" : undefined }}>
                              {txnDisplay}
                            </Typography>
                          </DetailRow>
                          <DetailRow label="Amount" compact>{maskInr(inrAmount)}</DetailRow>
                          <DetailRow label="Net amount" compact>{maskInr(inrNet)}</DetailRow>
                        </SectionCard>
                      );
                    })()}
                  </Box>
                )}
              </Stack>
            </>
          ) : (
            <Box sx={{ px: 2, py: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">No event selected.</Typography>
            </Box>
          )}
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
            px: 2,
            py: 1.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <Button variant="text" color="inherit" size="small" onClick={handleClose}>
            Close
          </Button>
          {session && !isCompleted && !isPast && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="soft"
                size="small"
                startIcon={<CancelOutlinedIcon sx={{ fontSize: 15 }} />}
                onClick={() => {
                  dispatch(setDeclineSessionFocus(session));
                  dispatch(setDeclineReason(""));
                  dispatch(setOpenSessionDetails(false));
                  dispatch(setOpenDeclineReason(true));
                }}
              >
                I'm unavailable
              </Button>
              {!isConfirmed && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CheckCircleOutlinedIcon sx={{ fontSize: 15 }} />}
                  onClick={() => {
                    dispatch(confirmSession(session.id));
                    dispatch(pushToast({ title: "Confirmed", description: `${session.title} \u2022 ${fmtDateNice(session.dateYmd)}` }));
                  }}
                >
                  Confirm
                </Button>
              )}
            </Stack>
          )}
          {session && isPast && !isCompleted && (
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.75rem" }}>
              This session has passed
            </Typography>
          )}
          {session && isCompleted && (
            <Stack direction="row" spacing={1}>
              {session.recordingUrl && (
                <Button
                  variant="soft"
                  size="small"
                  startIcon={<VideocamOutlinedIcon sx={{ fontSize: 15 }} />}
                  onClick={() => dispatch(pushToast({ title: "Opening recording" }))}
                >
                  Recording
                </Button>
              )}
              <Button
                variant="soft"
                size="small"
                onClick={() => { handleClose(); navigate("/payments"); }}
              >
                View in payments
              </Button>
            </Stack>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
