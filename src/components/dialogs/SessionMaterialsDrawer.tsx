import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import SlideshowOutlinedIcon from "@mui/icons-material/SlideshowOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useAppSelector, useAppDispatch } from "@/store";
import { setSessionFocus } from "@/store/slices/sessionsSlice";
import { setOpenSessionMaterials } from "@/store/slices/uiSlice";
import { pushToast } from "@/store/slices/toastsSlice";
import { fmtDateNice, fmtTime12 } from "@/lib/helpers";
import type { SessionPrepMaterial } from "@/lib/types";

const TYPE_ICON: Record<SessionPrepMaterial["type"], React.ReactNode> = {
  slides: <SlideshowOutlinedIcon sx={{ fontSize: 18 }} />,
  document: <DescriptionOutlinedIcon sx={{ fontSize: 18 }} />,
  video: <VideocamOutlinedIcon sx={{ fontSize: 18 }} />,
  link: <LinkOutlinedIcon sx={{ fontSize: 18 }} />,
};

const TYPE_LABEL: Record<SessionPrepMaterial["type"], string> = {
  slides: "Slides",
  document: "Document",
  video: "Video",
  link: "Link",
};

export function SessionMaterialsDrawer() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.openSessionMaterials);
  const session = useAppSelector((s) => s.sessions.sessionFocus);

  const handleClose = () => {
    dispatch(setOpenSessionMaterials(false));
    dispatch(setSessionFocus(null));
  };

  const materials = session?.prepMaterials ?? [];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      slotProps={{ transition: { onExited: () => dispatch(setSessionFocus(null)) } }}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100vw", sm: 480 },
          maxWidth: "100vw",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.08)",
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* ── Header ── */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <DescriptionOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="subtitle1" fontWeight={700}>Session Material</Typography>
          </Stack>
          <IconButton size="small" onClick={handleClose} sx={{ color: "text.secondary" }}>
            <CloseOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* ── Content ── */}
        <Box className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto", px: 3, py: 2.5 }}>
          {session ? (
            <Stack spacing={3}>
              {/* Session context */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  border: 1,
                  borderColor: "divider",
                  bgcolor: "hsl(var(--md-surface-container) / 0.3)",
                }}
              >
                <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>{session.title}</Typography>
                {session.topic && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>{session.topic}</Typography>
                )}
                <Stack spacing={0.75}>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                    <Typography variant="caption" color="text.secondary">
                      {fmtDateNice(session.dateYmd)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <AccessTimeOutlinedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                    <Typography variant="caption" color="text.secondary">
                      {fmtTime12(session.start)}&ndash;{fmtTime12(session.end)}
                    </Typography>
                  </Stack>
                </Stack>
                {session.batch && (
                  <Chip label={session.batch} size="small" variant="outlined" sx={{ mt: 1.25, fontSize: "0.7rem" }} />
                )}
              </Box>

              {/* Materials list */}
              {materials.length > 0 ? (
                <Box>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "text.secondary" }}>
                      Materials
                    </Typography>
                    <Chip label={materials.length} size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, "& .MuiChip-label": { px: 0.75 } }} />
                  </Stack>
                  <Stack spacing={1}>
                    {materials.map((m) => {
                      const isVideo = m.type === "video";
                      return (
                        <Box
                          key={m.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            p: 1.5,
                            borderRadius: 0.5,
                            border: 1,
                            borderColor: "divider",
                            transition: "all 0.15s ease",
                            "&:hover": { bgcolor: "action.hover", borderColor: "text.disabled" },
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 0.5,
                              bgcolor: isVideo ? "hsl(var(--md-primary) / 0.08)" : "action.hover",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: isVideo ? "primary.main" : "text.secondary",
                              flexShrink: 0,
                            }}
                          >
                            {TYPE_ICON[m.type]}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8125rem" }} noWrap>
                              {m.label}
                            </Typography>
                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                              {TYPE_LABEL[m.type]}
                            </Typography>
                          </Box>
                          {isVideo ? (
                            <Button
                              variant="soft"
                              size="small"
                              startIcon={<PlayCircleOutlinedIcon sx={{ fontSize: 14 }} />}
                              onClick={() => dispatch(pushToast({ title: "Playing", description: m.label }))}
                              sx={{ fontSize: "0.7rem", flexShrink: 0 }}
                            >
                              Watch
                            </Button>
                          ) : (
                            <Button
                              variant="soft"
                              size="small"
                              startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 14 }} />}
                              onClick={() => dispatch(pushToast({ title: "Downloading", description: m.label }))}
                              sx={{ fontSize: "0.7rem", flexShrink: 0 }}
                            >
                              Download
                            </Button>
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              ) : (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <DescriptionOutlinedIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No materials available for this session yet.
                  </Typography>
                </Box>
              )}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">No session selected.</Typography>
          )}
        </Box>

        {/* ── Footer ── */}
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            zIndex: 10,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            px: 3,
            py: 2,
            flexShrink: 0,
          }}
        >
          <Button variant="text" color="inherit" onClick={handleClose}>Close</Button>
        </Box>
      </Box>
    </Drawer>
  );
}
