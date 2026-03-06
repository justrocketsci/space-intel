"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Globe,
  MapPin,
  Users,
  DollarSign,
  Rocket,
  FileSignature,
  FileText,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Re-use company data from the companies page (in production this would
// come from tRPC via the companies.getBySlug endpoint)
const COMPANIES: Record<
  string,
  {
    name: string;
    description: string;
    website: string;
    foundedYear: number;
    hqLocation: string;
    sector: string;
    isPublic: boolean;
    ticker: string | null;
    employeeCount: number | null;
    fundingTotal: number | null;
    marketCap: number | null;
    tags: string[];
  }
> = {
  spacex: {
    name: "SpaceX",
    description:
      "SpaceX designs, manufactures and launches advanced rockets and spacecraft, having developed the world's first fully reusable orbital rocket and operating the Starlink satellite constellation.",
    website: "https://www.spacex.com",
    foundedYear: 2002,
    hqLocation: "Hawthorne, CA",
    sector: "launch",
    isPublic: false,
    ticker: null,
    employeeCount: 13000,
    fundingTotal: 9800000000,
    marketCap: null,
    tags: ["reusable", "falcon", "starlink", "starship"],
  },
  "rocket-lab": {
    name: "Rocket Lab",
    description:
      "Rocket Lab is an end-to-end space company providing dedicated small satellite launch services via its Electron rocket and developing the medium-lift Neutron vehicle.",
    website: "https://www.rocketlabusa.com",
    foundedYear: 2006,
    hqLocation: "Long Beach, CA",
    sector: "launch",
    isPublic: true,
    ticker: "RKLB",
    employeeCount: 1900,
    fundingTotal: null,
    marketCap: 8200000000,
    tags: ["electron", "neutron", "smallsat"],
  },
  "planet-labs": {
    name: "Planet Labs",
    description:
      "Planet Labs operates the world's largest fleet of Earth-imaging satellites, delivering daily global coverage for agriculture, government, and enterprise customers.",
    website: "https://www.planet.com",
    foundedYear: 2010,
    hqLocation: "San Francisco, CA",
    sector: "analytics",
    isPublic: true,
    ticker: "PL",
    employeeCount: 900,
    fundingTotal: null,
    marketCap: 620000000,
    tags: ["earth-observation", "dove", "skisat"],
  },
  "blue-origin": {
    name: "Blue Origin",
    description:
      "Blue Origin is a private aerospace company developing reusable launch vehicles including New Shepard for suborbital tourism and New Glenn for orbital missions, founded by Jeff Bezos.",
    website: "https://www.blueorigin.com",
    foundedYear: 2000,
    hqLocation: "Kent, WA",
    sector: "launch",
    isPublic: false,
    ticker: null,
    employeeCount: 11000,
    fundingTotal: 7700000000,
    marketCap: null,
    tags: ["new-shepard", "new-glenn", "be-4"],
  },
};

const SECTOR_COLORS: Record<string, string> = {
  launch: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  satellite: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  ground_segment: "bg-green-500/15 text-green-400 border-green-500/30",
  analytics: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  manufacturing: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  services: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
};

function formatMoney(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatNumber(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(value);
}

export default function CompanyProfilePage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const company = COMPANIES[slug];

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Building2 className="w-12 h-12 text-gray-600" />
        <h2 className="text-xl font-semibold text-white">Company Not Found</h2>
        <p className="text-gray-400 text-sm">
          No company matching &ldquo;{slug}&rdquo; was found.
        </p>
        <Link
          href="/companies"
          className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Companies
        </Link>
      </div>
    );
  }

  const sectorColor =
    SECTOR_COLORS[company.sector] ??
    "bg-gray-500/15 text-gray-400 border-gray-500/30";
  const sectorLabel = company.sector
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="flex flex-col gap-6 p-6 min-h-full">
      {/* Breadcrumb / Back */}
      <Link
        href="/companies"
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Companies
      </Link>

      {/* Company header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/20 shrink-0">
            <Building2 className="w-7 h-7 text-blue-400" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {company.name}
              </h1>
              {company.isPublic ? (
                <Badge variant="success" className="text-xs">
                  PUBLIC
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  PRIVATE
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${sectorColor}`}
              >
                {sectorLabel}
              </span>
              {company.ticker && (
                <span className="text-sm font-mono text-gray-400">
                  {company.ticker}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 max-w-2xl leading-relaxed mt-1">
              {company.description}
            </p>
          </div>
        </div>
      </div>

      {/* Key info cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              Founded
            </div>
            <span className="text-lg font-bold text-white">
              {company.foundedYear}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5" />
              HQ
            </div>
            <span className="text-sm font-semibold text-white">
              {company.hqLocation}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Users className="w-3.5 h-3.5" />
              Employees
            </div>
            <span className="text-lg font-bold text-white font-mono">
              {formatNumber(company.employeeCount)}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <DollarSign className="w-3.5 h-3.5" />
              {company.isPublic ? "Market Cap" : "Total Funding"}
            </div>
            <span className="text-lg font-bold text-white font-mono">
              {formatMoney(
                company.isPublic ? company.marketCap : company.fundingTotal
              )}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Globe className="w-3.5 h-3.5" />
              Website
            </div>
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              Visit
              <ExternalLink className="w-3 h-3" />
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              Tags
            </div>
            <div className="flex flex-wrap gap-1">
              {company.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Launches */}
        <Card className="flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-blue-400" />
              <CardTitle className="text-base font-semibold text-white">
                Launch History
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Rocket className="w-8 h-8 text-gray-600 mb-3" />
              <p className="text-sm text-gray-400">
                Launch data will populate once the ingestion pipeline runs.
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Connect to a database and run{" "}
                <code className="bg-gray-800 px-1 rounded">pnpm db:seed</code>{" "}
                to get started.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contracts */}
        <Card className="flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <FileSignature className="w-4 h-4 text-green-400" />
              <CardTitle className="text-base font-semibold text-white">
                Government Contracts
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileSignature className="w-8 h-8 text-gray-600 mb-3" />
              <p className="text-sm text-gray-400">
                Contract data will populate from USAspending and SBIR syncs.
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Triggered automatically via Inngest scheduled jobs.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SEC Filings */}
        <Card className="flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <CardTitle className="text-base font-semibold text-white">
                SEC Filings
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="w-8 h-8 text-gray-600 mb-3" />
              <p className="text-sm text-gray-400">
                {company.isPublic
                  ? "SEC filings will appear after the EDGAR sync completes."
                  : "This is a private company — no SEC filings are tracked."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Funding Rounds */}
        <Card className="flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-purple-400" />
              <CardTitle className="text-base font-semibold text-white">
                Funding Rounds
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <DollarSign className="w-8 h-8 text-gray-600 mb-3" />
              <p className="text-sm text-gray-400">
                Funding round data will be added as new data sources come
                online.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
