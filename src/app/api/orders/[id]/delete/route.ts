import { NextRequest, NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import { SupabaseHelper } from "@/lib/supabase";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 检查用户登录状态
    const session = await getSessionServer();
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { id: orderId } = await context.params;

    // 获取订单信息
    const { data: order, error: fetchError } = await SupabaseHelper.getOrderById(orderId);
    if (fetchError || !order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    // 验证订单所有者
    if (order.user_id !== session.userId) {
      return NextResponse.json({ error: "无权限删除此订单" }, { status: 403 });
    }

    // 检查订单状态 - 只允许删除未支付保证金的订单
    // 支持大小写状态，确保兼容性
    const deletableStatuses = [
      // 小写状态（当前数据库中的实际状态）
      'pending', 'confirmed',
      // 大写状态（新系统状态，向前兼容）
      'DRAFT', 'GUIDE_SELECTED', 'DEPOSIT_PENDING'
    ];

    if (!deletableStatuses.includes(order.status)) {
      return NextResponse.json({
        error: "只能删除未支付保证金的订单",
        currentStatus: order.status,
        allowedStatuses: deletableStatuses
      }, { status: 400 });
    }

    // 删除订单
    const { error: deleteError } = await SupabaseHelper.deleteOrder(orderId);
    if (deleteError) {
      console.error("Delete order error:", deleteError);
      return NextResponse.json({ error: "删除订单失败" }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "订单删除成功",
      orderId: orderId 
    });

  } catch (error) {
    console.error("Delete order API error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
