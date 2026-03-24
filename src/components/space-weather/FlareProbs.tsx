"use client";

interface FlareProbsProps {
  data: {
    c_class_1_day?: number;
    c_class_2_day?: number;
    c_class_3_day?: number;
    m_class_1_day?: number;
    m_class_2_day?: number;
    m_class_3_day?: number;
    x_class_1_day?: number;
    x_class_2_day?: number;
    x_class_3_day?: number;
  }[] | null;
}

interface FlareBarProps {
  label: string;
  values: (number | undefined)[];
  color: string;
  glowColor: string;
}

function FlareBar({ label, values, color, glowColor }: FlareBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-semibold text-cosmic-200">
          {label}
        </span>
      </div>
      <div className="space-y-1.5">
        {["1-Day", "2-Day", "3-Day"].map((period, i) => {
          const value = values[i] ?? 0;
          return (
            <div key={period} className="flex items-center gap-2">
              <span className="w-10 text-right font-mono text-xs text-cosmic-300/60">
                {period}
              </span>
              <div className="flex-1 overflow-hidden rounded-full bg-cosmic-900/50 h-3">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.min(value, 100)}%`,
                    backgroundColor: color,
                    boxShadow: `0 0 8px ${glowColor}`,
                  }}
                />
              </div>
              <span className="w-10 font-mono text-xs text-cosmic-300">
                {value}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FlareProbs({ data }: FlareProbsProps) {
  const latest = data?.[data.length - 1];

  if (!latest) {
    return (
      <div className="flex h-full items-center justify-center text-cosmic-300/40">
        No flare data available
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <FlareBar
        label="C-Class"
        values={[latest.c_class_1_day, latest.c_class_2_day, latest.c_class_3_day]}
        color="#22c55e"
        glowColor="#22c55e60"
      />
      <FlareBar
        label="M-Class"
        values={[latest.m_class_1_day, latest.m_class_2_day, latest.m_class_3_day]}
        color="#f97316"
        glowColor="#f9731660"
      />
      <FlareBar
        label="X-Class"
        values={[latest.x_class_1_day, latest.x_class_2_day, latest.x_class_3_day]}
        color="#ef4444"
        glowColor="#ef444460"
      />
    </div>
  );
}
