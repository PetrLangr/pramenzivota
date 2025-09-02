import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rezervace | Pramen života s.r.o.",
  description: "Rezervační systém pro centrum energetické rovnováhy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css" 
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen main-gradient">
          {children}
        </div>
      </body>
    </html>
  );
}
