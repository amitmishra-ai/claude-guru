import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store";
import { setSessionFocus } from "@/store/slices/sessionsSlice";
import { setOpenCompletedSession, setOpenLearnerRatings, setLearnerRatingsSessionId } from "@/store/slices/uiSlice";
import { pushToast } from "@/store/slices/toastsSlice";
import { demoLearnerRatingsBySessionId } from "@/data/demo-sessions";
import { fmtDateNice, fmtTime12 } from "@/lib/helpers";

export function CompletedSessionDetailDialog() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const open = useAppSelector((s) => s.ui.openCompletedSession);
  const session = useAppSelector((s) => s.sessions.sessionFocus);

  const close = () => {
    dispatch(setOpenCompletedSession(false));
    dispatch(setSessionFocus(null));
  };

  if (!session) return null;

  const ratings = demoLearnerRatingsBySessionId[session.id];
  const hasRatings = ratings && ratings.length > 0;
  const avg = hasRatings
    ? (ratings.reduce((a, r) => a + r.rating, 0) / ratings.length).toFixed(1)
    : null;

  return (
    <Dialog
      open={open}
      onClose={close}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          p: 0,
          maxHeight: "85vh",
          overflow: "hidden",
          width: { xs: "calc(100vw - 1.5rem)", sm: "100%" },
          maxWidth: { xs: "calc(100vw - 1.5rem)", sm: "672px" },
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", maxHeight: "85vh" }}>
        <DialogTitle
          sx={{
            position: "sticky", top: 0, zIndex: 10,
            borderBottom: 1, borderColor: "divider",
            bgcolor: "background.paper", px: 3, py: 2,
          }}
        >
          Session details
        </DialogTitle>

        <DialogContent className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto", p: "1.5rem" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" fontWeight={600}>{session.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {fmtDateNice(session.dateYmd)} &bull; {fmtTime12(session.start)}&ndash;{fmtTime12(session.end)}
              </Typography>
              {session.group && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  {session.group}
                </Typography>
              )}
            </Box>
            {avg && (
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0, ml: 2 }}>
                <StarOutlinedIcon sx={{ fontSize: 14, color: "var(--gl-star-color)" }} />
                <Typography variant="subtitle2" fontWeight={600}>{avg}</Typography>
              </Stack>
            )}
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
            <Chip label={session.sessionType} size="small" variant="outlined" />
            <Chip label={session.program} size="small" variant="outlined" />
            {session.cohort && (
              <Chip label={session.cohort} size="small" variant="outlined" />
            )}
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 2.5 }} flexWrap="wrap" useFlexGap>
            {session.recordingUrl && (
              <Button
                startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}
                variant="soft"
                size="small"
                onClick={() => dispatch(pushToast({ title: "Opening recording", description: `Launching recording for ${session.title}` }))}
              >
                Watch recording
              </Button>
            )}
            {hasRatings && (
              <Button
                startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}
                variant="soft"
                size="small"
                onClick={() => {
                  dispatch(setLearnerRatingsSessionId(session.id));
                  dispatch(setOpenLearnerRatings(true));
                }}
              >
                View ratings
              </Button>
            )}
            <Button
              startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 14 }} />}
              variant="soft"
              size="small"
              onClick={() => { close(); navigate("/profile"); }}
            >
              View in payments
            </Button>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            position: "sticky", bottom: 0, zIndex: 10,
            borderTop: 1, borderColor: "divider",
            bgcolor: "background.paper", px: 3, py: 2,
          }}
        >
          <Button variant="text" color="inherit" sx={{ display: { xs: "none", sm: "inline-flex" } }} onClick={close}>
            Close
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
