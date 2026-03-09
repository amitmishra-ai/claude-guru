# Guru Calendar Prototype Context

## Snapshot
- Project: `guru-calendar-prototype`
- Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Radix-based UI primitives
- Main implementation file: `/Users/snehanjanshome/Documents/guru_calendar_codex_project/app/page.tsx`
- Global styles: `/Users/snehanjanshome/Documents/guru_calendar_codex_project/app/globals.css`
- This is a prototype-style app with local in-file mock data (no API/backend integration yet).

## Core Product Surface
- Tabs: Home, Courses, Calendar, Notifications, Profile, Preferences
- Sidebar + mobile bottom nav
- Dark mode toggle (desktop and mobile), persisted in `localStorage` (`guru-theme`)

## Run/Build
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Start prod build: `npm run start`

## High-Level Architecture
- Single-file stateful page component with:
  - helper/date/time utilities
  - typed mock data models
  - reusable chart and UI subcomponents
  - section-level state and modal state
- UI primitive components live under:
  - `/Users/snehanjanshome/Documents/guru_calendar_codex_project/components/ui/*`

## Key Feature Areas

### Calendar + Availability
- Week and month calendar views
- Time range bounded to 8:00 AM to 8:00 PM
- Leave modal supports:
  - start/end date
  - start/end time
  - reason
- Leave application behavior:
  - marks unavailability across full start→end datetime span
  - auto-declines conflicting scheduled sessions
  - auto-marks conflicting extra session requests unavailable
- Overlap behavior:
  - latest overlapping leave has priority
  - leave cards remain full width
  - declined sessions may overlap leave cards
- Session/request actions update calendar and task states

### Home + Tasks
- Home shows tasks and status pills
- “pending requests” count now combines:
  - unresolved request slots
  - unresolved session decisions (confirm/decline pending)
- Session confirm/unavailable interactions include card transition animations

### Courses
- Program tags: `PGDM`, `AIML`, `PGP-SE`, `Core`
- `New` and program tag placement aligned in card header
- Watch percentage tag supported; `100%` shown in green
- Watch CTA includes play icon
- Mapped session tooltip uses custom styled layout

### Notifications
- Sections: Happening now, Unread, Read
- Category icon in circular badge at left of each notification card
- Dark mode token updates for readability
- Unread cards use reduced dark fill
- Read cards are border-only (no fill)
- CTA actions on right; mark-all-read supported

### Profile
- Details card (basic mentor profile metadata)
- Performance section includes:
  - KPI strip (avg rating, MoM change, rated sessions, coverage, NPS proxy)
  - monthly trend chart with bounded tooltip and trend delta coloring
  - course performance list and compact heatmap matrix
  - full matrix modal (`View full`) with scroll
- Earnings section includes:
  - month-on-month payments chart
  - total earnings in INR
  - KPI chips: average/month, best month, MoM trend

## Charts
- Rating history modal chart component: `RatingTrendChart`
- Profile monthly trend chart: `MonthlyAvgTrendChart`
- Earnings chart: `PaymentsMoMChart`
- Chart tooltips are custom (not native browser title tooltips), with in-bounds positioning

## Theming + Scrollbars
- Dark mode applied by toggling `document.documentElement.classList.toggle("dark", isDarkMode)`
- Themed scrollbar class in global CSS:
  - `.themed-scrollbar`
- Applied on key overflow containers (modals, matrix, horizontal lists)

## Important State Notes
- Calendar/session behavior depends on:
  - `confirmations`
  - `sessionDeclined`
  - `requests` with `response` state
  - `unavailable` leave blocks
- Availability workflow uses:
  - presets + optional custom slots
  - pre-population on edit
  - summary card rendering after save

## Current Implementation Constraints
- Mock/demo data is hardcoded in `app/page.tsx`
- “Connected calendar” and similar integrations are UI-prototype behaviors only
- No server persistence; state resets on reload

## Suggested Next Step (if productizing)
- Extract large feature blocks from `app/page.tsx` into modules:
  - calendar domain/state
  - availability modal flow
  - notifications center
  - profile analytics widgets
- Then replace mock data with API contracts + backend persistence.
