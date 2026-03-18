import { useState } from "react";
import Popover from "@mui/material/Popover";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  setLeavePopoverNaId,
  setOpenNotAvailable,
} from "@/store/slices/uiSlice";
import {
  setEditingLeaveGroupId,
  removeUnavailableByGroupId,
} from "@/store/slices/availabilitySlice";
import { pushToast } from "@/store/slices/toastsSlice";
import { fmtTime12, fmtDateNice } from "@/lib/helpers";

/**
 * Popover shown when clicking a leave (NA) block on the calendar.
 * Displays leave details + Edit / Cancel leave actions.
 */
export function LeavePopover({
  anchorEl,
}: {
  anchorEl: HTMLElement | null;
}) {
  const dispatch = useAppDispatch();
  const naId = useAppSelector((s) => s.ui.leavePopoverNaId);
  const unavailable = useAppSelector((s) => s.availability.unavailable);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const na = unavailable.find((n) => n.id === naId);

  // Gather grouped leave blocks if groupId exists
  const groupBlocks = na?.groupId
    ? unavailable.filter((n) => n.groupId === na.groupId).sort((a, b) => a.dateYmd.localeCompare(b.dateYmd))
    : na
    ? [na]
    : [];

  const open = Boolean(anchorEl && na);

  const handleClose = () => {
    dispatch(setLeavePopoverNaId(null));
    setConfirmCancel(false);
  };

  const handleEdit = () => {
    if (na?.groupId) {
      dispatch(setEditingLeaveGroupId(na.groupId));
    }
    dispatch(setLeavePopoverNaId(null));
    dispatch(setOpenNotAvailable(true));
    setConfirmCancel(false);
  };

  const handleCancelLeave = () => {
    if (na?.groupId) {
      dispatch(removeUnavailableByGroupId(na.groupId));
    }
    dispatch(
      pushToast({
        title: "Leave cancelled",
        description: `${groupBlocks.length} day(s) of leave removed`,
      })
    );
    dispatch(setLeavePopoverNaId(null));
    setConfirmCancel(false);
  };

  if (!na) return null;

  const isMultiDay = groupBlocks.length > 1;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      slotProps={{
        paper: {
          sx: {
            minWidth: 260,
            maxWidth: 320,
          },
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          {na.reason || "Leave"}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.5 }}>
          <CalendarTodayOutlinedIcon sx={{ fontSize: 14, opacity: 0.6 }} />
          <Typography variant="body2" color="text.secondary">
            {isMultiDay
              ? `${fmtDateNice(groupBlocks[0].dateYmd)} – ${fmtDateNice(groupBlocks[groupBlocks.length - 1].dateYmd)}`
              : fmtDateNice(na.dateYmd)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75 }}>
          <AccessTimeOutlinedIcon sx={{ fontSize: 14, opacity: 0.6 }} />
          <Typography variant="body2" color="text.secondary">
            {fmtTime12(na.start)} – {fmtTime12(na.end)}
          </Typography>
        </Box>

        {isMultiDay && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
            {groupBlocks.length} days
          </Typography>
        )}

        <Divider sx={{ my: 1.5 }} />

        {!confirmCancel ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" variant="outlined" color="inherit" onClick={handleEdit} sx={{ flex: 1 }}>
              Edit
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => setConfirmCancel(true)}
              sx={{ flex: 1 }}
            >
              Cancel leave
            </Button>
          </Box>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
              <WarningAmberOutlinedIcon sx={{ fontSize: 14, color: 'var(--gl-warning-icon)' }} />
              <Typography variant="body2" fontWeight={500}>
                Cancel this leave?
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined" color="inherit" onClick={() => setConfirmCancel(false)} sx={{ flex: 1 }}>
                Keep
              </Button>
              <Button size="small" variant="contained" color="error" onClick={handleCancelLeave} sx={{ flex: 1 }}>
                Yes, cancel
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Popover>
  );
}
