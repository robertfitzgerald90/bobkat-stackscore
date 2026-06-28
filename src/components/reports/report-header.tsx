import { BRAND } from "@/lib/branding";
import { cn } from "@/lib/utils";

type ReportHeaderProps = {
  reportTitle: string;
  clientName: string;
  dateLabel: string;
  className?: string;
};

export function ReportHeader({
  reportTitle,
  clientName,
  dateLabel,
  className,
}: ReportHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b-2 border-primary pb-3",
        className,
      )}
    >
      <div>
        <p className="text-xs font-bold text-primary">
          {BRAND.companyName} · {BRAND.productName}
        </p>
        <p className="text-xs text-muted-foreground">{reportTitle}</p>
      </div>
      <div className="text-right text-xs">
        <p className="font-semibold">{clientName}</p>
        <p className="text-muted-foreground">{dateLabel}</p>
      </div>
    </div>
  );
}
