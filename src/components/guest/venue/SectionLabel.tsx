import { cn } from "@/lib/utils";

export function SectionLabel({
  title,
  trailing,
  icon,
  className,
}: {
  title: string;
  trailing?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {icon}
        {title}
      </div>
      {trailing && <div className="text-[11px] text-muted-foreground">{trailing}</div>}
    </div>
  );
}
