"use client";
import { Geist, Geist_Mono } from "next/font/google";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>OKOA Automated Document Processing System</title>
        <meta name="description" content="Institutional-grade multi-agent document processing with real-time monitoring" />
      </head>
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <ConvexProvider client={convex}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </ConvexProvider>
      </body>
    </html>
  );
}