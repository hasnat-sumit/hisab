import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Hisab", template: "%s · Hisab" },
  description: "Track your income, expenses and motorcycle fuel in one place.",
  appleWebApp: { capable: true, title: "Hisab", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets the app use the whole screen; safe-area padding keeps it clear of
  // notches and the home bar.
  viewportFit: "cover",
  // Android keeps bottom sheets above the on-screen keyboard.
  interactiveWidget: "resizes-content",
  themeColor: "#fafbfa",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col">
        {children}
        <Toaster
          position="top-center"
          richColors
          mobileOffset={{ top: "calc(env(safe-area-inset-top) + 0.5rem)" }}
        />
      </body>
    </html>
  );
}
