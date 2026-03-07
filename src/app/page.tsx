import type { Metadata } from 'next';
import { WeatherMain } from '@/components/weather/weather-main';
import { dictionaries, Locale, defaultLocale } from '@/lib/i18n';

interface PageProps {
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const lang = (params.lang as Locale) || 'es';
  const dict = dictionaries[lang] || dictionaries['es'];

  return {
    title: dict.seoTitle,
    description: dict.seoDescription,
  };
}

import { TranslationProvider } from '@/components/layout/translation-provider';
import { StructuredData } from '@/components/seo/structured-data';

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const lang = (params.lang as Locale) || 'es'; // Forzar 'es' como base para evitar mismatch de hidratación

  return (
    <>
      <StructuredData lang={lang} />
      <WeatherMain initialLocale={lang} />
    </>
  );
}
