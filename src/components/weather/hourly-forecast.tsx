
'use client';

import { useRef, useEffect, useState } from 'react';
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
  const [currentEventIndex, setCurrentEventIndex] = useState(-1);

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
  
  // Check if the forecast being displayed is for today.
  // We can do this by seeing if any of the event times are in the past.
  const now = new Date().getTime();
  const isToday = timelineEvents.some(event => event.dt < now);

  useEffect(() => {
    if (!isToday) {
        setCurrentEventIndex(-1); // Reset index if not today
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
        return;
    }
    
    // Find the index of the first event that is in the future
    const nextEventIndex = timelineEvents.findIndex(event => event.dt > now);
    
    let indexToFocus: number;
    if (nextEventIndex === -1) {
      // If all events are in the past, focus the last one
      indexToFocus = timelineEvents.length - 1;
    } else if (nextEventIndex === 0) {
      // If all events are in the future, focus the first one
      indexToFocus = 0;
    } else {
      // Otherwise, focus the event just before the next one (the current one)
      indexToFocus = nextEventIndex - 1;
    }

    setCurrentEventIndex(indexToFocus);

    if (scrollContainerRef.current && indexToFocus > -1) {
      const targetElement = scrollContainerRef.current.children[indexToFocus] as HTMLElement;
      if (targetElement) {
        setTimeout(() => {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            inline: 'center',
            block: 'nearest'
          });
        }, 100);
      }
    }
  // This dependency array is correct. We only want to re-run this when the core data changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, sunrise, sunset, timezone, isToday]);
  
  return (
    <div className="overflow-x-auto pb-2 -mb-2">
      <div ref={scrollContainerRef} className="flex space-x-4">
        {timelineEvents.map((item, index) => {
          
          let isNight = false;
          if (item.type === 'hour' && sunriseDate && sunsetDate) {
             isNight = item.dt < sunriseDate.getTime() || item.dt > sunsetDate.getTime();
          }

          const isCurrent = index === currentEventIndex;

          return (
            <div 
              key={index} 
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
