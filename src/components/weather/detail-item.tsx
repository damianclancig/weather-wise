
import type { LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

interface DetailItemProps {
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  label: string;
  value: string | number;
}

export function DetailItem({ icon: Icon, label, value }: DetailItemProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 p-2 bg-black/10 rounded-lg">
      <Icon className="w-5 h-5 text-foreground/80" />
      <p className="font-bold text-sm">{value}</p>
      <p className="text-xs text-foreground/60">{label}</p>
    </div>
  );
}
