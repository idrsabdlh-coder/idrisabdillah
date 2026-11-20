import KonsultasiWizard from "@/components/konsultasi/KonsultasiWizard";

export default async function KonsultasiTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <KonsultasiWizard token={token} />;
}
