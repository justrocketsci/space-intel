import { Rocket, Building2, FileSignature, DollarSign } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { UpcomingLaunches } from "@/components/dashboard/upcoming-launches";
import { RecentContracts } from "@/components/dashboard/recent-contracts";
import { RecentFilings } from "@/components/dashboard/recent-filings";
import { LaunchChart } from "@/components/dashboard/launch-chart";

export default function CommandCenterPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
          <Rocket className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-white text-xl font-semibold tracking-tight">
            Command Center
          </h1>
          <p className="text-gray-400 text-sm">
            Your unified view of the space economy
          </p>
        </div>
      </div>

      {/* Key metrics row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Tracked Companies"
          value="30"
          change="+5 this month"
          changeType="positive"
          icon={<Building2 className="h-6 w-6" />}
          description="Space companies in database"
        />
        <MetricCard
          title="Total Launches (2025)"
          value="149"
          change="+12% vs 2024"
          changeType="positive"
          icon={<Rocket className="h-6 w-6" />}
          description="Global orbital launch attempts"
        />
        <MetricCard
          title="Active Contracts"
          value="$7.1B"
          change="+$1.2B this quarter"
          changeType="positive"
          icon={<FileSignature className="h-6 w-6" />}
          description="Tracked government awards"
        />
        <MetricCard
          title="Funding Raised"
          value="$4.8B"
          change="-8% vs 2024"
          changeType="negative"
          icon={<DollarSign className="h-6 w-6" />}
          description="Private space funding YTD"
        />
      </div>

      {/* Charts and lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LaunchChart />
        <UpcomingLaunches />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentContracts />
        <RecentFilings />
      </div>
    </div>
  );
}
