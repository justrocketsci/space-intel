import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  description?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  description,
}: MetricCardProps) {
  const changeColors = {
    positive: "text-green-400",
    negative: "text-red-400",
    neutral: "text-gray-400",
  };

  const ChangeIcon = {
    positive: TrendingUp,
    negative: TrendingDown,
    neutral: Minus,
  }[changeType];

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white">
              {value}
            </p>
            {change && (
              <div
                className={cn(
                  "mt-2 flex items-center gap-1 text-sm font-medium",
                  changeColors[changeType]
                )}
              >
                <ChangeIcon className="h-3.5 w-3.5" />
                <span>{change}</span>
              </div>
            )}
            {description && (
              <p className="mt-1 text-xs text-gray-500">{description}</p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            {icon}
          </div>
        </div>
        {/* Subtle accent line at the bottom */}
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-500/40 via-blue-500/20 to-transparent" />
      </CardContent>
    </Card>
  );
}
