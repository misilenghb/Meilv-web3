import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    // 检查 Supabase 配置
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey ||
        supabaseUrl === 'https://placeholder.supabase.co' ||
        supabaseAnonKey === 'placeholder-key') {
      return NextResponse.json({
        error: "数据库配置错误，请检查环境变量"
      }, { status: 500 });
    }
    // 检查管理员权限
    const sessionCookie = request.cookies.get("ml_session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    let sessionData;
    try {
      sessionData = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString("utf8"));
    } catch (error) {
      return NextResponse.json({ error: "登录状态无效" }, { status: 401 });
    }

    if (sessionData.role !== "admin") {
      return NextResponse.json({ error: "权限不足" }, { status: 403 });
    }

    // 1. 获取所有地陪数据（管理页面看到的）
    const { data: allGuides, error: allGuidesError } = await supabaseAdmin
      .from('guides')
      .select(`
        id,
        user_id,
        display_name,
        city,
        verification_status,
        is_active,
        rating_avg,
        rating_count,
        created_at,
        verified_at
      `)
      .order('created_at', { ascending: false });

    if (allGuidesError) {
      console.error('获取所有地陪数据失败:', allGuidesError);
      return NextResponse.json({ error: "获取地陪数据失败" }, { status: 500 });
    }

    // 2. 获取公开显示的地陪数据（用户页面看到的）
    const { data: publicGuides, error: publicGuidesError } = await supabaseAdmin
      .from('guides')
      .select(`
        id,
        user_id,
        display_name,
        city,
        verification_status,
        is_active,
        rating_avg,
        rating_count,
        created_at
      `)
      .eq('is_active', true)
      .eq('verification_status', 'verified')
      .order('rating_avg', { ascending: false });

    if (publicGuidesError) {
      console.error('获取公开地陪数据失败:', publicGuidesError);
      return NextResponse.json({ error: "获取公开地陪数据失败" }, { status: 500 });
    }

    // 3. 统计分析
    const stats = {
      total: allGuides?.length || 0,
      verified: allGuides?.filter(g => g.verification_status === 'verified').length || 0,
      pending: allGuides?.filter(g => g.verification_status === 'pending').length || 0,
      rejected: allGuides?.filter(g => g.verification_status === 'rejected').length || 0,
      suspended: allGuides?.filter(g => g.verification_status === 'suspended').length || 0,
      active: allGuides?.filter(g => g.is_active).length || 0,
      inactive: allGuides?.filter(g => !g.is_active).length || 0,
      publicVisible: publicGuides?.length || 0
    };

    // 4. 检查不一致的情况
    const inconsistencies = [];

    // 检查已认证但不活跃的地陪
    const verifiedButInactive = allGuides?.filter(g => 
      g.verification_status === 'verified' && !g.is_active
    ) || [];

    if (verifiedButInactive.length > 0) {
      inconsistencies.push({
        type: 'verified_but_inactive',
        count: verifiedButInactive.length,
        description: '已认证但未激活的地陪',
        items: verifiedButInactive.map(g => ({
          id: g.id,
          displayName: g.display_name,
          city: g.city,
          verificationStatus: g.verification_status,
          isActive: g.is_active
        }))
      });
    }

    // 检查活跃但未认证的地陪
    const activeButNotVerified = allGuides?.filter(g => 
      g.is_active && g.verification_status !== 'verified'
    ) || [];

    if (activeButNotVerified.length > 0) {
      inconsistencies.push({
        type: 'active_but_not_verified',
        count: activeButNotVerified.length,
        description: '活跃但未认证的地陪',
        items: activeButNotVerified.map(g => ({
          id: g.id,
          displayName: g.display_name,
          city: g.city,
          verificationStatus: g.verification_status,
          isActive: g.is_active
        }))
      });
    }

    // 检查没有评分的已认证地陪
    const verifiedWithoutRating = allGuides?.filter(g => 
      g.verification_status === 'verified' && 
      g.is_active && 
      (!g.rating_avg || g.rating_avg === 0)
    ) || [];

    if (verifiedWithoutRating.length > 0) {
      inconsistencies.push({
        type: 'verified_without_rating',
        count: verifiedWithoutRating.length,
        description: '已认证但无评分的地陪',
        items: verifiedWithoutRating.map(g => ({
          id: g.id,
          displayName: g.display_name,
          city: g.city,
          ratingAvg: g.rating_avg,
          ratingCount: g.rating_count
        }))
      });
    }

    // 5. 检查用户表与地陪表的一致性
    const { data: guideUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, name, role, intended_role')
      .or('role.eq.guide,intended_role.eq.guide');

    if (!usersError && guideUsers) {
      const userIds = new Set(guideUsers.map(u => u.id));
      const guideUserIds = new Set(allGuides?.map(g => g.user_id) || []);

      // 检查有地陪档案但用户表中角色不是地陪的情况
      const guidesWithWrongUserRole = allGuides?.filter(g => {
        const user = guideUsers.find(u => u.id === g.user_id);
        return user && user.role !== 'guide' && user.intended_role !== 'guide';
      }) || [];

      if (guidesWithWrongUserRole.length > 0) {
        inconsistencies.push({
          type: 'guide_profile_wrong_user_role',
          count: guidesWithWrongUserRole.length,
          description: '有地陪档案但用户角色不正确',
          items: guidesWithWrongUserRole.map(g => {
            const user = guideUsers.find(u => u.id === g.user_id);
            return {
              id: g.id,
              displayName: g.display_name,
              userId: g.user_id,
              userRole: user?.role,
              userIntendedRole: user?.intended_role
            };
          })
        });
      }
    }

    return NextResponse.json({
      stats,
      inconsistencies,
      summary: {
        totalInconsistencies: inconsistencies.reduce((sum, inc) => sum + inc.count, 0),
        isConsistent: inconsistencies.length === 0,
        expectedPublicCount: stats.verified, // 应该公开显示的数量
        actualPublicCount: stats.publicVisible, // 实际公开显示的数量
        publicCountMatch: stats.verified === stats.publicVisible
      }
    });

  } catch (error) {
    console.error('检查一致性时出错:', error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
