import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DoneAllOutlinedIcon from "@mui/icons-material/DoneAllOutlined";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAppSelector, useAppDispatch } from "@/store";
import { markRead, markAllRead } from "@/store/slices/notificationsSlice";
import { setOpenSession, setOpenAvailability } from "@/store/slices/uiSlice";
import { pushToast } from "@/store/slices/toastsSlice";
import { dateTimeMs } from "@/lib/helpers";
import { demoNow } from "@/lib/constants";
import type { NotificationItem } from "@/lib/types";

function executeCtaAction(action: string, navigate: (path: string) => void, dispatch: any) {
  switch (action) {
    case "openSession":
      dispatch(setOpenSession(true));
      break;
    case "openAvailability":
      dispatch(setOpenAvailability(true));
      break;
    case "goCalendar":
      navigate("/calendar");
      break;
    case "goAvailability":
      navigate("/availability");
      break;
    case "goCourses":
      navigate("/courses");
      break;
    case "goPreferences":
      navigate("/preferences");
      break;
    case "joinSession":
      dispatch(pushToast({ title: "Joining session", description: "Launching session link..." }));
      break;
    default:
      break;
  }
}

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const notifications = useAppSelector((s) => s.notifications.items);

  const nowMs = demoNow.getTime();

  const isHappeningNowActive = (n: NotificationItem) =>
    n.happeningNow &&
    !!n.sessionDateYmd &&
    typeof n.sessionEnd === "number" &&
    dateTimeMs(n.sessionDateYmd, n.sessionEnd) > nowMs;

  const sorted = useMemo(
    () => [...notifications].sort((a, b) => b.createdAtYmd.localeCompare(a.createdAtYmd)),
    [notifications]
  );

  const happeningNow = sorted.filter(isHappeningNowActive);
  const unread = sorted.filter((n) => !n.read && !isHappeningNowActive(n));
  const read = sorted.filter((n) => n.read && !isHappeningNowActive(n));

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderItem = (n: NotificationItem) => (
    <Card
      key={n.id}
      sx={!n.read ? { borderColor: "var(--gl-unread-border)", backgroundColor: "var(--gl-unread-bg)" } : {}}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5 }}>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {!n.read && (
                <Box
                  component="span"
                  sx={{ height: 8, width: 8, flexShrink: 0, borderRadius: "50%", backgroundColor: "var(--gl-badge-bg)" }}
                />
              )}
              <Box sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{n.title}</Box>
            </Box>
            <Box sx={{ mt: 0.5, fontSize: "0.75rem", color: "hsl(var(--md-on-surface-variant))" }}>{n.body}</Box>
          </Box>
          {n.ctaLabel && n.ctaAction && (
            <Button
              variant="text"
              size="small"
              sx={{ flexShrink: 0, borderRadius: "4px", fontSize: "0.75rem" }}
              onClick={() => {
                dispatch(markRead(n.id));
                executeCtaAction(n.ctaAction!, navigate, dispatch);
              }}
            >
              {n.ctaLabel}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5 }}>
        <PageHeader icon={NotificationsIcon} title="Alerts" subtitle="Notifications and action items." />
        {unreadCount > 0 && (
          <Button
            variant="text"
            size="small"
            startIcon={<DoneAllOutlinedIcon sx={{ fontSize: 14 }} />}
            sx={{ borderRadius: "4px", fontSize: "0.75rem", flexShrink: 0 }}
            onClick={() => dispatch(markAllRead())}
          >
            Mark all read
          </Button>
        )}
      </Box>

      {happeningNow.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Box sx={{ fontSize: "0.75rem", fontWeight: 600, color: "hsl(var(--md-on-surface-variant))", mb: 1 }}>Happening now</Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>{happeningNow.map(renderItem)}</Box>
        </Box>
      )}

      {unread.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Box sx={{ fontSize: "0.75rem", fontWeight: 600, color: "hsl(var(--md-on-surface-variant))", mb: 1 }}>Unread ({unread.length})</Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>{unread.map(renderItem)}</Box>
        </Box>
      )}

      {read.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Box sx={{ fontSize: "0.75rem", fontWeight: 600, color: "hsl(var(--md-on-surface-variant))", mb: 1 }}>Earlier</Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>{read.map(renderItem)}</Box>
        </Box>
      )}

      {!notifications.length && (
        <Box
          sx={{
            mt: 2,
            borderRadius: "16px",
            border: 1,
            borderColor: "divider",
            backgroundColor: "hsl(var(--md-surface-container) / 0.2)",
            px: 2,
            py: 4,
            textAlign: "center",
            fontSize: "0.875rem",
            color: "hsl(var(--md-on-surface-variant))",
          }}
        >
          No notifications yet.
        </Box>
      )}
    </>
  );
}
