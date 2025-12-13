import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

export const metadata: Metadata = {
  title: "Fleet Management System",
  description: "B2B Fleet Management Group Project - Complete fleet management solution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <SessionProviderWrapper>
          <AuthProvider>
            {children}
          </AuthProvider>
        </SessionProviderWrapper>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
