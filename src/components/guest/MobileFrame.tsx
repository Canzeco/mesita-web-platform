import { cn } from "@/lib/utils";

export function MobileFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-hero p-4">
      <div className="flex h-[820px] w-[400px] flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-elev">
        <div className={cn("flex flex-1 flex-col overflow-hidden", className)}>
          {children}
        </div>
      </div>
    </div>
  );
}
