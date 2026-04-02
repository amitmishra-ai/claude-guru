# Components Page - Guru Roles Audit

> **Last updated:** 2 Apr 2026
> **Source of truth:** `src/pages/Components/index.tsx`
> **Role config:** `src/lib/role-config.ts`

---

## 1. Role - Activity Matrix

| Guru Role | Activity Types (Component Sections) |
|---|---|
| **Teacher** | Residency, Online Event |
| **Course Mentor** | Online Event, Residency |
| **Career Mentor** | Career / Mock Interview |
| **CV Review Mentor** | CV Review |
| **Evaluator** | Evaluation (Assignment) |
| **Moderator** | Moderation (Discussion Question) |
| **Project Mentor** | Capstone Project |
| **Industry Expert** | Online Event |

**Session types per role** (from `role-config.ts`):

| Guru Role | Allowed Session Types |
|---|---|
| Teacher | Mentored Learning session, Online class, Online session, Residency |
| Course Mentor | Mentored Learning session, Online session, Online class, Residency |
| Career Mentor | Career mentoring session, Schedule a call |
| CV Review Mentor | CV Review |
| Evaluator | Evaluation |
| Moderator | Moderation |
| Project Mentor | Capstone project mentoring session |
| Industry Expert | Industry session, Online session |

---

## 2. Per-Activity Detailed Breakdown

### 2A. Online Session (Mentoring)

**Used by:** Teacher, Course Mentor, Industry Expert

| # | Card State | Chips | Stats/Metrics on Card | Actions | Detail Drawer |
|---|---|---|---|---|---|
| 1 | **Confirmed** | Confirmed (green) | Batch, Date, Time range | Join session (disabled), Material | Session details drawer |
| 2 | **Combined - Confirmed** | Confirmed (green) | Batch, Date, Time range | Join session (disabled), Material | Session details drawer |
| | | | Combined accordion: per-batch (batch name, group, learner count) | | |
| 3 | **Scheduled** | Scheduled (orange) | Batch, Date, Time range | Confirm, I'm unavailable | Session details drawer |
| 4 | **Combined - Scheduled** | Scheduled (orange) | Batch, Date, Time range | Confirm, I'm unavailable | Session details drawer |
| | | | Combined accordion: per-batch (batch name, group) | | |
| 5 | **Mock Interview - Confirmed (secondary)** | Confirmed (green) | Batch, Date, Time range, Secondary facilitator badge | Join session, Share Feedback | Session details drawer |
| 6 | **Tentative** | To be confirmed (orange) | Batch, Program, Date range (start-end), Contact email | View details (opens dialog) | PlannedEventDetailDialog: schedule TBC, batch, program, contact |
| 7 | **Completed - Gathering Feedback** | Payment pending, Gathering feedback | Batch, Date, Time range | Recording | Completed session drawer |
| 8 | **Completed - Recording Processing** | Payment pending, Gathering feedback | Batch, Date, Time range | Recording (disabled) | Completed session drawer |
| | | | Italic note: "Recording is being processed..." | | |
| 9 | **Completed - No Feedback** | Payment processed, No feedback collected | Batch, Date, Time range | Recording | Completed session drawer |
| 10 | **Completed - With Rating** | Payment processed, StarRatingNumeric | Batch, Date, Time range, Rating (e.g. 4.5) | Recording, Feedback | Completed session drawer |
| 11 | **Combined - Completed** | Payment processed, StarRatingNumeric (per batch) | Splits into separate cards per batch, each with own rating | Recording, Feedback (per card) | Completed session drawer |

**Total card states: 11**

---

### 2B. Residency

**Used by:** Teacher, Course Mentor

| # | Card State | Chips | Stats/Metrics on Card | Actions | Detail Drawer |
|---|---|---|---|---|---|
| 1 | **Confirmed** | Confirmed (green) | Batch, Date range (start -> end), Time, Location | Material, Course | Session details drawer |
| 2 | **Combined - Confirmed** | Confirmed (green) | Batch, Date range, Time, Location | Material, Course | Session details drawer |
| | | | Combined accordion with multi-batch details | | |
| 3 | **Scheduled** | Scheduled (orange) | Batch, Date range, Time, Location | Confirm, I'm unavailable | Session details drawer |
| 4 | **Combined - Scheduled** | Scheduled (orange) | Batch, Date range, Time, Location | Confirm, I'm unavailable | Session details drawer |
| | | | Combined accordion + schedule accordion (3-day breakdown) | | |
| 5 | **Completed - Gathering Feedback** | Payment pending, Gathering feedback | Batch, Date range, Time | - | Completed session drawer |
| 6 | **Completed - With Rating** | Payment processed, StarRatingNumeric | Batch, Date range, Time, Rating (e.g. 4.2) | Feedback | Completed session drawer |

