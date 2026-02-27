"use client";

import * as React from "react";
import { Rocket, BarChart3 } from "lucide-react";
import { LaunchTable, type LaunchRow } from "@/components/launches/launch-table";
import {
  LaunchFilters,
  type LaunchFilterValues,
} from "@/components/launches/launch-filters";
import { Badge } from "@/components/ui/badge";

const MOCK_LAUNCHES: LaunchRow[] = [
  {
    id: "1",
    missionName: "Starlink Group 12-6",
    provider: "SpaceX",
    launchDate: new Date("2026-02-28T04:30:00Z"),
    status: "upcoming",
    vehicle: "Falcon 9 Block 5",
    padLocation: "SLC-40, Cape Canaveral",
    orbitType: "LEO",
    customer: "SpaceX (Starlink)",
  },
  {
    id: "2",
    missionName: "NROL-69",
    provider: "ULA",
    launchDate: new Date("2026-03-03T12:00:00Z"),
    status: "upcoming",
    vehicle: "Vulcan Centaur",
    padLocation: "SLC-41, Cape Canaveral",
    orbitType: "GTO",
    customer: "NRO",
  },
  {
    id: "3",
    missionName: "Transporter-13",
    provider: "SpaceX",
    launchDate: new Date("2026-03-08T18:00:00Z"),
    status: "upcoming",
    vehicle: "Falcon 9 Block 5",
    padLocation: "SLC-4E, Vandenberg",
    orbitType: "SSO",
    customer: "Rideshare",
  },
  {
    id: "4",
    missionName: "Crew-10",
    provider: "SpaceX",
    launchDate: new Date("2026-03-14T09:00:00Z"),
    status: "upcoming",
    vehicle: "Falcon 9 Block 5",
    padLocation: "LC-39A, Kennedy Space Center",
    orbitType: "LEO",
    customer: "NASA",
  },
  {
    id: "5",
    missionName: "OneWeb #20",
    provider: "SpaceX",
    launchDate: new Date("2026-03-22T14:30:00Z"),
    status: "upcoming",
    vehicle: "Falcon 9 Block 5",
    padLocation: "SLC-40, Cape Canaveral",
    orbitType: "LEO",
    customer: "OneWeb",
  },
  {
    id: "6",
    missionName: "Starlink Group 10-12",
    provider: "SpaceX",
    launchDate: new Date("2026-02-20T02:15:00Z"),
    status: "success",
    vehicle: "Falcon 9 Block 5",
    padLocation: "SLC-40, Cape Canaveral",
    orbitType: "LEO",
    customer: "SpaceX (Starlink)",
  },
  {
    id: "7",
    missionName: "GOES-U",
    provider: "ULA",
    launchDate: new Date("2026-02-15T18:30:00Z"),
    status: "success",
    vehicle: "Atlas V 541",
    padLocation: "SLC-41, Cape Canaveral",
    orbitType: "GTO",
    customer: "NOAA / NASA",
  },
  {
    id: "8",
    missionName: "There and Back Again",
    provider: "Rocket Lab",
    launchDate: new Date("2026-02-10T06:45:00Z"),
    status: "success",
    vehicle: "Electron",
    padLocation: "LC-1B, Mahia Peninsula",
    orbitType: "SSO",
    customer: "Synspective",
  },
  {
    id: "9",
    missionName: "CRS-30",
    provider: "SpaceX",
    launchDate: new Date("2026-01-28T11:00:00Z"),
    status: "success",
    vehicle: "Falcon 9 Block 5",
    padLocation: "LC-39A, Kennedy Space Center",
    orbitType: "LEO",
    customer: "NASA",
  },
  {
    id: "10",
    missionName: "Astra Flight 13",
    provider: "Astra Space",
    launchDate: new Date("2026-01-22T20:30:00Z"),
    status: "failure",
    vehicle: "Rocket 4",
    padLocation: "Pacific Spaceport, Kodiak",
    orbitType: "LEO",
    customer: "Undisclosed",
  },
  {
    id: "11",
    missionName: "PSLV-C60 / SPADEX",
    provider: "ISRO",
    launchDate: new Date("2026-01-15T09:00:00Z"),
    status: "success",
    vehicle: "PSLV-XL",
    padLocation: "First Launch Pad, Sriharikota",
    orbitType: "LEO",
    customer: "ISRO",
  },
  {
    id: "12",
    missionName: "Ariane 6 Flight 3",
    provider: "Arianespace",
    launchDate: new Date("2025-12-18T22:30:00Z"),
    status: "success",
    vehicle: "Ariane 6",
    padLocation: "ELA-4, Kourou",
    orbitType: "GTO",
    customer: "SES / Eutelsat",
  },
  {
    id: "13",
    missionName: "Long March 5B Y6",
    provider: "CASC",
    launchDate: new Date("2025-12-10T04:00:00Z"),
    status: "success",
    vehicle: "Long March 5B",
    padLocation: "Wenchang Launch Center",
    orbitType: "LEO",
    customer: "CMS (Space Station)",
  },
  {
    id: "14",
    missionName: "Falcon Heavy / Europa Clipper",
    provider: "SpaceX",
    launchDate: new Date("2025-11-15T16:00:00Z"),
    status: "success",
    vehicle: "Falcon Heavy",
    padLocation: "LC-39A, Kennedy Space Center",
    orbitType: "Heliocentric",
    customer: "NASA / JPL",
  },
  {
    id: "15",
    missionName: "Blue Ghost M1",
    provider: "Firefly Aerospace",
    launchDate: new Date("2025-11-01T08:00:00Z"),
    status: "success",
    vehicle: "Falcon 9 Block 5",
    padLocation: "SLC-40, Cape Canaveral",
    orbitType: "TLI",
    customer: "NASA CLPS",
  },
];

