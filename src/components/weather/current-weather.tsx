
'use client';

import type { CurrentWeather as CurrentWeatherType, DailyForecast, HourlyForecast as HourlyForecastType } from '@/lib/types';
import { useTranslation } from '@/hooks/use-translation';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedWeatherIcon } from '@/components/icons/animated-weather-icon';
import { HourlyForecast } from '@/components/weather/hourly-forecast';
import { Thermometer, Droplets, Wind, MapPin, Umbrella } from 'lucide-react';
import { SunriseSunset } from './sunrise-sunset';
import { DetailItem } from './detail-item';

type DisplayWeather = (CurrentWeatherType | DailyForecast) & { dt: number | string };

interface CurrentWeatherProps {
  data: DisplayWeather;
  hourlyData: HourlyForecastType[];
}

export function CurrentWeather({ data, hourlyData }: CurrentWeatherProps) {
  const { t } = useTranslation();
  
  const weatherDescriptionKey = `weather.${data.description.replace(/\s/g, '_')}`;

  const date = typeof data.dt === 'string' ? new Date(`${data.dt}T12:00:00Z`) : new Date(data.dt);
  
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  if (typeof data.dt === 'string') {
      dateOptions.timeZone = 'UTC';
  }

  // Get temp from CurrentWeather or DailyForecast
  const temp = 'temp' in data ? data.temp : 0;

  return (
    <GlassCard>
      <div className="flex flex-col md:flex-row justify-between md:items-start p-1">
        {/* Location and Date */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left w-full">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-foreground/80" />
            <h2 className="text-2xl md:text-3xl font-bold">{data.location}</h2>
          </div>
          <p className="text-sm text-foreground/80">{date.toLocaleDateString(undefined, dateOptions)}</p>
        </div>
      </div>
      
      {/* Temperature and Icon/Description */}
      <div className="flex flex-col items-center justify-center text-center">
        <p className="text-2xl capitalize">{t(weatherDescriptionKey)}</p>
        <div className="flex items-center justify-center">
            <div className='flex flex-col items-center'>
              <div className="text-5xl md:text-7xl font-bold">{Math.round(temp)}°C</div>
              <div className="text-sm text-foreground/80 -mt-2">
                Máx: {Math.round(data.temp_max)}° / Mín: {Math.round(data.temp_min)}°
              </div>
            </div>
            <AnimatedWeatherIcon condition={data.main} className="w-24 h-24 md:w-32 md:h-32" />
        </div>
      </div>
      
       {/* Sunrise and Sunset */}
      {'sunrise' in data && data.sunrise && 'sunset' in data && data.sunset && 'timezone' in data && data.timezone && (
        <div className="my-2">
          <SunriseSunset
            sunrise={data.sunrise}
            sunset={data.sunset}
            timezone={data.timezone}
          />
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-4 gap-1 text-center">
        <DetailItem
          icon={Thermometer}
          label={t('feelsLike')}
          value={`${Math.round(data.feels_like)}°C`}
        />
        <DetailItem
          icon={Droplets}
          label={t('humidity')}
          value={`${data.humidity}%`}
        />
        <DetailItem
          icon={Umbrella}
          label={t('precipitation')}
          value={`${Math.round(data.pop * 100)}%`}
        />
        <DetailItem
          icon={Wind}
          label={t('wind')}
          value={`${Math.round(data.wind_speed)} kph`}
        />
      </div>

      {/* Hourly Forecast */}
      <div className="pb-4 pt-2">
        <HourlyForecast data={hourlyData} />
      </div>
    </GlassCard>
  );
}
