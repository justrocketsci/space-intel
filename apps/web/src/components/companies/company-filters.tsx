"use client";

import * as React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTORS = [
  { value: "all", label: "All Sectors" },
  { value: "launch", label: "Launch" },
  { value: "satellite", label: "Satellite" },
  { value: "ground_segment", label: "Ground Segment" },
  { value: "analytics", label: "Analytics" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "services", label: "Services" },
];

type CompanyType = "all" | "public" | "private";

interface CompanyFiltersProps {
  onSearchChange: (value: string) => void;
  onSectorChange: (value: string) => void;
  onTypeChange: (value: CompanyType) => void;
  searchValue?: string;
  sectorValue?: string;
  typeValue?: CompanyType;
}

const TYPE_OPTIONS: { value: CompanyType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];

export function CompanyFilters({
  onSearchChange,
  onSectorChange,
  onTypeChange,
  searchValue = "",
  sectorValue = "all",
  typeValue = "all",
}: CompanyFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Search input */}
      <div className="relative flex-1 min-w-0 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search companies..."
          className={cn(
            "w-full h-9 pl-9 pr-3 text-sm rounded-lg",
            "bg-gray-900 border border-gray-700 text-white placeholder:text-gray-500",
            "outline-none focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/30",
            "transition-colors duration-150"
          )}
        />
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-gray-500">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="text-xs font-medium uppercase tracking-wider hidden sm:inline">Filters</span>
        </div>

        {/* Sector select */}
        <select
          value={sectorValue}
          onChange={(e) => onSectorChange(e.target.value)}
          className={cn(
            "h-9 px-3 pr-8 text-sm rounded-lg appearance-none cursor-pointer",
            "bg-gray-900 border border-gray-700 text-gray-300",
            "outline-none focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/30",
            "transition-colors duration-150",
            "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")] bg-no-repeat bg-[right_0.6rem_center]"
          )}
        >
          {SECTORS.map((s) => (
            <option key={s.value} value={s.value} className="bg-gray-900 text-white">
              {s.label}
            </option>
          ))}
        </select>

        {/* Type toggle */}
        <div className="flex items-center rounded-lg border border-gray-700 bg-gray-900 overflow-hidden h-9">
          {TYPE_OPTIONS.map((opt, i) => (
            <button
              key={opt.value}
              onClick={() => onTypeChange(opt.value)}
              className={cn(
                "px-3 h-full text-sm font-medium transition-colors duration-150",
                i > 0 && "border-l border-gray-700",
                typeValue === opt.value
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
