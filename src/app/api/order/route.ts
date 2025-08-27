import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const OrderInput = z.object({
  name: z.string().min(1),
  phone: z.string().min(8),
  campaignId: z.string(),
  unit: z.string().optional(),
  consent: z.boolean(),
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

  const { campaignId, ...rest } = parsed.data;
  const order = await prisma.order.create({ data: { ...rest, campaignId } });
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { currentOrders: { increment: 1 } },
  });

  return NextResponse.json({ ok: true, orderId: order.id });
}
