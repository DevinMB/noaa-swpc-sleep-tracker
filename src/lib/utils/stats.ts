/**
 * Basic statistical functions for correlation analysis.
 */

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const squaredDiffs = values.map((v) => (v - avg) ** 2);
  return Math.sqrt(squaredDiffs.reduce((sum, v) => sum + v, 0) / (values.length - 1));
}

/**
 * Pearson correlation coefficient between two arrays of equal length.
 * Returns { r, pValue, n }
 */
export function pearsonCorrelation(
  x: number[],
  y: number[]
): { r: number; pValue: number; n: number } {
  const n = Math.min(x.length, y.length);
  if (n < 3) return { r: 0, pValue: 1, n };

  const xSlice = x.slice(0, n);
  const ySlice = y.slice(0, n);

  const xMean = mean(xSlice);
  const yMean = mean(ySlice);

  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    const dx = xSlice[i] - xMean;
    const dy = ySlice[i] - yMean;
    sumXY += dx * dy;
    sumX2 += dx * dx;
    sumY2 += dy * dy;
  }

  if (sumX2 === 0 || sumY2 === 0) return { r: 0, pValue: 1, n };

  const r = sumXY / Math.sqrt(sumX2 * sumY2);

  // Approximate p-value using t-distribution
  const t = r * Math.sqrt((n - 2) / (1 - r * r));
  // Two-tailed p-value approximation (good enough for display)
  const df = n - 2;
  const pValue = 2 * (1 - tCDF(Math.abs(t), df));

  return { r: Math.round(r * 1000) / 1000, pValue: Math.max(0, pValue), n };
}

/**
 * Simple linear regression: y = slope * x + intercept
 */
export function linearRegression(
  x: number[],
  y: number[]
): { slope: number; intercept: number; rSquared: number } {
  const n = Math.min(x.length, y.length);
  if (n < 2) return { slope: 0, intercept: 0, rSquared: 0 };

  const xMean = mean(x.slice(0, n));
  const yMean = mean(y.slice(0, n));

  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - xMean;
    const dy = y[i] - yMean;
    sumXY += dx * dy;
    sumX2 += dx * dx;
    sumY2 += dy * dy;
  }

  const slope = sumX2 === 0 ? 0 : sumXY / sumX2;
  const intercept = yMean - slope * xMean;
  const rSquared = sumX2 === 0 || sumY2 === 0 ? 0 : (sumXY * sumXY) / (sumX2 * sumY2);

  return {
    slope: Math.round(slope * 1000) / 1000,
    intercept: Math.round(intercept * 1000) / 1000,
    rSquared: Math.round(rSquared * 1000) / 1000,
  };
}

/**
 * Approximate Student's t CDF using a normal approximation.
 * Good enough for df > 5 and display purposes.
 */
function tCDF(t: number, df: number): number {
  // Use normal approximation for large df
  if (df > 30) {
    return normalCDF(t);
  }
  // Simple approximation for smaller df
  const x = df / (df + t * t);
  return 1 - 0.5 * incompleteBeta(df / 2, 0.5, x);
}

function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Rough approximation of the regularized incomplete beta function.
 */
function incompleteBeta(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  // Use a simple continued fraction approximation
  let result = Math.pow(x, a) * Math.pow(1 - x, b);
  result /= a;
  // First few terms of the continued fraction
  let sum = 1 / a;
  for (let i = 0; i < 50; i++) {
    const term =
      (result * Math.pow(x, i + 1)) / (a + i + 1);
    sum += term;
    if (Math.abs(term) < 1e-10) break;
    result = term;
  }
  return Math.min(1, Math.max(0, sum * a));
}
