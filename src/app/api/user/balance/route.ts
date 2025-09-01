import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionServer } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionServer();
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // 获取用户余额
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('balance')
      .eq('id', session.userId)
      .single();

    if (userError) {
      console.error("Get user balance error:", userError);
      return NextResponse.json({ error: "获取余额失败" }, { status: 500 });
    }

    // 获取余额变更记录
    const { data: transactions, error: transError } = await supabaseAdmin
      .from('balance_transactions')
      .select('*')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (transError) {
      console.error("Get balance transactions error:", transError);
      // 不阻塞余额查询，只记录错误
    }

    return NextResponse.json({
      balance: user.balance || 0,
      transactions: transactions || []
    });

  } catch (error) {
    console.error("Get balance error:", error);
    return NextResponse.json(
      { error: "获取余额信息失败" },
      { status: 500 }
    );
  }
}
