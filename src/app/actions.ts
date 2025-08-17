
'use server';

import type { WeatherData, DailyForecast, HourlyForecast, CitySuggestion, OpenMeteoWeatherData, OpenMeteoDaily, OpenMeteoHourly, OpenMeteoCurrent, WeatherCodeInfo } from "@/lib/types";
import { weatherCodes } from "@/lib/weather-codes";

const getWeatherDescriptionFromCode = (code: number, isDay: boolean = true): string => {
  const codeInfo: WeatherCodeInfo = weatherCodes[code] || weatherCodes[0];
  const descriptionKey = codeInfo.description.replace(/\s+/g, '_').toLowerCase();
  return descriptionKey;
};

const getMainWeatherFromCode = (code: number): string => {
  if ([0, 1].includes(code)) return 'Clear';
  if ([2, 3].includes(code)) return 'Clouds';
  if ([45, 48].includes(code)) return 'Fog';
  if (code >= 51 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Clear';
}

const getDominantWeatherCode = (hourlyCodes: number[]): number => {
    if (!hourlyCodes || hourlyCodes.length === 0) return 0;

    // We only care about daytime weather for the daily summary icon (e.g. 7am to 7pm)
    const daytimeCodes = hourlyCodes.slice(7, 19);

    if (daytimeCodes.length === 0) {
        return hourlyCodes[Math.floor(hourlyCodes.length / 2)] || 0;
    }
    
    const codeCounts = daytimeCodes.reduce((acc, code) => {
        acc[code] = (acc[code] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    // Find the most frequent code
    const dominantCode = Object.entries(codeCounts).reduce((a, b) => (b[1] > a[1] ? b : a))[0];

    return parseInt(dominantCode, 10);
};

const processHourlyForecast = (hourlyData: OpenMeteoHourly, dayIndex: number): HourlyForecast[] => {
  const startIndex = dayIndex * 24;
  const endIndex = startIndex + 24;

  if (startIndex >= hourlyData.time.length) return [];

  return hourlyData.time.slice(startIndex, endIndex).map((timeISO, i) => {
    const index = startIndex + i;
    const code = hourlyData.weather_code[index];
    
    return {
      time: timeISO,
      temp: Math.round(hourlyData.temperature_2m[index]),
      main: getMainWeatherFromCode(code),
      pop: hourlyData.precipitation_probability[index],
      weatherCode: code,
    };
  });
};

const processForecast = (weatherAPIData: OpenMeteoWeatherData): { daily: DailyForecast[], todayTemps: { min: number, max: number } } => {
  const { daily, hourly } = weatherAPIData;
  
  const todayTemps = {
    min: daily.temperature_2m_min[0],
    max: daily.temperature_2m_max[0],
  };

  const aggregatedForecast: DailyForecast[] = daily.time.slice(1, 7).map((date, i) => {
    const dayIndex = i + 1;
    const hourlyCodesForDay = hourly.weather_code.slice(dayIndex * 24, (dayIndex + 1) * 24);
    const dominantCode = getDominantWeatherCode(hourlyCodesForDay);
    
    return {
      dt: date,
      temp_min: Math.round(daily.temperature_2m_min[dayIndex]),
      temp_max: Math.round(daily.temperature_2m_max[dayIndex]),
      main: getMainWeatherFromCode(dominantCode),
      description: getWeatherDescriptionFromCode(dominantCode),
      pop: daily.precipitation_probability_max[dayIndex],
      hourly: processHourlyForecast(hourly, dayIndex),
      humidity: 0, // Open-Meteo provides hourly humidity, not daily aggregate. Could be calculated.
      wind_speed: 0, // Open-Meteo provides hourly wind, not daily aggregate.
      temp: Math.round((daily.temperature_2m_max[dayIndex] + daily.temperature_2m_min[dayIndex]) / 2),
      feels_like: Math.round((daily.temperature_2m_max[dayIndex] + daily.temperature_2m_min[dayIndex]) / 2), // Open-Meteo doesn't provide daily feels_like
      weatherCode: dominantCode,
      sunrise: daily.sunrise[dayIndex],
      sunset: daily.sunset[dayIndex],
    };
  });

  return { daily: aggregatedForecast, todayTemps };
};

export async function getCityFromCoords(lat: number, lon: number): Promise<string> {
  const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
  try {
    const response = await fetch(geoUrl);
    if (!response.ok) return "Current Location";
    const data = await response.json();
    return `${data.city}, ${data.countryCode}`;
  } catch (error) {
    return "Current Location";
  }
}

// This function now fetches data from the Open-Meteo API.
export async function getWeather(prevState: any, formData: FormData): Promise<any> {
  const locationName = formData.get('location') as string;
  let latitude = formData.get('latitude') as string;
  let longitude = formData.get('longitude') as string;

  if (!locationName && !(latitude && longitude)) {
    return { ...prevState, success: false, message: 'noLocationProvided' };
  }
  
  let lat = latitude;
  let lon = longitude;
  let loc = locationName;

  // If we only have a name, geocode it first.
  if (locationName && (!latitude || !longitude)) {
      const suggestions = await getCitySuggestions(locationName);
      if (suggestions.length > 0) {
          lat = suggestions[0].lat.toString();
          lon = suggestions[0].lon.toString();
          loc = suggestions[0].name;
      } else {
          return { ...prevState, success: false, message: 'fetchError' };
      }
  } else if (latitude && longitude && !locationName) {
      loc = await getCityFromCoords(parseFloat(latitude), parseFloat(longitude));
  }

  const weatherParams = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m",
    hourly: "temperature_2m,precipitation_probability,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max",
    timezone: "auto",
  });
  
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?${weatherParams}`;

  try {
    const weatherResponse = await fetch(weatherUrl, { next: { revalidate: 0 } });

    if (!weatherResponse.ok) {
      const errorData = await weatherResponse.json();
      console.error("API Error:", errorData.reason);
      return { ...prevState, success: false, message: 'fetchError' };
    }

    const weatherAPIData: OpenMeteoWeatherData = await weatherResponse.json();
    const { daily: processedForecast, todayTemps } = processForecast(weatherAPIData);

    const current: OpenMeteoCurrent = weatherAPIData.current;
    const isDay = current.is_day === 1;

    // Use hourly data for current pop, find the closest hour
    const now = new Date();
    const closestHourIndex = weatherAPIData.hourly.time.findIndex(
      (timeStr, index) => {
        const hourDate = new Date(timeStr);
        return now.getTime() < hourDate.getTime();
      }
    );
    
    const currentPop = weatherAPIData.hourly.precipitation_probability[closestHourIndex > 0 ? closestHourIndex -1 : 0];

    const weatherData: WeatherData = {
      current: {
        location: loc,
        temp: current.temperature_2m,
        feels_like: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        wind_speed: current.wind_speed_10m,
        description: getWeatherDescriptionFromCode(current.weather_code, isDay),
        main: getMainWeatherFromCode(current.weather_code),
        pop: currentPop,
        dt: new Date().toISOString(),
        temp_min: todayTemps.min,
        temp_max: todayTemps.max,
        sunrise: weatherAPIData.daily.sunrise[0],
        sunset: weatherAPIData.daily.sunset[0],
        timezone: weatherAPIData.timezone,
        weatherCode: current.weather_code,
      },
      forecast: processedForecast,
      hourly: processHourlyForecast(weatherAPIData.hourly, 0),
    };

    return { ...prevState, success: true, weatherData, message: '' };

  } catch (error) {
    console.error("Network or parsing error:", error);
    return { ...prevState, success: false, message: 'fetchError' };
  }
}

export async function getCityName(lat: number, lon: number): Promise<string> {
  return getCityFromCoords(lat, lon);
}

export async function getCitySuggestions(query: string): Promise<CitySuggestion[]> {
  if (query.length < 3) {
    return [];
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    
    if (!data.results) return [];

    // Map to our CitySuggestion type and remove duplicates
    const suggestions: CitySuggestion[] = [];
    const seen = new Set<string>();

    data.results.forEach((item: any) => {
      const name = `${item.name}, ${item.country}`;
      if (!seen.has(name)) {
        suggestions.push({
          name: name,
          lat: item.latitude,
          lon: item.longitude,
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
