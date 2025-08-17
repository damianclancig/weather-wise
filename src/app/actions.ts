
'use server';

import type { WeatherData, OWMCurrentWeather, OWMForecast, DailyForecast, HourlyForecast, CitySuggestion, OWMForecastItem } from "@/lib/types";


const processHourlyForecast = (hourlyItems: OWMForecastItem[], timezoneOffset: number): HourlyForecast[] => {
  return hourlyItems.map(item => {
    const localTime = new Date((item.dt * 1000) + timezoneOffset);
    
    const time = localTime.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    });
    
    return {
      time: time,
      temp: Math.round(item.main.temp),
      main: item.weather[0].main,
      pop: item.pop,
    };
  });
};

// Helper function to process and structure forecast data
const processForecast = (forecastData: OWMForecast): DailyForecast[] => {
  const dailyData: { [key: string]: OWMForecastItem[] } = {};
  const timezoneOffset = forecastData.city.timezone * 1000;

  // Group forecast items by date
  forecastData.list.forEach(item => {
    const date = new Date((item.dt * 1000) + timezoneOffset).toISOString().split('T')[0];
    if (!dailyData[date]) {
      dailyData[date] = [];
    }
    dailyData[date].push(item);
  });
  
  let sortedDays = Object.keys(dailyData).sort();
  
  // The first day in the list is always the current day, so we remove it to start from tomorrow.
  if (sortedDays.length > 1) {
    sortedDays.shift();
  }

  // We take the next 5 days for the forecast.
  const aggregatedForecast: DailyForecast[] = sortedDays.slice(0, 5).map(date => {
    const dayItems = dailyData[date];
    const weather = dayItems[0].weather[0];

    // For the main display, let's use the data from around midday if available
    const representativeItem = dayItems.find(i => new Date(i.dt * 1000).getUTCHours() >= 12) || dayItems[0];

    return {
      dt: date,
      temp_min: Math.min(...dayItems.map(i => i.main.temp_min)),
      temp_max: Math.max(...dayItems.map(i => i.main.temp_max)),
      main: weather.main,
      description: weather.description,
      pop: dayItems.reduce((acc, i) => Math.max(acc, i.pop), 0),
      hourly: processHourlyForecast(dayItems, timezoneOffset),
      // Add aggregated data for when this day is selected
      humidity: Math.round(dayItems.reduce((acc, i) => acc + i.main.humidity, 0) / dayItems.length),
      wind_speed: Math.round(dayItems.reduce((acc, i) => acc + i.wind.speed, 0) / dayItems.length * 3.6),
      temp: Math.round(representativeItem.main.temp),
      feels_like: Math.round(representativeItem.main.feels_like),
    };
  });
  
  return aggregatedForecast;
};


// This function now fetches data from the OpenWeatherMap API.
export async function getWeather(prevState: any, formData: FormData): Promise<any> {
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
    const timezoneOffset = forecastData.city.timezone * 1000;

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
        dt: currentWeatherData.dt * 1000,
      },
      forecast: processForecast(forecastData),
      hourly: processHourlyForecast(forecastData.list.slice(0, 8), timezoneOffset),
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
