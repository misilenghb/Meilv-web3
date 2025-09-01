"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import VerificationStatusCard from "@/components/VerificationStatusCard";

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalEarnings: number;
  monthlyEarnings: number;
  averageRating: number;
  totalReviews: number;
}

interface VerificationStatus {
  status: "unverified" | "pending" | "verified" | "rejected" | "suspended";
  applicationId?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  canReapply?: boolean;
}

interface RecentOrder {
  id: string;
  userId: string;
  userName: string;
  serviceCode: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function GuideDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/guide/dashboard/stats").then(r => r.json()),
      fetch("/api/guide/dashboard/recent-orders").then(r => r.json()),
      fetch("/api/guide/verification-status").then(r => r.json()),
    ])
    .then(([statsData, ordersData, verificationData]) => {
      setStats(statsData);
      setRecentOrders(ordersData.items || []);
      setVerificationStatus(verificationData.status || null);
    })
    .catch(err => {
      console.error("Failed to load dashboard data:", err);
    })
    .finally(() => {
      setLoading(false);
    });
  }, []);



  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT": return "bg-yellow-100 text-yellow-700";
      case "PAID": return "bg-blue-100 text-blue-700";
      case "IN_PROGRESS": return "bg-green-100 text-green-700";
      case "COMPLETED": return "bg-gray-100 text-gray-700";
      case "CANCELLED": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT": return "待支付";
      case "PAID": return "已支付";
      case "IN_PROGRESS": return "进行中";
      case "COMPLETED": return "已完成";
      case "CANCELLED": return "已取消";
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="card-pink p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            <p className="text-gray-600 mt-2">加载中...</p>
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">地陪工作台</h1>
          <p className="text-gray-600">管理您的服务订单和收入</p>
        </div>

        {/* Verification Status Card */}
        {verificationStatus && (
          <div className="mb-8">
            <VerificationStatusCard status={verificationStatus} />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-pink p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats?.totalOrders || 0}
            </div>
            <div className="text-gray-600">总订单数</div>
          </div>
          <div className="card-pink p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {stats?.pendingOrders || 0}
            </div>
            <div className="text-gray-600">待处理</div>
          </div>
          <div className="card-pink p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats?.completedOrders || 0}
            </div>
            <div className="text-gray-600">已完成</div>
          </div>
          <div className="card-pink p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              ¥{stats?.totalEarnings || 0}
            </div>
            <div className="text-gray-600">总收入</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/guide-dashboard/orders" className="card-pink p-6 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl">
                📋
              </div>
              <div>
                <h3 className="font-bold text-gray-800 group-hover:text-pink-600 transition-colors">订单管理</h3>
                <p className="text-sm text-gray-600">查看和处理订单</p>
              </div>
            </div>
          </Link>

          <Link href="/guide-dashboard/earnings" className="card-pink p-6 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center text-white text-xl">
                💰
              </div>
              <div>
                <h3 className="font-bold text-gray-800 group-hover:text-pink-600 transition-colors">收入统计</h3>
                <p className="text-sm text-gray-600">查看收入详情</p>
              </div>
            </div>
          </Link>

          <Link href="/guide-dashboard/profile" className="card-pink p-6 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl">
                👤
              </div>
              <div>
                <h3 className="font-bold text-gray-800 group-hover:text-pink-600 transition-colors">个人资料</h3>
                <p className="text-sm text-gray-600">编辑服务信息</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card-pink p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">本月表现</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">本月收入</span>
                <span className="font-bold text-green-600">¥{stats?.monthlyEarnings || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">平均评分</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-yellow-600">{stats?.averageRating || 0}</span>
                  <div className="flex text-yellow-400">
                    {"★".repeat(Math.floor(stats?.averageRating || 0))}
                    {"☆".repeat(5 - Math.floor(stats?.averageRating || 0))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">总评价数</span>
                <span className="font-bold text-blue-600">{stats?.totalReviews || 0}条</span>
              </div>
            </div>
          </div>

          <div className="card-pink p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">服务状态</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">在线状态</span>
                </div>
                <span className="text-green-600 font-medium">正常接单</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">认证状态</span>
                </div>
                <span className="text-blue-600 font-medium">已认证</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">服务等级</span>
                </div>
                <span className="text-purple-600 font-medium">金牌地陪</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card-pink p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">最近订单</h3>
            <Link href="/guide-dashboard/orders" className="text-pink-600 hover:text-pink-700 text-sm">
              查看全部 →
            </Link>
          </div>
          
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-600">暂无订单</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="bg-white/70 rounded-2xl p-4 border border-pink-100">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-gray-800">{order.userName}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        服务：{order.serviceCode === "daily" ? "日常陪伴" : order.serviceCode === "mild_entertainment" ? "微醺娱乐" : "同城旅游"} · 
                        金额：¥{order.amount} · 
                        时间：{new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Link
                      href={`/guide-dashboard/orders/${order.id}`}
                      className="text-pink-600 hover:text-pink-700 text-sm"
                    >
                      查看详情
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
