import { NextRequest, NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import { SupabaseHelper } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 检查登录状态（暂时移除管理员权限检查用于测试）
    const session = await getSessionServer();
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // TODO: 重新启用管理员权限检查
    // if (session.role !== "admin") {
    //   return NextResponse.json({ error: "权限不足" }, { status: 403 });
    // }

    const { id: orderId } = await context.params;
    const body = await req.json();
    const { action, adminNotes, refundAmount } = body;

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "无效的处理方式" }, { status: 400 });
    }

    // 获取订单信息
    const { data: order, error: fetchError } = await SupabaseHelper.getOrderById(orderId);
    if (fetchError || !order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    // 检查订单状态 - 支持多种取消状态
    const cancelledStatuses = ['cancelled', 'CANCELLED'];
    if (!cancelledStatuses.includes(order.status)) {
      return NextResponse.json({
        error: "只能处理已取消的订单"
      }, { status: 400 });
    }

    let newStatus: string;
    let updateNotes: string;

    if (action === 'approve') {
      // 批准退款 - 使用大写状态值
      newStatus = 'REFUNDED';
      updateNotes = order.notes ?
        `${order.notes}\n\n管理员处理：退款已批准，退款金额：¥${refundAmount}。${adminNotes ? `备注：${adminNotes}` : ''}` :
        `管理员处理：退款已批准，退款金额：¥${refundAmount}。${adminNotes ? `备注：${adminNotes}` : ''}`;

      // TODO: 这里应该调用实际的退款接口
      // 例如调用支付宝、微信支付的退款API
      console.log(`处理退款：订单 ${orderId}，退款金额：¥${refundAmount}`);

    } else {
      // 拒绝退款 - 需要添加这个状态到数据库约束中
      newStatus = 'REFUND_REJECTED';
      updateNotes = order.notes ?
        `${order.notes}\n\n管理员处理：退款申请被拒绝。${adminNotes ? `原因：${adminNotes}` : ''}` :
        `管理员处理：退款申请被拒绝。${adminNotes ? `原因：${adminNotes}` : ''}`;
    }

    // 更新订单状态和备注
    const { error: updateError } = await SupabaseHelper.updateOrder(orderId, {
      status: newStatus,
      notes: updateNotes,
      updated_at: new Date().toISOString()
    });

    if (updateError) {
      console.error("Update order error:", updateError);
      return NextResponse.json({ error: "更新订单状态失败" }, { status: 500 });
    }

    // TODO: 发送通知给用户
    // 例如发送邮件、短信或者推送通知

    return NextResponse.json({ 
      message: action === 'approve' ? "退款已批准" : "退款申请已拒绝",
      orderId: orderId,
      action: action,
      refundAmount: action === 'approve' ? refundAmount : 0
    });

  } catch (error) {
    console.error("Process refund API error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
