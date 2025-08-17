
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
    forecast_days: "7" // Fetch 7 days to have today + 6 days forecast
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
    const { daily: dailyData, hourly: hourlyData, current: currentData, timezone } = weatherAPIData;

    // Process 6-day forecast (from tomorrow, so i=1 to i=6)
    const forecastData: DailyForecast[] = [];
    for (let i = 1; i <= 6; i++) {
        const forecastDateStr = dailyData.time[i]; // e.g. "2024-07-30"
        
        // Filter hourly data for the current forecast day
        const dayHourlyData = hourlyData.time
            .map((t, index) => ({ time: t, index })) // Keep original index
            .filter(item => item.time.startsWith(forecastDateStr))
            .map(item => ({
                time: item.time,
                temp: Math.round(hourlyData.temperature_2m[item.index]),
                main: getMainWeatherFromCode(hourlyData.weather_code[item.index]),
                pop: hourlyData.precipitation_probability[item.index],
                weatherCode: hourlyData.weather_code[item.index],
            }));
        
        const hourlyCodesForDay = dayHourlyData.map(h => h.weatherCode);
        const dominantCode = getDominantWeatherCode(hourlyCodesForDay);
        
        const dayForecast: DailyForecast = {
            dt: forecastDateStr,
            temp_min: Math.round(dailyData.temperature_2m_min[i]),
            temp_max: Math.round(dailyData.temperature_2m_max[i]),
            main: getMainWeatherFromCode(dominantCode),
            description: getWeatherDescriptionFromCode(dominantCode),
            pop: dailyData.precipitation_probability_max[i],
            hourly: dayHourlyData,
            humidity: 0, 
            wind_speed: 0, 
            temp: Math.round((dailyData.temperature_2m_max[i] + dailyData.temperature_2m_min[i]) / 2),
            feels_like: Math.round((dailyData.temperature_2m_max[i] + dailyData.temperature_2m_min[i]) / 2),
            weatherCode: dominantCode,
            sunrise: dailyData.sunrise[i],
            sunset: dailyData.sunset[i],
        };
        forecastData.push(dayForecast);
    }
    
    // Process Today's hourly data
    const todayDateStr = dailyData.time[0];
    const todayHourlyForecast: HourlyForecast[] = hourlyData.time
        .map((t, index) => ({ time: t, index }))
        .filter(item => item.time.startsWith(todayDateStr))
        .map(item => ({
            time: item.time,
            temp: Math.round(hourlyData.temperature_2m[item.index]),
            main: getMainWeatherFromCode(hourlyData.weather_code[item.index]),
            pop: hourlyData.precipitation_probability[item.index],
            weatherCode: hourlyData.weather_code[item.index],
        }));

    const isDay = currentData.is_day === 1;

    // Use hourly data for current pop, find the closest hour
    const now = new Date();
    const closestHourIndex = hourlyData.time.findIndex(
      (timeStr) => new Date(timeStr).getTime() > now.getTime()
    );
    const currentPop = hourlyData.precipitation_probability[closestHourIndex > 0 ? closestHourIndex -1 : 0];

    const weatherData: WeatherData = {
      current: {
        location: loc,
        temp: currentData.temperature_2m,
        feels_like: currentData.apparent_temperature,
        humidity: currentData.relative_humidity_2m,
        wind_speed: currentData.wind_speed_10m,
        description: getWeatherDescriptionFromCode(currentData.weather_code, isDay),
        main: getMainWeatherFromCode(currentData.weather_code),
        pop: currentPop,
        dt: new Date().toISOString(),
        temp_min: dailyData.temperature_2m_min[0],
        temp_max: dailyData.temperature_2m_max[0],
        sunrise: dailyData.sunrise[0],
        sunset: dailyData.sunset[0],
        timezone: timezone,
        weatherCode: currentData.weather_code,
      },
      forecast: forecastData,
      hourly: todayHourlyForecast,
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
