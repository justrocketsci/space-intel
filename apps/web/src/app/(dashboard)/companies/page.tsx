"use client";

import * as React from "react";
import { Building2 } from "lucide-react";
import { CompanyTable, type CompanyRow } from "@/components/companies/company-table";
import { CompanyFilters } from "@/components/companies/company-filters";

const MOCK_COMPANIES: CompanyRow[] = [
  {
    id: "1",
    name: "SpaceX",
    slug: "spacex",
    sector: "launch",
    isPublic: false,
    ticker: null,
    hqLocation: "Hawthorne, CA",
    employeeCount: 13000,
    fundingTotal: 9800000000,
    marketCap: null,
    tags: ["reusable", "falcon", "starlink", "starship"],
  },
  {
    id: "2",
    name: "Rocket Lab",
    slug: "rocket-lab",
    sector: "launch",
    isPublic: true,
    ticker: "RKLB",
    hqLocation: "Long Beach, CA",
    employeeCount: 1900,
    fundingTotal: null,
    marketCap: 8200000000,
    tags: ["electron", "neutron", "smallsat"],
  },
  {
    id: "3",
    name: "Virgin Galactic",
    slug: "virgin-galactic",
    sector: "services",
    isPublic: true,
    ticker: "SPCE",
    hqLocation: "Tuscon, AZ",
    employeeCount: 850,
    fundingTotal: null,
    marketCap: 380000000,
    tags: ["space-tourism", "delta-class"],
  },
  {
    id: "4",
    name: "Planet Labs",
    slug: "planet-labs",
    sector: "analytics",
    isPublic: true,
    ticker: "PL",
    hqLocation: "San Francisco, CA",
    employeeCount: 900,
    fundingTotal: null,
    marketCap: 620000000,
    tags: ["earth-observation", "dove", "skisat"],
  },
  {
    id: "5",
    name: "Maxar Technologies",
    slug: "maxar-technologies",
    sector: "satellite",
    isPublic: false,
    ticker: null,
    hqLocation: "Westminster, CO",
    employeeCount: 6200,
    fundingTotal: 6300000000,
    marketCap: null,
    tags: ["geoint", "worldview", "defense"],
  },
  {
    id: "6",
    name: "L3Harris Technologies",
    slug: "l3harris",
    sector: "manufacturing",
    isPublic: true,
    ticker: "LHX",
    hqLocation: "Melbourne, FL",
    employeeCount: 47000,
    fundingTotal: null,
    marketCap: 38500000000,
    tags: ["defense", "space-systems", "communications"],
  },
  {
    id: "7",
    name: "Northrop Grumman",
    slug: "northrop-grumman",
    sector: "manufacturing",
    isPublic: true,
    ticker: "NOC",
    hqLocation: "Falls Church, VA",
    employeeCount: 95000,
    fundingTotal: null,
    marketCap: 68000000000,
    tags: ["defense", "launch", "satellite"],
  },
  {
    id: "8",
    name: "Lockheed Martin",
    slug: "lockheed-martin",
    sector: "manufacturing",
    isPublic: true,
    ticker: "LMT",
    hqLocation: "Bethesda, MD",
    employeeCount: 114000,
    fundingTotal: null,
    marketCap: 118000000000,
    tags: ["defense", "orion", "sbirs"],
  },
  {
    id: "9",
    name: "Boeing",
    slug: "boeing",
    sector: "manufacturing",
    isPublic: true,
    ticker: "BA",
    hqLocation: "Arlington, VA",
    employeeCount: 156000,
    fundingTotal: null,
    marketCap: 104000000000,
    tags: ["defense", "starliner", "slc"],
  },
  {
    id: "10",
    name: "Blue Origin",
    slug: "blue-origin",
    sector: "launch",
    isPublic: false,
    ticker: null,
    hqLocation: "Kent, WA",
    employeeCount: 11000,
    fundingTotal: 7700000000,
    marketCap: null,
    tags: ["new-shepard", "new-glenn", "be-4"],
  },
  {
    id: "11",
    name: "Relativity Space",
    slug: "relativity-space",
    sector: "launch",
    isPublic: false,
    ticker: null,
    hqLocation: "Long Beach, CA",
    employeeCount: 900,
    fundingTotal: 1330000000,
    marketCap: null,
    tags: ["3d-printing", "terran-r", "additive"],
  },
  {
    id: "12",
    name: "Firefly Aerospace",
    slug: "firefly-aerospace",
    sector: "launch",
    isPublic: false,
    ticker: null,
    hqLocation: "Cedar Park, TX",
    employeeCount: 750,
    fundingTotal: 305000000,
    marketCap: null,
    tags: ["alpha", "mlv", "lunar"],
  },
  {
    id: "13",
    name: "Intuitive Machines",
    slug: "intuitive-machines",
    sector: "services",
    isPublic: true,
    ticker: "LUNR",
    hqLocation: "Houston, TX",
    employeeCount: 220,
    fundingTotal: null,
    marketCap: 490000000,
    tags: ["lunar", "clps", "nova-c"],
  },
  {
    id: "14",
    name: "Redwire",
    slug: "redwire",
    sector: "manufacturing",
    isPublic: true,
    ticker: "RDW",
    hqLocation: "Jacksonville, FL",
    employeeCount: 600,
    fundingTotal: null,
    marketCap: 320000000,
    tags: ["in-space-manufacturing", "solar-arrays", "iss"],
  },
  {
    id: "15",
    name: "Spire Global",
    slug: "spire-global",
    sector: "analytics",
    isPublic: true,
    ticker: "SPIR",
    hqLocation: "Vienna, VA",
    employeeCount: 550,
    fundingTotal: null,
    marketCap: 175000000,
    tags: ["gnss-ro", "ais", "weather"],
  },
  {
    id: "16",
    name: "BlackSky Technology",
    slug: "blacksky",
    sector: "analytics",
    isPublic: true,
    ticker: "BKSY",
    hqLocation: "Herndon, VA",
    employeeCount: 260,
    fundingTotal: null,
    marketCap: 210000000,
    tags: ["earth-observation", "geoint", "real-time"],
  },
  {
    id: "17",
    name: "Iridium Communications",
    slug: "iridium",
    sector: "satellite",
    isPublic: true,
    ticker: "IRDM",
    hqLocation: "McLean, VA",
    employeeCount: 950,
    fundingTotal: null,
    marketCap: 4200000000,
    tags: ["leo-constellation", "satcom", "iot"],
  },
  {
    id: "18",
    name: "Viasat",
    slug: "viasat",
    sector: "satellite",
    isPublic: true,
    ticker: "VSAT",
    hqLocation: "Carlsbad, CA",
    employeeCount: 8200,
    fundingTotal: null,
    marketCap: 2900000000,
    tags: ["broadband", "geosynchronous", "military"],
  },
  {
    id: "19",
    name: "Terran Orbital",
    slug: "terran-orbital",
    sector: "manufacturing",
    isPublic: true,
    ticker: "LLAP",
    hqLocation: "Boca Raton, FL",
    employeeCount: 290,
    fundingTotal: null,
    marketCap: 145000000,
    tags: ["smallsat", "cubesat", "government"],
  },
  {
    id: "20",
    name: "Astra Space",
    slug: "astra-space",
    sector: "launch",
    isPublic: true,
    ticker: "ASTR",
    hqLocation: "Alameda, CA",
    employeeCount: 200,
    fundingTotal: null,
    marketCap: 90000000,
    tags: ["smallsat-launch", "propulsion", "rocket"],
  },
];

