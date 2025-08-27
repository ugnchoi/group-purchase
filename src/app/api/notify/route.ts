import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const NotifyInput = z.object({
  phone: z.string().min(8),
  serviceType: z.enum(["유리청소", "방충망 보수", "에어컨 청소"]),
  buildingName: z.enum(["헬리오시티", "양평벽산블루밍"]),
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

    // Clean phone number (remove non-numeric characters)
    const cleanPhone = data.phone.replace(/[^0-9]/g, "");

    await prisma.subscriber.upsert({
      where: { phone: cleanPhone },
      update: { building: data.buildingName },
      create: {
        phone: cleanPhone,
        building: data.buildingName,
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
