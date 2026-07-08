import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RemoveOutlinedIcon from "@mui/icons-material/RemoveOutlined";
import SlideshowOutlinedIcon from "@mui/icons-material/SlideshowOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import ZoomInOutlinedIcon from "@mui/icons-material/ZoomInOutlined";
import ZoomOutOutlinedIcon from "@mui/icons-material/ZoomOutOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useAppSelector, useAppDispatch } from "@/store";
import { setMaterialViewerId, setOpenPrepMaterialsModal } from "@/store/slices/uiSlice";
import { setSessionFocus } from "@/store/slices/sessionsSlice";
import { pushToast } from "@/store/slices/toastsSlice";
import type { SessionPrepMaterial } from "@/lib/types";

const TYPE_ICON: Record<SessionPrepMaterial["type"], React.ReactNode> = {
  slides: <SlideshowOutlinedIcon sx={{ fontSize: 16 }} />,
  document: <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />,
  video: <VideocamOutlinedIcon sx={{ fontSize: 16 }} />,
  link: <LinkOutlinedIcon sx={{ fontSize: 16 }} />,
};

/** Mock content surface — every type gets a distinct, chrome-appropriate preview since these are demo/placeholder materials with no real file behind them. */
function MaterialSurface({ material }: { material: SessionPrepMaterial }) {
  const dispatch = useAppDispatch();

  if (material.type === "video") {
    return (
      <Box
        sx={{
          flex: 1,
          borderRadius: "12px",
          bgcolor: "#12151a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          minHeight: 320,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <IconButton
          onClick={() => dispatch(pushToast({ title: "Playing", description: material.label }))}
          sx={{
            width: 64,
            height: 64,
            bgcolor: "rgba(255,255,255,0.12)",
            color: "#fff",
            "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
          }}
        >
          <PlayArrowIcon sx={{ fontSize: 34 }} />
        </IconButton>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
          {material.label}
        </Typography>
        <Box sx={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 4, bgcolor: "rgba(255,255,255,0.15)" }}>
          <Box sx={{ width: "0%", height: "100%", bgcolor: "primary.main" }} />
        </Box>
      </Box>
    );
  }

  if (material.type === "slides") {
    return (
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", borderRadius: "12px", border: 1, borderColor: "divider", overflow: "hidden", minHeight: 320 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1, borderBottom: 1, borderColor: "divider", bgcolor: "action.hover" }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <SlideshowOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="caption" fontWeight={600} color="text.secondary">Slide 1 of 12</Typography>
          </Stack>
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small"><ChevronLeftIcon sx={{ fontSize: 16 }} /></IconButton>
            <IconButton size="small"><ChevronRightIcon sx={{ fontSize: 16 }} /></IconButton>
          </Stack>
        </Stack>
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.paper", p: 4 }}>
          <Box sx={{ width: "100%", maxWidth: 480, aspectRatio: "16 / 9", border: 1, borderColor: "divider", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "action.hover" }}>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ textAlign: "center", px: 2 }}>
              {material.label}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  if (material.type === "link") {
    return (
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", borderRadius: "12px", border: 1, borderColor: "divider", overflow: "hidden", minHeight: 320 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, py: 1, borderBottom: 1, borderColor: "divider", bgcolor: "action.hover" }}>
          <LanguageOutlinedIcon sx={{ fontSize: 15, color: "text.disabled" }} />
          <Typography variant="caption" color="text.disabled" noWrap sx={{ flex: 1 }}>
            {material.url === "#" ? "external-resource.example.com" : material.url}
          </Typography>
        </Stack>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, p: 4 }}>
          <LinkOutlinedIcon sx={{ fontSize: 32, color: "text.disabled" }} />
          <Typography variant="body2" fontWeight={600} sx={{ textAlign: "center" }}>{material.label}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center", maxWidth: 320 }}>
            This resource opens on an external site and can&rsquo;t be shown inline.
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 15 }} />}
            onClick={() => dispatch(pushToast({ title: "Opening link", description: material.label }))}
          >
            Open link
          </Button>
        </Box>
      </Box>
    );
  }

  // document
  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", borderRadius: "12px", border: 1, borderColor: "divider", overflow: "hidden", minHeight: 320 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1, borderBottom: 1, borderColor: "divider", bgcolor: "action.hover" }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
          <DescriptionOutlinedIcon sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }} />
          <Typography variant="caption" fontWeight={600} color="text.secondary" noWrap>{material.label}</Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
          <IconButton size="small"><ZoomOutOutlinedIcon sx={{ fontSize: 15 }} /></IconButton>
          <IconButton size="small"><ZoomInOutlinedIcon sx={{ fontSize: 15 }} /></IconButton>
          <Tooltip title="Download">
            <IconButton size="small" onClick={() => dispatch(pushToast({ title: "Downloading", description: material.label }))}>
              <FileDownloadOutlinedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <Box sx={{ flex: 1, bgcolor: "background.paper", p: 3, display: "flex", justifyContent: "center" }}>
        <Box sx={{ width: "100%", maxWidth: 460, bgcolor: "action.hover", borderRadius: "8px", p: 3 }}>
          <Stack spacing={1.25}>
            <Box sx={{ height: 10, width: "60%", borderRadius: "4px", bgcolor: "divider" }} />
            {[100, 90, 95, 70, 100, 85, 40].map((w, i) => (
              <Box key={i} sx={{ height: 8, width: `${w}%`, borderRadius: "4px", bgcolor: "divider", opacity: 0.7 }} />
            ))}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, pt: 0.5 }}>
              <RemoveOutlinedIcon sx={{ fontSize: 10, color: "text.disabled" }} />
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.65rem" }}>Page 1 of 4</Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

