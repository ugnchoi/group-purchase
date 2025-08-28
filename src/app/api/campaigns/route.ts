import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const CampaignQuery = z.object({
  buildingName: z.enum(["헬리오시티", "양평벽산블루밍"]),
  serviceType: z.enum(["유리청소", "방충망 보수", "에어컨 청소"]),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const buildingName = searchParams.get("buildingName");
    const serviceType = searchParams.get("serviceType");

    const parsed = CampaignQuery.safeParse({ buildingName, serviceType });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { buildingName: building, serviceType: service } = parsed.data;

    // Find the building
    const buildingRecord = await prisma.building.findUnique({
      where: { name: building },
    });

    if (!buildingRecord) {
      return NextResponse.json(
        { error: "Building not found" },
        { status: 404 },
      );
    }

    // Generate campaign ID (same logic as in order API)
    const campaignId = `${building === "헬리오시티" ? "helio" : "yangpyeong"}-${service === "유리청소" ? "glass-cleaning" : service === "방충망 보수" ? "mosquito-net" : "ac-cleaning"}`;

    // Find or create the campaign
    const campaign = await prisma.campaign.upsert({
      where: { id: campaignId },
      update: {},
      create: {
        id: campaignId,
        service,
        minOrders:
          service === "유리청소" ? 20 : service === "방충망 보수" ? 15 : 25,
        currentOrders: 0,
        buildingId: buildingRecord.id,
      },
    });

    return NextResponse.json({
      campaignId: campaign.id,
      service: campaign.service,
      minOrders: campaign.minOrders,
      currentOrders: campaign.currentOrders,
      buildingName: building,
    });
  } catch (error) {
    console.error("Campaign API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
