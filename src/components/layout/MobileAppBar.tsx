import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useAppSelector, useAppDispatch } from "@/store";
import { setIsDarkMode } from "@/store/slices/uiSlice";
import { pushToast } from "@/store/slices/toastsSlice";

export function MobileAppBar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isDarkMode = useAppSelector((s) => s.ui.isDarkMode);
  const guruName = useAppSelector((s) => s.profile.guruName);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const initials = guruName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleMenuClose = () => setMenuAnchor(null);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          display: { md: "none" },
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "hsl(var(--md-surface))",
          color: "text.primary",
          zIndex: 40,
          pt: "env(safe-area-inset-top)",
        }}
      >
        <Toolbar sx={{ minHeight: 56, px: 2, gap: 1 }}>
          {/* Logo + title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flex: 1 }}>
            <Box sx={{ display: "grid", height: 28, width: 28, placeItems: "center", flexShrink: 0 }} aria-label="Great Learning">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.9338 30.4595L20.0177 30.3608L23.4279 26.2037H18.8904C13.201 26.2037 8.57217 21.6262 8.57217 15.9998C8.57217 10.3731 13.201 5.79565 18.8904 5.79565H24.1907L27.7173 1.54004H18.8904C10.8277 1.54004 4.26855 8.02664 4.26855 15.9998C4.26855 23.9729 10.8277 30.4595 18.8904 30.4595H19.9338Z" fill={isDarkMode ? "#FFFFFF" : "#0E39A9"} />
                <path d="M4.26855 15.9998C4.26855 19.6784 5.66696 23.0386 7.96278 25.5933L10.726 22.2286C9.37739 20.5039 8.57193 18.3438 8.57193 15.9998C8.57193 10.3733 13.201 5.79588 18.8904 5.79588H24.2224L27.7173 1.54004H18.8904C10.8277 1.54004 4.26855 8.02664 4.26855 15.9998Z" fill={isDarkMode ? "#FFFFFF" : "#1974D2"} />
                <path d="M23.4277 26.2038L27.7311 20.9576V13.7129H18.5888L15.1025 17.9687H23.4277V26.2038Z" fill={isDarkMode ? "#FFFFFF" : "#0E39A9"} />
              </svg>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 600, lineHeight: 1 }}>
              Guru Dashboard
            </Typography>
          </Box>

          {/* Dark mode toggle */}
          <IconButton
            size="small"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
            sx={{ color: "text.secondary", p: 1.25 }}
          >
            {isDarkMode
              ? <LightModeOutlinedIcon sx={{ fontSize: 18 }} />
              : <DarkModeOutlinedIcon sx={{ fontSize: 18 }} />
            }
          </IconButton>

          {/* Account avatar */}
          <IconButton
            size="small"
            aria-label="Account"
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            sx={{ p: 0.5 }}
          >
            <Avatar
              variant="circular"
              sx={{
                width: 28,
                height: 28,
                fontSize: "0.6rem",
                fontWeight: 700,
                bgcolor: "primary.main",
                color: "#fff",
              }}
            >
              {initials}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* ── Account menu ── */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 240,
              borderRadius: 2.5,
              boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
              mt: 0.5,
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
