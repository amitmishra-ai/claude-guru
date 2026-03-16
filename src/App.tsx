import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";

const DashboardPage = lazy(() => import("@/pages/Dashboard"));
const CoursesPage = lazy(() => import("@/pages/Courses"));
const CalendarPage = lazy(() => import("@/pages/Calendar"));
const AvailabilityPage = lazy(() => import("@/pages/Availability"));
const NotificationsPage = lazy(() => import("@/pages/Notifications"));
const PaymentsPage = lazy(() => import("@/pages/Payments"));
const ProfilePage = lazy(() => import("@/pages/Profile"));
const PreferencesPage = lazy(() => import("@/pages/Preferences"));

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Suspense><DashboardPage /></Suspense>} />
        <Route path="/courses" element={<Suspense><CoursesPage /></Suspense>} />
        <Route path="/calendar" element={<Suspense><CalendarPage /></Suspense>} />
        <Route path="/availability" element={<Suspense><AvailabilityPage /></Suspense>} />
        <Route path="/notifications" element={<Suspense><NotificationsPage /></Suspense>} />
        <Route path="/payments" element={<Suspense><PaymentsPage /></Suspense>} />
        <Route path="/profile" element={<Suspense><ProfilePage /></Suspense>} />
        <Route path="/preferences" element={<Suspense><PreferencesPage /></Suspense>} />
      </Route>
    </Routes>
  );
}
