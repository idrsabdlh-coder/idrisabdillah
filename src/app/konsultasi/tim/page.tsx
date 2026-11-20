import TimDashboard from "@/components/konsultasi/TimDashboard";
import { ambilSesiTim } from "@/lib/konsultasi/tim-auth";

export default async function TimPage() {
  const sesi = await ambilSesiTim();
  return <TimDashboard sudahLoginAwal={Boolean(sesi)} />;
}
