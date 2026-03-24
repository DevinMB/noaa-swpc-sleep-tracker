import { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-cosmic-800/50 text-cosmic-200",
  success: "bg-green-900/50 text-green-300",
  warning: "bg-yellow-900/50 text-yellow-300",
  danger: "bg-red-900/50 text-red-300",
  info: "bg-blue-900/50 text-blue-300",
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
}
