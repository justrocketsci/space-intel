import { z } from "zod";
import type { NewLaunch } from "@space-intel/db/schema";

const BASE_URL = "https://ll.thespacedevs.com/2.3.0";

// ---------------------------------------------------------------------------
// Zod schemas for Launch Library 2 API responses
// ---------------------------------------------------------------------------

const LaunchStatusSchema = z.object({
  id: z.number(),
  name: z.string(),
  abbrev: z.string(),
  description: z.string().optional(),
});

const RocketConfigurationSchema = z.object({
  id: z.number(),
  name: z.string(),
  family: z.string().optional(),
  full_name: z.string().optional(),
});

const RocketSchema = z.object({
  id: z.number(),
  configuration: RocketConfigurationSchema,
});

const PadLocationSchema = z.object({
  id: z.number(),
  name: z.string(),
  country_code: z.string().optional(),
  map_image: z.string().optional(),
});

const PadSchema = z.object({
  id: z.number(),
  name: z.string(),
  location: PadLocationSchema,
});

const OrbitSchema = z.object({
  id: z.number(),
  name: z.string(),
  abbrev: z.string(),
});

const MissionSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  orbit: OrbitSchema.optional().nullable(),
  type: z.string().optional(),
});

const LaunchServiceProviderSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string().optional(),
});

export const LaunchLibraryLaunchSchema = z.object({
  id: z.string(),
  url: z.string().optional(),
  name: z.string(),
  net: z.string().optional().nullable(),
  status: LaunchStatusSchema,
  rocket: RocketSchema.optional().nullable(),
  pad: PadSchema.optional().nullable(),
  mission: MissionSchema.optional().nullable(),
  launch_service_provider: LaunchServiceProviderSchema.optional().nullable(),
  image: z.string().optional().nullable(),
});

export const LaunchLibraryResponseSchema = z.object({
  count: z.number(),
  next: z.string().optional().nullable(),
  previous: z.string().optional().nullable(),
  results: z.array(LaunchLibraryLaunchSchema),
});

// ---------------------------------------------------------------------------
// TypeScript types
// ---------------------------------------------------------------------------

export type LaunchLibraryLaunch = z.infer<typeof LaunchLibraryLaunchSchema>;
export type LaunchLibraryResponse = z.infer<typeof LaunchLibraryResponseSchema>;

// ---------------------------------------------------------------------------
// Launch status mapping
// ---------------------------------------------------------------------------

function mapLaunchStatus(
  abbrev: string,
): "upcoming" | "success" | "failure" | "partial" | "unknown" {
  switch (abbrev.toUpperCase()) {
    case "GO":
    case "TBD":
    case "TBC":
      return "upcoming";
    case "SUCCESS":
      return "success";
    case "FAILURE":
      return "failure";
    case "PARTIAL FAILURE":
      return "partial";
    default:
      return "unknown";
  }
}

// ---------------------------------------------------------------------------
// Map API response to internal schema
// ---------------------------------------------------------------------------

export function mapToLaunch(
  raw: LaunchLibraryLaunch,
): Omit<NewLaunch, "id" | "createdAt"> {
  return {
    missionName: raw.name,
    providerId: null, // resolved later against companies table
    launchDate: raw.net != null ? new Date(raw.net) : null,
    status: mapLaunchStatus(raw.status.abbrev),
    vehicle: raw.rocket?.configuration.full_name ?? raw.rocket?.configuration.name ?? null,
    padLocation:
      raw.pad != null
        ? `${raw.pad.name}, ${raw.pad.location.name}`
        : null,
    orbitType: raw.mission?.orbit?.abbrev ?? null,
    payloadMassKg: null,
    customer: raw.mission?.name ?? null,
    source: "launch-library-2",
    sourceUrl: raw.url ?? null,
    sourceId: raw.id,
  };
}

// ---------------------------------------------------------------------------
// API client helpers
// ---------------------------------------------------------------------------

async function fetchFromLL2(url: string): Promise<LaunchLibraryResponse> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Launch Library 2 API error: ${response.status} ${response.statusText} for ${url}`,
    );
  }

  const json: unknown = await response.json();
  return LaunchLibraryResponseSchema.parse(json);
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

/**
 * Fetch upcoming launches from Launch Library 2.
 * Returns all results up to `limit`. Handles pagination automatically.
 */
export async function fetchUpcomingLaunches(
  limit = 100,
): Promise<LaunchLibraryLaunch[]> {
  const results: LaunchLibraryLaunch[] = [];
  let url: string | null =
    `${BASE_URL}/launches/upcoming/?limit=100&mode=detailed`;

  while (url !== null && results.length < limit) {
    const page = await fetchFromLL2(url);
    results.push(...page.results);
    url = page.next ?? null;

    if (results.length >= limit) break;
  }

  return results.slice(0, limit);
}

/**
 * Fetch past (previous) launches from Launch Library 2.
 * Supports manual pagination via `offset`.
 */
export async function fetchPastLaunches(
  limit = 100,
  offset = 0,
): Promise<LaunchLibraryLaunch[]> {
  const results: LaunchLibraryLaunch[] = [];
  let url: string | null =
    `${BASE_URL}/launches/previous/?limit=100&offset=${offset}&mode=detailed`;

  while (url !== null && results.length < limit) {
    const page = await fetchFromLL2(url);
    results.push(...page.results);
    url = page.next ?? null;

    if (results.length >= limit) break;
  }

  return results.slice(0, limit);
}
