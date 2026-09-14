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
};

export default nextConfig;
