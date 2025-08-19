import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SmartNavbar from "@/components/SmartNavbar";
import SessionProvider from "@/components/SessionProvider";
import { auth } from "@/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JobTracker Pro - Advanced Job Search & Application Management",
  description: "Find your next career opportunity with comprehensive job search across multiple companies, locations, and criteria. Track applications, manage interview status, and organize your job hunt efficiently.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={session}>
          <div className="min-h-screen bg-gray-50">
            <SmartNavbar />
            <main className="container mx-auto px-4 py-8">{children}</main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
