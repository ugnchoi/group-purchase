import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const OrderInput = z.object({
  name: z.string().min(1),
  phone: z.string().min(8),
  service: z.string(),
  address: z.string(),
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = OrderInput.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, phone, service, address } = parsed.data;

  // For now, create a simple order record
  // In a real app, you'd want to create/find campaigns and buildings
  const order = await prisma.order.create({
    data: {
      name,
      phone,
      consent: true, // Assume consent since user submitted
      campaignId: "temp-campaign", // We'll need to handle this properly
    },
  });

  return NextResponse.json({ ok: true, orderId: order.id });
}
