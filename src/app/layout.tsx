import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NavWrapper from "@/components/NavWrapper";
import BottomNavWrapper from "@/components/BottomNavWrapper";
import { ToastProvider } from "@/components/ui";
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
  title: "美旅地陪服务平台",
  description: "健康社交 · 地陪服务 · 旅行陪伴",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <NavWrapper />
          <main className="pb-20 md:pb-0">
            {children}
          </main>
          <footer className="glass mt-8 mb-6 mx-auto max-w-5xl rounded-xl py-3 px-4 text-[11px] md:text-xs text-gray-300 mb-20 md:mb-6">
            © {new Date().getFullYear()} 美旅 · 健康社交定位
          </footer>
          <BottomNavWrapper />
        </ToastProvider>
      </body>
    </html>
  );
}
