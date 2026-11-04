import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_Bengali } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { THEME_SCRIPT } from "@/lib/theme";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// For the Bangla app name and the Taka sign, which Geist does not include.
const notoBengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali"],
});

export const metadata: Metadata = {
  title: { default: "হিসাব-Hisab", template: "%s · হিসাব-Hisab" },
  description:
    "Track your income, savings, vehicles and fuel in one simple place.",
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafbfa" },
    { media: "(prefers-color-scheme: dark)", color: "#101513" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // The theme script adds a class before React loads.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${notoBengali.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
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
