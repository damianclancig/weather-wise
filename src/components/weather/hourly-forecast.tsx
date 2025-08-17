'use client';

import type { HourlyForecast as HourlyForecastType } from '@/lib/types';
import { useTranslation } from '@/hooks/use-translation';
import { AnimatedWeatherIcon } from '@/components/icons/animated-weather-icon';
import { Umbrella } from 'lucide-react';

interface HourlyForecastProps {
  data: HourlyForecastType[];
}

export function HourlyForecast({ data }: HourlyForecastProps) {
  const { t } = useTranslation();

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto pb-2 -mb-2">
      <div className="flex space-x-4">
        {data.map((hour, index) => (
          <div key={index} className="flex flex-col items-center p-2 rounded-lg bg-white/5 gap-1 min-w-[60px]">
            <p className="font-semibold text-foreground/80 text-sm">{hour.time}</p>
            <AnimatedWeatherIcon condition={hour.main} className="w-10 h-10" />
            <p className="font-bold">{hour.temp}°</p>
            <div className="flex items-center gap-1 text-foreground/80" title={t('precipitation')}>
              <Umbrella className="w-3 h-3" />
              <span className="text-xs font-medium">{Math.round(hour.pop * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
