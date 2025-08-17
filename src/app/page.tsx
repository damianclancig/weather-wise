
'use client';

import { useState, useEffect, useCallback, useActionState, useRef } from 'react';

import type { WeatherData, DailyForecast, CurrentWeather, HourlyForecast } from '@/lib/types';
import { getWeather } from '@/app/actions';
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from '@/hooks/use-translation';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CurrentWeather as CurrentWeatherComponent } from '@/components/weather/current-weather';
import { Forecast } from '@/components/weather/forecast';
import { Loader, AlertTriangle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';

type FormState = {
  message: string;
  weatherData?: WeatherData;
  success: boolean;
};

const initialState: FormState = {
  message: '',
  success: false,
};

// This new type will hold the data for the main display card
type DisplayWeather = Omit<CurrentWeather, 'dt'> & { dt: number | string };

export default function Home() {
  const [state, formAction] = useActionState(getWeather, initialState);
  const { toast } = useToast();
  const { t } = useTranslation();

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [displayData, setDisplayData] = useState<DisplayWeather | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyForecast[]>([]);
  const [selectedDayId, setSelectedDayId] = useState<string | null>('today');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const initialFetchFormRef = useRef<HTMLFormElement>(null);
  const isInitialFetchDone = useRef(false);

  const submitInitialForm = useCallback((lat?: number, lon?: number) => {
    if (initialFetchFormRef.current) {
        const form = initialFetchFormRef.current;
        const latInput = form.elements.namedItem('latitude') as HTMLInputElement;
        const lonInput = form.elements.namedItem('longitude') as HTMLInputElement;
        const locInput = form.elements.namedItem('location') as HTMLInputElement;

        if (lat && lon) {
          if (latInput) latInput.value = lat.toString();
          if (lonInput) lonInput.value = lon.toString();
          if (locInput) locInput.value = '';
        } else {
          if (latInput) latInput.value = '';
          if (lonInput) lonInput.value = '';
          if (locInput) locInput.value = 'New York';
        }
        
        form.requestSubmit();
    }
  }, []);

  const handleDaySelect = (day: DailyForecast) => {
    if (!weatherData) return;
    
    // Construct the display data from the selected forecast day
    const newDisplayData: DisplayWeather = {
      location: weatherData.current.location, // Location stays the same
      dt: day.dt,
      main: day.main,
      description: day.description,
      temp: day.temp,
      feels_like: day.feels_like,
      humidity: day.humidity,
      wind_speed: day.wind_speed,
      pop: day.pop,
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

  useEffect(() => {
    if (isInitialFetchDone.current) return;
    isInitialFetchDone.current = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        submitInitialForm(position.coords.latitude, position.coords.longitude);
      },
      () => {
        toast({
          variant: "destructive",
          title: t('errorTitle'),
          description: t('geolocationError'),
        })
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
        description: t(state.message),
      })
      setIsLoading(false);
    }
  }, [state, t, toast, weatherData]);


  return (
    <div className="flex flex-col min-h-screen bg-background font-body bg-gradient-to-br from-background to-[hsl(224,57%,15%)]">
      <Header formAction={formAction} />
       <form ref={initialFetchFormRef} action={formAction} className="hidden">
          <input type="hidden" name="latitude" />
          <input type="hidden" name="longitude" />
          <input type="hidden" name="location" />
      </form>
      <main className="flex-grow px-4 py-2">
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
            <div key={displayData.location + displayData.dt} className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
              <div className="lg:col-span-3">
                <CurrentWeatherComponent data={displayData as CurrentWeather} hourlyData={hourlyData} />
              </div>
              <div className="lg:col-span-3">
                <Forecast 
                  data={weatherData.forecast} 
                  onDaySelect={handleDaySelect} 
                  onShowToday={handleShowToday}
                  selectedDayId={selectedDayId}
                />
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
