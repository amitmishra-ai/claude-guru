import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useAppSelector, useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/toastsSlice";
import { setIsDarkMode } from "@/store/slices/uiSlice";

/**
 * Mobile Account page — Material 3 native Android approach.
 * Full-screen page with top app bar, profile hero, and grouped menu sections.
 * No bottom nav, no top bar — immersive like Groww / Google Wallet account screens.
 */

type MenuItem = {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onClick: () => void;
  danger?: boolean;
};

export default function AccountPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const guruName = useAppSelector((s) => s.profile.guruName);
  const guruPrograms = useAppSelector((s) => s.profile.guruPrograms);
  const isDarkMode = useAppSelector((s) => s.ui.isDarkMode);

  const initials = guruName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const email = `${guruName.toLowerCase().replace(/\s+/g, ".")}@greatlearning.in`;

  /* ── Menu sections ── */
  const activitySection: MenuItem[] = [
    { icon: <AccountBalanceWalletOutlinedIcon />, label: "Payments", sublabel: "Earnings & transactions", onClick: () => navigate("/payments") },
  ];

  const accountSection: MenuItem[] = [
    { icon: <SettingsOutlinedIcon />, label: "Settings", sublabel: "Notifications & preferences", onClick: () => navigate("/preferences") },
    { icon: isDarkMode ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />, label: isDarkMode ? "Light Mode" : "Dark Mode", onClick: () => dispatch(setIsDarkMode(!isDarkMode)) },
    { icon: <SwapHorizOutlinedIcon />, label: "Switch to Learner", sublabel: "Open learner dashboard", onClick: () => dispatch(pushToast({ title: "Switching", description: "Redirecting to Learner Dashboard..." })) },
    { icon: <PersonAddAltOutlinedIcon />, label: "Refer a Guru", onClick: () => dispatch(pushToast({ title: "Referral", description: "Opening referral link..." })) },
  ];

  const dangerSection: MenuItem[] = [
    { icon: <LogoutOutlinedIcon />, label: "Sign out", onClick: () => dispatch(pushToast({ title: "Signed out", description: "You have been signed out." })), danger: true },
  ];

  /* ── Grouped card renderer ── */
  const MenuCard = ({ items }: { items: MenuItem[] }) => (
    <Box
      sx={{
        mb: 1.5,
        borderRadius: "12px",
        bgcolor: "hsl(var(--md-surface-container-low, var(--md-surface)) / 1)",
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      {items.map((item, i) => (
        <Box
          key={i}
          onClick={item.onClick}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2,
            py: 1.75,
            cursor: "pointer",
            transition: "background-color 0.12s",
            "&:active": { bgcolor: "action.selected" },
            ...(i > 0 && { borderTop: "1px solid", borderColor: "divider" }),
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              bgcolor: item.danger
                ? "hsl(0 72% 51% / 0.08)"
                : "hsl(var(--md-primary) / 0.08)",
              color: item.danger ? "error.main" : "primary.main",
              "& .MuiSvgIcon-root": { fontSize: 20 },
            }}
          >
            {item.icon}
          </Box>

          {/* Text */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                fontSize: "0.9rem",
                color: item.danger ? "error.main" : "text.primary",
                lineHeight: 1.3,
              }}
            >
              {item.label}
            </Typography>
            {item.sublabel && (
              <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.2 }}>
                {item.sublabel}
              </Typography>
            )}
          </Box>

          {/* Chevron */}
          {!item.danger && (
            <ChevronRightIcon sx={{ fontSize: 20, color: "text.disabled", flexShrink: 0 }} />
          )}
        </Box>
      ))}
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>

      {/* ═══ M3 Small Top App Bar — full bleed ═══ */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          height: 64,
          pl: 0.5,
          pr: 2,
          mx: -2,
          width: "calc(100% + 32px)",
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          aria-label="Navigate back"
          sx={{ width: 48, height: 48, color: "text.primary", "&:active": { bgcolor: "action.pressed" } }}
        >
          <ArrowBackIcon sx={{ fontSize: 24 }} />
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            ml: 0.5,
            fontWeight: 500,
            fontSize: "1.125rem",
            lineHeight: 1.3,
            letterSpacing: "0.01em",
            color: "text.primary",
          }}
        >
          Account
        </Typography>
      </Box>

      {/* ═══ Profile Hero ═══ */}
      <Box
        onClick={() => navigate("/profile")}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: 1,
          pb: 3,
          cursor: "pointer",
        }}
      >
        <Avatar
          sx={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            fontSize: "1.5rem",
            fontWeight: 700,
            bgcolor: "primary.main",
            color: "#fff",
            mb: 1.5,
            boxShadow: "0 4px 16px rgba(25,106,229,0.2)",
          }}
        >
          {initials}
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem", lineHeight: 1.2 }}>
          {guruName}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.25 }}>
          {email}
        </Typography>
        <Box
          sx={{
            mt: 1,
            px: 1.5,
            py: 0.375,
            borderRadius: "12px",
            bgcolor: "hsl(var(--md-primary) / 0.08)",
            color: "primary.main",
          }}
        >
          <Typography variant="caption" fontWeight={600} sx={{ fontSize: "0.7rem", letterSpacing: "0.02em" }}>
            {guruPrograms} &middot; View Profile
          </Typography>
        </Box>
      </Box>

      {/* ═══ Menu Sections ═══ */}

      {/* Section label */}
      <Typography variant="caption" sx={{ mb: 0.75, display: "block", fontWeight: 600, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.65rem" }}>
        Activity
      </Typography>
      <MenuCard items={activitySection} />

      <Typography variant="caption" sx={{ mb: 0.75, mt: 1, display: "block", fontWeight: 600, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.65rem" }}>
        Account
      </Typography>
      <MenuCard items={accountSection} />

      <Box sx={{ mt: 1 }}>
        <MenuCard items={dangerSection} />
      </Box>

      {/* ═══ Footer — version ═══ */}
      <Typography
        variant="caption"
        sx={{
          display: "block",
          textAlign: "center",
          color: "text.disabled",
          mt: 3,
          pb: 2,
          fontSize: "0.65rem",
        }}
      >
        Guru Dashboard v2.0
      </Typography>
    </Box>
  );
}
