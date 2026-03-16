import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ChecklistIcon from "@mui/icons-material/Checklist";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAppSelector, useAppDispatch } from "@/store";
import { setOpenAvailability, setOpenNotAvailable } from "@/store/slices/uiSlice";
import { fmtTime12, formatDayGroupShort } from "@/lib/helpers";

export default function AvailabilityPage() {
  const dispatch = useAppDispatch();
  const patterns = useAppSelector((s) => s.availability.patterns);
  const maxPerWeek = useAppSelector((s) => s.availability.maxPerWeek);
  const rangeDays = useAppSelector((s) => s.availability.rangeDays);

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5 }}>
        <PageHeader icon={ChecklistIcon} title="Availability" subtitle="Manage your recurring patterns and one-off blocks." />
        <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
          <Button
            variant="soft"
            size="small"
            startIcon={<AccessTimeOutlinedIcon sx={{ fontSize: 14 }} />}
            sx={{ borderRadius: "4px" }}
            onClick={() => dispatch(setOpenNotAvailable(true))}
          >
            Mark unavailable
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddOutlinedIcon sx={{ fontSize: 14 }} />}
            sx={{ borderRadius: "4px" }}
            onClick={() => dispatch(setOpenAvailability(true))}
          >
            Add availability
          </Button>
        </Box>
      </Box>

      {/* Limits */}
      <Box sx={{ mt: 1.5, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
        <Box
          sx={{
            borderRadius: "16px",
            border: 1,
            borderColor: "divider",
            backgroundColor: "hsl(var(--md-surface))",
            px: 1.5,
            py: 1,
          }}
        >
          <Box sx={{ fontSize: "11px", color: "hsl(var(--md-on-surface-variant))" }}>Max sessions / week</Box>
          <Box sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{maxPerWeek}</Box>
        </Box>
        <Box
          sx={{
            borderRadius: "16px",
            border: 1,
            borderColor: "divider",
            backgroundColor: "hsl(var(--md-surface))",
            px: 1.5,
            py: 1,
          }}
        >
          <Box sx={{ fontSize: "11px", color: "hsl(var(--md-on-surface-variant))" }}>Availability window</Box>
          <Box sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{rangeDays} days</Box>
        </Box>
      </Box>

      {/* Patterns */}
      <Box sx={{ mt: 2 }}>
        <Box sx={{ fontSize: "0.875rem", fontWeight: 600, mb: 1 }}>Recurring patterns</Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {patterns.map((p) => (
            <Card key={p.id}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
                  <Box>
                    <Box sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{p.label}</Box>
                    <Box sx={{ mt: 0.25, fontSize: "0.75rem", color: "hsl(var(--md-on-surface-variant))" }}>
                      {formatDayGroupShort(p.days)} &bull; {fmtTime12(p.start)}&ndash;{fmtTime12(p.end)}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
          {!patterns.length && (
            <Box
              sx={{
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
              No recurring patterns configured.
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
