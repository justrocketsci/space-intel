// Inngest client
export { inngest } from "./inngest/client.js";

// Inngest functions (export as array for easy registration with serve())
export { syncLaunches } from "./inngest/functions/sync-launches.js";
export { syncContracts } from "./inngest/functions/sync-contracts.js";
export { syncSecFilings } from "./inngest/functions/sync-sec-filings.js";
export { syncSbir } from "./inngest/functions/sync-sbir.js";

// Source clients — re-exported for use outside this package (e.g., one-off scripts)
export * as launchLibrary from "./sources/launch-library.js";
export * as usaSpending from "./sources/usaspending.js";
export * as secEdgar from "./sources/sec-edgar.js";
export * as sbir from "./sources/sbir.js";

// Convenience: all Inngest functions in a single array, ready for serve()
import { syncLaunches } from "./inngest/functions/sync-launches.js";
import { syncContracts } from "./inngest/functions/sync-contracts.js";
import { syncSecFilings } from "./inngest/functions/sync-sec-filings.js";
import { syncSbir } from "./inngest/functions/sync-sbir.js";

export const allFunctions = [
  syncLaunches,
  syncContracts,
  syncSecFilings,
  syncSbir,
] as const;
