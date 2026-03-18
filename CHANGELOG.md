# Changelog

All notable changes to the Guru Dashboard are documented here.

---

## 2026-03-18

### Home Page
- **Add Planned Events section** — New "Planned Events (subject to change)" section inside the Upcoming tab on the Home page. Shows date range, session type, batch, contact email, and "To be confirmed" status. Disappears when switching to Completed or Declined tabs. Added `PlannedEvent` type and demo data.

### Components Page (Dev Mode)
- **Add Components page** — New `/components` route accessible from the Dev Panel. Entry point added under "Dev Tools" section.
- **Persona-based card variants** — Components page now reacts to the selected Guru Role from the Dev Panel. Each role shows its relevant activity types with Confirmed, Tentative, Scheduled, and Completed card states:
  - **Teacher**: Residency + Online Session
  - **Course Mentor**: Online Session + Residency
  - **Career Mentor**: Career/Mock Interview Sessions + CV Review
  - **CV Review Mentor**: CV Review
  - **Evaluator**: Evaluation (Assignment) with star-icons-only rating
  - **Moderator**: Moderation (Discussion Question) with star-icons-only rating
  - **Project Mentor**: Capstone Project with milestone dates
  - **Industry Expert**: Online Session

---

## 2026-03-17

### Course Page
- **Fix course card thumbnails** — Added missing `color` and `pattern` fields to all 33 entries in `demoCourseCatalog` (`src/data/demo-sessions.ts`). Cards were rendering as plain blue without patterns; now each course has a unique color and SVG pattern overlay.

### Session Cards
- **Reduce title font size** — Lowered `SessionCard` title font to `1rem/1.125rem` (h5) and `0.95rem` (h6) so it fits the overall page scale (`src/components/shared/SessionCard.tsx`).

### Dashboard Home — Tasks Sidebar
- **Move chips inline with title** — "Configured" / "Action needed" chips now sit to the right of each task card title instead of above it (`src/pages/Dashboard/index.tsx` — `TaskCard`).
- **Availability accordion** — When the user has configured availability, the summary renders inside a collapsed `Accordion`; expands on click. Unconfigured state still shows the regular task card with "Needs update" chip.
- **Rename confirm sessions task** — Title changed from "Confirm sessions by Wednesday" to "Confirm upcoming sessions". Wednesday deadline moved to the description line.

### Dashboard Home — UX Simplification
- **Next Session pulled out above tabs** — Standalone "Next Session" section with 1 hero card (blue left border) now sits above the Sessions card. Shows "Join session" + "View details" only.
- **Flat Upcoming tab** — Removed the nested "Up next" `Paper` wrapper and overline labels. Upcoming tab now has two flat sections: **Scheduled** (with count chip) and **Confirmed** (with count chip), separated by a divider.
- **Hero session de-duplicated** — The next session is filtered out of the Scheduled list so it doesn't appear twice.
- **Reduced hero actions** — Removed "Session Materials" and "Create poll" buttons from the hero card (moved to detail view). Only 2 actions remain.
- **Cleaned unused imports** — Removed `MenuBookOutlinedIcon`, `setOpenPollBuilder`, `setPollSessionId`, `setPollEditingId`, `setPollQuestion`, `setPollOptions`, `removePoll` from Dashboard imports.

### Navigation
- **Sidebar collapsed by default** — Left nav now starts in collapsed (icon-only, 80px) state (`src/store/slices/uiSlice.ts` — `isNavCollapsed: true`). Users can expand via the hamburger icon.
- **Replaced Alerts with Payments in sidebar** — Removed the "Alerts" nav item (with notification badge) and added "Payments" with wallet icon (`src/components/layout/Sidebar.tsx`). Cleaned up `Badge`, `NotificationsOutlinedIcon`, and `unreadCount` from sidebar.

### Payments Page (new)
- **Created `src/pages/Payments/index.tsx`** — New dedicated Payments page with Earnings overview (total, avg/month, best month, MoM trend, bar chart) and Payment details table (session, type, duration, amount, status, transaction ID, invoice).
- **Route added** — `/payments` route registered in `src/App.tsx`.

### Profile Page
- **Removed Earnings & Payments sections** — Earnings bar chart, KPI row, and payments table moved to the new Payments page. Profile now focuses on identity + performance only. Cleaned up unused imports (`BarChart`, `Bar`, `BarChartOutlinedIcon`, `AccountBalanceWalletOutlinedIcon`, `CreditCardOutlinedIcon`, `DescriptionOutlinedIcon`, `demoMonthlyEarnings`).

### Settings Page (renamed from Preferences)
- **Renamed "Preferences" → "Settings"** — Nav label changed from "Prefs" to "Settings" in sidebar (`src/components/layout/Sidebar.tsx`). Page title updated to "Settings" (`src/pages/Preferences/index.tsx`).
- **Dark mode toggle moved from sidebar to Settings** — Removed the dark/light mode toggle from the bottom of the left nav. Added it under a new **Appearance** section in Settings with a switch and icon.
- **Communication section** — Existing notification/email preferences now grouped under a **Communication** heading, visually separated from Appearance. Both sections use Card wrappers for cleaner structure.
- **Sidebar header icon swap on hover** — The hamburger menu button now shows the Great Learning "G" logo by default (collapsed only). On sidebar hover, it crossfades to the hamburger menu icon (ChatGPT-style interaction). Expanded mode always shows the hamburger since the GL logo is already visible.
- **Nav items: primary active state + ripple** — Active nav items now use a primary-tinted background (`--md-primary-container`) with `--md-on-primary-container` text/icon color. Both collapsed pill and expanded row use MUI `ButtonBase` for proper press ripple and hover feedback. Added `--md-primary-container` / `--md-on-primary-container` CSS tokens for both light and dark themes (`src/index.css`).

### Dashboard Home — Section Titles
- **Smaller font + icons for section titles** — "Next Session", "Sessions", and "Tasks" titles reduced from `h6` to `subtitle1` at `0.9rem`. Each now has an icon: `PlayCircleOutlined` (Next Session), `ViewListOutlined` (Sessions), `AssignmentOutlined` (Tasks) in `text.secondary` color.

### Dashboard Home — Next Session Card
- **Session Materials button restored** — Re-added "Session Materials" outlined button (with `MenuBookOutlinedIcon`) to the Next Session hero card actions, between "Join session" and "View details" (`src/pages/Dashboard/index.tsx`).

### Session Details Modal
- **Create New Poll button for confirmed sessions** — Added "Create New Poll" outlined button (with `PollOutlinedIcon`) to `SessionDetailsModal` dialog actions. Only visible for confirmed, non-completed sessions. Opens the Poll Builder dialog with a fresh form pre-linked to the session (`src/components/dialogs/SessionDetailsModal.tsx`).
