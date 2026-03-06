"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface MonthlyLaunchData {
  month: string;
  launches: number;
}

const MONTHLY_DATA: MonthlyLaunchData[] = [
  { month: "Jan", launches: 8 },
  { month: "Feb", launches: 10 },
  { month: "Mar", launches: 12 },
  { month: "Apr", launches: 9 },
  { month: "May", launches: 11 },
  { month: "Jun", launches: 14 },
  { month: "Jul", launches: 12 },
  { month: "Aug", launches: 15 },
  { month: "Sep", launches: 13 },
  { month: "Oct", launches: 16 },
  { month: "Nov", launches: 11 },
  { month: "Dec", launches: 18 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 shadow-xl">
        <p className="text-xs font-medium text-gray-400">{label} 2025</p>
        <p className="mt-0.5 text-sm font-bold text-white">
          {payload[0].value}{" "}
          <span className="font-normal text-gray-400">launches</span>
        </p>
      </div>
    );
  }
  return null;
}

export function LaunchChart() {
  const total = MONTHLY_DATA.reduce((sum, d) => sum + d.launches, 0);
  const avg = (total / MONTHLY_DATA.length).toFixed(1);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-white">
              Global Launch Cadence
            </CardTitle>
            <p className="mt-1 text-xs text-gray-500">
              Monthly launches &mdash; 2025
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{total}</p>
            <p className="text-xs text-gray-500">total &middot; {avg}/mo avg</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 px-6 pb-6">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={MONTHLY_DATA}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            barCategoryGap="30%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(59, 130, 246, 0.06)" }}
            />
            <Bar
              dataKey="launches"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
