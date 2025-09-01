import { NextRequest, NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
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

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "month";

  // Get completed orders for this guide
  const completedOrders = Array.from(db.orders.values())
    .filter(order => order.guideId === guide.id && order.status === "COMPLETED")
    .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());

  // Calculate date range
  const now = new Date();
  let startDate: Date;
  let groupBy: "day" | "week" | "month";

  switch (range) {
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupBy = "day";
      break;
    case "year":
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      groupBy = "month";
      break;
    default: // month
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      groupBy = "day";
  }

  // Filter orders by date range
  const filteredOrders = completedOrders.filter(order => 
    new Date(order.updatedAt) >= startDate
  );

  // Group orders by time period
  const groupedData: Record<string, { amount: number; orders: number }> = {};

  filteredOrders.forEach(order => {
    const date = new Date(order.updatedAt);
    let key: string;

    if (groupBy === "day") {
      key = date.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (groupBy === "week") {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else { // month
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    if (!groupedData[key]) {
      groupedData[key] = { amount: 0, orders: 0 };
    }
    groupedData[key].amount += order.amount;
    groupedData[key].orders += 1;
  });

  // Convert to array format
  const chartData = Object.entries(groupedData)
    .map(([date, data]) => ({
      date,
      amount: data.amount,
      orders: data.orders
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({ items: chartData });
}
