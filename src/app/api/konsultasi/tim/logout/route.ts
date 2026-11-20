import { cookies } from "next/headers";
import { jsonNoStore } from "@/lib/konsultasi/api-helpers";
import { NAMA_COOKIE_TIM } from "@/lib/konsultasi/tim-auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(NAMA_COOKIE_TIM);
  return jsonNoStore({ ok: true });
}
