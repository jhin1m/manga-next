import type { Metadata } from "next";
import { Nunito } from "next/font/google";
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
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { MainContent } from "@/components/layout/MainContent";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = constructMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html lang={seoConfig.site.language} suppressHydrationWarning className="dark">
      <body
        className={`${nunito.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <Header />
              <MainContent>
                {children}
              </MainContent>
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
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
