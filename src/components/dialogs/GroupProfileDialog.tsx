import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { useAppSelector, useAppDispatch } from "@/store";
import { setOpenGroupProfile } from "@/store/slices/uiSlice";

export function GroupProfileDialog() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.openGroupProfile);

  return (
    <Dialog open={open} onClose={() => dispatch(setOpenGroupProfile(false))} maxWidth="xs" fullWidth>
      <DialogTitle>Group profile (PDF)</DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box
            sx={{
              borderRadius: "8px",
              border: 1,
              borderColor: "divider",
              backgroundColor: "hsl(var(--md-surface-container) / 0.3)",
              p: 1.5,
              fontSize: "0.875rem",
              color: "hsl(var(--md-on-surface-variant))",
            }}
          >
            In reality this arrives via email as a PDF; here we surface it next to session actions.
          </Box>

          <Box
            sx={{
              borderRadius: "8px",
              border: 1,
              borderColor: "divider",
              backgroundColor: "hsl(var(--md-surface))",
              p: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Box sx={{ fontSize: "0.875rem", fontWeight: 600 }}>Cohort Feb &middot; Group 07</Box>
                <Box sx={{ mt: 0.5, fontSize: "0.75rem", color: "hsl(var(--md-on-surface-variant))" }}>(Placeholder preview)</Box>
              </Box>
              <Chip size="small" color="primary" label="PDF" />
            </Box>

            <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 1, fontSize: "0.875rem" }}>
              {[
                { label: "Avg work exp", value: "6.2 yrs" },
                { label: "Programming exp", value: "Mixed" },
                { label: "Top industries", value: "IT, BFSI, Ops" },
                { label: "Learners", value: "25" },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box component="span" sx={{ color: "hsl(var(--md-on-surface-variant))" }}>{label}</Box>
                  <Box component="span" sx={{ fontWeight: 500 }}>{value}</Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ flexDirection: { xs: "column", sm: "row" }, gap: { xs: 1, sm: 0 }, "& > :not(:first-of-type)": { ml: { xs: 0, sm: 1 } } }}>
        <Button variant="text" color="inherit" onClick={() => dispatch(setOpenGroupProfile(false))} sx={{ width: { xs: "100%", sm: "auto" } }}>
          Close
        </Button>
        <Button variant="contained" sx={{ width: { xs: "100%", sm: "auto" } }}>
          Download / open PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
}
