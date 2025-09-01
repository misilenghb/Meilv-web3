"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Order {
  id: string;
  userId: string;
  guideId: string;
  serviceCode: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  userPhone?: string;
}

export default function GuideOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"date" | "amount" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await fetch("/api/guide/orders");
      const data = await response.json();
      setOrders(data.items || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await loadOrders(); // Refresh the list
        alert("订单状态更新成功！");
      } else {
        alert("更新失败，请重试");
      }
    } catch (error) {
      console.error("Failed to update order:", error);
      alert("更新失败，请重试");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return "bg-yellow-100 text-yellow-700";
      case "PAID":
        return "bg-blue-100 text-blue-700";
      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-700";
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return "待支付";
      case "PAID":
        return "已支付";
      case "IN_PROGRESS":
        return "服务中";
      case "COMPLETED":
        return "已完成";
      case "CANCELLED":
        return "已取消";
      default:
        return status;
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    setSelectedOrders(filteredOrders.map(order => order.id));
  };

  const clearSelection = () => {
    setSelectedOrders([]);
  };

  const batchUpdateStatus = async (status: string) => {
    if (selectedOrders.length === 0) return;

    try {
      await Promise.all(
        selectedOrders.map(orderId =>
          fetch(`/api/orders/${orderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          })
        )
      );
      await loadOrders();
      clearSelection();
      alert(`已批量更新 ${selectedOrders.length} 个订单状态`);
    } catch (error) {
      console.error("Batch update failed:", error);
      alert("批量更新失败，请重试");
    }
  };

  const exportOrders = async () => {
    try {
      const queryParams = new URLSearchParams({
        filter,
        search: searchTerm,
        startDate: dateRange.start,
        endDate: dateRange.end,
      });

      const response = await fetch(`/api/guide/orders/export?${queryParams}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `orders-${new Date().toISOString().split('T')[0]}.xlsx`;
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

  const filteredOrders = orders
    .filter(order => {
      // Status filter
      if (filter !== "all" && order.status !== filter) return false;

      // Search filter
      if (searchTerm && !order.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !order.userName?.toLowerCase().includes(searchTerm.toLowerCase())) return false;

      // Date range filter
      if (dateRange.start && new Date(order.createdAt) < new Date(dateRange.start)) return false;
      if (dateRange.end && new Date(order.createdAt) > new Date(dateRange.end)) return false;

      return true;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

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
        <div className="flex items-center gap-4 mb-8">
          <Link href="/guide-dashboard" className="text-pink-600 hover:text-pink-700">
            ← 返回工作台
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">订单管理</h1>
            <p className="text-gray-600">管理您的服务订单</p>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="card-pink p-6 mb-8">
          <div className="space-y-6">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "全部" },
                { key: "PAID", label: "已支付" },
                { key: "IN_PROGRESS", label: "服务中" },
                { key: "COMPLETED", label: "已完成" },
                { key: "CANCELLED", label: "已取消" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    filter === tab.key
                      ? "bg-pink-500 text-white"
                      : "bg-white/70 text-gray-700 hover:bg-pink-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search and Date Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">搜索订单</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="订单号或客户姓名"
                  className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">开始日期</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">结束日期</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">排序方式</label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [by, order] = e.target.value.split('-');
                    setSortBy(by as any);
                    setSortOrder(order as any);
                  }}
                  className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="date-desc">最新订单</option>
                  <option value="date-asc">最早订单</option>
                  <option value="amount-desc">金额从高到低</option>
                  <option value="amount-asc">金额从低到高</option>
                  <option value="status-asc">状态排序</option>
                </select>
              </div>
            </div>

            {/* Batch Operations */}
            {selectedOrders.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-blue-700 font-medium">
                    已选择 {selectedOrders.length} 个订单
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => batchUpdateStatus("COMPLETED")}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      批量完成
                    </button>
                    <button
                      onClick={() => batchUpdateStatus("CANCELLED")}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      批量取消
                    </button>
                    <button
                      onClick={clearSelection}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      清除选择
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Export and Select All */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={selectAllOrders}
                  className="text-pink-600 hover:text-pink-700 text-sm"
                >
                  全选当前页
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={clearSelection}
                  className="text-gray-600 hover:text-gray-700 text-sm"
                >
                  清除选择
                </button>
              </div>
              <button
                onClick={exportOrders}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                📊 导出数据
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="card-pink p-8 text-center">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-600">暂无订单</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="card-pink p-6">
                <div className="flex items-start gap-4 mb-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => toggleOrderSelection(order.id)}
                    className="mt-1 w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />

                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          订单 #{order.id.slice(-8)}
                        </h3>
                        <p className="text-gray-600">
                          客户：{order.userName || "未知"} ·
                          服务：{order.serviceCode === "daily" ? "日常陪伴" :
                                order.serviceCode === "mild_entertainment" ? "微醺娱乐" :
                                order.serviceCode === "local_tour" ? "同城旅游" : order.serviceCode} ·
                          金额：¥{order.amount}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>创建：{new Date(order.createdAt).toLocaleString()}</span>
                          {order.updatedAt !== order.createdAt && (
                            <span>更新：{new Date(order.updatedAt).toLocaleString()}</span>
                          )}
                          {order.userPhone && (
                            <span>电话：{order.userPhone}</span>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {order.status === "PAID" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "IN_PROGRESS")}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      开始服务
                    </button>
                  )}
                  {order.status === "IN_PROGRESS" && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.id, "COMPLETED")}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        完成服务
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        取消订单
                      </button>
                    </>
                  )}
                  <Link
                    href={`/orders/${order.id}`}
                    className="border-2 border-pink-500 text-pink-500 hover:bg-pink-50 px-4 py-2 rounded-lg transition-colors"
                  >
                    查看详情
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
