import { useEffect } from "react";
import { X } from "lucide-react";
import Box from "@mui/material/Box";
import { useAppSelector, useAppDispatch } from "@/store";
import { dismissToast } from "@/store/slices/toastsSlice";

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
    <Box
      sx={{
        pointerEvents: "none",
        position: "fixed",
        left: { xs: "50%", md: "276px" },
        top: { xs: 16, md: "auto" },
        bottom: { xs: "auto", md: 16 },
        transform: { xs: "translateX(-50%)", md: "none" },
        zIndex: 50,
      }}
    >
      <Box sx={{ width: "min(24rem, calc(100vw - 2rem))", display: "flex", flexDirection: "column", gap: 1 }}>
        {toasts.map((t) => (
          <Box
            key={t.id}
            role="status"
            aria-live="polite"
            sx={{
              pointerEvents: "auto",
              borderRadius: "12px",
              border: 1,
              borderColor: t.variant === "destructive" ? "var(--gl-status-declined-border)" : "divider",
              backgroundColor: t.variant === "destructive" ? "var(--gl-status-declined-bg)" : "hsl(var(--md-surface))",
              px: 2,
              py: 1.5,
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5 }}>
              <Box sx={{ minWidth: 0 }}>
                <Box
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: t.titleTone === "danger" ? "var(--gl-status-declined-text)" : undefined,
                  }}
                >
                  {t.title}
                </Box>
                {t.description && (
                  <Box sx={{ mt: 0.5, fontSize: "0.875rem", color: "hsl(var(--md-on-surface-variant))" }}>
                    {t.description}
                  </Box>
                )}
              </Box>
              <Box
                component="button"
                type="button"
                onClick={() => dispatch(dismissToast(t.id))}
                aria-label="Dismiss"
                sx={{
                  pointerEvents: "auto",
                  display: "grid",
                  height: 32,
                  width: 32,
                  placeItems: "center",
                  borderRadius: "12px",
                  border: 1,
                  borderColor: "divider",
                  backgroundColor: "hsl(var(--md-surface))",
                  color: "hsl(var(--md-on-surface-variant))",
                  cursor: "pointer",
                  flexShrink: 0,
                  "&:hover": { backgroundColor: "hsl(var(--md-surface-container))" },
                }}
              >
                <X style={{ width: 16, height: 16 }} />
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
