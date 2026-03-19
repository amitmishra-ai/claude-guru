Event Cards Components States

1. Residencies
*RESIDENCY — Fields, Links & Actions by State*

─────────────────────────────────────
*CONFIRMED (Upcoming)*
─────────────────────────────────────

*Fields shown*
• Date range (day + month/year) — always shown
• Course name — always shown
• Batch name — always shown
• City — always shown
• Program manager email — always shown
• Day-wise time slots (date label + start–end times, one row per day) — always shown
• "Combined session" section — shown only if multiple batches are merged into this session; shows each combined batch's course name, batch name, PM email, and its own day-wise slots

*Links*
• Course name → opens LMS course page (new tab)
• Map pin icon (next to city) → opens Google Maps for the venue (new tab)

*Actions*
• No buttons or modals on a confirmed residency card

─────────────────────────────────────
*TENTATIVE (Upcoming)*
─────────────────────────────────────

*Fields shown*
• Date range (day + month/year) — always shown
• Course name — plain text, always shown (no link unlike Confirmed)
• Batch name — always shown
• City — always shown
• Planner contact email — always shown (different from PM email shown in Confirmed)
• "To be confirmed" — always shown in place of time slots

*Links*
• Map pin icon (next to city) → opens Google Maps for the venue (new tab)

*Actions*
• No buttons or modals on a tentative residency card

─────────────────────────────────────
*COMPLETED*
─────────────────────────────────────

*Fields shown*
• Date range — always shown
• Course name — always shown
• Batch name — always shown
• PM contact email — always shown
• "Combined session" badge — shown only if it was a multi-batch combined session
• "secondary" badge — shown only if the guru was the secondary facilitator
• Star rating widget + numeric score (e.g. 4.2/5) — shown only once student feedback is collected
• _"Gathering feedback!"_ — shown only when no feedback has been collected yet
• _"Payment Processed, TXN ID: xxx"_ — shown only for part-time gurus, only after payment has been processed

*Links*
• Course name → opens LMS course page (new tab)

*Actions*
• *"Detailed Feedback"* button — shown only when a rating is available; not shown while "Gathering feedback!"
  → Opens a feedback drilldown (replaces current view) with:
     - Batch name + Course name
     - No. of feedback responses received (e.g. 54/63)
     - Avg. Course Rating — stars + "Course Rating: X/5"
     - Pie chart: rating distribution (5-star / 4-star / 3-and-below)
     - Bar chart: detailed rating breakdown
     - Student comments tabbed by rating:
         › 5 Star
         › 4 Star
         › 3 & below
     - Back button → returns to Completed list



2. Online Sessions - this includes Mentorship sessions, 1-1 career mentorship sessions, Mock Interviews. There will be differences in these three. Also, mentorship sessions can be combined
*ONLINE SESSION — Fields, Links & Actions by State*

─────────────────────────────────────
*CONFIRMED (Upcoming)*
─────────────────────────────────────

*Fields shown*
• Date — always shown
• "secondary" badge — shown only if the guru is the secondary facilitator
• Session type (e.g. Mentoring, Career Mentoring, Mock Interview) — always shown
• Topic — shown only if a topic has been configured for the session
• Program/Batch name — always shown
• Course name — shown only if a course is linked to the session
• Contact email — always shown
• Session time (start–end) — always shown
• Combined sessions section — shown only if multiple batches are merged; shows each batch's program name and contact emails

*Links*
• Course name → opens LMS course page (new tab)

*Actions*

• *"Join online session"* link
  → Opens the host meeting URL (Zoom or similar) in a new tab
  → Shown only for the primary facilitator (hidden for secondary)
  → Shown always once the session is scheduled; not gated on session start time

• *"Create/View Polls"* button
  → Opens the Zoom polls management page in a new tab
  → Shown only when polls are enabled for the session AND only for the primary facilitator

• *"Share Feedback"* link (comment icon)
  → Opens the mock interview feedback form in a new tab
  → Shown only for mock interview sessions, always visible once scheduled

