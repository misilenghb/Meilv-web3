import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    // 获取涉及此用户的所有消息
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
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (messagesError) {
      console.error('Conversations fetch error:', messagesError);
      return NextResponse.json({ error: "获取对话列表失败" }, { status: 500 });
    }

    // 获取所有相关用户的信息
    const partnerIds = new Set<string>();
    (messages || []).forEach((msg: any) => {
      const partnerId = msg.from_user_id === userId ? msg.to_user_id : msg.from_user_id;
      partnerIds.add(partnerId);
    });

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name')
      .in('id', Array.from(partnerIds));

    if (usersError) {
      console.error('Users fetch error:', usersError);
      return NextResponse.json({ error: "获取用户信息失败" }, { status: 500 });
    }

    // 创建用户映射
    const userMap = new Map<string, any>();
    (users || []).forEach(user => {
      userMap.set(user.id, user);
    });

    // 按对话伙伴分组
    const conversations = new Map<string, {
      partnerId: string;
      partnerName: string;
      lastMessage: string;
      lastMessageTime: string;
      unreadCount: number;
    }>();

    (messages || []).forEach((msg: any) => {
      const partnerId = msg.from_user_id === userId ? msg.to_user_id : msg.from_user_id;
      const partner = userMap.get(partnerId);

      if (!partner) return;

      const existing = conversations.get(partnerId);
      const msgTime = new Date(msg.created_at).getTime();

      if (!existing || new Date(existing.lastMessageTime).getTime() < msgTime) {
        // 计算未读消息数量
        const unreadCount = (messages || []).filter((m: any) =>
          m.to_user_id === userId &&
          m.from_user_id === partnerId &&
          !m.is_read
        ).length;

        conversations.set(partnerId, {
          partnerId,
          partnerName: partner.name,
          lastMessage: msg.content,
          lastMessageTime: msg.created_at,
          unreadCount,
        });
      }
    });

    const result = Array.from(conversations.values())
      .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

    return NextResponse.json({ items: result });

  } catch (error) {
    console.error('Conversations API error:', error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
