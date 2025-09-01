"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ModernIcons } from "@/components/icons/ModernIcons";

interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
}

export default function MessageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const partnerId = params.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [partner, setPartner] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!partnerId) return;

    // Fetch messages initially
    fetchMessages();

    // Set up polling for real-time updates
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [partnerId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages/${partnerId}`, { cache: "no-store" });
      const data = await response.json();
      const newMessages = data.items || [];
      const hadMessages = messages.length > 0;
      setMessages(newMessages);
      setPartner(data.partner || null);

      // 如果有新消息或者是首次加载，滚动到底部
      if (!hadMessages || newMessages.length > messages.length) {
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toUserId: partnerId,
          content: newMessage.trim(),
        }),
      });

      if (response.ok) {
        const newMsg = await response.json();
        // 立即添加新消息到列表
        setMessages((prev) => [...prev, newMsg]);
        setNewMessage("");
        // 滚动到底部显示新消息
        setTimeout(scrollToBottom, 100);
        // 立即刷新消息列表以确保同步
        setTimeout(fetchMessages, 200);
      } else {
        const error = await response.json();
        alert(`发送失败：${error.error || "未知错误"}`);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("发送失败，请检查网络连接");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const deleteConversation = async () => {
    if (!partner || !confirm(`确定要删除与 ${partner.name} 的所有对话消息吗？此操作不可撤销。`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/messages?partnerId=${partnerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('对话已删除');
        router.push('/messages');
      } else {
        const error = await response.json();
        alert(`删除失败：${error.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      alert('删除失败，请检查网络连接');
    } finally {
      setDeleting(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "刚刚";
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card-pink p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            <p className="text-gray-600 mt-2">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 messages-container">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="card-pink p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/messages"
                className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                返回
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold">
                  {partner?.name?.charAt(0) || "?"}
                </div>
                <div>
                  <h1 className="font-bold text-gray-800">{partner?.name || "未知用户"}</h1>
                  <p className="text-sm text-gray-600">在线</p>
                </div>
              </div>
            </div>

            {/* Delete Button */}
            <button
              onClick={deleteConversation}
              disabled={deleting}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="删除对话"
            >
              {deleting ? (
                <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="card-pink mb-4 flex flex-col" style={{ height: "500px" }}>
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <ModernIcons.Message size={64} color="#ec4899" className="animate-pulse" />
                </div>
                <p className="text-gray-600 text-lg font-medium">还没有消息，开始对话吧！</p>
                <p className="text-gray-500 text-sm mt-2">发送第一条消息来开始你们的对话</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth messages-container">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.fromUserId === partnerId ? "justify-start" : "justify-end"} mb-4`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 ${
                      msg.fromUserId === partnerId
                        ? "message-bubble-received"
                        : "message-bubble-sent"
                    } animate-fade-in`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p
                      className={`text-xs mt-2 ${
                        msg.fromUserId === partnerId ? "text-gray-500" : "text-pink-100"
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              {/* 滚动目标元素 */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="card-pink p-4">
          <div className="flex gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息..."
              className="flex-1 px-4 py-3 message-input focus:outline-none"
              rows={2}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-4 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">发送中...</span>
                </>
              ) : (
                <>
                  <ModernIcons.Send size={18} color="white" />
                  <span className="hidden sm:inline">发送</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
