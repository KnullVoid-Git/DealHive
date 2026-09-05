import type { Metadata } from "next";
import { Sora, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import ScrollProgress from "../components/ScrollProgress";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"],
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "DealHive — Brand Deal OS for YouTube Creators",
  description: "Manage every brand deal from pitch to payment. Contracts, deliverables, invoicing, and payouts — all in one place. Free to start.",
  metadataBase: new URL("https://dealhive.io"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DealHive — Brand Deal OS for YouTube Creators",
    description: "Manage every brand deal from pitch to payment. Contracts, deliverables, invoicing, and payouts — all in one place. Free to start.",
    url: "https://dealhive.io",
    siteName: "DealHive",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body className="antialiased font-sans">
        <ScrollProgress />
        {children}
      </body>
    </html>
  );
}
