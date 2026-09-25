import React from "react";

interface SkeletonLoaderProps {
  rows?: number;
}

export default function SkeletonLoader({ rows = 3 }: SkeletonLoaderProps) {
  return (
    <div className="w-full space-y-4 animate-pulse">
      <div className="h-6 bg-surface-2 rounded-lg w-1/3 border border-border/10" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 bg-surface rounded-xl border border-border/5 space-y-2">
            <div className="h-4 bg-surface-2 rounded w-4/5" />
            <div className="h-3 bg-surface-2 rounded w-2/3" />
            <div className="h-3 bg-surface-2 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
