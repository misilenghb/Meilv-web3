import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionServer } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    // 检查管理员权限
    const session = await getSessionServer();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "权限不足" }, { status: 403 });
    }

    // 获取所有订单
    const { data: allOrders, error } = await supabaseAdmin
      .from('orders')
      .select('*');

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "获取订单数据失败" }, { status: 500 });
    }

    // 计算统计数据
    const stats = {
      total: allOrders?.length || 0,
      pendingPayment: allOrders?.filter(o => o.payment_status === "pending").length || 0,
      paid: allOrders?.filter(o => o.payment_status === "paid").length || 0,
      inProgress: allOrders?.filter(o => o.status === "in_progress").length || 0,
      completed: allOrders?.filter(o => o.status === "completed").length || 0,
      pendingAmount: allOrders
        ?.filter(o => o.payment_status === "pending")
        .reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
      todayRevenue: calculateTodayRevenue(allOrders || []),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Failed to get order stats:", error);
    return NextResponse.json(
      { error: "获取订单统计失败" },
      { status: 500 }
    );
  }
}

function calculateTodayRevenue(orders: any[]): number {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  return orders
    .filter(order => {
      // 只计算已收款的订单
      if (order.payment_status !== "paid") return false;

      // 使用updated_at作为收款时间（收款时会更新这个字段）
      const paidAt = order.updated_at;
      if (!paidAt) return false;

      const paidDate = new Date(paidAt);
      return paidDate >= todayStart && paidDate < todayEnd;
    })
    .reduce((sum, order) => sum + (order.total_amount || 0), 0);
}
