import type { MetadataRoute } from "next";

// Lets people add Hisab to their phone's home screen, where it opens full
// screen. There is no service worker, so the app still needs a connection.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "হিসাব-Hisab",
    short_name: "Hisab",
    description:
      "Track your income, savings, vehicles and fuel in one simple place.",
    start_url: "/home",
    display: "standalone",
    orientation: "any",
    background_color: "#fafbfa",
    theme_color: "#fafbfa",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
