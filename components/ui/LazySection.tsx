"use client";

import { useState, useEffect, useRef, ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
}

export function LazySection({
  children,
  fallback = <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />,
  threshold = 0.1,
  rootMargin = "100px",
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return <div ref={sectionRef}>{isVisible ? children : fallback}</div>;
}

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}

export function Skeleton({ className = "", variant = "rectangular" }: SkeletonProps) {
  const variantStyles: Record<string, string> = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  return <div className={`animate-pulse bg-gray-200 ${variantStyles[variant] || variantStyles.rectangular} ${className}`} />;
}

export function HeroSkeleton() {
  return (
    <div className="animate-pulse bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <div className="flex justify-center">
            <Skeleton className="w-64 h-12 rounded-full" />
          </div>
          <div className="space-y-4 max-w-3xl mx-auto">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-6 w-3/4 mx-auto" />
          </div>
          <div className="flex justify-center gap-4">
            <Skeleton className="w-40 h-12 rounded-lg" />
            <Skeleton className="w-40 h-12 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses: Record<string, string> = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`} />
  );
}

export function LoadingDots() {
  return (
    <div className="flex gap-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
