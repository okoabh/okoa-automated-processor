"use client";
import { Geist, Geist_Mono } from "next/font/google";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ThemeProvider } from "@/components/ThemeProvider";
// import "./globals.css"; // Using inline styles approach instead

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
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            /* OKOA ASCII VISUAL LIBRARY - Exact Figma Colors */
            --figma-cream-lightest: #faf9f7;
            --figma-text-dark: #2d2d2d;
            --figma-cream-light: #f5f4f2;
            --figma-cream: #ede9e3;
            --figma-gray-medium: #4a4a4a;
            --figma-gray: #6b6b6b;
            --figma-beige-light: #e8e4de;
            --figma-brown-accent: #8b4513;
            --figma-cream-warm: #f0ede7;
            --figma-beige: #d4d0c8;
            --figma-sage-green: #7d8471;
            --figma-tan: #8b7355;
            --figma-gray-warm: #8b8680;
            --figma-gold: #a0926b;
            --figma-green-sage: #9ca986;
            --figma-black-dark: #1a1a1a;
            --figma-black-medium: #242424;
            --figma-black-light: #2f2f2f;
            --figma-slate-blue: #36454f;
            --figma-orange-accent: #cd853f;
            --figma-black-soft: #1f1f1f;
            --figma-gray-muted: #a19b94;
          }
          
          * {
            font-family: ui-monospace, 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', Consolas, 'Liberation Mono', Menlo, 'Courier New', monospace !important;
            font-feature-settings: "liga" 0, "calt" 0;
            font-variant-numeric: tabular-nums;
            letter-spacing: 0;
            box-sizing: border-box;
          }
          
          html, body {
            font-size: 14px;
            line-height: 1.5;
            font-weight: 400;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            width: 100%;
            background-color: var(--figma-cream-lightest);
            color: var(--figma-text-dark);
          }
          
          .dark {
            background-color: var(--figma-black-dark);
            color: var(--figma-beige-light);
          }
          
          input, textarea, select, button {
            font-family: ui-monospace, 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', Consolas, 'Liberation Mono', Menlo, 'Courier New', monospace !important;
            font-size: 14px;
            line-height: 1.5;
          }
          
          pre, code {
            font-family: ui-monospace, 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', Consolas, 'Liberation Mono', Menlo, 'Courier New', monospace !important;
            background: var(--figma-cream-light);
            border: 1px solid var(--figma-beige);
            padding: 8px;
            border-radius: 4px;
          }
        `}} />
      </head>
      <body className={`${geist.variable} ${geistMono.variable}`}>
        <ConvexProvider client={convex}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </ConvexProvider>
      </body>
    </html>
  );
}