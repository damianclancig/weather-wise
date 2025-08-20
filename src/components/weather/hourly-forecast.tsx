
'use client';

import { useEffect, useRef } from 'react';
import type { HourlyForecast as HourlyForecastType } from '@/lib/types';
import { useTranslation } from '@/hooks/use-translation';
import { AnimatedWeatherIcon } from '@/components/icons/animated-weather-icon';
import { Umbrella, Sunrise, Sunset } from 'lucide-react';
import { cn } from '@/lib/utils';

// New type to include sunrise/sunset events
type TimelineEvent = 
  | ({ type: 'hour' } & HourlyForecastType & { dt: number; time: string })
  | { type: 'sunrise' | 'sunset'; time: string; dt: number };

interface HourlyForecastProps {
  data: HourlyForecastType[];
  sunrise?: string;
  sunset?: string;
  timezone?: string; // IANA timezone string e.g. "Europe/Berlin"
}

const formatTime = (date: Date, timezone: string) => {
    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone,
        hour12: false,
    });
};

export function HourlyForecast({ data, sunrise, sunset, timezone }: HourlyForecastProps) {
  const { t } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentEventRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentEventRef.current && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const element = currentEventRef.current;
        const containerWidth = container.offsetWidth;
        const elementLeft = element.offsetLeft;
        const elementWidth = element.offsetWidth;

        // Calculate the scroll position to center the element
        const scrollLeft = elementLeft - (containerWidth / 2) + (elementWidth / 2);

        container.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
        });
    }
  }, [data]); // Rerun when data changes


  if (!data || data.length === 0 || !timezone) {
    return null;
  }
  
  // Create timeline events from hourly data
  const timelineEvents: TimelineEvent[] = data.map(hour => {
    const eventDate = new Date(hour.time);
    return {
      ...hour,
      type: 'hour',
      dt: eventDate.getTime(),
      time: formatTime(eventDate, timezone)
    };
  });
  
  const sunriseDate = sunrise ? new Date(sunrise) : null;
  const sunsetDate = sunset ? new Date(sunset) : null;

  if (sunriseDate) {
    timelineEvents.push({ type: 'sunrise', time: formatTime(sunriseDate, timezone), dt: sunriseDate.getTime() });
  }
  if (sunsetDate) {
    timelineEvents.push({ type: 'sunset', time: formatTime(sunsetDate, timezone), dt: sunsetDate.getTime() });
  }

  // Sort all events chronologically
  timelineEvents.sort((a, b) => a.dt - b.dt);
  
  const now = new Date().getTime();
  // Find the index of the last hourly event that is less than or equal to the current time.
  const currentEventIndex = timelineEvents.findLastIndex(event => event.type === 'hour' && event.dt <= now);


  return (
    <div className="overflow-x-auto pb-2 -mb-2" ref={scrollContainerRef}>
      <div className="flex space-x-4">
        {timelineEvents.map((item, index) => {
          
          let isNight = false;
          if (item.type === 'hour' && sunriseDate && sunsetDate) {
             isNight = item.dt < sunriseDate.getTime() || item.dt > sunsetDate.getTime();
          }

          const isCurrent = index === currentEventIndex;

          return (
            <div 
              key={index}
              ref={isCurrent ? currentEventRef : null}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg gap-1 min-w-[70px] transition-colors",
                isCurrent ? "bg-white/20" : "bg-white/5"
              )}
            >
              <p className="font-semibold text-foreground/80 text-sm">{item.time}</p>
              
              {item.type === 'hour' && (
                <>
                  <AnimatedWeatherIcon code={item.weatherCode} className="w-10 h-10" isNight={isNight} />
                  <p className="font-bold">{item.temp}°</p>
                  <div className="flex items-center gap-1 text-foreground/80" title={t('precipitation')}>
                    <Umbrella className="w-3 h-3" />
                    <span className="text-xs font-medium">{Math.round(item.pop)}%</span>
                  </div>
                </>
              )}

              {item.type === 'sunrise' && (
                <>
                  <Sunrise className="w-10 h-10 text-yellow-400" />
                  <p className="font-bold text-xs capitalize">{t('sunrise') || 'Sunrise'}</p>
                   <div className="h-[22px]" />
                </>
              )}

              {item.type === 'sunset' && (
                <>
                  <Sunset className="w-10 h-10 text-orange-400" />
                  <p className="font-bold text-xs capitalize">{t('sunset') || 'Sunset'}</p>
                   <div className="h-[22px]" />
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
}
