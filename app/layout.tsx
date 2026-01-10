import type React from "react"
import type { Metadata } from "next"
import { Spectral, Playfair_Display, Courier_Prime } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const spectral = Spectral({
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-sans",
})

const playfairDisplay = Playfair_Display({
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
})

const courierPrime = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "BooksExchange - Where Every Book is a Traveler",
  description:
    "Send your books on adventures across cities. Track their passport stamps, visa entries, and global journeys in this vintage travel bureau-inspired book exchange platform.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

import { Toaster } from "@/components/ui/toaster"
import { PushNotificationManager } from "@/components/push-notification-manager"
import { Suspense } from "react"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`font-sans antialiased ${spectral.variable} ${playfairDisplay.variable} ${courierPrime.variable}`}
      >
        {/* Wrap in Suspense to prevent blocking */}
        <Suspense fallback={null}>
          <PushNotificationManager />
        </Suspense>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}