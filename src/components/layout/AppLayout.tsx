import { useEffect, useRef, lazy, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Slide from "@mui/material/Slide";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { MobileAppBar } from "./MobileAppBar";
import { ToastViewport } from "@/components/shared/ToastViewport";
import { GlobalDialogs } from "@/components/dialogs";
import { DevPanel } from "@/components/dev/DevPanel";
import { RoleSwitchOverlay } from "@/components/shared/RoleSwitchOverlay";
import { useAppSelector, useAppDispatch } from "@/store";
import { setIsDarkMode } from "@/store/slices/uiSlice";

const OnboardingPage = lazy(() => import("@/pages/Onboarding"));

export function AppLayout() {
  const dispatch = useAppDispatch();
  const isNavCollapsed = useAppSelector((s) => s.ui.isNavCollapsed);
  const isDarkMode = useAppSelector((s) => s.ui.isDarkMode);
  const themeMode = useAppSelector((s) => s.ui.themeMode);
  const guruStage = useAppSelector((s) => s.devPanel.guruStage);

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const isOnboarding = guruStage === "onboarding";
  const location = useLocation();
  /** Pages that open as full-screen on mobile (no bottom nav, no top bar) */
  const mobileFullScreenPages = ["/account", "/payments", "/preferences"];
  const isAccountPage = mobileFullScreenPages.includes(location.pathname);

  // Track previous path to animate slide transitions on mobile
  const prevPathRef = useRef(location.pathname);
  const wasFullScreen = mobileFullScreenPages.includes(prevPathRef.current);
  useEffect(() => { prevPathRef.current = location.pathname; }, [location.pathname]);

  // Resolve themeMode → isDarkMode and persist to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("guru-theme", themeMode);

    if (themeMode === "dark") {
      dispatch(setIsDarkMode(true));
    } else if (themeMode === "light") {
      dispatch(setIsDarkMode(false));
    } else {
      // system
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      dispatch(setIsDarkMode(mq.matches));
      const handler = (e: MediaQueryListEvent) => dispatch(setIsDarkMode(e.matches));
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [themeMode, dispatch]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", isDarkMode);
    // Update PWA status bar / theme-color meta tags
    const color = isDarkMode ? "#121212" : "#ffffff";
    document.querySelectorAll('meta[name="theme-color"]').forEach((el) => {
      el.setAttribute("content", color);
    });
  }, [isDarkMode]);

  if (isOnboarding) {
    return (
      <Suspense>
        <OnboardingPage />
      </Suspense>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "minmax(0, 1fr)", md: isNavCollapsed ? "80px minmax(0, 1fr)" : "256px minmax(0, 1fr)" },
        transition: "grid-template-columns 0.2s",
        height: { xs: "auto", md: "100vh" },
        minHeight: { xs: "100vh", md: "auto" },
      }}
    >
      <Sidebar />
      <Box
        component="main"
        sx={{
          minWidth: 0,
          overflowY: { xs: "visible", md: "auto" },
          overflowX: "clip",
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
          scrollbarWidth: { xs: "none", md: "thin" },
          "&::-webkit-scrollbar": { display: { xs: "none", md: "block" } },
          px: { xs: 2, sm: 2, md: 3 },
          pt: { xs: isAccountPage ? "env(safe-area-inset-top)" : "calc(56px + 12px + env(safe-area-inset-top))", md: 3 },
          pb: { xs: isAccountPage ? "env(safe-area-inset-bottom)" : "calc(5rem + env(safe-area-inset-bottom))", md: 3 },
          // On mobile, when a full-screen page is active, render as a fixed overlay
          ...(isMobile && isAccountPage && {
            position: "fixed", inset: 0, zIndex: 1200,
            bgcolor: "background.default",
            overflowY: "auto",
          }),
          // Slide-in animation on mobile full-screen pages
          ...(isMobile && isAccountPage && {
            animation: "mobilePageSlideIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            "@keyframes mobilePageSlideIn": {
              "0%": { transform: "translateX(100%)" },
              "100%": { transform: "translateX(0)" },
            },
          }),
        }}
      >
        <Box sx={{ mx: "auto", maxWidth: "72rem", display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Outlet />
        </Box>
      </Box>
      {!isAccountPage && <MobileAppBar />}
      {!isAccountPage && <MobileNav />}
      <ToastViewport />
      <GlobalDialogs />
      <DevPanel />
      <RoleSwitchOverlay />
    </Box>
  );
}
