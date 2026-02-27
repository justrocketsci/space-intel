"use client";

import { FileSignature } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Contract {
  id: string;
  title: string;
  agency: string;
  company: string;
  amount: number;
}

const MOCK_CONTRACTS: Contract[] = [
  {
    id: "1",
    title: "Lunar Gateway Logistics Services",
    agency: "NASA",
    company: "Northrop Grumman",
    amount: 3_200_000_000,
  },
  {
    id: "2",
    title: "Space Transport Services",
    agency: "USSF",
    company: "SpaceX",
    amount: 1_800_000_000,
  },
  {
    id: "3",
    title: "Satellite Ground Systems Modernization",
    agency: "USSF",
    company: "L3Harris",
    amount: 920_000_000,
  },
  {
    id: "4",
    title: "Next Gen Weather Satellite",
    agency: "NOAA",
    company: "Ball Aerospace",
    amount: 680_000_000,
  },
  {
    id: "5",
    title: "Propulsion Testing Services",
    agency: "NASA",
    company: "Aerojet Rocketdyne",
    amount: 450_000_000,
  },
];

const AGENCY_COLORS: Record<string, string> = {
  NASA: "bg-blue-600 text-white",
  USSF: "bg-indigo-600 text-white",
  NOAA: "bg-teal-600 text-white",
  DoD: "bg-slate-600 text-white",
};

function formatAmount(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(0)}M`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

const totalValue = MOCK_CONTRACTS.reduce((sum, c) => sum + c.amount, 0);

export function RecentContracts() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-semibold text-white">
            Recent Contracts
          </CardTitle>
          <p className="mt-1 text-xs text-gray-500">
            Total value:{" "}
            <span className="font-semibold text-green-400">
              {formatAmount(totalValue)}
            </span>
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
          <FileSignature className="h-4 w-4 text-green-400" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 px-6 pb-6">
        <div className="space-y-3">
          {MOCK_CONTRACTS.map((contract) => (
            <div
              key={contract.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-gray-800 bg-gray-800/40 p-3 transition-colors hover:bg-gray-800/70"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex rounded px-1.5 py-0.5 text-xs font-bold ${AGENCY_COLORS[contract.agency] ?? "bg-gray-700 text-gray-300"}`}
                  >
                    {contract.agency}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium leading-snug text-white">
                  {contract.title}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {contract.company}
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <span className="text-sm font-bold text-green-400">
                  {formatAmount(contract.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
