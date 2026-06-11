import { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import { timeOptions12 } from "@/lib/constants";
import { parseHHMM, fmtTime12 } from "@/lib/helpers";

/** A single availability slot (generic — no role). Times are "HH:MM". */
export type AvailSlot = { id: string; dateYmd: string; start: string; end: string };

const BLUE = "#196ae5";
const BORDER = "#e2e6eb";
const TEXT = "#1f2733";
const MUTED = "#5b6573";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const pad2 = (n: number) => String(n).padStart(2, "0");
const toYmd = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

type Cell = { date: Date; ymd: string; day: number; inMonth: boolean };

/** Build the Sunday-first weeks covering the given month. */
function buildWeeks(year: number, monthIndex: number): Cell[][] {
  const first = new Date(year, monthIndex, 1);
  const startOffset = first.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const cells: Cell[] = [];
  for (let i = 0; i < totalCells; i++) {
    const date = new Date(year, monthIndex, 1 - startOffset + i);
    cells.push({ date, ymd: toYmd(date), day: date.getDate(), inMonth: date.getMonth() === monthIndex });
  }
  const weeks: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

const fmtSlot = (s: AvailSlot) => `${fmtTime12(parseHHMM(s.start))} – ${fmtTime12(parseHHMM(s.end))}`;
const fmtDayHeading = (ymd: string) => {
  const d = new Date(`${ymd}T00:00:00`);
  return `${DOW[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
};

export default function AvailabilityCalendar({
  year,
  monthIndex,
  slots,
  onPrev,
  onNext,
  onAddSlot,
  onRemoveSlot,
}: {
  year: number;
  monthIndex: number;
  slots: AvailSlot[];
  onPrev: () => void;
  onNext: () => void;
  onAddSlot: (dateYmd: string, start: string, end: string) => void;
  onRemoveSlot: (id: string) => void;
}) {
  const weeks = buildWeeks(year, monthIndex);

  // Quick-add popover state
  const [addAnchor, setAddAnchor] = useState<HTMLElement | null>(null);
  const [addYmd, setAddYmd] = useState<string>("");
  const [qaStart, setQaStart] = useState("10:00");
  const [qaEnd, setQaEnd] = useState("12:00");

  // Remove popover state
  const [removeAnchor, setRemoveAnchor] = useState<HTMLElement | null>(null);
  const [removeSlot, setRemoveSlot] = useState<AvailSlot | null>(null);

  const slotsByDate = slots.reduce<Record<string, AvailSlot[]>>((acc, s) => {
    (acc[s.dateYmd] ||= []).push(s);
    return acc;
  }, {});

  const openAdd = (el: HTMLElement, ymd: string) => {
    setAddYmd(ymd);
    setQaStart("10:00");
    setQaEnd("12:00");
    setAddAnchor(el);
  };
  const confirmAdd = () => {
    onAddSlot(addYmd, qaStart, qaEnd);
    setAddAnchor(null);
  };
  const addInvalid = parseHHMM(qaEnd) <= parseHHMM(qaStart);

  return (
    <>
      {/* Legend + month nav */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.75 }}>
        <Stack direction="row" spacing={2.5}>
          <Stack direction="row" spacing={0.9} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#9c52d6" }} />
            <Typography sx={{ fontSize: 13 }}>Career Mentor</Typography>
          </Stack>
          <Stack direction="row" spacing={0.9} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#19b899" }} />
            <Typography sx={{ fontSize: 13 }}>Course Mentor</Typography>
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" sx={{ border: `1px solid ${BORDER}`, borderRadius: "4px" }}>
          <IconButton size="small" sx={{ borderRadius: 0 }} onClick={onPrev}>
            <ChevronLeftIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography sx={{ fontSize: 14, px: 1.25, minWidth: 78, textAlign: "center" }}>
            {MONTHS[monthIndex]} {year}
          </Typography>
          <IconButton size="small" sx={{ borderRadius: 0 }} onClick={onNext}>
            <ChevronRightIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>
      </Stack>

      <Typography sx={{ fontSize: 13, color: TEXT, mt: 1.75 }}>
        Note: Time slots in the calendar are in IST timezone.
      </Typography>

      {/* Month grid */}
      <Box sx={{ mt: 1.75, border: `1px solid ${BORDER}`, borderRadius: "4px", overflow: "hidden" }}>
        {/* DOW header */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", bgcolor: "#f4f5f7" }}>
          {DOW.map((d) => (
            <Box
              key={d}
              sx={{
                py: 1.25,
                textAlign: "center",
                fontSize: 13,
                color: TEXT,
                borderRight: `1px solid ${BORDER}`,
                "&:last-of-type": { borderRight: "none" },
              }}
            >
              {d}
            </Box>
          ))}
        </Box>
        {/* Week rows */}
        {weeks.map((week, wi) => (
          <Box key={wi} sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderTop: `1px solid ${BORDER}` }}>
            {week.map((cell) => {
              const daySlots = slotsByDate[cell.ymd] ?? [];
              return (
                <Box
                  key={cell.ymd}
                  onClick={(e) => cell.inMonth && openAdd(e.currentTarget, cell.ymd)}
                  sx={{
                    height: 118,
                    p: 0.9,
                    borderRight: `1px solid ${BORDER}`,
                    "&:last-of-type": { borderRight: "none" },
                    bgcolor: cell.inMonth ? "#fff" : "#fafbfc",
                    cursor: cell.inMonth ? "pointer" : "default",
                    transition: "background-color 0.12s",
                    "&:hover": cell.inMonth ? { bgcolor: "#f7faff", "& .cell-add": { opacity: 1 } } : undefined,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography sx={{ fontSize: 13, color: cell.inMonth ? TEXT : "#9aa3af" }}>
                      {cell.day}
                    </Typography>
                    {cell.inMonth && (
                      <AddOutlinedIcon
                        className="cell-add"
                        sx={{ fontSize: 14, color: MUTED, opacity: 0, transition: "opacity 0.12s" }}
                      />
                    )}
                  </Stack>

                  <Stack spacing={0.4} sx={{ mt: 0.5, minHeight: 0, overflow: "hidden" }}>
                    {daySlots.slice(0, 2).map((s) => (
                      <Box
                        key={s.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setRemoveSlot(s);
                          setRemoveAnchor(e.currentTarget);
                        }}
                        sx={{
                          fontSize: 11,
                          lineHeight: 1.3,
                          bgcolor: "#e7f0ff",
                          color: BLUE,
                          border: `1px solid ${BLUE}33`,
                          borderRadius: "4px",
                          px: 0.6,
                          py: 0.25,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          "&:hover": { bgcolor: "#d7e6ff" },
                        }}
                      >
                        {fmtSlot(s)}
                      </Box>
                    ))}
                    {daySlots.length > 2 && (
                      <Typography sx={{ fontSize: 11, color: MUTED, pl: 0.3 }}>
                        +{daySlots.length - 2} more
                      </Typography>
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>

      {/* Quick-add popover */}
      <Popover
        open={!!addAnchor}
        anchorEl={addAnchor}
        onClose={() => setAddAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        slotProps={{ paper: { sx: { borderRadius: "4px", p: 2, width: 240 } } }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: TEXT, mb: 1.5 }}>
          Add availability · {addYmd && fmtDayHeading(addYmd)}
        </Typography>
        <Stack spacing={1.75} sx={{ mb: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>From</InputLabel>
            <Select label="From" value={qaStart} onChange={(e) => setQaStart(e.target.value)}
              MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}>
              {timeOptions12.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>To</InputLabel>
            <Select label="To" value={qaEnd} onChange={(e) => setQaEnd(e.target.value)}
              MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}>
              {timeOptions12.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button size="small" color="inherit" onClick={() => setAddAnchor(null)} sx={{ textTransform: "uppercase", fontSize: 12 }}>
            Cancel
          </Button>
          <Button size="small" variant="contained" disableElevation disabled={addInvalid} onClick={confirmAdd}
            sx={{ textTransform: "uppercase", fontSize: 12, bgcolor: BLUE }}>
            Add
          </Button>
        </Stack>
      </Popover>

      {/* Remove popover */}
      <Popover
        open={!!removeAnchor}
        anchorEl={removeAnchor}
        onClose={() => setRemoveAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        slotProps={{ paper: { sx: { borderRadius: "4px", p: 1.5, minWidth: 200 } } }}
      >
        {removeSlot && (
          <>
            <Typography sx={{ fontSize: 12, color: MUTED }}>{fmtDayHeading(removeSlot.dateYmd)}</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: TEXT, mb: 1 }}>{fmtSlot(removeSlot)}</Typography>
            <Button
              size="small"
              color="error"
              startIcon={<DeleteOutlineIcon sx={{ fontSize: 16 }} />}
              onClick={() => {
                onRemoveSlot(removeSlot.id);
                setRemoveAnchor(null);
              }}
              sx={{ textTransform: "uppercase", fontSize: 12 }}
            >
              Remove
            </Button>
          </>
        )}
      </Popover>
    </>
  );
}
