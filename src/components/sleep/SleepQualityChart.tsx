"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { SleepLog } from "@/hooks/useSleepData";
import { getLocalDate, toLocalDateStr } from "@/lib/utils/localDate";

interface SleepQualityChartProps {
  data: SleepLog[] | null;
}

export function SleepQualityChart({ data }: SleepQualityChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const today = toLocalDateStr(new Date());

    // Bucket by local date
    const buckets = new Map<
      string,
      { totalQuality: number; totalHours: number; count: number }
    >();

    for (const log of data) {
      const localDate = getLocalDate(log);
      if (localDate > today) continue;

      const bucket = buckets.get(localDate) ?? {
        totalQuality: 0,
        totalHours: 0,
        count: 0,
      };
      bucket.totalQuality += log.sleepQuality;
      bucket.totalHours += log.sleepHours;
      bucket.count += 1;
      buckets.set(localDate, bucket);
    }

    return Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, bucket]) => ({
        date: new Date(date + "T00:00:00").toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        quality: Math.round((bucket.totalQuality / bucket.count) * 10) / 10,
        hours: Math.round((bucket.totalHours / bucket.count) * 10) / 10,
        reports: bucket.count,
      }));
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-cosmic-300/40">
        No sleep data yet. Be the first to report!
      </div>
    );
  }

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
