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

export function getActivityStats(
  session: { id: string; sessionType: string } | null | undefined,
  opts: { completed?: boolean } = {},
): ActivityStat[] | undefined {
  if (!session) return undefined;
  const { id, sessionType } = session;
  const completed = !!opts.completed;

  if (sessionType === "Evaluation") {
    const known = EVAL_DATA[id];
    const submissions = known?.submissions ?? (completed ? 12 : 0);
    const graded = completed ? submissions : (known?.graded ?? 0);
    return [
      { label: "Submissions", value: submissions },
      { label: "Graded", value: graded },
    ];
  }

  if (sessionType === "Moderation") {
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
