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

interface ForecastRecord {
  timeTag: string;
  metric: string;
  value: number;
}

interface ForecastChartProps {
  data: ForecastRecord[] | null;
}

export function ForecastChart({ data }: ForecastChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-cosmic-300/40">
        No forecast data available
      </div>
    );
  }

  // Pivot data: group by date, create { date, ap, f107 } records
  const dateMap = new Map<string, { date: string; ap?: number; f107?: number }>();

  for (const entry of data) {
    const date = entry.timeTag.slice(0, 10);
    const existing = dateMap.get(date) || { date };
    if (entry.metric === "ap") existing.ap = entry.value;
    if (entry.metric === "f107") existing.f107 = entry.value;
    dateMap.set(date, existing);
  }

  const chartData = Array.from(dateMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(124, 58, 237, 0.1)" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#a78bfa", fontSize: 10 }}
          tickLine={{ stroke: "#a78bfa40" }}
          tickFormatter={(val: string) => {
            const d = new Date(val + "T00:00:00");
            return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          }}
          interval="preserveStartEnd"
        />
        <YAxis
          yAxisId="ap"
          orientation="left"
          tick={{ fill: "#8b5cf6", fontSize: 10 }}
          tickLine={{ stroke: "#8b5cf640" }}
          label={{
            value: "Ap Index",
            angle: -90,
            position: "insideLeft",
            fill: "#8b5cf6",
            fontSize: 10,
          }}
        />
        <YAxis
          yAxisId="f107"
          orientation="right"
          tick={{ fill: "#f97316", fontSize: 10 }}
          tickLine={{ stroke: "#f9731640" }}
          label={{
            value: "F10.7 (sfu)",
            angle: 90,
            position: "insideRight",
            fill: "#f97316",
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
          yAxisId="ap"
          type="monotone"
          dataKey="ap"
          stroke="#8b5cf6"
          dot={false}
          strokeWidth={2}
          name="Ap Index"
          connectNulls
        />
        <Line
          yAxisId="f107"
          type="monotone"
          dataKey="f107"
          stroke="#f97316"
          dot={false}
          strokeWidth={2}
          name="F10.7 Flux"
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
