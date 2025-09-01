import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseKey);

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

    // 获取用户信息
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, phone, name, role')
      .eq('id', sessionData.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    // 检查用户是否是地陪
    if (user.role !== "guide") {
      return NextResponse.json(
        { error: "只有地陪用户可以访问此页面" },
        { status: 403 }
      );
    }

    // 查找地陪档案
    const { data: guide, error: guideError } = await supabase
      .from('guides')
      .select(`
        id,
        user_id,
        display_name,
        bio,
        skills,
        hourly_rate,
        city,
        location,
        photos,
        services,
        verification_status,
        rating_avg,
        rating_count,
        created_at
      `)
      .eq('user_id', user.id)
      .single();

    if (guideError || !guide) {
      return NextResponse.json(
        { error: "地陪档案不存在" },
        { status: 404 }
      );
    }

    // 转换数据格式以匹配前端期望的格式
    const formattedGuide = {
      id: guide.id,
      userId: guide.user_id,
      displayName: guide.display_name || "",
      bio: guide.bio || "",
      skills: guide.skills || [],
      hourlyRate: guide.hourly_rate || 200,
      city: guide.city || "",
      location: guide.location || "",
      photos: guide.photos || [],
      services: guide.services || [
        { code: "daily", title: "日常陪伴", pricePerHour: 198 },
        { code: "mild_entertainment", title: "微醺娱乐", pricePerHour: 298 },
        { code: "local_tour", title: "同城旅游", packagePrice: 2900 },
      ],
      certificationStatus: guide.verification_status || "unverified",
      ratingAvg: guide.rating_avg || 0,
      ratingCount: guide.rating_count || 0,
      createdAt: guide.created_at
    };

    return NextResponse.json(formattedGuide);

  } catch (error) {
    console.error('Guide profile fetch error:', error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    // 获取用户信息
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, phone, name, role')
      .eq('id', sessionData.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    // 检查用户是否是地陪
    if (user.role !== "guide") {
      return NextResponse.json(
        { error: "只有地陪用户可以访问此页面" },
        { status: 403 }
      );
    }

    // 查找地陪档案
    const { data: guide, error: guideError } = await supabase
      .from('guides')
      .select('id, user_id')
      .eq('user_id', user.id)
      .single();

    if (guideError || !guide) {
      return NextResponse.json(
        { error: "地陪档案不存在" },
        { status: 404 }
      );
    }

    const updates = await request.json();

    // Validate and sanitize updates
    const allowedFields = ['displayName', 'bio', 'skills', 'hourlyRate', 'city', 'location', 'photos', 'services'];
    const sanitizedUpdates: any = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        sanitizedUpdates[field] = updates[field];
      }
    }

    // Validation
    if (sanitizedUpdates.displayName && sanitizedUpdates.displayName.trim().length === 0) {
      return NextResponse.json({ error: "显示名称不能为空" }, { status: 400 });
    }

    if (sanitizedUpdates.city && sanitizedUpdates.city.trim().length === 0) {
      return NextResponse.json({ error: "城市不能为空" }, { status: 400 });
    }

    if (sanitizedUpdates.hourlyRate && (sanitizedUpdates.hourlyRate < 50 || sanitizedUpdates.hourlyRate > 1000)) {
      return NextResponse.json({ error: "时薪必须在50-1000元之间" }, { status: 400 });
    }

    if (sanitizedUpdates.skills && !Array.isArray(sanitizedUpdates.skills)) {
      return NextResponse.json({ error: "技能必须是数组格式" }, { status: 400 });
    }

    if (sanitizedUpdates.services && !Array.isArray(sanitizedUpdates.services)) {
      return NextResponse.json({ error: "服务必须是数组格式" }, { status: 400 });
    }

    if (sanitizedUpdates.photos && !Array.isArray(sanitizedUpdates.photos)) {
      return NextResponse.json({ error: "照片必须是数组格式" }, { status: 400 });
    }

    if (sanitizedUpdates.photos && sanitizedUpdates.photos.length > 6) {
      return NextResponse.json({ error: "最多只能上传6张照片" }, { status: 400 });
    }

    // Validate services
    if (sanitizedUpdates.services) {
      const validServiceCodes = ["daily", "mild_entertainment", "local_tour"];
      for (const service of sanitizedUpdates.services) {
        if (!validServiceCodes.includes(service.code)) {
          return NextResponse.json({ error: "无效的服务类型" }, { status: 400 });
        }

        if (service.pricePerHour && (service.pricePerHour < 50 || service.pricePerHour > 1000)) {
          return NextResponse.json({ error: "服务价格必须在50-1000元之间" }, { status: 400 });
        }

        if (service.packagePrice && (service.packagePrice < 500 || service.packagePrice > 10000)) {
          return NextResponse.json({ error: "套餐价格必须在500-10000元之间" }, { status: 400 });
        }
      }
    }

    // 转换字段名以匹配数据库结构
    const dbUpdates: any = {};
    if (sanitizedUpdates.displayName !== undefined) dbUpdates.display_name = sanitizedUpdates.displayName;
    if (sanitizedUpdates.bio !== undefined) dbUpdates.bio = sanitizedUpdates.bio;
    if (sanitizedUpdates.skills !== undefined) dbUpdates.skills = sanitizedUpdates.skills;
    if (sanitizedUpdates.hourlyRate !== undefined) dbUpdates.hourly_rate = sanitizedUpdates.hourlyRate;
    if (sanitizedUpdates.city !== undefined) dbUpdates.city = sanitizedUpdates.city;
    if (sanitizedUpdates.location !== undefined) dbUpdates.location = sanitizedUpdates.location;
    if (sanitizedUpdates.photos !== undefined) dbUpdates.photos = sanitizedUpdates.photos;
    if (sanitizedUpdates.services !== undefined) dbUpdates.services = sanitizedUpdates.services;

    // 更新地陪档案
    const { data: updatedGuide, error: updateError } = await supabase
      .from('guides')
      .update(dbUpdates)
      .eq('id', guide.id)
      .select(`
        id,
        user_id,
        display_name,
        bio,
        skills,
        hourly_rate,
        city,
        location,
        photos,
        services,
        verification_status,
        rating_avg,
        rating_count,
        created_at
      `)
      .single();

    if (updateError) {
      console.error('Guide profile update error:', updateError);
      return NextResponse.json(
        { error: "更新地陪档案失败" },
        { status: 500 }
      );
    }

    // 转换数据格式以匹配前端期望的格式
    const formattedGuide = {
      id: updatedGuide.id,
      userId: updatedGuide.user_id,
      displayName: updatedGuide.display_name || "",
      bio: updatedGuide.bio || "",
      skills: updatedGuide.skills || [],
      hourlyRate: updatedGuide.hourly_rate || 200,
      city: updatedGuide.city || "",
      location: updatedGuide.location || "",
      photos: updatedGuide.photos || [],
      services: updatedGuide.services || [],
      certificationStatus: updatedGuide.verification_status || "unverified",
      ratingAvg: updatedGuide.rating_avg || 0,
      ratingCount: updatedGuide.rating_count || 0,
      createdAt: updatedGuide.created_at
    };

    return NextResponse.json(formattedGuide);

  } catch (error) {
    console.error('Guide profile update error:', error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
