import { z } from "zod";
import type { NewContract } from "@space-intel/db/schema";

const BASE_URL = "https://api.usaspending.gov";

// NAICS codes relevant to the space industry
export const SPACE_NAICS_CODES = [
  "336414", // Guided Missile & Space Vehicle Manufacturing
  "336415", // Guided Missile & Space Vehicle Propulsion Unit Parts Mfg
  "517410", // Satellite Telecommunications
  "927110", // Space Research & Technology
  "541715", // Research & Development in the Physical, Engineering, and Life Sciences (except Nanotechnology and Biotechnology)
] as const;

// ---------------------------------------------------------------------------
// Zod schemas for USAspending API responses
// ---------------------------------------------------------------------------

const AwardingAgencySchema = z.object({
  id: z.number().optional(),
  has_account_data: z.boolean().optional(),
  toptier_agency: z
    .object({
      name: z.string(),
      code: z.string().optional(),
    })
    .optional(),
  subtier_agency: z
    .object({
      name: z.string(),
      code: z.string().optional(),
    })
    .optional(),
  office_agency_name: z.string().optional().nullable(),
});

const RecipientSchema = z.object({
  recipient_name: z.string().optional().nullable(),
  recipient_unique_id: z.string().optional().nullable(),
  parent_recipient_unique_id: z.string().optional().nullable(),
});

export const USAspendingAwardSchema = z.object({
  internal_id: z.number().optional(),
  Award_ID: z.string().optional().nullable(),
  Recipient_Name: z.string().optional().nullable(),
  "Award Amount": z.number().optional().nullable(),
  "Total Outlays": z.number().optional().nullable(),
  Description: z.string().optional().nullable(),
  "Contract Award Type": z.string().optional().nullable(),
  "Awarding Agency": z.string().optional().nullable(),
  "Awarding Sub Agency": z.string().optional().nullable(),
  "Start Date": z.string().optional().nullable(),
  "End Date": z.string().optional().nullable(),
  "Last Modified Date": z.string().optional().nullable(),
  "Base Obligation Date": z.string().optional().nullable(),
  recipient: RecipientSchema.optional(),
  awarding_agency: AwardingAgencySchema.optional(),
});

export const USAspendingResultSchema = z.object({
  internal_id: z.number().optional(),
  data_array: z.array(z.unknown()).optional(),
});

export const USAspendingPageMetadataSchema = z.object({
  page: z.number(),
  hasNext: z.boolean(),
  hasPrevious: z.boolean(),
  total: z.number(),
  limit: z.number(),
});

export const USAspendingResponseSchema = z.object({
  limit: z.number().optional(),
  results: z.array(z.record(z.unknown())),
  page_metadata: USAspendingPageMetadataSchema.optional(),
});

export type USAspendingAward = z.infer<typeof USAspendingAwardSchema>;
export type USAspendingResponse = z.infer<typeof USAspendingResponseSchema>;

// ---------------------------------------------------------------------------
// Map Award record from flat array format to typed object
// ---------------------------------------------------------------------------

function extractAwardFields(
  result: Record<string, unknown>,
  columnNames: string[],
): USAspendingAward {
  const dataArray = result["data_array"] as unknown[] | undefined;
  if (Array.isArray(dataArray) && dataArray.length > 0) {
    const obj: Record<string, unknown> = {};
    columnNames.forEach((col, i) => {
      obj[col] = dataArray[i];
    });
    return USAspendingAwardSchema.parse(obj);
  }
  // Already a flat object
  return USAspendingAwardSchema.parse(result);
}

// ---------------------------------------------------------------------------
// Map to internal contract schema
// ---------------------------------------------------------------------------

