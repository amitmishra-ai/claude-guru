import type { LucideIcon } from "lucide-react";

export function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col-reverse items-start gap-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-2xl border bg-surface p-2">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-lg font-semibold">{title}</div>
          {subtitle ? <div className="text-sm text-on-surface-variant">{subtitle}</div> : null}
        </div>
      </div>
    </div>
  );
}
