import { NavLink } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import Box from "@mui/material/Box";

export function MobileNav() {
  const linkSx = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 0.25,
    borderRadius: "12px",
    px: 1.5,
    py: 0.75,
    fontSize: "11px",
    color: "hsl(var(--md-on-surface-variant))",
    textDecoration: "none",
    transition: "color 0.15s",
  } as const;

  const activeSx = {
    color: "hsl(var(--md-on-surface))",
    fontWeight: 500,
  } as const;

  return (
    <Box
      component="nav"
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        borderTop: 1,
        borderColor: "divider",
        backgroundColor: "hsl(var(--md-surface))",
        display: { md: "none" },
        pb: "env(safe-area-inset-bottom)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-around", py: 0.5 }}>
        <NavLink to="/" end style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Box sx={{ ...linkSx, ...(isActive ? activeSx : {}) }}>
              <HomeOutlinedIcon sx={{ fontSize: 20 }} />
              <span>Home</span>
            </Box>
          )}
        </NavLink>

        <NavLink to="/profile" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Box sx={{ ...linkSx, ...(isActive ? activeSx : {}) }}>
              <GroupOutlinedIcon sx={{ fontSize: 20 }} />
              <span>Profile</span>
            </Box>
          )}
        </NavLink>

        <NavLink to="/courses" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Box sx={{ ...linkSx, ...(isActive ? activeSx : {}) }}>
              <DescriptionOutlinedIcon sx={{ fontSize: 20 }} />
              <span>Courses</span>
            </Box>
          )}
        </NavLink>

        <NavLink to="/preferences" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Box sx={{ ...linkSx, ...(isActive ? activeSx : {}) }}>
              <SettingsOutlinedIcon sx={{ fontSize: 20 }} />
              <span>Settings</span>
            </Box>
          )}
        </NavLink>
      </Box>
    </Box>
  );
}
