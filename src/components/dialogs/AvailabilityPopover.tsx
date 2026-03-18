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
import { setAvailPopoverBlockId } from "@/store/slices/uiSlice";
import { markAvailabilityRemoved } from "@/store/slices/availabilitySlice";
import { pushToast } from "@/store/slices/toastsSlice";
import { fmtTime12, fmtDateNice } from "@/lib/helpers";
import type { Block } from "@/lib/types";

/**
 * Popover shown when clicking an availability block on the calendar.
 * Displays slot details + Remove slot action with inline confirmation.
 */
export function AvailabilityPopover({
  anchorEl,
  blocks,
}: {
  anchorEl: HTMLElement | null;
  blocks: Block[];
}) {
  const dispatch = useAppDispatch();
  const blockId = useAppSelector((s) => s.ui.availPopoverBlockId);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const block = blocks.find((b) => b.id === blockId);
  const open = Boolean(anchorEl && block);

  const handleClose = () => {
    dispatch(setAvailPopoverBlockId(null));
    setConfirmRemove(false);
  };

  const handleRemove = () => {
    if (block) {
      dispatch(markAvailabilityRemoved(block.id));
      dispatch(
        pushToast({
          title: "Availability slot removed",
          description: `${fmtDateNice(block.dateYmd)} • ${fmtTime12(block.start)}–${fmtTime12(block.end)}`,
        })
      );
    }
    dispatch(setAvailPopoverBlockId(null));
    setConfirmRemove(false);
  };

  if (!block) return null;

  const sourceLabel =
    block.source === "pattern"
      ? "Recurring pattern"
      : block.source === "request"
      ? "From request"
      : "One-off slot";

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
            minWidth: 240,
            maxWidth: 300,
          },
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ color: 'success.main' }}>
          Available slot
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {sourceLabel}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.5 }}>
          <CalendarTodayOutlinedIcon sx={{ fontSize: 14, opacity: 0.6 }} />
          <Typography variant="body2" color="text.secondary">
            {fmtDateNice(block.dateYmd)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75 }}>
          <AccessTimeOutlinedIcon sx={{ fontSize: 14, opacity: 0.6 }} />
          <Typography variant="body2" color="text.secondary">
            {fmtTime12(block.start)} – {fmtTime12(block.end)}
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {!confirmRemove ? (
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => setConfirmRemove(true)}
            fullWidth
          >
            Remove slot
          </Button>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
              <WarningAmberOutlinedIcon sx={{ fontSize: 14, color: 'var(--gl-warning-icon)' }} />
              <Typography variant="body2" fontWeight={500}>
                Remove this slot?
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined" color="inherit" onClick={() => setConfirmRemove(false)} sx={{ flex: 1 }}>
                Keep
              </Button>
              <Button size="small" variant="contained" color="error" onClick={handleRemove} sx={{ flex: 1 }}>
                Remove
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Popover>
  );
}
