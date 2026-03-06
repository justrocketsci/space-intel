"use client";

import { FileText } from "lucide-react";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type FilingType = "10-K" | "10-Q" | "8-K";

interface Filing {
  id: string;
  company: string;
  type: FilingType;
  title: string;
  date: Date;
}

const MOCK_FILINGS: Filing[] = [
  {
    id: "1",
    company: "Rocket Lab USA",
    type: "10-K",
    title: "Annual Report FY2025",
    date: new Date("2026-02-24"),
  },
  {
    id: "2",
    company: "Virgin Galactic",
    type: "8-K",
    title: "Q4 2025 Earnings Release",
    date: new Date("2026-02-20"),
  },
  {
    id: "3",
    company: "Planet Labs",
    type: "10-Q",
    title: "Quarterly Report Q3 FY2026",
    date: new Date("2026-02-18"),
  },
  {
    id: "4",
    company: "Spire Global",
    type: "8-K",
    title: "Executive Leadership Change",
    date: new Date("2026-02-15"),
  },
  {
    id: "5",
    company: "BlackSky Technology",
    type: "10-Q",
    title: "Quarterly Report Q3 FY2026",
    date: new Date("2026-02-12"),
  },
];

const FILING_TYPE_STYLES: Record<FilingType, string> = {
  "10-K": "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  "10-Q": "bg-green-500/20 text-green-400 border border-green-500/30",
  "8-K": "bg-amber-500/20 text-amber-400 border border-amber-500/30",
};

export function RecentFilings() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-semibold text-white">
            Recent SEC Filings
          </CardTitle>
          <p className="mt-1 text-xs text-gray-500">
            Latest regulatory disclosures
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
          <FileText className="h-4 w-4 text-blue-400" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 px-6 pb-6">
        <div className="space-y-3">
          {MOCK_FILINGS.map((filing) => (
            <div
              key={filing.id}
              className="flex items-start gap-3 rounded-lg border border-gray-800 bg-gray-800/40 p-3 transition-colors hover:bg-gray-800/70"
            >
              <div className="mt-0.5 flex-shrink-0">
                <span
                  className={cn(
                    "inline-flex items-center rounded px-2 py-0.5 text-xs font-bold",
                    FILING_TYPE_STYLES[filing.type]
                  )}
                >
                  {filing.type}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">
                  {filing.company}
                </p>
                <p className="mt-0.5 truncate text-xs text-gray-400">
                  {filing.title}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {format(filing.date, "MMM d, yyyy")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
