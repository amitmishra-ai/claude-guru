import { useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useAppSelector, useAppDispatch } from "@/store";
import { setOpenCourseDetail, setCourseDetailId } from "@/store/slices/uiSlice";
import { demoCourseCatalog, demoCourseModules } from "@/data/demo-sessions";
import { CoursePatternThumb } from "@/components/shared/CoursePatternThumb";
import type { CourseSection } from "@/lib/types";

function SectionPanel({
  section,
  defaultOpen,
}: {
  section: CourseSection;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const videoCount = section.videos.length;
  const presCount = section.presentations.length;

  return (
    <Box
      sx={{
        border: 1,
        borderColor: section.isNew ? "primary.main" : "divider",
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: section.isNew ? "rgba(25, 106, 229, 0.08)" : "background.paper",
        ...(section.isNew && { boxShadow: "0 0 0 1px #196ae5" }),
      }}
    >
      {/* Section header */}
      <Box
        component="button"
        onClick={() => setOpen((v) => !v)}
        sx={{
          width: "100%", display: "flex", alignItems: "flex-start", gap: 1.5,
          px: 2, py: 1.75, border: "none", cursor: "pointer", textAlign: "left",
          bgcolor: "transparent",
          fontFamily: "inherit",
          "&:hover": { bgcolor: section.isNew ? "rgba(25, 106, 229, 0.12)" : "action.hover" },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            {section.isNew && (
              <Chip
                label="New"
                size="small"
                icon={<span style={{ fontSize: 10, marginLeft: 5 }}>✦</span>}
                sx={{
                  bgcolor: "var(--gl-new-badge-bg)", color: "var(--gl-new-badge-text)",
                  fontWeight: 700, flexShrink: 0,
                  "& .MuiChip-icon": { color: "var(--gl-new-badge-text)", ml: "4px" },
                }}
              />
            )}
            <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
              {section.title}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {videoCount} Video{videoCount !== 1 ? "s" : ""}{presCount > 0 ? ` · ${presCount} Resource${presCount !== 1 ? "s" : ""}` : ""}
          </Typography>
        </Box>
        <Box sx={{ flexShrink: 0, mt: 0.25, color: "text.secondary" }}>
          {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </Box>
      </Box>

      {/* Expanded content */}
      {open && (
        <Box sx={{ borderTop: 1, borderColor: "divider" }}>
          {/* Videos */}
          {section.videos.map((v, i) => (
            <Box
              key={v.id}
              sx={{
                display: "flex", alignItems: "center", gap: 1.5,
                px: 2, py: 1.25, cursor: "pointer",
                bgcolor: "background.paper",
                borderBottom: i < section.videos.length - 1 || section.presentations.length > 0 ? 1 : 0,
                borderColor: "divider",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <PlayCircleOutlineIcon sx={{ fontSize: 18, color: "primary.main", flexShrink: 0 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: v.viewed ? 400 : 500, color: v.viewed ? "text.secondary" : "text.primary", fontSize: "0.8125rem" }} noWrap>
                  {v.number}&nbsp;&nbsp;{v.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                  {v.duration}
                </Typography>
              </Box>
              <ChevronRightIcon sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }} />
            </Box>
          ))}

          {/* Presentations */}
          {section.presentations.length > 0 && (
            <>
              <Box sx={{ px: 2, py: 1, bgcolor: "action.hover" }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.65rem" }}>
                  Presentations
                </Typography>
              </Box>
              {section.presentations.map((p, i) => (
                <Box
                  key={p.id}
                  sx={{
                    display: "flex", alignItems: "center", gap: 1.5,
                    px: 2, py: 1.25, cursor: "pointer",
                    bgcolor: p.viewed ? "action.selected" : "background.paper",
                    borderBottom: i < section.presentations.length - 1 ? 1 : 0,
                    borderColor: "divider",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <InsertDriveFileOutlinedIcon sx={{ fontSize: 16, color: "primary.main", flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.8125rem" }} noWrap>
                      {p.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                      {p.sizeKb}
                    </Typography>
                  </Box>
                  {p.viewed && (
                    <Chip
                      label="Viewed"
                      size="small"
                      sx={{ bgcolor: "var(--gl-status-confirmed-bg)", color: "var(--gl-status-confirmed-text)", fontWeight: 600, flexShrink: 0 }}
                    />
                  )}
                  <IconButton size="small" sx={{ flexShrink: 0, color: "primary.main" }}>
                    <FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <ChevronRightIcon sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }} />
                </Box>
              ))}
            </>
          )}
        </Box>
      )}
    </Box>
  );
}

export function CourseDetailDialog() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.openCourseDetail);
  const courseId = useAppSelector((s) => s.ui.courseDetailId);

  const course = demoCourseCatalog.find((c) => c.id === courseId);
  const moduleData = courseId ? demoCourseModules[courseId] : undefined;

  const close = () => {
    dispatch(setOpenCourseDetail(false));
    dispatch(setCourseDetailId(null));
  };

  if (!course) return null;

  const sections = moduleData?.sections ?? [];
  const totalSections = sections.length;
  const completedSections = sections.filter((s) => s.progress === 100).length;
  const overallProgress = totalSections > 0
    ? Math.round(sections.reduce((acc, s) => acc + s.progress, 0) / totalSections)
    : 0;

  return (
    <Dialog
      open={open}
      onClose={close}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          p: 0,
          maxHeight: "90vh",
          overflow: "hidden",
          width: { xs: "calc(100vw - 1.5rem)", sm: "100%" },
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
        {/* Header */}
        <Box sx={{ position: "sticky", top: 0, zIndex: 10, bgcolor: "background.paper", borderBottom: 1, borderColor: "divider", px: 3, pt: 2.5, pb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
            <CoursePatternThumb color={course.color ?? "#6366f1"} pattern={course.pattern ?? 0} size={80} borderRadius={10} />

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <Chip label={course.role} size="small" variant="outlined" />
                {course.isNew && (
                  <Chip
                    label="New content"
                    size="small"
                    icon={<span style={{ fontSize: 10, marginLeft: 5 }}>✦</span>}
                    sx={{
                      bgcolor: "var(--gl-new-badge-bg)", color: "var(--gl-new-badge-text)",
                      fontWeight: 700,
                      "& .MuiChip-icon": { color: "var(--gl-new-badge-text)", ml: "4px" },
                    }}
                  />
                )}
              </Box>
              <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.3, fontSize: "1.05rem" }}>
                {course.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, fontSize: "0.8rem" }}>
                {course.program} &bull; {course.batch}
              </Typography>

            </Box>

            <IconButton size="small" onClick={close} sx={{ flexShrink: 0 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Content */}
        <DialogContent className="themed-scrollbar" sx={{ flex: 1, overflowY: "auto", p: 0 }}>
          <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
            {sections.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                No modules available yet.
              </Typography>
            ) : (
              sections.map((section, i) => (
                <SectionPanel key={section.id} section={section} defaultOpen={i === 0} />
              ))
            )}
          </Box>
        </DialogContent>
      </Box>
    </Dialog>
  );
}