**Total card states: 6**

---

### 2C. Career / Mock Interview

**Used by:** Career Mentor

| # | Card State | Chips | Stats/Metrics on Card | Actions | Detail Drawer |
|---|---|---|---|---|---|
| 1 | **Career 1:1 - Confirmed** | Confirmed (green) | Batch, Date, Time range | Join session | Session details: Learner name, Resume URL, LinkedIn, Profile URL, Notes |
| 2 | **Mock Interview - Confirmed** | Confirmed (green) | Batch, Date, Time range | Join session, Share Feedback | Session details drawer |
| 3 | **Career 1:1 - Scheduled** | Scheduled (orange) | Batch, Date, Time range | Confirm, I'm unavailable | Session details drawer |
| 4 | **Career - Completed (Gathering Feedback)** | Payment pending, Gathering feedback | Batch, Date, Time range | Recording | Completed session drawer |
| 5 | **Career - Completed (With Rating)** | Payment processed, StarRatingNumeric | Batch, Date, Time range, Rating (e.g. 4.8) | Recording, Feedback | Completed session drawer |
| 6 | **Mock - Completed (With Rating)** | Payment processed, StarRatingNumeric | Batch, Date, Time range, Rating (e.g. 4.0) | Recording, Feedback, Share Feedback | Completed session drawer |

**Total card states: 6**

---

### 2D. Evaluation (Assignment)

**Used by:** Evaluator

| # | Card State | Chips | Stats/Metrics on Card | Actions | Detail Drawer |
|---|---|---|---|---|---|
| 1 | **Confirmed** | Confirmed (green) | Date range (assessment due -> grading due), Batch, Submission progress ("18 / 42 graded, 42 submissions") | Open SpeedGrader | EvaluationDetailDialog: assignment link, course template, batch, contact |
| 2 | **Scheduled** | Scheduled (orange) | Date range, Batch | Confirm, I'm unavailable | EvaluationDetailDialog |
| 3 | **Tentative** | To be confirmed (orange) | Date range, Batch (no progress stats, no links) | View details | EvaluationDetailDialog (tentative variant) |
| 4 | **Completed - Gathering Feedback** | Payment pending, Gathering feedback | Date range, Batch | View details | EvaluationDetailDialog (gathering variant) |
| 5 | **Completed - With Rating** | Payment processed, StarRatingNumeric | Date range, Batch, Rating (e.g. 4.0) | Feedback | EvaluationDetailDialog (completed variant) |

**Total card states: 5**

---

### 2E. Moderation (Discussion Question)

**Used by:** Moderator

| # | Card State | Chips | Stats/Metrics on Card | Actions | Detail Drawer |
|---|---|---|---|---|---|
| 1 | **Confirmed** | Confirmed (green) | Date range (moderation start -> concluding remark), Batch, Discussion progress ("34 posts, 8 unread, 12/34 graded") | Open Discussion | ModerationDetailDialog: DQ link, course template, batch, contact |
| 2 | **Scheduled** | Scheduled (orange) | Date range, Batch | Confirm, I'm unavailable | ModerationDetailDialog |
| 3 | **Tentative** | To be confirmed (orange) | Date range, Batch (no progress stats, no links) | View details | ModerationDetailDialog (tentative variant) |
| 4 | **Completed - Gathering Feedback** | Payment pending, Gathering feedback | Date range, Batch | View details | ModerationDetailDialog (gathering variant) |
| 5 | **Completed - With Rating** | Payment processed, StarRatingNumeric | Date range, Batch, Rating (e.g. 4.5) | Feedback | ModerationDetailDialog (completed variant) |

**Total card states: 5**

---

### 2F. Capstone Project

**Used by:** Project Mentor

| # | Card State | Chips | Stats/Metrics on Card | Actions | Detail Drawer |
|---|---|---|---|---|---|
| 1 | **Confirmed** | Confirmed (green) | Date range (start -> presentation), Batch identifier | View details | CapstoneDetailDialog: group, domain, next session, contact |
| 2 | **Completed - Payment Pending** | Payment pending | Date range | Progress | CapstoneDetailDialog (payment pending variant) |
| 3 | **Completed - Payment Processed** | Payment processed | Date range | Progress | CapstoneDetailDialog (completed variant) |

