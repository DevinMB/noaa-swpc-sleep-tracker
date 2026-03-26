"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { SleepReportForm } from "@/components/sleep/SleepReportForm";
import { SleepQualityChart } from "@/components/sleep/SleepQualityChart";
import { SleepDistribution } from "@/components/sleep/SleepDistribution";
import { useSleepData } from "@/hooks/useSleepData";
import { Badge } from "@/components/ui/Badge";

export default function SleepPage() {
  const { data, isLoading, refresh } = useSleepData(90);

  const totalReports = data?.logs?.length ?? 0;
  const selfReports = data?.logs?.filter((l) => l.source === "self_report").length ?? 0;
  const avgQuality =
    data?.dailyAverages && data.dailyAverages.length > 0
      ? (
          data.dailyAverages.reduce((sum, d) => sum + d.avgQuality, 0) /
          data.dailyAverages.length
        ).toFixed(1)
      : "--";
  const avgHours =
    data?.dailyAverages && data.dailyAverages.length > 0
      ? (
          data.dailyAverages.reduce((sum, d) => sum + d.avgHours, 0) /
          data.dailyAverages.length
        ).toFixed(1)
      : "--";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-cosmic-100">
          Sleep Data
        </h1>
        <p className="mt-2 text-cosmic-300/70">
          Community sleep reports and research baselines
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Report Form */}
        <Card glow className="lg:col-span-1">
          <CardHeader
            title="Report Your Sleep"
            subtitle="One report per day, no account needed"
          />
          <SleepReportForm onSuccess={() => refresh()} />
        </Card>

        {/* Quality Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Sleep Quality Over Time"
            subtitle="Daily community averages"
            action={isLoading ? <Badge variant="info">Loading</Badge> : undefined}
          />
          <div className="h-64">
            <SleepQualityChart data={data?.logs ?? null} />
          </div>
        </Card>

        {/* Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Sleep Hours Distribution"
            subtitle="Community reports by period"
          />
          <div className="h-64">
            <SleepDistribution data={data?.logs ?? null} />
          </div>
        </Card>

        {/* Stats Summary */}
        <Card>
          <CardHeader title="Stats" subtitle="Summary" />
          <div className="space-y-4">
            <div>
              <p className="text-xs text-cosmic-300/50">Total Reports</p>
              <p className="font-mono text-2xl font-bold text-cosmic-200">
                {totalReports}
              </p>
              <p className="text-xs text-cosmic-300/40">
                {selfReports} self-reported
              </p>
            </div>
            <div>
              <p className="text-xs text-cosmic-300/50">Avg Quality</p>
              <p className="font-mono text-2xl font-bold text-cosmic-200">
                {avgQuality}<span className="text-sm text-cosmic-300/50">/10</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-cosmic-300/50">Avg Hours</p>
              <p className="font-mono text-2xl font-bold text-cosmic-200">
                {avgHours}<span className="text-sm text-cosmic-300/50">h</span>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
