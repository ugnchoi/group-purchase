import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const OrderInput = z.object({
  name: z.string().min(1),
  phone: z.string().min(8),
  campaignId: z.string().min(1),
  unit: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = OrderInput.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { name, phone, campaignId, unit } = parsed.data;

    // Clean phone number (remove non-numeric characters)
    const cleanPhone = phone.replace(/[^0-9]/g, "");

    // Find the campaign
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

    // Create the order
    const order = await prisma.order.create({
      data: {
        name,
        phone: cleanPhone,
        serviceType: campaign.service,
        consent: true, // Assume consent since user submitted
        campaignId: campaign.id,
        unit,
      },
    });

    // Update campaign order count
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { currentOrders: { increment: 1 } },
    });

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      campaignId: campaign.id,
      currentOrders: campaign.currentOrders + 1,
    });
  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
