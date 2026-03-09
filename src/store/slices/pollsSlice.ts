import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Poll } from "@/lib/types";

interface PollsState {
  items: Poll[];
  pollSessionId: string | null;
  pollEditingId: string | null;
  pollQuestion: string;
  pollOptions: string[];
}

const initialState: PollsState = {
  items: [],
  pollSessionId: null,
  pollEditingId: null,
  pollQuestion: "",
  pollOptions: ["", "", "", ""],
};

const pollsSlice = createSlice({
  name: "polls",
  initialState,
  reducers: {
    setPolls(state, action: PayloadAction<Poll[]>) {
      state.items = action.payload;
    },
    addPoll(state, action: PayloadAction<Poll>) {
      state.items.push(action.payload);
    },
    removePoll(state, action: PayloadAction<string>) {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },
    updatePoll(state, action: PayloadAction<Poll>) {
      const idx = state.items.findIndex((p) => p.id === action.payload.id);
      if (idx >= 0) state.items[idx] = action.payload;
    },
    setPollSessionId(state, action: PayloadAction<string | null>) {
      state.pollSessionId = action.payload;
    },
    setPollEditingId(state, action: PayloadAction<string | null>) {
      state.pollEditingId = action.payload;
    },
    setPollQuestion(state, action: PayloadAction<string>) {
      state.pollQuestion = action.payload;
    },
    setPollOptions(state, action: PayloadAction<string[]>) {
      state.pollOptions = action.payload;
    },
    resetPollForm(state) {
      state.pollEditingId = null;
      state.pollQuestion = "";
      state.pollOptions = ["", "", "", ""];
    },
  },
});

export const {
  setPolls,
  addPoll,
  removePoll,
  updatePoll,
  setPollSessionId,
  setPollEditingId,
  setPollQuestion,
  setPollOptions,
  resetPollForm,
} = pollsSlice.actions;

export default pollsSlice.reducer;
