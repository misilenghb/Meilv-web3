import { NextRequest, NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import { SupabaseHelper } from "@/lib/supabase";
import type { RefundMethod, RefundAccountInfo } from "@/types/domain";

export async function POST(
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
    const body = await req.json();
    const { reason, refundMethod, refundAccountInfo } = body;

    // 验证退款原因
    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ error: "请提供退款原因" }, { status: 400 });
    }

    // 验证退款方式
    if (!refundMethod || !["alipay", "wechat", "bank_transfer"].includes(refundMethod)) {
      return NextResponse.json({ error: "请选择有效的退款方式" }, { status: 400 });
    }

    // 验证退款账户信息
    if (!refundAccountInfo || !refundAccountInfo.account || !refundAccountInfo.name) {
      return NextResponse.json({ error: "请提供完整的退款账户信息" }, { status: 400 });
    }

    // 银行转账需要提供开户行信息
    if (refundMethod === "bank_transfer" && !refundAccountInfo.bank) {
      return NextResponse.json({ error: "银行转账需要提供开户行信息" }, { status: 400 });
    }

    // 获取订单信息
    const { data: order, error: fetchError } = await SupabaseHelper.getOrderById(orderId);
    if (fetchError || !order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    // 验证订单所有者
    if (order.user_id !== session.userId) {
      return NextResponse.json({ error: "无权限申请退款" }, { status: 403 });
    }

    // 检查订单状态 - 允许对已支付的订单和退款被拒绝的订单申请退款
    const refundableStatuses = ['in_progress', 'completed', 'IN_PROGRESS', 'COMPLETED', 'REFUND_REJECTED', 'refund_rejected'];
    if (!refundableStatuses.includes(order.status)) {
      return NextResponse.json({
        error: "只能对已支付保证金的订单或退款被拒绝的订单申请退款"
      }, { status: 400 });
    }

    // 检查是否已经成功退款或正在处理退款
    const nonRefundableStatuses = ['cancelled', 'CANCELLED', 'refunded', 'REFUNDED'];
    if (nonRefundableStatuses.includes(order.status)) {
      return NextResponse.json({
        error: "订单已取消或已退款，无法重复申请退款"
      }, { status: 400 });
    }

    // 更新订单状态为已取消，并添加退款信息（使用大写状态值）
    const isReapplication = order.status === 'REFUND_REJECTED' || order.status === 'refund_rejected';
    const refundNote = isReapplication ? `重新申请退款：${reason}` : `退款申请：${reason}`;

    const { error: updateError } = await SupabaseHelper.updateOrder(orderId, {
      status: 'CANCELLED',
      notes: order.notes ? `${order.notes}\n\n${refundNote}` : refundNote,
      refund_method: refundMethod,
      refund_account_info: refundAccountInfo,
      refund_requested_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (updateError) {
      console.error("Update order for refund error:", updateError);
      return NextResponse.json({ error: "申请退款失败" }, { status: 500 });
    }

    // TODO: 这里可以添加发送通知给管理员的逻辑
    // 例如发送邮件、短信或者创建工单

    return NextResponse.json({
      message: "退款申请提交成功，我们将在1-3个工作日内处理",
      orderId: orderId,
      reason: reason,
      refundMethod: refundMethod,
      refundAccountInfo: refundAccountInfo
    });

  } catch (error) {
    console.error("Refund request API error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
