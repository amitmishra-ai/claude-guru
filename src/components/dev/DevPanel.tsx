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
import { useAppSelector, useAppDispatch } from "@/store";
import { resetAvailability } from "@/store/slices/availabilitySlice";
import {
  toggleDevPanel,
  setDevPanelOpen,
  setSelectedRole,
  setGuruStage,
  GURU_ROLES,
  GURU_STAGES,
  type GuruRole,
  type GuruStage,
} from "@/store/slices/devPanelSlice";

const DRAWER_WIDTH = 320;

export function DevPanel() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isOpen = useAppSelector((s) => s.devPanel.isOpen);
  const selectedRole = useAppSelector((s) => s.devPanel.selectedRole);
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

        <Box sx={{ px: 2.5, pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.5 }}>
            <PersonOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
              User Stage
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: "block" }}>
            Simulate different user lifecycle stages.
          </Typography>
        </Box>

        <List dense sx={{ px: 1, py: 0, mb: 1.5 }}>
          {GURU_STAGES.map((stage) => {
            const isSelected = stage.value === guruStage;
            return (
              <ListItemButton
                key={stage.value}
                selected={isSelected}
                onClick={() => dispatch(setGuruStage(stage.value))}
                sx={{
                  borderRadius: "8px",
                  mx: 0.5,
                  mb: 0.5,
                  py: 0.75,
                  ...(isSelected && {
                    bgcolor: "hsl(var(--md-primary-container) / 0.15)",
                    "&.Mui-selected:hover": {
                      bgcolor: "hsl(var(--md-primary-container) / 0.2)",
                    },
                  }),
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {isSelected ? (
                    <CheckCircleOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} />
                  ) : (
                    <Box sx={{ width: 18, height: 18, borderRadius: "50%", border: 1.5, borderColor: "divider" }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={stage.label}
                  secondary={stage.description}
                  primaryTypographyProps={{
                    variant: "body2",
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? "primary.main" : "text.primary",
                  }}
                  secondaryTypographyProps={{ variant: "caption" }}
                />
              </ListItemButton>
            );
          })}
        </List>

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
