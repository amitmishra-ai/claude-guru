import { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

const REASONS = [
  { value: "cant-find", label: "Unable to find something" },
  { value: "looks-wrong", label: "Something looks wrong (broken / data / missing)" },
  { value: "performance", label: "Performance feels slow or laggy" },
  { value: "prefer-old", label: "Prefer the old dashboard" },
  { value: "other", label: "Other" },
] as const;

type ReasonValue = typeof REASONS[number]["value"];

export type SwitchFeedback = { reason: ReasonValue; reasonLabel: string; comment: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (feedback: SwitchFeedback) => void;
};

export function SwitchToOldDashboardDialog({ open, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState<ReasonValue | "">("");
  const [comment, setComment] = useState("");

  const commentRequired = reason === "other" || reason === "cant-find";
  const canSubmit = !!reason && (!commentRequired || comment.trim().length > 0);

  const handleClose = () => {
    setReason("");
    setComment("");
    onClose();
  };

  const handleSubmit = () => {
    if (!canSubmit || !reason) return;
    const reasonLabel = REASONS.find((r) => r.value === reason)?.label ?? "";
    onConfirm({ reason, reasonLabel, comment: comment.trim() });
    setReason("");
    setComment("");
  };

  const placeholder =
    reason === "cant-find"
      ? "What were you trying to find?"
      : reason === "other"
        ? "Tell us a bit more so we can help."
        : "Anything else you'd like to share? (optional)";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      disableRestoreFocus
      PaperProps={{
        sx: {
          borderRadius: "4px",
          m: { xs: "16px", sm: 4 },
          width: { xs: "calc(100% - 32px)", sm: "auto" },
          maxWidth: { xs: "calc(100% - 32px)", sm: 444 },
        },
      }}
    >
      <DialogTitle sx={{ pb: 0.5, fontSize: "1.125rem", fontWeight: 600, px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2 } }}>
        Help us improve before you switch
      </DialogTitle>
      <DialogContent sx={{ pt: 1, px: { xs: 2, sm: 3 } }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Your feedback helps us understand what's blocking you.
        </Typography>

        <RadioGroup
          value={reason}
          onChange={(e) => setReason(e.target.value as ReasonValue)}
          sx={{ mb: 2 }}
        >
          {REASONS.map((r) => (
            <FormControlLabel
              key={r.value}
              value={r.value}
              control={<Radio size="small" />}
              label={
                <Typography variant="body2" sx={{ fontSize: "0.875rem", lineHeight: 1.4 }}>
                  {r.label}
                </Typography>
              }
              sx={{
                mx: 0,
                py: 0.25,
                alignItems: "center",
                "& .MuiFormControlLabel-label": { ml: 0.25 },
              }}
            />
          ))}
        </RadioGroup>

        <TextField
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={placeholder}
          size="small"
          fullWidth
          multiline
          minRows={2}
          required={commentRequired}
          helperText={commentRequired ? "Required for this option" : undefined}
          sx={{
            "& .MuiOutlinedInput-root": { borderRadius: "4px" },
            "& .MuiFormHelperText-root": { ml: 0.5 },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: 2, gap: 1, "& > :not(:first-of-type)": { ml: 0 } }}>
        <Button variant="text" color="inherit" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit}
          sx={{ fontWeight: 600, borderRadius: "4px" }}
        >
          Submit & switch
        </Button>
      </DialogActions>
    </Dialog>
  );
}
