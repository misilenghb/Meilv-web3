"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AdminGuard from "../../guard";
import { Order } from "@/types/domain";

function AdminOrderListContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get("status") || "all");

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== "all") {
        params.append("status", filter);
      }
      
      const response = await fetch(`/api/admin/orders?${params}`);
      const data = await response.json();
      setOrders(data.items || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "GUIDE_SELECTED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "PAYMENT_PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PAID":
        return "bg-green-100 text-green-800 border-green-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "草稿";
      case "GUIDE_SELECTED":
        return "已选地陪";
      case "DEPOSIT_PENDING":
        return "等待收取保证金";
      case "DEPOSIT_PAID":
        return "等待收取尾款";
      case "PAYMENT_PENDING":
        return "等待收款";
      case "PAID":
        return "已收款";
      case "confirmed":
        return "已确认";
      case "pending":
        return "待处理";
      case "IN_PROGRESS":
        return "进行中";
      case "COMPLETED":
        return "已完成";
      case "CANCELLED":
        return "已取消";
      default:
        return status;
    }
  };

  const filterOptions = [
    { value: "all", label: "全部订单" },
    { value: "pending", label: "待处理" },
    { value: "confirmed", label: "已确认" },
    { value: "DEPOSIT_PENDING", label: "人工收费中" },
    { value: "DEPOSIT_PAID", label: "等待收取尾款" },
    { value: "PAYMENT_PENDING", label: "等待收款" },
    { value: "PAID", label: "已收款" },
    { value: "IN_PROGRESS", label: "进行中" },
    { value: "COMPLETED", label: "已完成" },
    { value: "CANCELLED", label: "已取消" },
  ];

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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">订单列表</h1>
              <p className="text-gray-600">查看和管理所有订单</p>
            </div>
            <Link
              href="/admin/orders"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-2xl transition-colors"
            >
              返回订单管理
            </Link>
          </div>

          {/* Filters */}
          <div className="glass-card mb-6">
            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors ${
                      filter === option.value
                        ? "bg-pink-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="glass-card">
            <div className="p-6 border-b border-pink-100">
              <h2 className="text-xl font-semibold text-gray-800">
                订单列表 ({orders.length})
              </h2>
            </div>
            
            {orders.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">暂无订单</h3>
                <p className="text-gray-600">
                  {filter === "all" ? "还没有任何订单" : `没有${filterOptions.find(f => f.value === filter)?.label}的订单`}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-pink-100">
                {orders.map((order) => (
                  <div key={order.id} className="p-6 hover:bg-pink-25 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <span className="font-mono text-sm text-gray-500">#{order.id}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-500">服务类型：</span>
                            <span className="font-medium">
                              {order.requirement.serviceType === "daily" ? "日常陪伴" :
                               order.requirement.serviceType === "mild_entertainment" ? "微醺娱乐" : "同城旅游"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">时长：</span>
                            <span className="font-medium">{order.requirement.duration}小时</span>
                          </div>
                          <div>
                            <span className="text-gray-500">区域：</span>
                            <span className="font-medium">{order.requirement.area}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">金额：</span>
                            <span className="font-bold text-green-600">
                              ¥{order.finalAmount || order.totalAmount || order.depositAmount}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <span>开始时间：{new Date(order.requirement.startTime).toLocaleString()}</span>
                          {order.guideId && (
                            <>
                              <span className="mx-2">•</span>
                              <span>地陪ID：{order.guideId}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-2xl text-sm transition-colors"
                        >
                          查看详情
                        </Link>
                        {order.status === "PAYMENT_PENDING" && (
                          <Link
                            href={`/admin/payments`}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-2xl text-sm transition-colors"
                          >
                            确认收款
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}

export default function AdminOrderListPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    }>
      <AdminOrderListContent />
    </Suspense>
  );
}
