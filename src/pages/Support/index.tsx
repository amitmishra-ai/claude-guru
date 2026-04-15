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
  awaiting_reply: { bg: "var(--gl-status-disputed-bg)", color: "var(--gl-status-disputed-text)" },
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
        p: { xs: 1.5, sm: 2 },
        cursor: "pointer",
        transition: "border-color 0.15s, box-shadow 0.15s",
        "&:hover": { borderColor: "primary.main", boxShadow: 1 },
        "&:active": { bgcolor: "action.hover" },
      }}
      onClick={onSelect}
    >
      {/* Row 1: ID + meta + bookmark */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0, overflow: "hidden" }}>
          {ticket.isUnread && <FiberManualRecordIcon sx={{ fontSize: 8, color: "primary.main", flexShrink: 0 }} />}
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ flexShrink: 0 }}>{ticket.id}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>·</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {timeAgo(ticket.lastActivityAt)}
          </Typography>
        </Stack>
        <IconButton
          size="small"
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); onToggleBookmark(); }}
          sx={{
            flexShrink: 0, ml: 0.5,
            color: ticket.isBookmarked ? "primary.main" : "text.disabled",
            width: 32, height: 32,
          }}
        >
          {ticket.isBookmarked ? <StarOutlinedIcon sx={{ fontSize: 18 }} /> : <StarBorderOutlinedIcon sx={{ fontSize: 18 }} />}
        </IconButton>
      </Stack>

      {/* Row 2: Subject */}
      <Typography variant="body2" sx={{ mt: 0.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
        {ticket.subject}
      </Typography>

      {/* Row 3: Student + batch */}
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.5 }}>
        <Avatar sx={{ width: 20, height: 20, fontSize: "0.55rem", bgcolor: "primary.main" }}>
          {ticket.studentName.charAt(0)}
        </Avatar>
        <Typography variant="caption" fontWeight={500} sx={{ fontSize: { xs: "0.68rem", sm: "0.75rem" } }}>{ticket.studentName}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: { xs: "0.65rem", sm: "0.75rem" } }}>
          · {ticket.batchName}
        </Typography>
      </Stack>

      {/* Row 4: Chips */}
      <Stack direction="row" spacing={0.75} sx={{ mt: 1 }}>
        <Chip label={ticket.category} size="small" variant="outlined" sx={{ height: 22, fontSize: { xs: "0.6rem", sm: "0.65rem" }, borderRadius: "4px" }} />
        <Chip
          label={STATUS_LABELS[ticket.status]}
          size="small"
          sx={{ height: 22, fontSize: { xs: "0.6rem", sm: "0.65rem" }, borderRadius: "4px", bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 600 }}
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
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={{ xs: 1, sm: 0 }} sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>Support Tickets</Typography>
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
          sx={{ width: { xs: "100%", sm: 240 }, "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
        />
      </Stack>

      <Card sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: "16px" }}>
      {/* Tabs - scrollable on mobile */}
      <Tabs
        value={activeTab}
        onChange={(_e, v) => dispatch(setActiveTab(v))}
        variant="scrollable"
        scrollButtons={false}
        sx={{
          mb: 1.5,
          minHeight: 36,
          "& .MuiTab-root": { textTransform: "none", minHeight: 36, py: 0, fontSize: { xs: "0.78rem", sm: "0.85rem" }, minWidth: "auto", px: { xs: 1.25, sm: 2 } },
        }}
      >
        <Tab value="needs_action" label={<Stack direction="row" spacing={0.5} alignItems="center"><span>Needs Action</span>{needsActionCount > 0 && <Chip label={needsActionCount} size="small" color="error" sx={{ height: 18, fontSize: "0.6rem", "& .MuiChip-label": { px: 0.5 } }} />}</Stack>} />
        <Tab value="all_open" label={`Open (${allOpenCount})`} />
        <Tab value="closed" label="Closed" />
        <Tab value="bookmarked" label={bookmarkedCount > 0 ? `Saved (${bookmarkedCount})` : "Saved"} />
      </Tabs>

      {/* Filters */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: "0.68rem", sm: "0.75rem" } }}>
          {filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""}
        </Typography>
        <Select
          size="small"
          variant="standard"
          disableUnderline
          value={categoryFilter}
          onChange={(e) => dispatch(setCategoryFilter(e.target.value))}
          sx={{ fontSize: { xs: "0.75rem", sm: "0.8rem" }, fontWeight: 600, color: "primary.main", "& .MuiSvgIcon-root": { color: "primary.main" } }}
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
