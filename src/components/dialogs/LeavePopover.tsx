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
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      transformOrigin={{ vertical: "top", horizontal: "center" }}
      slotProps={{
        paper: {
          sx: {
            minWidth: 280,
            maxWidth: 340,
            borderRadius: 1,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
            border: "1px solid",
            borderColor: "divider",
            mt: 1,
          },
        },
      }}
    >
      <Box sx={{ p: 2.5 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.9rem" }}>
            {na.reason || "Leave"}
          </Typography>
          {isMultiDay && (
            <Typography variant="caption" sx={{ fontSize: "0.68rem", fontWeight: 600, color: "text.disabled", bgcolor: "action.hover", px: 1, py: 0.25, borderRadius: 1 }}>
              {groupBlocks.length} days
            </Typography>
          )}
        </Box>

        {/* Schedule card */}
        <Box sx={{ p: 1.5, borderRadius: "8px", bgcolor: "action.hover", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
            <Typography variant="body2" sx={{ fontSize: "0.82rem", fontWeight: 500 }}>
              {isMultiDay
                ? `${fmtDateNice(groupBlocks[0].dateYmd)} – ${fmtDateNice(groupBlocks[groupBlocks.length - 1].dateYmd)}`
                : fmtDateNice(na.dateYmd)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccessTimeOutlinedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
            <Typography variant="body2" sx={{ fontSize: "0.82rem", fontWeight: 500 }}>
              {fmtTime12(na.start)} – {fmtTime12(na.end)}
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        {!confirmCancel ? (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button size="small" variant="soft" onClick={handleEdit} sx={{ flex: 1, textTransform: "none", fontSize: "0.8rem" }}>
              Edit
            </Button>
            <Button size="small" variant="outlined" color="error" onClick={() => setConfirmCancel(true)} sx={{ flex: 1, textTransform: "none", fontSize: "0.8rem" }}>
              Cancel leave
            </Button>
          </Box>
        ) : (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.5, px: 1.5, py: 1, borderRadius: "8px", bgcolor: "var(--gl-status-declined-bg)" }}>
              <WarningAmberOutlinedIcon sx={{ fontSize: 14, color: "var(--gl-status-declined-text)" }} />
              <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.82rem", color: "var(--gl-status-declined-text)" }}>
                Remove this leave?
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button size="small" variant="soft" onClick={() => setConfirmCancel(false)} sx={{ flex: 1, textTransform: "none", fontSize: "0.8rem" }}>
                Keep
              </Button>
              <Button size="small" variant="contained" color="error" onClick={handleCancelLeave} sx={{ flex: 1, textTransform: "none", fontSize: "0.8rem" }}>
                Yes, remove
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Popover>
  );
}