**Total card states: 3**

**Key difference:** Capstones are **never rated** - no star rating in any completed state.

---

### 2G. CV Review

**Used by:** CV Review Mentor

| # | Card State | Chips | Stats/Metrics on Card | Actions | Detail Drawer |
|---|---|---|---|---|---|
| 1 | **Confirmed (Not Submitted)** | Confirmed (green) | Due date, Batch | Submit CV Review | CVReviewDetailDialog: LinkedIn, CV link, User Comments |
| 2 | **Confirmed (Already Submitted)** | Already submitted (green), Confirmed (green) | Date, Batch | View details | CVReviewDetailDialog (submitted variant) |
| 3 | **Completed** | Payment processed | Date, Batch | Reviewed CV | CVReviewDetailDialog (completed variant) |

**Total card states: 3**

**Key difference:** CV Reviews are **never rated** - no star rating, no feedback button. No gathering feedback state.

---

## 3. Card State Coverage Matrix

| Card State | Online Session | Residency | Career/Mock | CV Review | Evaluation | Moderation | Capstone |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Confirmed | Y | Y | Y | Y | Y | Y | Y |
| Combined - Confirmed | Y | Y | - | - | - | - | - |
| Scheduled | Y | Y | Y | - | Y | Y | - |
| Combined - Scheduled | Y | Y | - | - | - | - | - |
| Tentative | Y | - | - | - | Y | Y | - |
| Completed - Gathering Feedback | Y | Y | Y | - | Y | Y | - |
| Completed - Recording Processing | Y | - | - | - | - | - | - |
| Completed - No Feedback (30+ days) | Y | - | - | - | - | - | - |
| Completed - With Rating | Y | Y | Y | - | Y | Y | - |
| Combined - Completed (split cards) | Y | - | - | - | - | - | - |
| Confirmed - Already Submitted | - | - | - | Y | - | - | - |
| Completed - Payment Pending (no rating) | - | - | - | - | - | - | Y |
| Completed - Payment Processed (no rating) | - | - | - | Y | - | - | Y |
| **Total states** | **11** | **6** | **6** | **3** | **5** | **5** | **3** |

---

## 4. Missing States Analysis

### CV Review - Missing 6 states
| Missing State | Why |
|---|---|
| Scheduled (unconfirmed) | CV reviews go straight to Confirmed - no guru acceptance step |
| Tentative (planned) | No advance planning phase for CV reviews |
| Gathering Feedback | Learners don't rate CV reviews |
| No Feedback (30+ days) | N/A - no feedback mechanism |
| With Rating | CV reviews are never rated by learners |
| Combined sessions | CV reviews are always 1:1 |

### Capstone Project - Missing 7 states
| Missing State | Why |
|---|---|
| Scheduled (unconfirmed) | Capstones go straight to Confirmed |
| Tentative (planned) | No tentative phase for capstones |
| Combined sessions | Capstones are group-specific, not combined |
| Gathering Feedback | Capstones are never rated |
| No Feedback (30+ days) | N/A - no feedback mechanism |
| With Rating | Capstones are never rated by learners |
| Recording processing | No recordings for capstone mentoring |

### Career / Mock Interview - Missing 5 states
| Missing State | Reason / Gap? |
|---|---|
| Tentative (planned) | **Potential gap** - Career sessions could have a planned phase |
| Combined sessions | 1:1 sessions - N/A |
| No Feedback (30+ days) | **Potential gap** - What happens if a career session gets no feedback after 30 days? |
| Recording Processing | **Potential gap** - Career sessions have recordings; should show processing state |
| Combined - Completed | N/A - 1:1 sessions |

### Evaluation - Missing 5 states
| Missing State | Reason / Gap? |
|---|---|
| Combined sessions | Evaluations are per-assignment - N/A |
| No Feedback (30+ days) | **Potential gap** - What if no feedback after 30 days? |
| Recording Processing | N/A - No recordings for evaluations |
| Confirmed (Already Submitted) | N/A - Evaluations use SpeedGrader, not a submit action |
| Combined - Completed | N/A |

### Moderation - Missing 5 states
| Missing State | Reason / Gap? |
|---|---|
| Combined sessions | Moderations are per-DQ - N/A |
| No Feedback (30+ days) | **Potential gap** - What if no feedback after 30 days? |
| Recording Processing | N/A - No recordings for moderations |
| Confirmed (Already Submitted) | N/A |
| Combined - Completed | N/A |

