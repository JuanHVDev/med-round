"use client";

import Script from "next/script";
import { siteConfig } from "@/lib/config/seo";

interface GoogleAnalyticsProps {
  GA_MEASUREMENT_ID?: string;
}

export function GoogleAnalytics({
  GA_MEASUREMENT_ID,
}: GoogleAnalyticsProps) {
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: true,
              cookie_flags: 'SameSite=None;Secure'
            });
          `,
        }}
      />
    </>
  );
}

interface GoogleTagManagerProps {
  GTM_ID?: string;
}

export function GoogleTagManager({ GTM_ID }: GoogleTagManagerProps) {
  if (!GTM_ID) {
    return null;
  }

  return (
    <Script
      id="gtm"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');
        `,
      }}
    />
  );
}

interface AnalyticsProviderProps {
  GA_MEASUREMENT_ID?: string;
  GTM_ID?: string;
}

export function AnalyticsProvider({
  GA_MEASUREMENT_ID,
  GTM_ID,
}: AnalyticsProviderProps) {
  return (
    <>
      <GoogleTagManager GTM_ID={GTM_ID} />
      <GoogleAnalytics GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />
    </>
  );
}

interface EventTrackingProps {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

export function trackEvent({
  category,
  action,
  label,
  value,
}: EventTrackingProps) {
  if (typeof window !== "undefined" && "gtag" in window) {
    const gtag = (window as unknown as { gtag: (command: string, event: string, params?: Record<string, unknown>) => void }).gtag;
    gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

export function trackPageView(url: string) {
  if (typeof window !== "undefined" && "gtag" in window) {
    const gtag = (window as unknown as { gtag: (command: string, event: string, params?: Record<string, unknown>) => void }).gtag;
    gtag("config", siteConfig.url, {
      page_path: url,
    });
  }
}
