import { useState } from "react";
import { NavLink } from "react-router-dom";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useAppSelector, useAppDispatch } from "@/store";
import { setIsNavCollapsed } from "@/store/slices/uiSlice";

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
          borderRadius: "16px",
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
        borderRadius: "28px",
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
  const isNavCollapsed = useAppSelector((s) => s.ui.isNavCollapsed);
  const [isHovered, setIsHovered] = useState(false);
  const sidebarWidth = isNavCollapsed ? 80 : 256;

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
        }}
      >
        {/* Home */}
        <NavLink to="/" end style={{ textDecoration: "none" }}>
          {({ isActive }) =>
            isNavCollapsed ? (
              <Tooltip title="Home" placement="right" arrow>
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

        {/* Courses */}
        <NavLink to="/courses" style={{ textDecoration: "none" }}>
          {({ isActive }) =>
            isNavCollapsed ? (
              <Tooltip title="Courses" placement="right" arrow>
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

        {/* Profile */}
        <NavLink to="/profile" style={{ textDecoration: "none" }}>
          {({ isActive }) =>
            isNavCollapsed ? (
              <Tooltip title="Profile" placement="right" arrow>
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

        {/* Payments */}
        <NavLink to="/payments" style={{ textDecoration: "none" }}>
          {({ isActive }) =>
            isNavCollapsed ? (
              <Tooltip title="Payments" placement="right" arrow>
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

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Settings */}
        <NavLink
          to="/preferences"
          style={{ textDecoration: "none", marginBottom: 24 }}
        >
          {({ isActive }) =>
            isNavCollapsed ? (
              <Tooltip title="Settings" placement="right" arrow>
                <span>
                  <NavItemCollapsed
                    icon={<SettingsOutlinedIcon fontSize="small" />}
                    label="Settings"
                    isActive={isActive}
                  />
                </span>
              </Tooltip>
            ) : (
              <NavItemExpanded
                icon={<SettingsOutlinedIcon fontSize="small" />}
                label="Settings"
                isActive={isActive}
              />
            )
          }
        </NavLink>
      </Box>
    </Box>
  );
}
