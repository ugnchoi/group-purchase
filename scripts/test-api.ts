import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testDatabase() {
  console.log("🧪 Testing Database Connection...");

  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connection successful");

    // Check buildings
    const buildings = await prisma.building.findMany();
    console.log(`✅ Found ${buildings.length} buildings:`);
    buildings.forEach((building) => {
      console.log(`  - ${building.name} (${building.address})`);
    });

    // Check campaigns
    const campaigns = await prisma.campaign.findMany({
      include: { building: true },
    });
    console.log(`✅ Found ${campaigns.length} campaigns:`);
    campaigns.forEach((campaign) => {
      console.log(
        `  - ${campaign.building.name}: ${campaign.service} (${campaign.currentOrders}/${campaign.minOrders})`,
      );
    });

    // Check recent orders
    const orders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    console.log(`✅ Found ${orders.length} recent orders`);
    orders.forEach((order, index) => {
      console.log(
        `  ${index + 1}. ${order.name} - ${order.phone} (${order.createdAt.toISOString()})`,
      );
    });

    // Check subscribers
    const subscribers = await prisma.subscriber.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    console.log(`✅ Found ${subscribers.length} subscribers`);
    subscribers.forEach((sub, index) => {
      console.log(
        `  ${index + 1}. ${sub.phone} - ${sub.building || "N/A"} (${sub.createdAt.toISOString()})`,
      );
    });
  } catch (error) {
    console.error("❌ Database test failed:", error);
  }
}

async function testAPIEndpoints() {
  console.log("\n🧪 Testing API Endpoints...");

  const baseUrl = "http://localhost:3000";

  // Test order API
  try {
    const orderResponse = await fetch(`${baseUrl}/api/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "테스트 사용자",
        phone: "010-9999-8888",
        serviceType: "유리청소",
        buildingName: "헬리오시티",
        unit: "101동",
      }),
    });

    const orderResult = await orderResponse.json();

    if (orderResponse.ok) {
      console.log("✅ Order API working:", orderResult);
    } else {
      console.log("❌ Order API failed:", orderResult);
    }
  } catch (error) {
    console.error("❌ Order API error:", error);
  }

  // Test notify API
  try {
    const notifyResponse = await fetch(`${baseUrl}/api/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: "010-7777-6666",
        serviceType: "방충망 보수",
        buildingName: "양평벽산블루밍",
      }),
    });

    const notifyResult = await notifyResponse.json();

    if (notifyResponse.ok) {
      console.log("✅ Notify API working:", notifyResult);
    } else {
      console.log("❌ Notify API failed:", notifyResult);
    }
  } catch (error) {
    console.error("❌ Notify API error:", error);
  }

  // Test validation
  try {
    const invalidResponse = await fetch(`${baseUrl}/api/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "",
        phone: "123",
        service: "",
        address: "",
      }),
    });

    const invalidResult = await invalidResponse.json();

    if (invalidResponse.status === 400) {
      console.log("✅ Validation working:", invalidResult.error);
    } else {
      console.log("❌ Validation failed:", invalidResult);
    }
  } catch (error) {
    console.error("❌ Validation test error:", error);
  }
}

async function main() {
  console.log("🚀 Starting Backend Tests...\n");

  await testDatabase();
  await testAPIEndpoints();

  console.log("\n✅ All tests completed!");

  await prisma.$disconnect();
}

main().catch(console.error);
