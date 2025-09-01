"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ModernIcons } from "@/components/icons/ModernIcons";

interface Conversation {
  partnerId: string;
  partnerName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deletingConversation, setDeletingConversation] = useState<string | null>(null);

  useEffect(() => {
    // Get current user from session
    const getCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        if (data.session?.userId) {
          setCurrentUserId(data.session.userId);
        }
      } catch (err) {
        console.error("Failed to get current user:", err);
      }
    };

    getCurrentUser();

    // 监听登录状态变化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ml_session_changed') {
        getCurrentUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    fetchConversations();
    // Poll for updates every 3 seconds for better responsiveness
    const interval = setInterval(fetchConversations, 3000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  async function fetchConversations() {
    if (!currentUserId) return;

    try {
      const res = await fetch(`/api/messages/conversations?userId=${currentUserId}`);
      const data = await res.json();
      setConversations(data.items || []);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  }

  const formatTime = (timeStr: string) => {
    const time = new Date(timeStr);
    const now = new Date();
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "刚刚";
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return time.toLocaleDateString();
  };

  const deleteConversation = async (partnerId: string, partnerName: string, event: React.MouseEvent) => {
    event.preventDefault(); // 阻止Link的默认行为
    event.stopPropagation();

    if (!confirm(`确定要删除与 ${partnerName} 的所有对话消息吗？此操作不可撤销。`)) {
      return;
    }

    setDeletingConversation(partnerId);
    try {
      const response = await fetch(`/api/messages?partnerId=${partnerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // 从列表中移除已删除的对话
        setConversations(prev => prev.filter(conv => conv.partnerId !== partnerId));
        alert('对话已删除');
      } else {
        const error = await response.json();
        alert(`删除失败：${error.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      alert('删除失败，请检查网络连接');
    } finally {
      setDeletingConversation(null);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 messages-container">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ModernIcons.Message size={32} color="#ec4899" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">消息中心</h1>
              <p className="text-gray-600 mt-1">与地陪保持联系，获得更好的服务体验</p>
            </div>
          </div>
          <Link
            href="/messages/new"
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-4 py-2 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">新建对话</span>
          </Link>
        </div>

        {/* Messages List */}
        <div className="card-pink p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              <p className="text-gray-600 mt-2">加载中...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-6">
                <ModernIcons.Message size={80} color="#ec4899" className="animate-pulse" />
              </div>
              <p className="text-gray-600 mb-2 text-lg font-medium">暂无对话</p>
              <p className="text-sm text-gray-500">完成订单后可与地陪开始对话</p>
              <div className="mt-6">
                <Link
                  href="/guides"
                  className="inline-flex items-center gap-2 bg-pink-50 hover:bg-pink-100 text-pink-600 px-4 py-2 rounded-full transition-colors"
                >
                  <ModernIcons.Search size={16} />
                  浏览地陪
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <div
                  key={conv.partnerId}
                  className="relative bg-white/70 rounded-2xl p-4 border border-pink-100 hover:bg-white/90 hover:shadow-md transition-all duration-200 group"
                >
                  <Link
                    href={`/messages/${conv.partnerId}`}
                    className="block"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {conv.partnerName.charAt(0)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-8">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-800 truncate">{conv.partnerName}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{formatTime(conv.lastMessageTime)}</span>
                            {conv.unreadCount > 0 && (
                              <div className="bg-pink-500 text-white rounded-full text-xs px-2 py-1 min-w-[20px] text-center">
                                {conv.unreadCount}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                      </div>
                    </div>
                  </Link>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => deleteConversation(conv.partnerId, conv.partnerName, e)}
                    disabled={deletingConversation === conv.partnerId}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                    title="删除对话"
                  >
                    {deletingConversation === conv.partnerId ? (
                      <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
