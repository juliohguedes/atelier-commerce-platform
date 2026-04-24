import type { Metadata } from "next";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { env, isProductionStage } from "@/lib/env";
import "./globals.css";

const shouldAllowIndexing = isProductionStage;

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: `${BRAND_CONFIG.companyName} | Moda Autoral`,
    template: `%s | ${BRAND_CONFIG.companyName}`
  },
  description: BRAND_CONFIG.tagline,
  applicationName: BRAND_CONFIG.companyName,
  alternates: {
    canonical: "/"
  },
  formatDetection: {
    address: false,
    email: false,
    telephone: false
  },
  robots: {
    index: shouldAllowIndexing,
    follow: shouldAllowIndexing,
    nocache: !shouldAllowIndexing,
    googleBot: {
      index: shouldAllowIndexing,
      follow: shouldAllowIndexing,
      noimageindex: !shouldAllowIndexing
    }
  }
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
