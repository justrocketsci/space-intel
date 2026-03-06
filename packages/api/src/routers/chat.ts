import { z } from "zod";
import { publicProcedure, router } from "../trpc.js";

export const chatRouter = router({
  message: publicProcedure
    .input(
      z.object({
        message: z.string().min(1).max(4000),
        conversationId: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      // Stub implementation — will be replaced with AI RAG pipeline
      // The actual chat will be handled by the AI package's streamText endpoint
      const { message, conversationId } = input;

      void message;
      void conversationId;

      return {
        response:
          "The AI research assistant is being initialized. Please use the /research page for full AI-powered analysis.",
        sources: [] as string[],
      };
    }),
});
