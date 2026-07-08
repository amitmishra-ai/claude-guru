import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useAppSelector, useAppDispatch } from "@/store";
import { setOpenPrepMaterialsModal, setMaterialViewerId } from "@/store/slices/uiSlice";
import { setSessionFocus } from "@/store/slices/sessionsSlice";

/**
 * Opens when a session has more than one prep material — lists every module
 * as a plain, arrow-terminated row so the Guru can pick which one to open.
 * The arrow drops straight into the same learner-facing view a student sees
 * (MaterialLearnerView).
 */
export function PrepMaterialsModal() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.openPrepMaterialsModal);
  const session = useAppSelector((s) => s.sessions.sessionFocus);

  const close = () => {
    dispatch(setOpenPrepMaterialsModal(false));
    dispatch(setSessionFocus(null));
  };

  const modules = session?.prepModules ?? [];

  const openModule = (moduleId: string) => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod || mod.materials.length === 0) return;
    dispatch(setOpenPrepMaterialsModal(false));
    dispatch(setMaterialViewerId(mod.materials[0].id));
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, pb: 1 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>Review Material</Typography>
          {session && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
              {session.title} &middot; {session.program}
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={close} sx={{ color: "text.secondary", mt: -0.5 }}>
          <CloseOutlinedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 0.5, pb: 2.5 }}>
        {modules.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <FolderOutlinedIcon sx={{ fontSize: 32, color: "text.disabled", mb: 1 }} />
            <Typography variant="body2" color="text.secondary">No materials have been added for this session.</Typography>
          </Box>
        ) : (
          <Box sx={{ mt: 0.5, border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}>
            {modules.map((mod, i) => (
              <Box
                key={mod.id}
                onClick={() => openModule(mod.id)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1.5,
                  px: 2,
                  py: 1.75,
                  cursor: "pointer",
                  borderBottom: i < modules.length - 1 ? 1 : 0,
                  borderColor: "divider",
                  transition: "background-color 0.15s ease",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.875rem" }} noWrap>
                  {mod.label}
                </Typography>
                <ChevronRightIcon sx={{ fontSize: 20, color: "text.secondary", flexShrink: 0 }} />
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
