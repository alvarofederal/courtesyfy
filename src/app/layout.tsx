// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionAuthProvider } from "@/components/session-auth";
import { QueryClientContext } from "@/providers/queryclient";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BaseMedical",
  description: "Plataforma de Agendamentos OnLine",
  robots: "index, follow, nocache",
  openGraph: {
    title: "BaseMedical",
    description: "Plataforma de Agendamentos OnLine",
    images: [
      {
        url: "http://localhost:3000/logo-odonto.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BaseMedical",
    description: "Plataforma de Agendamentos OnLine",
    images: ["http://localhost:3000/logo-odonto.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <SessionAuthProvider>
          <QueryClientContext>
            {children}
            <Toaster position="top-right" richColors duration={2500} />
          </QueryClientContext>
        </SessionAuthProvider>
      </body>
    </html>
  );
}