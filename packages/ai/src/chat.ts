import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { type RetrievedChunk } from "./rag.js";
import { RESEARCH_SYSTEM_PROMPT } from "./prompts/system.js";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatOptions {
  message: string;
  context: RetrievedChunk[];
  history?: ChatMessage[];
}

/**
 * Build a context block from retrieved chunks to inject into the system prompt.
 * Each chunk is formatted with its type, title, and content.
 */
function buildContextBlock(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return "No relevant context found in the database for this query.";
  }

  const sections = chunks.map((chunk, index) => {
    const typeLabel =
      chunk.type === "company"
        ? "Company"
        : chunk.type === "filing"
          ? "SEC Filing"
          : "Contract";

    return [
      `[${index + 1}] ${typeLabel}: ${chunk.title}`,
      `ID: ${chunk.id}`,
      `Relevance Score: ${chunk.score.toFixed(3)}`,
      `Content: ${chunk.content}`,
    ].join("\n");
  });

  return sections.join("\n\n---\n\n");
}

/**
 * Stream a chat response using Anthropic Claude Sonnet with RAG context.
 *
 * @param options.message - The user's current message
 * @param options.context - Retrieved chunks from the RAG pipeline
 * @param options.history - Optional conversation history for multi-turn chats
 * @returns A streaming text result from the Vercel AI SDK
 */
export function chat(options: ChatOptions) {
  const { message, context, history = [] } = options;

  const contextBlock = buildContextBlock(context);

  const systemPromptWithContext = [
    RESEARCH_SYSTEM_PROMPT,
    "",
    "## Retrieved Context from Space Intel Database",
    "",
    contextBlock,
  ].join("\n");

  const messages: ChatMessage[] = [
    ...history,
    { role: "user", content: message },
  ];

  return streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: systemPromptWithContext,
    messages,
    maxTokens: 2048,
    temperature: 0.1,
  });
}
