import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const { data: guide, error } = await supabaseAdmin
      .from('guides')
      .select(`
        id,
        user_id,
        display_name,
        bio,
        skills,
        hourly_rate,
        services,
        photos,
        city,
        location,
        rating_avg,
        rating_count,
        verification_status,
        is_active,
        created_at
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !guide) {
      return NextResponse.json({ error: "地陪不存在" }, { status: 404 });
    }

    // 格式化数据
    const formattedGuide = {
      id: guide.id,
      userId: guide.user_id,
      displayName: guide.display_name,
      bio: guide.bio,
      skills: guide.skills || [],
      hourlyRate: guide.hourly_rate,
      services: guide.services || [],
      photos: guide.photos || [],
      city: guide.city,
      location: guide.location,
      ratingAvg: guide.rating_avg || 0,
      ratingCount: guide.rating_count || 0,
      certificationStatus: guide.verification_status,
      createdAt: guide.created_at,
      user: {
        name: guide.display_name,
        phone: null,
        email: null,
        avatarUrl: guide.photos?.[0] || null
      }
    };

    const response = NextResponse.json(formattedGuide);
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    return response;

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}

