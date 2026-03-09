import { Plus, Trash2 } from "lucide-react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { useAppSelector, useAppDispatch } from "@/store";
import { setOpenPollBuilder } from "@/store/slices/uiSlice";
import {
  addPoll, updatePoll, resetPollForm,
  setPollQuestion, setPollOptions,
} from "@/store/slices/pollsSlice";
import { pushToast } from "@/store/slices/toastsSlice";

export function PollBuilderDialog() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.openPollBuilder);
  const pollSessionId = useAppSelector((s) => s.polls.pollSessionId);
  const pollEditingId = useAppSelector((s) => s.polls.pollEditingId);
  const pollQuestion = useAppSelector((s) => s.polls.pollQuestion);
  const pollOptions = useAppSelector((s) => s.polls.pollOptions);

  const handleClose = () => {
    dispatch(setOpenPollBuilder(false));
    dispatch(resetPollForm());
  };

  const handleSaveDraft = () => {
    if (!pollSessionId || !pollQuestion.trim()) return;
    const poll = {
      id: pollEditingId || `poll-${Date.now()}`,
      sessionId: pollSessionId,
      question: pollQuestion.trim(),
      options: pollOptions.filter((o) => o.trim()),
      status: "draft" as const,
    };
    if (pollEditingId) dispatch(updatePoll(poll));
    else dispatch(addPoll(poll));
    dispatch(pushToast({ title: "Poll saved as draft" }));
    handleClose();
  };

  const handleQueue = () => {
    if (!pollSessionId || !pollQuestion.trim()) return;
    const poll = {
      id: pollEditingId || `poll-${Date.now()}`,
      sessionId: pollSessionId,
      question: pollQuestion.trim(),
      options: pollOptions.filter((o) => o.trim()),
      status: "queued" as const,
    };
    if (pollEditingId) dispatch(updatePoll(poll));
    else dispatch(addPoll(poll));
    dispatch(pushToast({ title: "Poll queued to Zoom" }));
    handleClose();
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    dispatch(setPollOptions(newOptions));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{pollEditingId ? "Edit poll" : "Create poll"}</DialogTitle>
      <DialogContent>
        <div className="space-y-4 pt-1">
          <TextField
            label="Question"
            value={pollQuestion}
            onChange={(e) => dispatch(setPollQuestion(e.target.value))}
            size="small"
            fullWidth
            placeholder="E.g., Which topic should we cover next?"
          />
          <div className="space-y-2">
            <div className="text-xs font-semibold text-on-surface-variant">Options</div>
            {pollOptions.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <TextField
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  size="small"
                  fullWidth
                  placeholder={`Option ${i + 1}`}
                />
                {pollOptions.length > 2 && (
                  <IconButton size="small" onClick={() => {
                    dispatch(setPollOptions(pollOptions.filter((_, j) => j !== i)));
                  }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </IconButton>
                )}
              </div>
            ))}
            {pollOptions.length < 4 && (
              <Button
                size="small"
                variant="text"
                startIcon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => dispatch(setPollOptions([...pollOptions, ""]))}
              >
                Add option
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={handleClose}>Cancel</Button>
        <Button variant="outlined" onClick={handleSaveDraft} disabled={!pollQuestion.trim()}>Save draft</Button>
        <Button variant="contained" onClick={handleQueue} disabled={!pollQuestion.trim()}>Queue to Zoom</Button>
      </DialogActions>
    </Dialog>
  );
}
