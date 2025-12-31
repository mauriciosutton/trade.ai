import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "trade.ai",
  description: "Visualize AI-detected business problems from Reddit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


