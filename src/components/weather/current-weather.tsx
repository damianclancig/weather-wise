'use client';

import type { CurrentWeather as CurrentWeatherType, HourlyForecast as HourlyForecastType } from '@/lib/types';
import { useTranslation } from '@/hooks/use-translation';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedWeatherIcon } from '@/components/icons/animated-weather-icon';
import { HourlyForecast } from '@/components/weather/hourly-forecast';
import { Thermometer, Droplets, Wind, MapPin, Umbrella } from 'lucide-react';

interface CurrentWeatherProps {
  data: CurrentWeatherType;
  hourlyData: HourlyForecastType[];
}

export function CurrentWeather({ data, hourlyData }: CurrentWeatherProps) {
  const { t } = useTranslation();
  
  const weatherDescriptionKey = `weather.${data.description.replace(/\s/g, '_')}`;

  // If dt is a string (YYYY-MM-DD), we need to create a date object from it.
  // We use T12:00:00Z to avoid timezone issues and ensure the correct day is parsed.
  const date = typeof data.dt === 'string' ? new Date(`${data.dt}T12:00:00Z`) : new Date(data.dt);
  
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  if (typeof data.dt === 'string') {
      dateOptions.timeZone = 'UTC';
  }


  return (
    <GlassCard>
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-foreground/80" />
            <h2 className="text-2xl md:text-3xl font-bold">{data.location}</h2>
          </div>
          <p className="text-sm text-foreground/80">{date.toLocaleDateString(undefined, dateOptions)}</p>
          <div className="text-6xl md:text-7xl font-bold">{Math.round(data.temp)}°C</div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="text-xl capitalize mt-0">{t(weatherDescriptionKey)}</p>
          <AnimatedWeatherIcon condition={data.main} className="w-24 h-24 md:w-32 md:h-32" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 text-center mt-0">
        <div className="flex flex-col items-center gap-1">
          <Thermometer className="w-5 h-5 text-foreground/80" />
          <p className="font-bold text-sm">{Math.round(data.feels_like)}°C</p>
          <p className="text-xs text-foreground/60">{t('feelsLike')}</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Droplets className="w-5 h-5 text-foreground/80" />
          <p className="font-bold text-sm">{data.humidity}%</p>
          <p className="text-xs text-foreground/60">{t('humidity')}</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Umbrella className="w-5 h-5 text-foreground/80" />
          <p className="font-bold text-sm">{Math.round(data.pop * 100)}%</p>
          <p className="text-xs text-foreground/60">{t('precipitation')}</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Wind className="w-5 h-5 text-foreground/80" />
          <p className="font-bold text-sm">{Math.round(data.wind_speed)} kph</p>
          <p className="text-xs text-foreground/60">{t('wind')}</p>
        </div>
      </div>
      <div className="mt-4">
        <HourlyForecast data={hourlyData} />
      </div>
    </GlassCard>
  );
}
