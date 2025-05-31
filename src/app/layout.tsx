import type { Metadata } from "next";
import { Fira_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Script from "next/script";
import { generateHomeJsonLd, generateOrganizationJsonLd } from "@/lib/seo/jsonld";
import { constructMetadata } from "@/lib/seo/metadata";
import { AuthProvider } from "@/components/providers/auth-provider";
import { seoConfig } from "@/config/seo.config";

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["300", "400"],
});

export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={seoConfig.site.language} suppressHydrationWarning className="dark">
      <body
        className={`${firaSans.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}
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

            {/* Enhanced JSON-LD Schema */}
            <Script
              id="website-schema"
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: generateHomeJsonLd() }}
            />
            <Script
              id="organization-schema"
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: generateOrganizationJsonLd() }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
