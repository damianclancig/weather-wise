
'use client';

import { useState, useEffect, useCallback } from 'react';
import { dictionaries, Locale, defaultLocale } from '@/lib/i18n';

export function useTranslation() {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.language) {
      const browserLang = navigator.language.split('-')[0] as Locale;
      if (browserLang in dictionaries) {
        setLocale(browserLang);
      }
    }
  }, []);

  const t = useCallback((key: string, values?: Record<string, string | number>): string => {
      if (key.includes('undefined')) {
          return key;
      }
      const dict = dictionaries[locale] || dictionaries[defaultLocale];
      const keys = key.split('.');
      let result: any = dict;
      for (const k of keys) {
        result = result?.[k];
        if (result === undefined) {
          return key;
        }
      }
      
      let str = result as string;

      if (values) {
        Object.entries(values).forEach(([k, v]) => {
          str = str.replace(`{${k}}`, String(v));
        });
      }

      return str || key;
    },
    [locale]
  );
  
  return { t, locale, setLocale };
}
