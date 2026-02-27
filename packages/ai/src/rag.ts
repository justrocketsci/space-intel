import { sql, ilike, or } from "drizzle-orm";
import { db } from "@space-intel/db/client";
import { companies, filings } from "@space-intel/db/schema";
import { generateEmbedding } from "./embeddings.js";

export type RetrievedChunkType = "company" | "filing" | "contract";

export interface RetrievedChunk {
  type: RetrievedChunkType;
  id: string;
  title: string;
  content: string;
  score: number;
}

interface RetrieveContextOptions {
  limit?: number;
}

/**
 * Convert a number[] embedding to a pgvector-compatible literal string.
 * Format: '[0.1,0.2,...,0.n]'
 */
function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

/**
 * Retrieve relevant context for a query using hybrid search:
 * - Cosine similarity search on company and filing embeddings (pgvector)
 * - Keyword search (ILIKE) on company name and description
 *
 * Results are combined, deduplicated, and sorted by score descending.
 */
export async function retrieveContext(
  query: string,
  options: RetrieveContextOptions = {},
): Promise<RetrievedChunk[]> {
  const limit = options.limit ?? 10;

  // Generate query embedding for vector search
  const queryEmbedding = await generateEmbedding(query);
  const vectorLiteral = toVectorLiteral(queryEmbedding);

  // Run all searches in parallel
  const [companiesVector, filingsVector, companiesKeyword] = await Promise.all([
    // Vector similarity search on companies
    db
      .select({
        id: companies.id,
        name: companies.name,
        description: companies.description,
        score: sql<number>`1 - (${companies.embedding} <=> ${sql.raw(`'${vectorLiteral}'::vector`)})`,
      })
      .from(companies)
      .where(sql`${companies.embedding} IS NOT NULL`)
      .orderBy(
        sql`${companies.embedding} <=> ${sql.raw(`'${vectorLiteral}'::vector`)}`,
      )
      .limit(limit),

    // Vector similarity search on filings
    db
      .select({
        id: filings.id,
        title: filings.title,
        description: filings.description,
        summary: filings.summary,
        filingType: filings.filingType,
        score: sql<number>`1 - (${filings.embedding} <=> ${sql.raw(`'${vectorLiteral}'::vector`)})`,
      })
      .from(filings)
      .where(sql`${filings.embedding} IS NOT NULL`)
      .orderBy(
        sql`${filings.embedding} <=> ${sql.raw(`'${vectorLiteral}'::vector`)}`,
      )
      .limit(limit),

    // Keyword search on companies
    db
      .select({
        id: companies.id,
        name: companies.name,
        description: companies.description,
      })
      .from(companies)
      .where(
        or(
          ilike(companies.name, `%${query}%`),
          ilike(companies.description, `%${query}%`),
        ),
      )
      .limit(limit),
  ]);

  const chunks: RetrievedChunk[] = [];
  const seenIds = new Set<string>();

  // Add vector-matched companies
  for (const row of companiesVector) {
    if (seenIds.has(`company:${row.id}`)) continue;
    seenIds.add(`company:${row.id}`);

    chunks.push({
      type: "company",
      id: row.id,
      title: row.name,
      content: row.description ?? row.name,
      score: row.score,
    });
  }

  // Add vector-matched filings
  for (const row of filingsVector) {
    if (seenIds.has(`filing:${row.id}`)) continue;
    seenIds.add(`filing:${row.id}`);

    const content =
      row.summary ?? row.description ?? `${row.filingType} filing`;
    chunks.push({
      type: "filing",
      id: row.id,
      title: row.title ?? `${row.filingType} filing`,
      content,
      score: row.score,
    });
  }

  // Add keyword-matched companies (score them lower than vector results)
  for (const row of companiesKeyword) {
    if (seenIds.has(`company:${row.id}`)) continue;
    seenIds.add(`company:${row.id}`);

    chunks.push({
      type: "company",
      id: row.id,
      title: row.name,
      content: row.description ?? row.name,
      // Keyword matches get a fixed score below typical vector results
      score: 0.5,
    });
  }

  // Sort all chunks by score descending and cap at limit
  chunks.sort((a, b) => b.score - a.score);

  return chunks.slice(0, limit);
}
