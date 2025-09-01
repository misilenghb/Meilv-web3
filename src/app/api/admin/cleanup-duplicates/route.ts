import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
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

    // 查找所有地陪数据
    const { data: allGuides, error: fetchError } = await supabaseAdmin
      .from('guides')
      .select('id, user_id, display_name, created_at')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('获取地陪数据失败:', fetchError);
      return NextResponse.json({ error: "获取地陪数据失败" }, { status: 500 });
    }

    // 查找重复项
    const duplicateGroups = new Map();
    const duplicateIds = [];

    allGuides?.forEach(guide => {
      const key = `${guide.user_id}_${guide.display_name}`;
      if (duplicateGroups.has(key)) {
        duplicateGroups.get(key).push(guide);
      } else {
        duplicateGroups.set(key, [guide]);
      }
    });

    // 收集需要删除的重复项（保留最早创建的）
    duplicateGroups.forEach((guides, key) => {
      if (guides.length > 1) {
        // 保留最早创建的，删除其他的
        const sortedGuides = guides.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        for (let i = 1; i < sortedGuides.length; i++) {
          duplicateIds.push(sortedGuides[i].id);
        }
      }
    });

    console.log('发现重复地陪ID:', duplicateIds);

    if (duplicateIds.length === 0) {
      return NextResponse.json({ 
        message: "没有发现重复数据",
        duplicatesFound: 0,
        duplicatesRemoved: 0
      });
    }

    // 删除重复项
    const { error: deleteError } = await supabaseAdmin
      .from('guides')
      .delete()
      .in('id', duplicateIds);

    if (deleteError) {
      console.error('删除重复数据失败:', deleteError);
      return NextResponse.json({ error: "删除重复数据失败" }, { status: 500 });
    }

    return NextResponse.json({
      message: "重复数据清理完成",
      duplicatesFound: duplicateIds.length,
      duplicatesRemoved: duplicateIds.length,
      removedIds: duplicateIds
    });

  } catch (error) {
    console.error('清理重复数据时出错:', error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// GET 方法用于检查重复数据（不删除）
export async function GET(request: NextRequest) {
  try {
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

    // 查找所有地陪数据
    const { data: allGuides, error: fetchError } = await supabaseAdmin
      .from('guides')
      .select('id, user_id, display_name, created_at, verification_status')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('获取地陪数据失败:', fetchError);
      return NextResponse.json({ error: "获取地陪数据失败" }, { status: 500 });
    }

    // 查找重复项
    const duplicateGroups = new Map();
    const duplicates = [];

    allGuides?.forEach(guide => {
      const key = `${guide.user_id}_${guide.display_name}`;
      if (duplicateGroups.has(key)) {
        duplicateGroups.get(key).push(guide);
      } else {
        duplicateGroups.set(key, [guide]);
      }
    });

    // 收集重复项信息
    duplicateGroups.forEach((guides, key) => {
      if (guides.length > 1) {
        duplicates.push({
          key,
          count: guides.length,
          guides: guides.map(g => ({
            id: g.id,
            displayName: g.display_name,
            createdAt: g.created_at,
            verificationStatus: g.verification_status
          }))
        });
      }
    });

    return NextResponse.json({
      totalGuides: allGuides?.length || 0,
      duplicateGroups: duplicates.length,
      totalDuplicates: duplicates.reduce((sum, group) => sum + group.count - 1, 0),
      duplicates
    });

  } catch (error) {
    console.error('检查重复数据时出错:', error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