const DEFAULT_FILTERS: LaunchFilterValues = {
  search: "",
  provider: "all",
  status: "all",
  year: "all",
};

export default function LaunchesPage() {
  const [filters, setFilters] = React.useState<LaunchFilterValues>(DEFAULT_FILTERS);

  const filtered = React.useMemo(() => {
    return MOCK_LAUNCHES.filter((l) => {
      const matchesSearch =
        filters.search === "" ||
        l.missionName.toLowerCase().includes(filters.search.toLowerCase()) ||
        l.customer.toLowerCase().includes(filters.search.toLowerCase());

      const matchesProvider =
        filters.provider === "all" || l.provider === filters.provider;

      const matchesStatus =
        filters.status === "all" || l.status === filters.status;

      const matchesYear =
        filters.year === "all" ||
        l.launchDate.getFullYear().toString() === filters.year;

      return matchesSearch && matchesProvider && matchesStatus && matchesYear;
    });
  }, [filters]);

  const successCount = MOCK_LAUNCHES.filter((l) => l.status === "success").length;
  const upcomingCount = MOCK_LAUNCHES.filter((l) => l.status === "upcoming").length;
  const totalPast = MOCK_LAUNCHES.filter((l) => l.status !== "upcoming").length;
  const successRate = totalPast > 0 ? Math.round((successCount / totalPast) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 p-6 min-h-full">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Rocket className="w-4 h-4 text-blue-400" />
            </div>
            <h1 className="text-xl font-semibold text-white tracking-tight">
              Launch Tracker
            </h1>
          </div>
          <p className="text-sm text-gray-400 ml-10.5">
            Track global orbital launch activity
          </p>
        </div>

        {/* Summary stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Badge variant="default" className="text-xs">
              {upcomingCount} upcoming
            </Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="success" className="text-xs">
              {successRate}% success
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <BarChart3 className="w-3.5 h-3.5" />
            {MOCK_LAUNCHES.length} total
          </div>
        </div>
      </div>

      {/* Filters */}
      <LaunchFilters filters={filters} onChange={setFilters} />

      {/* Results count */}
      {filtered.length !== MOCK_LAUNCHES.length && (
        <p className="text-xs text-gray-500 -mt-3">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} matching
          current filters
        </p>
      )}

      {/* Table */}
      <div className="rounded-lg border border-gray-800 bg-gray-900 overflow-hidden">
        <LaunchTable launches={filtered} />
      </div>
    </div>
  );
}
