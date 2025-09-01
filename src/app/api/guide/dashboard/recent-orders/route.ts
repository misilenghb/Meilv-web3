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

  // Get guide's orders
  const guideOrders = Array.from(db.orders.values())
    .filter(order => order.guideId === guide.id)
    .map(order => {
      // Get user info
      const user = db.users.get(order.userId);
      return {
        id: order.id,
        userId: order.userId,
        userName: user?.name || "未知用户",
        serviceCode: order.serviceCode,
        amount: order.amount,
        status: order.status,
        createdAt: order.createdAt,
      };
    });

  // Sort by creation date (most recent first)
  guideOrders.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json({ items: guideOrders });
}
