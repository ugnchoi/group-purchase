import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create a temporary building
  const building = await prisma.building.upsert({
    where: { id: "temp-building" },
    update: {},
    create: {
      id: "temp-building",
      name: "Temporary Building",
      address: "Temporary Address",
    },
  });

  // Create a temporary campaign
  const campaign = await prisma.campaign.upsert({
    where: { id: "temp-campaign" },
    update: {},
    create: {
      id: "temp-campaign",
      service: "Temporary Service",
      minOrders: 20,
      currentOrders: 0,
      buildingId: building.id,
    },
  });

  console.log("Database setup complete!");
  console.log("Building:", building.id);
  console.log("Campaign:", campaign.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
