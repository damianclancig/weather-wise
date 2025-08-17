
'use client';

import { useEffect, useState } from 'react';
import { Sun, Sunrise, Sunset, Clock } from 'lucide-react';

interface SunriseSunsetProps {
  sunrise: number;
  sunset: number;
  timezone: number; // timezone offset in milliseconds
}

const formatTime = (timestamp: number, timezone: number) => {
    const date = new Date(timestamp + timezone);
    return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
    });
};

const formatDuration = (durationMs: number) => {
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
}

export function SunriseSunset({ sunrise, sunset, timezone }: SunriseSunsetProps) {
  const [sunPosition, setSunPosition] = useState(0);
  const [isDay, setIsDay] = useState(false);

  useEffect(() => {
    const calculateSunPosition = () => {
      const now = new Date();
      // Get the correct local time for the location by applying the timezone offset
      const localTime = now.getTime() + (now.getTimezoneOffset() * 60000) + timezone;

      if (localTime >= sunrise && localTime <= sunset) {
        setIsDay(true);
        const totalDaylight = sunset - sunrise;
        const timeSinceSunrise = localTime - sunrise;
        const progress = (timeSinceSunrise / totalDaylight) * 100;
        setSunPosition(progress);
      } else {
        setIsDay(false);
        // Position sun at beginning or end if it's night
        setSunPosition(localTime < sunrise ? -5 : 105); // Move it off-screen
      }
    };

    calculateSunPosition();
    const interval = setInterval(calculateSunPosition, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [sunrise, sunset, timezone]);

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
          <span>{formatTime(sunrise, timezone)}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-foreground/80">
          <Clock className="h-4 w-4" />
          <span>{formatDuration(dayDuration)}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-foreground/80">
          <Sunset className="h-4 w-4" />
          <span>{formatTime(sunset, timezone)}</span>
        </div>
      </div>
    </div>
  );
}
