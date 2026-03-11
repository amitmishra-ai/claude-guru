# GL Ninja — Guru Dashboard Prototype

Interactive mentor dashboard prototype for Great Learning's Ninja platform — built with **Vite + React 19**, **TypeScript**, **MUI v7**, **Redux Toolkit + RTK Query**, and **Tailwind CSS**.

----

## What This Prototype Covers

- **Home dashboard** — impact metrics, task tracking, upcoming/completed/declined sessions
- **Calendar** — week and month views, availability overlays, sticky day-header grid
- **Availability management** — multi-step builder dialog (pattern → weekly slots), recurring patterns, one-off blocks, not-available exceptions
- **Session operations** — confirm/decline, session detail modal, recording and invoice actions
- **Notifications (Alerts)** — unread/read grouping, mark-all-as-read
- **Profile & preferences** — timezone settings, communication preferences
- **Rating history** — session-wise rating entries, trend chart with tooltip

----

## Tech Stack

| Layer | Library |
|---|---|
| Build | Vite 6 |
| UI framework | React 19 + TypeScript 5 |
| Component library | MUI (Material UI) v7 |
| Styling | Tailwind CSS v3 + MUI `sx` prop |
| State — UI | Redux Toolkit (slices) |
| State — server data | RTK Query (injected endpoints) |
| Icons | `lucide-react` |
| Charts | `recharts` |
| Routing | `react-router-dom` v7 |

---

## Getting Started

**Requirements:** Node.js 20+, npm 10+

```bash
npm install
npm run dev       # http://localhost:3001
```

### Scripts

```bash
npm run dev       # Vite dev server (HMR)
npm run build     # tsc type-check + Vite production build
npm run preview   # Preview production build locally
npm run lint      # ESLint
```

---

## Project Structure

```
src/
├── api/
│   └── ninja/                        # RTK Query API layer
│       ├── ninjaApi.ts               # Base API (fakeBaseQuery → fetchBaseQuery when real API ready)
│       ├── availabilityApi.ts        # saveAvailability mutation
│       └── __mocks__/
│           └── availabilityMockData.ts
│
├── components/
│   ├── Utils/
│   │   └── FlexBox.tsx               # Use instead of <Box display="flex"> or <Stack direction="row">
│   ├── dialogs/
│   │   ├── AvailabilityBuilderDialog/
│   │   │   ├── AvailabilityBuilderDialog.tsx
│   │   │   ├── interfaces/index.ts
│   │   │   └── index.ts
│   │   ├── SessionDetailDialog.tsx
│   │   ├── DeclineReasonDialog.tsx
│   │   ├── RequestDetailDialog.tsx
│   │   ├── TimezoneDialog.tsx
│   │   ├── GroupProfileDialog.tsx
│   │   ├── AvailabilityNudgeDialog.tsx
│   │   ├── MarkNotAvailableDialog.tsx
│   │   ├── LearnerRatingsDialog.tsx
│   │   ├── PollBuilderDialog.tsx
│   │   └── index.tsx                 # <GlobalDialogs /> — rendered at root
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── MobileNav.tsx
│   └── shared/
│       ├── SectionTitle.tsx
│       └── ToastViewport.tsx
│
├── pages/                            # Route-level pages (Feature/index.tsx pattern)
│   ├── Calendar/index.tsx
│   ├── Dashboard/index.tsx
│   ├── Courses/index.tsx
│   ├── Availability/index.tsx
│   ├── Notifications/index.tsx
│   ├── Profile/index.tsx
│   └── Preferences/index.tsx
│
├── store/
│   ├── index.ts                      # configureStore + typed hooks (useAppSelector, useAppDispatch)
│   └── slices/                       # Local UI state slices
│       ├── availabilitySlice.ts      # Builder state, patterns, blocks
│       ├── calendarSlice.ts
│       ├── uiSlice.ts                # Dialog open/close flags
│       ├── profileSlice.ts
│       ├── sessionsSlice.ts
│       ├── requestsSlice.ts
│       ├── notificationsSlice.ts
│       ├── preferencesSlice.ts
│       ├── toastsSlice.ts
│       └── pollsSlice.ts
│
├── data/                             # Demo/seed data (no real API yet)
│   ├── demo-availability.ts
│   ├── demo-sessions.ts
│   ├── demo-requests.ts
│   └── demo-notifications.ts
│
├── lib/
│   ├── types.ts                      # Shared TypeScript types
│   ├── helpers.ts                    # Formatting utilities
│   ├── constants.ts                  # DOW_LONG, timeOptions12, etc.
│   └── utils.ts                      # cn() — clsx + tailwind-merge
│
├── theme/
│   ├── theme.tsx                     # MUI createTheme (seed #4E8DFF)
│   └── EmotionCacheProvider.tsx      # prepend: true so Tailwind wins specificity
│
├── App.tsx                           # Route definitions
└── main.tsx                          # React root + Redux Provider + Router
```

