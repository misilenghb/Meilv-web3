import { NextRequest, NextResponse } from "next/server";
import { SupabaseHelper } from "@/lib/supabase";
import { getSessionServer } from "@/lib/session";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSessionServer();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: orderId } = await context.params;

  // 获取订单
  const { data: order, error: orderError } = await SupabaseHelper.getOrderById(orderId);
  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // 验证订单状态 - 人工收款模式下从PAID状态开始服务
  if (order.status !== "PAID") {
    return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
  }

  // 验证订单所有者
  if (order.user_id !== session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // 更新订单状态为进行中
  const updates = {
    status: "IN_PROGRESS",
    started_at: new Date().toISOString()
  };

  const { data: updatedOrder, error: updateError } = await SupabaseHelper.updateOrder(orderId, updates);

  if (updateError) {
    console.error("Update order error:", updateError);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }

  return NextResponse.json(updatedOrder);
}
