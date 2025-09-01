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

  // Get all orders for this guide
  const orders = Array.from(db.orders.values())
    .filter(order => order.guideId === guide.id);

  const completedOrders = orders.filter(order => order.status === "COMPLETED");
  
  // Calculate date ranges
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Calculate earnings
  const totalEarnings = completedOrders.reduce((sum, order) => sum + order.amount, 0);
  
  const monthlyEarnings = completedOrders
    .filter(order => new Date(order.updatedAt) >= startOfMonth)
    .reduce((sum, order) => sum + order.amount, 0);
    
  const weeklyEarnings = completedOrders
    .filter(order => new Date(order.updatedAt) >= startOfWeek)
    .reduce((sum, order) => sum + order.amount, 0);
    
  const dailyEarnings = completedOrders
    .filter(order => new Date(order.updatedAt) >= startOfDay)
    .reduce((sum, order) => sum + order.amount, 0);

  // Calculate average order value
  const averageOrderValue = completedOrders.length > 0 
    ? totalEarnings / completedOrders.length 
    : 0;

  // Find top service
  const serviceStats = completedOrders.reduce((acc, order) => {
    acc[order.serviceCode] = (acc[order.serviceCode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topService = Object.entries(serviceStats)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || "暂无";

  const serviceNames: Record<string, string> = {
    daily: "日常陪伴",
    mild_entertainment: "微醺娱乐",
    local_tour: "同城旅游"
  };

  return NextResponse.json({
    totalEarnings,
    monthlyEarnings,
    weeklyEarnings,
    dailyEarnings,
    totalOrders: orders.length,
    completedOrders: completedOrders.length,
    averageOrderValue,
    topService: serviceNames[topService] || topService
  });
}
