"use client";

import { useState, useMemo } from "react";
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
import { getLocalDate, toLocalDateStr } from "@/lib/utils/localDate";

type GroupMode = "day" | "week" | "month";

interface SleepDistributionProps {
  data: SleepLog[] | null;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateLabel(date: Date, mode: GroupMode): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  if (mode === "day") {
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }
  if (mode === "week") {
    const end = new Date(date);
    end.setDate(end.getDate() + 6);
    const sameMonth = date.getMonth() === end.getMonth();
    if (sameMonth) {
      return `${months[date.getMonth()]} ${date.getDate()}\u2013${end.getDate()}, ${date.getFullYear()}`;
    }
    return `${months[date.getMonth()]} ${date.getDate()} \u2013 ${months[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
  }
  // month
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function shiftDate(date: Date, mode: GroupMode, direction: number): Date {
  const d = new Date(date);
  if (mode === "day") d.setDate(d.getDate() + direction);
  else if (mode === "week") d.setDate(d.getDate() + direction * 7);
  else d.setMonth(d.getMonth() + direction);
  return d;
}

function getDateRange(
  anchor: Date,
  mode: GroupMode
): { start: string; end: string } {
  if (mode === "day") {
    const s = toLocalDateStr(anchor);
    return { start: s, end: s };
  }
  if (mode === "week") {
    const weekStart = startOfWeek(anchor);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return {
      start: toLocalDateStr(weekStart),
      end: toLocalDateStr(weekEnd),
    };
  }
  // month
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  return {
    start: toLocalDateStr(first),
    end: toLocalDateStr(last),
  };
}

function getDisplayAnchor(anchor: Date, mode: GroupMode): Date {
  if (mode === "week") return startOfWeek(anchor);
  if (mode === "month") return new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  return anchor;
}

export function SleepDistribution({ data }: SleepDistributionProps) {
  const [mode, setMode] = useState<GroupMode>("day");
  const [anchor, setAnchor] = useState(() => new Date());

  const displayAnchor = getDisplayAnchor(anchor, mode);
  const isFuture = displayAnchor > new Date();

  const filteredData = useMemo(() => {
    if (!data) return [];
    const { start, end } = getDateRange(displayAnchor, mode);
    return data.filter((log) => {
      const localDate = getLocalDate(log);
      return localDate >= start && localDate <= end;
    });
  }, [data, displayAnchor, mode]);

  const chartData = useMemo(() => {
    const buckets = new Map<string, number>();
    for (let h = 0; h <= 18; h++) {
      buckets.set(`${h}`, 0);
    }
    for (const log of filteredData) {
      const bucket = `${Math.round(log.sleepHours)}`;
      buckets.set(bucket, (buckets.get(bucket) || 0) + 1);
    }
    return Array.from(buckets.entries())
      .map(([hours, count]) => ({ hours: `${hours}h`, count }))
      .filter((d) => {
        const h = parseInt(d.hours);
        return h >= 0 && h <= 18;
      });
  }, [filteredData]);

  const navigate = (direction: number) => {
    setAnchor((prev) => shiftDate(prev, mode, direction));
  };

  const goToToday = () => setAnchor(new Date());

  return (
    <div className="flex h-full flex-col">
      {/* Controls */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Group mode toggle */}
        <div className="flex self-start rounded-lg border border-cosmic-800/30 bg-surface-dark/50 p-0.5">
          {(["day", "week", "month"] as GroupMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${
                mode === m
                  ? "bg-cosmic-500/20 text-cosmic-200"
                  : "text-cosmic-300/50 hover:text-cosmic-300"
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        {/* Date navigation */}
        <div className="flex items-center gap-1 self-end">
          <button
            onClick={() => navigate(-1)}
            className="rounded-md p-1 text-cosmic-300/60 transition-colors hover:bg-cosmic-500/10 hover:text-cosmic-200"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 12L6 8L10 4" />
            </svg>
          </button>

          <button
            onClick={goToToday}
            className="shrink-0 rounded-md px-1.5 py-1 text-center text-xs font-medium text-cosmic-300 transition-colors hover:bg-cosmic-500/10 hover:text-cosmic-200"
          >
            {formatDateLabel(displayAnchor, mode)}
          </button>

          <button
            onClick={() => navigate(1)}
            disabled={isFuture}
            className="rounded-md p-1 text-cosmic-300/60 transition-colors hover:bg-cosmic-500/10 hover:text-cosmic-200 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 4L10 8L6 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1">
        {filteredData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-cosmic-300/40">
            No reports for this {mode}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 10, bottom: 5, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(124, 58, 237, 0.1)"
              />
              <XAxis
                dataKey="hours"
                tick={{ fill: "#a78bfa", fontSize: 10 }}
                tickLine={{ stroke: "#a78bfa40" }}
              />
              <YAxis
                tick={{ fill: "#a78bfa", fontSize: 10 }}
                tickLine={{ stroke: "#a78bfa40" }}
                allowDecimals={false}
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
        )}
      </div>

      {/* Report count */}
      {filteredData.length > 0 && (
        <p className="mt-1 text-center text-xs text-cosmic-300/40">
          {filteredData.length} report{filteredData.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
