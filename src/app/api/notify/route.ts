import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const NotifyInput = z.object({
  phone: z.string().min(8),
  service: z.string(),
  address: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = NotifyInput.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    await prisma.subscriber.upsert({
      where: { phone: data.phone },
      update: { building: data.address },
      create: {
        phone: data.phone,
        building: data.address,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Notify API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
