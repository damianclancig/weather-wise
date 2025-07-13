import en from './en';
import es from './es';
import pt from './pt';

export const dictionaries = {
  en,
  es,
  pt,
};

export type Locale = keyof typeof dictionaries;

export const defaultLocale: Locale = 'en';
