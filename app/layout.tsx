import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Edito.ai - All-in-One AI Workspace for Modern Editors",
  description: "The complete AI-powered workspace for writers, caption creators, and video editors. Create blog scripts, viral captions, and edit videos in seconds.",
  keywords: "video editing AI, AI content writer, caption generator, viral captions, automatic subtitles, AI editor",
  authors: [{ name: "Edito.ai Team" }],
  openGraph: {
    title: "Edito.ai - All-in-One AI Workspace for Modern Editors",
    description: "The complete AI-powered workspace for writers, caption creators, and video editors.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-zinc-100 selection:bg-purple-500/30 selection:text-purple-200">
        {children}
      </body>
    </html>
  );
}
