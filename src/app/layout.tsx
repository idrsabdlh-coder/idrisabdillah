import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Idris Abdillah — Portofolio",
  description: "Portofolio Idris Abdillah, Software Developer",
};

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