/* ════════════════════════════════════════════════════════════════════════
   Activity progress stats — Evaluation & Moderation
   ────────────────────────────────────────────────────────────────────────
   Single source of truth for the grading-progress numbers shown on
   Evaluation / Moderation activity cards AND in the Activity Details drawer,
   so the card and its drawer never drift.

   Live data doesn't carry these yet, so values are mocked per known demo id
   with state-aware fallbacks:
     • Evaluation → Submissions · Graded
     • Moderation → Posts · Posts unread · Graded
   When the activity is completed, everything is treated as fully graded.
   ════════════════════════════════════════════════════════════════════════ */

export type ActivityStat = { label: string; value: number };

/** Per-id mock data for in-progress (confirmed, not yet completed) activities. */
const EVAL_DATA: Record<string, { submissions: number; graded: number }> = {
  eval3: { submissions: 12, graded: 6 },
  eval5: { submissions: 34, graded: 20 },
};

const MOD_DATA: Record<string, { posts: number; unread: number; graded: number }> = {
  mod3: { posts: 18, unread: 4, graded: 2 },
};

/* Overdue activities — the due date passed before grading finished, so they
   stay partially graded (graded < submissions / posts). Drives the figures
   shown in the pinned "Overdue" section of the Completed tab. */
const EVAL_OVERDUE_DATA: Record<string, { submissions: number; graded: number }> = {
  eval6: { submissions: 26, graded: 18 },
  eval7: { submissions: 15, graded: 9 },
};

const MOD_OVERDUE_DATA: Record<string, { posts: number; unread: number; graded: number }> = {
  mod5: { posts: 20, unread: 6, graded: 11 },
};

export function getActivityStats(
  session: { id: string; sessionType: string } | null | undefined,
  opts: { completed?: boolean; overdue?: boolean } = {},
): ActivityStat[] | undefined {
  if (!session) return undefined;
  const { id, sessionType } = session;
  const completed = !!opts.completed;
  const overdue = !!opts.overdue;

  if (sessionType === "Evaluation") {
    if (overdue) {
      const o = EVAL_OVERDUE_DATA[id] ?? { submissions: 20, graded: 12 };
      return [
        { label: "Submissions", value: o.submissions },
        { label: "Graded", value: o.graded },
      ];
    }
    const known = EVAL_DATA[id];
    const submissions = known?.submissions ?? (completed ? 12 : 0);
    const graded = completed ? submissions : (known?.graded ?? 0);
    return [
      { label: "Submissions", value: submissions },
      { label: "Graded", value: graded },
    ];
  }

  if (sessionType === "Moderation") {
    if (overdue) {
      const o = MOD_OVERDUE_DATA[id] ?? { posts: 18, unread: 5, graded: 10 };
      return [
        { label: "Posts", value: o.posts },
        { label: "Posts unread", value: o.unread },
        { label: "Graded", value: o.graded },
      ];
    }
    const known = MOD_DATA[id];
    const posts = known?.posts ?? (completed ? 18 : 0);
    const unread = completed ? 0 : (known?.unread ?? 0);
    const graded = completed ? posts : (known?.graded ?? 0);
    return [
      { label: "Posts", value: posts },
      { label: "Posts unread", value: unread },
      { label: "Graded", value: graded },
    ];
  }

  return undefined;
}