---

## Architecture

### Styling (decision order — follow strictly)

1. **MUI variant / color / size props** — always first
2. **`sx` prop** — for ≤ 3 rules or spacing tweaks
3. **`.module.scss`** — for > 3 rules (add alongside the component file)

> Never use `styled()` from Emotion or inline `style={{}}` prop.
> Never use `<Stack direction="row">` — use `<FlexBox>` from `components/Utils/FlexBox` instead.

### State management (3-tier rule)

| State type | Where | Examples |
|---|---|---|
| **Local UI state** | Redux slice in `store/slices/` | Dialog open flags, stepper step, builder days/time |
| **Server data** | RTK Query in `api/ninja/` | Availability save/fetch, sessions, requests |
| **Transient UI** | `useState` in component | Custom form visibility, hover, focus |

### API layer

All API calls use RTK Query injected into `ninjaApi`. First-iteration endpoints use `queryFn` with mock data:

```ts
// api/ninja/availabilityApi.ts
export const availabilityApi = ninjaApi.injectEndpoints({
  endpoints: (builder) => ({
    saveAvailability: builder.mutation<IResponse, IRequest>({
      queryFn: async (arg) => {
        // TODO: replace with real API call
        // return { data: await realClient.post('/guru/availability', arg) }
        await delay(300);
        return { data: mockSaveAvailabilityResponse };
      },
      invalidatesTags: [NINJA_TAG_TYPES.AVAILABILITY],
    }),
  }),
});

export const { useSaveAvailabilityMutation } = availabilityApi;
```

> `ninjaApi` uses `fakeBaseQuery()`. Swap for `fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_BASE_URL })` when the backend is ready.

### Dialogs

All dialogs render once at root via `<GlobalDialogs />` (`components/dialogs/index.tsx`).
Open state lives in Redux (`s.ui.openAvailability`, `s.ui.openSession`, …) so any page can trigger them:

```ts
dispatch(setOpenAvailability(true));
```

### Emotion / Tailwind coexistence

`EmotionCacheProvider` inserts MUI styles with `prepend: true` so Tailwind utility classes win on specificity. This is why `className="rounded-2xl"` on a Dialog `PaperProps` correctly overrides MUI's default `borderRadius`.

> MUI Portal components (`Menu`, `Popover`) are incompatible with the Emotion Babel plugin in this setup. Use custom `position: fixed` dropdowns with `getBoundingClientRect()` positioning instead.

---

## Component & Page Conventions

### New component

```
components/[Feature]/[ComponentName]/
├── [ComponentName].tsx       # Default export — plain function, no React.FC
├── interfaces/index.ts       # TypeScript interfaces for props
├── utils/index.ts            # Component-specific utilities (if needed)
└── index.ts                  # Barrel: export { default } from './[ComponentName]'
```

### New page

```
pages/[Feature]/
├── index.tsx                 # Default export page component
├── interfaces/index.ts       # Page-specific interfaces (if needed)
└── utils/index.ts            # Page-specific utilities (if needed)
```

### New API endpoint

```
api/ninja/
├── [feature]Api.ts           # ninjaApi.injectEndpoints(...)
└── __mocks__/
    └── [feature]MockData.ts  # Mock response data for first iteration
```
