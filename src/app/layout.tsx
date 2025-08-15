import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>OKOA - Automated Document Processing</title>
        <meta name="description" content="Institutional-grade document processing with multi-agent AI analysis" />
        <style dangerouslySetInnerHTML={{ __html: `
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          html, body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
            color: #2d2d2d;
            background-color: #faf9f7;
          }
          
          h1, h2, h3, h4, h5, h6 {
            font-weight: 400;
            line-height: 1.3;
          }
          
          button, input, select, textarea {
            font-family: inherit;
          }
          
          a {
            color: inherit;
            text-decoration: none;
          }
        `}} />
      </head>
      <body>
        <ConvexProvider client={convex}>
          {children}
        </ConvexProvider>
      </body>
    </html>
  );
}