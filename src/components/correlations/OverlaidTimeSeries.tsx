"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface CorrelationPoint {
  date: string;
  avgKp: number;
  avgSleepQuality: number;
}

interface OverlaidTimeSeriesProps {
  data: CorrelationPoint[] | null;
}

export function OverlaidTimeSeries({ data }: OverlaidTimeSeriesProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-cosmic-300/40">
        Not enough data for time series
      </div>
    );
  }

  const chartData = data.map((point) => ({
    date: new Date(point.date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    kp: point.avgKp,
    quality: point.avgSleepQuality,
    isStorm: point.avgKp >= 4,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <defs>
          <linearGradient id="kpAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
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
          yAxisId="kp"
          orientation="left"
          domain={[0, 9]}
          tick={{ fill: "#ef4444", fontSize: 10 }}
          tickLine={{ stroke: "#ef444440" }}
          label={{
            value: "Kp Index",
            angle: -90,
            position: "insideLeft",
            fill: "#ef4444",
            fontSize: 10,
          }}
        />
        <YAxis
          yAxisId="quality"
          orientation="right"
          domain={[0, 10]}
          tick={{ fill: "#a78bfa", fontSize: 10 }}
          tickLine={{ stroke: "#a78bfa40" }}
          label={{
            value: "Sleep Quality",
            angle: 90,
            position: "insideRight",
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
        <Legend wrapperStyle={{ fontSize: 12, color: "#a78bfa" }} />
        {/* Kp area (highlights storm periods) */}
        <Area
          yAxisId="kp"
          type="monotone"
          dataKey="kp"
          stroke="#ef4444"
          fill="url(#kpAreaGradient)"
          strokeWidth={1.5}
          dot={false}
          name="Kp Index"
        />
        {/* Sleep quality line */}
        <Line
          yAxisId="quality"
          type="monotone"
          dataKey="quality"
          stroke="#a78bfa"
          strokeWidth={2}
          dot={false}
          name="Sleep Quality"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
