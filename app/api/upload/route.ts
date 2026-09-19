import { NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import { embedMany } from 'ai';
import { google } from '@ai-sdk/google';
import { supabase } from '@/app/lib/supabase';

// Helper Function: Badi PDF text ko chhote paragraphs (chunks) me todna
function chunkText(text: string, chunkSize: number = 1000): string[] {
  const chunks = [];
  let currentChunk = "";
  const sentences = text.split(". "); // Sentences ke hisaab se todna better context deta hai

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize) {
      chunks.push(currentChunk.trim());
      currentChunk = "";
    }
    currentChunk += sentence + ". ";
  }
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}

export async function POST(req: Request) {
  try {
    // 1. Frontend se aayi hui file ko receive karna
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 2. File ko Buffer me convert karke pdf-parse se text nikalna
    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();
    const pdfText = pdfData.text;

    // 3. Text ko chunks me todna
    const textChunks = chunkText(pdfText);

    // 4. Chunks ke embeddings generate karna
    const embeddingModel = google.textEmbeddingModel('gemini-embedding-001');
    const { embeddings } = await embedMany({
      model: embeddingModel,
      values: textChunks,
    });

    // 5. Supabase me data prepare karke insert karna
    const documentsToInsert = textChunks.map((chunk, i) => ({
      content: chunk,
      embedding: embeddings[i],
      metadata: { source: file.name } // Hamein pata rahega ki ye text kis PDF se aaya hai
    }));

    const { error } = await supabase.from('documents').insert(documentsToInsert);

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'PDF successfully processed and saved to database!',
      chunksProcessed: textChunks.length 
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: 'Failed to process PDF' }, { status: 500 });
  }
}