### Residency - Missing 4 states
| Missing State | Reason / Gap? |
|---|---|
| Tentative (planned) | **Potential gap** - Residencies could have a tentative/planned phase like Online Sessions |
| No Feedback (30+ days) | **Potential gap** - What if a residency gets no feedback after 30 days? |
| Recording Processing | N/A - In-person, no recordings |
| Combined - Completed | **Potential gap** - Combined residencies exist for Confirmed/Scheduled but not for Completed |

---

## 5. Duplicates & Shared Components

### Identical Role Rendering
| Roles | Component(s) Rendered | Difference |
|---|---|---|
| Teacher & Course Mentor | `OnlineSessionCards` + `ResidencyCards` | **Order only** - Teacher shows Residency first, Course Mentor shows Online Event first |
| Teacher/Course Mentor & Industry Expert | `OnlineSessionCards` | Industry Expert gets **only** Online Event (no Residency) |

### Shared UI Components
| Component | Used By | Notes |
|---|---|---|
| `SessionCard` | Online Sessions, Residency, Career/Mock | Renders title, sessionType chip, batch, date, time, actions, status |
| `CardTitleRow` | Evaluation, Moderation, Capstone, CV Review | Simpler layout: title + chips row |
| `StarRatingNumeric` | All rated types | Numeric rating with star icon |
| `PlannedEventCard` | Online Sessions only | Tentative/planned events |
| `CombinedCompletedGroup` | Online Sessions only | Visual grouping for split completed cards |
| `ComponentSection` | All activity types | Wrapper with title + description |

### Shared Chip Constants
| Chip | Variable | Used By |
|---|---|---|
| Confirmed | `CHIP_CONFIRMED` | All except CV Review (uses it differently) |
| Payment pending | `CHIP_PAYMENT_PENDING` | All activity types |
| Payment processed | `CHIP_PAYMENT_PROCESSED` | All activity types |
| Gathering feedback | `CHIP_GATHERING` | Online, Residency, Career, Evaluation, Moderation |
| No feedback collected | `CHIP_NO_FEEDBACK` | Online Sessions only |
| To be confirmed | `CHIP_TO_BE_CONFIRMED` | Online Sessions, Evaluation, Moderation |
| Already submitted | `CHIP_ALREADY_SUBMITTED` | CV Review only |
| Scheduled | Inline chip | Evaluation, Moderation (inline, not constant) |

### Mock Interview Cross-Listing
- **Mock Interview - Confirmed (secondary facilitator)** appears under `OnlineSessionCards` (Teacher/Course Mentor/Industry Expert view)
- **Mock Interview - Confirmed** and **Mock - Completed** appear under `CareerMentorOnlineSessionCards` (Career Mentor view)
- The secondary facilitator variant is exclusive to the Online Session section

---

## 6. Summary

| Metric | Count |
|---|---|
| Total Guru roles | 8 |
| Unique activity component functions | 7 |
| Total card states (all activities combined) | 39 |
| Activity types with ratings | 5 (Online, Residency, Career/Mock, Evaluation, Moderation) |
| Activity types without ratings | 2 (CV Review, Capstone) |
| Activity types with combined sessions | 2 (Online Session, Residency) |
| Activity types with tentative state | 3 (Online Session, Evaluation, Moderation) |
| Activity types with recording | 3 (Online Session, Career/Mock - implied, Residency - no) |
| Roles sharing identical components | Teacher = Course Mentor (same components, different order) |
| Potential gaps identified | 10+ (see Section 4) |

### Detail Dialog Types
| Dialog | Activity Type | Variants |
|---|---|---|
| Session Details Drawer | Online, Residency, Career/Mock | Via Redux: `setSessionFocus` + `setOpenSessionDetails` |
| Completed Session Drawer | Online, Residency, Career/Mock | Via Redux: `setSessionFocus` + `setOpenCompletedSession` |
| `PlannedEventDetailDialog` | Online Sessions | Single variant (tentative) |
| `EvaluationDetailDialog` | Evaluation | confirmed, tentative, gathering, completed |
| `ModerationDetailDialog` | Moderation | confirmed, tentative, gathering, completed |
| `CapstoneDetailDialog` | Capstone | confirmed, paymentPending, completed |
| `CVReviewDetailDialog` | CV Review | confirmed, confirmed-submitted, completed |
