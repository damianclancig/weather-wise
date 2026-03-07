
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from 'next/script';
import { dictionaries, defaultLocale } from '@/lib/i18n';
import { TranslationProvider } from '@/components/layout/translation-provider';


const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// Use the production URL as the base for SEO, but allow override via environment variable.
const APP_URL = new URL(process.env.APP_URL || 'https://clima.clancig.com.ar');
const GOOGLE_ADSENSE_PUB_ID = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_PUB_ID;

const baseUrl = 'https://clima.clancig.com.ar';

export const viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: APP_URL,
  title: {
    default: "MeteoClan: Pronóstico del Tiempo Preciso y Paisajes con IA en Tiempo Real",
    template: "%s | MeteoClan",
  },
  description: "Descubre el clima con MeteoClan. Pronósticos precisos por hora, búsqueda global de ciudades y fondos dinámicos generados por IA que reflejan el estado del cielo en tiempo real.",
  applicationName: "MeteoClan",
  keywords: [
    'clima', 'tiempo', 'pronóstico', 'temperatura', 'weather', 'forecast', 'ia', 'ai',
    'inteligencia artificial', 'gemini', 'multilenguaje', 'multi-idioma', 'fases lunares',
    'direccion del viento', 'pronóstico del tiempo por hora', 'clima hoy', 'pronóstico a 7 días',
    'mapa del tiempo', 'IA generativa paisajes', 'hourly weather', '7 day forecast',
    'AI weather app', 'Generative AI weather', 'clima preciso', 'meteorología',
    'weather forecast worldwide', 'real-time weather updates', 'clima en vivo'
  ],
  authors: [{ name: 'Clancig FullstackDev', url: 'https://www.clancig.com.ar' }],
  creator: 'Damián Clancig',
  publisher: 'Damián Clancig',
  alternates: {
    canonical: '/',
    languages: {
      'es-AR': '/?lang=es',
      'en-US': '/?lang=en',
      'pt-BR': '/?lang=pt',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: '/',
    siteName: "MeteoClan",
    title: "MeteoClan: Pronóstico del Tiempo Preciso y Paisajes con IA en Tiempo Real",
    description: "Pronósticos precisos y paisajes dinámicos generados por IA que reflejan el clima real en tiempo real.",
    images: [
      {
        url: '/og-image.webp',
        width: 1200,
        height: 630,
        alt: "MeteoClan - Pronóstico del tiempo con paisajes de IA dinámicos.",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "MeteoClan: Pronóstico del Tiempo Preciso y Paisajes con IA en Tiempo Real",
    description: "Pronósticos precisos y paisajes dinámicos generados por IA que reflejan el clima real.",
    images: ['/og-image.webp'],
    creator: '@dclancig',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "MeteoClan",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {GOOGLE_ADSENSE_PUB_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADSENSE_PUB_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className={cn('font-sans antialiased', inter.variable)}>
        <TranslationProvider initialLocale="es">
          {children}
          <Toaster />
          <Analytics />
          <SpeedInsights />
          {/* Registro estándar y tradicional para máxima compatibilidad de Service Worker */}
          <script defer src="/register-sw.js"></script>
        </TranslationProvider>
      </body>
    </html>
  );
}
