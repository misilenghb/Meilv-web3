import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId1 = searchParams.get("userId1");
    const userId2 = searchParams.get("userId2");

    if (userId1 && userId2) {
      // Get conversation between two users
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          from_user_id,
          to_user_id,
          content,
          is_read,
          created_at
        `)
        .or(`and(from_user_id.eq.${userId1},to_user_id.eq.${userId2}),and(from_user_id.eq.${userId2},to_user_id.eq.${userId1})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Messages fetch error:', error);
        return NextResponse.json({ error: "获取消息失败" }, { status: 500 });
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

      return NextResponse.json({ items: formattedMessages });
    }

    // Return all messages (for admin or debugging)
    const { data: allMessages, error: allError } = await supabase
      .from('messages')
      .select(`
        id,
        from_user_id,
        to_user_id,
        content,
        is_read,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('All messages fetch error:', allError);
      return NextResponse.json({ error: "获取消息失败" }, { status: 500 });
    }

    const formattedMessages = (allMessages || []).map(msg => ({
      id: msg.id,
      fromUserId: msg.from_user_id,
      toUserId: msg.to_user_id,
      content: msg.content,
      isRead: msg.is_read,
      createdAt: msg.created_at
    }));

    return NextResponse.json({ items: formattedMessages });

  } catch (error) {
    console.error('Messages API error:', error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 检查用户登录状态
    const sessionCookie = req.cookies.get("ml_session");
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

    const { toUserId, content } = await req.json();
    const fromUserId = sessionData.userId;

    if (!toUserId || !content) {
      return NextResponse.json({ error: "缺少必要字段" }, { status: 400 });
    }

    if (content.trim().length === 0) {
      return NextResponse.json({ error: "消息内容不能为空" }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: "消息内容过长" }, { status: 400 });
    }

    // 验证用户是否存在
    const { data: fromUser, error: fromUserError } = await supabase
      .from('users')
      .select('id')
      .eq('id', fromUserId)
      .single();

    const { data: toUser, error: toUserError } = await supabase
      .from('users')
      .select('id')
      .eq('id', toUserId)
      .single();

    if (fromUserError || toUserError || !fromUser || !toUser) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // 创建消息
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert([{
        from_user_id: fromUserId,
        to_user_id: toUserId,
        content: content.trim(),
        is_read: false
      }])
      .select(`
        id,
        from_user_id,
        to_user_id,
        content,
        is_read,
        created_at
      `)
      .single();

    if (messageError) {
      console.error('Message creation error:', messageError);
      return NextResponse.json({ error: "发送消息失败" }, { status: 500 });
    }

    // 转换数据格式以匹配前端期望
    const formattedMessage = {
      id: message.id,
      fromUserId: message.from_user_id,
      toUserId: message.to_user_id,
      content: message.content,
      isRead: message.is_read,
      createdAt: message.created_at
    };

    return NextResponse.json(formattedMessage, { status: 201 });

  } catch (error) {
    console.error('Message POST error:', error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// DELETE - 删除与特定用户的所有对话消息
export async function DELETE(req: NextRequest) {
  try {
    // 检查用户登录状态
    const sessionCookie = req.cookies.get("ml_session");
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

    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get("partnerId");
    const currentUserId = sessionData.userId;

    if (!partnerId) {
      return NextResponse.json({ error: "缺少对话伙伴ID" }, { status: 400 });
    }

    // 删除两个用户之间的所有消息
    const { error: deleteError } = await supabase
      .from('messages')
      .delete()
      .or(`and(from_user_id.eq.${currentUserId},to_user_id.eq.${partnerId}),and(from_user_id.eq.${partnerId},to_user_id.eq.${currentUserId})`);

    if (deleteError) {
      console.error('Messages delete error:', deleteError);
      return NextResponse.json({ error: "删除消息失败" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "对话已删除" });

  } catch (error) {
    console.error('Message DELETE error:', error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

