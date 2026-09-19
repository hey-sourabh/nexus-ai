import { NextResponse } from 'next/server';
import { embedMany } from 'ai';
import { google } from '@ai-sdk/google';
import { supabase } from '@/app/lib/supabase';

const knowledgeBase = [
  'Nexus AI is a next-generation startup founded in 2026.',
  'The CEO and Lead Engineer of Nexus AI is Sourabh Sharma.',
  "Nexus AI's core tech stack includes Next.js, TypeScript, and Vercel AI SDK.",
  'Our head office is located in Indore, Madhya Pradesh.',
];

export async function GET() {
  try {
    // 1. Text ko vectors me convert karna
    const embeddingModel = google.textEmbeddingModel('gemini-embedding-001');

    const { embeddings } = await embedMany({
      model: embeddingModel,
      values: knowledgeBase,
    });

    // 2. Supabase format me data prepare karna
    const documentsToInsert = knowledgeBase.map((text, i) => ({
      content: text,
      embedding: embeddings[i], 
    }));

    // 3. Supabase ki 'documents' table me data insert karna
    const { error } = await supabase.from('documents').insert(documentsToInsert);

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Success! Knowledge Base Supabase me save ho gaya.' });
  } catch (error) {
    console.error("General Error:", error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}