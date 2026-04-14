# Changelog

All notable changes to the Guru Dashboard are documented here.

---

## 2026-04-14

### Profile — Performance Section
- **Bugfix: drive Performance card branching off `selectedRoles` (chips), not `selectedRole` (dropdown)** — Initial implementation gated the card-set switch on `selectedRole`, but the dev panel's "Active Guru Roles (Profile)" chips dispatch `toggleRole` which only mutates `selectedRoles` (the array), leaving `selectedRole` untouched. Result: toggling the Evaluator/Moderator chips appeared to do nothing — the cards stayed in set A. Now branches on a derived `isPureEvalMod` flag (`activeCategories.length === 1 && activeCategories[0] === "Evaluation & Moderation"`), and sources the underlying data from the first Eval/Mod role in `selectedRoles` when in pure-Eval/Mod mode (falling back to `selectedRole` otherwise). Mixed-category selections (e.g. Teacher + Evaluator) intentionally stay on set A so session metrics still render correctly. Memo dep array updated to include `selectedRoles`, `dataRole`, and `isEvalModCategory`.
- **Make Performance KPI cards role-aware (split by category)** — Previously every role saw the same four cards (AVG RATING, AVG SESSIONS / MONTH, AVG SESSION QUALITY, ON-TIME CONFIRMS). For Evaluators / Moderators these don't fit: "session quality" is framed around 4.0+/4.4+ session ratings (they evaluate assignments, not sessions); "sessions / month" reads "sessions" when the unit is really evaluations or moderations; "on-time confirms" describes confirming an assigned session, but evaluators don't confirm — they have a turnaround. Refactored `statCards` in [src/pages/Profile/index.tsx](src/pages/Profile/index.tsx) to branch on `ROLE_TO_CATEGORY[selectedRole]` and emit one of two card sets:
  - **Teaching & Mentoring** (Teacher, Industry Expert, Course/Career/CV Review/Project Mentor) → unchanged 4 cards.
  - **Evaluation & Moderation** (Evaluator, Moderator) → AVG RATING + EVALUATIONS / MONTH (or MODERATIONS / MONTH for Moderator) + ON-TIME EVALUATIONS / MODERATIONS + LEARNERS IMPACTED. The "session quality" card is dropped for this category; LEARNERS IMPACTED takes its place to mirror Tile 4 of the live production dashboard for this role group.
  - All Eval/Mod card copy (description, reportTitle, reportSummary, supportingStat label) is parameterised on the role's work noun ("evaluation" vs "moderation") so it reads naturally per role.
- **Add `learnersImpacted*` fields to RoleStatCardData** in [src/data/demo-sessions.ts](src/data/demo-sessions.ts) — `learnersImpactedPerMonth`, `learnersImpactedDelta`, `learnersImpactedBars`, `learnersImpactedBreakdown`, `peerLearnersImpactedPerMonth`. Populated for all 8 roles with realistic monthly counts (Teacher ~340, Course Mentor ~280, Career Mentor ~180, CV Review Mentor ~220, Project Mentor ~150, Industry Expert ~110, Evaluator ~320, Moderator ~210) and gentle 6-month upward trends. Today only the Eval/Mod cards consume this; the data is populated for all roles so the LEARNERS IMPACTED card can be reused for Teaching/Mentoring later without a data-shape change.
- **Update `sessionsBreakdown` units for Evaluator/Moderator** — values were "95 sessions" / "42 sessions" etc. which read awkwardly under an "Evaluations" or "Moderations" card label. Changed to "95 evaluations" (Evaluator) and "42 moderations" (Moderator) so the breakdown table inside the drawer matches the card framing.
- **Extend `diffStr` peer-comparison number formatter** for both the inline card pill and the drawer pill — added cases for the new labels: percent for `ON-TIME EVALUATIONS` / `ON-TIME MODERATIONS`, integer for `EVALUATIONS / MONTH` / `MODERATIONS / MONTH` / `LEARNERS IMPACTED` / `AVG SESSIONS / MONTH` (the integer case fixes a long-standing minor bug — sessions/month was previously formatted with 2 decimal places).
- **Add early-user / new-user fallback copy** for the 5 new label keys (`EVALUATIONS / MONTH`, `MODERATIONS / MONTH`, `ON-TIME EVALUATIONS`, `ON-TIME MODERATIONS`, `LEARNERS IMPACTED`) in `zeroMessages`, `earlyValues`, and `earlyDescriptions`, so Eval/Mod users in those states see role-appropriate placeholder copy rather than blank fallbacks.

