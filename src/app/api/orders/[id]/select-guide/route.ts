import { NextRequest, NextResponse } from "next/server";
import { SupabaseHelper, supabaseAdmin } from "@/lib/supabase";
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
  const body = await req.json();
  const { guideId, totalAmount } = body;

  console.log("Select guide request body:", body);
  console.log("guideId:", guideId, "totalAmount:", totalAmount);

  if (!guideId || !totalAmount) {
    console.log("Missing required fields - guideId:", !!guideId, "totalAmount:", !!totalAmount);
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // 获取订单
  const { data: order, error: orderError } = await SupabaseHelper.getOrderById(orderId);
  console.log("Order lookup result:", { order, orderError });
  if (orderError || !order) {
    console.log("Order not found for ID:", orderId);
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // 验证订单状态 - 人工收款模式下从pending状态直接选择地陪 (updated)
  console.log("Order status:", order.status, "Expected: pending");
  if (order.status !== "pending") {
    console.log("Invalid order status:", order.status);
    return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
  }

  // 验证订单所有者
  console.log("Order user_id:", order.user_id, "Session userId:", session.userId);
  if (order.user_id !== session.userId) {
    console.log("Unauthorized access attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // 验证地陪存在 - 从真实数据库查询
  const { data: guide, error: guideError } = await supabaseAdmin
    .from('guides')
    .select(`
      id,
      user_id,
      display_name,
      hourly_rate,
      city,
      verification_status,
      is_active
    `)
    .eq('id', guideId)
    .eq('is_active', true)
    .eq('verification_status', 'verified')
    .single();

  if (guideError || !guide) {
    console.log("Guide not found for ID:", guideId, "Error:", guideError);
    return NextResponse.json({ error: "Guide not found" }, { status: 404 });
  }

  // 更新订单 - 正确保存地陪ID到数据库
  const updates = {
    guide_id: guideId, // 正确保存地陪ID
    hourly_rate: guide.hourly_rate, // 保存地陪时薪
    total_amount: totalAmount, // 保存总金额
    status: "confirmed", // 地陪已选择，等待收取保证金
    updated_at: new Date().toISOString(),
    notes: order.notes ? `${order.notes}\n地陪已选择: ${guide.display_name} (${guideId})` : `地陪已选择: ${guide.display_name} (${guideId})`
  };

  console.log("Updating order with:", updates);
  const { data: updatedOrder, error: updateError } = await SupabaseHelper.updateOrder(orderId, updates);

  if (updateError) {
    console.error("Update order error:", updateError);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }

  console.log("Order updated successfully:", updatedOrder);
  return NextResponse.json(updatedOrder);
}
