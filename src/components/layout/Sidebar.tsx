import { NavLink } from "react-router-dom";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  FileText,
  House,
  Moon,
  Settings,
  Sun,
  Users,
} from "lucide-react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useAppSelector, useAppDispatch } from "@/store";
import { setIsNavCollapsed, setIsDarkMode } from "@/store/slices/uiSlice";

const NAV_ITEM_SX = {
  display: "flex",
  alignItems: "center",
  width: "100%",
  borderRadius: "10px",
  py: 1,
  fontSize: "0.875rem",
  border: "1px solid transparent",
  color: "hsl(var(--md-on-surface-variant))",
  textDecoration: "none",
  transition: "background-color 0.15s, color 0.15s",
  "&:hover": { backgroundColor: "hsl(var(--md-surface-container) / 0.3)" },
} as const;

const NAV_ITEM_ACTIVE_SX = {
  backgroundColor: "hsl(var(--md-surface-container) / 0.4)",
  color: "hsl(var(--md-on-surface))",
  borderColor: "hsl(var(--md-outline-variant))",
} as const;

export function Sidebar() {
  const dispatch = useAppDispatch();
  const isNavCollapsed = useAppSelector((s) => s.ui.isNavCollapsed);
  const isDarkMode = useAppSelector((s) => s.ui.isDarkMode);
  const unreadCount = useAppSelector((s) =>
    s.notifications.items.filter((n) => !n.read).length
  );

  const collapsedSx = isNavCollapsed
    ? { justifyContent: "center", px: 1 }
    : { justifyContent: "flex-start", gap: 1.5, px: 1.5 };

  return (
    <Box
      component="aside"
      sx={{
        display: { xs: "none", md: "block" },
        borderRight: 1,
        borderColor: "divider",
        backgroundColor: "hsl(var(--md-surface))",
        position: "sticky",
        top: 0,
        height: "100vh",
      }}
    >
      <Box sx={{ height: "100%", p: 2, display: "flex", flexDirection: "column" }}>
        {/* Sidebar header */}
        <Box
          sx={{
            mb: 2,
            display: "flex",
            alignItems: "center",
            borderRadius: "10px",
            border: 1,
            borderColor: "divider",
            backgroundColor: "hsl(var(--md-surface))",
            py: 1,
            ...collapsedSx,
          }}
        >
          <Box sx={{ display: "grid", height: 32, width: 32, placeItems: "center" }} aria-label="Great Learning">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.9338 30.4595L20.0177 30.3608L23.4279 26.2037H18.8904C13.201 26.2037 8.57217 21.6262 8.57217 15.9998C8.57217 10.3731 13.201 5.79565 18.8904 5.79565H24.1907L27.7173 1.54004H18.8904C10.8277 1.54004 4.26855 8.02664 4.26855 15.9998C4.26855 23.9729 10.8277 30.4595 18.8904 30.4595H19.9338Z" fill="#0E39A9" />
              <path d="M4.26855 15.9998C4.26855 19.6784 5.66696 23.0386 7.96278 25.5933L10.726 22.2286C9.37739 20.5039 8.57193 18.3438 8.57193 15.9998C8.57193 10.3733 13.201 5.79588 18.8904 5.79588H24.2224L27.7173 1.54004H18.8904C10.8277 1.54004 4.26855 8.02664 4.26855 15.9998Z" fill="#1974D2" />
              <path d="M23.4277 26.2038L27.7311 20.9576V13.7129H18.5888L15.1025 17.9687H23.4277V26.2038Z" fill="#0E39A9" />
            </svg>
          </Box>
          {!isNavCollapsed && (
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                Guru Dashboard
              </Typography>
            </Box>
          )}
        </Box>

        {!isNavCollapsed && (
          <Typography
            variant="caption"
            sx={{ mb: 1.5, px: 1, fontWeight: 600, color: "hsl(var(--md-on-surface-variant))" }}
          >
            Navigation
          </Typography>
        )}

        <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          {/* Main nav links */}
          <Box component="nav" sx={{ display: "flex", flexDirection: "column", gap: 0.5 }} aria-label="Primary navigation">
            <NavLink to="/" end style={{ textDecoration: "none" }}>
              {({ isActive }) => (
                <Box sx={{ ...NAV_ITEM_SX, ...(isActive ? NAV_ITEM_ACTIVE_SX : {}), ...collapsedSx }}>
                  <House style={{ width: 16, height: 16, flexShrink: 0 }} />
                  {!isNavCollapsed && <span>Home</span>}
                </Box>
              )}
            </NavLink>

            <NavLink to="/courses" style={{ textDecoration: "none" }}>
              {({ isActive }) => (
                <Box sx={{ ...NAV_ITEM_SX, ...(isActive ? NAV_ITEM_ACTIVE_SX : {}), ...collapsedSx }}>
                  <FileText style={{ width: 16, height: 16, flexShrink: 0 }} />
                  {!isNavCollapsed && <span style={{ flex: 1, textAlign: "left" }}>Courses</span>}
                </Box>
              )}
            </NavLink>

            <NavLink to="/profile" style={{ textDecoration: "none" }}>
              {({ isActive }) => (
                <Box sx={{ ...NAV_ITEM_SX, ...(isActive ? NAV_ITEM_ACTIVE_SX : {}), ...collapsedSx }}>
                  <Users style={{ width: 16, height: 16, flexShrink: 0 }} />
                  {!isNavCollapsed && <span>Profile</span>}
                </Box>
              )}
            </NavLink>

            <NavLink to="/notifications" style={{ textDecoration: "none" }}>
              {({ isActive }) => (
                <Box sx={{ ...NAV_ITEM_SX, ...(isActive ? NAV_ITEM_ACTIVE_SX : {}), ...collapsedSx }}>
                  {isNavCollapsed ? (
                    unreadCount > 0 ? (
                      <Box
                        component="span"
                        sx={{
                          display: "inline-flex", height: 20, minWidth: 20, alignItems: "center",
                          justifyContent: "center", borderRadius: 9999, backgroundColor: "var(--gl-badge-bg)",
                          px: 0.75, fontSize: "11px", fontWeight: 600, color: "#fff",
                        }}
                      >
                        {unreadCount}
                      </Box>
                    ) : (
                      <Bell style={{ width: 16, height: 16, flexShrink: 0 }} />
                    )
                  ) : (
                    <Bell style={{ width: 16, height: 16, flexShrink: 0 }} />
                  )}
                  {!isNavCollapsed && <span style={{ flex: 1, textAlign: "left" }}>Alerts</span>}
                  {!isNavCollapsed && unreadCount > 0 && (
                    <Box
                      component="span"
                      sx={{
                        flexShrink: 0, ml: "auto", display: "inline-flex", height: 20, minWidth: 20,
                        alignItems: "center", justifyContent: "center", borderRadius: 9999,
                        backgroundColor: "var(--gl-badge-bg)", px: 0.75, fontSize: "11px",
                        fontWeight: 600, color: "#fff",
                      }}
                    >
                      {unreadCount}
                    </Box>
                  )}
                </Box>
              )}
            </NavLink>
          </Box>

          {/* Bottom nav */}
          <Box sx={{ mt: "auto", pt: 1 }}>
            <Box
              component="button"
              type="button"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
              sx={{
                mb: 0.5,
                width: "100%",
                borderRadius: "10px",
                py: 1,
                fontSize: "0.875rem",
                border: "1px solid transparent",
                backgroundColor: "transparent",
                cursor: "pointer",
                fontFamily: "inherit",
                color: "hsl(var(--md-on-surface-variant))",
                "&:hover": { backgroundColor: "hsl(var(--md-surface-container) / 0.3)" },
                display: "flex",
                alignItems: "center",
                ...collapsedSx,
              }}
            >
              {isDarkMode ? <Sun style={{ width: 16, height: 16 }} /> : <Moon style={{ width: 16, height: 16 }} />}
              {!isNavCollapsed && <span>{isDarkMode ? "Light mode" : "Dark mode"}</span>}
            </Box>

            <NavLink to="/preferences" style={{ textDecoration: "none", marginTop: 4, display: "block" }}>
              {({ isActive }) => (
                <Box sx={{ ...NAV_ITEM_SX, ...(isActive ? NAV_ITEM_ACTIVE_SX : {}), ...collapsedSx, mt: 0.5 }}>
                  <Settings style={{ width: 16, height: 16, flexShrink: 0 }} />
                  {!isNavCollapsed && <span>Preferences</span>}
                </Box>
              )}
            </NavLink>
          </Box>
        </Box>

        <Box sx={{ mt: 1.5, display: "flex", justifyContent: isNavCollapsed ? "center" : "flex-end" }}>
          <IconButton
            onClick={() => dispatch(setIsNavCollapsed(!isNavCollapsed))}
            aria-label={isNavCollapsed ? "Expand navigation panel" : "Collapse navigation panel"}
            sx={{ height: 40, width: 40, border: "1px solid", borderColor: "divider" }}
          >
            {isNavCollapsed ? <ChevronRight style={{ width: 16, height: 16 }} /> : <ChevronLeft style={{ width: 16, height: 16 }} />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
