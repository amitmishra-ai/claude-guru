import { useState } from "react";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { useAppDispatch } from "@/store";
import { submitSummary } from "@/store/slices/sessionsSlice";
import { pushToast } from "@/store/slices/toastsSlice";

type InlineSummaryFormProps = {
  sessionId: string;
  sessionTitle: string;
  initialNotes?: string;
  onCancel: () => void;
};

/** Simulates AI refinement of the summary text. */
function simulateAiRefine(raw: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulated refined version — capitalizes, adds structure, trims filler
      const sentences = raw.trim().split(/(?<=[.!?])\s+/).filter(Boolean);
      const refined = sentences.length > 0
        ? sentences
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" ") +
          (raw.trim().endsWith(".") ? "" : ".") +
          " Overall, learners were engaged and the session met its objectives."
        : raw.trim() + ". The session covered key topics with good learner participation and engagement.";
      resolve(refined);
    }, 1200);
  });
}

export function InlineSummaryForm({ sessionId, sessionTitle, initialNotes = "", onCancel }: InlineSummaryFormProps) {
  const dispatch = useAppDispatch();
  const [notes, setNotes] = useState(initialNotes);
  const [isRefining, setIsRefining] = useState(false);

  const canSubmit = notes.trim().length >= 10;
  const canRefine = notes.trim().length >= 10 && !isRefining;

  const handleSubmit = () => {
    if (!canSubmit) return;
    dispatch(submitSummary({ sessionId, learnerEngagementNotes: notes.trim() }));
    dispatch(pushToast({ title: initialNotes ? "Summary updated" : "Summary submitted", description: sessionTitle }));
    onCancel();
  };

  const handleRefine = async () => {
    if (!canRefine) return;
    setIsRefining(true);
    try {
      const refined = await simulateAiRefine(notes);
      setNotes(refined);
      dispatch(pushToast({ title: "Summary refined", description: "Review the updated text before submitting." }));
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, borderColor: "primary.main", borderRadius: 1.5, mt: 1.5 }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
        Help us capture the impact you made — your notes help learners revisit key takeaways
        and help ops improve future sessions.
      </Typography>
      <TextField
        multiline
        rows={3}
        fullWidth
        size="small"
        placeholder="What stood out in this session? Note attendance, participation level, questions asked, or anything memorable..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        disabled={isRefining}
        sx={{ mb: 1.5, "& .MuiInputBase-input": { fontSize: "0.85rem" } }}
      />
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            size="small"
            variant="contained"
            onClick={handleSubmit}
            disabled={!canSubmit || isRefining}
          >
            Submit
          </Button>
          <Button
            size="small"
            variant="soft"
            startIcon={isRefining ? <CircularProgress size={14} color="inherit" /> : <AutoAwesomeOutlinedIcon sx={{ fontSize: 14 }} />}
            onClick={handleRefine}
            disabled={!canRefine}
          >
            {isRefining ? "Refining..." : "Refine with AI"}
          </Button>
        </Stack>
        <Button size="small" variant="text" color="inherit" onClick={onCancel} disabled={isRefining}>
          Cancel
        </Button>
      </Stack>
    </Paper>
  );
}
