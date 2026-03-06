import { z } from "zod";
import type { NewFiling } from "@space-intel/db/schema";

const BASE_URL = "https://data.sec.gov";
const USER_AGENT = "SpaceIntel admin@spaceintel.dev";

// SEC requires a User-Agent header on all requests
const SEC_HEADERS = {
  "User-Agent": USER_AGENT,
  Accept: "application/json",
};

// Default filing types we care about
export const DEFAULT_FILING_TYPES = ["10-K", "10-Q", "8-K"] as const;
export type FilingType = (typeof DEFAULT_FILING_TYPES)[number];

// ---------------------------------------------------------------------------
// Zod schemas for SEC EDGAR API responses
// ---------------------------------------------------------------------------

/**
 * The /submissions/ endpoint returns recent filings as parallel arrays.
 * We model the nested `recent` object accordingly.
 */
const EdgarRecentFilingsSchema = z.object({
  accessionNumber: z.array(z.string()),
  filingDate: z.array(z.string()),
  reportDate: z.array(z.string().optional()),
  acceptanceDateTime: z.array(z.string().optional()),
  act: z.array(z.string().optional()),
  form: z.array(z.string()),
  fileNumber: z.array(z.string().optional()),
  filmNumber: z.array(z.string().optional()),
  items: z.array(z.string().optional()),
  size: z.array(z.number().optional()),
  isXBRL: z.array(z.number().optional()),
  isInlineXBRL: z.array(z.number().optional()),
  primaryDocument: z.array(z.string()),
  primaryDocDescription: z.array(z.string().optional()),
});

export const EdgarSubmissionSchema = z.object({
  cik: z.string(),
  entityType: z.string().optional(),
  sic: z.string().optional(),
  sicDescription: z.string().optional(),
  name: z.string().optional(),
  tickers: z.array(z.string()).optional(),
  exchanges: z.array(z.string()).optional(),
  ein: z.string().optional(),
  description: z.string().optional(),
  website: z.string().optional(),
  category: z.string().optional(),
  stateOfIncorporation: z.string().optional(),
  stateOfIncorporationDescription: z.string().optional(),
  filingCounts: z.record(z.number()).optional(),
  filings: z.object({
    recent: EdgarRecentFilingsSchema,
    files: z
      .array(
        z.object({
          name: z.string(),
          filingCount: z.number(),
          filingFrom: z.string(),
          filingTo: z.string(),
        }),
      )
      .optional(),
  }),
});

export type EdgarSubmission = z.infer<typeof EdgarSubmissionSchema>;

export interface EdgarFiling {
  accessionNumber: string;
  filingDate: string;
  reportDate: string | null;
  form: string;
  primaryDocument: string;
  primaryDocDescription: string | null;
  documentUrl: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Pad a CIK to 10 digits as required by the EDGAR submissions endpoint.
 */
function padCik(cik: string): string {
  return cik.replace(/^CIK/i, "").padStart(10, "0");
}

/**
 * Convert an accession number like "0000950170-24-001234" to the
 * EDGAR document viewer URL format "000095017024001234".
 */
function accessionToPath(accessionNumber: string): string {
  return accessionNumber.replace(/-/g, "");
}

/**
 * Build the full EDGAR document URL for a given filing.
 */
function buildDocumentUrl(
  cik: string,
  accessionNumber: string,
  primaryDocument: string,
): string {
  const paddedCik = padCik(cik);
  const accPath = accessionToPath(accessionNumber);
  return `https://www.sec.gov/Archives/edgar/data/${parseInt(paddedCik, 10)}/${accPath}/${primaryDocument}`;
}

// ---------------------------------------------------------------------------
// Map to internal schema
// ---------------------------------------------------------------------------

export function mapToFiling(
  raw: EdgarFiling,
  cik: string,
): Omit<NewFiling, "id" | "createdAt" | "companyId" | "summary" | "embedding"> {
  return {
    filingType: raw.form,
    filedDate: raw.filingDate,
    periodOfReport: raw.reportDate ?? null,
    title: `${raw.form} — ${raw.filingDate}`,
    description: raw.primaryDocDescription ?? null,
    sourceUrl: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cik}&type=${encodeURIComponent(raw.form)}&dateb=&owner=include&count=40`,
    documentUrl: raw.documentUrl,
  };
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

/**
 * Fetch a company's submission metadata from SEC EDGAR, including recent
 * filings. Optionally filter by filing types.
 */
export async function fetchFilings(
  cik: string,
  filingTypes: string[] = [...DEFAULT_FILING_TYPES],
): Promise<EdgarFiling[]> {
  const paddedCik = padCik(cik);
  const url = `${BASE_URL}/submissions/CIK${paddedCik}.json`;

  const response = await fetch(url, { headers: SEC_HEADERS });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`SEC EDGAR: No submissions found for CIK ${cik} (404)`);
    }
    throw new Error(
      `SEC EDGAR API error: ${response.status} ${response.statusText} for CIK ${cik}`,
    );
  }

  const json: unknown = await response.json();
  const submission = EdgarSubmissionSchema.parse(json);

  const recent = submission.filings.recent;
  const filings: EdgarFiling[] = [];

  for (let i = 0; i < recent.accessionNumber.length; i++) {
    const form = recent.form[i];
    if (!form) continue;

    // Filter to only the filing types we care about
    const normalizedForm = form.trim().toUpperCase();
    if (
      !filingTypes.some(
        (ft) => ft.toUpperCase() === normalizedForm,
      )
    ) {
      continue;
    }

    const accessionNumber = recent.accessionNumber[i];
    const primaryDocument = recent.primaryDocument[i];
    if (!accessionNumber || !primaryDocument) continue;

    filings.push({
      accessionNumber,
      filingDate: recent.filingDate[i] ?? "",
      reportDate: recent.reportDate[i] ?? null,
      form,
      primaryDocument,
      primaryDocDescription: recent.primaryDocDescription[i] ?? null,
      documentUrl: buildDocumentUrl(cik, accessionNumber, primaryDocument),
    });
  }

  return filings;
}

/**
 * Fetch the full submission object for a given CIK. Useful for accessing
 * company metadata (name, tickers, SIC, etc.) alongside filing history.
 */
export async function fetchSubmission(cik: string): Promise<EdgarSubmission> {
  const paddedCik = padCik(cik);
  const url = `${BASE_URL}/submissions/CIK${paddedCik}.json`;

  const response = await fetch(url, { headers: SEC_HEADERS });

  if (!response.ok) {
    throw new Error(
      `SEC EDGAR API error: ${response.status} ${response.statusText} for CIK ${cik}`,
    );
  }

  const json: unknown = await response.json();
  return EdgarSubmissionSchema.parse(json);
}
