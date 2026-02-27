"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProviderFilter =
  | "all"
  | "SpaceX"
  | "Rocket Lab"
  | "ULA"
  | "Arianespace"
  | "ISRO"
  | "CASC"
  | "Other";

export type StatusFilter = "all" | "success" | "failure" | "upcoming";
export type YearFilter = "all" | "2024" | "2025" | "2026";

export interface LaunchFilterValues {
  search: string;
  provider: ProviderFilter;
  status: StatusFilter;
  year: YearFilter;
}

interface LaunchFiltersProps {
  filters: LaunchFilterValues;
  onChange: (filters: LaunchFilterValues) => void;
}

const selectClassName = cn(
  "h-9 px-3 rounded-md text-sm",
  "bg-gray-900 border border-gray-700 text-gray-300",
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
  "hover:border-gray-600 transition-colors duration-150",
  "cursor-pointer appearance-none pr-8",
  "[&>option]:bg-gray-900 [&>option]:text-gray-300"
);

export function LaunchFilters({ filters, onChange }: LaunchFiltersProps) {
  function update<K extends keyof LaunchFilterValues>(
    key: K,
    value: LaunchFilterValues[K]
  ) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search missions..."
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          className={cn(
            "w-full h-9 pl-9 pr-3 rounded-md text-sm",
            "bg-gray-900 border border-gray-700 text-white placeholder:text-gray-500",
            "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
            "hover:border-gray-600 transition-colors duration-150"
          )}
        />
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-6 bg-gray-700" />

      {/* Provider filter */}
      <div className="relative">
        <select
          value={filters.provider}
          onChange={(e) => update("provider", e.target.value as ProviderFilter)}
          className={selectClassName}
        >
          <option value="all">All Providers</option>
          <option value="SpaceX">SpaceX</option>
          <option value="Rocket Lab">Rocket Lab</option>
          <option value="ULA">ULA</option>
          <option value="Arianespace">Arianespace</option>
          <option value="ISRO">ISRO</option>
          <option value="CASC">CASC</option>
          <option value="Other">Other</option>
        </select>
        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Status filter */}
      <div className="relative">
        <select
          value={filters.status}
          onChange={(e) => update("status", e.target.value as StatusFilter)}
          className={selectClassName}
        >
          <option value="all">All Statuses</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
          <option value="upcoming">Upcoming</option>
        </select>
        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Year filter */}
      <div className="relative">
        <select
          value={filters.year}
          onChange={(e) => update("year", e.target.value as YearFilter)}
          className={selectClassName}
        >
          <option value="all">All Years</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Clear filters */}
      {(filters.search || filters.provider !== "all" || filters.status !== "all" || filters.year !== "all") && (
        <button
          onClick={() =>
            onChange({ search: "", provider: "all", status: "all", year: "all" })
          }
          className="h-9 px-3 text-sm text-gray-400 hover:text-white transition-colors duration-150 underline-offset-2 hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
