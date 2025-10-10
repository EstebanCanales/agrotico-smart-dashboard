import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import RootLayoutClient from "./RootLayoutClient";
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agrotico Smart Dashboard",
  description: "Sistema de Monitoreo Agrícola Inteligente",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <SessionProviderWrapper>
          <RootLayoutClient>{children}</RootLayoutClient>
          <Toaster />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
