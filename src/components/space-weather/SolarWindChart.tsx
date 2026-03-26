"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface SolarWindEntry {
  time_tag: string;
  v_r?: number | null;
  earth_particles_per_cm3?: number | null;
  b_r?: number | null;
}

interface SolarWindChartProps {
  data: SolarWindEntry[] | null;
}

export function SolarWindChart({ data }: SolarWindChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-cosmic-300/40">
        No solar wind data available
      </div>
    );
  }

  // Sort chronologically and downsample for chart performance
  const sorted = [...data].sort(
    (a, b) => new Date(a.time_tag).getTime() - new Date(b.time_tag).getTime()
  );
  const step = Math.max(1, Math.floor(sorted.length / 200));
  const chartData = sorted
    .filter((_, i) => i % step === 0)
    .map((entry) => ({
      time: new Date(entry.time_tag).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
      }),
      velocity: entry.v_r ?? null,
      density: entry.earth_particles_per_cm3 ?? null,
      bField: entry.b_r ?? null,
    }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(124, 58, 237, 0.1)" />
        <XAxis
          dataKey="time"
          tick={{ fill: "#a78bfa", fontSize: 10 }}
          tickLine={{ stroke: "#a78bfa40" }}
          interval="preserveStartEnd"
        />
        <YAxis
          yAxisId="velocity"
          orientation="left"
          tick={{ fill: "#8b5cf6", fontSize: 10 }}
          tickLine={{ stroke: "#8b5cf640" }}
          label={{
            value: "km/s",
            angle: -90,
            position: "insideLeft",
            fill: "#8b5cf6",
            fontSize: 10,
          }}
        />
        <YAxis
          yAxisId="density"
          orientation="right"
          tick={{ fill: "#22c55e", fontSize: 10 }}
          tickLine={{ stroke: "#22c55e40" }}
          label={{
            value: "p/cm³",
            angle: 90,
            position: "insideRight",
            fill: "#22c55e",
            fontSize: 10,
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#13112b",
            border: "1px solid rgba(124, 58, 237, 0.3)",
            borderRadius: "8px",
            fontSize: 12,
          }}
          labelStyle={{ color: "#c4b5fd" }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#a78bfa" }} />
        <Line
          yAxisId="velocity"
          type="monotone"
          dataKey="velocity"
          stroke="#8b5cf6"
          dot={false}
          strokeWidth={1.5}
          name="Velocity (km/s)"
          connectNulls
        />
        <Line
          yAxisId="density"
          type="monotone"
          dataKey="density"
          stroke="#22c55e"
          dot={false}
          strokeWidth={1.5}
          name="Density (p/cm³)"
          connectNulls
        />
        <Line
          yAxisId="velocity"
          type="monotone"
          dataKey="bField"
          stroke="#f97316"
          dot={false}
          strokeWidth={1.5}
          name="B-field (nT)"
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
