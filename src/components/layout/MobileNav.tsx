import { NavLink } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import HomeIcon from "@mui/icons-material/Home";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DescriptionIcon from "@mui/icons-material/Description";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PersonIcon from "@mui/icons-material/Person";
import Box from "@mui/material/Box";

/**
 * Material 3 Navigation Bar - native Android feel.
 * Active state: filled icon inside a tinted pill indicator + bold label.
 * Inactive: outlined icon + muted label.
 */

const NAV_ITEMS = [
  { to: "/", end: true, label: "Home", Icon: HomeOutlinedIcon, ActiveIcon: HomeIcon },
  { to: "/courses", end: false, label: "Courses", Icon: DescriptionOutlinedIcon, ActiveIcon: DescriptionIcon },
  { to: "/calendar", end: false, label: "Calendar", Icon: CalendarTodayOutlinedIcon, ActiveIcon: CalendarMonthIcon },
  { to: "/support", end: false, label: "Support", Icon: ConfirmationNumberOutlinedIcon, ActiveIcon: ConfirmationNumberIcon },
  { to: "/profile", end: false, label: "Profile", Icon: PersonOutlineOutlinedIcon, ActiveIcon: PersonIcon },
] as const;

export function MobileNav() {
  return (
    <Box
      component="nav"
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        display: { md: "none" },
        bgcolor: "background.paper",
        borderTop: "1px solid",
        borderColor: "hsl(var(--md-outline-variant) / 0.5)",
        pb: "env(safe-area-inset-bottom)",
        /* Subtle elevation - M3 surface tint */
        boxShadow: "0 -1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "stretch",
          justifyContent: "space-around",
          height: 64,
        }}
      >
        {NAV_ITEMS.map(({ to, end, label, Icon, ActiveIcon }) => (
          <NavLink key={to} to={to} end={end || undefined} style={{ textDecoration: "none", flex: 1, display: "flex" }}>
            {({ isActive }) => (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  flex: 1,
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                  userSelect: "none",
                  /* Press state only on pill, not whole button */
                  "&:active .nav-indicator": {
                    transform: "scaleX(0.92)",
                    bgcolor: "hsl(var(--md-primary) / 0.12)",
                  },
                }}
              >
                {/* ── M3 Active indicator pill ── */}
                <Box
                  className="nav-indicator"
                  sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: isActive ? 56 : 56,
                    height: 28,
                    borderRadius: "9999px",
                    transition: "background-color 0.2s cubic-bezier(0.2, 0, 0, 1), transform 0.1s ease",
                    bgcolor: isActive
                      ? "hsl(var(--md-primary) / 0.12)"
                      : "transparent",
                  }}
                >
                  {isActive
                    ? <ActiveIcon sx={{ fontSize: 22, color: "hsl(var(--md-primary))" }} />
                    : <Icon sx={{ fontSize: 22, color: "hsl(var(--md-on-surface-variant))" }} />
                  }
                </Box>

                {/* ── Label ── */}
                <Box
                  component="span"
                  sx={{
                    fontSize: "0.7rem",
                    lineHeight: 1,
                    fontWeight: isActive ? 600 : 400,
                    letterSpacing: isActive ? "0.01em" : "0.02em",
                    color: isActive
                      ? "hsl(var(--md-primary))"
                      : "hsl(var(--md-on-surface-variant))",
                    transition: "color 0.2s, font-weight 0.2s",
                  }}
                >
                  {label}
                </Box>
              </Box>
            )}
          </NavLink>
        ))}
      </Box>
    </Box>
  );
}
