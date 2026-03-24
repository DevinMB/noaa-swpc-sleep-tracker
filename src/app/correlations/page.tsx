"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScatterPlot } from "@/components/correlations/ScatterPlot";
import { OverlaidTimeSeries } from "@/components/correlations/OverlaidTimeSeries";
import { StatsSummary } from "@/components/correlations/StatsSummary";
import { useCorrelation } from "@/hooks/useCorrelation";

export default function CorrelationsPage() {
  const { data, isLoading, error } = useCorrelation();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-cosmic-100">
            Correlations
          </h1>
          <p className="mt-2 text-cosmic-300/70">
            Analyzing relationships between space weather and sleep quality
          </p>
        </div>
        {isLoading && <Badge variant="info">Computing...</Badge>}
        {error && <Badge variant="danger">Error</Badge>}
        {data && !error && (
          <Badge variant="success">{data.points.length} data points</Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Scatter Plot */}
        <Card glow>
          <CardHeader
            title="Kp Index vs Sleep Quality"
            subtitle="Each point = one day's averages"
          />
          <div className="h-72">
            <ScatterPlot
              data={data?.points ?? null}
              regression={data?.regression ?? null}
            />
          </div>
          {data?.regression && (
            <p className="mt-2 text-xs text-cosmic-300/40">
              Orange dashed line: y = {data.regression.slope}x +{" "}
              {data.regression.intercept} (R&sup2; = {data.regression.rSquared})
            </p>
          )}
        </Card>

        {/* Overlaid Time Series */}
        <Card>
          <CardHeader
            title="Kp Index & Sleep Quality Over Time"
            subtitle="Red = geomagnetic activity, Purple = sleep quality"
          />
          <div className="h-72">
            <OverlaidTimeSeries data={data?.points ?? null} />
          </div>
        </Card>
      </div>

      {/* Stats Summary - full width so it doesn't force other cards to stretch */}
      <Card>
        <CardHeader
          title="Statistical Summary"
          subtitle="Pearson correlation analysis"
        />
        <StatsSummary
          kpVsQuality={data?.kpVsQuality ?? null}
          kpVsHours={data?.kpVsHours ?? null}
          regression={data?.regression ?? null}
          stormImpact={data?.stormImpact ?? null}
        />
      </Card>
    </div>
  );
}
