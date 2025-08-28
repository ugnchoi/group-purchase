import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const AnalyticsInput = z.object({
  event: z.enum(["page_view", "order_submitted", "notify_submitted"]),
  timestamp: z.number(),
  sessionId: z.string(),
  campaignId: z.string().optional(),
  serviceType: z.string().optional(),
  buildingName: z.string().optional(),
  userAgent: z.string().optional(),
  referrer: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = AnalyticsInput.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Store analytics event
    await prisma.analyticsEvent.create({
      data: {
        event: data.event,
        timestamp: new Date(data.timestamp),
        sessionId: data.sessionId,
        campaignId: data.campaignId,
        serviceType: data.serviceType,
        buildingName: data.buildingName,
        userAgent: data.userAgent,
        referrer: data.referrer,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
