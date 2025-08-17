
import type { WeatherCodeInfo } from './types';

export const weatherCodes: Record<number, WeatherCodeInfo> = {
    0: {
      description: "Clear sky",
      image: "http://openweathermap.org/img/wn/01d@2x.png"
    },
    1: {
      description: "Mainly clear",
      image: "http://openweathermap.org/img/wn/01d@2x.png"
    },
    2: {
      description: "Partly cloudy",
      image: "http://openweathermap.org/img/wn/02d@2x.png"
    },
    3: {
      description: "Overcast",
      image: "http://openweathermap.org/img/wn/04d@2x.png"
    },
    45: {
      description: "Fog",
      image: "http://openweathermap.org/img/wn/50d@2x.png"
    },
    48: {
      description: "Depositing rime fog",
      image: "http://openweathermap.org/img/wn/50d@2x.png"
    },
    51: {
      description: "Drizzle: Light",
      image: "http://openweathermap.org/img/wn/09d@2x.png"
    },
    53: {
      description: "Drizzle: Moderate",
      image: "http://openweathermap.org/img/wn/09d@2x.png"
    },
    55: {
      description: "Drizzle: Dense",
      image: "http://openweathermap.org/img/wn/09d@2x.png"
    },
    56: {
      description: "Freezing Drizzle: Light",
      image: "http://openweathermap.org/img/wn/09d@2x.png"
    },
    57: {
      description: "Freezing Drizzle: Dense",
      image: "http://openweathermap.org/img/wn/09d@2x.png"
    },
    61: {
      description: "Rain: Slight",
      image: "http://openweathermap.org/img/wn/10d@2x.png"
    },
    63: {
      description: "Rain: Moderate",
      image: "http://openweathermap.org/img/wn/10d@2x.png"
    },
    65: {
      description: "Rain: Heavy",
      image: "http://openweathermap.org/img/wn/10d@2x.png"
    },
    66: {
      description: "Freezing Rain: Light",
      image: "http://openweathermap.org/img/wn/13d@2x.png"
    },
    67: {
      description: "Freezing Rain: Heavy",
      image: "http://openweathermap.org/img/wn/13d@2x.png"
    },
    71: {
      description: "Snow fall: Slight",
      image: "http://openweathermap.org/img/wn/13d@2x.png"
    },
    73: {
      description: "Snow fall: Moderate",
      image: "http://openweathermap.org/img/wn/13d@2x.png"
    },
    75: {
      description: "Snow fall: Heavy",
      image: "http://openweathermap.org/img/wn/13d@2x.png"
    },
    77: {
      description: "Snow grains",
      image: "http://openweathermap.org/img/wn/13d@2x.png"
    },
    80: {
      description: "Rain showers: Slight",
      image: "http://openweathermap.org/img/wn/09d@2x.png"
    },
    81: {
      description: "Rain showers: Moderate",
      image: "http://openweathermap.org/img/wn/09d@2x.png"
    },
    82: {
      description: "Rain showers: Violent",
      image: "http://openweathermap.org/img/wn/09d@2x.png"
    },
    85: {
      description: "Snow showers: Slight",
      image: "http://openweathermap.org/img/wn/13d@2x.png"
    },
    86: {
      description: "Snow showers: Heavy",
      image: "http://openweathermap.org/img/wn/13d@2x.png"
    },
    95: {
      description: "Thunderstorm: Slight or moderate",
      image: "http://openweathermap.org/img/wn/11d@2x.png"
    },
    96: {
      description: "Thunderstorm with slight hail",
      image: "http://openweathermap.org/img/wn/11d@2x.png"
    },
    99: {
      description: "Thunderstorm with heavy hail",
      image: "http://openweathermap.org/img/wn/11d@2x.png"
    }
  };
