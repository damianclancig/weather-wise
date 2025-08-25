
'use client';

import type { CurrentWeather as CurrentWeatherType, DailyForecast, HourlyForecast as HourlyForecastType } from '@/lib/types';
import { useTranslation } from '@/hooks/use-translation';
import { AnimatedWeatherIcon } from '@/components/icons/animated-weather-icon';
import { HourlyForecast } from '@/components/weather/hourly-forecast';
import { Thermometer, Droplets, Wind, MapPin, Umbrella } from 'lucide-react';
import { SunriseSunset } from './sunrise-sunset';
import { DetailItem } from './detail-item';
import { parseDateString } from '@/lib/date-utils';


// This new type will hold the data for the main display card.
// It must include all properties needed by child components.
// We combine properties from CurrentWeather and DailyForecast.
type DisplayWeather = CurrentWeatherType | (DailyForecast & Pick<CurrentWeatherType, 'location' | 'timezone' | 'latitude'>);


interface CurrentWeatherProps {
  data: DisplayWeather;
  hourlyData: HourlyForecastType[];
}

export function CurrentWeather({ data, hourlyData }: CurrentWeatherProps) {
  const { t } = useTranslation();
  
  const weatherDescriptionKey = `weather.${data.description}`;

  const date = parseDateString(data.dt);
  
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  if ('timezone' in data && data.timezone) {
      dateOptions.timeZone = data.timezone;
  }

  // Get temp from CurrentWeather or DailyForecast
  const temp = 'temp' in data ? data.temp : 0;
  
  const hasSunData = 'sunrise' in data && data.sunrise && 'sunset' in data && data.sunset && 'timezone' in data;
  
  let isNight = false;
  // This is the crucial check: Only determine night for *current* weather, not for future forecast days.
  // We identify current weather because its `dt` is a full ISO string (containing 'T').
  if (hasSunData && typeof data.dt === 'string' && data.dt.includes('T')) {
    const sunriseTimestamp = new Date(data.sunrise).getTime();
    const sunsetTimestamp = new Date(data.sunset).getTime();
    const nowTimestamp = new Date().getTime();

    isNight = nowTimestamp < sunriseTimestamp || nowTimestamp > sunsetTimestamp;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between md:items-start p-1">
        {/* Location and Date */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left w-full">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-foreground/80" />
            <h2 className="text-xl md:text-2xl font-bold">{data.location}</h2>
          </div>
          <p className="text-sm text-foreground/80">{new Intl.DateTimeFormat(undefined, dateOptions).format(date)}</p>
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
            <AnimatedWeatherIcon
              code={data.weatherCode}
              className="w-24 h-24 md:w-32 md:h-32"
              isNight={isNight}
            />
        </div>
      </div>
      
       {/* Sunrise and Sunset */}
      {hasSunData && (
        <div className="my-2">
          <SunriseSunset
            sunrise={data.sunrise}
            sunset={data.sunset}
            timezone={data.timezone}
          />
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-center">
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
          icon={Wind}
          label={t('wind')}
          value={`${Math.round(data.wind_speed)} km/h`}
        />
        <DetailItem
          icon={Umbrella}
          label={t('precipitation')}
          value={`${Math.round(data.pop)}%`}
        />
      </div>

      {/* Hourly Forecast */}
      <div className="pb-4 pt-2">
        <HourlyForecast 
          data={hourlyData} 
          sunrise={hasSunData ? data.sunrise : undefined}
          sunset={hasSunData ? data.sunset : undefined}
          timezone={hasSunData ? data.timezone : undefined}
        />
      </div>
    </>
  );
}
