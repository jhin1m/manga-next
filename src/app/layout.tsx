import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Script from "next/script";
import { generateHomeJsonLd } from "@/lib/seo/jsonld";
import { constructMetadata } from "@/lib/seo/metadata";
import { AuthProvider } from "@/components/providers/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Header />
            <main className="flex-grow container mx-auto px-4 py-6 sm:px-18 2xl:px-48">
              {children}
            </main>
            <Footer />
            <Toaster />
            <Script
              id="schema-org"
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: generateHomeJsonLd() }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
