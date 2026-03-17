import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap", // Faster font loading
});

export const metadata: Metadata = {
  title: "Interest Tracker | Smart Lending Manager",
  description: "Track your money lending, interest calculations, and collections with a premium fintech experience. Secure, fast, and beautiful.",
  keywords: ["interest tracker", "lending", "money manager", "fintech", "loan tracker"],
  authors: [{ name: "Interest Tracker" }],
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0B0B0C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fyqqiddxnjrihjjypqlo.supabase.co" />
        <link rel="dns-prefetch" href="https://fyqqiddxnjrihjjypqlo.supabase.co" />
      </head>
      <body className={`${inter.className} bg-background text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
