import { z } from "zod";
import type { NewContract } from "@space-intel/db/schema";

const BASE_URL = "https://www.sbir.gov/api";

// Space-related keywords used for SBIR award search
export const SPACE_KEYWORDS = [
  "satellite",
  "launch vehicle",
  "orbit",
  "spacecraft",
  "propulsion",
  "space station",
  "reentry",
  "cubesat",
  "smallsat",
  "rocket",
  "lunar",
  "mars",
  "deep space",
] as const;

// ---------------------------------------------------------------------------
// Zod schemas for SBIR.gov API responses
// ---------------------------------------------------------------------------

export const SbirAwardSchema = z.object({
  award_title: z.string().optional().nullable(),
  award_amount: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((v) => {
      if (v == null || v === "") return null;
      const n = Number(v);
      return isNaN(n) ? null : n;
    }),
  agency: z.string().optional().nullable(),
  branch: z.string().optional().nullable(),
  firm: z.string().optional().nullable(),
  firm_address: z.string().optional().nullable(),
  firm_city: z.string().optional().nullable(),
  firm_state: z.string().optional().nullable(),
  firm_zip: z.string().optional().nullable(),
  award_year: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((v) => {
      if (v == null || v === "") return null;
      const n = Number(v);
      return isNaN(n) ? null : n;
    }),
  award_start_date: z.string().optional().nullable(),
  award_end_date: z.string().optional().nullable(),
  contract: z.string().optional().nullable(), // contract/award number
  abstract: z.string().optional().nullable(),
  topic_code: z.string().optional().nullable(),
  solicitation_id: z.string().optional().nullable(),
  program: z.string().optional().nullable(), // SBIR | STTR
  phase: z.string().optional().nullable(), // Phase I | Phase II | Phase IIB
  duns: z.string().optional().nullable(),
  research_keywords: z.string().optional().nullable(),
  pi_name: z.string().optional().nullable(),
  ri_name: z.string().optional().nullable(),
});

export const SbirResponseSchema = z.array(SbirAwardSchema);

export type SbirAward = z.infer<typeof SbirAwardSchema>;
export type SbirResponse = z.infer<typeof SbirResponseSchema>;

// ---------------------------------------------------------------------------
// Map to internal contract schema (SBIR awards stored in contracts table)
// ---------------------------------------------------------------------------

export function mapToContract(
  award: SbirAward,
): Omit<NewContract, "id" | "createdAt"> {
  const awardNumber = award.contract ?? award.solicitation_id ?? null;

  // Build a human-readable title
  const title =
    award.award_title ??
    (awardNumber != null ? `SBIR Award ${awardNumber}` : "SBIR Award");

  // Agency + branch
  const agencyParts = [award.agency, award.branch].filter(Boolean);
  const agencyName = agencyParts.length > 0 ? agencyParts.join(" — ") : null;

  // Amount is already transformed by Zod to number | null
  const awardAmount =
    award.award_amount != null ? Math.round(award.award_amount) : null;

  // Date coercion — API may return "YYYY-MM-DD" or "YYYY"
  const startDate = award.award_start_date ?? null;
  const endDate = award.award_end_date ?? null;

  const contractType =
    award.program != null && award.phase != null
      ? `${award.program} ${award.phase}`
      : (award.program ?? award.phase ?? "SBIR");

  return {
    companyId: null, // resolved later against companies table
    title,
    description: award.abstract ?? null,
    awardingAgency: agencyName,
    contractNumber: awardNumber,
    awardAmount,
    startDate,
    endDate,
    contractType,
    source: "sbir",
    sourceUrl:
      awardNumber != null
        ? `https://www.sbir.gov/sbirsearch/detail/result?s%5B%5D=_all%3D${encodeURIComponent(awardNumber)}`
        : null,
    rawData: award as Record<string, unknown>,
  };
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

export interface FetchAwardsOptions {
  keyword?: string;
  agency?: string;
  year?: number;
  rows?: number;
  start?: number;
}

/**
 * Fetch SBIR/STTR awards from sbir.gov matching the given criteria.
 * Returns an array of parsed award objects.
 */
export async function fetchAwards(
  options: FetchAwardsOptions = {},
): Promise<SbirAward[]> {
  const { keyword, agency, year, rows = 100, start = 0 } = options;

  const params = new URLSearchParams();
  params.set("rows", String(rows));
  params.set("start", String(start));

  if (keyword) params.set("keyword", keyword);
  if (agency) params.set("agency", agency);
  if (year) params.set("year", String(year));

  const url = `${BASE_URL}/awards.json?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `SBIR API error: ${response.status} ${response.statusText} for keyword="${keyword ?? ""}"`,
    );
  }

  const json: unknown = await response.json();

  // The API may return a top-level array or wrap results
  let rawArray: unknown[];
  if (Array.isArray(json)) {
    rawArray = json;
  } else if (
    json !== null &&
    typeof json === "object" &&
    "results" in json &&
    Array.isArray((json as Record<string, unknown>)["results"])
  ) {
    rawArray = (json as Record<string, unknown>)["results"] as unknown[];
  } else {
    rawArray = [];
  }

  return SbirResponseSchema.parse(rawArray);
}

/**
 * Fetch space-related SBIR awards across multiple space keywords.
 * De-duplicates by contract number to avoid counting awards twice.
 */
export async function fetchSpaceAwards(year?: number): Promise<SbirAward[]> {
  const seen = new Set<string>();
  const allAwards: SbirAward[] = [];

  for (const keyword of SPACE_KEYWORDS) {
    try {
      const awards = await fetchAwards({ keyword, year, rows: 200 });

      for (const award of awards) {
        // De-duplicate on contract number or a composite key
        const dedupKey =
          award.contract ??
          `${award.firm ?? ""}:${award.award_title ?? ""}:${award.award_year ?? ""}`;

        if (dedupKey && seen.has(dedupKey)) continue;
        if (dedupKey) seen.add(dedupKey);

        allAwards.push(award);
      }
    } catch (error) {
      // Log but continue with remaining keywords
      console.error(
        `[sbir] Failed to fetch awards for keyword "${keyword}":`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  return allAwards;
}
