import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useAppSelector, useAppDispatch } from "@/store";
import { setIsNavCollapsed } from "@/store/slices/uiSlice";
import { pushToast } from "@/store/slices/toastsSlice";

// ── Collapsed: pill is 56×32, icon centred. Label sits below.
// ── Expanded: pill is full-width row, borderRadius 28px, icon + label.

function GLLogo({ size = 32 }: { size?: number }) {
  const isDark = useAppSelector((s) => s.ui.isDarkMode);
  const primary = isDark ? "#FFFFFF" : "#0E39A9";
  const accent = isDark ? "#FFFFFF" : "#1974D2";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Great Learning"
    >
      <path
        d="M19.9338 30.4595L20.0177 30.3608L23.4279 26.2037H18.8904C13.201 26.2037 8.57217 21.6262 8.57217 15.9998C8.57217 10.3731 13.201 5.79565 18.8904 5.79565H24.1907L27.7173 1.54004H18.8904C10.8277 1.54004 4.26855 8.02664 4.26855 15.9998C4.26855 23.9729 10.8277 30.4595 18.8904 30.4595H19.9338Z"
        fill={primary}
      />
      <path
        d="M4.26855 15.9998C4.26855 19.6784 5.66696 23.0386 7.96278 25.5933L10.726 22.2286C9.37739 20.5039 8.57193 18.3438 8.57193 15.9998C8.57193 10.3733 13.201 5.79588 18.8904 5.79588H24.2224L27.7173 1.54004H18.8904C10.8277 1.54004 4.26855 8.02664 4.26855 15.9998Z"
        fill={accent}
      />
      <path
        d="M23.4277 26.2038L27.7311 20.9576V13.7129H18.5888L15.1025 17.9687H23.4277V26.2038Z"
        fill={primary}
      />
    </svg>
  );
}

interface NavItemCollapsedProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function NavItemCollapsed({ icon, label, isActive }: NavItemCollapsedProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        gap: 0.5,
        py: 0.75,
        color: isActive
          ? "hsl(var(--md-on-primary-container))"
          : "hsl(var(--md-on-surface-variant))",
      }}
    >
      {/* Pill indicator with ripple */}
      <ButtonBase
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 56,
          height: 32,
          borderRadius: "9999px",
          backgroundColor: isActive
            ? "hsl(var(--md-primary-container))"
            : "transparent",
          color: "inherit",
          transition: "background-color 0.15s",
          "&:hover": {
            backgroundColor: isActive
              ? "hsl(var(--md-primary-container))"
              : "hsl(var(--md-surface-container) / 0.3)",
          },
        }}
      >
        {icon}
      </ButtonBase>
      {/* Label below pill */}
      <Typography
        variant="caption"
        sx={{
          fontSize: "0.6875rem",
          lineHeight: 1.2,
          fontWeight: isActive ? 700 : 400,
          color: "inherit",
          textAlign: "center",
          userSelect: "none",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

interface NavItemExpandedProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function NavItemExpanded({ icon, label, isActive }: NavItemExpandedProps) {
  return (
    <ButtonBase
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        width: "100%",
        px: 2,
        height: 48,
        borderRadius: "9999px",
        backgroundColor: isActive
          ? "hsl(var(--md-primary-container))"
          : "transparent",
        color: isActive
          ? "hsl(var(--md-on-primary-container))"
          : "hsl(var(--md-on-surface-variant))",
        transition: "background-color 0.15s",
        "&:hover": {
          backgroundColor: isActive
            ? "hsl(var(--md-primary-container))"
            : "hsl(var(--md-surface-container) / 0.3)",
        },
      }}
    >
      {icon}
      <Typography
        variant="body2"
        sx={{
          fontWeight: isActive ? 700 : 400,
          color: "inherit",
          userSelect: "none",
          flex: 1,
          textAlign: "left",
        }}
      >
        {label}
      </Typography>
    </ButtonBase>
  );
}

