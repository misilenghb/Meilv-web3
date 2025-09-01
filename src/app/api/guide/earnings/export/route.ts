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
  const format = searchParams.get("format") || "excel";
  const range = searchParams.get("range") || "month";

  // Get completed orders for this guide
  const completedOrders = Array.from(db.orders.values())
    .filter(order => order.guideId === guide.id && order.status === "COMPLETED")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  // Calculate date range
  const now = new Date();
  let startDate: Date;

  switch (range) {
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "year":
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    default: // month
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Filter orders by date range
  const filteredOrders = completedOrders.filter(order => 
    new Date(order.updatedAt) >= startDate
  );

  // Enrich with user information
  const enrichedOrders = filteredOrders.map(order => {
    const user = db.users.get(order.userId);
    return {
      ...order,
      userName: user?.name || "未知用户",
    };
  });

  // Calculate summary statistics
  const totalEarnings = enrichedOrders.reduce((sum, order) => sum + order.amount, 0);
  const orderCount = enrichedOrders.length;
  const averageOrderValue = orderCount > 0 ? totalEarnings / orderCount : 0;

  // Service statistics
  const serviceStats = enrichedOrders.reduce((acc, order) => {
    if (!acc[order.serviceCode]) {
      acc[order.serviceCode] = { count: 0, earnings: 0 };
    }
    acc[order.serviceCode].count += 1;
    acc[order.serviceCode].earnings += order.amount;
    return acc;
  }, {} as Record<string, { count: number; earnings: number }>);

  const serviceNames: Record<string, string> = {
    daily: "日常陪伴",
    mild_entertainment: "微醺娱乐",
    local_tour: "同城旅游"
  };

  if (format === "excel") {
    // Create CSV content for Excel
    const headers = [
      "完成时间",
      "订单号",
      "客户姓名",
      "服务类型", 
      "订单金额"
    ];

    const csvRows = [
      // Summary section
      "收入统计报告",
      `报告时间范围: ${range === 'week' ? '最近7天' : range === 'month' ? '最近30天' : '最近12个月'}`,
      `生成时间: ${new Date().toLocaleString("zh-CN")}`,
      "",
      `总收入: ¥${totalEarnings.toLocaleString()}`,
      `订单数量: ${orderCount}`,
      `平均订单价值: ¥${averageOrderValue.toFixed(2)}`,
      "",
      "服务类型统计:",
      ...Object.entries(serviceStats).map(([code, stats]) => 
        `${serviceNames[code] || code}: ${stats.count}单, ¥${stats.earnings.toLocaleString()}`
      ),
      "",
      "详细订单列表:",
      headers.join(","),
      ...enrichedOrders.map(order => [
        new Date(order.updatedAt).toLocaleString("zh-CN"),
        order.id,
        order.userName,
        serviceNames[order.serviceCode] || order.serviceCode,
        order.amount
      ].map(field => `"${field}"`).join(","))
    ];

    const csvContent = csvRows.join("\n");
    
    // Add BOM for proper UTF-8 encoding in Excel
    const bom = "\uFEFF";
    const csvWithBom = bom + csvContent;

    return new NextResponse(csvWithBom, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="earnings-${range}-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } else {
    // For PDF format, return JSON data that frontend can use to generate PDF
    return NextResponse.json({
      summary: {
        totalEarnings,
        orderCount,
        averageOrderValue,
        range,
        generatedAt: new Date().toISOString()
      },
      serviceStats: Object.entries(serviceStats).map(([code, stats]) => ({
        serviceName: serviceNames[code] || code,
        orderCount: stats.count,
        totalEarnings: stats.earnings,
        averagePrice: stats.count > 0 ? stats.earnings / stats.count : 0
      })),
      orders: enrichedOrders.map(order => ({
        completedAt: order.updatedAt,
        orderId: order.id,
        customerName: order.userName,
        serviceType: serviceNames[order.serviceCode] || order.serviceCode,
        amount: order.amount
      }))
    });
  }
}