/**
 * Fullscreen learner-facing preview of a single prep material — mirrors the
 * production course-item viewer (title, prev/next, content, sibling list)
 * so the Guru sees exactly what the learner sees before the session.
 */
export function MaterialLearnerView() {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const session = useAppSelector((s) => s.sessions.sessionFocus);
  const materialViewerId = useAppSelector((s) => s.ui.materialViewerId);

  const modules = session?.prepModules ?? [];
  const currentModule = modules.find((mod) => mod.materials.some((m) => m.id === materialViewerId));
  const materials = currentModule?.materials ?? [];
  const hasMultiple = materials.length > 1;
  const hasMultipleModules = modules.length > 1;
  const currentIndex = materials.findIndex((m) => m.id === materialViewerId);
  const material = currentIndex >= 0 ? materials[currentIndex] : undefined;
  const open = !!material;

  const closeAll = () => {
    dispatch(setMaterialViewerId(null));
    dispatch(setOpenPrepMaterialsModal(false));
    dispatch(setSessionFocus(null));
  };

  const backToList = () => {
    dispatch(setMaterialViewerId(null));
    dispatch(setOpenPrepMaterialsModal(true));
  };

  const goTo = (index: number) => {
    if (index < 0 || index >= materials.length) return;
    dispatch(setMaterialViewerId(materials[index].id));
  };

  if (!material || !session) return null;

  return (
    <Dialog open={open} onClose={closeAll} fullScreen PaperProps={{ sx: { bgcolor: "background.default" } }}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* ── Header ── */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", px: { xs: 1.5, sm: 3 }, py: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
          {hasMultipleModules ? (
            <Tooltip title="Back to materials">
              <IconButton onClick={backToList} size="small"><ArrowBackIcon sx={{ fontSize: 20 }} /></IconButton>
            </Tooltip>
          ) : null}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
              {currentModule?.label ?? session.title}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
              <Box sx={{ color: "text.secondary", display: "flex", flexShrink: 0 }}>{TYPE_ICON[material.type]}</Box>
              <Typography variant="subtitle2" fontWeight={700} noWrap>{material.label}</Typography>
            </Stack>
          </Box>
          {hasMultiple && !isMobile && (
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
              <Button
                size="small"
                variant="text"
                disabled={currentIndex <= 0}
                startIcon={<ChevronLeftIcon sx={{ fontSize: 16 }} />}
                onClick={() => goTo(currentIndex - 1)}
              >
                Previous
              </Button>
              <Button
                size="small"
                variant="text"
                disabled={currentIndex >= materials.length - 1}
                endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
                onClick={() => goTo(currentIndex + 1)}
              >
                Next
              </Button>
            </Stack>
          )}
          <Tooltip title="Close">
            <IconButton onClick={closeAll} size="small" sx={{ flexShrink: 0 }}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* ── Body ── */}
        <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <Box className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto", p: { xs: 2, sm: 3 }, display: "flex" }}>
            <MaterialSurface material={material} />
          </Box>

          {/* ── Sibling materials rail (only meaningful when there's a set) ── */}
          {hasMultiple && !isMobile && (
            <Box sx={{ width: 300, flexShrink: 0, borderLeft: 1, borderColor: "divider", bgcolor: "background.paper", display: "flex", flexDirection: "column" }}>
              <Box sx={{ px: 2, py: 1.75, borderBottom: 1, borderColor: "divider" }}>
                <Typography variant="subtitle2" fontWeight={700}>Module Materials</Typography>
              </Box>
              <Stack className="themed-scrollbar" spacing={0.5} sx={{ flex: 1, overflowY: "auto", p: 1.25 }}>
                {materials.map((m, i) => {
                  const active = m.id === material.id;
                  return (
                    <Box
                      key={m.id}
                      onClick={() => goTo(i)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.25,
                        px: 1.5,
                        py: 1.25,
                        borderRadius: "8px",
                        cursor: "pointer",
                        bgcolor: active ? "action.selected" : "transparent",
                        "&:hover": { bgcolor: active ? "action.selected" : "action.hover" },
                      }}
                    >
                      <Box sx={{ color: active ? "primary.main" : "text.secondary", display: "flex", flexShrink: 0 }}>
                        {TYPE_ICON[m.type]}
                      </Box>
                      <Typography variant="body2" sx={{ flex: 1, minWidth: 0, fontWeight: active ? 600 : 400, fontSize: "0.8125rem" }} noWrap>
                        {m.label}
                      </Typography>
                      {active && <CheckCircleIcon sx={{ fontSize: 16, color: "success.main", flexShrink: 0 }} />}
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          )}
        </Box>
      </Box>
    </Dialog>
  );
}
