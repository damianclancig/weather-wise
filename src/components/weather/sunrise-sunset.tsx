
'use client';

import { useEffect, useState } from 'react';
import { Sun, Sunrise, Sunset, Clock } from 'lucide-react';

interface SunriseSunsetProps {
  sunrise: string; // ISO 8601 string
  sunset: string; // ISO 8601 string
  timezone: string; // IANA timezone string e.g. "Europe/Berlin"
}

const formatTime = (date: Date, timezone: string) => {
    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone,
        hour12: false,
    });
};

const formatDuration = (durationMs: number) => {
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
}

export function SunriseSunset({ sunrise: sunriseStr, sunset: sunsetStr, timezone }: SunriseSunsetProps) {
  const [sunPosition, setSunPosition] = useState(0);
  const [isDay, setIsDay] = useState(false);

  // Convert ISO strings to Date objects
  const sunriseDate = new Date(sunriseStr);
  const sunsetDate = new Date(sunsetStr);
  
  // Get timestamps
  const sunrise = sunriseDate.getTime();
  const sunset = sunsetDate.getTime();

  useEffect(() => {
    const calculateSunPosition = () => {
      // Current time in UTC
      const now = new Date().getTime();

      if (now >= sunrise && now <= sunset) {
        setIsDay(true);
        const totalDaylight = sunset - sunrise;
        const timeSinceSunrise = now - sunrise;
        const progress = (timeSinceSunrise / totalDaylight) * 100;
        setSunPosition(progress);
      } else {
        setIsDay(false);
        // Position sun at beginning or end if it's night
        setSunPosition(now < sunrise ? -5 : 105); // Move it off-screen
      }
    };

    calculateSunPosition();
    const interval = setInterval(calculateSunPosition, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [sunrise, sunset]);

  const dayDuration = sunset - sunrise;

  return (
    <div className="flex flex-col items-center w-full px-4 pt-4 pb-2">
      <div className="relative w-full h-8">
        {/* The dotted path */}
        <div className="absolute top-1/2 left-0 w-full border-t-2 border-dotted border-amber-400/50" />
        
        {/* Sun icon */}
        {isDay && (
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-linear"
            style={{ left: `calc(${sunPosition}% - 12px)` }} // Offset by half of icon size (24px)
          >
            <Sun className="h-6 w-6 text-yellow-400 animate-[spin_15s_linear_infinite]" />
          </div>
        )}
      </div>
      
      {/* Sunrise and Sunset Times */}
      <div className="w-full flex justify-between items-center mt-2">
        <div className="flex items-center gap-1 text-sm text-foreground/80">
          <Sunrise className="h-4 w-4" />
          <span>{formatTime(sunriseDate, timezone)}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-foreground/80">
          <Clock className="h-4 w-4" />
          <span>{formatDuration(dayDuration)}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-foreground/80">
          <Sunset className="h-4 w-4" />
          <span>{formatTime(sunsetDate, timezone)}</span>
        </div>
      </div>
    </div>
  );
}
