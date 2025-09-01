import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionServer } from "@/lib/session";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    // 检查管理员权限
    const session = await getSessionServer();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "权限不足" }, { status: 403 });
    }

    const { orderId } = await context.params;
    const { paymentMethod, paymentNotes, amount } = await req.json();

    console.log("收取保证金API调用:", { orderId, paymentMethod, paymentNotes, amount });

    // 验证订单存在
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error("订单查询错误:", orderError);
      return NextResponse.json(
        { error: "订单不存在" },
        { status: 404 }
      );
    }

    console.log("订单状态验证:", {
      orderId,
      status: order.status,
      payment_status: order.payment_status,
      expected_status: "confirmed",
      expected_payment_status: "pending"
    });

    // 验证订单状态 - 允许收取保证金的状态
    const allowedStatuses = ["confirmed", "GUIDE_SELECTED", "DEPOSIT_PENDING"];
    const allowedPaymentStatuses = ["pending", null, undefined];

    if (!allowedStatuses.includes(order.status) ||
        (order.payment_status && !allowedPaymentStatuses.includes(order.payment_status))) {
      console.error("订单状态验证失败:", {
        current_status: order.status,
        current_payment_status: order.payment_status,
        allowed_statuses: allowedStatuses,
        allowed_payment_statuses: allowedPaymentStatuses
      });
      return NextResponse.json(
        { error: `订单状态不正确，无法确认收金支付，当前状态为 ${order.status}，期望状态为 ${allowedStatuses.join(' 或 ')}` },
        { status: 400 }
      );
    }

    // 验证收款金额（保证金固定为200）
    const expectedAmount = 200;
    if (amount !== expectedAmount) {
      return NextResponse.json(
        { error: `保证金金额不匹配，应收 ¥${expectedAmount}` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // 确定更新后的状态 - 根据当前状态系统决定
    let newStatus;
    if (order.status === "confirmed") {
      newStatus = 'in_progress'; // 旧状态系统：confirmed -> in_progress
    } else if (order.status === "GUIDE_SELECTED" || order.status === "DEPOSIT_PENDING") {
      newStatus = 'DEPOSIT_PAID'; // 新状态系统：GUIDE_SELECTED/DEPOSIT_PENDING -> DEPOSIT_PAID
    } else {
      newStatus = 'DEPOSIT_PAID'; // 默认使用新状态系统
    }

    // 更新订单状态和保证金收款信息
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: newStatus,
        payment_status: 'paid', // 更新支付状态
        // deposit_paid_at: now, // 暂时移除这个字段，因为数据库中不存在
        notes: `${order.notes || ''}\n保证金已收取 - 方式: ${paymentMethod}, 备注: ${paymentNotes}, 时间: ${now}`,
        updated_at: now
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error("Update order error:", updateError);
      return NextResponse.json(
        { error: "更新订单状态失败" },
        { status: 500 }
      );
    }

    // 给用户账户增加保证金余额
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('balance')
      .eq('id', order.user_id)
      .single();

    if (!userError && user) {
      const currentBalance = user.balance || 0;
      const newBalance = currentBalance + amount;

      // 更新用户余额
      await supabaseAdmin
        .from('users')
        .update({ balance: newBalance })
        .eq('id', order.user_id);

      // 记录余额变更
      await supabaseAdmin
        .from('balance_transactions')
        .insert({
          user_id: order.user_id,
          order_id: orderId,
          type: 'deposit',
          amount: amount,
          balance_before: currentBalance,
          balance_after: newBalance,
          description: `保证金收款 - 订单 ${orderId.slice(-8)}`
        });
    }

    return NextResponse.json({
      success: true,
      message: "保证金收款成功",
      order: updatedOrder
    });

  } catch (error) {
    console.error("Collect payment error:", error);
    return NextResponse.json(
      { error: "收款处理失败" },
      { status: 500 }
    );
  }
}
