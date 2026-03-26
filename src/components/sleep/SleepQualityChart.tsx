"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { DailyAverage } from "@/hooks/useSleepData";

interface SleepQualityChartProps {
  data: DailyAverage[] | null;
}

export function SleepQualityChart({ data }: SleepQualityChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-cosmic-300/40">
        No sleep data yet. Be the first to report!
      </div>
    );
  }

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const chartData = [...data]
    .filter((entry) => entry.date <= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((entry) => ({
      date: new Date(entry.date + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      quality: Math.round(entry.avgQuality * 10) / 10,
      hours: Math.round(entry.avgHours * 10) / 10,
      reports: entry.count,
    }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <defs>
          <linearGradient id="qualityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(124, 58, 237, 0.1)" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#a78bfa", fontSize: 10 }}
          tickLine={{ stroke: "#a78bfa40" }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, 10]}
          tick={{ fill: "#a78bfa", fontSize: 10 }}
          tickLine={{ stroke: "#a78bfa40" }}
          label={{
            value: "Quality",
            angle: -90,
            position: "insideLeft",
            fill: "#a78bfa",
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any, name: any) => {
            if (name === "quality") return [`${value}/10`, "Avg Quality"];
            return [value, name];
          }}
        />
        <Area
          type="monotone"
          dataKey="quality"
          stroke="#a78bfa"
          fill="url(#qualityGradient)"
          strokeWidth={2}
          dot={{ fill: "#a78bfa", r: 3 }}
          name="quality"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
