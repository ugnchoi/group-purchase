import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const NotifyInput = z.object({
  phone: z.string().min(8),
  service: z.string(),
  address: z.string(),
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const data = NotifyInput.parse(json);
  await prisma.subscriber.upsert({
    where: { phone: data.phone },
    update: { building: data.address },
    create: {
      phone: data.phone,
      building: data.address,
    },
  });
  return NextResponse.json({ ok: true });
}
