import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/SupabaseAuthContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import { MobileContainer } from "@/components/layout/ResponsiveLayout";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata: Metadata = {
  title: "Journey - Bible Devotional App",
  description: "A Bible devotional app with reading plans, community, and gamification",
  keywords: ["bible", "devotional", "christian", "reading plans", "community", "gamification"],
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <UserDataProvider>
              <MobileContainer>
                {children}
              </MobileContainer>
            </UserDataProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
