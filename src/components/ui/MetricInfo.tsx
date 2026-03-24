import { ReactNode } from "react";

interface MetricInfoProps {
  items: { label: string; description: string }[];
  className?: string;
}

export function MetricInfo({ items, className = "" }: MetricInfoProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item) => (
        <div key={item.label}>
          <dt className="font-display text-xs font-semibold uppercase tracking-wider text-cosmic-300/70">
            {item.label}
          </dt>
          <dd className="mt-0.5 text-xs leading-relaxed text-cosmic-300/50">
            {item.description}
          </dd>
        </div>
      ))}
    </div>
  );
}

interface ChartWithInfoProps {
  children: ReactNode;
  info: { label: string; description: string }[];
  chartHeight?: string;
}

/**
 * Layout wrapper: chart on the left, metric descriptions on the right.
 * Stacks vertically on mobile.
 */
export function ChartWithInfo({
  children,
  info,
  chartHeight = "h-72",
}: ChartWithInfoProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className={`flex-1 ${chartHeight}`}>{children}</div>
      <div className="w-full shrink-0 lg:w-56">
        <MetricInfo items={info} />
      </div>
    </div>
  );
}