• Participant count (group sessions)
  → Shown only if participant data is available (not "NA") and it is not a combined session
  → Clickable — opens a popover listing all enrolled participants

• *"View Details"* button (1:1 career sessions only)
  → Shown only for 1:1 career/mentoring sessions when career session data is present
  → Opens "Session Details" modal showing:
       - Student avatar
       - Student name
       - Designation + Company
       - Years of experience
       - Program name
       - Topic / "Need Guidance in"
       - Role interested in (shown only if filled)
       - Industry interested in (shown only if filled)
       - "Interested in evaluating" / Focus areas (shown only if filled)
       - Agenda
       - "View LinkedIn profile" link (shown only if LinkedIn URL is present)
       - "Download/view resume" link (shown only if resume URL is present)
       - *"Join online session"* button → opens meeting URL (new tab)
       - *"Give Feedback"* link → opens career session feedback form (new tab)
       - *"Cancel Session"* button → expands cancellation form within the modal (shown only if session is more than 15 minutes away)
            › Select cancellation reason(s) from checkboxes
            › Free-text comments field
            › "Cancel online session" submit button
            › "Undo" link to collapse the form

• Total participant count (combined sessions)
  → Shown only when combined_sessions_map has entries; shows aggregate count across all merged batches; not clickable

─────────────────────────────────────
*TENTATIVE (Upcoming)*
─────────────────────────────────────

*Fields shown*
• Date — always shown
• "secondary" badge — shown only if the guru is the secondary facilitator
• Session type — always shown
• Topic — shown only if configured
• Program/Batch name — always shown
• Course name — shown only if a course is linked
• Contact email — always shown
• "To be confirmed" — always shown in place of session time

*Links*
• No course link, no meeting link

*Actions*
• No buttons or modals on a tentative online session card

*Key differences from Confirmed*
• No session time shown
• No Join session link
• No Polls button
• No participant info
• No View Details button

─────────────────────────────────────
*COMPLETED*
─────────────────────────────────────

*Fields shown*
• Date — always shown
• "secondary" badge — shown only if the guru was the secondary facilitator
• Session type — always shown (shows "Mock Interview Session" for mock interviews)
• Topic — shown only if configured
• Program/Batch name — always shown
• Course name — always shown if linked
• Contact email — always shown
• "Combined session" badge — shown only if it was a combined multi-batch session
• Star rating widget + numeric score (e.g. 4.2/5) — shown only once student feedback has been collected
• _"Gathering feedback!"_ — shown when session is within 30 days and no rating yet
• _"No feedback collected"_ — shown when session is older than 30 days and no rating
• _"Payment Processed, TXN ID: xxx"_ — shown only for part-time gurus, only after payment is processed

*Links*
• Course name → opens LMS course page (new tab)
• *"Online Session Recording"* → opens session recording page (new tab)
  → Shown only after the recording has been processed and a recording URL is available; not shown immediately after session ends

*Actions*

• *"Share Feedback"* link (comment icon)
  → Opens mock interview feedback form in a new tab
  → Shown only for mock interview sessions where feedback has not yet been submitted
  → Disappears once feedback is submitted

• *"Detailed Feedback"* button
  → Shown only when a star rating is available (not shown during "Gathering feedback!" or "No feedback collected")
  → Opens feedback drilldown (replaces current view) showing:
       - Batch name + Session title
       - No. of feedback responses received
       - Avg. Session Rating — stars + "Session Rating: X/5"
       - Pie chart: rating distribution (5-star / 4-star / 3-and-below)
       - Bar chart: detailed rating breakdown
       - Student comments tabbed by rating:
           › 5 Star
           › 4 Star
           › 3 & below
       - Back button → returns to Completed list




3. Evaluator
*EVALUATION (Assignment) — Fields, Links & Actions by State*

─────────────────────────────────────
*CONFIRMED (Upcoming)*
─────────────────────────────────────

*Fields shown*
• Date range — always shown; displays as a day range spanning assessment due date to grading due date
• Tooltip on the date — always shown on hover; shows exact IST dates for:
    - Assessment due date
    - Grading due date
