import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function debugOrder() {
  try {
    console.log("🔍 Debugging Order API...");

    // Test building lookup
    const building = await prisma.building.findUnique({
      where: { name: "헬리오시티" },
    });
    console.log("Building found:", building);

    if (building) {
      // Test campaign lookup
      const campaign = await prisma.campaign.findFirst({
        where: {
          buildingId: building.id,
          service: "유리청소",
        },
      });
      console.log("Campaign found:", campaign);

      if (campaign) {
        // Test order creation
        const order = await prisma.order.create({
          data: {
            name: "테스트",
            phone: "01012345678",
            serviceType: "유리청소",
            consent: true,
            campaignId: campaign.id,
            unit: "101동",
          },
        });
        console.log("Order created:", order);

        // Update campaign
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { currentOrders: { increment: 1 } },
        });
        console.log("Campaign updated");
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugOrder();
