import type { Metadata } from "next";
import { DM_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Stedtio.ai - All-in-One AI Workspace for Modern Editors",
  description: "The complete AI-powered workspace for writers, caption creators, and video editors. Create blog scripts, viral captions, and edit videos in seconds.",
  keywords: "video editing AI, AI content writer, caption generator, viral captions, automatic subtitles, AI editor",
  authors: [{ name: "Stedtio.ai Team" }],
  openGraph: {
    title: "Stedtio.ai - All-in-One AI Workspace for Modern Editors",
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
      className={`${dmSans.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-text-primary">
        {children}
      </body>
    </html>
  );
}
