
'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';

export function ApiAttribution() {
  const { t } = useTranslation();

  return (
    <div className="text-center text-xs text-foreground/60 py-4 px-4 backdrop-blur-sm">
      <p>
        {t('attribution.weather')}{' '}
        <Link href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground/80">
          Open-Meteo
        </Link>
        . {t('attribution.geocoding')}{' '}
        <Link href="https://www.bigdatacloud.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground/80">
          BigDataCloud
        </Link>
        .
      </p>
      <p>
        {t('attribution.images')}{' '}
        <Link href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground/80">
          Google Gemini
        </Link>
        . {t('attribution.moon')}
      </p>
    </div>
  );
}
