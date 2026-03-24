"use client";

interface StatsSummaryProps {
  kpVsQuality: { r: number; pValue: number; n: number } | null;
  kpVsHours: { r: number; pValue: number; n: number } | null;
  regression: { slope: number; intercept: number; rSquared: number } | null;
  stormImpact: {
    normalAvgQuality: number;
    stormAvgQuality: number;
    percentChange: number;
  } | null;
}

function getCorrelationStrength(r: number): string {
  const abs = Math.abs(r);
  if (abs < 0.1) return "Negligible";
  if (abs < 0.3) return "Weak";
  if (abs < 0.5) return "Moderate";
  if (abs < 0.7) return "Strong";
  return "Very Strong";
}

function getSignificance(p: number): string {
  if (p < 0.001) return "Highly significant";
  if (p < 0.01) return "Very significant";
  if (p < 0.05) return "Significant";
  return "Not significant";
}

function getPlainEnglish(
  r: number,
  p: number,
  n: number,
  stormImpact: StatsSummaryProps["stormImpact"]
): string {
  if (n < 5) {
    return "We don't have enough data yet to draw any conclusions. As more people report their sleep, the picture will get clearer.";
  }

  const direction = r < 0 ? "worse" : "better";
  const strength = Math.abs(r);

  let summary = "";

  if (strength < 0.1) {
    summary = "So far, there's essentially no visible link between space weather activity and sleep quality in our data. The two appear to move independently of each other.";
  } else if (strength < 0.3) {
    summary = `There's a slight trend suggesting people may sleep ${direction} when geomagnetic activity is higher, but the connection is weak. It could easily be due to chance.`;
  } else if (strength < 0.5) {
    summary = `There's a noticeable pattern: when geomagnetic activity increases, sleep quality tends to get ${direction}. This is a moderate connection worth watching as we collect more data.`;
  } else {
    summary = `There's a strong pattern in the data: higher geomagnetic activity is linked to ${direction} sleep quality. This is a meaningful signal, though more data will help confirm it.`;
  }

  if (p < 0.05) {
    summary += " This result is statistically significant, meaning it's unlikely to be pure coincidence.";
  } else {
    summary += " However, this result isn't statistically significant yet — we need more data before we can rule out coincidence.";
  }

  if (stormImpact && stormImpact.normalAvgQuality > 0 && Math.abs(stormImpact.percentChange) > 1) {
    const dir = stormImpact.percentChange < 0 ? "lower" : "higher";
    summary += ` During geomagnetic storms specifically, average sleep quality was ${Math.abs(stormImpact.percentChange).toFixed(1)}% ${dir} than on quiet days.`;
  }

  return summary;
}