• "Assignment" label — always shown
• Late submission badge — shown only if the student submission was past the original deadline
• Course template name — always shown
• Batch name — always shown
• Contact (gurus_support@greatlearning.in) — always shown
• Student progress — loaded automatically when the page loads (async); a spinner is shown until data arrives

  _Student progress shows one of three states:_
  › "To be released to students" — shown if the assignment has not yet been published to students
  › # Submissions + # Graded — shown once assignment is published and active
  › "Reload" link — shown only if the progress fetch fails (allows manual retry)

*Links*
• "Assignment" label → opens the LMS assignment/SpeedGrader page (same tab)

*Actions*
• No buttons or modals on a confirmed evaluation card
• "Reload" link (appears only on progress fetch failure) → retriggers the async progress fetch

─────────────────────────────────────
*TENTATIVE (Upcoming)*
─────────────────────────────────────

*Fields shown*
• Date range — always shown (same assessment due → grading due range)
• Tooltip on the date — always shown on hover; same dates as Confirmed
• "Assignments" label — plain text, always shown (no link unlike Confirmed)
• Course name — plain text, always shown
• Batch name — always shown
• Contact (gurus_support@greatlearning.in) — always shown
• "To be confirmed" — always shown in place of student progress stats

*Links*
• No assignment link

*Actions*
• No buttons or modals on a tentative evaluation card

*Key differences from Confirmed*
• "Assignment" label is plain text (not a link)
• No student progress section
• "To be confirmed" shown instead of submission/grading counts

─────────────────────────────────────
*COMPLETED*
─────────────────────────────────────

*Fields shown*
• Date — always shown
• Tooltip on the date — always shown on hover; shows assessment due + grading due dates
• Assignment name — always shown
• Course template name — always shown
• Batch name — always shown
• Contact email — always shown
• Star rating (star icons only, no numeric score) — shown directly on the card when feedback has been collected
• _"Gathering feedback!"_ — shown when no feedback has been collected yet
• *"Detailed Feedback"* button — always shown alongside the star rating; not shown during "Gathering feedback!"
• _"Payment Processed, TXN ID: xxx"_ — shown only for part-time gurus, only after payment has been processed

*Links*
• Assignment name → opens LMS SpeedGrader page (new tab)

*Actions*
• *"Detailed Feedback"* button
  → Opens a feedback drilldown (replaces current view) showing:
       - Assignment title
       - Assignment name
       - Course name
       - Star rating out of 5
       - If rating < 5 stars:
           › Selected feedback option tags (e.g. "Content could be clearer")
           › Free-text comments from students
       - If rating = 5 stars:
           › Positive feedback aspect tags with tick icons
       - Back button → returns to Completed list

*Key difference from Residency & Online Session*
• Rating on the card shows star icons only — no numeric score (e.g. no "4.2/5")
• Rating and "Detailed Feedback" button are shown together always (not conditionally stacked like in residency)
• Feedback drilldown shows qualitative tags and comments, not charts or student comment threads




4. Moderator
*MODERATION (Discussion Question) — Fields, Links & Actions by State*

─────────────────────────────────────
*CONFIRMED (Upcoming)*
─────────────────────────────────────

*Fields shown*
• Date range — always shown; spans from moderation start date to concluding remark date
• Tooltip on the date — always shown on hover; shows exact IST dates for:
    - Moderation start date
    - Concluding remark date
    - Grading due date
• "Discussion Question" label — always shown
• Course template name — always shown
• Batch name — always shown
• Contact (gurus_support@greatlearning.in) — always shown
• Student response progress — loaded automatically when the page loads (async); a spinner is shown until data arrives
• Last active time — defined in the UI but currently always hidden; never populated

  _Student progress shows one of three states:_
  › "To be released to students" — shown if the discussion question has not yet been published to students
  › Live progress stats (once published and active):
      - # Posts — total discussion posts by students
      - # Posts Unread — posts not yet read by the guru
      - # Graded — students graded so far
      - Stats are shown in red if the guru has not posted a reply in the last 30 hours (indicating inactivity); green otherwise
  › "Reload" link — shown only if the progress fetch fails (allows manual retry)

