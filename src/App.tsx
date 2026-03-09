import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import DashboardPage from "@/pages/Dashboard";
import CoursesPage from "@/pages/Courses";
import CalendarPage from "@/pages/Calendar";
import AvailabilityPage from "@/pages/Availability";
import NotificationsPage from "@/pages/Notifications";
import ProfilePage from "@/pages/Profile";
import PreferencesPage from "@/pages/Preferences";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/availability" element={<AvailabilityPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/preferences" element={<PreferencesPage />} />
      </Route>
    </Routes>
  );
}
