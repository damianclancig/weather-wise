import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative p-[2px]", className)}>
       <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl">
        <div
          className={cn(
            "absolute inset-[-1000%] h-[2000%] w-[2000%] bg-[conic-gradient(from_90deg_at_50%_50%,hsl(var(--accent))_0%,hsl(var(--secondary))_50%,hsl(var(--accent))_100%)]",
            "animate-[spin_5s_linear_infinite]"
          )}
        />
      </div>
      <div className="relative z-10 h-full w-full rounded-[14px] bg-card p-2">
        {children}
      </div>
    </div>
  );
}
