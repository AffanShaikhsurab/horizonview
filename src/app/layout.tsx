import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/providers/query-provider";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Horizon OS - Life Vision Dashboard",
  description: "A personal dashboard to visualize your life missions, projects, and focus budget",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.variable}>
          <AuthProvider>
            <Providers>
              {children}
            </Providers>
          </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}


