import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minRating = searchParams.get("minRating");
    const skills = searchParams.get("skills");
    const serviceType = searchParams.get("serviceType");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;

    // 从Supabase数据库获取真实地陪数据
    console.log('Fetching guides from Supabase database');

    let query = supabaseAdmin
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
      .eq('is_active', true)
      .eq('verification_status', 'verified')
      .order('rating_avg', { ascending: false });

    // 应用筛选条件
    if (city && city !== 'all') {
      query = query.eq('city', city);
    }

    if (serviceType && serviceType !== 'all') {
      // 根据服务类型筛选
      query = query.contains('services', [{ code: serviceType }]);
    }

    // 应用分页
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: guides, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: "获取地陪列表失败" },
        { status: 500 }
      );
    }

    // 格式化数据以匹配前端期望的格式
    const formattedGuides = guides?.map(guide => ({
      id: guide.id,
      userId: guide.user_id,
      displayName: guide.display_name,
      bio: guide.bio,
      skills: guide.skills || [],
      hourlyRate: guide.hourly_rate,
      services: guide.services || [],
      photos: guide.photos || ["/default-avatar.svg"],
      city: guide.city,
      location: guide.location,
      ratingAvg: guide.rating_avg || 0,
      ratingCount: guide.rating_count || 0,
      certificationStatus: guide.verification_status,
      createdAt: guide.created_at,
      user: {
        name: guide.display_name,
        phone: null,
        avatarUrl: guide.photos?.[0] || "/default-avatar.svg"
      }
    })) || [];

    const totalPages = Math.ceil((count || 0) / limit);

    const response = NextResponse.json({
      items: formattedGuides,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages
      }
    });

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

