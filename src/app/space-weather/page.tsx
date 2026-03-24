"use client";

import dynamic from "next/dynamic";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { KpIndexGauge } from "@/components/space-weather/KpIndexGauge";
import { FlareProbs } from "@/components/space-weather/FlareProbs";
import { SolarWindChart } from "@/components/space-weather/SolarWindChart";
import { ForecastChart } from "@/components/space-weather/ForecastChart";
import { KpTrendChart } from "@/components/space-weather/KpTrendChart";
import { ChartWithInfo, MetricInfo } from "@/components/ui/MetricInfo";
import { useSpaceWeather } from "@/hooks/useSpaceWeather";
import { Skeleton } from "@/components/ui/Skeleton";

const AuroraHeatmap = dynamic(
  () =>
    import("@/components/space-weather/AuroraHeatmap").then(
      (mod) => mod.AuroraHeatmap
    ),
  { ssr: false, loading: () => <Skeleton className="h-80" /> }
);

export default function SpaceWeatherPage() {
  const { data, isLoading, error } = useSpaceWeather();

  const latestKp = data?.kp?.[0];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-cosmic-100">
            Space Weather
          </h1>
          <p className="mt-2 text-cosmic-300/70">
            Real-time data from NOAA Space Weather Prediction Center
          </p>
        </div>
        {error && <Badge variant="danger">API Error</Badge>}
        {isLoading && <Badge variant="info">Loading...</Badge>}
        {data && !error && <Badge variant="success">Live</Badge>}
      </div>

      {/* Aurora Heatmap */}
      <Card>
        <CardHeader
          title="Aurora Activity"
          subtitle="Global aurora intensity forecast"
        />
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="min-h-[320px] flex-1">
            <AuroraHeatmap data={data?.aurora ?? null} />
          </div>
          <div className="w-full shrink-0 lg:w-56">
            <MetricInfo
              items={[
                {
                  label: "Aurora Ovation",
                  description:
                    "NOAA's short-term forecast of aurora intensity. Based on real-time solar wind measurements at the L1 point, ~1 million miles from Earth.",
                },
                {
                  label: "Intensity Scale",
                  description:
                    "Colors range from low (dark) to high (bright). Higher values mean aurora is more likely visible at that latitude.",
                },
                {
                  label: "Why It Matters",
                  description:
                    "Aurora activity correlates with geomagnetic storms — periods when Earth's magnetic field is disturbed by solar wind, potentially affecting sleep patterns.",
                },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Kp Gauge + Flare Probs */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card glow>
          <CardHeader
            title="Kp Index"
            subtitle="Current geomagnetic disturbance"
          />
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <KpIndexGauge value={latestKp?.kpIndex ?? 0} />
              {latestKp && (
                <p className="mt-2 text-center text-xs text-cosmic-300/50">
                  Last updated: {new Date(latestKp.timeTag).toLocaleString()}
                </p>
              )}
            </div>
            <MetricInfo
              className="sm:w-44"
              items={[
                {
                  label: "Kp Index",
                  description:
                    "A global geomagnetic activity index from 0-9. Derived from ground-based magnetometer stations worldwide.",
                },
                {
                  label: "Scale",
                  description:
                    "0-1: Quiet. 2-3: Unsettled. 4: Active. 5: Minor storm (G1). 6-7: Strong storm (G2-G3). 8-9: Severe/Extreme (G4-G5).",
                },
                {
                  label: "Sleep Link",
                  description:
                    "Some research suggests geomagnetic storms may affect melatonin production and circadian rhythms.",
                },
              ]}
            />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Solar Flare Probabilities"
            subtitle="1-day, 2-day, 3-day outlook"
          />
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <FlareProbs data={data?.flareProb as Parameters<typeof FlareProbs>[0]["data"]} />
            </div>
            <MetricInfo
              className="sm:w-44"
              items={[
                {
                  label: "C-Class",
                  description:
                    "Small flares with few noticeable effects on Earth. Common during active solar periods.",
                },
                {
                  label: "M-Class",
                  description:
                    "Medium flares that can cause brief radio blackouts at the poles and minor radiation storms.",
                },
                {
                  label: "X-Class",
                  description:
                    "The most powerful flares. Can trigger planet-wide radio blackouts, radiation storms, and major geomagnetic storms.",
                },
              ]}
            />
          </div>
        </Card>
      </div>

      {/* Kp Trend */}
      <Card>
        <CardHeader title="Kp Index Trend" subtitle="Last 7 days (hourly)" />
        <ChartWithInfo
          chartHeight="h-64"
          info={[
            {
              label: "Hourly Averages",
              description:
                "Each point represents the average Kp value for that hour, downsampled from 1-minute NOAA readings.",
            },
            {
              label: "Storm Threshold",
              description:
                "The orange dashed line at Kp 5 marks the boundary for G1 (minor) geomagnetic storms. Values above this indicate active storm conditions.",
            },
            {
              label: "Typical Pattern",
              description:
                "The Kp index normally stays between 0-3. Spikes above 4-5 typically follow solar flares or coronal mass ejections arriving at Earth 1-3 days later.",
            },
          ]}
        >
          <KpTrendChart data={data?.kp ?? null} />
        </ChartWithInfo>
      </Card>

      {/* Solar Wind */}
      <Card>
        <CardHeader
          title="Solar Wind"
          subtitle="Velocity, density, and magnetic field"
        />
        <ChartWithInfo
          info={[
            {
              label: "Velocity (km/s)",
              description:
                "Speed of charged particles streaming from the Sun. Normal: 300-400 km/s. During storms, can exceed 700+ km/s. Faster wind = stronger geomagnetic impact.",
            },
            {
              label: "Density (p/cm\u00B3)",
              description:
                "Number of protons per cubic centimeter in the solar wind. Higher density means more particles hitting Earth's magnetosphere.",
            },
            {
              label: "B-field (nT)",
              description:
                "The interplanetary magnetic field strength in nanoTesla. When the Bz component turns southward (negative), it connects with Earth's field and drives geomagnetic storms.",
            },
          ]}
        >
          <SolarWindChart data={data?.enlil as Parameters<typeof SolarWindChart>[0]["data"]} />
        </ChartWithInfo>
      </Card>

      {/* 45-Day Forecast */}
      <Card>
        <CardHeader
          title="45-Day Forecast"
          subtitle="Ap index and F10.7 solar flux predictions"
        />
        <ChartWithInfo
          chartHeight="h-64"
          info={[
            {
              label: "Ap Index",
              description:
                "A daily average of geomagnetic activity (linearized from Kp). Ranges from 0-400. Values above 20 indicate unsettled conditions; above 50 is a storm.",
            },
            {
              label: "F10.7 Solar Flux",
              description:
                "Solar radio emission at 10.7 cm wavelength, measured in solar flux units (sfu). A proxy for overall solar activity. Higher values = more active Sun.",
            },
            {
              label: "Forecast Source",
              description:
                "NOAA's 45-day predictions based on solar rotation patterns and current active regions. Useful for anticipating geomagnetic conditions weeks ahead.",
            },
          ]}
        >
          <ForecastChart data={data?.forecast ?? null} />
        </ChartWithInfo>
      </Card>
    </div>
  );
}
