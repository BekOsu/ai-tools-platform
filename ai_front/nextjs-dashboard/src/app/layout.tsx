"use client";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>AI Tools Platform</title>
        <meta name="description" content="Access powerful AI features and tools to enhance your productivity and creativity." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-white text-gray-900">
        <ErrorBoundary>
          <SessionProvider>
            <AuthProvider>
              <div className="flex h-screen">
              {/* Sidebar */}
              <Sidebar />

              {/* Main Content */}
              <div className="flex flex-col flex-1">
                <TopNav />
                <main className="flex-1 p-6 overflow-y-auto">
                  <ErrorBoundary>
                    {children}
                  </ErrorBoundary>
                </main>
                <Footer />
              </div>
            </div>
            </AuthProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
