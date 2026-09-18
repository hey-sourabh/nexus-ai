import { streamText, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: google('gemini-3.6-flash'),
    messages: await convertToModelMessages(messages),
    system: 'You are Nexus, a highly intelligent and concise AI assistant.',
  });

  return result.toUIMessageStreamResponse();
}