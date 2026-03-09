import { ListChecks, Plus, Clock } from "lucide-react";
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
      <div className="flex items-start justify-between gap-3">
        <PageHeader icon={ListChecks} title="Availability" subtitle="Manage your recurring patterns and one-off blocks." />
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outlined"
            size="small"
            startIcon={<Clock className="h-3.5 w-3.5" />}
            sx={{ borderRadius: '4px' }}
            onClick={() => dispatch(setOpenNotAvailable(true))}
          >
            Mark unavailable
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Plus className="h-3.5 w-3.5" />}
            sx={{ borderRadius: '4px' }}
            onClick={() => dispatch(setOpenAvailability(true))}
          >
            Add availability
          </Button>
        </div>
      </div>

      {/* Limits */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-surface px-3 py-2">
          <div className="text-[11px] text-on-surface-variant">Max sessions / week</div>
          <div className="text-sm font-semibold">{maxPerWeek}</div>
        </div>
        <div className="rounded-2xl border bg-surface px-3 py-2">
          <div className="text-[11px] text-on-surface-variant">Availability window</div>
          <div className="text-sm font-semibold">{rangeDays} days</div>
        </div>
      </div>

      {/* Patterns */}
      <div className="mt-4">
        <div className="text-sm font-semibold mb-2">Recurring patterns</div>
        <div className="space-y-2">
          {patterns.map((p) => (
            <Card key={p.id}>
              <CardContent sx={{ p: 2 }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{p.label}</div>
                    <div className="mt-0.5 text-xs text-on-surface-variant">
                      {formatDayGroupShort(p.days)} &bull; {fmtTime12(p.start)}&ndash;{fmtTime12(p.end)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {!patterns.length && (
            <div className="rounded-2xl border bg-surface-container/20 px-4 py-8 text-center text-sm text-on-surface-variant">
              No recurring patterns configured.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
