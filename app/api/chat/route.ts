import { streamText, convertToModelMessages, tool, embed, type UIMessage } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { geocode, fetchWeather, wmoToCondition, wmoToDescription } from '../../utils/weather';
import { supabase } from '../../lib/supabase'; // Hamara Supabase client

export const maxDuration = 30;

const embeddingModel = google.textEmbeddingModel('gemini-embedding-001');

// Helpers for multi-turn context
function getMessageText(message: UIMessage): string {
  return message.parts.map((p) => (p.type === 'text' ? p.text : '')).join('');
}

function buildSearchQuery(messages: UIMessage[]): string {
  return messages
    .filter((m) => m.role === 'user')
    .slice(-2)
    .map(getMessageText)
    .join('\n')
    .trim();
}

// ==========================================
// RAG: Query Supabase Vector Database
// ==========================================
async function retrieveContext(query: string) {
  if (!query) return [];

  // 1. User ki query ko vectors (3072 dimensions) me convert karna
  const { embedding: queryEmbedding } = await embed({
    model: embeddingModel,
    value: query,
  });

  // 2. Supabase function ('match_documents') call karna Vector Search ke liye
  const { data: documents, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: 0.4, // Kam se kam 40% match hona chahiye
    match_count: 3,       // Top 3 results chahiye
  });

  if (error) {
    console.error("Supabase RAG Error:", error);
    return [];
  }

  return documents || [];
}

// ==========================================
// Route Handler
// ==========================================
export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // 1. Database se relevant context nikalna
  const results = await retrieveContext(buildSearchQuery(messages));
  
  // 2. Context format karna LLM ke liye
  const context = results.length
    ? results.map((r: { content: string }, i: number) => `[${i + 1}] ${r.content}`).join('\n')
    : 'No relevant company information found.';

  // 3. AI Stream generate karna (Tools + DB Context)
  const result = streamText({
    model: google('gemini-3.5-flash'),
    messages: await convertToModelMessages(messages),
    system: `You are Nexus, a helpful AI assistant.

INSTRUCTIONS:
- For weather questions about any city, ALWAYS use the 'getWeather' tool. Never guess the weather.
- For questions about the company or its internal details, answer ONLY from the COMPANY CONTEXT below.
  If the answer is not in the context, say you don't have that information. Do not make it up.
- For anything else, answer normally using your general knowledge.

COMPANY CONTEXT:
${context}`,

    tools: {
      getWeather: tool({
        description: 'Get the real-time current weather for a specific city using Open-Meteo.',
        inputSchema: z.object({
          location: z.string().describe('The city name to get weather for'),
        }),
        execute: async ({ location }) => {
          const geo = await geocode(location);
          const weather = await fetchWeather(geo.latitude, geo.longitude, geo.timezone);
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