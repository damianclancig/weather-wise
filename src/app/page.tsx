
'use client';

import { useState, useEffect, useCallback, useActionState, useRef } from 'react';

import type { WeatherData, DailyForecast, CurrentWeather, HourlyForecast } from '@/lib/types';
import { getWeather, getCityName, generateAndSetBackground } from '@/app/actions';
import { useToast } from "@/hooks/use-toast"
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

type FormState = {
  message: string;
  weatherData?: WeatherData;
  success: boolean;
};

const initialState: FormState = {
  message: '',
  success: false,
};

// This new type will hold the data for the main display card.
// It must include all properties needed by child components.
// We combine properties from CurrentWeather and DailyForecast.
type DisplayWeather = CurrentWeather | (DailyForecast & Pick<CurrentWeather, 'location' | 'timezone'>);


const parseDateString = (dt: string | number) => {
    const dtStr = String(dt);
    // If it's just a date 'YYYY-MM-DD', replace dashes to avoid UTC parsing issues.
    // If it's a full ISO string, it can be parsed directly.
    if (!dtStr.includes('T')) {
      return new Date(dtStr.replace(/-/g, '/'));
    }
    return new Date(dtStr);
};


export default function Home() {
  const [state, formAction] = useActionState(getWeather, initialState);
  const { toast } = useToast();
  const { t, locale } = useTranslation();

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [displayData, setDisplayData] = useState<DisplayWeather | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyForecast[]>([]);
  const [selectedDayId, setSelectedDayId] = useState<string | null>('today');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [backgroundHeight, setBackgroundHeight] = useState<number | null>(null);
  
  const initialFetchFormRef = useRef<HTMLFormElement>(null);
  const isInitialFetchDone = useRef(false);

  useEffect(() => {
    // Set the background height once on component mount, adding 20% to ensure it covers the full scroll length
    setBackgroundHeight(window.innerHeight * 1.2);
  }, []);

  const submitInitialForm = useCallback((lat?: number, lon?: number, loc?: string) => {
    if (initialFetchFormRef.current) {
        const form = initialFetchFormRef.current;
        const latInput = form.elements.namedItem('latitude') as HTMLInputElement;
        const lonInput = form.elements.namedItem('longitude') as HTMLInputElement;
        const locInput = form.elements.namedItem('location') as HTMLInputElement;

        if (lat && lon) {
          if (latInput) latInput.value = lat.toString();
          if (lonInput) lonInput.value = lon.toString();
          if (locInput && loc) locInput.value = loc;
        } else {
          // Fallback to a default location if geolocation fails
          if (latInput) latInput.value = '40.71';
          if (lonInput) lonInput.value = '-74.01';
          if (locInput) locInput.value = 'New York';
        }
        
        form.requestSubmit();
    }
  }, []);

  const handleDaySelect = (day: DailyForecast) => {
    if (!weatherData) return;
  
    // Create a complete DisplayWeather object for the selected forecast day
    const newDisplayData: DisplayWeather = {
      ...day,
      // Inherit properties from the current weather data that are not in the daily forecast
      location: weatherData.current.location, 
      timezone: weatherData.current.timezone,
    };
  
    setDisplayData(newDisplayData);
    setHourlyData(day.hourly);
    setSelectedDayId(day.dt);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleShowToday = () => {
    if (weatherData) {
      setDisplayData(weatherData.current);
      setHourlyData(weatherData.hourly);
      setSelectedDayId('today');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const handleRefreshLocation = useCallback(() => {
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const cityName = await getCityName(latitude, longitude);
        submitInitialForm(latitude, longitude, cityName);
      },
      (error) => {
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: t('errorTitle'),
          description: t('geolocationError'),
        });
      }
    );
  }, [submitInitialForm, t, toast]);

  useEffect(() => {
    if (isInitialFetchDone.current) return;
    isInitialFetchDone.current = true;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const cityName = await getCityName(latitude, longitude);
        submitInitialForm(latitude, longitude, cityName);
      },
      () => {
        toast({
          variant: "destructive",
          title: t('errorTitle'),
          description: t('geolocationError'),
        })
        // Fallback if user denies geolocation
        submitInitialForm();
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    if (state.success && state.weatherData) {
      setWeatherData(state.weatherData);
      setDisplayData(state.weatherData.current);
      setHourlyData(state.weatherData.hourly);
      setSelectedDayId('today');
      setError(null);
      setIsLoading(false);
    } else if (!state.success && state.message) {
      if (state.message === 'noLocationProvided' && weatherData) {
         return;
      }
      setError(state.message);
      toast({
        variant: "destructive",
        title: t('errorTitle'),
        description: t(state.message === 'fetchError' ? 'fetchError' : 'geolocationError'),
      })
      setIsLoading(false);
    }
  }, [state, t, toast, weatherData]);

  // Effect to generate background image after weather data is loaded
  useEffect(() => {
    if (weatherData) {
      const generate = async () => {
        try {
          const bgImage = await generateAndSetBackground({
            city: weatherData.current.location,
            weather: weatherData.current.description,
          });
          if (bgImage) {
            setBackgroundImage(bgImage);
          }
        } catch (e) {
          console.error("Failed to generate background image asynchronously", e);
        }
      };
      generate();
    }
  }, [weatherData]);

  const dateForMoon = displayData ? parseDateString(displayData.dt) : null;
  // Use the latitude from the central weatherData state to ensure it's always available
  const latitudeForMoon = weatherData?.latitude;


  return (
    <>
      {/* Background Layer */}
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

      {/* Content Layer */}
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
                <GlassCard className="mt-20">
                  <div className="flex flex-col items-center justify-center text-destructive-foreground gap-4">
                    <AlertTriangle className="w-12 h-12 text-destructive" />
                    <h2 className="text-2xl font-bold">{t('errorTitle')}</h2>
                    <p>{t(error)}</p>
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
