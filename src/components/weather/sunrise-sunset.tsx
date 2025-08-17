
'use client';

import { useEffect, useState } from 'react';
import { Sun, Sunrise, Sunset } from 'lucide-react';

interface SunriseSunsetProps {
  sunrise: number;
  sunset: number;
  timezone: number; // timezone offset in milliseconds
}

const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
};

export function SunriseSunset({ sunrise, sunset, timezone }: SunriseSunsetProps) {
  const [sunPosition, setSunPosition] = useState({ x: 0, y: 0, show: false });

  useEffect(() => {
    const calculateSunPosition = () => {
      const now = new Date();
      const nowUtc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const localTimestamp = nowUtc + timezone;

      if (localTimestamp > sunrise && localTimestamp < sunset) {
        const totalDaylight = sunset - sunrise;
        const timeSinceSunrise = localTimestamp - sunrise;
        const percentageOfDay = timeSinceSunrise / totalDaylight;
        
        const angle = Math.PI * (1 - percentageOfDay);
        const x = 50 + 50 * Math.cos(angle); 
        const y = 60 * Math.sin(angle); // Reduced height factor for a flatter arc

        setSunPosition({ x, y, show: true });
      } else {
        setSunPosition({ x: 0, y: 0, show: false });
      }
    };

    calculateSunPosition();
    const interval = setInterval(calculateSunPosition, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [sunrise, sunset, timezone]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-sm h-10">
        {/* Oval Arc */}
        <div className="absolute bottom-0 left-0 w-full h-10 border-t-2 border-dashed border-yellow-400/50 rounded-t-[50%]"></div>
        
        {/* Sun icon */}
        {sunPosition.show && (
            <div
                className="absolute bottom-0 h-6 w-6 transition-all duration-1000 ease-linear"
                style={{ 
                    left: `${sunPosition.x}%`, 
                    bottom: `${sunPosition.y}%`,
                    transform: 'translateX(-50%)' 
                }}
            >
                <Sun className="h-full w-full text-yellow-400 animate-[spin_15s_linear_infinite]" />
            </div>
        )}

        {/* Sunrise and Sunset Times */}
        <div className="absolute -bottom-1 left-0 flex items-center gap-1 text-sm text-foreground/80">
          <Sunrise className="h-4 w-4" />
          <span>{formatTime(sunrise)}</span>
        </div>
        <div className="absolute -bottom-1 right-0 flex items-center gap-1 text-sm text-foreground/80">
          <Sunset className="h-4 w-4" />
          <span>{formatTime(sunset)}</span>
        </div>
      </div>
    </div>
  );
}
