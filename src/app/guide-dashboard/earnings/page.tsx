"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface EarningsStats {
  totalEarnings: number;
  monthlyEarnings: number;
  weeklyEarnings: number;
  dailyEarnings: number;
  totalOrders: number;
  completedOrders: number;
  averageOrderValue: number;
  topService: string;
}

interface EarningsData {
  date: string;
  amount: number;
  orders: number;
}

interface ServiceStats {
  serviceCode: string;
  serviceName: string;
  totalEarnings: number;
  orderCount: number;
  averagePrice: number;
}

export default function EarningsPage() {
  const [stats, setStats] = useState<EarningsStats | null>(null);
  const [earningsData, setEarningsData] = useState<EarningsData[]>([]);
  const [serviceStats, setServiceStats] = useState<ServiceStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");

  useEffect(() => {
    loadEarningsData();
  }, [timeRange]);

  const loadEarningsData = async () => {
    try {
      const [statsRes, chartRes, serviceRes] = await Promise.all([
        fetch("/api/guide/earnings/stats"),
        fetch(`/api/guide/earnings/chart?range=${timeRange}`),
        fetch("/api/guide/earnings/services"),
      ]);

      const [statsData, chartData, serviceData] = await Promise.all([
        statsRes.json(),
        chartRes.json(),
        serviceRes.json(),
      ]);

      setStats(statsData);
      setEarningsData(chartData.items || []);
      setServiceStats(serviceData.items || []);
    } catch (error) {
      console.error("Failed to load earnings data:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format: "excel" | "pdf") => {
    try {
      const response = await fetch(`/api/guide/earnings/export?format=${format}&range=${timeRange}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `earnings-${timeRange}-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("导出失败，请重试");
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("导出失败，请重试");
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/guide-dashboard" className="text-pink-600 hover:text-pink-700">
              ← 返回工作台
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">收入统计</h1>
              <p className="text-gray-600">查看您的收入趋势和业务分析</p>
            </div>
          </div>
          
          {/* Export Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => exportData("excel")}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              📊 导出Excel
            </button>
            <button
              onClick={() => exportData("pdf")}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              📄 导出PDF
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-pink p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              ¥{stats?.totalEarnings?.toLocaleString() || 0}
            </div>
            <div className="text-gray-600">总收入</div>
          </div>
          <div className="card-pink p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              ¥{stats?.monthlyEarnings?.toLocaleString() || 0}
            </div>
            <div className="text-gray-600">本月收入</div>
          </div>
          <div className="card-pink p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              ¥{stats?.averageOrderValue?.toFixed(0) || 0}
            </div>
            <div className="text-gray-600">平均订单价值</div>
          </div>
          <div className="card-pink p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {stats?.completedOrders || 0}
            </div>
            <div className="text-gray-600">完成订单数</div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="card-pink p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">收入趋势</h3>
            <div className="flex gap-2">
              {[
                { key: "week", label: "最近7天" },
                { key: "month", label: "最近30天" },
                { key: "year", label: "最近12个月" },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setTimeRange(option.key as any)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    timeRange === option.key
                      ? "bg-pink-500 text-white"
                      : "bg-white/70 text-gray-700 hover:bg-pink-100"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Simple Chart Placeholder */}
          <div className="h-64 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl flex items-center justify-center border border-pink-100">
            <div className="text-center">
              <div className="text-4xl mb-4">📈</div>
              <p className="text-gray-600">收入趋势图表</p>
              <p className="text-sm text-gray-500 mt-2">
                {earningsData.length > 0 
                  ? `${timeRange === 'week' ? '7天' : timeRange === 'month' ? '30天' : '12个月'}内共 ${earningsData.length} 条记录`
                  : "暂无数据"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Service Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card-pink p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">服务类型收入分析</h3>
            <div className="space-y-4">
              {serviceStats.map((service, index) => (
                <div key={service.serviceCode} className="bg-white/70 rounded-2xl p-4 border border-pink-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{service.serviceName}</h4>
                    <span className="text-lg font-bold text-green-600">
                      ¥{service.totalEarnings.toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>订单数：{service.orderCount}</div>
                    <div>平均价格：¥{service.averagePrice.toFixed(0)}</div>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-pink-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.max(10, (service.totalEarnings / Math.max(...serviceStats.map(s => s.totalEarnings))) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-pink p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">业务洞察</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                    💡
                  </div>
                  <h4 className="font-medium text-gray-800">最受欢迎服务</h4>
                </div>
                <p className="text-gray-600 text-sm">
                  {stats?.topService || "暂无数据"}是您最受欢迎的服务类型
                </p>
              </div>

              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                    📊
                  </div>
                  <h4 className="font-medium text-gray-800">收入增长</h4>
                </div>
                <p className="text-gray-600 text-sm">
                  本月收入 ¥{stats?.monthlyEarnings?.toLocaleString() || 0}，
                  平均每单 ¥{stats?.averageOrderValue?.toFixed(0) || 0}
                </p>
              </div>

              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm">
                    🎯
                  </div>
                  <h4 className="font-medium text-gray-800">完成率</h4>
                </div>
                <p className="text-gray-600 text-sm">
                  订单完成率：{stats?.totalOrders ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
