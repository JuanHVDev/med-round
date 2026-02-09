"use client";

import { useEffect, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface GA4Config {
  measurementId: string;
  debug?: boolean;
}

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export function useGA4({ measurementId, debug = false }: GA4Config) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const trackPageView = useCallback(
    (url: string) => {
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("config", measurementId, {
          page_path: url,
          debug_mode: debug,
        });
      }
    },
    [measurementId, debug]
  );

  const trackEvent = useCallback(
    (
      action: string,
      category: string,
      label?: string,
      value?: number
    ) => {
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", action, {
          event_category: category,
          event_label: label,
          value: value,
          debug_mode: debug,
        });
      }
    },
    [debug]
  );

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ?? "");
    trackPageView(url);
  }, [pathname, searchParams, trackPageView]);

  return { trackPageView, trackEvent };
}

export function GoogleAnalyticsProvider({
  measurementId,
  debug = false,
}: {
  measurementId?: string;
  debug?: boolean;
}) {
  const id = measurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!id) {
    return null;
  }

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${id}', {
              page_path: window.location.pathname,
              debug_mode: ${debug},
              cookie_flags: 'SameSite=None;Secure',
              send_page_view: true,
              anonymize_ip: true,
              allow_ads: true,
              allow_ad_personalization_signals: true
            });
          `,
        }}
      />
    </>
  );
}

export function useAnalytics() {
  const trackEvent = useCallback(
    (
      eventName: string,
      params?: Record<string, unknown>
    ) => {
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", eventName, params);
      }
    },
    []
  );

  const trackPageView = useCallback(
    (pagePath: string, pageTitle?: string) => {
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "page_view", {
          page_path: pagePath,
          page_title: pageTitle,
        });
      }
    },
    []
  );

  const setUserId = useCallback((userId: string) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        user_id: userId,
      });
    }
  }, []);

  const setUserProperties = useCallback((properties: Record<string, unknown>) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("set", "user_properties", properties);
    }
  }, []);

  return {
    trackEvent,
    trackPageView,
    setUserId,
    setUserProperties,
  };
}

export function AnalyticsTracker({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== "undefined" && window.gtag) {
      const url = pathname + (searchParams?.toString() ?? "");
      window.gtag("event", "page_view", {
        page_path: url,
        page_location: window.location.href,
        page_referrer: document.referrer,
      });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}

export function trackConversion(
  conversionId: string,
  value?: number,
  currency = "USD"
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "conversion", {
      send_to: conversionId,
      value: value,
      currency: currency,
    });
  }
}

export function trackEngagement(
  engagementTimeMs?: number,
  sessionId?: number
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "user_engagement", {
      engagement_time_msec: engagementTimeMs,
      session_id: sessionId,
    });
  }
}

export function trackScroll(
  scrollDepthPercentage: number,
  scrollDepthTrigger: number
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "scroll", {
      scroll_depth: scrollDepthPercentage,
      scroll_depth_trigger: scrollDepthTrigger,
    });
  }
}
