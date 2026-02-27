"use client";

import Link from "next/link";
import { Rocket, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Launch {
  id: string;
  mission: string;
  provider: string;
  vehicle: string;
  date: Date;
  status: "upcoming" | "go" | "tbd";
}

const MOCK_LAUNCHES: Launch[] = [
  {
    id: "1",
    mission: "Starlink Group 12-6",
    provider: "SpaceX",
    vehicle: "Falcon 9",
    date: new Date("2026-02-28T00:00:00Z"),
    status: "upcoming",
  },
  {
    id: "2",
    mission: "NROL-69",
    provider: "ULA",
    vehicle: "Vulcan Centaur",
    date: new Date("2026-03-03T00:00:00Z"),
    status: "upcoming",
  },
  {
    id: "3",
    mission: "Transporter-13",
    provider: "SpaceX",
    vehicle: "Falcon 9",
    date: new Date("2026-03-08T00:00:00Z"),
    status: "upcoming",
  },
  {
    id: "4",
    mission: "Crew-10",
    provider: "SpaceX",
    vehicle: "Falcon 9",
    date: new Date("2026-03-14T00:00:00Z"),
    status: "upcoming",
  },
  {
    id: "5",
    mission: "OneWeb #20",
    provider: "SpaceX",
    vehicle: "Falcon 9",
    date: new Date("2026-03-22T00:00:00Z"),
    status: "upcoming",
  },
];

export function UpcomingLaunches() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-semibold text-white">
          Upcoming Launches
        </CardTitle>
        <Link
          href="/launches"
          className="flex items-center gap-1 text-sm text-blue-400 transition-colors hover:text-blue-300"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="flex-1 px-6 pb-6">
        <div className="space-y-4">
          {MOCK_LAUNCHES.map((launch) => (
            <div
              key={launch.id}
              className="flex items-start gap-3 rounded-lg border border-gray-800 bg-gray-800/40 p-3 transition-colors hover:bg-gray-800/70"
            >
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-blue-500/10">
                <Rocket className="h-4 w-4 text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-white">
                    {launch.mission}
                  </p>
                  <Badge variant="default" className="flex-shrink-0 text-xs">
                    upcoming
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-gray-400">
                  {launch.provider} &middot; {launch.vehicle}
                </p>
                <p className="mt-1 text-xs font-medium text-blue-400">
                  {formatDistanceToNow(launch.date, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
