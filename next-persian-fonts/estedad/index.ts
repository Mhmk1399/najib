import localFont from "next/font/local";

export const estedad = localFont({
  src: [
    {
      path: "./Estedad-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "./Estedad-ExtraLight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "./Estedad-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./Estedad-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./Estedad-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./Estedad-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./Estedad-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./Estedad-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "./Estedad-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-estedad",
});

// Keep the named export available without creating a second family with the
// same CSS variable. Tailwind weight utilities now resolve to real files.
export const estedadBold = estedad;
