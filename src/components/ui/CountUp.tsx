"use client";

import { useEffect, useState } from "react";

interface CountUpProps {
  end: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUp({
  end,
  duration = 1000,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: CountUpProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = 0;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(startValue + (end - startValue) * eased);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [end, duration]);

  return (
    <span className={className}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}
