import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Signal Lab",
  description: "Platform foundation frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <header className="w-full border-b border-border bg-card">
              <div className="flex w-full items-center px-4 py-3">
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Signal Lab
                </p>
              </div>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="w-full border-t border-border bg-card">
              <div className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-4 text-sm text-muted-foreground">
                <span>Copyright © 2026</span>
                <span>tg @garik_sukhanov 2026</span>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
