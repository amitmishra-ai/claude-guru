import { useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import Skeleton from "@mui/material/Skeleton";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { useAppSelector, useAppDispatch } from "@/store";
import { setSelectedTicket, setActiveTab, setSearchQuery, setCategoryFilter, toggleBookmark } from "@/store/slices/supportSlice";
import { TicketDetailDrawer } from "@/components/dialogs/TicketDetailDrawer";
import { EmptyState } from "@/components/shared/EmptyState";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import type { SupportTicket, TicketStatus } from "@/lib/types";

const STATUS_COLORS: Record<TicketStatus, { bg: string; color: string }> = {
  open: { bg: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)" },
  awaiting_reply: { bg: "#fff3e0", color: "#e65100" },
  closed: { bg: "action.hover", color: "text.secondary" },
  escalated: { bg: "var(--gl-status-declined-bg)", color: "var(--gl-status-declined-text)" },
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  awaiting_reply: "Awaiting Reply",
  closed: "Closed",
  escalated: "Escalated",
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

type TabValue = "needs_action" | "all_open" | "closed" | "bookmarked";

function TicketCard({ ticket, onSelect, onToggleBookmark }: { ticket: SupportTicket; onSelect: () => void; onToggleBookmark: () => void }) {
  const statusStyle = STATUS_COLORS[ticket.status];
  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        cursor: "pointer",
        transition: "border-color 0.15s, box-shadow 0.15s",
        "&:hover": { borderColor: "primary.main", boxShadow: 1 },
      }}
      onClick={onSelect}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
          {ticket.isUnread && <FiberManualRecordIcon sx={{ fontSize: 8, color: "primary.main", flexShrink: 0 }} />}
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ flexShrink: 0 }}>{ticket.id}</Typography>
          <Typography variant="caption" color="text.secondary">·</Typography>
          <Typography variant="caption" color="text.secondary">{timeAgo(ticket.lastActivityAt)} · {ticket.assignedTo}</Typography>
        </Stack>
        <Button
          size="small"
          variant={ticket.isBookmarked ? "contained" : "text"}
          startIcon={ticket.isBookmarked ? <StarOutlinedIcon sx={{ fontSize: 14 }} /> : <StarBorderOutlinedIcon sx={{ fontSize: 14 }} />}
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); onToggleBookmark(); }}
          sx={{
            textTransform: "none",
            fontSize: "0.7rem",
            fontWeight: 600,
            minWidth: 0,
            px: 1,
            py: 0.25,
            borderRadius: 1.5,
            ...(ticket.isBookmarked
              ? { bgcolor: "primary.main", color: "primary.contrastText", "&:hover": { bgcolor: "primary.dark" } }
              : { color: "text.secondary" }),
          }}
        >
          {ticket.isBookmarked ? "Bookmarked" : "Bookmark"}
        </Button>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.75 }}>
        <Avatar sx={{ width: 22, height: 22, fontSize: "0.6rem", bgcolor: "primary.main" }}>
          {ticket.studentName.charAt(0)}
        </Avatar>
        <Typography variant="caption" fontWeight={600}>{ticket.studentName}</Typography>
        <Typography variant="caption" color="text.secondary">·</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {ticket.batchName}
        </Typography>
      </Stack>

      <Typography variant="body2" sx={{ mt: 0.75, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>
        {ticket.subject}
      </Typography>

      <Stack direction="row" spacing={0.75} sx={{ mt: 1 }}>
        <Chip label={ticket.category} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.6rem", borderRadius: 1 }} />
        <Chip
          label={STATUS_LABELS[ticket.status]}
          size="small"
          sx={{ height: 20, fontSize: "0.6rem", borderRadius: 1, bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 600 }}
        />
      </Stack>
    </Card>
  );
}

