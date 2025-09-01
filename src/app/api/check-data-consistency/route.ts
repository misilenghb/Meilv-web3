import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("=== 检查数据一致性 ===");
    
    // 1. 检查所有地陪的详细状态
    const { data: allGuides, error: guidesError } = await supabaseAdmin
      .from('guides')
      .select('*')
      .order('created_at', { ascending: false });

    if (guidesError) {
      console.error('查询地陪失败:', guidesError);
      return NextResponse.json({
        success: false,
        error: guidesError.message
      }, { status: 500 });
    }

    // 2. 检查前端API返回的地陪
    const { data: frontendGuides, error: frontendError } = await supabaseAdmin
      .from('guides')
      .select('*')
      .eq('is_active', true)
      .eq('verification_status', 'verified');

    if (frontendError) {
      console.error('查询前端地陪失败:', frontendError);
      return NextResponse.json({
        success: false,
        error: frontendError.message
      }, { status: 500 });
    }

    // 3. 统计不同状态的地陪
    const stats = {
      total: allGuides?.length || 0,
      verified: allGuides?.filter(g => g.verification_status === 'verified').length || 0,
      active: allGuides?.filter(g => g.is_active === true).length || 0,
      verifiedAndActive: allGuides?.filter(g => g.verification_status === 'verified' && g.is_active === true).length || 0,
      frontendVisible: frontendGuides?.length || 0
    };

    // 4. 详细分析每个地陪的状态
    const guideDetails = allGuides?.map(guide => ({
      id: guide.id,
      displayName: guide.display_name,
      verificationStatus: guide.verification_status,
      isActive: guide.is_active,
      createdAt: guide.created_at,
      applicationId: guide.application_id,
      // 检查是否会在前端显示
      visibleInFrontend: guide.verification_status === 'verified' && guide.is_active === true
    })) || [];

    // 5. 找出不一致的地陪
    const inconsistentGuides = guideDetails.filter(guide => 
      guide.verificationStatus === 'verified' && guide.isActive !== true
    );

    console.log("=== 数据一致性检查完成 ===");
    console.log("统计信息:", stats);
    console.log("不一致的地陪数量:", inconsistentGuides.length);

    return NextResponse.json({
      success: true,
      stats,
      guideDetails,
      inconsistentGuides,
      summary: {
        totalGuides: stats.total,
        shouldBeVisible: stats.verified, // 应该在前端显示的数量（已认证）
        actuallyVisible: stats.frontendVisible, // 实际在前端显示的数量
        inconsistentCount: inconsistentGuides.length
      }
    });

  } catch (error) {
    console.error('数据一致性检查失败:', error);
    return NextResponse.json({
      success: false,
      error: "服务器错误"
    }, { status: 500 });
  }
}
