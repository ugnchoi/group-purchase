import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const OrderInput = z.object({
  name: z.string().min(1),
  phone: z.string().min(8),
  serviceType: z.enum(["유리청소", "방충망 보수", "에어컨 청소"]),
  buildingName: z.enum(["헬리오시티", "양평벽산블루밍"]),
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

    const { name, phone, serviceType, buildingName, unit } = parsed.data;

    // Clean phone number (remove non-numeric characters)
    const cleanPhone = phone.replace(/[^0-9]/g, "");

    // Find or create the building
    const building = await prisma.building.upsert({
      where: { name: buildingName },
      update: {},
      create: {
        name: buildingName,
        address:
          buildingName === "헬리오시티"
            ? "서울특별시 강남구"
            : "서울특별시 양평구",
      },
    });

    // Find or create the campaign for this building and service
    const campaignId = `${buildingName === "헬리오시티" ? "helio" : "yangpyeong"}-${serviceType === "유리청소" ? "glass-cleaning" : serviceType === "방충망 보수" ? "mosquito-net" : "ac-cleaning"}`;

    const campaign = await prisma.campaign.upsert({
      where: { id: campaignId },
      update: {},
      create: {
        id: campaignId,
        service: serviceType,
        minOrders:
          serviceType === "유리청소"
            ? 20
            : serviceType === "방충망 보수"
              ? 15
              : 25,
        currentOrders: 0,
        buildingId: building.id,
      },
    });

    // Create the order
    const order = await prisma.order.create({
      data: {
        name,
        phone: cleanPhone,
        serviceType,
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
