"use client";

import { Loader2 } from "lucide-react";

interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  compact?: boolean;
}

export function Loading({ message, size = "md", className = "", compact = false }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`flex ${compact ? 'flex-row gap-2' : 'flex-col'} items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary ${compact ? '' : 'mb-2'}`} />
      {message && <p className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>{message}</p>}
    </div>
  );
} 