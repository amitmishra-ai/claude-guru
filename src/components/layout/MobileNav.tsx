import { NavLink } from "react-router-dom";
import { Bell, CalendarDays, House, Settings, Users } from "lucide-react";
import Box from "@mui/material/Box";
import { useAppSelector } from "@/store";

export function MobileNav() {
  const unreadCount = useAppSelector((s) =>
    s.notifications.items.filter((n) => !n.read).length
  );

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
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-around", py: 0.5 }}>
        <NavLink to="/" end style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Box sx={{ ...linkSx, ...(isActive ? activeSx : {}) }}>
              <House style={{ width: 20, height: 20 }} />
              <span>Home</span>
            </Box>
          )}
        </NavLink>

        <NavLink to="/calendar" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Box sx={{ ...linkSx, ...(isActive ? activeSx : {}) }}>
              <CalendarDays style={{ width: 20, height: 20 }} />
              <span>Calendar</span>
            </Box>
          )}
        </NavLink>

        <NavLink to="/notifications" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Box sx={{ ...linkSx, ...(isActive ? activeSx : {}) }}>
              <Box sx={{ position: "relative" }}>
                <Bell style={{ width: 20, height: 20 }} />
                {unreadCount > 0 && (
                  <Box
                    component="span"
                    sx={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      display: "inline-flex",
                      height: 16,
                      minWidth: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 9999,
                      backgroundColor: "var(--gl-badge-bg)",
                      px: 0.5,
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "#fff",
                    }}
                  >
                    {unreadCount}
                  </Box>
                )}
              </Box>
              <span>Alerts</span>
            </Box>
          )}
        </NavLink>

        <NavLink to="/profile" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Box sx={{ ...linkSx, ...(isActive ? activeSx : {}) }}>
              <Users style={{ width: 20, height: 20 }} />
              <span>Profile</span>
            </Box>
          )}
        </NavLink>

        <NavLink to="/preferences" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Box sx={{ ...linkSx, ...(isActive ? activeSx : {}) }}>
              <Settings style={{ width: 20, height: 20 }} />
              <span>Settings</span>
            </Box>
          )}
        </NavLink>
      </Box>
    </Box>
  );
}
