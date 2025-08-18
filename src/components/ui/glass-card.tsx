import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  return (
    <div
      className={cn(
        "relative h-full w-full rounded-2xl bg-card/10 backdrop-blur p-2 border border-white/10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
