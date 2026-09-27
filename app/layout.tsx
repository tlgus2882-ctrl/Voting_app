import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "투표",
  description: "질문에 하나를 골라 투표하고 결과를 확인하세요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <header className="border-b border-zinc-200 dark:border-zinc-800">
          <nav className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-semibold">
              투표
            </Link>
            <Link
              href="/operator"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              운영자
            </Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-zinc-200 dark:border-zinc-800">
          <p className="mx-auto max-w-2xl px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            제작: 박시현
          </p>
        </footer>
      </body>
    </html>
  );
}
