---
description: Revert website to Ground Zero (minimal state, preserving admin)
---

To revert the website to the "Ground Zero" state:

1. **Delete Public Components**: Remove all files in `src/components/`.
   ```bash
   rm -rf src/components/*
   ```

2. **Reset Home Page**: Overwrite `src/app/page.tsx` with the minimal placeholder.
   ```tsx
   export default function Home() {
     return (
       <main className="min-h-screen flex items-center justify-center">
         <h1 className="text-2xl font-bold">Welcome</h1>
       </main>
     );
   }
   ```

3. **Reset Root Layout**: Overwrite `src/app/layout.tsx` to remove any headers/navs.
   ```tsx
   import type { Metadata } from "next";
   import { Inter } from "next/font/google";
   import "./globals.css";

   const inter = Inter({
     variable: "--font-inter",
     subsets: ["latin"],
     display: "swap",
   });

   export const metadata: Metadata = {
     title: "Atulya's Design Portfolio",
     description: "Product designer crafting digital experiences",
     openGraph: {
       title: "Atulya's Design Portfolio",
       description: "Product designer crafting digital experiences",
       type: "website",
     },
   };

   export default function RootLayout({
     children,
   }: Readonly<{
     children: React.ReactNode;
   }>) {
     return (
       <html lang="en" className="dark">
         <body className={`${inter.variable} antialiased`}>
           {children}
         </body>
       </html>
     );
   }
   ```

4. **Reset Globals CSS**: Overwrite `src/app/globals.css` to standard Tailwind setup.
   ```css
   @import "tailwindcss";

   :root {
     --background: #1a1a1b;
     --foreground: #ffffff;
     --accent: #ff2d55;
     --text-muted: #cccccc;
   }

   @theme inline {
     --color-background: var(--background);
     --color-foreground: var(--foreground);
     --color-accent: var(--accent);
     --color-muted: var(--text-muted);
     --font-sans: var(--font-inter);
   }

   * {
     box-sizing: border-box;
   }

   html {
     scroll-behavior: smooth;
   }

   body {
     background: var(--background);
     color: var(--foreground);
     font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
     line-height: 1.6;
     -webkit-font-smoothing: antialiased;
     -moz-osx-font-smoothing: grayscale;
   }

   a {
     color: var(--accent);
     text-decoration: none;
     transition: opacity 0.2s ease;
   }

   a:hover {
     opacity: 0.8;
   }

   /* Selection styling */
   ::selection {
     background: var(--accent);
     color: var(--foreground);
   }

   /* Scrollbar styling for webkit browsers */
   ::-webkit-scrollbar {
     width: 8px;
   }

   ::-webkit-scrollbar-track {
     background: var(--background);
   }

   ::-webkit-scrollbar-thumb {
     background: #333;
     border-radius: 4px;
   }

   ::-webkit-scrollbar-thumb:hover {
     background: #444;
   }
   ```
