import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Receipt Scanner",
  description: "AI-powered receipt scanning and expense categorization for freelancers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-neutral-50 text-neutral-900">{children}</body>
    </html>
  );
}
