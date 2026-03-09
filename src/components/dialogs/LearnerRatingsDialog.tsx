import { Star } from "lucide-react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
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
          <div className="space-y-4 pt-1">
            <div className="rounded-2xl border bg-surface p-3">
              <div className="text-sm font-semibold">{session.title}</div>
              <div className="mt-1 flex items-center gap-2">
                <Star className="h-4 w-4" style={{ color: "var(--gl-star-color)" }} />
                <span className="text-lg font-semibold">{avgRating}</span>
                <span className="text-xs text-on-surface-variant">avg from {ratings.length} ratings</span>
              </div>
            </div>
            <div className="space-y-2">
              {ratings.map((r, i) => (
                <Card key={i}>
                  <CardContent sx={{ p: 2 }}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold">{r.learnerName}</div>
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="h-3 w-3" style={{ color: "var(--gl-star-color)" }} />
                        <span className="font-medium">{r.rating}</span>
                      </div>
                    </div>
                    {r.feedback && (
                      <div className="mt-1 text-xs text-on-surface-variant">{r.feedback}</div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {!ratings.length && (
                <div className="text-sm text-on-surface-variant">No ratings available for this session.</div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-on-surface-variant">No session selected.</div>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
