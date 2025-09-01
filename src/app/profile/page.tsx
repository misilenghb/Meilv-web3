"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ModernIcons } from "@/components/icons/ModernIcons";

interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  createdAt: string;
}

interface BookingSummary {
  total: number;
  completed: number;
  pending: number;
  totalSpent: number;
}

interface FavoriteGuide {
  id: string;
  displayName: string;
  city: string;
  ratingAvg: number;
  avatarUrl?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookingSummary, setBookingSummary] = useState<BookingSummary | null>(null);
  const [favoriteGuides, setFavoriteGuides] = useState<FavoriteGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/session").then(r => r.json()),
      fetch("/api/profile").then(r => r.json()),
      fetch("/api/profile/bookings-summary").then(r => r.json()),
      fetch("/api/profile/favorites").then(r => r.json()),
    ])
    .then(([sessionData, profileData, bookingsData, favoritesData]) => {
      setUserRole(sessionData.session?.role || null);
      setProfile(profileData);
      setBookingSummary(bookingsData);
      setFavoriteGuides(favoritesData.items || []);
    })
    .catch(err => {
      console.error("Failed to load profile data:", err);
    })
    .finally(() => {
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    if (logoutLoading) return;

    setLogoutLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        // 退出成功，跳转到首页
        window.location.href = "/";
      } else {
        alert("退出登录失败，请重试");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("退出登录失败，请重试");
    } finally {
      setLogoutLoading(false);
    }
  };

  if (loading || !profile) {
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

  if (!profile) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card-pink p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">未找到用户信息</h1>
            <Link href="/login" className="text-pink-600 hover:text-pink-700">
              请先登录
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">个人中心</h1>
          <p className="text-gray-600">管理您的个人信息和服务记录</p>
        </div>

        {/* Profile Card */}
        <div className="card-pink p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {profile.name?.charAt(0) || '用'}
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{profile.name || '用户'}</h2>
              <div className="space-y-1 text-gray-600">
                <p>📱 {profile.phone || '未设置'}</p>
                {profile.email && <p>📧 {profile.email}</p>}
                {profile.location && <p>📍 {profile.location}</p>}
                <p>🗓️ 注册时间：{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '未知'}</p>
              </div>
              {profile.bio && (
                <p className="mt-3 text-gray-700 italic">"{profile.bio}"</p>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* 地陪工作台入口 - 只对地陪用户显示 */}
              {userRole === "guide" && (
                <Link
                  href="/guide-dashboard"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full transition-all duration-200 text-center flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <ModernIcons.Users size={20} color="white" />
                  地陪工作台
                </Link>
              )}
              <Link
                href="/profile/edit"
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full transition-colors text-center flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                编辑资料
              </Link>
              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {logoutLoading ? "退出中..." : "退出登录"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-pink p-6 text-center">
            <div className="text-3xl font-bold text-pink-600 mb-2">
              {bookingSummary?.total || 0}
            </div>
            <div className="text-gray-600">总预约数</div>
          </div>
          <div className="card-pink p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {bookingSummary?.completed || 0}
            </div>
            <div className="text-gray-600">已完成</div>
          </div>
          <div className="card-pink p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {bookingSummary?.pending || 0}
            </div>
            <div className="text-gray-600">进行中</div>
          </div>
          <div className="card-pink p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              ¥{bookingSummary?.totalSpent || 0}
            </div>
            <div className="text-gray-600">总消费</div>
          </div>
        </div>

        {/* 地陪专属区域 - 只对地陪用户显示 */}
        {userRole === "guide" && (
          <div className="card-pink p-6 mb-8 border-l-4 border-purple-500">
            <div className="flex items-center gap-3 mb-4">
              <ModernIcons.Users size={24} color="#8b5cf6" />
              <h2 className="text-xl font-bold text-gray-800">地陪服务中心</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/guide-dashboard"
                className="bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 p-4 rounded-lg transition-all duration-200 border border-purple-200 hover:border-purple-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">工作台</h3>
                    <p className="text-sm text-gray-600">管理订单和服务</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/guide-dashboard/profile"
                className="bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 p-4 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">地陪资料</h3>
                    <p className="text-sm text-gray-600">编辑服务信息</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/guide-dashboard/earnings"
                className="bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 p-4 rounded-lg transition-all duration-200 border border-green-200 hover:border-green-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">收益统计</h3>
                    <p className="text-sm text-gray-600">查看收入明细</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/my-bookings" className="card-pink p-6 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl">
                📅
              </div>
              <div>
                <h3 className="font-bold text-gray-800 group-hover:text-pink-600 transition-colors">我的预约</h3>
                <p className="text-sm text-gray-600">查看预约历史和状态</p>
              </div>
            </div>
          </Link>

          <Link href="/messages" className="card-pink p-6 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center text-white text-xl">
                💬
              </div>
              <div>
                <h3 className="font-bold text-gray-800 group-hover:text-pink-600 transition-colors">消息中心</h3>
                <p className="text-sm text-gray-600">与地陪保持联系</p>
              </div>
            </div>
          </Link>

          <Link href="/change-password" className="card-pink p-6 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-xl">
                🔒
              </div>
              <div>
                <h3 className="font-bold text-gray-800 group-hover:text-pink-600 transition-colors">修改密码</h3>
                <p className="text-sm text-gray-600">更改登录密码</p>
              </div>
            </div>
          </Link>

          <Link href="/profile/settings" className="card-pink p-6 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl">
                ⚙️
              </div>
              <div>
                <h3 className="font-bold text-gray-800 group-hover:text-pink-600 transition-colors">账户设置</h3>
                <p className="text-sm text-gray-600">隐私和通知设置</p>
              </div>
            </div>
          </Link>

          <Link href="/complaints" className="card-pink p-6 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-500 rounded-xl flex items-center justify-center text-white text-xl">
                ⚠️
              </div>
              <div>
                <h3 className="font-bold text-gray-800 group-hover:text-pink-600 transition-colors">投诉管理</h3>
                <p className="text-sm text-gray-600">查看和管理投诉记录</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Favorite Guides */}
        <div className="card-pink p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">收藏的地陪</h3>
            <Link href="/profile/favorites" className="text-pink-600 hover:text-pink-700 text-sm">
              查看全部 →
            </Link>
          </div>
          
          {favoriteGuides.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">💝</div>
              <p className="text-gray-600 mb-4">还没有收藏的地陪</p>
              <Link href="/guides" className="text-pink-600 hover:text-pink-700">
                去发现优质地陪 →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteGuides.slice(0, 3).map((guide) => (
                <Link
                  key={guide.id}
                  href={`/guides/${guide.id}`}
                  className="bg-white/70 rounded-2xl p-4 border border-pink-100 hover:bg-white/90 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold">
                      {guide.displayName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{guide.displayName}</h4>
                      <p className="text-sm text-gray-600">{guide.city}</p>
                      <div className="flex items-center gap-1 text-xs text-yellow-600">
                        ★ {guide.ratingAvg}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
