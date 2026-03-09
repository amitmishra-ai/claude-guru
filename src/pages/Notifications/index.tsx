import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
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
      className={!n.read ? "!border-unread-border !bg-unread-bg" : ""}
    >
      <CardContent sx={{ p: 2 }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-badge" />}
              <div className="text-sm font-semibold">{n.title}</div>
            </div>
            <div className="mt-1 text-xs text-on-surface-variant">{n.body}</div>
          </div>
          {n.ctaLabel && n.ctaAction && (
            <Button
              variant="text"
              size="small"
              sx={{ flexShrink: 0, borderRadius: '4px', fontSize: '0.75rem' }}
              onClick={() => {
                dispatch(markRead(n.id));
                executeCtaAction(n.ctaAction!, navigate, dispatch);
              }}
            >
              {n.ctaLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <PageHeader icon={Bell} title="Alerts" subtitle="Notifications and action items." />
        {unreadCount > 0 && (
          <Button
            variant="text"
            size="small"
            startIcon={<CheckCheck className="h-3.5 w-3.5" />}
            sx={{ borderRadius: '4px', fontSize: '0.75rem', flexShrink: 0 }}
            onClick={() => dispatch(markAllRead())}
          >
            Mark all read
          </Button>
        )}
      </div>

      {happeningNow.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-semibold text-on-surface-variant mb-2">Happening now</div>
          <div className="space-y-2">{happeningNow.map(renderItem)}</div>
        </div>
      )}

      {unread.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-semibold text-on-surface-variant mb-2">Unread ({unread.length})</div>
          <div className="space-y-2">{unread.map(renderItem)}</div>
        </div>
      )}

      {read.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-semibold text-on-surface-variant mb-2">Earlier</div>
          <div className="space-y-2">{read.map(renderItem)}</div>
        </div>
      )}

      {!notifications.length && (
        <div className="mt-4 rounded-2xl border bg-surface-container/20 px-4 py-8 text-center text-sm text-on-surface-variant">
          No notifications yet.
        </div>
      )}
    </>
  );
}
