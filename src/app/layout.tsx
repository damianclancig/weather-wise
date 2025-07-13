import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const APP_URL = new URL(process.env.APP_URL || 'https://clima.clancig.com.ar');

export const metadata: Metadata = {
  title: {
    default: 'WeatherWise - Pronóstico del Tiempo en Tiempo Real',
    template: '%s | WeatherWise',
  },
  description: 'Obtén el pronóstico del tiempo preciso y actualizado para cualquier ciudad del mundo. Consulta la temperatura, humedad, viento y la previsión para los próximos 5 días.',
  metadataBase: APP_URL,
  applicationName: 'WeatherWise',
  keywords: ['clima', 'tiempo', 'pronóstico', 'temperatura', 'weather', 'forecast'],
  authors: [{ name: 'Clancig', url: APP_URL }],
  creator: 'Clancig',
  openGraph: {
    type: 'website',
    url: APP_URL,
    title: 'WeatherWise - Pronóstico del Tiempo en Tiempo Real',
    description: 'Consulta el pronóstico del tiempo preciso para cualquier ciudad.',
    siteName: 'WeatherWise',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WeatherWise App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WeatherWise - Pronóstico del Tiempo',
    description: 'El pronóstico del tiempo preciso y actualizado para tu ciudad.',
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
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
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
