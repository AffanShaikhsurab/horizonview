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
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return (
      <html lang="en">
        <body className={inter.variable} style={{ 
          backgroundColor: '#050505', 
          color: '#ededed', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          margin: 0,
          fontFamily: 'var(--font-inter), sans-serif'
        }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h1 style={{ color: '#ef4444', marginBottom: '10px' }}>Configuration Error</h1>
            <p style={{ opacity: 0.7 }}>
              The Clerk Publishable Key is missing. Please set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in your environment variables.
            </p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
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


