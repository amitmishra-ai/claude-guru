import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useAppSelector, useAppDispatch } from "@/store";
import { setOpenAddAvailability } from "@/store/slices/uiSlice";
import { addOneOffAvail } from "@/store/slices/availabilitySlice";
import { pushToast } from "@/store/slices/toastsSlice";
import { timeOptions12 } from "@/lib/constants";
import { parseHHMM, fmtTime12, fmtDateNice } from "@/lib/helpers";

/**
 * Simple modal to add a one-off availability slot.
 * Date picker + start/end time + optional label.
 */
export function AddAvailabilityModal() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.openAddAvailability);

  const today = new Date();
  const todayYmd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [date, setDate] = useState(todayYmd);
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("12:00");

  const isValid = date && parseHHMM(end) > parseHHMM(start);

  const handleClose = () => {
    dispatch(setOpenAddAvailability(false));
    setDate(todayYmd);
    setStart("10:00");
    setEnd("12:00");
  };

  const handleAdd = () => {
    const startMins = parseHHMM(start);
    const endMins = parseHHMM(end);

    dispatch(
      addOneOffAvail({
        id: `avail-${Date.now()}`,
        dateYmd: date,
        start: startMins,
        end: endMins,
        source: "pattern" as const,
      })
    );

    dispatch(
      pushToast({
        title: "Availability added",
        description: `${fmtDateNice(date)} • ${fmtTime12(startMins)}–${fmtTime12(endMins)}`,
      })
    );

    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Add availability</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Box sx={{ border: 1, borderColor: 'divider', bgcolor: 'action.hover', p: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              Add a one-off time slot when you are available for sessions.
            </Typography>
          </Box>

          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            size="small"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Start time</InputLabel>
              <Select
                label="Start time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              >
                {timeOptions12.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>End time</InputLabel>
              <Select
                label="End time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              >
                {timeOptions12.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {date && !isValid && (
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              End time must be after start time.
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button variant="text" color="inherit" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleAdd} disabled={!isValid}>
          Add slot
        </Button>
      </DialogActions>
    </Dialog>
  );
}
