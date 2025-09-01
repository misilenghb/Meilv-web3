import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// 获取用户收藏列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "用户ID必填" }, { status: 400 });
    }

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
      guideId: fav.guide_id,
      createdAt: fav.created_at,
      guide: {
        id: fav.guides.id,
        displayName: fav.guides.display_name,
        city: fav.guides.city,
        ratingAvg: fav.guides.rating_avg,
        ratingCount: fav.guides.rating_count,
        hourlyRate: fav.guides.hourly_rate,
        photos: fav.guides.photos,
        certificationStatus: fav.guides.verification_status
      }
    })) || [];

    return NextResponse.json({ items: formattedFavorites });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// 添加收藏
export async function POST(request: NextRequest) {
  try {
    const { userId, guideId } = await request.json();

    if (!userId || !guideId) {
      return NextResponse.json({ error: "用户ID和地陪ID必填" }, { status: 400 });
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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const guideId = searchParams.get("guideId");

    if (!userId || !guideId) {
      return NextResponse.json({ error: "用户ID和地陪ID必填" }, { status: 400 });
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
