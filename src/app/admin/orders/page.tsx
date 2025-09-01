"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminGuard from "../guard";

interface OrderStats {
  total: number;
  pendingPayment: number;
  paid: number;
  inProgress: number;
  completed: number;
  pendingAmount: number;
  todayRevenue: number;
}

export default function AdminOrdersPage() {
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pendingPayment: 0,
    paid: 0,
    inProgress: 0,
    completed: 0,
    pendingAmount: 0,
    todayRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderStats();
  }, []);

  const loadOrderStats = async () => {
    try {
      const response = await fetch("/api/admin/order-stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to load order stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">订单管理</h1>
              <p className="text-gray-600">订单监控、人工收款、异常处理</p>
            </div>
            <Link
              href="/admin"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-2xl transition-colors"
            >
              返回管理后台
            </Link>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.total}</div>
              <div className="text-gray-600 text-sm">总订单数</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.pendingPayment}</div>
              <div className="text-gray-600 text-sm">待收款订单</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">¥{stats.pendingAmount}</div>
              <div className="text-gray-600 text-sm">待收款金额</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-pink-600 mb-2">¥{stats.todayRevenue}</div>
              <div className="text-gray-600 text-sm">今日收入</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Link
              href="/admin/payments"
              className="glass-card p-6 hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center text-white text-xl">
                  💰
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 group-hover:text-green-600 transition-colors">人工收款</h3>
                  <div className="text-sm text-green-600 font-medium">
                    {stats.pendingPayment} 笔待处理
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">处理线下收款确认，管理收款记录</p>
            </Link>

            <Link
              href="/admin/orders/list"
              className="glass-card p-6 hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl">
                  📋
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">订单列表</h3>
                  <div className="text-sm text-blue-600 font-medium">
                    {stats.total} 笔订单
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">查看所有订单，监控订单状态</p>
            </Link>

            <div className="glass-card p-6 opacity-60">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-xl flex items-center justify-center text-white text-xl">
                  🛡️
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">异常处理</h3>
                  <div className="text-sm text-orange-600 font-medium">待开发</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">处理订单异常、投诉、退款</p>
            </div>

            <div className="glass-card p-6 opacity-60">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-xl flex items-center justify-center text-white text-xl">
                  📊
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">收入统计</h3>
                  <div className="text-sm text-orange-600 font-medium">待开发</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">收入分析、趋势图表、财务报表</p>
            </div>

            <div className="glass-card p-6 opacity-60">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-xl flex items-center justify-center text-white text-xl">
                  🔄
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">退款管理</h3>
                  <div className="text-sm text-orange-600 font-medium">待开发</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">退款申请、审核、处理流程</p>
            </div>

            <div className="glass-card p-6 opacity-60">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-xl flex items-center justify-center text-white text-xl">
                  ⚙️
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">订单设置</h3>
                  <div className="text-sm text-orange-600 font-medium">待开发</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">订单规则、价格策略、服务配置</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-card">
            <div className="p-6 border-b border-pink-100">
              <h2 className="text-xl font-semibold text-gray-800">最近活动</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-sm">💰</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      有 {stats.pendingPayment} 笔订单等待收款确认
                    </p>
                    <p className="text-xs text-gray-600">
                      总金额 ¥{stats.pendingAmount}，请及时处理
                    </p>
                  </div>
                  <Link
                    href="/admin/payments"
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-2xl text-sm transition-colors"
                  >
                    立即处理
                  </Link>
                </div>

                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">✅</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      今日已完成 {stats.completed} 笔订单
                    </p>
                    <p className="text-xs text-gray-600">
                      收入 ¥{stats.todayRevenue}，运营状况良好
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">🔄</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      当前有 {stats.inProgress} 笔订单正在进行中
                    </p>
                    <p className="text-xs text-gray-600">
                      服务质量监控正常
                    </p>
                  </div>
                  <Link
                    href="/admin/orders/list?status=in_progress"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-2xl text-sm transition-colors"
                  >
                    查看详情
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
