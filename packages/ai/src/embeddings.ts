import { openai } from "@ai-sdk/openai";
import { embed, embedMany } from "ai";

const embeddingModel = openai.embedding("text-embedding-3-small");

/**
 * Generate an embedding vector for a single text string.
 * Uses OpenAI text-embedding-3-small (1536 dimensions).
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
  });

  return embedding;
}

/**
 * Generate embedding vectors for multiple text strings in a single batch call.
 * Uses OpenAI text-embedding-3-small (1536 dimensions).
 */
export async function generateEmbeddings(
  texts: string[],
): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: texts,
  });

  return embeddings;
}
