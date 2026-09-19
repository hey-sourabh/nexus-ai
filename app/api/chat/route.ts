import { streamText, convertToModelMessages, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google('gemini-3.6-flash'),
    messages: await convertToModelMessages(messages),
    system: "You are Nexus. If the user asks for the weather, always use the 'getWeather' tool.",
    
    // Tools object jahan hum AI ko external functions connect karne ki power dete hain
    tools: {
      getWeather: tool({
        description: 'Get the current weather for a specific location',
        // AI SDK me input schema define karne ke liye 'inputSchema' use hota hai
        inputSchema: z.object({
          location: z.string().describe('The city name'),
          temperature: z.number().optional().describe('Random temperature between 10 and 40'),
          condition: z.enum(['Sunny', 'Rainy', 'Cloudy', 'Snow']).optional().describe('Random weather condition'),
        }),
        // Execute function tab run hota hai jab AI is tool ko call karta hai
        execute: async ({ location, temperature, condition }) => {
          // Real-world me aap yahan kisi weather API (jaise OpenWeather) ko fetch karenge
          // Abhi ke liye hum mock data return kar rahe hain
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
          return { 
            location, 
            temperature: temperature ?? Math.floor(Math.random() * 30) + 10, 
            condition: condition ?? 'Sunny' 
          };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}