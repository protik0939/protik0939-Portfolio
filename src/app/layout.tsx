import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Poppins } from "next/font/google";
import { AppUIProvider } from "@/Components/AppUIProvider";
import MobileBottomNav from "@/Components/MobileBottomNav";
import ServiceWorkerRegister from "@/Components/ServiceWorkerRegister";
import { resolveRequestLanguage } from "@/lib/request-language";
import { DEFAULT_SITE_DESCRIPTION, getSiteUrl, SITE_NAME } from "@/lib/site-url";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
});

const DEFAULT_TITLE = `${SITE_NAME} | Full Stack Developer (Next.js, React, Node.js)`;
const DEFAULT_DESCRIPTION = DEFAULT_SITE_DESCRIPTION;

// Bump the ?v= value whenever the icon artwork changes: browsers cache favicons very aggressively.
const ICON_VERSION = "2";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    locale: "en_US",
    alternateLocale: ["bn_BD"],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  manifest: "/manifest.webmanifest",
  // SVG stays the primary icon for browsers that support it; the multi-size ICO and PNGs are
  // generated from the same artwork for surfaces that ignore SVG (Chrome bookmarks/history,
  // Google search results, Safari, iOS home screen).
  icons: {
    icon: [
      { url: `/favicon.ico?v=${ICON_VERSION}`, sizes: "48x48" },
      { url: `/favicon.svg?v=${ICON_VERSION}`, type: "image/svg+xml", sizes: "any" },
      { url: `/icon-192.png?v=${ICON_VERSION}`, type: "image/png", sizes: "192x192" },
      { url: `/icon-512.png?v=${ICON_VERSION}`, type: "image/png", sizes: "512x512" },
    ],
    shortcut: `/favicon.ico?v=${ICON_VERSION}`,
    apple: [{ url: `/apple-touch-icon.png?v=${ICON_VERSION}`, sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0e0e0e" },
    { media: "(prefers-color-scheme: light)", color: "#f7f8fc" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language = await resolveRequestLanguage();

  return (
    <html lang={language} className={`${poppins.variable} ${hindSiliguri.variable} antialiased dark`} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0e0e0e" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href={`/apple-touch-icon.png?v=${ICON_VERSION}`} />
      </head>
      <body className="flex min-h-screen flex-col" suppressHydrationWarning>
        {/* Captures beforeinstallprompt before React hydrates, so the event is never lost. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__deferredInstallPrompt=e;window.dispatchEvent(new CustomEvent('pwa-install-ready'));});}catch(err){}})();",
          }}
        />
        <AppUIProvider>
          {children}
          <MobileBottomNav />
          <ServiceWorkerRegister />
        </AppUIProvider>
      </body>
    </html>
  );
}