type CompanyType = "all" | "public" | "private";

export default function CompaniesPage() {
  const [search, setSearch] = React.useState("");
  const [sector, setSector] = React.useState("all");
  const [type, setType] = React.useState<CompanyType>("all");

  const filtered = React.useMemo(() => {
    return MOCK_COMPANIES.filter((c) => {
      const matchesSearch =
        search === "" || c.name.toLowerCase().includes(search.toLowerCase());
      const matchesSector = sector === "all" || c.sector === sector;
      const matchesType =
        type === "all" ||
        (type === "public" && c.isPublic) ||
        (type === "private" && !c.isPublic);
      return matchesSearch && matchesSector && matchesType;
    });
  }, [search, sector, type]);

  return (
    <div className="flex flex-col gap-6 p-6 min-h-full">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Building2 className="w-4 h-4 text-blue-400" />
            </div>
            <h1 className="text-xl font-semibold text-white tracking-tight">Companies</h1>
          </div>
          <p className="text-sm text-gray-400 ml-10.5">
            Track {MOCK_COMPANIES.length} space companies worldwide
          </p>
        </div>
      </div>

      {/* Filters */}
      <CompanyFilters
        searchValue={search}
        sectorValue={sector}
        typeValue={type}
        onSearchChange={setSearch}
        onSectorChange={setSector}
        onTypeChange={setType}
      />

      {/* Table */}
      <div className="flex flex-col gap-2">
        {filtered.length !== MOCK_COMPANIES.length && (
          <p className="text-xs text-gray-500">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} matching current filters
          </p>
        )}
        <CompanyTable companies={filtered} />
      </div>
    </div>
  );
}
