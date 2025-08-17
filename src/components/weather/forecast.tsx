
'use client';

import type { DailyForecast } from '@/lib/types';
import { useTranslation } from '@/hooks/use-translation';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedWeatherIcon } from '@/components/icons/animated-weather-icon';
import { Umbrella } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ForecastProps {
  data: DailyForecast[];
  onDaySelect: (day: DailyForecast) => void;
  onShowToday: () => void;
  selectedDayId: string | null;
}

const getDayInfo = (dateString: string) => {
  // Use 'T12:00:00Z' to force UTC and avoid timezone shifting issues
  const date = new Date(`${dateString}T12:00:00Z`);

  const dayName = date.toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' });
  const dayNumber = date.getUTCDate();
  
  return { dayName, dayNumber };
};


export function Forecast({ data, onDaySelect, onShowToday, selectedDayId }: ForecastProps) {
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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{t('forecastTitle')}</h3>
        <Button 
          variant="ghost" 
          onClick={onShowToday}
          className={cn(selectedDayId === 'today' && 'bg-white/10')}
        >
          {t('today')}
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {data.map((day, index) => {
          const { dayName, dayNumber } = getDayInfo(day.dt);
          const isSelected = selectedDayId === day.dt;
          return (
            <button 
              key={index} 
              onClick={() => onDaySelect(day)}
              className={cn(
                "flex flex-col items-center p-3 rounded-lg bg-white/5 gap-2 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
                isSelected && "bg-white/20"
              )}
            >
              <p className="font-semibold text-foreground/80">{dayName} {dayNumber}</p>
              <div className="flex items-center justify-around w-full">
                <AnimatedWeatherIcon code={day.weatherCode} className="w-12 h-12" />
                <div className="flex flex-col items-center">
                    <p className="font-bold text-lg">{Math.round(day.temp_max)}°</p>
                    <p className="text-foreground/80">{Math.round(day.temp_min)}°</p>
                </div>
                 <div className="flex items-center gap-1.5 text-foreground/80" title={t('precipitation')}>
                  <Umbrella className="w-4 h-4" />
                  <span className="text-sm font-medium">{Math.round(day.pop)}%</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </GlassCard>
  );
}
