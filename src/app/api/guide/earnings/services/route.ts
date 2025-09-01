import { NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSessionServer();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is a guide
  if (session.role !== "guide") {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Find guide profile
  const guide = Array.from(db.guides.values()).find(g => g.userId === session.userId);
  if (!guide) {
    return NextResponse.json({ error: "Guide profile not found" }, { status: 404 });
  }

  // Get completed orders for this guide
  const completedOrders = Array.from(db.orders.values())
    .filter(order => order.guideId === guide.id && order.status === "COMPLETED");

  // Group by service type
  const serviceStats: Record<string, { totalEarnings: number; orderCount: number }> = {};

  completedOrders.forEach(order => {
    if (!serviceStats[order.serviceCode]) {
      serviceStats[order.serviceCode] = { totalEarnings: 0, orderCount: 0 };
    }
    serviceStats[order.serviceCode].totalEarnings += order.amount;
    serviceStats[order.serviceCode].orderCount += 1;
  });

  // Service name mapping
  const serviceNames: Record<string, string> = {
    daily: "日常陪伴",
    mild_entertainment: "微醺娱乐",
    local_tour: "同城旅游"
  };

  // Convert to array format
  const result = Object.entries(serviceStats).map(([serviceCode, stats]) => ({
    serviceCode,
    serviceName: serviceNames[serviceCode] || serviceCode,
    totalEarnings: stats.totalEarnings,
    orderCount: stats.orderCount,
    averagePrice: stats.orderCount > 0 ? stats.totalEarnings / stats.orderCount : 0
  })).sort((a, b) => b.totalEarnings - a.totalEarnings);

  return NextResponse.json({ items: result });
}
