import { serve } from "inngest/next";
import { inngest, allFunctions } from "@space-intel/ingestion";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [...allFunctions],
});
