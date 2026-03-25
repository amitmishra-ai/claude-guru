import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SupportTicket, TicketComment } from "@/lib/types";
import { demoSupportTickets } from "@/data/demo-support-tickets";

type SupportTab = "needs_action" | "all_open" | "closed" | "bookmarked";

interface SupportState {
  tickets: SupportTicket[];
  selectedTicketId: string | null;
  activeTab: SupportTab;
  searchQuery: string;
  categoryFilter: string;
  sortBy: "lastActivity" | "created";
}

const initialState: SupportState = {
  tickets: demoSupportTickets,
  selectedTicketId: null,
  activeTab: "needs_action",
  searchQuery: "",
  categoryFilter: "All",
  sortBy: "lastActivity",
};

const supportSlice = createSlice({
  name: "support",
  initialState,
  reducers: {
    setSelectedTicket(state, action: PayloadAction<string | null>) {
      state.selectedTicketId = action.payload;
      // Mark as read when opened
      if (action.payload) {
        const ticket = state.tickets.find((t) => t.id === action.payload);
        if (ticket) ticket.isUnread = false;
      }
    },
    setActiveTab(state, action: PayloadAction<SupportTab>) {
      state.activeTab = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setCategoryFilter(state, action: PayloadAction<string>) {
      state.categoryFilter = action.payload;
    },
    setSortBy(state, action: PayloadAction<"lastActivity" | "created">) {
      state.sortBy = action.payload;
    },
    toggleBookmark(state, action: PayloadAction<string>) {
      const ticket = state.tickets.find((t) => t.id === action.payload);
      if (ticket) ticket.isBookmarked = !ticket.isBookmarked;
    },
    addComment(state, action: PayloadAction<{ ticketId: string; comment: TicketComment }>) {
      const ticket = state.tickets.find((t) => t.id === action.payload.ticketId);
      if (ticket) {
        ticket.comments.push(action.payload.comment);
        ticket.lastActivityAt = action.payload.comment.timestamp;
        ticket.status = "awaiting_reply";
        ticket.activities.push({
          id: `a-${Date.now()}`,
          actor: action.payload.comment.author,
          action: "commented",
          timestamp: action.payload.comment.timestamp,
        });
      }
    },
    closeTicket(state, action: PayloadAction<string>) {
      const ticket = state.tickets.find((t) => t.id === action.payload);
      if (ticket) {
        ticket.status = "closed";
        ticket.lastActivityAt = new Date().toISOString();
        ticket.activities.push({
          id: `a-${Date.now()}`,
          actor: "Snehanjan",
          action: "closed the request",
          timestamp: new Date().toISOString(),
        });
      }
    },
    reopenTicket(state, action: PayloadAction<string>) {
      const ticket = state.tickets.find((t) => t.id === action.payload);
      if (ticket) {
        ticket.status = "open";
        ticket.lastActivityAt = new Date().toISOString();
        ticket.activities.push({
          id: `a-${Date.now()}`,
          actor: "Snehanjan",
          action: "reopened the request",
          timestamp: new Date().toISOString(),
        });
      }
    },
    reassignTicket(state, action: PayloadAction<{ ticketId: string; assignedTo: string; assignedToEmail: string }>) {
      const ticket = state.tickets.find((t) => t.id === action.payload.ticketId);
      if (ticket) {
        ticket.assignedTo = action.payload.assignedTo;
        ticket.assignedToEmail = action.payload.assignedToEmail;
        ticket.lastActivityAt = new Date().toISOString();
        ticket.activities.push({
          id: `a-${Date.now()}`,
          actor: "Snehanjan",
          action: `assigned request to ${action.payload.assignedTo}`,
          timestamp: new Date().toISOString(),
        });
      }
    },
  },
});

export const {
  setSelectedTicket,
  setActiveTab,
  setSearchQuery,
  setCategoryFilter,
  setSortBy,
  toggleBookmark,
  addComment,
  closeTicket,
  reopenTicket,
  reassignTicket,
} = supportSlice.actions;

export default supportSlice.reducer;
