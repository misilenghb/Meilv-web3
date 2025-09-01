import { NextRequest, NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionServer();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: "权限不足" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const guideId = searchParams.get('guideId');
    const status = searchParams.get('status');

    // 获取地陪财务数据
    let query = supabaseAdmin
      .from('orders')
      .select(`
        id,
        guide_id,
        total_amount,
        status,
        created_at,
        updated_at,
        duration_hours,
        guides!orders_guide_id_fkey(
          id,
          display_name,
          hourly_rate,
          user_id
        ),
        users!orders_user_id_fkey(
          id,
          name,
          phone
        )
      `)
      .not('guide_id', 'is', null);

    if (guideId) {
      query = query.eq('guide_id', guideId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error("Fetch guide finances error:", error);
      return NextResponse.json({ error: "获取地陪财务数据失败" }, { status: 500 });
    }

    // 计算地陪财务统计
    const guideFinances = new Map();

    orders?.forEach(order => {
      const guideId = order.guide_id;
      const guide = order.guides;
      
      if (!guide) return;

      if (!guideFinances.has(guideId)) {
        guideFinances.set(guideId, {
          guideId,
          guideName: guide.display_name,
          hourlyRate: guide.hourly_rate,
          totalOrders: 0,
          completedOrders: 0,
          totalEarnings: 0,
          pendingEarnings: 0,
          paidEarnings: 0,
          commission: 0, // 平台抽成 (20%)
          netEarnings: 0, // 地陪实际收入 (80%)
          orders: []
        });
      }

      const financeData = guideFinances.get(guideId);
      financeData.totalOrders++;
      financeData.orders.push({
        id: order.id,
        totalAmount: order.total_amount || 0,
        status: order.status,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        durationHours: order.duration_hours || 0,
        customerName: order.users?.name || '未知',
        customerPhone: order.users?.phone || ''
      });

      const orderAmount = order.total_amount || 0;
      
      if (order.status === 'completed') {
        financeData.completedOrders++;
        financeData.totalEarnings += orderAmount;
        financeData.paidEarnings += orderAmount;
      } else if (['confirmed', 'in_progress'].includes(order.status)) {
        financeData.pendingEarnings += orderAmount;
      }

      // 计算平台抽成和地陪净收入
      financeData.commission = financeData.totalEarnings * 0.3; // 30%平台抽成
      financeData.netEarnings = financeData.totalEarnings * 0.7; // 70%地陪收入
    });

    const result = Array.from(guideFinances.values());

    // 计算总体统计
    const totalStats = {
      totalGuides: result.length,
      totalOrders: result.reduce((sum, g) => sum + g.totalOrders, 0),
      totalEarnings: result.reduce((sum, g) => sum + g.totalEarnings, 0),
      totalCommission: result.reduce((sum, g) => sum + g.commission, 0),
      totalNetEarnings: result.reduce((sum, g) => sum + g.netEarnings, 0),
      pendingEarnings: result.reduce((sum, g) => sum + g.pendingEarnings, 0)
    };

    return NextResponse.json({
      guides: result,
      stats: totalStats
    });

  } catch (error) {
    console.error("Guide finances API error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// 结算地陪收入
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionServer();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: "权限不足" }, { status: 403 });
    }

    const { guideId, amount, settlementNotes } = await req.json();

    if (!guideId || !amount) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    // 获取地陪信息
    const { data: guide, error: guideError } = await supabaseAdmin
      .from('guides')
      .select('id, display_name, user_id')
      .eq('id', guideId)
      .single();

    if (guideError || !guide) {
      return NextResponse.json({ error: "地陪不存在" }, { status: 404 });
    }

    // 记录结算记录
    const { error: settlementError } = await supabaseAdmin
      .from('guide_settlements')
      .insert({
        guide_id: guideId,
        amount: amount,
        settlement_date: new Date().toISOString(),
        notes: settlementNotes || '',
        status: 'completed',
        created_by: session.userId
      });

    if (settlementError) {
      console.error("Settlement record error:", settlementError);
      return NextResponse.json({ error: "记录结算失败" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `已完成地陪 ${guide.display_name} 的收入结算，金额：¥${amount}`
    });

  } catch (error) {
    console.error("Guide settlement error:", error);
    return NextResponse.json({ error: "结算处理失败" }, { status: 500 });
  }
}
