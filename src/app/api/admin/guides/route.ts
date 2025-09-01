import { NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key"
);

export async function GET() {
  const session = await getSessionServer();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: guides, error } = await supabase
      .from('guides')
      .select(`
        id,
        display_name,
        city,
        verification_status,
        rating_avg,
        rating_count,
        created_at,
        verified_at
      `)
      .order('created_at', { ascending: false });

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
      displayName: guide.display_name,
      city: guide.city,
      certificationStatus: guide.verification_status,
      ratingAvg: guide.rating_avg || 0,
      ratingCount: guide.rating_count || 0,
      createdAt: guide.created_at,
      verifiedAt: guide.verified_at
    })) || [];

    return NextResponse.json({ items: formattedGuides });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
