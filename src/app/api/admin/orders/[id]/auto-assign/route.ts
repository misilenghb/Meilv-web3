import { NextRequest, NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// 地陪自动分配算法
async function findBestGuide(order: any) {
  try {
    // 获取所有可用地陪
    const { data: guides, error } = await supabaseAdmin
      .from('guides')
      .select(`
        id,
        display_name,
        hourly_rate,
        city,
        rating_avg,
        rating_count,
        is_active,
        verification_status,
        created_at
      `)
      .eq('is_active', true)
      .eq('verification_status', 'verified');

    if (error || !guides || guides.length === 0) {
      return null;
    }

    // 获取每个地陪的当前订单数（负载）
    const guideLoads = await Promise.all(
      guides.map(async (guide) => {
        const { count } = await supabaseAdmin
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('guide_id', guide.id)
          .in('status', ['confirmed', 'in_progress']);
        
        return { guideId: guide.id, load: count || 0 };
      })
    );

    // 计算每个地陪的分配分数
    const scoredGuides = guides.map((guide) => {
      const load = guideLoads.find(l => l.guideId === guide.id)?.load || 0;
      
      // 分配算法权重
      const ratingScore = (guide.rating_avg || 0) * 20; // 评分权重 (0-100)
      const experienceScore = Math.min(guide.rating_count || 0, 50); // 经验权重 (0-50)
      const loadPenalty = load * 10; // 负载惩罚
      const cityBonus = guide.city === order.location?.split(' ')[0] ? 30 : 0; // 同城加分
      
      const totalScore = ratingScore + experienceScore - loadPenalty + cityBonus;
      
      return {
        ...guide,
        score: totalScore,
        load,
        details: {
          ratingScore,
          experienceScore,
          loadPenalty,
          cityBonus,
          totalScore
        }
      };
    });

    // 按分数排序，选择最佳地陪
    scoredGuides.sort((a, b) => b.score - a.score);
    
    return scoredGuides[0] || null;

  } catch (error) {
    console.error("Find best guide error:", error);
    return null;
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSessionServer();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: "权限不足" }, { status: 403 });
  }

  const { id: orderId } = await context.params;

  try {
    // 查找订单
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    // 检查订单状态
    if (order.status !== 'pending') {
      return NextResponse.json({ 
        error: "订单状态不正确，只能为待分配的订单自动分配地陪" 
      }, { status: 400 });
    }

    // 使用算法找到最佳地陪
    const bestGuide = await findBestGuide(order);
    
    if (!bestGuide) {
      return NextResponse.json({ 
        error: "暂无可用地陪，请稍后重试或手动分配" 
      }, { status: 404 });
    }

    // 计算总金额
    const totalAmount = bestGuide.hourly_rate * order.duration_hours;

    // 更新订单
    const updates = {
      guide_id: bestGuide.id,
      total_amount: totalAmount,
      status: 'confirmed', // 系统分配后直接确认，等待收款
      updated_at: new Date().toISOString(),
      notes: order.notes ?
        `${order.notes}\n系统自动分配地陪: ${bestGuide.display_name} (评分: ${bestGuide.score.toFixed(1)}) - ${new Date().toLocaleString()}` :
        `系统自动分配地陪: ${bestGuide.display_name} (评分: ${bestGuide.score.toFixed(1)}) - ${new Date().toLocaleString()}`
    };

    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select(`
        *,
        users!orders_user_id_fkey(id, name, phone),
        guides!orders_guide_id_fkey(id, display_name, user_id)
      `)
      .single();

    if (updateError) {
      console.error("Update order error:", updateError);
      return NextResponse.json({ error: "自动分配失败" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      assignedGuide: {
        id: bestGuide.id,
        name: bestGuide.display_name,
        score: bestGuide.score,
        details: bestGuide.details
      },
      message: `已自动分配最佳地陪：${bestGuide.display_name}`
    });

  } catch (error) {
    console.error("Auto assign guide error:", error);
    return NextResponse.json({ error: "自动分配失败" }, { status: 500 });
  }
}
