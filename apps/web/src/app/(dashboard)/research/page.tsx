"use client";

import * as React from "react";
import { MessageSquare, Send, Sparkles, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const EXAMPLE_QUESTIONS = [
  "Which public space companies have the highest government contract backlog?",
  "Compare the launch cadence of SpaceX vs Rocket Lab in 2025",
  "What are the recent SEC filings from space companies this quarter?",
  "Which SBIR awards were given for satellite propulsion technologies?",
];

export default function ResearchPage() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const handleSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isLoading) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      // Simulate AI response (in production, this calls the tRPC chat endpoint
      // which invokes the RAG pipeline from @space-intel/ai)
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Thank you for your question about "${trimmed}". The AI research assistant is currently running in demo mode. Once connected to a live database and the Anthropic API, I'll provide data-driven analysis drawing from:\n\n- **30+ tracked space companies** with financial profiles\n- **Government contracts** from USAspending.gov and SBIR.gov\n- **SEC filings** (10-K, 10-Q, 8-K) from public space companies\n- **Launch records** from Launch Library 2\n\nTo enable live AI research, configure your \`ANTHROPIC_API_KEY\` in \`.env.local\` and start the database with \`docker compose up -d\`.`,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1500);
    },
    [input, isLoading]
  );

  const handleExampleClick = React.useCallback(
    (question: string) => {
      setInput(question);
    },
    []
  );

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6">
      {/* Page header */}
      <div className="flex items-center gap-2.5 mb-4 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <MessageSquare className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            AI Research
          </h1>
          <p className="text-xs text-gray-400">
            Ask questions about the space economy — powered by RAG
          </p>
        </div>
      </div>

      {/* Chat area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-lg border border-gray-800 bg-gray-900/50 p-4"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <div className="text-center max-w-md">
              <h2 className="text-lg font-semibold text-white mb-1">
                Space Intel Research Assistant
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Ask questions about space companies, government contracts, SEC
                filings, launch data, and funding trends. The AI retrieves
                relevant context from the Space Intel database before responding.
              </p>
            </div>

            {/* Example questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleExampleClick(q)}
                  className={cn(
                    "text-left text-sm text-gray-300 p-3 rounded-lg",
                    "border border-gray-700 bg-gray-800/50",
                    "hover:bg-gray-800 hover:border-gray-600 hover:text-white",
                    "transition-colors duration-150"
                  )}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3 max-w-3xl",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg shrink-0",
                    msg.role === "user"
                      ? "bg-blue-500/10"
                      : "bg-purple-500/10"
                  )}
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Bot className="w-4 h-4 text-purple-400" />
                  )}
                </div>
                <div
                  className={cn(
                    "rounded-lg p-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-200 border border-gray-700"
                  )}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 shrink-0">
                  <Bot className="w-4 h-4 text-purple-400" />
                </div>
                <div className="rounded-lg p-3 bg-gray-800 border border-gray-700">
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="mt-4 shrink-0 flex items-center gap-3"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about space companies, contracts, launches..."
            className={cn(
              "w-full h-11 pl-4 pr-12 text-sm rounded-lg",
              "bg-gray-900 border border-gray-700 text-white placeholder:text-gray-500",
              "outline-none focus:border-purple-500/70 focus:ring-1 focus:ring-purple-500/30",
              "transition-colors duration-150"
            )}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2",
              "flex items-center justify-center w-8 h-8 rounded-md",
              "transition-colors duration-150",
              input.trim() && !isLoading
                ? "bg-purple-600 text-white hover:bg-purple-500"
                : "bg-gray-800 text-gray-600 cursor-not-allowed"
            )}
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
