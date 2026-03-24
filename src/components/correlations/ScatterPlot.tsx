"use client";

import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

interface CorrelationPoint {
  avgKp: number;
  avgSleepQuality: number;
  date: string;
}

interface ScatterPlotProps {
  data: CorrelationPoint[] | null;
  regression?: { slope: number; intercept: number } | null;
}

export function ScatterPlot({ data, regression }: ScatterPlotProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-cosmic-300/40">
        Not enough data for scatter plot
      </div>
    );
  }

  // Build regression line points
  const regressionLine = regression
    ? [
        { kp: 0, quality: regression.intercept },
        { kp: 9, quality: regression.slope * 9 + regression.intercept },
      ]
    : [];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(124, 58, 237, 0.1)" />
        <XAxis
          dataKey="avgKp"
          type="number"
          domain={[0, 9]}
          name="Kp Index"
          tick={{ fill: "#a78bfa", fontSize: 10 }}
          tickLine={{ stroke: "#a78bfa40" }}
          label={{
            value: "Daily Avg Kp Index",
            position: "insideBottom",
            offset: -5,
            fill: "#a78bfa",
            fontSize: 11,
          }}
        />
        <YAxis
          dataKey="avgSleepQuality"
          type="number"
          domain={[0, 10]}
          name="Sleep Quality"
          tick={{ fill: "#a78bfa", fontSize: 10 }}
          tickLine={{ stroke: "#a78bfa40" }}
          label={{
            value: "Avg Sleep Quality",
            angle: -90,
            position: "insideLeft",
            fill: "#a78bfa",
            fontSize: 11,
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
            if (name === "avgKp") return [Number(value).toFixed(2), "Kp Index"];
            if (name === "avgSleepQuality") return [Number(value).toFixed(1), "Sleep Quality"];
            return [value, name];
          }}
        />
        {/* Regression line */}
        {regression && regressionLine.length === 2 && (
          <ReferenceLine
            segment={[
              { x: regressionLine[0].kp, y: regressionLine[0].quality },
              { x: regressionLine[1].kp, y: regressionLine[1].quality },
            ]}
            stroke="#f97316"
            strokeWidth={2}
            strokeDasharray="8 4"
          />
        )}
        <Scatter
          data={data}
          fill="#7c3aed"
          fillOpacity={0.6}
          strokeWidth={0}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
