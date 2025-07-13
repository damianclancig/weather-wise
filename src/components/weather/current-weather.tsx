'use client';

import type { CurrentWeather as CurrentWeatherType } from '@/lib/types';
import { useTranslation } from '@/hooks/use-translation';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedWeatherIcon } from '@/components/icons/animated-weather-icon';
import { Thermometer, Droplets, Wind, MapPin, Umbrella } from 'lucide-react';

interface CurrentWeatherProps {
  data: CurrentWeatherType;
}

export function CurrentWeather({ data }: CurrentWeatherProps) {
  const { t } = useTranslation();
  
  const weatherDescriptionKey = `weather.${data.description.replace(/\s/g, '_')}`;

  return (
    <GlassCard>
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-foreground/80" />
            <h2 className="text-3xl md:text-4xl font-bold">{data.location}</h2>
          </div>
          <p className="text-foreground/80">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <div className="text-7xl md:text-8xl font-bold my-4">{Math.round(data.temp)}°C</div>
          <p className="text-2xl capitalize">{t(weatherDescriptionKey)}</p>
        </div>
        <div className="flex flex-col items-center gap-4">
          <AnimatedWeatherIcon condition={data.main} className="w-32 h-32 md:w-48 md:h-48" />
          <div className="grid grid-cols-4 gap-2 md:gap-4 text-center">
            <div className="flex flex-col items-center">
              <Thermometer className="w-6 h-6 text-foreground/80" />
              <p className="font-bold">{Math.round(data.feels_like)}°C</p>
              <p className="text-xs text-foreground/60">{t('feelsLike')}</p>
            </div>
            <div className="flex flex-col items-center">
              <Droplets className="w-6 h-6 text-foreground/80" />
              <p className="font-bold">{data.humidity}%</p>
              <p className="text-xs text-foreground/60">{t('humidity')}</p>
            </div>
             <div className="flex flex-col items-center">
              <Umbrella className="w-6 h-6 text-foreground/80" />
              <p className="font-bold">{Math.round(data.pop * 100)}%</p>
              <p className="text-xs text-foreground/60">{t('precipitation')}</p>
            </div>
            <div className="flex flex-col items-center">
              <Wind className="w-6 h-6 text-foreground/80" />
              <p className="font-bold">{Math.round(data.wind_speed)} kph</p>
              <p className="text-xs text-foreground/60">{t('wind')}</p>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
