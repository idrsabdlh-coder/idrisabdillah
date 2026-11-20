import type { Metadata } from "next";
import type { ReactNode } from "react";
import KonsultasiClientShell from "@/components/konsultasi/KonsultasiClientShell";

export const metadata: Metadata = {
  title: "Konsultasi Website: Idris Abdillah",
  description: "Formulir konsultasi dan kuesioner pembuatan website.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function KonsultasiLayout({ children }: { children: ReactNode }) {
  return <KonsultasiClientShell>{children}</KonsultasiClientShell>;
}
