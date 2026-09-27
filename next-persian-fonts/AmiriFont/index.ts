import localFont from "next/font/local";

export const AmiriFont = localFont({
  src: [
    {
      path: "./amiri-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./Amiri.Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-amiri",
});

// Keep the named export available without loading the same font family twice.
export const AmiriFontBold = AmiriFont;

