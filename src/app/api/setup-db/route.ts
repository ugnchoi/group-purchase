import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Create 헬리오시티 building
    const helioCity = await prisma.building.upsert({
      where: { name: "헬리오시티" },
      update: {},
      create: {
        name: "헬리오시티",
        address: "서울특별시 강남구",
      },
    });

    // Create 양평벽산블루밍 building
    const yangpyeongBlue = await prisma.building.upsert({
      where: { name: "양평벽산블루밍" },
      update: {},
      create: {
        name: "양평벽산블루밍",
        address: "서울특별시 양평구",
      },
    });

    // Create campaigns for each building
    const helioCampaigns = await Promise.all([
      prisma.campaign.upsert({
        where: { id: "helio-glass-cleaning" },
        update: {},
        create: {
          id: "helio-glass-cleaning",
          service: "유리청소",
          minOrders: 20,
          currentOrders: 0,
          buildingId: helioCity.id,
        },
      }),
      prisma.campaign.upsert({
        where: { id: "helio-mosquito-net" },
        update: {},
        create: {
          id: "helio-mosquito-net",
          service: "방충망 보수",
          minOrders: 15,
          currentOrders: 0,
          buildingId: helioCity.id,
        },
      }),
      prisma.campaign.upsert({
        where: { id: "helio-ac-cleaning" },
        update: {},
        create: {
          id: "helio-ac-cleaning",
          service: "에어컨 청소",
          minOrders: 25,
          currentOrders: 0,
          buildingId: helioCity.id,
        },
      }),
    ]);

    const yangpyeongCampaigns = await Promise.all([
      prisma.campaign.upsert({
        where: { id: "yangpyeong-glass-cleaning" },
        update: {},
        create: {
          id: "yangpyeong-glass-cleaning",
          service: "유리청소",
          minOrders: 20,
          currentOrders: 0,
          buildingId: yangpyeongBlue.id,
        },
      }),
      prisma.campaign.upsert({
        where: { id: "yangpyeong-mosquito-net" },
        update: {},
        create: {
          id: "yangpyeong-mosquito-net",
          service: "방충망 보수",
          minOrders: 15,
          currentOrders: 0,
          buildingId: yangpyeongBlue.id,
        },
      }),
      prisma.campaign.upsert({
        where: { id: "yangpyeong-ac-cleaning" },
        update: {},
        create: {
          id: "yangpyeong-ac-cleaning",
          service: "에어컨 청소",
          minOrders: 25,
          currentOrders: 0,
          buildingId: yangpyeongBlue.id,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Database setup complete!",
      buildings: {
        helioCity: helioCity.name,
        yangpyeongBlue: yangpyeongBlue.name,
      },
      campaigns: {
        helioCity: helioCampaigns.map((c) => c.service),
        yangpyeongBlue: yangpyeongCampaigns.map((c) => c.service),
      },
    });
  } catch (error) {
    console.error("Database setup error:", error);
    return NextResponse.json(
      { error: "Database setup failed", details: error },
      { status: 500 },
    );
  }
}
