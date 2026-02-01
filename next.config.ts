import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

/**
 * Configuración de Content Security Policy (CSP) permisiva inicial.
 *
 * Esta configuración proporciona protección XSS básica mientras permite
 * flexibilidad para desarrollo. Se recomienda endurecer en producción:
 *
 * - 'unsafe-inline' en scripts: Permitido temporalmente, remover cuando
 *   se eliminen todos los inline scripts
 * - 'unsafe-eval': Necesario para algunas librerías, remover si es posible
 * - img-src 'https:': Permitir imágenes de cualquier HTTPS, restringir a
 *   dominios específicos cuando sea posible
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP} CSP MDN
 * @see {@link https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html} OWASP CSP
 */
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self';
  media-src 'self';
  object-src 'none';
  frame-ancestors 'self';
  base-uri 'self';
  form-action 'self';
`.replace(/\s{2,}/g, " ").trim();

const nextConfig: NextConfig = {
  // Bundle analyzer - only enabled when ANALYZE=true
  // Run: ANALYZE=true npm run build

  /**
   * Headers de seguridad HTTP.
   *
   * Configuración de headers de seguridad aplicados a todas las rutas.
   * Estos headers protegen contra vulnerabilidades comunes como XSS,
   * clickjacking, MIME sniffing, etc.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy,
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

// Enable bundle analyzer only when ANALYZE environment variable is set
const bundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig);

export default bundleAnalyzerConfig;
