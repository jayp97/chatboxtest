/**
 * Root Layout Component
 * Defines the global layout structure and typography for the geography chatbot application
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Configure Geist Sans font for primary typography
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Configure Geist Mono font for terminal-style text
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Application metadata for SEO and branding
export const metadata: Metadata = {
  title: "GEOSYS Terminal - Geography Intelligence System",
  description: "Interactive geography chatbot with retro terminal interface and 3D globe visualisation",
};

/**
 * Root Layout
 * Provides the HTML structure with font variables and language settings
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
