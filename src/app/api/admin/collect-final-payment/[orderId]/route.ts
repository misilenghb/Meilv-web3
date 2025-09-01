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

    // 验证订单存在
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "订单不存在" },
        { status: 404 }
      );
    }

    // 验证订单状态 - 允许收取尾款的状态（已收取保证金）
    const allowedStatuses = ["in_progress", "DEPOSIT_PAID"];
    if (!allowedStatuses.includes(order.status)) {
      return NextResponse.json(
        { error: `订单状态不允许收取尾款。当前状态: ${order.status}，期望状态: ${allowedStatuses.join(' 或 ')}` },
        { status: 400 }
      );
    }

    // 验证收款金额（尾款 = 总金额 - 保证金）
    const expectedAmount = (order.total_amount || 0) - 200;
    if (amount !== expectedAmount) {
      return NextResponse.json(
        { error: `尾款金额不匹配，应收 ¥${expectedAmount}` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // 确定更新后的状态 - 根据当前状态系统决定
    let newStatus;
    if (order.status === "in_progress") {
      newStatus = 'completed'; // 旧状态系统：in_progress -> completed
    } else if (order.status === "DEPOSIT_PAID") {
      newStatus = 'COMPLETED'; // 新状态系统：DEPOSIT_PAID -> COMPLETED
    } else {
      newStatus = 'COMPLETED'; // 默认使用新状态系统
    }

    // 更新订单状态和尾款收款信息
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: newStatus,
        payment_status: 'paid', // 确保支付状态为已支付
        // final_payment_paid_at: now, // 暂时移除这个字段，因为数据库中不存在
        // completed_at: now, // 暂时移除这个字段，因为数据库中不存在
        notes: `${order.notes || ''}\n尾款已收取 - 方式: ${paymentMethod}, 备注: ${paymentNotes}, 时间: ${now}`,
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

    // 给用户账户增加尾款余额
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
          description: `尾款收款 - 订单 ${orderId.slice(-8)}`
        });
    }

    return NextResponse.json({
      success: true,
      message: "见面确认并收取尾款成功，订单已完成全款收取",
      order: updatedOrder
    });

  } catch (error) {
    console.error("Collect final payment error:", error);
    return NextResponse.json(
      { error: "尾款收款处理失败" },
      { status: 500 }
    );
  }
}
