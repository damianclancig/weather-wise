'use server';

import type { WeatherData, OWMCurrentWeather, OWMForecast, DailyForecast, CitySuggestion } from "@/lib/types";

type FormState = {
  message: string;
  weatherData?: WeatherData;
  success: boolean;
};

// Helper function to process and structure forecast data
const processForecast = (forecastData: OWMForecast): DailyForecast[] => {
  const dailyData: { [key: string]: any[] } = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  forecastData.list.forEach(item => {
    const itemDate = new Date(item.dt * 1000);
    const date = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate()).toISOString().split('T')[0];
    
    // Only include dates after today
    if (new Date(date) > today) {
        if (!dailyData[date]) {
          dailyData[date] = [];
        }
        dailyData[date].push(item);
    }
  });

  const forecast: DailyForecast[] = Object.keys(dailyData).slice(0, 5).map(date => {
    const dayItems = dailyData[date];
    const weather = dayItems[0].weather[0];

    return {
      dt: date,
      temp_min: Math.min(...dayItems.map(i => i.main.temp_min)),
      temp_max: Math.max(...dayItems.map(i => i.main.temp_max)),
      main: weather.main,
      description: weather.description,
      pop: dayItems.reduce((acc, i) => Math.max(acc, i.pop), 0),
    };
  });

  return forecast;
};

// This function now fetches data from the OpenWeatherMap API.
export async function getWeather(prevState: FormState, formData: FormData): Promise<FormState> {
  const location = formData.get('location') as string;
  const latitude = formData.get('latitude') as string;
  const longitude = formData.get('longitude') as string;
  
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    console.error("OpenWeatherMap API key is missing.");
    return { ...prevState, success: false, message: 'fetchError' };
  }

  if (!location && !(latitude && longitude)) {
    return { ...prevState, success: false, message: 'noLocationProvided' };
  }

  let currentWeatherUrl = '';
  let forecastUrl = '';

  if (latitude && longitude) {
    currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
    forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
  } else if (location) {
    currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;
    forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`;
  }

  if (!currentWeatherUrl || !forecastUrl) {
    return { ...prevState, success: false, message: 'noLocationProvided' };
  }

  try {
    const [currentWeatherResponse, forecastResponse] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl),
    ]);

    if (!currentWeatherResponse.ok || !forecastResponse.ok) {
      const errorData = !currentWeatherResponse.ok ? await currentWeatherResponse.json() : await forecastResponse.json();
      console.error("API Error:", errorData.message);
      return { ...prevState, success: false, message: 'fetchError' };
    }

    const currentWeatherData: OWMCurrentWeather = await currentWeatherResponse.json();
    const forecastData: OWMForecast = await forecastResponse.json();

    const weatherData: WeatherData = {
      current: {
        location: `${currentWeatherData.name}, ${currentWeatherData.sys.country}`,
        temp: currentWeatherData.main.temp,
        feels_like: currentWeatherData.main.feels_like,
        humidity: currentWeatherData.main.humidity,
        wind_speed: currentWeatherData.wind.speed * 3.6, // m/s to kph
        description: currentWeatherData.weather[0].description,
        main: currentWeatherData.weather[0].main,
        pop: forecastData.list[0]?.pop ?? 0,
      },
      forecast: processForecast(forecastData),
    };

    return { ...prevState, success: true, weatherData, message: '' };

  } catch (error) {
    console.error("Network or parsing error:", error);
    return { ...prevState, success: false, message: 'fetchError' };
  }
}

export async function getCitySuggestions(query: string): Promise<CitySuggestion[]> {
  if (query.length < 3) {
    return [];
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.error("OpenWeatherMap API key is missing.");
    return [];
  }

  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    
    // Map to our CitySuggestion type and remove duplicates
    const suggestions: CitySuggestion[] = [];
    const seen = new Set<string>();

    data.forEach((item: any) => {
      const name = `${item.name}, ${item.country}`;
      if (!seen.has(name)) {
        suggestions.push({
          name: name,
          lat: item.lat,
          lon: item.lon,
        });
        seen.add(name);
      }
    });

    return suggestions;
  } catch (error) {
    console.error("Error fetching city suggestions:", error);
    return [];
  }
}