export function mapToContract(
  award: USAspendingAward,
): Omit<NewContract, "id" | "createdAt"> {
  const agencyName =
    award["Awarding Agency"] ??
    award.awarding_agency?.toptier_agency?.name ??
    null;

  const amount = award["Award Amount"];
  const awardAmount =
    amount != null && !isNaN(Number(amount)) ? Math.round(Number(amount)) : null;

  const startDate = award["Start Date"] ?? award["Base Obligation Date"] ?? null;
  const endDate = award["End Date"] ?? null;

  return {
    companyId: null, // resolved later against companies table
    title: award.Description ?? award.Award_ID ?? "Untitled Contract",
    description: award.Description ?? null,
    awardingAgency: agencyName,
    contractNumber: award.Award_ID ?? null,
    awardAmount,
    startDate: startDate,
    endDate: endDate,
    contractType: award["Contract Award Type"] ?? null,
    source: "usaspending",
    sourceUrl:
      award.Award_ID != null
        ? `https://www.usaspending.gov/award/${encodeURIComponent(award.Award_ID)}`
        : null,
    rawData: award as Record<string, unknown>,
  };
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

export interface FetchSpaceContractsOptions {
  fiscalYear?: number;
  page?: number;
  limit?: number;
}

/**
 * Fetch space-related contracts from USAspending.gov using the
 * spending_by_award endpoint, filtered to known space NAICS codes.
 */
export async function fetchSpaceContracts(
  options: FetchSpaceContractsOptions = {},
): Promise<{
  results: USAspendingAward[];
  hasMore: boolean;
  totalResults: number;
}> {
  const { fiscalYear, page = 1, limit = 100 } = options;

  const currentFY =
    fiscalYear ??
    (() => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      // Federal fiscal year starts Oct 1
      return month >= 10 ? year + 1 : year;
    })();

  const requestBody = {
    filters: {
      award_type_codes: ["A", "B", "C", "D"], // Contract award types
      naics_codes: [...SPACE_NAICS_CODES],
      time_period: [
        {
          start_date: `${currentFY - 1}-10-01`,
          end_date: `${currentFY}-09-30`,
        },
      ],
    },
    fields: [
      "Award ID",
      "Recipient Name",
      "Award Amount",
      "Total Outlays",
      "Description",
      "Contract Award Type",
      "Awarding Agency",
      "Awarding Sub Agency",
      "Start Date",
      "End Date",
      "Last Modified Date",
      "Base Obligation Date",
    ],
    page,
    limit,
    sort: "Award Amount",
    order: "desc",
    subawards: false,
  };

  const response = await fetch(`${BASE_URL}/api/v2/search/spending_by_award/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(
      `USAspending API error: ${response.status} ${response.statusText}`,
    );
  }

  const json: unknown = await response.json();
  const parsed = USAspendingResponseSchema.parse(json);

  // Map raw results to typed award objects
  const columnNames = [
    "Award ID",
    "Recipient Name",
    "Award Amount",
    "Total Outlays",
    "Description",
    "Contract Award Type",
    "Awarding Agency",
    "Awarding Sub Agency",
    "Start Date",
    "End Date",
    "Last Modified Date",
    "Base Obligation Date",
  ];

  const awards: USAspendingAward[] = parsed.results.map((r) =>
    extractAwardFields(r, columnNames),
  );

  const hasMore = parsed.page_metadata?.hasNext ?? false;
  const totalResults = parsed.page_metadata?.total ?? awards.length;

  return { results: awards, hasMore, totalResults };
}

/**
 * Fetch all pages of space contracts for a given fiscal year.
 * Automatically follows pagination up to `maxPages` to avoid runaway fetches.
 */
export async function fetchAllSpaceContracts(
  fiscalYear?: number,
  maxPages = 10,
): Promise<USAspendingAward[]> {
  const allAwards: USAspendingAward[] = [];
  let page = 1;

  while (page <= maxPages) {
    const { results, hasMore } = await fetchSpaceContracts({
      fiscalYear,
      page,
      limit: 100,
    });

    allAwards.push(...results);

    if (!hasMore) break;
    page += 1;
  }

  return allAwards;
}
