import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreInitializer } from "@/components/StoreInitializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Digital Dental Lab Platform",
  description: "Advanced SaaS for dental case management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50/50`}>
        <StoreInitializer />
        {children}
      </body>
    </html>
  );
}
