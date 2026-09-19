import type { NextConfig } from "next";

type RemotePattern = NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
>[number];

function remotePatternFromUrl(value: string | undefined): RemotePattern | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    const protocol = url.protocol.replace(":", "");

    if (protocol !== "http" && protocol !== "https") return null;

    return {
      protocol,
      hostname: url.hostname,
      port: url.port,
      pathname: "/**",
    };
  } catch {
    return null;
  }
}

function uniqueRemotePatterns(patterns: Array<RemotePattern | null>) {
  const seen = new Set<string>();

  return patterns.filter((pattern): pattern is RemotePattern => {
    if (!pattern) return false;
    const key = `${pattern.protocol}:${pattern.hostname}:${pattern.port ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "192.168.1.111",
  ],
  images: {
    qualities: [75, 80, 82, 84, 95],
    remotePatterns: uniqueRemotePatterns([
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
        port: "",
        pathname: "/**",
      },
      remotePatternFromUrl(process.env.S3_PUBLIC_BASE_URL),
      remotePatternFromUrl(process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL),
      remotePatternFromUrl(process.env.S3_ENDPOINT),
    ]),
  },
  async redirects() {
    return [
      { source: "/about", destination: "/about-us", permanent: true },
      { source: "/our-story", destination: "/about-us", permanent: true },
      { source: "/craftsmanship", destination: "/about-us", permanent: false },
      { source: "/heritage", destination: "/about-us", permanent: false },
      { source: "/contact", destination: "/contact-us", permanent: true },
      { source: "/appointments", destination: "/contact-us", permanent: false },
      { source: "/stores", destination: "/contact-us", permanent: false },
      { source: "/customer-care", destination: "/contact-us", permanent: false },
      { source: "/shipping-returns", destination: "/terms-conditions", permanent: false },
      { source: "/terms", destination: "/terms-conditions", permanent: true },
      { source: "/privacy", destination: "/terms-conditions", permanent: false },
      { source: "/cookies", destination: "/terms-conditions", permanent: false },
      { source: "/journal", destination: "/blog", permanent: true },
      { source: "/collections", destination: "/shop", permanent: false },
      { source: "/campaigns", destination: "/shop", permanent: false },
      { source: "/tailoring", destination: "/shop", permanent: false },
      { source: "/fragrance", destination: "/shop", permanent: false },
      { source: "/clothing", destination: "/shop", permanent: false },
      { source: "/wishlist", destination: "/profile", permanent: false },
      { source: "/checkout", destination: "/cart", permanent: false },
      { source: "/catalog/images", destination: "/admin/catalog/images", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
