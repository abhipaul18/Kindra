import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/src/index.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "KINDRA — Civic Engagement Platform",
  description: "Together We Act. Together We Build.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background text-on-surface min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
