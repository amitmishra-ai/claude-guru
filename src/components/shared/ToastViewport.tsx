import { useEffect } from "react";
import { X } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store";
import { dismissToast } from "@/store/slices/toastsSlice";
import { classNames } from "@/lib/helpers";

export function ToastViewport() {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((s) => s.toasts.items);

  // Auto-dismiss after 3.5 seconds
  useEffect(() => {
    if (!toasts.length) return;
    const latest = toasts[toasts.length - 1];
    const timer = window.setTimeout(() => {
      dispatch(dismissToast(latest.id));
    }, 3500);
    return () => clearTimeout(timer);
  }, [toasts, dispatch]);

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2 md:top-auto md:bottom-4 md:left-[276px] md:translate-x-0">
      <div className="flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={classNames(
              "pointer-events-auto rounded-card border bg-surface px-4 py-3 shadow-lg",
              t.variant === "destructive" && "border-status-declined-border bg-status-declined-bg"
            )}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className={classNames("text-sm font-semibold", t.titleTone === "danger" && "text-status-declined-text")}>
                  {t.title}
                </div>
                {t.description && (
                  <div className="mt-1 text-sm text-on-surface-variant">{t.description}</div>
                )}
              </div>
              <button
                type="button"
                className="pointer-events-auto grid h-8 w-8 place-items-center rounded-xl border bg-surface text-on-surface-variant hover:bg-surface-container"
                onClick={() => dispatch(dismissToast(t.id))}
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
