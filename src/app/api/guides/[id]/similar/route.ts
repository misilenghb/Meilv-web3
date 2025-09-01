import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "6");

    // 首先获取当前地陪的信息
    const { data: currentGuide, error: currentError } = await supabaseAdmin
      .from('guides')
      .select('city, skills, hourly_rate')
      .eq('id', id)
      .single();

    if (currentError || !currentGuide) {
      const response = NextResponse.json({ error: "地陪不存在" }, { status: 404 });
      response.headers.set('Content-Type', 'application/json; charset=utf-8');
      return response;
    }

    // 查找相似地陪
    // 1. 同城市的地陪
    // 2. 技能相似的地陪
    // 3. 价格相近的地陪
    const { data: similarGuides, error } = await supabaseAdmin
      .from('guides')
      .select(`
        id,
        display_name,
        bio,
        skills,
        hourly_rate,
        photos,
        city,
        rating_avg,
        rating_count,
        verification_status
      `)
      .eq('is_active', true)
      .eq('verification_status', 'verified')
      .neq('id', id) // 排除当前地陪
      .limit(limit * 2); // 获取更多数据用于筛选

    if (error) {
      console.error('Database error:', error);
      const response = NextResponse.json({ error: "获取推荐失败" }, { status: 500 });
      response.headers.set('Content-Type', 'application/json; charset=utf-8');
      return response;
    }

    // 计算相似度并排序
    const guidesWithSimilarity = similarGuides?.map(guide => {
      let similarity = 0;

      // 同城市加分
      if (guide.city === currentGuide.city) {
        similarity += 30;
      }

      // 技能相似度
      const currentSkills = currentGuide.skills || [];
      const guideSkills = guide.skills || [];
      const commonSkills = currentSkills.filter(skill => 
        guideSkills.includes(skill)
      );
      similarity += (commonSkills.length / Math.max(currentSkills.length, 1)) * 40;

      // 价格相近度
      const priceDiff = Math.abs(guide.hourly_rate - currentGuide.hourly_rate);
      const maxPrice = Math.max(guide.hourly_rate, currentGuide.hourly_rate);
      const priceScore = Math.max(0, 30 - (priceDiff / maxPrice) * 30);
      similarity += priceScore;

      // 评分加分
      similarity += (guide.rating_avg / 5) * 10;

      return {
        ...guide,
        similarity
      };
    }) || [];

    // 按相似度排序并取前N个
    const topSimilar = guidesWithSimilarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    // 格式化数据
    const formattedGuides = topSimilar.map(guide => ({
      id: guide.id,
      displayName: guide.display_name,
      bio: guide.bio,
      skills: guide.skills || [],
      hourlyRate: guide.hourly_rate,
      photos: guide.photos || [],
      city: guide.city,
      ratingAvg: guide.rating_avg || 0,
      ratingCount: guide.rating_count || 0,
      certificationStatus: guide.verification_status,
      similarity: Math.round(guide.similarity)
    }));

    const response = NextResponse.json({
      items: formattedGuides,
      total: formattedGuides.length
    });

    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    return response;

  } catch (error) {
    console.error('API error:', error);
    const response = NextResponse.json({ error: "服务器错误" }, { status: 500 });
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    return response;
  }
}
