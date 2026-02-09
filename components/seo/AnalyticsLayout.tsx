"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

export function AnalyticsLayout({
  children,
  GA_MEASUREMENT_ID,
}: {
  children: React.ReactNode;
  GA_MEASUREMENT_ID?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const gaId = GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  useEffect(() => {
    if (!gaId || typeof window === "undefined") return;

    const url = pathname + (searchParams?.toString() ?? "");

    if (typeof window.gtag !== "undefined") {
      window.gtag("config", gaId, {
        page_path: url,
        page_location: window.location.href,
        page_referrer: document.referrer,
      });
    }
  }, [pathname, searchParams, gaId]);

  if (!gaId) {
    return <>{children}</>;
  }

  return (
    <>
      <Script
        id="gtag-script"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="gtag-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
              send_page_view: true,
              cookie_flags: 'SameSite=None;Secure',
              anonymize_ip: true,
              allow_ads: false,
              allow_ad_personalization_signals: false
            });
          `,
        }}
      />
      {children}
    </>
  );
}

export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const url = pathname + (searchParams?.toString() ?? "");

    if (typeof window.gtag !== "undefined") {
      window.gtag("event", "page_view", {
        page_path: url,
        page_location: window.location.href,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export function OutboundLinkTracker({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleClick = () => {
      if (typeof window.gtag !== "undefined") {
        window.gtag("event", "click", {
          link_url: url,
          link_domain: new URL(url).hostname,
          outbound: true,
        });
      }
    };

    const link = document.querySelector(`a[href="${url}"]`);
    if (link) {
      link.addEventListener("click", handleClick);
    }

    return () => {
      if (link) {
        link.removeEventListener("click", handleClick);
      }
    };
  }, [url]);

  return <>{children}</>;
}
