import {
  streamText,
  convertToModelMessages,
  tool,
  embed,
  embedMany,
  cosineSimilarity,
  type UIMessage,
} from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { geocode, fetchWeather, wmoToCondition, wmoToDescription } from '../../utils/weather';

export const maxDuration = 30;

// ==========================================
// 1. RAG: Knowledge Base (demo only)
// ==========================================
// NOTE: never put secrets (passwords, keys) here. Anyone who can chat
// can retrieve anything in this list.
const knowledgeBase = [
  'Nexus AI is a next-generation startup founded in 2026.',
  'The CEO and Lead Engineer of Nexus AI is Sourabh Sharma.',
  "Nexus AI's core tech stack includes Next.js, TypeScript, and Vercel AI SDK.",
  'Our head office is located in Indore, Madhya Pradesh.',
  "CEO lives in indore , Madhya Pradesh, India"
];

const embeddingModel = google.textEmbeddingModel('gemini-embedding-001');

const TOP_K = 3;
const MIN_SCORE = 0.4; // tune this by logging real scores

// ==========================================
// 2. Embed the knowledge base ONCE per server instance
// ==========================================
let kbEmbeddingsPromise: Promise<number[][]> | null = null;

function getKnowledgeBaseEmbeddings() {
  if (!kbEmbeddingsPromise) {
    kbEmbeddingsPromise = embedMany({
      model: embeddingModel,
      values: knowledgeBase,
      providerOptions: { google: { taskType: 'RETRIEVAL_DOCUMENT' } },
    })
      .then((r) => r.embeddings)
      .catch((err) => {
        kbEmbeddingsPromise = null; // allow retry on next request
        throw err;
      });
  }
  return kbEmbeddingsPromise;
}

// ==========================================
// 3. Helpers
// ==========================================
function getMessageText(message: UIMessage): string {
  return message.parts.map((p) => (p.type === 'text' ? p.text : '')).join('');
}

// Use the last 2 user messages so follow-ups like "what's his role?" still have context.
// (A more advanced approach: ask an LLM to rewrite the question as a standalone query.)
function buildSearchQuery(messages: UIMessage[]): string {
  return messages
    .filter((m) => m.role === 'user')
    .slice(-2)
    .map(getMessageText)
    .join('\n')
    .trim();
}

async function retrieveContext(query: string) {
  if (!query) return [];

  const [kbEmbeddings, { embedding: queryEmbedding }] = await Promise.all([
    getKnowledgeBaseEmbeddings(),
    embed({
      model: embeddingModel,
      value: query,
      providerOptions: { google: { taskType: 'RETRIEVAL_QUERY' } },
    }),
  ]);

  return kbEmbeddings
    .map((vector, i) => ({
      text: knowledgeBase[i],
      score: cosineSimilarity(queryEmbedding, vector),
    }))
    .filter((r) => r.score > MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_K);
}

// ==========================================
// 4. Route handler
// ==========================================
export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const results = await retrieveContext(buildSearchQuery(messages));
  console.log('RAG results:', results); // handy for tuning MIN_SCORE

  const context = results.length
    ? results.map((r, i) => `[${i + 1}] ${r.text}`).join('\n')
    : 'No relevant company information found.';

  const result = streamText({
    // TODO: double-check this model name against Google's current docs
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