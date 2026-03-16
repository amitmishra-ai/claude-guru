import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { MobileAppBar } from "./MobileAppBar";
import { ToastViewport } from "@/components/shared/ToastViewport";
import { GlobalDialogs } from "@/components/dialogs";
import { useAppSelector, useAppDispatch } from "@/store";
import { setIsDarkMode } from "@/store/slices/uiSlice";

export function AppLayout() {
  const dispatch = useAppDispatch();
  const isNavCollapsed = useAppSelector((s) => s.ui.isNavCollapsed);
  const isDarkMode = useAppSelector((s) => s.ui.isDarkMode);

  // Sync dark mode with <html> class + localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("guru-theme");
    if (saved === "dark") {
      dispatch(setIsDarkMode(true));
      return;
    }
    if (saved === "light") {
      dispatch(setIsDarkMode(false));
      return;
    }
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    dispatch(setIsDarkMode(Boolean(prefersDark)));
  }, [dispatch]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", isDarkMode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("guru-theme", isDarkMode ? "dark" : "light");
    }
  }, [isDarkMode]);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "minmax(0, 1fr)", md: isNavCollapsed ? "84px minmax(0, 1fr)" : "260px minmax(0, 1fr)" },
        transition: "grid-template-columns 0.2s",
      }}
    >
      <Sidebar />
      <Box
        component="main"
        sx={{
          minWidth: 0,
          overflow: "hidden",
          p: { xs: 2, md: 3 },
          pt: { xs: "calc(56px + 16px + env(safe-area-inset-top))", md: 3 },
          pb: { xs: "calc(6rem + env(safe-area-inset-bottom))", md: 3 },
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
    </Box>
  );
}