export function StatsSummary({
  kpVsQuality,
  kpVsHours,
  regression,
  stormImpact,
}: StatsSummaryProps) {
  if (!kpVsQuality) {
    return (
      <div className="flex h-full items-center justify-center text-cosmic-300/40">
        Not enough data for statistical analysis
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Kp vs Quality */}
      <div className="rounded-xl bg-surface-dark/50 p-4">
        <h4 className="font-display text-sm font-semibold text-cosmic-200">
          Kp Index vs Sleep Quality
        </h4>
        <div className="mt-2 grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-cosmic-300/50">Pearson r</p>
            <p className="font-mono text-lg font-bold text-cosmic-200">
              {kpVsQuality.r.toFixed(3)}
            </p>
            <p className="text-xs text-cosmic-300/40">
              {getCorrelationStrength(kpVsQuality.r)}{" "}
              {kpVsQuality.r < 0 ? "negative" : "positive"}
            </p>
          </div>
          <div>
            <p className="text-xs text-cosmic-300/50">p-value</p>
            <p className="font-mono text-lg font-bold text-cosmic-200">
              {kpVsQuality.pValue < 0.001
                ? "<0.001"
                : kpVsQuality.pValue.toFixed(3)}
            </p>
            <p className="text-xs text-cosmic-300/40">
              {getSignificance(kpVsQuality.pValue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-cosmic-300/50">Sample Size</p>
            <p className="font-mono text-lg font-bold text-cosmic-200">
              {kpVsQuality.n}
            </p>
            <p className="text-xs text-cosmic-300/40">paired days</p>
          </div>
        </div>
      </div>

      {/* Kp vs Hours */}
      {kpVsHours && (
        <div className="rounded-xl bg-surface-dark/50 p-4">
          <h4 className="font-display text-sm font-semibold text-cosmic-200">
            Kp Index vs Sleep Hours
          </h4>
          <div className="mt-2 grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-cosmic-300/50">Pearson r</p>
              <p className="font-mono text-lg font-bold text-cosmic-200">
                {kpVsHours.r.toFixed(3)}
              </p>
            </div>
            <div>
              <p className="text-xs text-cosmic-300/50">p-value</p>
              <p className="font-mono text-lg font-bold text-cosmic-200">
                {kpVsHours.pValue < 0.001
                  ? "<0.001"
                  : kpVsHours.pValue.toFixed(3)}
              </p>
            </div>
            <div>
              <p className="text-xs text-cosmic-300/50">R-squared</p>
              <p className="font-mono text-lg font-bold text-cosmic-200">
                {regression?.rSquared.toFixed(3) ?? "--"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Storm Impact */}
      {stormImpact && stormImpact.normalAvgQuality > 0 && (
        <div className="rounded-xl border border-cosmic-500/20 bg-cosmic-900/20 p-4">
          <h4 className="font-display text-sm font-semibold text-cosmic-200">
            Storm Impact
          </h4>
          <p className="mt-2 text-sm text-cosmic-300/70">
            During geomagnetic storms (Kp &ge; 4), average sleep quality was{" "}
            <span
              className={`font-mono font-bold ${
                stormImpact.percentChange < 0
                  ? "text-red-400"
                  : "text-green-400"
              }`}
            >
              {stormImpact.percentChange > 0 ? "+" : ""}
              {stormImpact.percentChange.toFixed(1)}%
            </span>{" "}
            compared to quiet conditions.
          </p>
          <div className="mt-2 flex gap-4 text-xs">
            <span className="text-cosmic-300/50">
              Quiet: {stormImpact.normalAvgQuality.toFixed(1)}/10
            </span>
            <span className="text-cosmic-300/50">
              Storm: {stormImpact.stormAvgQuality.toFixed(1)}/10
            </span>
          </div>
        </div>
      )}

      {/* Plain English Explanation */}
      <div className="rounded-xl border border-cosmic-400/15 bg-cosmic-950/40 p-4">
        <h4 className="font-display text-sm font-semibold text-cosmic-200">
          What does this mean?
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-cosmic-300/70">
          {getPlainEnglish(
            kpVsQuality.r,
            kpVsQuality.pValue,
            kpVsQuality.n,
            stormImpact
          )}
        </p>

        <div className="mt-4 space-y-2 border-t border-cosmic-800/20 pt-3">
          <p className="text-xs font-medium text-cosmic-300/50">Quick glossary:</p>
          <dl className="space-y-1.5 text-xs text-cosmic-300/40">
            <div>
              <dt className="inline font-semibold text-cosmic-300/60">Pearson r</dt>
              <dd className="inline"> — Measures how closely two things move together. Ranges from -1 (perfect opposite) to +1 (perfect match). Zero means no relationship.</dd>
            </div>
            <div>
              <dt className="inline font-semibold text-cosmic-300/60">p-value</dt>
              <dd className="inline"> — The probability this result happened by pure chance. Below 0.05 is considered statistically significant (less than a 5% chance it's random).</dd>
            </div>
            <div>
              <dt className="inline font-semibold text-cosmic-300/60">R-squared</dt>
              <dd className="inline"> — The percentage of sleep quality variation that can be explained by space weather. E.g., 0.15 means 15% of the variation lines up.</dd>
            </div>
            <div>
              <dt className="inline font-semibold text-cosmic-300/60">Sample size</dt>
              <dd className="inline"> — The number of days where we have both space weather and sleep data. More days = more reliable results.</dd>
            </div>
          </dl>
        </div>
      </div>

      <p className="text-xs text-cosmic-300/30 italic">
        Note: Correlation does not imply causation. This analysis explores
        potential relationships for citizen science purposes.
      </p>
    </div>
  );
}