export default function SupportPage() {
  const dispatch = useAppDispatch();
  const guruStage = useAppSelector((s) => s.devPanel.guruStage);
  const _tickets = useAppSelector((s) => s.support.tickets);
  const tickets = guruStage === "empty" ? [] : _tickets;
  const activeTab = useAppSelector((s) => s.support.activeTab);
  const searchQuery = useAppSelector((s) => s.support.searchQuery);
  const categoryFilter = useAppSelector((s) => s.support.categoryFilter);

  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);
  useEffect(() => { setTabLoading(true); const t = setTimeout(() => setTabLoading(false), 400); return () => clearTimeout(t); }, [activeTab]);

  const guruName = "Snehanjan";

  // Filter tickets by tab
  const filteredTickets = useMemo(() => {
    let result = tickets;

    // Tab filter
    switch (activeTab) {
      case "needs_action":
        result = result.filter((t) => t.assignedTo === guruName && (t.status === "open" || t.status === "escalated"));
        break;
      case "all_open":
        result = result.filter((t) => t.assignedTo === guruName && t.status !== "closed");
        break;
      case "closed":
        result = result.filter((t) => t.status === "closed");
        break;
      case "bookmarked":
        result = result.filter((t) => t.isBookmarked);
        break;
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) =>
        t.subject.toLowerCase().includes(q) ||
        t.studentName.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.batchName.toLowerCase().includes(q)
      );
    }

    // Category
    if (categoryFilter !== "All") {
      result = result.filter((t) => t.category === categoryFilter);
    }

    // Sort: oldest unread first for needs_action, otherwise newest first
    result = [...result].sort((a, b) => {
      if (activeTab === "needs_action") {
        return new Date(a.lastActivityAt).getTime() - new Date(b.lastActivityAt).getTime();
      }
      return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
    });

    return result;
  }, [tickets, activeTab, searchQuery, categoryFilter]);

  const needsActionCount = tickets.filter((t) => t.assignedTo === guruName && (t.status === "open" || t.status === "escalated")).length;
  const allOpenCount = tickets.filter((t) => t.assignedTo === guruName && t.status !== "closed").length;
  const bookmarkedCount = tickets.filter((t) => t.isBookmarked).length;

  if (loading) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="text" width={180} height={32} />
        <Stack direction="row" spacing={2}>
          {[120, 100, 80, 110].map((w, i) => <Skeleton key={i} variant="text" width={w} height={24} />)}
        </Stack>
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} variant="outlined" sx={{ p: 2 }}>
            <Skeleton variant="text" width="30%" height={14} />
            <Skeleton variant="text" width="60%" height={18} sx={{ mt: 0.75 }} />
            <Skeleton variant="text" width="80%" height={16} sx={{ mt: 0.75 }} />
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Skeleton variant="rounded" width={80} height={20} />
              <Skeleton variant="rounded" width={60} height={20} />
            </Stack>
          </Card>
        ))}
      </Stack>
    );
  }

  return (
    <>
      {/* Page header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>Support Tickets</Typography>
        <TextField
          size="small"
          placeholder="Search tickets..."
          value={searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon sx={{ fontSize: 18, color: "text.disabled" }} />
              </InputAdornment>
            ),
          }}
          sx={{ width: 240, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
      </Stack>

      <Card sx={{ p: 2 }}>
      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_e, v) => dispatch(setActiveTab(v))}
        sx={{ mb: 2, minHeight: 36, "& .MuiTab-root": { textTransform: "none", minHeight: 36, py: 0, fontSize: "0.85rem" } }}
      >
        <Tab value="needs_action" label={<Stack direction="row" spacing={0.75} alignItems="center"><span>Needs Action</span>{needsActionCount > 0 && <Chip label={needsActionCount} size="small" color="error" sx={{ height: 18, fontSize: "0.65rem", "& .MuiChip-label": { px: 0.75 } }} />}</Stack>} />
        <Tab value="all_open" label={`All Open (${allOpenCount})`} />
        <Tab value="closed" label="Closed" />
        <Tab value="bookmarked" label={bookmarkedCount > 0 ? `Bookmarked (${bookmarkedCount})` : "Bookmarked"} />
      </Tabs>

      {/* Filters */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""}
        </Typography>
        <Select
          size="small"
          variant="standard"
          disableUnderline
          value={categoryFilter}
          onChange={(e) => dispatch(setCategoryFilter(e.target.value))}
          sx={{ fontSize: "0.8rem", fontWeight: 600, color: "primary.main", "& .MuiSvgIcon-root": { color: "primary.main" } }}
        >
          <MenuItem value="All">All categories</MenuItem>
          <MenuItem value="Learning Material">Learning Material</MenuItem>
          <MenuItem value="Projects">Projects</MenuItem>
          <MenuItem value="Assignments">Assignments</MenuItem>
          <MenuItem value="Technical Issue">Technical Issue</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </Select>
      </Stack>

      {/* Ticket list */}
      {tabLoading ? (
        <Stack spacing={1.5}>
          {[0, 1, 2].map((i) => (
            <Card key={i} variant="outlined" sx={{ p: 2 }}>
              <Skeleton variant="text" width="30%" height={14} />
              <Skeleton variant="text" width="60%" height={18} sx={{ mt: 0.75 }} />
              <Skeleton variant="text" width="80%" height={16} sx={{ mt: 0.75 }} />
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Skeleton variant="rounded" width={80} height={20} />
                <Skeleton variant="rounded" width={60} height={20} />
              </Stack>
            </Card>
          ))}
        </Stack>
      ) : filteredTickets.length > 0 ? (
        <Stack spacing={1.5}>
          {filteredTickets.map((t) => (
            <TicketCard
              key={t.id}
              ticket={t}
              onSelect={() => dispatch(setSelectedTicket(t.id))}
              onToggleBookmark={() => dispatch(toggleBookmark(t.id))}
            />
          ))}
        </Stack>
      ) : (
        <Box sx={{ mt: 2 }}>
          <EmptyState
            icon={
              activeTab === "needs_action" ? <CheckCircleOutlinedIcon /> :
              activeTab === "bookmarked" ? <BookmarkBorderOutlinedIcon /> :
              <InboxOutlinedIcon />
            }
            title={
              activeTab === "needs_action" ? "All caught up!" :
              activeTab === "bookmarked" ? "No bookmarked tickets" :
              "No tickets found"
            }
            subtitle={
              activeTab === "needs_action"
                ? "No tickets need your attention right now. Nice work!"
                : activeTab === "bookmarked"
                  ? "Star any ticket to pin it here for quick access later"
                  : activeTab === "closed"
                    ? "Resolved tickets will appear here for your records"
                    : "Try adjusting your search or filters to find what you need"
            }
            compact
          />
        </Box>
      )}
      </Card>

      {/* Detail drawer */}
      <TicketDetailDrawer />
    </>
  );
}
