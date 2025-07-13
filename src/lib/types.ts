// Our app's internal weather data structure
export interface CurrentWeather {
  location: string;
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  main: 'Clear' | 'Clouds' | 'Rain' | 'Snow' | 'Wind' | 'Mist' | 'Drizzle' | 'Thunderstorm' | string;
  pop: number;
}

export interface DailyForecast {
  dt: string;
  temp_min: number;
  temp_max: number;
  main: 'Clear' | 'Clouds' | 'Rain' | 'Snow' | 'Wind' | 'Mist' | 'Drizzle' | 'Thunderstorm' | string;
  description: string;
  pop: number;
}

export interface WeatherData {
  current: CurrentWeather;
  forecast: DailyForecast[];
}

export interface CitySuggestion {
    name: string;
    lat: number;
    lon: number;
}


// Types for the OpenWeatherMap API response
export interface OWMCurrentWeather {
  coord: { lon: number; lat: number };
  weather: { id: number; main: string; description: string; icon: string }[];
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: { speed: number; deg: number };
  clouds: { all: number };
  dt: number;
  sys: { type: number; id: number; country: string; sunrise: number; sunset: number };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface OWMForecast {
  cod: string;
  message: number;
  cnt: number;
  list: {
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      sea_level: number;
      grnd_level: number;
      humidity: number;
      temp_kf: number;
    };
    weather: { id: number; main: string; description: string; icon: string }[];
    clouds: { all: number };
    wind: { speed: number; deg: number; gust: number };
    visibility: number;
    pop: number;
    sys: { pod: string };
    dt_txt: string;
  }[];
  city: {
    id: number;
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}