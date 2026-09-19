import { streamText, convertToModelMessages, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { geocode, fetchWeather, wmoToCondition, wmoToDescription } from '../../utils/weather';

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google('gemini-3.5-flash'),
    messages: await convertToModelMessages(messages),
    system:
      "You are Nexus, a helpful AI assistant. When the user asks about the weather for any city, always use the 'getWeather' tool to fetch real-time data. Never guess or make up weather information.",

    tools: {
      getWeather: tool({
        description: 'Get the real-time current weather for a specific city using Open-Meteo.',
        inputSchema: z.object({
          location: z.string().describe('The city name to get weather for'),
        }),

        execute: async ({ location }) => {
          // 1. Geocode the city name to coordinates
          const geo = await geocode(location);

          // 2. Fetch real current weather
          const weather = await fetchWeather(geo.latitude, geo.longitude, geo.timezone);

          // 3. Map WMO code to our condition enum
          const condition = wmoToCondition(weather.weather_code);

          return {
            location: geo.name,
            country: geo.country,
            condition,
            description: wmoToDescription(weather.weather_code),
            temperature: Math.round(weather.temperature_2m),
            feelsLike: Math.round(weather.apparent_temperature),
            humidity: weather.relative_humidity_2m,
            windSpeed: Math.round(weather.wind_speed_10m),
            timezone: geo.timezone,
          };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}