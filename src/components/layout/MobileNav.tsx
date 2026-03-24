import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { useAppSelector, useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/toastsSlice";

export function MobileNav() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const guruName = useAppSelector((s) => s.profile.guruName);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const initials = guruName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleMenuClose = () => setMenuAnchor(null);

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
    <>
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

          <ButtonBase
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            sx={{ ...linkSx, border: "none", background: "none", fontFamily: "inherit" }}
          >
            <Avatar variant="circular" sx={{ width: 22, height: 22, fontSize: "0.55rem", fontWeight: 700, bgcolor: "primary.main", borderRadius: "50%" }}>
              {initials}
            </Avatar>
            <span style={{ fontSize: 11 }}>Account</span>
          </ButtonBase>
        </Box>
      </Box>

      {/* ── User menu ── */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 240,
              borderRadius: 2.5,
              boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
              mb: 1,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" fontWeight={600}>{guruName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {guruName.toLowerCase().replace(/\s+/g, ".")}@greatlearning.in
          </Typography>
        </Box>
        <Divider />

        <MenuItem onClick={() => { handleMenuClose(); navigate("/preferences"); }}>
          <ListItemIcon><SettingsOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => { handleMenuClose(); dispatch(pushToast({ title: "Switching dashboard", description: "Redirecting to Learner Dashboard..." })); }}>
          <ListItemIcon><SwapHorizOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Switch to Learner Dashboard</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => { handleMenuClose(); dispatch(pushToast({ title: "Refer participants", description: "Opening referral link..." })); }}>
          <ListItemIcon><PersonAddAltOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Refer Participants</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={() => { handleMenuClose(); dispatch(pushToast({ title: "Logged out", description: "You have been signed out." })); }}>
          <ListItemIcon><LogoutOutlinedIcon fontSize="small" sx={{ color: "error.main" }} /></ListItemIcon>
          <ListItemText sx={{ "& .MuiListItemText-primary": { color: "error.main" } }}>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
