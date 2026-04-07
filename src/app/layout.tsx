import type { Metadata } from "next";
import { Hind_Siliguri, Poppins } from "next/font/google";
import { AppUIProvider } from "@/Components/AppUIProvider";
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

export const metadata: Metadata = {
  title: "Sadat Alam Protik",
  description: "Sadat Alam Protik's portfolio.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${hindSiliguri.variable} antialiased dark`}>
      <body className="flex min-h-screen flex-col">
        <AppUIProvider>{children}</AppUIProvider>
      </body>
    </html>
  );
}
