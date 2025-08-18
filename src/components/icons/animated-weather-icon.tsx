
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Moon, CloudFog, CloudSun, Cloudy, CloudMoon, CloudDrizzle, CloudRainWind, Snowflake, CloudLightning, CloudHail } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WeatherCodeInfo } from '@/lib/types';
import { weatherCodes } from '@/lib/weather-codes';

interface AnimatedWeatherIconProps {
  code: number;
  className?: string;
  isNight?: boolean;
}

const iconMap: Map<number, { icon: React.ElementType; animation: string }> = new Map([
    // Clear & Clouds
    [0, { icon: Sun, animation: "text-yellow-400 animate-[spin_15s_linear_infinite]" }], // Clear sky
    [1, { icon: CloudSun, animation: "text-yellow-400 animate-pulse" }], // Mainly clear
    [2, { icon: CloudSun, animation: "text-yellow-400 animate-pulse" }], // Partly cloudy
    [3, { icon: Cloudy, animation: "text-gray-400 animate-pulse" }],     // Overcast
    
    // Fog
    [45, { icon: CloudFog, animation: "animate-pulse text-gray-400" }], // Fog
    [48, { icon: CloudFog, animation: "animate-pulse text-gray-400" }], // Depositing rime fog

    // Drizzle
    [51, { icon: CloudDrizzle, animation: "text-blue-300 animate-pulse" }], // Drizzle: Light
    [53, { icon: CloudDrizzle, animation: "text-blue-300 animate-pulse" }], // Drizzle: Moderate
    [55, { icon: CloudRain, animation: "text-blue-300" }], // Drizzle: Dense

    // Freezing Drizzle
    [56, { icon: CloudDrizzle, animation: "animate-pulse text-white" }], // Freezing Drizzle: Light
    [57, { icon: CloudRain, animation: "animate-pulse text-white" }], // Freezing Drizzle: Dense
    
    // Rain
    [61, { icon: CloudRain, animation: "text-blue-300" }], // Rain: Slight
    [63, { icon: CloudRain, animation: "text-blue-300" }], // Rain: Moderate
    [65, { icon: CloudRainWind, animation: "text-blue-400" }],// Rain: Heavy

    // Freezing Rain
    [66, { icon: CloudRain, animation: "animate-pulse text-white" }], // Freezing Rain: Light
    [67, { icon: CloudRainWind, animation: "animate-pulse text-white" }], // Freezing Rain: Heavy
    
    // Snow
    [71, { icon: CloudSnow, animation: "animate-pulse text-white" }],     // Snow fall: Slight
    [73, { icon: CloudSnow, animation: "animate-pulse text-white" }],     // Snow fall: Moderate
    [75, { icon: Snowflake, animation: "animate-pulse text-white" }],     // Snow fall: Heavy
    [77, { icon: Snowflake, animation: "animate-pulse text-white" }],     // Snow grains
    
    // Rain Showers
    [80, { icon: CloudDrizzle, animation: "text-blue-300" }], // Rain showers: Slight
    [81, { icon: CloudRain, animation: "text-blue-300" }],    // Rain showers: Moderate
    [82, { icon: CloudRainWind, animation: "text-blue-400" }],// Rain showers: Violent

    // Snow Showers
    [85, { icon: CloudSnow, animation: "animate-pulse text-white" }], // Snow showers: Slight
    [86, { icon: Snowflake, animation: "animate-pulse text-white" }], // Snow showers: Heavy
    
    // Thunderstorm
    [95, { icon: CloudLightning, animation: "text-yellow-300 animate-pulse" }], // Thunderstorm
    [96, { icon: CloudHail, animation: "text-yellow-300 animate-pulse" }], // Thunderstorm with slight hail
    [99, { icon: CloudHail, animation: "text-yellow-300 animate-pulse" }], // Thunderstorm with heavy hail
]);


export function AnimatedWeatherIcon({ code, className, isNight = false }: AnimatedWeatherIconProps) {
  
  // Night Icon Overrides
  if (isNight) {
    if (code === 0) return <Moon className={cn("text-slate-300 animate-pulse", className)} />;
    if (code >= 1 && code <= 2) return <CloudMoon className={cn("text-slate-300 animate-pulse", className)} />;
    if (code === 3) return <Cloudy className={cn("text-gray-400 animate-pulse", className)} />;
  }

  const { icon: IconComponent, animation } = iconMap.get(code) || { icon: Cloud, animation: 'animate-pulse' };

  return <IconComponent className={cn(animation, className)} />;
}
