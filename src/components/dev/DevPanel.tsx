import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Fab from "@mui/material/Fab";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import ViewListOutlinedIcon from "@mui/icons-material/ViewListOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import Button from "@mui/material/Button";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import { useAppSelector, useAppDispatch } from "@/store";
import { resetAvailability } from "@/store/slices/availabilitySlice";
import { setOpenLearnerRatings, setLearnerRatingsSessionId } from "@/store/slices/uiSlice";
import {
  toggleDevPanel,
  setDevPanelOpen,
  setSelectedRole,
  toggleRole,
  setGuruStage,
  GURU_ROLES,
  GURU_STAGES,
  type GuruRole,
  type GuruStage,
} from "@/store/slices/devPanelSlice";
import { ROLE_TO_CATEGORY } from "@/lib/role-config";

const DRAWER_WIDTH = 320;

export function DevPanel() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isOpen = useAppSelector((s) => s.devPanel.isOpen);
  const selectedRole = useAppSelector((s) => s.devPanel.selectedRole);
  const selectedRoles = useAppSelector((s) => s.devPanel.selectedRoles);
  const guruStage = useAppSelector((s) => s.devPanel.guruStage);

  // Cmd/Ctrl + K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        dispatch(toggleDevPanel());
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <Fab
          size="small"
          onClick={() => dispatch(setDevPanelOpen(true))}
          sx={{
            position: "fixed",
            bottom: { xs: "calc(5rem + env(safe-area-inset-bottom) + 16px)", md: 24 },
            right: { xs: 16, md: 24 },
            zIndex: 1200,
            bgcolor: "background.paper",
            color: "text.secondary",
            border: 1,
            borderColor: "divider",
            boxShadow: 3,
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <CodeOutlinedIcon sx={{ fontSize: 20 }} />
        </Fab>
      )}

      {/* Drawer */}
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => dispatch(setDevPanelOpen(false))}
        PaperProps={{
          sx: {
            width: DRAWER_WIDTH,
            bgcolor: "background.paper",
            borderLeft: 1,
            borderColor: "divider",
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2.5,
            py: 2,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <CodeOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} />
            <Typography variant="subtitle1" fontWeight={700}>
              Dev Panel
            </Typography>
            <Chip
              label={`⌘K`}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.65rem", height: 20, color: "text.secondary" }}
            />
          </Stack>
          <IconButton size="small" onClick={() => dispatch(setDevPanelOpen(false))}>
            <CloseOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Role Selector */}
        <Box sx={{ px: 2.5, pt: 2, pb: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
            <PersonOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Guru Role
            </Typography>
          </Stack>
          <FormControl size="small" fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              value={selectedRole}
              onChange={(e) => dispatch(setSelectedRole(e.target.value as GuruRole))}
              sx={{ fontSize: "0.85rem" }}
            >
              {GURU_ROLES.map((role) => (
                <MenuItem key={role} value={role} sx={{ fontSize: "0.85rem" }}>{role}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Multi-Role Selector (Profile) */}
        <Box sx={{ px: 2.5, pt: 1.5, pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.75 }}>
            <PersonOutlinedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.6rem" }}>
              Active Guru Roles (Profile)
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.6rem", display: "block", mb: 1 }}>
            Controls which rating categories appear on Profile
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.75}>
            {GURU_ROLES.map((role) => {
              const isSelected = selectedRoles.includes(role);
              const category = ROLE_TO_CATEGORY[role];
              return (
                <Chip
                  key={role}
                  label={role}
                  size="small"
                  color={isSelected ? "primary" : "default"}
                  variant={isSelected ? "filled" : "outlined"}
                  onClick={() => dispatch(toggleRole(role))}
                  sx={{
                    fontSize: "0.65rem",
                    height: 24,
                    cursor: "pointer",
                    "& .MuiChip-label": { px: 1 },
                  }}
                  title={`Category: ${category}`}
                />
              );
            })}
          </Stack>
        </Box>

        <Divider sx={{ my: 1.5, mx: 2.5 }} />

        {/* Dev Tools */}
        <Box sx={{ px: 2.5, pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.5 }}>
            <CodeOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Dev Tools
            </Typography>
          </Stack>
        </Box>

        <Box sx={{ px: 2.5, pb: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.5 }}>
            <PersonOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
              User Stage
            </Typography>
          </Stack>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontSize: "0.75rem" }}>Stage</InputLabel>
            <Select
              label="Stage"
              value={guruStage}
              onChange={(e) => dispatch(setGuruStage(e.target.value as GuruStage))}
              sx={{ fontSize: "0.8rem" }}
            >
              {GURU_STAGES.map((stage) => (
                <MenuItem key={stage.value} value={stage.value} sx={{ fontSize: "0.8rem" }}>
                  <Box>
                    <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8rem" }}>{stage.label}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>{stage.description}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ my: 1.5, mx: 2.5 }} />

        <List dense sx={{ px: 1, py: 0 }}>
          <ListItemButton
            sx={{ borderRadius: "8px", mx: 0.5, mb: 0.5, py: 0.75 }}
            onClick={() => {
              navigate("/components");
              dispatch(setDevPanelOpen(false));
            }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <ViewListOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            </ListItemIcon>
            <ListItemText
              primary="Components"
              secondary="Event cards & variants"
              primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
              secondaryTypographyProps={{ variant: "caption" }}
            />
          </ListItemButton>
        </List>

        <Divider sx={{ my: 1.5, mx: 2.5 }} />

        {/* Feedback quick-launch */}
        <Box sx={{ px: 2.5, pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
            <StarOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Feedback
            </Typography>
          </Stack>
        </Box>
        <List dense sx={{ px: 1, py: 0, mb: 1.5 }}>
          {[
            { id: "s0", label: "Online Session", desc: "Charts + comments" },
            { id: "res1", label: "Residency", desc: "Charts + comments" },
            { id: "eval1", label: "Evaluation (4★)", desc: "Tags + comments" },
            { id: "mod1", label: "Moderation (5★)", desc: "Positive tags" },
          ].map((item) => (
            <ListItemButton
              key={item.id}
              sx={{ borderRadius: "8px", mx: 0.5, mb: 0.5, py: 0.5 }}
              onClick={() => {
                dispatch(setLearnerRatingsSessionId(item.id));
                dispatch(setOpenLearnerRatings(true));
                dispatch(setDevPanelOpen(false));
              }}
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                <StarOutlinedIcon sx={{ fontSize: 14, color: "var(--gl-star-color)" }} />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                secondary={item.desc}
                primaryTypographyProps={{ variant: "body2", fontWeight: 500, fontSize: "0.78rem" }}
                secondaryTypographyProps={{ variant: "caption", fontSize: "0.65rem" }}
              />
            </ListItemButton>
          ))}
        </List>

        <Divider sx={{ my: 1.5, mx: 2.5 }} />

        <Box sx={{ px: 2.5, pb: 2 }}>
          <Button
            variant="soft"
            size="small"
            color="primary"
            startIcon={<RestartAltOutlinedIcon sx={{ fontSize: 16 }} />}
            fullWidth
            onClick={() => {
              dispatch(resetAvailability());
            }}
            sx={{ textTransform: "none", fontSize: "0.8rem" }}
          >
            Reset availability
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
