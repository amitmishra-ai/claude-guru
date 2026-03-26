import { useEffect, lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
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

  const isOnboarding = guruStage === "onboarding";

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
      }}
    >
      <Sidebar />
      <Box
        component="main"
        sx={{
          minWidth: 0,
          overflowX: "clip",
          p: { xs: 1.5, sm: 2, md: 3 },
          pt: { xs: "calc(56px + 12px + env(safe-area-inset-top))", md: 3 },
          pb: { xs: "calc(5rem + env(safe-area-inset-bottom))", md: 3 },
        }}
      >
        <Box sx={{ mx: "auto", maxWidth: "72rem", display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Outlet />
        </Box>
      </Box>
      <MobileAppBar />
      <MobileNav />
      <ToastViewport />
      <GlobalDialogs />
      <DevPanel />
      <RoleSwitchOverlay />
    </Box>
  );
}
