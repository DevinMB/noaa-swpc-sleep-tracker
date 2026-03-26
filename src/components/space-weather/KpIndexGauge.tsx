"use client";

interface KpIndexGaugeProps {
  value: number;
  label?: string;
}

function getKpColor(kp: number): string {
  if (kp <= 1) return "#22c55e"; // green
  if (kp <= 3) return "#84cc16"; // lime
  if (kp <= 4) return "#eab308"; // yellow
  if (kp <= 5) return "#f97316"; // orange
  if (kp <= 7) return "#ef4444"; // red
  return "#dc2626"; // dark red
}

function getKpLabel(kp: number): string {
  if (kp <= 1) return "Quiet";
  if (kp <= 3) return "Unsettled";
  if (kp <= 4) return "Active";
  if (kp <= 5) return "Minor Storm";
  if (kp <= 7) return "Strong Storm";
  if (kp <= 8) return "Severe Storm";
  return "Extreme Storm";
}

export function KpIndexGauge({ value, label }: KpIndexGaugeProps) {
  const clampedValue = Math.max(0, Math.min(9, value));
  const angle = (clampedValue / 9) * 180;
  const color = getKpColor(clampedValue);
  const stormLabel = label || getKpLabel(clampedValue);

  // SVG arc calculation
  const cx = 100;
  const cy = 100;
  const r = 80;
  const startAngle = Math.PI;
  const endAngle = Math.PI + (angle * Math.PI) / 180;

  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = angle > 180 ? 1 : 0;

  // Needle position
  const needleAngle = Math.PI + (angle * Math.PI) / 180;
  const needleX = cx + (r - 10) * Math.cos(needleAngle);
  const needleY = cy + (r - 10) * Math.sin(needleAngle);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="w-full max-w-[250px]">
        {/* Background arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="rgba(124, 58, 237, 0.15)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Value arc */}
        {angle > 0 && (
          <path
            d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 8px ${color}80)`,
            }}
          />
        )}
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="4" fill={color} />

        {/* Scale labels */}
        <text x="17" y="116" fill="#a78bfa" fontSize="10" fontFamily="var(--font-mono)">
          0
        </text>
        <text x="177" y="116" fill="#a78bfa" fontSize="10" fontFamily="var(--font-mono)">
          9
        </text>
      </svg>

      {/* Value display */}
      <div className="mt-2 text-center">
        <span
          className="font-mono text-4xl font-bold"
          style={{ color }}
        >
          {clampedValue.toFixed(1)}
        </span>
        <p className="mt-1 text-sm text-cosmic-300/70">{stormLabel}</p>
      </div>
    </div>
  );
}
