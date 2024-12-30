import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import ChatInput from './components/ChatInput';
import PropertyPanel from './components/PropertyPanel';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GS3 - GenSaaS3",
  description: "Build creative SaaS UIs and API Workflows",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 flex">
            <div className="flex-1 flex flex-col">
              <div className="flex-1 p-4 overflow-auto">
                {children}
              </div>
              <ChatInput />
            </div>
            <PropertyPanel />
          </main>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
