'use client';

import {
  WeatherOutput,
  WeatherInput,
  WEATHER_CONDITION_CONFIG,
  DEFAULT_WEATHER_CONFIG,
} from './types';

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function WeatherSkeleton({ location }: { location?: string }) {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-5 bg-white/30 rounded w-28" />
        <div className="h-5 bg-white/30 rounded w-16" />
      </div>
      <div className="h-12 bg-white/30 rounded w-24" />
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-white/20 rounded-xl" />
        ))}
      </div>
      <p className="text-sm text-white/60 text-center">
        Fetching weather{location ? ` for ${location}` : ''}…
      </p>
    </div>
  );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────

function StatPill({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 bg-white/15 backdrop-blur-sm rounded-xl py-2 px-3">
      <span className="text-base leading-none">{icon}</span>
      <span className="text-[11px] text-white/70 font-medium">{label}</span>
      <span className="text-xs text-white font-semibold">{value}</span>
    </div>
  );
}

// ─── Weather Card ─────────────────────────────────────────────────────────────

// Extend locally to accept description field from API
interface RichWeatherOutput extends WeatherOutput {
  description?: string;
}

interface WeatherCardProps {
  state: string;
  output?: RichWeatherOutput;
  input?: WeatherInput;
  toolCallId: string;
}

export default function WeatherCard({
  state,
  output,
  input,
  toolCallId,
}: WeatherCardProps) {
  const config =
    output?.condition
      ? (WEATHER_CONDITION_CONFIG[output.condition] ?? DEFAULT_WEATHER_CONFIG)
      : DEFAULT_WEATHER_CONFIG;

  return (
    <div
      key={toolCallId}
      className={`mt-3 w-full max-w-sm bg-gradient-to-br ${config.gradient} text-white p-5 rounded-2xl shadow-xl`}
    >
      {state === 'output-available' && output ? (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xl leading-none">{config.emoji}</span>
                <h3 className="font-bold text-lg leading-tight capitalize truncate">
                  {output.location}
                </h3>
              </div>
              <p className="text-xs text-white/70 mt-0.5 ml-0.5">
                {output.country} · {output.timezone}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full font-semibold block">
                {output.condition}
              </span>
              {output.description && (
                <span className="text-[10px] text-white/60 mt-1 block">
                  {output.description}
                </span>
              )}
            </div>
          </div>

          {/* Temperature */}
          <div className="flex items-end gap-3">
            <div className="text-6xl font-light tracking-tighter leading-none">
              {output.temperature}
              <span className="text-3xl">°C</span>
            </div>
            <div className="text-xs text-white/70 pb-1 leading-relaxed">
              Feels like<br />
              <span className="text-white font-semibold text-sm">
                {output.feelsLike}°C
              </span>
            </div>
          </div>

          {/* Stat pills */}
          <div className="grid grid-cols-3 gap-2">
            <StatPill icon="💧" label="Humidity" value={`${output.humidity}%`} />
            <StatPill icon="💨" label="Wind" value={`${output.windSpeed} km/h`} />
            <StatPill icon="🌡️" label="Feels like" value={`${output.feelsLike}°C`} />
          </div>

          {/* Footer */}
          <p className="text-[10px] text-white/50 text-right border-t border-white/10 pt-2">
            Powered by Open-Meteo · Nexus AI
          </p>
        </div>
      ) : (
        <WeatherSkeleton location={input?.location} />
      )}
    </div>
  );
}
