import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const APP_URL = new URL(process.env.APP_URL || 'https://clima.clancig.com.ar');

export const metadata: Metadata = {
  title: {
    default: 'WeatherWise - Pronóstico del Tiempo con IA',
    template: '%s | WeatherWise',
  },
  description: 'Aplicación del tiempo con pronósticos precisos, búsqueda multilingüe y fondos espectaculares generados por IA (Gemini) que reflejan el clima actual.',
  metadataBase: APP_URL,
  applicationName: 'WeatherWise',
  keywords: ['clima', 'tiempo', 'pronóstico', 'temperatura', 'weather', 'forecast', 'ia', 'ai', 'inteligencia artificial', 'gemini', 'multilenguaje', 'multi-idioma'],
  authors: [{ name: 'Clancig', url: new URL('https://github.com/damianclancig/weather-wise') }],
  creator: 'Clancig',
  openGraph: {
    type: 'website',
    url: APP_URL,
    title: 'WeatherWise - Pronóstico del Tiempo con Fondos de IA',
    description: 'Consulta el pronóstico del tiempo preciso con una interfaz moderna y fondos generados por IA que se adaptan al clima.',
    siteName: 'WeatherWise',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WeatherWise App con fondo de IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WeatherWise - Pronóstico del Tiempo con IA',
    description: 'El pronóstico del tiempo más visual: datos precisos y fondos generados por IA.',
    images: ['/og-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WeatherWise',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.webmanifest',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn('font-sans antialiased', inter.variable)}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
