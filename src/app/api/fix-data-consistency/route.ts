import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST() {
  try {
    console.log("=== 修复数据一致性 ===");
    
    // 1. 查询所有已认证但未激活的地陪
    const { data: inconsistentGuides, error: queryError } = await supabaseAdmin
      .from('guides')
      .select('*')
      .eq('verification_status', 'verified')
      .neq('is_active', true);

    if (queryError) {
      console.error('查询不一致地陪失败:', queryError);
      return NextResponse.json({
        success: false,
        error: queryError.message
      }, { status: 500 });
    }

    console.log(`找到 ${inconsistentGuides?.length || 0} 个需要修复的地陪`);

    if (!inconsistentGuides || inconsistentGuides.length === 0) {
      return NextResponse.json({
        success: true,
        message: "没有需要修复的数据",
        fixed: 0
      });
    }

    // 2. 批量更新这些地陪的is_active状态
    const guideIds = inconsistentGuides.map(guide => guide.id);
    
    const { data: updatedGuides, error: updateError } = await supabaseAdmin
      .from('guides')
      .update({ 
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .in('id', guideIds)
      .select();

    if (updateError) {
      console.error('批量更新失败:', updateError);
      return NextResponse.json({
        success: false,
        error: updateError.message
      }, { status: 500 });
    }

    console.log(`成功修复 ${updatedGuides?.length || 0} 个地陪的状态`);

    // 3. 验证修复结果
    const { data: verificationData, error: verificationError } = await supabaseAdmin
      .from('guides')
      .select('id, display_name, verification_status, is_active')
      .eq('verification_status', 'verified');

    if (verificationError) {
      console.error('验证修复结果失败:', verificationError);
    }

    const stats = {
      totalVerified: verificationData?.length || 0,
      totalActive: verificationData?.filter(g => g.is_active === true).length || 0,
      stillInconsistent: verificationData?.filter(g => g.is_active !== true).length || 0
    };

    console.log("修复后统计:", stats);

    return NextResponse.json({
      success: true,
      message: `成功修复 ${updatedGuides?.length || 0} 个地陪的数据一致性`,
      fixed: updatedGuides?.length || 0,
      fixedGuides: inconsistentGuides.map(guide => ({
        id: guide.id,
        displayName: guide.display_name,
        phone: guide.phone
      })),
      stats
    });

  } catch (error) {
    console.error('修复数据一致性失败:', error);
    return NextResponse.json({
      success: false,
      error: "服务器错误"
    }, { status: 500 });
  }
}
