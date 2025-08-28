import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const NotifyInput = z.object({
  phone: z.string().min(8),
  campaignId: z.string().min(1),
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

    const { phone, campaignId } = parsed.data;

    // Clean phone number (remove non-numeric characters)
    const cleanPhone = phone.replace(/[^0-9]/g, "");

    // Find the campaign to get building info
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { building: true },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }

    await prisma.subscriber.upsert({
      where: { phone: cleanPhone },
      update: { building: campaign.building.name },
      create: {
        phone: cleanPhone,
        building: campaign.building.name,
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
