import { redirect } from "next/navigation";
import TimDetailBrief from "@/components/konsultasi/TimDetailBrief";
import { ambilSesiTim } from "@/lib/konsultasi/tim-auth";

export default async function TimDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const sesi = await ambilSesiTim();
  if (!sesi) {
    redirect("/konsultasi/tim");
  }
  const { id } = await params;
  return <TimDetailBrief id={Number(id)} />;
}
