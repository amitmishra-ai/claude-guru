import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import Box from "@mui/material/Box";
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
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{pollEditingId ? "Edit poll" : "Create poll"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 0.5 }}>
          <TextField
            label="Question"
            value={pollQuestion}
            onChange={(e) => dispatch(setPollQuestion(e.target.value))}
            size="small"
            fullWidth
            placeholder="E.g., Which topic should we cover next?"
          />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ fontSize: "0.75rem", fontWeight: 600, color: "hsl(var(--md-on-surface-variant))" }}>Options</Box>
            {pollOptions.map((opt, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                    <DeleteOutlinedIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                )}
              </Box>
            ))}
            {pollOptions.length < 4 && (
              <Button
                size="small"
                variant="text"
                startIcon={<AddOutlinedIcon sx={{ fontSize: 14 }} />}
                onClick={() => dispatch(setPollOptions([...pollOptions, ""]))}
              >
                Add option
              </Button>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ flexDirection: { xs: "column", sm: "row" }, gap: { xs: 1, sm: 0 }, "& > :not(:first-of-type)": { ml: { xs: 0, sm: 1 } } }}>
        <Button variant="text" color="inherit" onClick={handleClose} sx={{ width: { xs: "100%", sm: "auto" } }}>Cancel</Button>
        <Button variant="soft" onClick={handleSaveDraft} disabled={!pollQuestion.trim()} sx={{ width: { xs: "100%", sm: "auto" } }}>Save draft</Button>
        <Button variant="contained" onClick={handleQueue} disabled={!pollQuestion.trim()} sx={{ width: { xs: "100%", sm: "auto" } }}>Queue to Zoom</Button>
      </DialogActions>
    </Dialog>
  );
}
