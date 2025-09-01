import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // 检查用户登录状态
    const sessionCookie = request.cookies.get("ml_session");
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      );
    }

    let sessionData;
    try {
      sessionData = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString("utf8"));
    } catch (error) {
      return NextResponse.json(
        { error: "登录状态无效，请重新登录" },
        { status: 401 }
      );
    }

    const userId = sessionData.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "用户信息无效" },
        { status: 401 }
      );
    }

    // 从数据库获取用户收藏列表
    const { data: favorites, error } = await supabaseAdmin
      .from('user_favorites')
      .select(`
        guide_id,
        created_at,
        guides!inner(
          id,
          display_name,
          city,
          rating_avg,
          rating_count,
          hourly_rate,
          photos,
          verification_status
        )
      `)
      .eq('user_id', userId)
      .eq('guides.is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: "获取收藏列表失败" }, { status: 500 });
    }

    const formattedFavorites = favorites?.map(fav => ({
      id: fav.guides.id,
      guideId: fav.guide_id,
      createdAt: fav.created_at,
      displayName: fav.guides.display_name,
      city: fav.guides.city,
      ratingAvg: fav.guides.rating_avg,
      ratingCount: fav.guides.rating_count,
      hourlyRate: fav.guides.hourly_rate,
      photos: fav.guides.photos,
      certificationStatus: fav.guides.verification_status
    })) || [];

    return NextResponse.json({
      items: formattedFavorites,
      total: formattedFavorites.length
    });

  } catch (error) {
    console.error('Favorites fetch error:', error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}

// 添加收藏
export async function POST(request: NextRequest) {
  try {
    // 检查用户登录状态
    const sessionCookie = request.cookies.get("ml_session");
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      );
    }

    let sessionData;
    try {
      sessionData = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString("utf8"));
    } catch (error) {
      return NextResponse.json(
        { error: "登录状态无效，请重新登录" },
        { status: 401 }
      );
    }

    const userId = sessionData.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "用户信息无效" },
        { status: 401 }
      );
    }

    const { guideId } = await request.json();

    if (!guideId) {
      return NextResponse.json({ error: "地陪ID必填" }, { status: 400 });
    }

    // 检查是否已收藏
    const { data: existing } = await supabaseAdmin
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('guide_id', guideId)
      .single();

    if (existing) {
      return NextResponse.json({ error: "已经收藏过了" }, { status: 400 });
    }

    // 添加收藏
    const { error } = await supabaseAdmin
      .from('user_favorites')
      .insert({
        user_id: userId,
        guide_id: guideId
      });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: "添加收藏失败" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "收藏成功" });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// 取消收藏
export async function DELETE(request: NextRequest) {
  try {
    // 检查用户登录状态
    const sessionCookie = request.cookies.get("ml_session");
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      );
    }

    let sessionData;
    try {
      sessionData = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString("utf8"));
    } catch (error) {
      return NextResponse.json(
        { error: "登录状态无效，请重新登录" },
        { status: 401 }
      );
    }

    const userId = sessionData.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "用户信息无效" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const guideId = searchParams.get("guideId");

    if (!guideId) {
      return NextResponse.json({ error: "地陪ID必填" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('guide_id', guideId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: "取消收藏失败" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "取消收藏成功" });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}


