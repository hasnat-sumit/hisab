"use client";

import { useEffect } from "react";

/** Registers public/sw.js, which keeps the app's files on the device. */
export function ServiceWorker() {
  useEffect(() => {
    // In development the files change on every save, so a cache would only get in the way.
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        // The app works the same without it, only slower on a bad connection.
      });
  }, []);
  return null;
}
