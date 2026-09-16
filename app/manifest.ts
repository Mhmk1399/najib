import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "نجیب‌زاده | پوشاک مردانه لوکس",
    short_name: "نجیب‌زاده",
    description: "فروشگاه پوشاک مردانه و خدمات خیاطی لوکس نجیب‌زاده",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F6F2EB",
    theme_color: "#0B0B0B",
    lang: "fa-IR",
    dir: "rtl",
    categories: ["shopping", "lifestyle"],
    icons: [
      {
        src: "/pwa/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa/maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
