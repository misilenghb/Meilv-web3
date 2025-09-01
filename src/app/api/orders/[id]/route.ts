import { NextRequest, NextResponse } from "next/server";
import { SupabaseHelper } from "@/lib/supabase";
import { getSessionServer } from "@/lib/session";
import type { OrderStatus } from "@/types/domain";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  // 添加权限验证
  const session = await getSessionServer();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const { data: order, error } = await SupabaseHelper.getOrderById(id);

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // 验证订单所有者或管理员权限
  if (order.user_id !== session.userId && session.role !== 'admin') {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 将数据库格式转换为前端期望的格式
  const frontendOrder = {
    id: order.id,
    userId: order.user_id,
    guideId: order.guide_id,
    requirement: {
      serviceType: order.service_type,
      startTime: order.start_time,
      duration: order.duration_hours,
      area: order.location?.split(' ')[0] || '',
      address: order.location?.split(' ').slice(1).join(' ') || order.location || '',
      specialRequests: order.notes || ''
    },
    depositAmount: 200, // 固定保证金金额
    totalAmount: order.total_amount,
    finalAmount: order.total_amount ? order.total_amount - 200 : 0, // 总金额减去保证金
    status: order.status,
    createdAt: order.created_at,
    updatedAt: order.updated_at
  };

  return NextResponse.json(frontendOrder);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const { data: existingOrder, error: fetchError } = await SupabaseHelper.getOrderById(id);
  if (fetchError || !existingOrder) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const { status, guideId } = await req.json();

  const allowed: OrderStatus[] = [
    "DRAFT",
    "GUIDE_SELECTED",
    "PAYMENT_PENDING",
    "PAID",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "REFUNDED",
  ];

  if (status && !allowed.includes(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  const updates: any = {};

  if (status) {
    updates.status = status;

    // 设置相应的时间戳
    if (status === "GUIDE_SELECTED" && guideId) {
      updates.guide_id = guideId;
      updates.guide_selected_at = new Date().toISOString();
    } else if (status === "CONFIRMED") {
      updates.confirmed_at = new Date().toISOString();
    } else if (status === "PAID") {
      updates.payment_collected_at = new Date().toISOString();
    } else if (status === "IN_PROGRESS") {
      updates.started_at = new Date().toISOString();
    } else if (status === "COMPLETED") {
      updates.completed_at = new Date().toISOString();
    }
  }

  const { data: updatedOrder, error } = await SupabaseHelper.updateOrder(id, updates);

  if (error) {
    console.error("Update order error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }

  return NextResponse.json(updatedOrder);
}

