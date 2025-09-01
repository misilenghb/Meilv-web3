import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: partnerId } = await params;
    const currentUserId = sessionData.userId;

    // 获取两个用户之间的消息
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        id,
        from_user_id,
        to_user_id,
        content,
        is_read,
        created_at
      `)
      .or(`and(from_user_id.eq.${currentUserId},to_user_id.eq.${partnerId}),and(from_user_id.eq.${partnerId},to_user_id.eq.${currentUserId})`)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Messages fetch error:', messagesError);
      return NextResponse.json({ error: "获取消息失败" }, { status: 500 });
    }

    // 获取对话伙伴信息
    const { data: partner, error: partnerError } = await supabase
      .from('users')
      .select('id, name')
      .eq('id', partnerId)
      .single();

    if (partnerError) {
      console.error('Partner fetch error:', partnerError);
    }

    // 转换数据格式以匹配前端期望
    const formattedMessages = (messages || []).map(msg => ({
      id: msg.id,
      fromUserId: msg.from_user_id,
      toUserId: msg.to_user_id,
      content: msg.content,
      isRead: msg.is_read,
      createdAt: msg.created_at
    }));

    return NextResponse.json({
      items: formattedMessages,
      partner: partner ? { id: partner.id, name: partner.name } : null,
    });

  } catch (error) {
    console.error('Messages [id] API error:', error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
