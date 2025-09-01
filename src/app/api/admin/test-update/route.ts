import { NextRequest, NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import { SupabaseHelper } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    // 检查登录状态
    const session = await getSessionServer();
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "需要订单ID" }, { status: 400 });
    }

    // 获取订单信息
    const { data: order, error: fetchError } = await SupabaseHelper.getOrderById(orderId);
    if (fetchError || !order) {
      return NextResponse.json({ 
        error: "订单不存在", 
        fetchError: fetchError 
      }, { status: 404 });
    }

    // 尝试更新订单状态
    const { data: updatedOrder, error: updateError } = await SupabaseHelper.updateOrder(orderId, {
      status: 'refunded',
      notes: order.notes ? `${order.notes}\n\n测试更新` : '测试更新',
    });

    if (updateError) {
      console.error("Update order error:", updateError);
      return NextResponse.json({ 
        error: "更新订单状态失败", 
        updateError: updateError,
        originalOrder: order
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "测试更新成功",
      originalOrder: order,
      updatedOrder: updatedOrder
    });

  } catch (error) {
    console.error("Test update API error:", error);
    return NextResponse.json({ error: "服务器错误", details: error }, { status: 500 });
  }
}
