import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import DragIndicatorOutlinedIcon from "@mui/icons-material/DragIndicatorOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  setSessionFocus,
  confirmSession,
  setDeclineSessionFocus,
  setDeclineReason,
} from "@/store/slices/sessionsSlice";
import { setOpenSessionDetails, setOpenDeclineReason } from "@/store/slices/uiSlice";
import { addPoll, updatePoll, removePoll } from "@/store/slices/pollsSlice";
import { pushToast } from "@/store/slices/toastsSlice";
import { fmtDateNice, fmtTime12, fmtDuration, fmtInr, getTimeZoneOffsetMinutes, formatGMTOffsetFromMinutesAhead } from "@/lib/helpers";
import { demoNow } from "@/lib/constants";
import { demoCourseCatalog } from "@/data/demo-sessions";
import { dateTimeMs, sortByDateTime } from "@/lib/helpers";
import type { SessionPrepMaterial, Poll } from "@/lib/types";

const MATERIAL_ICONS: Record<SessionPrepMaterial["type"], React.ReactNode> = {
  slides: <SlideshowOutlinedIcon sx={{ fontSize: 14 }} />,
  document: <DescriptionOutlinedIcon sx={{ fontSize: 14 }} />,
  video: <VideocamOutlinedIcon sx={{ fontSize: 14 }} />,
  link: <LinkOutlinedIcon sx={{ fontSize: 14 }} />,
};

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ py: 1.25 }}>
      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, minWidth: 120 }}>
        {label}
      </Typography>
      <Box sx={{ textAlign: "right" }}>
        <Typography variant="body2" fontWeight={500}>{children}</Typography>
      </Box>
    </Stack>
  );
}

