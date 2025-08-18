
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Moon, CloudFog, CloudSun, Cloudy, CloudMoon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WeatherCodeInfo } from '@/lib/types';
import { weatherCodes } from '@/lib/weather-codes';


interface AnimatedWeatherIconProps {
  code: number;
  className?: string;
  isNight?: boolean;
}

export function AnimatedWeatherIcon({ code, className, isNight = false }: AnimatedWeatherIconProps) {
  const weatherInfo: WeatherCodeInfo = weatherCodes[code] || weatherCodes[0];
  
  // Night Icons
  if (isNight) {
    if (code === 0) return <Moon className={cn("text-slate-300 animate-pulse", className)} />;
    if (code >= 1 && code <= 2) return <CloudMoon className={cn("text-slate-300 animate-pulse", className)} />;
    if (code === 3) return <Cloudy className={cn("text-gray-400 animate-pulse", className)} />;
  }

  // Day Icons
  if (code === 0) return <Sun className={cn("text-yellow-400 animate-[spin_15s_linear_infinite]", className)} />;
  if (code === 1 || code === 2) return <CloudSun className={cn("text-yellow-400 animate-pulse", className)} />;
  if (code === 3) return <Cloudy className={cn("text-gray-400 animate-pulse", className)} />;
  
  // Other conditions (Fog, Rain, Snow, etc.)
  let condition: string;
  if (code === 45 || code === 48) condition = 'Fog';
  else if (code >= 51 && code <= 67) condition = 'Rain';
  else if (code >= 71 && code <= 77) condition = 'Snow';
  else if (code >= 80 && code <= 99) condition = 'Rain'; // Covers rain showers and thunderstorms
  else condition = 'Clear'; // Fallback

  const iconMap: Record<string, React.ElementType> = {
    Rain: CloudRain,
    Snow: CloudSnow,
    Fog: CloudFog,
    Wind: Wind,
    Clear: Sun, // Fallback
    Clouds: Cloudy // Fallback
  };

  const animationMap: Record<string, string> = {
    Rain: 'text-blue-300',
    Snow: 'animate-pulse text-white',
    Fog: 'animate-pulse text-gray-400',
    Wind: 'animate-pulse text-gray-300',
    Clear: 'text-yellow-400 animate-[spin_15s_linear_infinite]',
    Clouds: 'animate-pulse text-gray-400',
  };

  const IconComponent = iconMap[condition] || Cloudy;
  const animationClass = animationMap[condition] || animationMap.Clouds;

  return <IconComponent className={cn(animationClass, className)} />;
}
