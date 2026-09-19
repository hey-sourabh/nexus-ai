// ─── Enums ────────────────────────────────────────────────────────────────────

export enum MessageRole {
  User = 'user',
  Assistant = 'assistant',
}

export enum ChatStatus {
  Idle = 'ready',
  Streaming = 'streaming',
  Submitted = 'submitted',
}

export enum WeatherCondition {
  Sunny = 'Sunny',
  Rainy = 'Rainy',
  Cloudy = 'Cloudy',
  Snow = 'Snow',
}

export enum ToolPartType {
  Text = 'text',
  GetWeather = 'tool-getWeather',
}

// ─── Weather Types ─────────────────────────────────────────────────────────────

export interface WeatherOutput {
  location: string;
  condition: WeatherCondition | string;
  temperature: number;
}

export interface WeatherInput {
  location?: string;
}

// ─── Weather Condition Config Map ─────────────────────────────────────────────

export const WEATHER_CONDITION_CONFIG: Record<
  string,
  { emoji: string; gradient: string }
> = {
  [WeatherCondition.Sunny]: {
    emoji: '☀️',
    gradient: 'from-amber-400 via-orange-400 to-rose-400',
  },
  [WeatherCondition.Rainy]: {
    emoji: '🌧️',
    gradient: 'from-slate-500 via-blue-600 to-blue-700',
  },
  [WeatherCondition.Cloudy]: {
    emoji: '☁️',
    gradient: 'from-slate-400 via-slate-500 to-slate-600',
  },
  [WeatherCondition.Snow]: {
    emoji: '❄️',
    gradient: 'from-sky-300 via-sky-400 to-indigo-500',
  },
};

export const DEFAULT_WEATHER_CONFIG = {
  emoji: '🌡️',
  gradient: 'from-blue-500 via-blue-600 to-blue-700',
};
