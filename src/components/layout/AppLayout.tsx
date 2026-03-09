import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { ToastViewport } from "@/components/shared/ToastViewport";
import { GlobalDialogs } from "@/components/dialogs";
import { useAppSelector, useAppDispatch } from "@/store";
import { setIsDarkMode } from "@/store/slices/uiSlice";
import { classNames } from "@/lib/helpers";

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
    <div
      className={classNames(
        "grid grid-cols-1 transition-all duration-200",
        isNavCollapsed ? "md:grid-cols-[84px_1fr]" : "md:grid-cols-[260px_1fr]"
      )}
    >
      <Sidebar />
      <main className="p-4 pb-[calc(6rem+env(safe-area-inset-bottom))] md:p-6">
        <div className="mx-auto max-w-6xl space-y-5">
          <Outlet />
        </div>
      </main>
      <MobileNav />
      <ToastViewport />
      <GlobalDialogs />
    </div>
  );
}
