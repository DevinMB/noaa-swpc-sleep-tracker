import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export function Card({ children, className = "", glow = false }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-cosmic-800/30 bg-surface p-6 ${
        glow ? "glow" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between">
      <div>
        <h3 className="font-display text-lg font-semibold text-cosmic-100">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 text-sm text-cosmic-300/60">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
