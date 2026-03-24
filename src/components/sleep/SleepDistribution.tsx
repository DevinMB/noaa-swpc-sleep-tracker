"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { SleepLog } from "@/hooks/useSleepData";

interface SleepDistributionProps {
  data: SleepLog[] | null;
}

export function SleepDistribution({ data }: SleepDistributionProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-cosmic-300/40">
        No sleep data yet
      </div>
    );
  }

  // Build histogram: bucket by half-hour increments
  const buckets = new Map<string, number>();
  for (let h = 0; h <= 18; h++) {
    buckets.set(`${h}`, 0);
  }

  for (const log of data) {
    const bucket = `${Math.round(log.sleepHours)}`;
    buckets.set(bucket, (buckets.get(bucket) || 0) + 1);
  }

  const chartData = Array.from(buckets.entries())
    .map(([hours, count]) => ({ hours: `${hours}h`, count }))
    .filter((d) => {
      const h = parseInt(d.hours);
      return h >= 0 && h <= 18;
    });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(124, 58, 237, 0.1)" />
        <XAxis
          dataKey="hours"
          tick={{ fill: "#a78bfa", fontSize: 10 }}
          tickLine={{ stroke: "#a78bfa40" }}
        />
        <YAxis
          tick={{ fill: "#a78bfa", fontSize: 10 }}
          tickLine={{ stroke: "#a78bfa40" }}
          label={{
            value: "Reports",
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
        />
        <Bar
          dataKey="count"
          fill="#7c3aed"
          radius={[4, 4, 0, 0]}
          name="Reports"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