---

## 2026-04-13

### Profile — Performance Section
- **Replace text arrows with MUI Material icons** — The `↗` / `↘` delta glyphs in the Performance KPI cards (delta indicator, inline category ratings) and the `→` in the "See detailed report" footer were plain Unicode characters. Swapped them out for MUI icons: `TrendingUpIcon` for positive delta, `TrendingDownIcon` for negative delta, and `ArrowForwardIcon` for the "See detailed report" chevron. Same treatment applied to the delta indicators inside the course detail drawer and the detailed report modal (active card delta + per-category ratings) for visual consistency across the Performance flow.
- **Expand ambiguous "Eval & Mod" label in AVG RATING breakdown** — The role-category row in the AVG RATING KPI card (and the detailed report modal) was showing the abbreviation "Eval & Mod" for the `Evaluation & Moderation` category. Replaced with a role-aware label: "Evaluation" when the user only has the Evaluator role, "Moderation" when only Moderator, and "Evaluation & Moderation" when they hold both. Removes the ambiguous short form and matches the user's actual role(s).
- **Move AVG SESSION QUALITY thresholds into the detailed report modal** — The "Quality thresholds" sub-panel (Rated 4.0+ / Rated 4.4+ with targets) now lives inside the "Session Quality Report" dialog instead of on the card. The card was duplicating the hero value ("Rated 4.0+" is the same number as the hero) and the stricter 4.4+ bar is drill-in detail, not at-a-glance info. In the modal, each row now reads as a full sentence — "Sessions rated 4.0 or above · You 97.5% · Target > 98%" — with a Met / Below target chip derived from the existing benchmark strings, so nothing that was on the card is lost on the click-through.
- **Lighten the dark green sentiment color across Performance** — The positive-trend / "you're ahead" indicators on the Performance KPI cards (delta line, peer comparison sentiment) and on related Performance widgets (Course Performance "Biggest gain" stat, per-course delta in the course detail drawer) were rendered in `success.dark`, which read as visually heavy. Switched all four occurrences to `success.main` for a brighter, more legible green that's consistent across the section.
- **Move the delta line inline next to the hero number on Performance KPI cards** — The trend chip (e.g. `↗ +0.08 vs last month`) used to sit on its own row underneath the hero value (e.g. `4.91`), so the user had to read two stacked rows to connect "the value" with "how much it changed". Wrapped the hero and the delta in a baseline-aligned `Stack` so the delta now renders to the right of the hero number on desktop, restoring proximity. Mobile keeps the delta hidden as before (whole card is tappable to drill in). The standalone desktop-only delta block was removed.
- **Straighten the delta row alignment** — The trend icon, `+0.8%` value, and `vs last month` label were drifting up and down because they were split across two `<Typography>` elements with mismatched alignment modes (icon+number used inline-flex centered, the label was on text baseline). Lifted the icon out of the value Typography, made all three direct children of the inline `Stack` with `alignItems: "center"`, and pinned each child to `lineHeight: 1` so they share one optical centerline.
- **Reduce KPI hero font from 2.25rem → 2rem (desktop)** — At 2.25rem the hero number (e.g. `97.5%`) was wide enough that the inline delta row (`↗ +0.8% vs last month`) wrapped to a second line on narrower card widths. Dropped the desktop `fontSize` to 2rem so the hero + delta consistently fit on one line. Mobile size (1.35rem) unchanged.
- **Remove per-role category breakdown from AVG RATING card** — The inline breakdown rows (`Mentoring 4.84 +0.08`, `Evaluation 4.98 +0.05`, etc.) on the AVG RATING KPI card were adding 2–3 extra rows of small-font text, making the card visually heavy. Removed from the card surface; the full per-category cards (with trend chart + breakdown rows) already exist in the "See detailed report" modal under "Rating by Role Category", so nothing is lost on drill-in.
- **Add breathing room between rows on Performance KPI cards** — After trimming content off the cards, the remaining rows (label → hero+delta → description → peer comparison → sparkline) had collapsed tight together. Bumped the vertical gaps so each row has a clear margin of air: hero Stack `mb` 1.5 → 2.5, description `mb` 1.5 → 2, and a guaranteed `pt: 3` above the sparkline chart (in addition to `mt: auto` which still pushes it to the bottom). Also cleaned up the peer benchmark's leftover conditional margin (previously toggled on `primaryBenchmark`, which no longer lives on the card).
- **Fix floating sparkline dots after padding bump** — Once `pt: 3` was applied to the sparkline wrapper, the absolutely-positioned hover-dot targets drifted above the line because their `top: (y/h * 100)%` was computing a percentage of the now-taller wrapper (SVG height + padding) while the SVG itself only occupied the lower portion. Wrapped the sparkline in an outer spacer Box that holds the `pt`/`mt: auto`, and kept the inner (SVG-sized) Box as the positioning context for the dots — so the dots snap back to sit exactly on the polyline.
- **Replace "See detailed report" footer with a pill icon-button in the label row** — Each KPI card had a divider + padded bottom strip with "See detailed report →" text, which added ~2 rows of visual weight per card and duplicated the "whole card is tappable" behavior the card already has. Swapped for a Swiggy-style affordance: a small pill-shaped IconButton sitting to the right of the card's accent label, containing an `ArrowForwardIcon`. The button has a "See detailed report" tooltip for discoverability, stops click propagation so the card's own onClick doesn't double-fire, and removes the bottom strip entirely — shaving ~40–50px off each card's height.
- **Polish the pill icon-button visuals** — Initial version was a 26×26 circle with a visible border; not a true pill and not themed to the card. Reworked: 38×24 (wider than tall — actual pill/stadium shape), no border, background is the card's own accent color at ~16% alpha via `color-mix(in srgb, <accent> 16%, transparent)`, arrow rendered in the full accent color. Hover bumps bg to ~26% alpha and slides the arrow 2px right via a className-targeted transform; active state adds a subtle `scale(0.96)` for tactile feedback. Ripple disabled for a cleaner feel. Each of the 4 cards now gets a pill in its own colorway (primary/warning/purple/success) that reads as part of the card instead of a generic neutral chip.
- **Increase gap between card content and sparkline** — The chart still felt visually crowded against the peer-comparison line above it. Bumped the sparkline wrapper's `pt` from `{ xs: 1.5, sm: 3 }` to `{ xs: 2.5, sm: 5 }` (≈40px breathing room on desktop), so the chart sits clearly separated from the textual content.
- **Make Performance KPI cards feel interactive — pointer cursor + hover lift** — The cards were clickable (whole-surface onClick opens the detailed report modal) but gave no visual affordance on desktop: cursor stayed as `default` and there was no hover state, so users couldn't tell the card was a button. Switched `cursor` to `pointer` on all breakpoints (gated by `!isNewOrEarly`), and added a hover state that lifts the card 2px (`translateY(-2px)`), casts a soft drop shadow tinted with the card's own accent (`box-shadow: 0 6px 18px -6px color-mix(accent 35%, transparent)`), and strengthens the border to a 55%-alpha accent. Active state reduces the lift to 1px for a tactile press. Transitions `border-color`, `transform`, and `box-shadow` together at 0.2s ease. Each card's hover shadow picks up its own accent so the four cards feel distinct but consistent.
- **Reframe AVG CONFIRM TIME → ON-TIME CONFIRMS so all four KPI cards share "higher is better" semantics** — Previously three cards (rating, sessions, quality) were "higher = good, ↗ green = improving" but AVG CONFIRM TIME flipped the convention (lower hours = good, ↘ down-trending chart actually meant improvement). This created cognitive friction every time the eye landed on the fourth card. Replaced the metric on the card surface with **ON-TIME CONFIRMS** — the % of sessions confirmed within the 24-hour SLA — so up-arrow/up-trend always means "good" across the whole row. Added new fields to `RoleStatCardData` (`onTimeConfirmRate`, `onTimeConfirmDelta`, `onTimeConfirmBars`, `onTimeConfirmBreakdown`, `peerOnTimeConfirmRate`) populated for all 8 roles, with realistic 6-month upward trends. The raw average confirm time isn't lost — added a new optional `supportingStat` field on the card config that the detailed report modal renders as a small "Average time to confirm: 5.4h" line right under the hero+delta row, so anyone drilling in still sees the underlying time number.
- **Neutral background for the peer comparison pill inside the Performance drawer** — The peer pill inside the right-side detailed report drawer was using the card's accent color at 10% alpha (`color-mix(in srgb, <accent> 10%, transparent)`), which on the purple AVG SESSION QUALITY drawer painted the pill with a lavender tint that competed with the green "You're 2.5% ahead" sentiment text in the foreground. Switched the pill background to the theme's neutral `action.hover` token so the colored foreground (success.main / warning.dark) reads clearly against it, regardless of which card was clicked.
- **Move the Performance detailed report from a centered dialog to a right-side drawer** — The "See detailed report" view was rendering as an MUI `Dialog` (centered, fixed width ~600px, short vertical height with internal scroll). Switched to a right-anchored `Drawer` that fills the full viewport height and is 480px wide on desktop / 100vw on mobile. Replaced `DialogContent` with a flex-1 `Box` (`overflowY: auto`) so long content scrolls inside the drawer rather than pushing the footer off-screen, and replaced `DialogActions` with a bordered footer row. Keeps the same close/dismiss behavior (backdrop click, Close button) and all the existing content blocks (hero + delta, peer comparison, supporting stat, trend chart, quality thresholds / per-category sections, breakdown table) — it's a container swap, not a content change.
- **Remove "SLA" jargon from ON-TIME CONFIRMS copy** — User-facing strings referenced "the 24-hour SLA" — a B2B ops term many learners/gurus wouldn't know. Rewrote to plain language: the card description is now "Sessions you confirmed within 24 hours of being assigned." and the detailed report summary is "Share of sessions you confirmed within 24 hours of being assigned. Higher is better." Internal JSDoc comments in `RoleStatCardData` also cleaned up. Same data, just clearer copy.
- **Bump sparkline gap further** — Increased the breathing room above the chart on each Performance KPI card again: sparkline wrapper `pt` now `{ xs: 3.5, sm: 7 }` (≈56px desktop, was 40px). Mobile bumped from 20px → 28px. The chart now sits with a clear visual break from the peer comparison row above it.
- **Sync card → modal data parity for all four Performance cards** — Audit found three mismatches between what each KPI card showed on its surface and what its "See detailed report" dialog rendered: (a) the **peer comparison** ("Peer avg X · You're Y ahead/to go") was visible on every card but completely missing from every modal; (b) the **card description** sentence (e.g. "Sessions you confirmed within the 24-hour SLA") was on every card but not in the modal header; (c) the early-user **fallback maps** (`zeroMessages`, `earlyValues`, `earlyDescriptions`) still keyed off the old `"AVG CONFIRM TIME"` label after the rename, so early users saw blank fallback content for the renamed card. Fixed all three: the modal now renders a soft-tinted peer comparison pill under the hero+delta row using the same sentiment logic and units as the card; the description is rendered as a small caption directly under the report summary in the modal header; and the fallback map keys updated to `"ON-TIME CONFIRMS"` with appropriate copy ("On-time confirmation rate appears as you confirm sessions").

---

## 2026-03-19

### Home Page
- **Rename "Sessions" to "Events" throughout Dashboard** — Changed all user-facing labels: "Next Session" → "Next Event", "Sessions" → "Events", etc.

### Components Page (Dev Mode) — UX Audit
- **Consistent card structure** — All cards now follow the same 3-row layout: title + status, date/batch info line, actions + View details. No more floating secondary info.
- **View Details dialogs for all types** — Every activity type (Residency, Online Session, Career, Evaluation, Moderation, Capstone, CV Review) now has a working View Details dialog showing secondary info (group, topic, contact, course link, milestone dates, etc.).
- **Status chips replace floating text** — "Gathering feedback", "No feedback collected", "Payment pending", "Payment processed" are now consistent Chips with proper styling instead of loose Typography.
- **Secondary info moved to dialogs** — Group name, topic, contact email, city/map, LMS links, Create Poll, Student Progress, View LinkedIn/CV, milestone dates all moved into View Details.
- **Disabled state for pending payments** — "View in payments" button is now disabled when payment is pending.
- **View details button always right-aligned** — Consistent positioning across all card types.

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
