'use client';

import { useEffect, useState } from 'react';
import type { DisplayWeather } from '@/hooks/use-weather';
import { useWeather } from '@/hooks/use-weather';
import { useTranslation } from '@/hooks/use-translation';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ApiAttribution } from '@/components/layout/api-attribution';
import { SearchControls } from '@/components/weather/search-controls';
import { CurrentWeather as CurrentWeatherComponent } from '@/components/weather/current-weather';
import { Forecast } from '@/components/weather/forecast';
import { Loader, AlertTriangle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { MoonCalendar } from '@/components/weather/moon-calendar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { parseDateString } from '@/lib/date-utils';

export default function Home() {
  const { t, locale } = useTranslation();
  const {
    weatherData,
    displayData,
    hourlyData,
    selectedDayId,
    isLoading,
    error,
    backgroundImage,
    initialFetchFormRef,
    formAction,
    handleDaySelect,
    handleShowToday,
    handleRefreshLocation,
  } = useWeather();
  
  const [backgroundHeight, setBackgroundHeight] = useState<number | null>(null);

  useEffect(() => {
    setBackgroundHeight(window.innerHeight * 1.2);
  }, []);

  const dateForMoon = displayData ? parseDateString(displayData.dt) : null;
  const latitudeForMoon = weatherData?.latitude;

  return (
    <>
      <div 
        className="fixed inset-x-0 top-0 z-[-1] bg-background"
        style={{ height: backgroundHeight ? `${backgroundHeight}px` : '100vh' }}
      >
        {backgroundImage && (
          <img
            src={backgroundImage}
            alt="Generated weather background"
            className="h-full w-full object-cover transition-opacity duration-1000 ease-in-out"
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-0 flex min-h-screen flex-col">
        <Header />
        <form ref={initialFetchFormRef} action={formAction} className="hidden">
          <input type="hidden" name="latitude" />
          <input type="hidden" name="longitude" />
          <input type="hidden" name="location" />
        </form>
        <main className="flex-grow px-4 py-2">
          <div className="w-full max-w-4xl mx-auto mb-8 relative">
            <SearchControls formAction={formAction} onRefreshLocation={handleRefreshLocation} locale={locale} />
          </div>
          <div className="flex justify-center items-start h-full">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center text-foreground/80 gap-4 mt-20">
                <Loader className="w-12 h-12 animate-spin" />
                <p className="text-xl">{t('loading')}</p>
              </div>
            ) : error && !weatherData ? (
                <GlassCard className="mt-20 p-6">
                  <div className="flex flex-col items-center justify-center text-destructive-foreground gap-4">
                    <AlertTriangle className="w-12 h-12 text-destructive" />
                    <h2 className="text-2xl font-bold">{t('errorTitle')}</h2>
                    <p>{t(error.message)}</p>
                    {error.errorDetail && (
                       <Accordion type="single" collapsible className="w-full text-foreground/80">
                         <AccordionItem value="item-1">
                           <AccordionTrigger>Ver detalles técnicos</AccordionTrigger>
                           <AccordionContent className="bg-black/20 p-2 rounded-md font-mono text-xs">
                             {error.errorDetail}
                           </AccordionContent>
                         </AccordionItem>
                       </Accordion>
                    )}
                  </div>
                </GlassCard>
            ) : weatherData && displayData ? (
              <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
                <GlassCard className="lg:col-span-3" id="current-weather">
                  <CurrentWeatherComponent data={displayData} hourlyData={hourlyData} />
                </GlassCard>
                <GlassCard className="lg:col-span-3" id="forecast">
                  <Forecast 
                    data={weatherData.forecast} 
                    onDaySelect={handleDaySelect} 
                    onShowToday={handleShowToday}
                    selectedDayId={selectedDayId}
                  />
                </GlassCard>
                {dateForMoon && latitudeForMoon !== undefined && !isNaN(dateForMoon.getTime()) && (
                  <GlassCard className="lg:col-span-3" id="moon-calendar">
                      <MoonCalendar date={dateForMoon} latitude={latitudeForMoon} />
                  </GlassCard>
                )}
              </div>
            ) : null}
          </div>
        </main>
        <ApiAttribution />
        <Footer />
      </div>
    </>
  );
}
