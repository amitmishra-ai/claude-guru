import { NavLink } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  House,
  Moon,
  Settings,
  Sun,
  Users,
} from "lucide-react";
import IconButton from "@mui/material/IconButton";
import { useAppSelector, useAppDispatch } from "@/store";
import { setIsNavCollapsed, setIsDarkMode } from "@/store/slices/uiSlice";
import { classNames } from "@/lib/helpers";

const navItemBase =
  "w-full rounded-nav py-2 text-sm border border-transparent hover:bg-surface-container/30 text-on-surface-variant transition-colors";
const navItemActive =
  "bg-surface-container/40 !text-on-surface border-outline-variant";

export function Sidebar() {
  const dispatch = useAppDispatch();
  const isNavCollapsed = useAppSelector((s) => s.ui.isNavCollapsed);
  const isDarkMode = useAppSelector((s) => s.ui.isDarkMode);
  const unreadCount = useAppSelector((s) =>
    s.notifications.items.filter((n) => !n.read).length
  );

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    classNames(
      navItemBase,
      isActive && navItemActive,
      isNavCollapsed ? "justify-center px-2" : "justify-start gap-3 px-3",
      "flex items-center"
    );

  return (
    <aside className="hidden md:block border-r bg-surface sticky top-0 h-screen">
      <div className="h-full p-4 flex flex-col">
        {/* Sidebar header */}
        <div
          className={classNames(
            "mb-4 flex items-center rounded-nav border bg-surface py-2",
            isNavCollapsed ? "justify-center px-2" : "gap-2 px-3"
          )}
        >
          <div className="grid h-8 w-8 place-items-center" aria-label="Great Learning">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.9338 30.4595L20.0177 30.3608L23.4279 26.2037H18.8904C13.201 26.2037 8.57217 21.6262 8.57217 15.9998C8.57217 10.3731 13.201 5.79565 18.8904 5.79565H24.1907L27.7173 1.54004H18.8904C10.8277 1.54004 4.26855 8.02664 4.26855 15.9998C4.26855 23.9729 10.8277 30.4595 18.8904 30.4595H19.9338Z" fill="#0E39A9" />
              <path d="M4.26855 15.9998C4.26855 19.6784 5.66696 23.0386 7.96278 25.5933L10.726 22.2286C9.37739 20.5039 8.57193 18.3438 8.57193 15.9998C8.57193 10.3733 13.201 5.79588 18.8904 5.79588H24.2224L27.7173 1.54004H18.8904C10.8277 1.54004 4.26855 8.02664 4.26855 15.9998Z" fill="#1974D2" />
              <path d="M23.4277 26.2038L27.7311 20.9576V13.7129H18.5888L15.1025 17.9687H23.4277V26.2038Z" fill="#0E39A9" />
            </svg>
          </div>
          <div className={classNames("min-w-0", isNavCollapsed && "hidden")}>
            <div className="truncate text-sm font-semibold">Guru Dashboard</div>
          </div>
        </div>

        {!isNavCollapsed && (
          <div className="mb-3 px-2 text-xs font-semibold text-on-surface-variant">Navigation</div>
        )}

        <div className="flex-1 min-h-0 flex flex-col">
          {/* Main nav links */}
          <nav className="flex flex-col gap-1" aria-label="Primary navigation">
            <NavLink to="/" end className={linkClass}>
              <House className="h-4 w-4" />
              {!isNavCollapsed && <span>Home</span>}
            </NavLink>

            <NavLink to="/courses" className={linkClass}>
              <FileText className="h-4 w-4" />
              {!isNavCollapsed && <span className="flex-1 text-left">Courses</span>}
            </NavLink>

            <NavLink to="/calendar" className={linkClass}>
              <CalendarDays className="h-4 w-4" />
              {!isNavCollapsed && <span>Calendar</span>}
            </NavLink>

            <NavLink to="/notifications" className={linkClass}>
              {isNavCollapsed ? (
                unreadCount > 0 ? (
                  <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-badge px-1.5 text-[11px] font-semibold text-white tabular-nums">
                    {unreadCount}
                  </span>
                ) : (
                  <Bell className="h-4 w-4 shrink-0" />
                )
              ) : (
                <Bell className="h-4 w-4 shrink-0" />
              )}
              {!isNavCollapsed && <span className="flex-1 text-left">Alerts</span>}
              {!isNavCollapsed && unreadCount > 0 && (
                <span className="shrink-0 ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-badge px-1.5 text-[11px] font-semibold text-white tabular-nums">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          </nav>

          {/* Bottom nav */}
          <div className="mt-auto pt-2">
            <button
              type="button"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
              className={classNames(
                "mb-1 w-full rounded-nav py-2 text-sm border border-transparent hover:bg-surface-container/30",
                isNavCollapsed ? "grid place-items-center px-2" : "flex items-center gap-3 px-3"
              )}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {!isNavCollapsed && <span>{isDarkMode ? "Light mode" : "Dark mode"}</span>}
            </button>

            <NavLink to="/profile" className={linkClass}>
              <Users className="h-4 w-4" />
              {!isNavCollapsed && <span>Profile</span>}
            </NavLink>

            <NavLink to="/preferences" className={linkClass}>
              <Settings className="h-4 w-4" />
              {!isNavCollapsed && <span>Preferences</span>}
            </NavLink>
          </div>
        </div>

        <div className={classNames("mt-3 flex", isNavCollapsed ? "justify-center" : "justify-end")}>
          <IconButton
            onClick={() => dispatch(setIsNavCollapsed(!isNavCollapsed))}
            aria-label={isNavCollapsed ? "Expand navigation panel" : "Collapse navigation panel"}
            sx={{ height: 40, width: 40, border: '1px solid', borderColor: 'divider' }}
          >
            {isNavCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </IconButton>
        </div>
      </div>
    </aside>
  );
}
