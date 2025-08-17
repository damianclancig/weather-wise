
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Moon, CloudFog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { weatherCodes } from '@/lib/weather-codes';
import type { WeatherCodeInfo } from '@/lib/types';


interface AnimatedWeatherIconProps {
  code: number;
  className?: string;
  isNight?: boolean;
}

export function AnimatedWeatherIcon({ code, className, isNight = false }: AnimatedWeatherIconProps) {
  const weatherInfo: WeatherCodeInfo = weatherCodes[code] || weatherCodes[0];
  
  // Specific condition for night
  if (isNight && (code === 0 || code === 1)) {
    return <Moon className={cn("text-slate-300 animate-pulse", className)} />;
  }

  // Map WMO code to our simplified condition for icon selection
  let condition: string;
  if (code <= 1) condition = 'Clear';
  else if (code <= 3) condition = 'Clouds';
  else if (code === 45 || code === 48) condition = 'Fog';
  else if (code >= 51 && code <= 67) condition = 'Rain';
  else if (code >= 71 && code <= 77) condition = 'Snow';
  else if (code >= 80 && code <= 99) condition = 'Rain'; // Covers rain showers and thunderstorms
  else condition = 'Clear';

  if (condition === 'Clear') {
    return <Sun className={cn("text-yellow-400 animate-[spin_15s_linear_infinite]", className)} />;
  }

  const iconMap: Record<string, React.ElementType> = {
    Clouds: Cloud,
    Rain: CloudRain,
    Snow: CloudSnow,
    Fog: CloudFog,
    Wind: Wind, // Keeping Wind for potential future use
  };

  const animationMap: Record<string, string> = {
    Clouds: 'animate-pulse text-gray-400',
    Rain: 'text-blue-300',
    Snow: 'animate-pulse text-white',
    Fog: 'animate-pulse text-gray-400',
    Wind: 'animate-pulse text-gray-300',
  };

  const IconComponent = iconMap[condition] || Cloud;
  const animationClass = animationMap[condition] || animationMap.Clouds;

  return <IconComponent className={cn(animationClass, className)} />;
}
