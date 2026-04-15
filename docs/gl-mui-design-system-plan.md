# GL MUI Design System — Build Plan v1.0

## Overview
A production-ready Figma design system aligned with MUI v5+ and our codebase's actual token values from `src/theme/theme.tsx`.

---

## 1. File & Page Setup

### Figma File: "GL MUI Design System"

| Page | Purpose |
|------|---------|
| **Cover** | System name, version (v1.0), color/type preview, contributors |
| **Foundations** | Color, Typography, Spacing, Elevation, Border Radius, Iconography, Grid |
| **Components** | All atomic and molecular UI components |
| **Patterns** | Common compositions: Forms, Navigation, Modals, Cards, Tables |
| **Documentation** | Usage guidelines, do's/don'ts, accessibility notes |

---

## 2. Token / Variable Configuration

### 2a. Color Variables (Figma Variable Collection: "Theme")

**Modes: Light, Dark**

#### Primary
| Token | Light | Dark |
|-------|-------|------|
| Primary/Main | `#1976d2` | `#90caf9` |
| Primary/Light | `#42a5f5` | `#e3f2fd` |
| Primary/Dark | `#1565c0` | `#42a5f5` |
| Primary/Contrast | `#ffffff` | `#000000` |
| Primary/Shades/12p | `rgba(25,118,210,0.12)` | `rgba(144,202,249,0.12)` |
| Primary/Shades/30p | `rgba(25,118,210,0.30)` | `rgba(144,202,249,0.30)` |
| Primary/Shades/50p | `rgba(25,118,210,0.50)` | `rgba(144,202,249,0.50)` |

#### Secondary
| Token | Light | Dark |
|-------|-------|------|
| Secondary/Main | `#9c27b0` | `#ce93d8` |
| Secondary/Light | `#ba68c8` | `#f3e5f5` |
| Secondary/Dark | `#7b1fa2` | `#ab47bc` |
| Secondary/Contrast | `#ffffff` | `#000000` |

#### Error
| Token | Light | Dark |
|-------|-------|------|
| Error/Main | `#d32f2f` | `#f44336` |
| Error/Light | `#ef5350` | `#e57373` |
| Error/Dark | `#c62828` | `#d32f2f` |
| Error/Contrast | `#ffffff` | `#000000` |

#### Warning
| Token | Light | Dark |
|-------|-------|------|
| Warning/Main | `#ed6c02` | `#ffa726` |
| Warning/Light | `#ff9800` | `#ffb74d` |
| Warning/Dark | `#e65100` | `#f57c00` |
| Warning/Contrast | `#ffffff` | `#000000` |

#### Info
| Token | Light | Dark |
|-------|-------|------|
| Info/Main | `#0288d1` | `#29b6f6` |
| Info/Light | `#03a9f4` | `#4fc3f7` |
| Info/Dark | `#01579b` | `#0288d1` |
| Info/Contrast | `#ffffff` | `#000000` |

#### Success
| Token | Light | Dark |
|-------|-------|------|
| Success/Main | `#2e7d32` | `#66bb6a` |
| Success/Light | `#4caf50` | `#81c784` |
| Success/Dark | `#1b5e20` | `#388e3c` |
| Success/Contrast | `#ffffff` | `#000000` |

#### Grey Scale
| Token | Value |
|-------|-------|
| Grey/50 | `#fafafa` |
| Grey/100 | `#f5f5f5` |
| Grey/200 | `#eeeeee` |
| Grey/300 | `#e0e0e0` |
| Grey/400 | `#bdbdbd` |
| Grey/500 | `#9e9e9e` |
| Grey/600 | `#757575` |
| Grey/700 | `#616161` |
| Grey/800 | `#424242` |
| Grey/900 | `#212121` |

