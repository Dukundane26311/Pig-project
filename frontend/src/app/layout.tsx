import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Pig Project Revolving Fund | Value Protocols Rwanda",
    template: "%s | Pig Project Revolving Fund",
  },
  description:
    "One Piglet. One Family. A Fund That Keeps Moving. — Value Protocols Rwanda empowers vulnerable families through a sustainable pig revolving fund.",
  keywords: ["Rwanda", "NGO", "revolving fund", "pigs", "poverty alleviation"],
  openGraph: {
    title: "Pig Project Revolving Fund",
    description: "One Piglet. One Family. A Fund That Keeps Moving.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
