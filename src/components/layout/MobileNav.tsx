import { NavLink } from "react-router-dom";
import { Bell, CalendarDays, House, Settings, Users } from "lucide-react";
import { useAppSelector } from "@/store";
import { classNames } from "@/lib/helpers";

const mobileNavItem =
  "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] text-on-surface-variant transition-colors";
const mobileNavActive = "text-on-surface font-medium";

export function MobileNav() {
  const unreadCount = useAppSelector((s) =>
    s.notifications.items.filter((n) => !n.read).length
  );

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    classNames(mobileNavItem, isActive && mobileNavActive);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t bg-surface md:hidden">
      <div className="flex items-center justify-around py-1">
        <NavLink to="/" end className={linkClass}>
          <House className="h-5 w-5" />
          <span>Home</span>
        </NavLink>
        <NavLink to="/calendar" className={linkClass}>
          <CalendarDays className="h-5 w-5" />
          <span>Calendar</span>
        </NavLink>
        <NavLink to="/notifications" className={linkClass}>
          <div className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-badge px-1 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <span>Alerts</span>
        </NavLink>
        <NavLink to="/profile" className={linkClass}>
          <Users className="h-5 w-5" />
          <span>Profile</span>
        </NavLink>
        <NavLink to="/preferences" className={linkClass}>
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </NavLink>
      </div>
    </nav>
  );
}