export function Sidebar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isNavCollapsed = useAppSelector((s) => s.ui.isNavCollapsed);
  const guruName = useAppSelector((s) => s.profile.guruName);
  const [isHovered, setIsHovered] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const sidebarWidth = isNavCollapsed ? 80 : 256;

  const initials = guruName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleMenuClose = () => setMenuAnchor(null);

  return (
    <Box
      component="aside"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        width: sidebarWidth,
        minWidth: sidebarWidth,
        borderRight: 1,
        borderColor: "divider",
        backgroundColor: "hsl(var(--md-surface))",
        position: "sticky",
        top: 0,
        height: "100vh",
        transition: "width 0.2s ease, min-width 0.2s ease",
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: isNavCollapsed ? 0 : 1.5,
          px: isNavCollapsed ? 0 : 2,
          height: 64,
          justifyContent: isNavCollapsed ? "center" : "flex-start",
          flexShrink: 0,
        }}
      >
        <IconButton
          onClick={() => dispatch(setIsNavCollapsed(!isNavCollapsed))}
          aria-label={isNavCollapsed ? "Expand navigation" : "Collapse navigation"}
          size="small"
          sx={{
            color: "hsl(var(--md-on-surface-variant))",
            position: "relative",
            width: 34,
            height: 34,
          }}
        >
          {isNavCollapsed ? (
            <>
              {/* GL logo — visible by default, fades out on sidebar hover */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "opacity 0.2s ease",
                  opacity: isHovered ? 0 : 1,
                }}
              >
                <GLLogo size={28} />
              </Box>
              {/* Hamburger — hidden by default, fades in on sidebar hover */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "opacity 0.2s ease",
                  opacity: isHovered ? 1 : 0,
                }}
              >
                <MenuOutlinedIcon fontSize="small" />
              </Box>
            </>
          ) : (
            <MenuOutlinedIcon fontSize="small" />
          )}
        </IconButton>

        {!isNavCollapsed && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              overflow: "hidden",
            }}
          >
            <GLLogo />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: "hsl(var(--md-on-surface))",
              }}
            >
              Guru Dashboard
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Primary nav ── */}
      <Box
        component="nav"
        aria-label="Primary navigation"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          px: isNavCollapsed ? 0.5 : 1,
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: isNavCollapsed ? "none" : "thin",
          "&::-webkit-scrollbar": isNavCollapsed ? { display: "none" } : {},
        }}
      >
        {/* Home */}
        <NavLink to="/" end style={{ textDecoration: "none" }}>
          {({ isActive }) =>
            isNavCollapsed ? (
              <Tooltip title="Home" placement="right">
                <span>
                  <NavItemCollapsed
                    icon={<HomeOutlinedIcon fontSize="small" />}
                    label="Home"
                    isActive={isActive}
                  />
                </span>
              </Tooltip>
            ) : (
              <NavItemExpanded
                icon={<HomeOutlinedIcon fontSize="small" />}
                label="Home"
                isActive={isActive}
              />
            )
          }
        </NavLink>

        {/* Calendar */}
        <NavLink to="/calendar" style={{ textDecoration: "none" }}>
          {({ isActive }) =>
            isNavCollapsed ? (
              <Tooltip title="Calendar" placement="right">
                <span>
                  <NavItemCollapsed
                    icon={<CalendarMonthOutlinedIcon fontSize="small" />}
                    label="Calendar"
                    isActive={isActive}
                  />
                </span>
              </Tooltip>
            ) : (
              <NavItemExpanded
                icon={<CalendarMonthOutlinedIcon fontSize="small" />}
                label="Calendar"
                isActive={isActive}
              />
            )
          }
        </NavLink>

        {/* Courses */}
        <NavLink to="/courses" style={{ textDecoration: "none" }}>
          {({ isActive }) =>
            isNavCollapsed ? (
              <Tooltip title="Courses" placement="right">
                <span>
                  <NavItemCollapsed
                    icon={<DescriptionOutlinedIcon fontSize="small" />}
                    label="Courses"
                    isActive={isActive}
                  />
                </span>
              </Tooltip>
            ) : (
              <NavItemExpanded
                icon={<DescriptionOutlinedIcon fontSize="small" />}
                label="Courses"
                isActive={isActive}
              />
            )
          }
        </NavLink>

        {/* Payments */}
        <NavLink to="/payments" style={{ textDecoration: "none" }}>
          {({ isActive }) =>
            isNavCollapsed ? (
              <Tooltip title="Payments" placement="right">
                <span>
                  <NavItemCollapsed
                    icon={<AccountBalanceWalletOutlinedIcon fontSize="small" />}
                    label="Payments"
                    isActive={isActive}
                  />
                </span>
              </Tooltip>
            ) : (
              <NavItemExpanded
                icon={<AccountBalanceWalletOutlinedIcon fontSize="small" />}
                label="Payments"
                isActive={isActive}
              />
            )
          }
        </NavLink>

        {/* Profile */}
        <NavLink to="/profile" style={{ textDecoration: "none" }}>
          {({ isActive }) =>
            isNavCollapsed ? (
              <Tooltip title="Profile" placement="right">
                <span>
                  <NavItemCollapsed
                    icon={<GroupOutlinedIcon fontSize="small" />}
                    label="Profile"
                    isActive={isActive}
                  />
                </span>
              </Tooltip>
            ) : (
              <NavItemExpanded
                icon={<GroupOutlinedIcon fontSize="small" />}
                label="Profile"
                isActive={isActive}
              />
            )
          }
        </NavLink>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Support */}
        <NavLink to="/support" style={{ textDecoration: "none" }}>
          {({ isActive }) =>
            isNavCollapsed ? (
              <Tooltip title="Support" placement="right">
                <span>
                  <NavItemCollapsed
                    icon={<ConfirmationNumberOutlinedIcon fontSize="small" />}
                    label="Support"
                    isActive={isActive}
                  />
                </span>
              </Tooltip>
            ) : (
              <NavItemExpanded
                icon={<ConfirmationNumberOutlinedIcon fontSize="small" />}
                label="Support"
                isActive={isActive}
              />
            )
          }
        </NavLink>

        {/* ── User profile button ── */}
        <Box sx={{ mt: 1.5, mb: 3 }}>
          {isNavCollapsed ? (
            <Tooltip title={guruName} placement="right">
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <ButtonBase
                  onClick={(e) => setMenuAnchor(e.currentTarget)}
                  sx={{ borderRadius: "50%", p: 0.5 }}
                >
                  <Avatar variant="circular" sx={{ width: 32, height: 32, fontSize: "0.75rem", fontWeight: 700, bgcolor: "primary.main", borderRadius: "50%" }}>
                    {initials}
                  </Avatar>
                </ButtonBase>
              </Box>
            </Tooltip>
          ) : (
            <ButtonBase
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                width: "100%",
                px: 2,
                py: 1,
                borderRadius: "9999px",
                transition: "background-color 0.15s",
                "&:hover": { backgroundColor: "hsl(var(--md-surface-container) / 0.3)" },
              }}
            >
              <Avatar variant="circular" sx={{ width: 32, height: 32, fontSize: "0.75rem", fontWeight: 700, bgcolor: "primary.main", borderRadius: "50%" }}>
                {initials}
              </Avatar>
              <Box sx={{ flex: 1, textAlign: "left", overflow: "hidden" }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "hsl(var(--md-on-surface))", lineHeight: 1.3 }} noWrap>
                  {guruName}
                </Typography>
                <Typography variant="caption" sx={{ color: "hsl(var(--md-on-surface-variant))", fontSize: "0.65rem" }} noWrap>
                  {guruName.toLowerCase().replace(/\s+/g, ".")}@greatlearning.in
                </Typography>
              </Box>
            </ButtonBase>
          )}
        </Box>
      </Box>

      {/* ── User menu popover ── */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "top", horizontal: isNavCollapsed ? "right" : "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: isNavCollapsed ? "left" : "center" }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 240,
              borderRadius: "4px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
              mt: -1,
            },
          },
        }}
      >
        {/* User info header */}
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
    </Box>
  );
}
