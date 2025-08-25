
'use server';

import type { WeatherData, DailyForecast, HourlyForecast, CitySuggestion, OpenMeteoWeatherData, OpenMeteoDaily, OpenMeteoHourly, OpenMeteoCurrent, WeatherCodeInfo, GenerateBackgroundInput } from "@/lib/types";
import { weatherCodes } from "@/lib/weather-codes";
import { generateBackground } from "@/ai/flows/generate-background-flow";

const getWeatherDescriptionFromCode = (code: number, isDay: boolean = true): string => {
  const codeInfo: WeatherCodeInfo = weatherCodes[code] || weatherCodes[0];
  // Sanitize the description to create a valid key: lowercase and replace non-alphanumerics with underscores.
  const descriptionKey = codeInfo.description.replace(/: /g, '_').replace(/ /g, '_').toLowerCase();
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
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=es`;
    try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
            return "Current Location";
        }
        const data = await res.json();
        
        // New logic to find the most specific administrative name
        const mostSpecificAdmin = data.localityInfo?.administrative?.sort((a: any, b: any) => b.order - a.order)[0];
        
        const city = mostSpecificAdmin?.name || data.city || data.locality || data.principalSubdivision || "Current Location";

        return city;
    } catch (error: any) {
        console.error(`[getCityFromCoords] CATCH BLOCK ERROR: ${error.message}`);
        return "Current Location";
    }
}

// This function now fetches data from the Open-Meteo API.
export async function getWeather(prevState: any, formData: FormData): Promise<any> {
  let locationName = formData.get('location') as string | null;
  let latitude = formData.get('latitude') as string | null;
  let longitude = formData.get('longitude') as string | null;
  
  try {
    
    // Case 1: Search by name (locationName is present, lat/lon are not)
    if (locationName && !latitude && !longitude) {
        const suggestions = await getCitySuggestions(locationName, 'en', 1);
        if (suggestions.length > 0) {
            latitude = suggestions[0].lat.toString();
            longitude = suggestions[0].lon.toString();
            locationName = suggestions[0].name; // Use the precise name from the API
        } else {
            const errorDetail = `Could not find city: ${locationName}`;
            return { ...prevState, success: false, message: 'fetchError', errorDetail };
        }
    } 
    // Case 2: Geolocation search (lat/lon are present, locationName may or may not be)
    else if (latitude && longitude) {
        if (!locationName) {
           locationName = await getCityFromCoords(parseFloat(latitude), parseFloat(longitude));
        }
    } 
    // Case 3: No data provided
    else {
        const errorDetail = 'No location information provided.';
        return { ...prevState, success: false, message: 'fetchError', errorDetail };
    }


    const weatherParams = new URLSearchParams({
      latitude: latitude!,
      longitude: longitude!,
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m",
      hourly: "temperature_2m,precipitation_probability,weather_code",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant",
      timezone: "auto",
      forecast_days: "7", // Fetch 7 days to have today + 6 days forecast
    });
    
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?${weatherParams}`;
    const weatherResponse = await fetch(weatherUrl, { next: { revalidate: 0 } });

    if (!weatherResponse.ok) {
      const errorData = await weatherResponse.json();
      const errorDetail = `API Error: ${errorData.reason}`;
      return { ...prevState, success: false, message: 'fetchError', errorDetail };
    }

    const weatherAPIData: OpenMeteoWeatherData = await weatherResponse.json();

    const { daily: dailyData, hourly: hourlyData, current: currentData, timezone, latitude: apiLatitude } = weatherAPIData;

    if (!currentData) {
        const errorDetail = "API response did not include 'current' weather data.";
        throw new Error(errorDetail);
    }
    
    // Process 6-day forecast (from tomorrow, so i=1 to i=6)
    const forecastData: DailyForecast[] = [];
    for (let i = 1; i <= 6; i++) {
        const forecastDateStr = dailyData.time[i]; // e.g. "2024-07-30"
        
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
            humidity: 0, // Not available in daily forecast, would need to average hourly
            wind_speed: dailyData.wind_speed_10m_max[i], 
            wind_direction: dailyData.wind_direction_10m_dominant[i],
            temp: Math.round((dailyData.temperature_2m_max[i] + dailyData.temperature_2m_min[i]) / 2),
            feels_like: Math.round((dailyData.temperature_2m_max[i] + dailyData.temperature_2m_min[i]) / 2), // Approximation
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
    
    // Process current weather from the 'current' object
    const isDay = currentData.is_day === 1;

    // Use hourly data for current pop, find the closest hour
    const now = new Date();
    const closestHourIndex = hourlyData.time.findIndex(
      (timeStr) => new Date(timeStr).getTime() >= now.getTime()
    );
    const currentPop = hourlyData.precipitation_probability[closestHourIndex > 0 ? closestHourIndex -1 : 0];

    const weatherData: WeatherData = {
      current: {
        location: locationName as string,
        temp: currentData.temperature_2m,
        feels_like: currentData.apparent_temperature,
        humidity: currentData.relative_humidity_2m,
        wind_speed: currentData.wind_speed_10m,
        wind_direction: currentData.wind_direction_10m,
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
        latitude: apiLatitude,
      },
      forecast: forecastData,
      hourly: todayHourlyForecast,
      latitude: apiLatitude,
    };
    
    return { ...prevState, success: true, weatherData, message: '', errorDetail: null };

  } catch (error: any) {
    const errorDetail = error.message || 'An unknown error occurred.';
    console.error(`[getWeather] CATCH BLOCK ERROR: ${errorDetail}`);
    return { ...prevState, success: false, message: 'fetchError', errorDetail };
  }
}

export async function generateAndSetBackground(input: GenerateBackgroundInput): Promise<string> {
    try {
        const bg = await generateBackground(input);
        return bg.image;
    } catch(e) {
        console.error('Failed to generate background image', e);
        return '';
    }
}

export async function getCitySuggestions(query: string, language: string, count: number = 5): Promise<CitySuggestion[]> {
  if (query.length < 3) {
    return [];
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=${count}&format=json&language=${language}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();

    const results = data.results || [];

    if (!results || results.length === 0) return [];

    const suggestions: CitySuggestion[] = [];
    const seen = new Set<string>();

    results.forEach((item: any) => {
      let name = item.name;
      if (item.admin1 && item.name !== item.admin1) {
          name += `, ${item.admin1}`;
      }
      if (item.country) {
          name += `, ${item.country}`;
      }


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
    console.error("[getCitySuggestions] Error fetching city suggestions:", error);
    return [];
  }
}
