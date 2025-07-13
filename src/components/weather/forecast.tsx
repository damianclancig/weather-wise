'use client';

import type { DailyForecast } from '@/lib/types';
import { useTranslation } from '@/hooks/use-translation';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedWeatherIcon } from '@/components/icons/animated-weather-icon';
import { Umbrella } from 'lucide-react';

interface ForecastProps {
  data: DailyForecast[];
}

const getDayInfo = (dateString: string) => {
  const date = new Date(dateString);
  // Add time zone offset to avoid issues with UTC dates
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() + userTimezoneOffset);
  
  const dayName = localDate.toLocaleDateString(undefined, { weekday: 'short' });
  const dayNumber = localDate.getDate();
  
  return { dayName, dayNumber };
};

export function Forecast({ data }: ForecastProps) {
  const { t } = useTranslation();

  if (!data || data.length === 0) {
    return (
      <GlassCard>
        <h3 className="text-xl font-bold mb-4">{t('forecastTitle')}</h3>
        <p>{t('loading')}</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <h3 className="text-xl font-bold mb-4">{t('forecastTitle')}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {data.map((day, index) => {
          const { dayName, dayNumber } = getDayInfo(day.dt);
          return (
            <div key={index} className="flex flex-col items-center p-2 rounded-lg bg-white/5 gap-1">
              <p className="font-semibold text-foreground/80">{dayName} {dayNumber}</p>
              <AnimatedWeatherIcon condition={day.main} className="w-16 h-16" />
              <p className="font-bold">{Math.round(day.temp_max)}° / {Math.round(day.temp_min)}°</p>
              <div className="flex items-center gap-1.5 text-foreground/80" title={t('precipitation')}>
                <Umbrella className="w-4 h-4" />
                <span className="text-sm font-medium">{Math.round(day.pop * 100)}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </GlassCard>
  );
}