function SectionBox({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        borderRadius: "16px",
        border: 1,
        borderColor: "divider",
        backgroundColor: "hsl(var(--md-surface))",
        p: 2,
      }}
    >
      {children}
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
        borderRadius: 2,
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
                borderRadius: 1.5,
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
        borderRadius: 2,
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
          <Typography variant="subtitle2" fontWeight={700}>Polls</Typography>
          {sessionPolls.length > 0 && (
            <Chip
              label={sessionPolls.length}
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
  const open = useAppSelector((s) => s.ui.openSessionDetails);
  const session = useAppSelector((s) => s.sessions.sessionFocus);
  const confirmations = useAppSelector((s) => s.sessions.confirmations);
  const allSessions = useAppSelector((s) => s.sessions.items);
  const sessionDeclined = useAppSelector((s) => s.sessions.sessionDeclined);
  const nowMs = demoNow.getTime();

  // The next upcoming session (first in sorted upcoming list) is always treated as confirmed
  const nextSessionId = sortByDateTime(allSessions).find(
    (s) => dateTimeMs(s.dateYmd, s.start) >= nowMs && !sessionDeclined[s.id]
  )?.id ?? null;

  const handleClose = () => {
    dispatch(setOpenSessionDetails(false));
    dispatch(setSessionFocus(null));
  };

  const isConfirmed = session ? (!!confirmations[session.id] || session.id === nextSessionId) : false;
  const isCompleted = session ? dateTimeMs(session.dateYmd, session.end) < nowMs : false;
  const linkedCourse = session?.linkedCourseId
    ? demoCourseCatalog.find((c) => c.id === session.linkedCourseId)
    : null;
  const isMentoring = session?.sessionType === "Career mentoring session";

  // Show polls for confirmed, non-completed sessions
  const showPolls = session && isConfirmed && !isCompleted;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      SlideProps={{ onExited: () => dispatch(setSessionFocus(null)) }}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100vw", sm: 520 },
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
          <IconButton size="small" onClick={handleClose} sx={{ color: "text.secondary" }}>
            <CloseOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* ── Scrollable content ── */}
        <Box className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto", px: 3, py: 2.5 }}>
          {session ? (
            <Stack spacing={2.5}>
              {/* Header: breadcrumb + status + title */}
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ letterSpacing: "0.02em" }}>
                    {[session.batch || session.program, session.sessionType].filter(Boolean).join(" · ")}
                  </Typography>
                  {isConfirmed && (
                    <Chip
                      label="Confirmed"
                      size="small"
                      sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }}
                    />
                  )}
                  {!isConfirmed && !isCompleted && (
                    <Chip
                      label="Scheduled"
                      size="small"
                      sx={{ bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)", fontWeight: 600 }}
                    />
                  )}
                  {isCompleted && (
                    <Chip
                      label="Completed"
                      size="small"
                      sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)", fontWeight: 600 }}
                    />
                  )}
                </Stack>
                <Typography variant="h6" fontWeight={600}>{session.title}</Typography>
              </Box>

              {/* Schedule info */}
              <SectionBox>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Schedule</Typography>
                <Divider sx={{ mb: 0.5 }} />
                <InfoRow label="Date">
                  <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} />
                    <span>{fmtDateNice(session.dateYmd)}</span>
                  </Stack>
                </InfoRow>
                <InfoRow label="Time">
                  <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                    <AccessTimeOutlinedIcon sx={{ fontSize: 13 }} />
                    <span>{fmtTime12(session.start)}&ndash;{fmtTime12(session.end)}</span>
                  </Stack>
                </InfoRow>
                <InfoRow label="Duration">{fmtDuration(session.start, session.end)}</InfoRow>
                {session.timeZone && (
                  <InfoRow label="Time zone">
                    <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                      <LanguageOutlinedIcon sx={{ fontSize: 13 }} />
                      <span>{session.timeZone} ({formatGMTOffsetFromMinutesAhead(getTimeZoneOffsetMinutes(session.timeZone))})</span>
                    </Stack>
                  </InfoRow>
                )}
                <InfoRow label="Location">
                  <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                    <PlaceOutlinedIcon sx={{ fontSize: 13 }} />
                    <span>{session.location}</span>
                  </Stack>
                </InfoRow>
              </SectionBox>

              {/* Scheduling metadata */}
              <SectionBox>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Details</Typography>
                <Divider sx={{ mb: 0.5 }} />
                {session.scheduledByName && (
                  <InfoRow label="Scheduled by">
                    <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                      <AccountCircleOutlinedIcon sx={{ fontSize: 13 }} />
                      <span>{session.scheduledByName}</span>
                    </Stack>
                    {session.scheduledByEmail && (
                      <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                        <MailOutlinedIcon sx={{ fontSize: 12 }} />
                        <Typography variant="caption" color="text.secondary">
                          {session.scheduledByEmail}
                        </Typography>
                      </Stack>
                    )}
                    {session.scheduledOnYmd && (
                      <Typography variant="caption" color="text.secondary">
                        on {fmtDateNice(session.scheduledOnYmd)}
                      </Typography>
                    )}
                  </InfoRow>
                )}
                {session.cohort && (
                  <InfoRow label="Batch">{session.cohort}</InfoRow>
                )}
                {session.group && (
                  <InfoRow label="Group">
                    <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                      <GroupsOutlinedIcon sx={{ fontSize: 13 }} />
                      <span>{session.group}</span>
                    </Stack>
                  </InfoRow>
                )}
                {session.audienceType && (
                  <InfoRow label="Audience">{session.audienceType}</InfoRow>
                )}
              </SectionBox>

              {/* Predicted groups */}
              {session.predictedGroups && session.predictedGroups.length > 0 && (
                <SectionBox>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Predicted groups</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {session.predictedGroups.map((g) => (
                      <Chip key={g} label={g} size="small" />
                    ))}
                  </Stack>
                </SectionBox>
              )}

              {/* Linked course */}
              {linkedCourse && (
                <SectionBox>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Linked course</Typography>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                    <Typography variant="body2">{linkedCourse.title}</Typography>
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 14 }} />}
                      onClick={() => {
                        handleClose();
                        navigate("/courses");
                        dispatch(pushToast({ title: "Course content", description: `Viewing ${linkedCourse.title}` }));
                      }}
                    >
                      View course
                    </Button>
                  </Stack>
                </SectionBox>
              )}

              {/* Preparation / Event materials */}
              {!isMentoring && session.prepMaterials && session.prepMaterials.length > 0 && (
                <SectionBox>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Event materials</Typography>
                  <Stack spacing={0.75}>
                    {session.prepMaterials.map((m) => (
                      <Stack
                        key={m.id}
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                          py: 0.75,
                          px: 1,
                          borderRadius: "8px",
                          "&:hover": { bgcolor: "action.hover" },
                          cursor: "pointer",
                        }}
                        onClick={() => dispatch(pushToast({ title: "Opening", description: m.label }))}
                      >
                        <Box sx={{ color: "text.secondary", display: "flex" }}>{MATERIAL_ICONS[m.type]}</Box>
                        <Typography variant="body2">{m.label}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </SectionBox>
              )}

              {/* Learner context (1:1 sessions) */}
              {isMentoring && session.learnerContext && (
                <SectionBox>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Learner context</Typography>
                  <Divider sx={{ mb: 0.5 }} />
                  {session.learnerContext.learnerName && (
                    <InfoRow label="Learner">{session.learnerContext.learnerName}</InfoRow>
                  )}
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                    {session.learnerContext.resumeUrl && (
                      <Button
                        variant="soft"
                        size="small"
                        startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 14 }} />}
                        onClick={() => dispatch(pushToast({ title: "Opening resume", description: "Downloading learner resume..." }))}
                      >
                        Resume
                      </Button>
                    )}
                    {session.learnerContext.linkedInUrl && (
                      <Button
                        variant="soft"
                        size="small"
                        startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 14 }} />}
                        onClick={() => dispatch(pushToast({ title: "Opening LinkedIn", description: "Launching LinkedIn profile..." }))}
                      >
                        LinkedIn
                      </Button>
                    )}
                    {session.learnerContext.learnerProfileUrl && (
                      <Button
                        variant="soft"
                        size="small"
                        startIcon={<AccountCircleOutlinedIcon sx={{ fontSize: 14 }} />}
                        onClick={() => dispatch(pushToast({ title: "Opening profile", description: "Launching learner profile..." }))}
                      >
                        Learner profile
                      </Button>
                    )}
                  </Stack>
                  {session.learnerContext.notes && (
                    <Box
                      sx={{
                        mt: 1.5,
                        p: 1.5,
                        borderRadius: "12px",
                        bgcolor: "hsl(var(--md-surface-container) / 0.3)",
                        fontSize: "0.8125rem",
                        color: "hsl(var(--md-on-surface-variant))",
                      }}
                    >
                      {session.learnerContext.notes}
                    </Box>
                  )}
                </SectionBox>
              )}

              {/* ═══ POLLS SECTION ═══ */}
              {showPolls && <PollsSection sessionId={session.id} />}

              {/* Remuneration (confirmed or completed sessions) */}
              {(isConfirmed || isCompleted) && session.paymentAmountInr && (
                <SectionBox>
                  <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
                    <SavingsOutlinedIcon sx={{ fontSize: 16, color: "var(--gl-status-confirmed-text)" }} />
                    <Typography variant="subtitle2" fontWeight={600}>Remuneration</Typography>
                  </Stack>
                  <Divider sx={{ mb: 0.5 }} />
                  {session.paymentModel && (
                    <InfoRow label="Payment model">
                      <Chip
                        label={session.paymentModel === "hourly" ? "Hourly" : "Fixed Price"}
                        size="small"
                                             />
                    </InfoRow>
                  )}
                  {session.paymentModel === "hourly" && session.hourlyRateInr && (
                    <InfoRow label="Hourly rate">{fmtInr(session.hourlyRateInr)}/hr</InfoRow>
                  )}
                  <InfoRow label="Event fee">{fmtInr(session.paymentAmountInr)}</InfoRow>

                  {isCompleted && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                        Post-completion earnings
                      </Typography>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: "12px",
                          bgcolor: "hsl(var(--md-surface-container) / 0.3)",
                        }}
                      >
                        <Stack spacing={1}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">Total earnings</Typography>
                            <Typography variant="subtitle2" fontWeight={700}>
                              {fmtInr(session.totalEarningsInr ?? session.paymentAmountInr)}
                            </Typography>
                          </Stack>
                          {session.paymentModel === "hourly" && session.hourlyRateInr && (
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" color="text.secondary">Breakdown</Typography>
                              <Typography variant="body2">
                                {fmtInr(session.hourlyRateInr)}/hr &times; {fmtDuration(session.start, session.end)}
                              </Typography>
                            </Stack>
                          )}
                          {session.paymentStatus && (
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" color="text.secondary">Status</Typography>
                              <Chip
                                label={
                                  session.paymentStatus === "paid" ? "Paid"
                                    : session.paymentStatus === "invoice_pending" ? "Invoice Pending"
                                    : "Invoice Not Raised"
                                }
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  ...(session.paymentStatus === "paid"
                                    ? { bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", border: "1px solid var(--gl-status-confirmed-border)" }
                                    : session.paymentStatus === "invoice_pending"
                                    ? { bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)" }
                                    : {}
                                  ),
                                }}
                              />
                            </Stack>
                          )}
                          {session.transactionId && (
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" color="text.secondary">Transaction ID</Typography>
                              <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                                {session.transactionId}
                              </Typography>
                            </Stack>
                          )}
                          {session.invoiceId && (
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" color="text.secondary">Invoice ID</Typography>
                              <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                                {session.invoiceId}
                              </Typography>
                            </Stack>
                          )}
                        </Stack>
                      </Box>
                    </>
                  )}
                </SectionBox>
              )}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">No event selected.</Typography>
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
            px: 3,
            py: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <Button variant="text" color="inherit" onClick={handleClose}>
            Close
          </Button>
          {session && !isCompleted && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="soft"
                size="small"
                startIcon={<CancelOutlinedIcon sx={{ fontSize: 16 }} />}
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
                  startIcon={<CheckCircleOutlinedIcon sx={{ fontSize: 16 }} />}
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
        </Box>
      </Box>
    </Drawer>
  );
}
