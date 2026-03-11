import { Star } from "lucide-react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useAppSelector, useAppDispatch } from "@/store";
import { setOpenLearnerRatings, setLearnerRatingsSessionId } from "@/store/slices/uiSlice";
import { demoLearnerRatingsBySessionId } from "@/data/demo-sessions";

export function LearnerRatingsDialog() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.openLearnerRatings);
  const sessionId = useAppSelector((s) => s.ui.learnerRatingsSessionId);
  const sessions = useAppSelector((s) => s.sessions.items);

  const session = sessionId ? sessions.find((s) => s.id === sessionId) : null;
  const ratings = sessionId ? demoLearnerRatingsBySessionId[sessionId] ?? [] : [];
  const avgRating = ratings.length
    ? (ratings.reduce((a, r) => a + r.rating, 0) / ratings.length).toFixed(1)
    : "—";

  const handleClose = () => {
    dispatch(setOpenLearnerRatings(false));
    dispatch(setLearnerRatingsSessionId(null));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Learner Ratings</DialogTitle>
      <DialogContent>
        {session ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 0.5 }}>
            <Box
              sx={{
                borderRadius: "16px",
                border: 1,
                borderColor: "divider",
                backgroundColor: "hsl(var(--md-surface))",
                p: 1.5,
              }}
            >
              <Box sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{session.title}</Box>
              <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
                <Star style={{ width: 16, height: 16, color: "var(--gl-star-color)" }} />
                <Typography sx={{ fontSize: "1.125rem", fontWeight: 600 }}>{avgRating}</Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "hsl(var(--md-on-surface-variant))" }}>
                  avg from {ratings.length} ratings
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {ratings.map((r, i) => (
                <Card key={i}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                      <Box sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{r.learnerName}</Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: "0.75rem" }}>
                        <Star style={{ width: 12, height: 12, color: "var(--gl-star-color)" }} />
                        <Box component="span" sx={{ fontWeight: 500 }}>{r.rating}</Box>
                      </Box>
                    </Box>
                    {r.feedback && (
                      <Box sx={{ mt: 0.5, fontSize: "0.75rem", color: "hsl(var(--md-on-surface-variant))" }}>{r.feedback}</Box>
                    )}
                  </CardContent>
                </Card>
              ))}
              {!ratings.length && (
                <Box sx={{ fontSize: "0.875rem", color: "hsl(var(--md-on-surface-variant))" }}>
                  No ratings available for this session.
                </Box>
              )}
            </Box>
          </Box>
        ) : (
          <Box sx={{ fontSize: "0.875rem", color: "hsl(var(--md-on-surface-variant))" }}>No session selected.</Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="inherit" onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
