import { Sun, Cloud, CloudRain, CloudSnow, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';

type WeatherCondition = 'Clear' | 'Clouds' | 'Rain' | 'Snow' | 'Wind' | string;

interface AnimatedWeatherIconProps {
  condition: WeatherCondition;
  className?: string;
}

const iconMap: Record<WeatherCondition, React.ElementType> = {
  Clear: Sun,
  Clouds: Cloud,
  Rain: CloudRain,
  Snow: CloudSnow,
  Wind: Wind,
};

const animationMap: Record<WeatherCondition, string> = {
  Clear: 'animate-pulse text-yellow-400',
  Clouds: 'animate-pulse text-gray-400',
  Rain: 'animate-pulse text-blue-400',
  Snow: 'animate-pulse text-white',
  Wind: 'animate-pulse text-gray-300',
};

export function AnimatedWeatherIcon({ condition, className }: AnimatedWeatherIconProps) {
  // A simplified mapping for various weather descriptions from APIs
  let normalizedCondition: WeatherCondition = 'Clear';
  if (condition.includes('Cloud')) normalizedCondition = 'Clouds';
  if (condition.includes('Rain')) normalizedCondition = 'Rain';
  if (condition.includes('Snow')) normalizedCondition = 'Snow';
  if (condition.includes('Wind')) normalizedCondition = 'Wind';

  const IconComponent = iconMap[normalizedCondition] || Sun;
  const animationClass = animationMap[normalizedCondition] || animationMap.Clear;
  
  if (normalizedCondition === 'Clear') {
      return <Sun className={cn("text-yellow-400 animate-[spin_15s_linear_infinite]", className)} />;
  }
  if (normalizedCondition === 'Rain') {
      return <CloudRain className={cn("text-blue-300", className)} />;
  }

  return <IconComponent className={cn(animationClass, className)} />;
}
