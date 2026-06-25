import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import type { AvailRole } from "@/lib/types";
import { availRoleVisual } from "@/lib/role-config";

const OPTIONS: { value: AvailRole; label: string }[] = [
  { value: "course", label: "Course mentorship" },
  { value: "career", label: "Career mentorship" },
  { value: "both", label: "Both" },
];

/**
 * Dropdown to tag an availability slot to a role (Course / Career / Both) for the
 * combined "Career + Course Mentor" role. Long labels ellipsize so the control
 * never widens its container.
 */
export function AvailRoleSelect({
  value,
  onChange,
  label = "Available for",
}: {
  value: AvailRole;
  onChange: (v: AvailRole) => void;
  label?: string;
}) {
  return (
    <Box>
      {label && (
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary", mb: 0.5 }}>
          {label}
        </Typography>
      )}
      <FormControl
        size="small"
        fullWidth
        sx={{
          "& .MuiInputBase-root": { height: 34, fontSize: "0.8rem" },
          "& .MuiSelect-select": { display: "flex", alignItems: "center", overflow: "hidden" },
        }}
      >
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value as AvailRole)}
          MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
          renderValue={(val) => {
            const opt = OPTIONS.find((o) => o.value === (val as AvailRole));
            return (
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: availRoleVisual(val as AvailRole).border, flexShrink: 0 }} />
                <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {opt?.label}
                </Box>
              </Stack>
            );
          }}
        >
          {OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.8rem", minHeight: 30 }}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: availRoleVisual(o.value).border, flexShrink: 0 }} />
                <span>{o.label}</span>
              </Stack>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
