import { useEffect } from "react";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Fade from "@mui/material/Fade";
import { useAppSelector, useAppDispatch } from "@/store";
import { clearRoleSwitching } from "@/store/slices/devPanelSlice";

export function RoleSwitchOverlay() {
  const dispatch = useAppDispatch();
  const isRoleSwitching = useAppSelector((s) => s.devPanel.isRoleSwitching);
  const selectedRole = useAppSelector((s) => s.devPanel.selectedRole);

  useEffect(() => {
    if (!isRoleSwitching) return;
    const timer = setTimeout(() => dispatch(clearRoleSwitching()), 1000);
    return () => clearTimeout(timer);
  }, [isRoleSwitching, dispatch]);

  return (
    <Fade in={isRoleSwitching} timeout={{ enter: 150, exit: 300 }}>
      <Backdrop
        open
        sx={{
          zIndex: (theme) => theme.zIndex.drawer - 1,
          bgcolor: "hsl(var(--md-surface) / 0.85)",
          backdropFilter: "blur(6px)",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={32} />
          <Typography variant="body2" fontWeight={600} color="text.secondary">
            Switching to {selectedRole}
          </Typography>
        </Stack>
      </Backdrop>
    </Fade>
  );
}