*Links*
• "Discussion Question" label → opens the LMS assignment/SpeedGrader page (same tab)

*Actions*
• No buttons or modals on a confirmed moderation card
• "Reload" link (appears only on progress fetch failure) → retriggers the async progress fetch

*Key differences from Evaluation (Assignment)*
• Date range is moderation start → concluding remark (not assessment due → grading due)
• Tooltip shows 3 dates instead of 2 (adds concluding remark date)
• Progress stats are discussion-specific (Posts / Posts Unread / Graded) vs assignment-specific (Submissions / Graded)
• Progress stats show red/green activity indicator based on guru's last reply time
• "Last active time" field exists in template but is never shown

─────────────────────────────────────
*TENTATIVE (Upcoming)*
─────────────────────────────────────

*Fields shown*
• Date range — always shown (moderation start → grading due)
• Tooltip on the date — always shown on hover; same 3 dates as Confirmed
• "Discussion Question" label — plain text, always shown (no link unlike Confirmed)
• Course name — plain text, always shown
• Batch name — always shown
• Contact (gurus_support@greatlearning.in) — always shown
• "To be confirmed" — always shown in place of progress stats

*Links*
• No discussion question link

*Actions*
• No buttons or modals on a tentative moderation card

*Key differences from Confirmed*
• "Discussion Question" label is plain text (not a link)
• No progress section shown
• "To be confirmed" shown instead of posts/graded counts

─────────────────────────────────────
*COMPLETED*
─────────────────────────────────────

*Fields shown*
• Date — always shown
• Tooltip on the date — always shown on hover; shows moderation start + grading due dates
• Assignment name — always shown
• Course template name — always shown
• Batch name — always shown
• Contact email — always shown
• Star rating (star icons only, no numeric score) — shown directly on the card when feedback has been collected
• _"Gathering feedback!"_ — shown when no feedback has been collected yet
• *"Detailed Feedback"* button — shown alongside star rating; not shown during "Gathering feedback!"
• _"Payment Processed, TXN ID: xxx"_ — shown only for part-time gurus, only after payment is processed

*Links*
• Assignment name → opens LMS SpeedGrader page (new tab)

*Actions*
• *"Detailed Feedback"* button
  → Opens a feedback drilldown (replaces current view) showing:
       - Assignment title
       - Assignment name
       - Course name
       - Star rating out of 5
       - If rating < 5 stars:
           › Selected feedback option tags (e.g. "Moderation could be more thorough")
           › Free-text comments from students
       - If rating = 5 stars:
           › Positive feedback aspect tags with tick icons
       - Back button → returns to Completed list

*Note: Completed state is identical to Evaluation*
• Same card layout, same drilldown content
• Only difference is the activity type label (Discussion Question vs Assignment) and the SpeedGrader link target




5. Capstone project
*CAPSTONE PROJECT — Fields, Links & Actions by State*

─────────────────────────────────────
*CONFIRMED (Upcoming)*
─────────────────────────────────────

*Fields shown*
• Date range — always shown; spans project start date to presentation date
• Tooltip on the date — always shown on hover; shows milestone dates that have been configured:
    - Project start date
    - Synopsis date (shown only if set)
    - Interim report date (shown only if set)
    - Final report date (shown only if set)
    - Presentation date (shown only if set)
• "Capstone — [Batch Name]" label — always shown
• Group name — always shown
• Domain — always shown
• Next session — label "Next" + next scheduled session date; always shown
• Contact email — always shown

*Links*
• *"Group Details"* → opens the LMS discussion group page for the capstone group (new tab)

