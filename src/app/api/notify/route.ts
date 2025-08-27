import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const NotifyInput = z.object({
  name: z.string().optional(),
  phone: z.string().min(8),
  building: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const data = NotifyInput.parse(json);
  await prisma.subscriber.upsert({
    where: { phone: data.phone },
    update: { name: data.name, building: data.building },
    create: data,
  });
  return NextResponse.json({ ok: true });
}
