"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface OrderDetail {
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
  userEmail?: string;
  notes?: string;
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    params.then(p => {
      loadOrderDetail(p.id);
    });
  }, [params]);

  const loadOrderDetail = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
        setNotes(data.notes || "");
      } else {
        console.error("Failed to load order");
      }
    } catch (error) {
      console.error("Failed to load order:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (status: string) => {
    if (!order) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrder(updatedOrder);
        alert("订单状态更新成功！");
      } else {
        alert("更新失败，请重试");
      }
    } catch (error) {
      console.error("Failed to update order:", error);
      alert("更新失败，请重试");
    } finally {
      setUpdating(false);
    }
  };

  const saveNotes = async () => {
    if (!order) return;
    
    try {
      const response = await fetch(`/api/orders/${order.id}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (response.ok) {
        setOrder(prev => prev ? { ...prev, notes } : null);
        alert("备注保存成功！");
      } else {
        alert("保存失败，请重试");
      }
    } catch (error) {
      console.error("Failed to save notes:", error);
      alert("保存失败，请重试");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "PAID":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "COMPLETED":
        return "bg-green-100 text-green-700 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
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

  const getServiceName = (serviceCode: string) => {
    switch (serviceCode) {
      case "daily":
        return "日常陪伴";
      case "mild_entertainment":
        return "微醺娱乐";
      case "local_tour":
        return "同城旅游";
      default:
        return serviceCode;
    }
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

  if (!order) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card-pink p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">订单不存在</h1>
            <p className="text-gray-600 mb-6">抱歉，您查找的订单不存在或已被删除</p>
            <Link
              href="/guide-dashboard/orders"
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl transition-colors"
            >
              返回订单列表
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/guide-dashboard/orders" className="text-pink-600 hover:text-pink-700">
            ← 返回订单列表
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">订单详情</h1>
            <p className="text-gray-600">订单号：{order.id}</p>
          </div>
        </div>

        {/* Order Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="card-pink p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">订单信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">服务类型</label>
                  <p className="text-gray-900">{getServiceName(order.serviceCode)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">订单金额</label>
                  <p className="text-2xl font-bold text-green-600">¥{order.amount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">创建时间</label>
                  <p className="text-gray-900">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">更新时间</label>
                  <p className="text-gray-900">{new Date(order.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="card-pink p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">客户信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">客户姓名</label>
                  <p className="text-gray-900">{order.userName || "未知"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
                  <p className="text-gray-900">{order.userPhone || "未提供"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">邮箱地址</label>
                  <p className="text-gray-900">{order.userEmail || "未提供"}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="card-pink p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">订单备注</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="添加订单备注..."
                rows={4}
                className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={saveNotes}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  保存备注
                </button>
              </div>
            </div>
          </div>

          {/* Status and Actions */}
          <div className="space-y-6">
            {/* Status */}
            <div className="card-pink p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">订单状态</h3>
              <div className={`px-4 py-3 rounded-xl border-2 text-center ${getStatusColor(order.status)}`}>
                <div className="text-lg font-bold">{getStatusText(order.status)}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="card-pink p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">操作</h3>
              <div className="space-y-3">
                {order.status === "PAID" && (
                  <button
                    onClick={() => updateOrderStatus("IN_PROGRESS")}
                    disabled={updating}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {updating ? "更新中..." : "开始服务"}
                  </button>
                )}
                {order.status === "IN_PROGRESS" && (
                  <>
                    <button
                      onClick={() => updateOrderStatus("COMPLETED")}
                      disabled={updating}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {updating ? "更新中..." : "完成服务"}
                    </button>
                    <button
                      onClick={() => updateOrderStatus("CANCELLED")}
                      disabled={updating}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {updating ? "更新中..." : "取消订单"}
                    </button>
                  </>
                )}
                
                {/* Contact Actions */}
                {order.userPhone && (
                  <a
                    href={`tel:${order.userPhone}`}
                    className="block w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg transition-colors text-center"
                  >
                    📞 拨打电话
                  </a>
                )}
                
                <Link
                  href={`/messages/${order.userId}`}
                  className="block w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-lg transition-colors text-center"
                >
                  💌 发送消息
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
