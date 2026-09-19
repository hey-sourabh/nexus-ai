import { WEATHER_API, WMO_DESCRIPTIONS } from '../constants/api/weather';
import { WeatherCondition } from '../components/types';

export function wmoToCondition(code: number): WeatherCondition {
  if (code === 0 || code === 1) return WeatherCondition.Sunny;
  if (code <= 3) return WeatherCondition.Cloudy;
  if (code <= 67 || (code >= 80 && code <= 82)) return WeatherCondition.Rainy;
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return WeatherCondition.Snow;
  if (code >= 95) return WeatherCondition.Rainy; // thunderstorm → treat as rainy
  return WeatherCondition.Cloudy;
}

export function wmoToDescription(code: number): string {
  return WMO_DESCRIPTIONS[code] ?? 'Unknown';
}

export interface GeoResult {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  timezone: string;
}

export async function geocode(city: string): Promise<GeoResult> {
  const url = new URL(WEATHER_API.GEOCODING_URL);
  url.searchParams.set('name', city);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Geocoding API error: ${res.status}`);

  const data = await res.json() as { results?: GeoResult[] };
  if (!data.results?.length) {
    throw new Error(`City not found: ${city}`);
  }
  return data.results[0];
}

export interface OpenMeteoCurrentWeather {
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  weather_code: number;
}

export async function fetchWeather(lat: number, lon: number, timezone: string): Promise<OpenMeteoCurrentWeather> {
  const url = new URL(WEATHER_API.FORECAST_URL);
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('current', [
    'temperature_2m',
    'apparent_temperature',
    'relative_humidity_2m',
    'wind_speed_10m',
    'weather_code',
  ].join(','));
  url.searchParams.set('timezone', timezone);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);

  const data = await res.json() as { current: OpenMeteoCurrentWeather };
  return data.current;
}
