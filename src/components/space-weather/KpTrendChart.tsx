"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

interface KpRecord {
  timeTag: string;
  kpIndex: number;
}

interface KpTrendChartProps {
  data: KpRecord[] | null;
}

export function KpTrendChart({ data }: KpTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-cosmic-300/40">
        No Kp data available
      </div>
    );
  }

  // Sort chronologically and format for chart
  const chartData = [...data]
    .sort((a, b) => a.timeTag.localeCompare(b.timeTag))
    .map((entry) => ({
      time: new Date(entry.timeTag).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
      }),
      kp: entry.kpIndex,
    }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <defs>
          <linearGradient id="kpGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(124, 58, 237, 0.1)" />
        <XAxis
          dataKey="time"
          tick={{ fill: "#a78bfa", fontSize: 10 }}
          tickLine={{ stroke: "#a78bfa40" }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, 9]}
          tick={{ fill: "#a78bfa", fontSize: 10 }}
          tickLine={{ stroke: "#a78bfa40" }}
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
        {/* Storm threshold line */}
        <ReferenceLine
          y={5}
          stroke="#f9731660"
          strokeDasharray="5 5"
          label={{
            value: "Storm",
            position: "right",
            fill: "#f9731680",
            fontSize: 10,
          }}
        />
        <Area
          type="monotone"
          dataKey="kp"
          stroke="#7c3aed"
          fill="url(#kpGradient)"
          strokeWidth={2}
          dot={false}
          name="Kp Index"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
