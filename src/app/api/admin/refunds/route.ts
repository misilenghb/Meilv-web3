import { NextRequest, NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import { SupabaseHelper } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    // 检查管理员权限
    const session = await getSessionServer();
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // 恢复管理员权限检查
    if (session.role !== "admin") {
      return NextResponse.json({ error: "权限不足" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    // 获取所有退款相关的订单（支持大小写状态）
    const refundStatuses = ['cancelled', 'refunded', 'refund_rejected', 'CANCELLED', 'REFUNDED', 'REFUND_REJECTED'];
    const targetStatus = status && refundStatuses.includes(status) ? status : null;

    const { data: orders, error } = await SupabaseHelper.getAllOrdersByStatus(
      targetStatus || refundStatuses
    );

    if (error) {
      console.error("Get refund requests error:", error);
      return NextResponse.json({ error: "Failed to get refund requests" }, { status: 500 });
    }

    return NextResponse.json({ items: orders || [] });

  } catch (error) {
    console.error("Admin refunds API error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
