import { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import { useAppSelector, useAppDispatch } from "@/store";
import { setSelectedTicket, toggleBookmark, addComment, closeTicket, reopenTicket } from "@/store/slices/supportSlice";
import { pushToast } from "@/store/slices/toastsSlice";
import type { SupportTicket, TicketStatus } from "@/lib/types";

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: "success" | "warning" | "error" | "info" | "default" }> = {
  open: { label: "Open", color: "info" },
  awaiting_reply: { label: "Awaiting Reply", color: "warning" },
  closed: { label: "Closed", color: "default" },
  escalated: { label: "Escalated", color: "error" },
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) + ", " +
    d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function TicketDetailDrawer() {
  const dispatch = useAppDispatch();
  const selectedId = useAppSelector((s) => s.support.selectedTicketId);
  const ticket = useAppSelector((s) => s.support.tickets.find((t) => t.id === selectedId)) ?? null;
  const [replyText, setReplyText] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  const handleClose = () => dispatch(setSelectedTicket(null));

  const handleSendReply = () => {
    if (!ticket || !replyText.trim()) return;
    dispatch(addComment({
      ticketId: ticket.id,
      comment: {
        id: `c-${Date.now()}`,
        author: "Snehanjan",
        authorRole: "guru",
        content: replyText.trim(),
        timestamp: new Date().toISOString(),
      },
    }));
    dispatch(pushToast({ title: "Reply sent", description: `Response sent for ${ticket.id}` }));
    setReplyText("");
  };

  const handleRefineWithAI = () => {
    if (!replyText.trim()) return;
    setIsRefining(true);
    setTimeout(() => {
      setReplyText(`Hi ${ticket?.studentName},\n\nThank you for reaching out. ${replyText.trim()}\n\nPlease let me know if you have any further questions.\n\nBest regards,\nSnehanjan`);
      setIsRefining(false);
    }, 1000);
  };

  return (
    <Drawer
      anchor="right"
      open={!!ticket}
      onClose={handleClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 480 }, bgcolor: "background.default" } }}
    >
      {ticket && (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton size="small" onClick={handleClose}>
                <ArrowBackIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <Typography variant="subtitle2" fontWeight={600} color="text.secondary">{ticket.id}</Typography>
              <Chip
                label={STATUS_CONFIG[ticket.status].label}
                color={STATUS_CONFIG[ticket.status].color}
                size="small"
                sx={{ height: 22, fontSize: "0.7rem", fontWeight: 600 }}
              />
            </Stack>
            <IconButton size="small" onClick={() => dispatch(toggleBookmark(ticket.id))}>
              {ticket.isBookmarked
                ? <StarOutlinedIcon sx={{ fontSize: 18, color: "var(--gl-star-color)" }} />
                : <StarBorderOutlinedIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </Stack>

          {/* Scrollable content */}
          <Box sx={{ flex: 1, overflow: "auto", px: 2, py: 2, "&::-webkit-scrollbar": { width: 4 }, "&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: 2 } }}>
            {/* Student info */}
            <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderRadius: "8px" }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar sx={{ width: 32, height: 32, fontSize: "0.8rem", bgcolor: "primary.main" }}>
                  {ticket.studentName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{ticket.studentName}</Typography>
                  <Typography variant="caption" color="text.secondary">{ticket.batchName}</Typography>
                </Box>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, ml: 5.5 }}>
                {ticket.studentEmail}
              </Typography>
            </Paper>

            {/* Metadata */}
            <Stack spacing={0.75} sx={{ mb: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">Category</Typography>
                <Chip label={ticket.category} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.65rem" }} />
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">Created</Typography>
                <Typography variant="caption">{formatTimestamp(ticket.createdAt)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">Assigned to</Typography>
                <Typography variant="caption" fontWeight={600}>{ticket.assignedTo}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">Last activity</Typography>
                <Typography variant="caption">{timeAgo(ticket.lastActivityAt)}</Typography>
              </Stack>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {/* Subject + Description */}
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>{ticket.subject}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, whiteSpace: "pre-line", lineHeight: 1.6 }}>
              {ticket.description}
            </Typography>

            {/* Conversation */}
            {ticket.comments.length > 0 && (
              <>
                <Divider sx={{ mb: 1.5 }} />
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1.5, display: "block" }}>
                  Conversation ({ticket.comments.length})
                </Typography>
                <Stack spacing={1.5} sx={{ mb: 2 }}>
                  {ticket.comments.map((c) => (
                    <Paper
                      key={c.id}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderRadius: "8px",
                        }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                          <Avatar sx={{ width: 20, height: 20, fontSize: "0.55rem", bgcolor: c.authorRole === "guru" ? "primary.main" : c.authorRole === "student" ? "warning.main" : "grey.500" }}>
                            {c.author.charAt(0)}
                          </Avatar>
                          <Typography variant="caption" fontWeight={600}>{c.author}</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                          {formatTimestamp(c.timestamp)}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.primary" sx={{ whiteSpace: "pre-line", lineHeight: 1.6, fontSize: "0.8rem" }}>
                        {c.content}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </>
            )}

            {/* Activity log (collapsed) */}
            <Accordion disableGutters elevation={0} sx={{ bgcolor: "transparent", "&::before": { display: "none" }, mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 16 }} />} sx={{ px: 0, minHeight: "unset", "& .MuiAccordionSummary-content": { my: 0.5 } }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary">
                  Activity ({ticket.activities.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0, pt: 0 }}>
                <Stack spacing={0.5}>
                  {ticket.activities.map((a) => (
                    <Stack key={a.id} direction="row" spacing={1} alignItems="baseline">
                      <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "text.secondary", mt: 0.75, flexShrink: 0 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                        <strong>{a.actor}</strong> {a.action} · {timeAgo(a.timestamp)}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* Reply composer + actions (pinned bottom) */}
          <Box sx={{ borderTop: 1, borderColor: "divider", p: 2, bgcolor: "background.paper" }}>
            {ticket.status !== "closed" ? (
              <>
                <TextField
                  placeholder="Type your reply..."
                  multiline
                  rows={3}
                  size="small"
                  fullWidth
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && replyText.trim()) { e.preventDefault(); handleSendReply(); } }}
                  sx={{ mb: 1 }}
                />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Button
                    size="small"
                    variant="text"
                    startIcon={isRefining
                      ? <Box sx={{ width: 14, height: 14, border: "2px solid", borderColor: "primary.main", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", "@keyframes spin": { to: { transform: "rotate(360deg)" } } }} />
                      : <AutoAwesomeOutlinedIcon sx={{ fontSize: 14 }} />}
                    disabled={!replyText.trim() || isRefining}
                    onClick={handleRefineWithAI}
                    sx={{ textTransform: "none", fontSize: "0.75rem" }}
                  >
                    {isRefining ? "Refining..." : "Refine with AI"}
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    disabled={!replyText.trim()}
                    onClick={handleSendReply}
                    sx={{ textTransform: "none" }}
                  >
                    Send Reply <Typography component="span" sx={{ ml: 0.75, fontSize: "0.65rem", opacity: 0.7 }}>⌘↵</Typography>
                  </Button>
                </Stack>
                <Divider sx={{ my: 1.5 }} />
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="soft" color="error" sx={{ textTransform: "none", flex: 1 }} onClick={() => { dispatch(closeTicket(ticket.id)); dispatch(pushToast({ title: "Ticket closed", description: ticket.id })); }}>
                    Close Ticket
                  </Button>
                </Stack>
              </>
            ) : (
              <Button
                size="small"
                variant="soft"
                fullWidth
                sx={{ textTransform: "none" }}
                onClick={() => { dispatch(reopenTicket(ticket.id)); dispatch(pushToast({ title: "Ticket reopened", description: ticket.id })); }}
              >
                Reopen Ticket
              </Button>
            )}
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
