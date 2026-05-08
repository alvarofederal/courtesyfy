// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Open_Sans } from "next/font/google";
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

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Courtesyfy",
  description: "Gestão de campanhas com chaves únicas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} ${openSans.variable} antialiased`}
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