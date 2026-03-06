import { router } from "./trpc.js";
import { chatRouter } from "./routers/chat.js";
import { companiesRouter } from "./routers/companies.js";
import { contractsRouter } from "./routers/contracts.js";
import { launchesRouter } from "./routers/launches.js";
import { searchRouter } from "./routers/search.js";

export const appRouter = router({
  chat: chatRouter,
  companies: companiesRouter,
  contracts: contractsRouter,
  launches: launchesRouter,
  search: searchRouter,
});

export type AppRouter = typeof appRouter;
