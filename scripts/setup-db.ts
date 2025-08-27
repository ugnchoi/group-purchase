import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
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

  // Create campaigns for each building with different services
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

  console.log("Database setup complete!");
  console.log("Buildings created:");
  console.log("- 헬리오시티:", helioCity.id);
  console.log("- 양평벽산블루밍:", yangpyeongBlue.id);
  console.log("Campaigns created:");
  console.log(
    "헬리오시티 campaigns:",
    helioCampaigns.map((c: any) => c.service),
  );
  console.log(
    "양평벽산블루밍 campaigns:",
    yangpyeongCampaigns.map((c: any) => c.service),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
