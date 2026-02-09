"use client";

import { useEffect } from "react";

interface OptimizedScriptProps {
  src: string;
  strategy?: "afterInteractive" | "lazyOnload" | "beforeInteractive";
  async?: boolean;
  defer?: boolean;
  id?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedScript({
  src,
  strategy = "afterInteractive",
  async = true,
  defer = true,
  id,
  onLoad,
  onError,
}: OptimizedScriptProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = src;
    script.async = async;
    script.defer = defer;
    script.id = id || "";
    script.setAttribute("data-strategy", strategy);

    script.onload = () => onLoad?.();
    script.onerror = () => onError?.();

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [src, async, defer, id, strategy, onLoad, onError]);

  return null;
}

export function Preconnect({ href, crossOrigin = true }: { href: string; crossOrigin?: boolean }) {
  return <link rel="preconnect" href={href} crossOrigin={crossOrigin ? "" : undefined} />;
}

export function DNSProbe({ href }: { href: string }) {
  return <link rel="dns-prefetch" href={href} />;
}

export function Prefetch({ href }: { href: string }) {
  return <link rel="prefetch" href={href} />;
}

export function LinkPreload({ href, as = "font" }: { href: string; as?: string }) {
  return <link rel="preload" href={href} as={as} />;
}

interface PerformanceMonitorProps {
  onMetrics?: (metrics: {
    fcp: number;
    lcp: number;
    cls: number;
  }) => void;
}

export function PerformanceMonitor({ onMetrics }: PerformanceMonitorProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new PerformanceObserver((list) => {
      const metrics: { fcp: number; lcp: number; cls: number } = { fcp: 0, lcp: 0, cls: 0 };

      list.getEntries().forEach((entry) => {
        if (entry.entryType === "paint" && entry.name === "first-contentful-paint") {
          metrics.fcp = entry.startTime;
        }
        if (entry.entryType === "largest-contentful-paint") {
          metrics.lcp = entry.startTime;
        }
        if (entry.entryType === "layout-shift") {
          metrics.cls += (entry as any).value || 0;
        }
      });

      onMetrics?.(metrics);
    });

    observer.observe({ type: "paint", buffered: true });
    observer.observe({ type: "largest-contentful-paint", buffered: true });
    observer.observe({ type: "layout-shift", buffered: true });

    return () => observer.disconnect();
  }, [onMetrics]);

  return null;
}