#### Semantic Colors
| Token | Light | Dark |
|-------|-------|------|
| Text/Primary | `rgba(0,0,0,0.87)` | `#ffffff` |
| Text/Secondary | `rgba(0,0,0,0.6)` | `rgba(255,255,255,0.7)` |
| Text/Disabled | `rgba(0,0,0,0.38)` | `rgba(255,255,255,0.5)` |
| Background/Default | `#fafafa` | `#121212` |
| Background/Paper | `#ffffff` | `#1e1e1e` |
| Action/Active | `rgba(0,0,0,0.54)` | `rgba(255,255,255,0.56)` |
| Action/Hover | `rgba(0,0,0,0.04)` | `rgba(255,255,255,0.08)` |
| Action/Selected | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.16)` |
| Action/Disabled | `rgba(0,0,0,0.26)` | `rgba(255,255,255,0.3)` |
| Action/DisabledBg | `rgba(0,0,0,0.12)` | `rgba(255,255,255,0.12)` |
| Divider | `rgba(0,0,0,0.12)` | `rgba(255,255,255,0.12)` |

#### GL Custom Status Colors (from codebase CSS vars)
| Token | Background | Text | Border |
|-------|-----------|------|--------|
| Status/Confirmed | `--gl-status-confirmed-bg` | `--gl-status-confirmed-text` | `--gl-status-confirmed-border` |
| Status/Pending | `--gl-status-pending-bg` | `--gl-status-pending-text` | `--gl-status-pending-border` |
| Status/Declined | `--gl-status-declined-bg` | `--gl-status-declined-text` | `--gl-status-declined-border` |

### 2b. Spacing Variables (Collection: "Spacing")

| Token | Value | Usage |
|-------|-------|-------|
| space/0 | 0px | None |
| space/1 | 4px | Tight gaps |
| space/1.5 | 6px | Chip padding |
| space/2 | 8px | Default gap |
| space/3 | 12px | Medium gap |
| space/4 | 16px | Card padding, section spacing |
| space/5 | 20px | *Deprecated — do not use* |
| space/6 | 24px | Dialog padding, large section gaps |
| space/8 | 32px | Page margin |
| space/10 | 40px | Large spacing |
| space/12 | 48px | XL spacing |
| space/16 | 64px | Max spacing |

### 2c. Border Radius Variables (Collection: "Radius")

| Token | Value | Usage |
|-------|-------|-------|
| radius/none | 0px | Square elements, mobile fullscreen |
| radius/xs | 4px | Chips, badges, tags (Level 4) |
| radius/sm | 8px | Buttons, inputs, icon containers (Level 3) |
| radius/md | 12px | Cards, inner sections, accordions (Level 2) |
| radius/lg | 16px | Dialogs, modals, outer sections (Level 1) |
| radius/pill | 9999px | Pills, toggle tracks |
| radius/circle | 50% | Avatars, dots |

**Hierarchy Rule: 16 → 12 → 8 → 4**

### 2d. Typography Styles (Figma Text Styles)

Font: **Inter** (primary, matches codebase), Roboto fallback

| Style Name | Size | Weight | Line Height | Letter Spacing |
|-----------|------|--------|-------------|----------------|
| h1 | 96px | 300 (Light) | 1.167 | -1.5px |
| h2 | 60px | 300 (Light) | 1.2 | -0.5px |
| h3 | 48px | 400 (Regular) | 1.167 | 0 |
| h4 | 34px | 400 (Regular) | 1.235 | 0.25px |
| h5 | 24px | 400 (Regular) | 1.334 | 0 |
| h6 | 20px | 500 (Medium) | 1.6 | 0.15px |
| subtitle1 | 16px | 400 (Regular) | 1.75 | 0.15px |
| subtitle2 | 14px | 500 (Medium) | 1.57 | 0.1px |
| body1 | 16px | 400 (Regular) | 1.5 | 0.15px |
| body2 | 14px | 400 (Regular) | 1.43 | 0.15px |
| button | 14px | 500 (Medium) | 1.75 | 0.4px |
| caption | 12px | 400 (Regular) | 1.66 | 0.4px |
| overline | 12px | 400 (Regular) | 2.66 | 1px |

### 2e. Elevation Effect Styles

| Style | Shadow |
|-------|--------|
| Elevation/0 | none |
| Elevation/1 | `0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)` |
| Elevation/2 | `0 3px 6px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)` |
| Elevation/3 | `0 10px 20px rgba(0,0,0,0.08), 0 3px 6px rgba(0,0,0,0.04)` |
| Elevation/4 | `0 14px 28px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.04)` |
| Elevation/6 | `0 3px 5px rgba(0,0,0,0.06), 0 7px 9px rgba(0,0,0,0.04), 0 20px 25px rgba(0,0,0,0.04)` |
| Elevation/8 | `0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)` |
| *(Build levels 0-24 following MUI specs)* |

---

## 3. Component Build Order (Atoms → Molecules → Organisms)

### Phase 1: Atoms (Foundational)
Build first — everything else depends on these.

| # | Component | Variants | States |
|---|-----------|----------|--------|
| 1 | **Icon** | Sizes: 20, 24, 36, 48 | Default |
| 2 | **Typography** | h1-h6, subtitle1-2, body1-2, button, caption, overline | Default |
| 3 | **Divider** | Horizontal, Vertical; Light, Full | Default |
| 4 | **Avatar** | Sizes: S(24), M(32), L(40), XL(56); Image, Letter, Icon | Default |
| 5 | **Badge** | Dot, Standard; Colors: primary, secondary, error | Default |
| 6 | **Chip** | Filled, Outlined; Sizes: S, M; Deletable, Clickable | Default, Hover, Focused, Disabled |
| 7 | **Button** | Contained, Outlined, Text, Soft; Sizes: S, M, L; +Icon, Icon-only | Default, Hover, Focused, Active, Disabled |
| 8 | **IconButton** | Standard, Outlined; Sizes: S, M, L | Default, Hover, Focused, Disabled |
| 9 | **Link** | Default, Button | Default, Hover, Visited |
| 10 | **Checkbox** | Unchecked, Checked, Indeterminate; +Label | Default, Hover, Focused, Disabled |
| 11 | **Radio** | Unselected, Selected; +Label | Default, Hover, Focused, Disabled |
| 12 | **Switch** | Off, On; Sizes: S, M | Default, Hover, Focused, Disabled |
| 13 | **Slider** | Continuous, Discrete; Horizontal, Vertical | Default, Hover, Active, Disabled |
| 14 | **Rating** | Empty, Half, Full; Sizes: S, M, L | Default, Hover, Disabled |
| 15 | **Skeleton** | Text, Rectangular, Circular | Animated |
| 16 | **Progress/Linear** | Determinate, Indeterminate, Buffer | Default |
| 17 | **Progress/Circular** | Determinate, Indeterminate | Default |
| 18 | **Tooltip** | Top, Bottom, Left, Right; Arrow, No Arrow | Default |

### Phase 2: Molecules (Input Components)
Combine atoms into form controls.

| # | Component | Variants | States |
|---|-----------|----------|--------|
| 19 | **TextField** | Outlined, Filled, Standard; +Label, +Helper, +Adornment | Empty, Filled, Focused, Error, Disabled |
| 20 | **Select** | Outlined, Filled, Standard; +Label | Default, Open, Filled, Error, Disabled |
| 21 | **Autocomplete** | Single, Multi, Freesolo; +Chips | Default, Open, Filled, Disabled |
| 22 | **FormControl** | TextField + Label + Helper + Error wrapper | Valid, Error, Disabled |
| 23 | **DatePicker** | Date, DateTime, DateRange | Default, Open, Filled |
| 24 | **TimePicker** | 12h, 24h | Default, Open, Filled |

### Phase 3: Molecules (Display & Feedback)
Richer display components.

| # | Component | Variants | States |
|---|-----------|----------|--------|
| 25 | **Alert** | Standard, Filled, Outlined; Severity: error, warning, info, success; +Action | Default, Closable |
| 26 | **Snackbar** | Simple, +Action, +Alert | Default |
| 27 | **Dialog** | Simple, Form, Confirmation, Fullscreen | Default |
| 28 | **ListItem** | Text, +Icon, +Avatar, +Secondary action, +Divider | Default, Selected, Hover, Disabled |
| 29 | **List** | Simple, Navigation, Nested | Default |
| 30 | **Table** | Basic, Dense, Sticky header; Sortable, Selectable | Default |
| 31 | **Pagination** | Numbered, Prev/Next, +Boundries | Default |
| 32 | **FAB** | Standard, Extended; Sizes: S, M, L | Default, Hover |

### Phase 4: Organisms (Composite)
Full sections composed of molecules.

| # | Component | Variants |
|---|-----------|----------|
| 33 | **Card** | Outlined, Elevated; +Media, +Header, +Actions | 
| 34 | **Paper** | Elevation 0-24 |
| 35 | **Accordion** | Single, Controlled; +Icon, +Actions |
| 36 | **AppBar** | Default, Dense; +Search, +Menu, +Avatar |
| 37 | **Tabs** | Standard, Scrollable; Horizontal, Vertical; +Icon |
| 38 | **Breadcrumbs** | Text, Link, +Icon; +Collapsed |
| 39 | **Drawer** | Permanent, Temporary, Mini; Left, Right |
| 40 | **BottomNavigation** | Standard; +Icon, +Label |
| 41 | **Menu** | Simple, +Icons, +Divider, Nested |
| 42 | **Stepper** | Horizontal, Vertical; +Icons, +Alt label |
| 43 | **SpeedDial** | Up, Down, Left, Right |
| 44 | **Timeline** | Left, Right, Alternating |
| 45 | **TreeView** | Single, Multi select; +Icons |

### Phase 5: Layout
Frame templates, not components.

| # | Component | Variants |
|---|-----------|----------|
| 46 | **Container** | xs, sm, md, lg, xl; Fixed, Fluid |
| 47 | **Grid** | 12-column; Breakpoint variants |
| 48 | **Stack** | Horizontal, Vertical; Spacing variants |
| 49 | **Box** | Utility wrapper with common padding/margin |

---

## 4. Naming Convention Reference

### Components
```
ComponentName / Variant / State / Size
```

Examples:
- `Button / Contained / Default / Medium`
- `Button / Outlined / Hover / Small`
- `TextField / Outlined / Error / Medium`
- `Chip / Filled / Default / Small`
- `Card / Outlined / Default`

### Layers inside components
```
_ComponentName          (private, not published)
.ComponentName          (base component for swap slots)
Icon / name             (icon instances)
Label                   (text layers)
Helper Text             (support text)
```

### Variables
```
Collection/Category/Token
```
- `Theme/Primary/Main`
- `Theme/Text/Primary`
- `Spacing/space/4`
- `Radius/radius/md`

### Styles
```
Category/Name
```
- `Typography/h1`
- `Typography/body1`
- `Elevation/2`
- `Elevation/8`

---

## 5. Recommended Figma Plugins

| Plugin | Purpose |
|--------|---------|
| **Tokens Studio** | Sync design tokens with code, manage variables |
| **Material Symbols** | Official Google Material icon set |
| **Iconify** | Extended icon library (MUI icons included) |
| **Contrast** | WCAG contrast checker |
| **Batch Styler** | Bulk update text/color styles |
| **Auto Layout Helper** | Debug and fix auto-layout issues |
| **Design Lint** | Find inconsistencies in styles/tokens |
| **Figma Tokens** | Export tokens as JSON for dev handoff |

---

## 6. Patterns Page Structure

| Pattern | Components Used |
|---------|----------------|
| **Login Form** | Card, TextField, Button, Link, Checkbox |
| **Registration Form** | Card, TextField, Select, Button, Stepper |
| **Search Bar** | TextField + Autocomplete + IconButton |
| **Navigation Header** | AppBar + Tabs + Avatar + Menu |
| **Side Navigation** | Drawer + List + ListItem + Divider |
| **Data Table** | Table + Pagination + Chip + IconButton |
| **Settings Panel** | Card + Switch + TextField + Select + Button |
| **Notification Stack** | Snackbar + Alert + Badge |
| **Modal Dialog** | Dialog + TextField + Button + Typography |
| **Empty State** | Box + Icon + Typography + Button |
| **Card Grid** | Grid + Card + Avatar + Chip + Button |
| **Session Card (GL)** | Card + Chip + Typography + Button + Icon |
| **Task Card (GL)** | Card + Chip + Typography + Badge |

---

## 7. Documentation Page Contents

### Usage Guidelines
- When to use each component
- Recommended combinations
- Mobile vs desktop considerations

### Do's and Don'ts
- Color contrast minimums (WCAG AA: 4.5:1 for text, 3:1 for UI)
- Touch target minimums (48px on mobile)
- Never override tokens inline — always use variables
- Padding: 16px (default) or 24px (spacious) — never 20px

### Accessibility Notes
- Every interactive component needs focus states
- Color alone should never convey meaning
- All icons must have text labels or aria-labels
- Minimum font size: 12px for captions, 14px for body

### Border Radius Hierarchy
```
Outer containers (Dialogs, Modals): 16px
Inner sections (Cards, Accordions):  12px
Nested elements (Buttons, Inputs):    8px
Smallest elements (Chips, Badges):    4px
```

---

## 8. Execution Steps (when Figma MCP reconnects)

1. Create new Figma file "GL MUI Design System"
2. Create pages: Cover, Foundations, Components, Patterns, Documentation
3. Build Variable Collections: Theme (colors), Spacing, Radius
4. Build Text Styles for all typography variants
5. Build Effect Styles for elevation levels
6. Build atoms (Phase 1) — one component at a time
7. Build molecules (Phase 2-3)
8. Build organisms (Phase 4)
9. Build layout frames (Phase 5)
10. Compose patterns from components
11. Write documentation
12. Final QA: contrast check, auto-layout validation, naming audit
