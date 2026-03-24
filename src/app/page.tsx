"use client";

import dynamic from "next/dynamic";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { KpIndexGauge } from "@/components/space-weather/KpIndexGauge";
import { KpTrendChart } from "@/components/space-weather/KpTrendChart";
import { useSpaceWeather } from "@/hooks/useSpaceWeather";
import { useSleepData } from "@/hooks/useSleepData";
import { useCorrelation } from "@/hooks/useCorrelation";
import { Skeleton } from "@/components/ui/Skeleton";
import { AnimatedSection, StaggeredGrid, StaggeredItem } from "@/components/ui/AnimatedSection";
import { CountUp } from "@/components/ui/CountUp";
import Link from "next/link";

const AuroraHeatmap = dynamic(
  () =>
    import("@/components/space-weather/AuroraHeatmap").then(
      (mod) => mod.AuroraHeatmap
    ),
  { ssr: false, loading: () => <Skeleton className="h-64" /> }
);

export default function DashboardPage() {
  const { data, isLoading } = useSpaceWeather();
  const { data: sleepData } = useSleepData(30);
  const { data: correlationData } = useCorrelation();

  const latestKp = data?.kp?.[0];
  const latestEnlil = data?.enlil as { v_r?: number | null }[] | null;
  const latestVelocity = latestEnlil?.[latestEnlil.length - 1]?.v_r;

  const today = new Date().toISOString().slice(0, 10);
  const todayReports = sleepData?.dailyAverages?.find((d) => d.date === today);
  const totalReports = sleepData?.logs?.length ?? 0;
  const correlationR = correlationData?.kpVsQuality?.r;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <AnimatedSection>
        <div className="text-center">
          <h1 className="glow-text font-display text-4xl font-bold tracking-tight text-cosmic-100 sm:text-5xl">
            Space Weather & Sleep
          </h1>
          <p className="mt-3 text-lg text-cosmic-300/70">
            Exploring the connection between geomagnetic activity and human sleep
            patterns
          </p>
          {isLoading && (
            <div className="mt-3">
              <Badge variant="info">Connecting to NOAA...</Badge>
            </div>
          )}
        </div>
      </AnimatedSection>

      {/* Quick Stats */}
      <StaggeredGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggeredItem>
          <Card glow>
            <CardHeader title="Kp Index" subtitle="Geomagnetic activity" />
            <div className="font-mono text-3xl font-bold text-cosmic-200">
              {latestKp ? (
                <CountUp end={latestKp.kpIndex} decimals={1} />
              ) : (
                "--"
              )}
            </div>
            {latestKp && (
              <Badge
                variant={
                  latestKp.kpIndex >= 5
                    ? "danger"
                    : latestKp.kpIndex >= 4
                      ? "warning"
                      : "success"
                }
              >
                {latestKp.kpIndex >= 5
                  ? "Storm"
                  : latestKp.kpIndex >= 4
                    ? "Active"
                    : "Quiet"}
              </Badge>
            )}
          </Card>
        </StaggeredItem>

        <StaggeredItem>
          <Card>
            <CardHeader title="Solar Wind" subtitle="Velocity (km/s)" />
            <div className="font-mono text-3xl font-bold text-cosmic-200">
              {latestVelocity ? (
                <CountUp end={Math.round(latestVelocity)} />
              ) : (
                "--"
              )}
            </div>
            <Badge variant="info">
              {latestVelocity ? "Live" : "Loading"}
            </Badge>
          </Card>
        </StaggeredItem>

        <StaggeredItem>
          <Card>
            <CardHeader
              title="Sleep Reports"
              subtitle={todayReports ? `${todayReports.count} today` : "Community"}
            />
            <div className="font-mono text-3xl font-bold text-cosmic-200">
              {totalReports > 0 ? (
                <CountUp end={totalReports} />
              ) : (
                "--"
              )}
            </div>
            <Link href="/sleep">
              <Badge variant="info">Report yours</Badge>
            </Link>
          </Card>
        </StaggeredItem>

        <StaggeredItem>
          <Card>
            <CardHeader title="Correlation" subtitle="Kp vs Sleep Quality" />
            <div className="font-mono text-3xl font-bold text-cosmic-200">
              {correlationR !== undefined ? (
                <>
                  <CountUp
                    end={correlationR}
                    decimals={3}
                    prefix="r = "
                  />
                </>
              ) : (
                "--"
              )}
            </div>
            <Link href="/correlations">
              <Badge
                variant={
                  correlationR !== undefined
                    ? Math.abs(correlationR) > 0.3
                      ? "warning"
                      : "info"
                    : "info"
                }
              >
                {correlationR !== undefined
                  ? Math.abs(correlationR) > 0.3
                    ? "Notable"
                    : "View analysis"
                  : "View analysis"}
              </Badge>
            </Link>
          </Card>
        </StaggeredItem>
      </StaggeredGrid>

      {/* Sleep CTA Banner */}
      <AnimatedSection delay={0.25}>
        <Link href="/sleep">
          <div className="group relative overflow-hidden rounded-2xl border border-cosmic-500/30 bg-gradient-to-r from-cosmic-900/60 via-cosmic-800/40 to-cosmic-900/60 p-6 transition-all hover:border-cosmic-500/50 hover:shadow-[0_0_30px_rgba(124,58,237,0.2)]">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cosmic-500/20 text-2xl">
                  &#127769;
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-cosmic-100">
                    How did you sleep last night?
                  </h2>
                  <p className="text-sm text-cosmic-300/60">
                    Help us map the connection between space weather and sleep.
                    One quick report per day, no account needed.
                  </p>
                </div>
              </div>
              <div className="shrink-0 rounded-lg bg-cosmic-500 px-5 py-2.5 font-display text-sm font-semibold text-white transition-colors group-hover:bg-cosmic-400">
                Report Sleep &rarr;
              </div>
            </div>
          </div>
        </Link>
      </AnimatedSection>

      {/* Aurora Map */}
      <AnimatedSection delay={0.4}>
        <Card>
          <CardHeader
            title="Aurora Activity"
            subtitle="Global aurora intensity forecast"
            action={
              <Link
                href="/space-weather"
                className="text-sm text-cosmic-400 hover:text-cosmic-300 transition-colors"
              >
                View all &rarr;
              </Link>
            }
          />
          <div className="min-h-[280px]">
            <AuroraHeatmap data={data?.aurora ?? null} />
          </div>
        </Card>
      </AnimatedSection>

      {/* Charts */}
      <AnimatedSection delay={0.6}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Kp Index" subtitle="Last 7 days" />
            <div className="h-48">
              <KpTrendChart data={data?.kp ?? null} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Kp Gauge" subtitle="Current level" />
            <KpIndexGauge value={latestKp?.kpIndex ?? 0} />
          </Card>
        </div>
      </AnimatedSection>
    </div>
  );
}
