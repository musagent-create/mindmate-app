import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MindMate — Din samtalepartner",
  description: "AI-samtalepartner for ældre med demens",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
