'use client';

import { useState, useEffect, useCallback, useActionState, useRef } from 'react';
import type { WeatherData, DailyForecast, CurrentWeather, HourlyForecast } from '@/lib/types';
import { getWeather, getCityName, generateAndSetBackground } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from '@/hooks/use-translation';

type FormState = {
  message: string;
  weatherData?: WeatherData;
  success: boolean;
  errorDetail?: string;
};

const initialState: FormState = {
  message: '',
  success: false,
};

export type DisplayWeather = CurrentWeather | (DailyForecast & Pick<CurrentWeather, 'location' | 'timezone'>);

export const useWeather = () => {
  const [state, formAction] = useActionState(getWeather, initialState);
  const { toast } = useToast();
  const { t } = useTranslation();

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [displayData, setDisplayData] = useState<DisplayWeather | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyForecast[]>([]);
  const [selectedDayId, setSelectedDayId] = useState<string | null>('today');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FormState | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string>('');

  const initialFetchFormRef = useRef<HTMLFormElement>(null);
  const isInitialFetchDone = useRef(false);

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
          if (latInput) latInput.value = '40.71';
          if (lonInput) lonInput.value = '-74.01';
          if (locInput) locInput.value = 'New York';
        }

        form.requestSubmit();
    }
  }, []);

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
        });
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
      setError(state);
      toast({
        variant: "destructive",
        title: t('errorTitle'),
        description: t(state.message === 'fetchError' ? 'fetchError' : 'geolocationError'),
      });
      setIsLoading(false);
    }
  }, [state, t, toast, weatherData]);

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

  const handleDaySelect = (day: DailyForecast) => {
    if (!weatherData) return;

    const newDisplayData: DisplayWeather = {
      ...day,
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

  return {
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
  };
};
