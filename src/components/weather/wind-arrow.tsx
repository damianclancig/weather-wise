
'use client';

import { Navigation } from 'lucide-react';
import type { Locale } from '@/lib/i18n';

interface WindArrowProps {
  degrees: number;
  locale: Locale;
}

const directions: Record<Locale, string[]> = {
    en: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
    es: ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'],
    pt: ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'],
};

const getWindDirection = (degrees: number, locale: Locale) => {
  const localeDirections = directions[locale] || directions['en'];
  const index = Math.round(degrees / 45) % 8;
  return localeDirections[index];
};

export function WindArrow({ degrees, locale }: WindArrowProps) {
  const direction = getWindDirection(degrees, locale);

  return (
    <div className="flex items-center gap-1">
      <Navigation
        className="w-3 h-3 transition-transform duration-500"
        style={{ transform: `rotate(${degrees - 45}deg)` }}
      />
      <span className="text-xs font-medium">{direction}</span>
    </div>
  );
}