*Actions*
• *"View Student Progress"* link
  → Shown only when the old feedback format is enabled for this capstone (`is_old_feedback_enable`)
  → Hides the Confirmed and Tentative sections, shows a loading spinner
  → Loads student progress inline (replaces the current view) showing:
       - "Student Progress Feedback" heading
       - Batch name + Group name
       - One section per feedback checkpoint (only checkpoints that are 7+ days past their capture date):
           › Term name + "Report Preparation" + date (e.g. "Interim Report Preparation (15-03-2026)")
           › Making Progress: count (e.g. 8/12 students) + feedback option tags
           › Need Help: count (e.g. 4/12 students) + feedback option tags
           › Student comments tabbed by category:
               - "Making Progress" tab — positive student comments
               - "Need Help" tab — comments from students who need support
               - "No comments" shown if a tab has no content
       - If no checkpoint has passed yet: "No feedback yet. We will take the student progress feedback on [date]"
       - Back button → returns to the Upcoming tab

─────────────────────────────────────
*NO TENTATIVE STATE*
─────────────────────────────────────
Capstone projects do not appear in the Planned Events section.

─────────────────────────────────────
*COMPLETED*
─────────────────────────────────────

*Fields shown*
• Date — always shown with tooltip (same milestone dates as Confirmed)
• "Capstone — [Batch Name]" label — always shown
• Group name — always shown
• Domain — always shown
• Contact email — always shown
• No star rating — capstone activities do not collect a star rating
• _"Payment Processed, TXN ID: xxx"_ — shown only for part-time gurus, only after payment is processed

*Links*
• No course or activity link

*Actions*
• *"View Student Progress"* button
  → Always shown on completed capstone cards
  → Loads student progress inline via AJAX (replaces content in the Completed tab)
  → Shows the same student progress view as in Confirmed:
       - Batch name + Group name
       - Per-checkpoint breakdown: Making Progress / Need Help counts, feedback tags, student comments
       - "No feedback yet" message if no checkpoints have passed
  → Back button → returns to the Completed list




6. CV Review
*CV REVIEW — Fields, Links & Actions by State*
_(Visible only to gurus with the CV Review Mentor role)_

─────────────────────────────────────
*CONFIRMED (Upcoming)*
─────────────────────────────────────

*Fields shown*
• Due date (day + month/year) — always shown
• "CV Review" label — always shown
• Batch name — always shown
• "Due on: [full date]" — shown only when the review has not yet been submitted; hidden once submitted

*Links*
• *"View LinkedIn Profile"* → opens the student's LinkedIn profile (new tab)
  → Always shown; no condition on whether profile exists

• *"View CV"* → opens the student's resume/CV document (new tab)
  → Always shown

*Actions*

• *"View User Comments"* link
  → Always shown
  → Opens a modal titled "User Comments" showing:
       - The student's instructions or comments submitted with the CV review request
       - Plain text display, no actions inside the modal

• *"Submit CV Review"* button
  → Shown only when the review has not yet been submitted (workflow_state ≠ reviewed)
  → Replaced by "Already Submitted" text once the review has been submitted
  → On click: shows a browser confirmation dialog —
       _"Are you sure you want to Submit the review?"_
  → On confirm:
       - Marks the CV review as reviewed
       - Shows success message: "Submitted the CV review successfully"
       - Redirects back to the Guru Dashboard
  → On error:
       - Shows error message: "Sorry, something went wrong, please contact:"

─────────────────────────────────────
*NO TENTATIVE STATE*
─────────────────────────────────────
CV Review requests do not appear in the Planned Events section.

─────────────────────────────────────
*COMPLETED*
─────────────────────────────────────

*Fields shown*
• Due date (day + month/year) — always shown
• "CV Review" label — always shown
• Batch name — always shown
• Contact (gurus_support@greatlearning.in) — always shown
• No star rating — CV reviews do not collect student ratings
• No feedback button — no drilldown available
• _"Payment Processed, TXN ID: xxx"_ — shown only for part-time gurus when a payment record exists

*Links*
• *"View Reviewed CV"* → opens the student's resume/CV document (new tab)
  → Always shown

*Actions*
• No buttons, no drilldown, no modals on a completed CV review card

*Key differences from Confirmed state*
• "View LinkedIn Profile" link is no longer shown
• "View User Comments" is no longer shown
• Submit button is no longer shown
• "View CV" becomes "View Reviewed CV" (same document, different label)
• Contact email appears (not shown in Confirmed)