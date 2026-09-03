import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Idris Abdillah - homepage",
  description: "Homepage",};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}