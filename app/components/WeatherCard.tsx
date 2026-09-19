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
    <div className="animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-5 bg-white/30 rounded w-24" />
        <div className="h-5 bg-white/30 rounded w-16" />
      </div>
      <div className="h-10 bg-white/30 rounded w-20" />
      <p className="text-sm text-white/60">
        Fetching weather{location ? ` for ${location}` : ''}…
      </p>
    </div>
  );
}

// ─── Weather Card ─────────────────────────────────────────────────────────────

interface WeatherCardProps {
  state: string;
  output?: WeatherOutput;
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
      className={`mt-3 w-full max-w-xs bg-gradient-to-br ${config.gradient} text-white p-5 rounded-2xl shadow-xl`}
    >
      {state === 'output-available' && output ? (
        <div className="space-y-3">
          {/* Header row */}
          <div className="flex justify-between items-start gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-2xl leading-none">{config.emoji}</span>
              <h3 className="font-semibold text-lg leading-tight capitalize truncate">
                {output.location}
              </h3>
            </div>
            <span className="shrink-0 text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full font-medium">
              {output.condition}
            </span>
          </div>

          {/* Temperature */}
          <div className="text-5xl font-light tracking-tight">
            {output.temperature}
            <span className="text-3xl">°C</span>
          </div>

          {/* Footer */}
          <p className="text-xs text-white/70 border-t border-white/20 pt-2">
            Powered by Nexus AI
          </p>
        </div>
      ) : (
        <WeatherSkeleton location={input?.location} />
      )}
    </div>
  );
}
