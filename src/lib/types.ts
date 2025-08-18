
// Our app's internal weather data structure
export interface CurrentWeather {
  location: string;
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  main: string;
  pop: number; // Probability of precipitation
  dt: string; // ISO Date String
  temp_min: number;
  temp_max: number;
  sunrise: string; // ISO 8601 Date string
  sunset: string; // ISO 8601 Date string
  timezone: string; // e.g., 'Europe/Berlin'
  weatherCode: number;
}

export interface DailyForecast {
  dt: string; // Date string 'YYYY-MM-DD'
  temp_min: number;
  temp_max: number;
  main: string;
  description: string;
  pop: number;
  hourly: HourlyForecast[]; 
  humidity: number;
  wind_speed: number;
  temp: number;
  feels_like: number;
  weatherCode: number;
  sunrise: string; // ISO 8601 Date string
  sunset: string; // ISO 8601 Date string
}

export interface HourlyForecast {
  time: string; // ISO 8601 Date String
  temp: number;
  main: string;
  pop: number; // Probability of precipitation
  weatherCode: number;
}

export interface WeatherData {
  current: CurrentWeather;
  forecast: DailyForecast[];
  hourly: HourlyForecast[];
}

export interface CitySuggestion {
  name: string;
  lat: number;
  lon: number;
}

// WMO Weather code translation structure
export interface WeatherCodeInfo {
  description: string;
  image: string;
}

// Types for AI Flow
export interface GenerateBackgroundInput {
    city: string;
    weather: string;
}

// Types for Open-Meteo API
export interface OpenMeteoCurrent {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  weather_code: number;
  wind_speed_10m: number;
}

export interface OpenMeteoHourly {
  time: string[];
  temperature_2m: number[];
  precipitation_probability: number[];
  weather_code: number[];
}

export interface OpenMeteoDaily {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  sunrise: string[];
  sunset: string[];
  precipitation_probability_max: number[];
}

export interface OpenMeteoWeatherData {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current: OpenMeteoCurrent;
  hourly: OpenMeteoHourly;
  daily: OpenMeteoDaily;
}
