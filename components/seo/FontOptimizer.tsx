"use client";

import { useEffect, useState } from "react";

interface FontOptimizerProps {
  fontFamily: string;
  subsets?: string[];
  display?: "auto" | "block" | "swap" | "fallback" | "optional";
  preload?: boolean;
}

export function FontOptimizer({
  fontFamily,
  subsets = ["latin"],
  display = "swap",
  preload = false,
}: FontOptimizerProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fontLoader = async () => {
      try {
        if ((document as any).fonts?.loaded) {
          await (document as any).fonts.load(`16px ${fontFamily}`);
          setIsLoaded(true);
        }
      } catch (error) {
        console.error("Font loading error:", error);
      }
    };

    fontLoader();

    if ((document as any).fonts?.addEventListener) {
      (document as any).fonts.addEventListener("loadingdone", () => setIsLoaded(true));
    }
  }, [fontFamily]);

  return null;
}

export function useFontDisplay(fontFamily: string) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleLoading = () => setIsVisible(false);
    const handleLoadingDone = () => setIsVisible(false);

    if ((document as any).fonts) {
      (document as any).fonts.addEventListener("loading", handleLoading);
      (document as any).fonts.addEventListener("loadingdone", handleLoadingDone);
    }

    return () => {
      if ((document as any).fonts) {
        (document as any).fonts.removeEventListener("loading", handleLoading);
        (document as any).fonts.removeEventListener("loadingdone", handleLoadingDone);
      }
    };
  }, []);

  return { isVisible, isLoaded: !isVisible };
}

export function preloadFonts(fonts: Array<{ family: string; weight?: number }>) {
  if (typeof window === "undefined") return;

  fonts.forEach((font) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "font";
    link.href = `/fonts/${font.family}-${font.weight || 400}.woff2`;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  });
}

export function FontLoader({
  family,
  weights = [400, 500, 600, 700],
}: {
  family: string;
  weights?: number[];
}) {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        @font-face {
          font-family: '${family}';
          font-style: normal;
          font-weight: ${weights[0]};
          font-display: ${weights.length > 1 ? "swap" : "optional"};
          src: local('${family}'),
               url('/fonts/${family}-${weights[0]}.woff2') format('woff2');
        }
        ${weights.slice(1).map(w => `
          @font-face {
            font-family: '${family}';
            font-style: normal;
            font-weight: ${w};
            font-display: swap;
            src: local('${family}'),
                 url('/fonts/${family}-${w}.woff2') format('woff2');
          }
        `).join("")}
      `
    }} />
  );
}
