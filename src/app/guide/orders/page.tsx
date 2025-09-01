"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth";

interface Order {
  id: string;
  status: string;
  service_type: string;
  service_title: string;
  start_time: string;
  duration_hours: number;
  total_amount: number;
  location: string;
  notes: string;
  users: {
    name: string;
    phone: string;
  };
}

export default function GuideOrdersPage() {
  const { session, loading: sessionLoading } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionLoading && session) {
      loadOrders();
    }

    // 监听登录状态变化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ml_session_changed') {
        // 重新检查session并加载订单
        if (session) {
          loadOrders();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [session, sessionLoading]);

  const loadOrders = async () => {
    try {
      const response = await fetch("/api/guide/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (orderId: string, action: 'accept' | 'reject', notes?: string) => {
    setConfirming(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}/confirm-guide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes })
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        loadOrders(); // 重新加载订单
      } else {
        const error = await response.json();
        alert(error.error || "操作失败");
      }
    } catch (error) {
      alert("操作失败");
    } finally {
      setConfirming(null);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "等待收款";
      case "in_progress":
        return "服务中";
      case "completed":
        return "已完成";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">请先登录</h1>
          <a href="/login" className="text-pink-600 hover:text-pink-700">
            前往登录
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">我的订单</h1>
          <button
            onClick={loadOrders}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            刷新
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">暂无订单</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {order.service_title}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>客户：{order.users?.name || "未知"}</p>
                      <p>电话：{order.users?.phone || "未知"}</p>
                      <p>时间：{new Date(order.start_time).toLocaleString()}</p>
                      <p>时长：{order.duration_hours}小时</p>
                      <p>地点：{order.location}</p>
                      <p>金额：¥{order.total_amount}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                {order.notes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{order.notes}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  {order.status === "confirmed" && (
                    <>
                      <button
                        onClick={() => handleConfirmOrder(order.id, 'accept')}
                        disabled={confirming === order.id}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {confirming === order.id ? "处理中..." : "确认接单"}
                      </button>
                      <button
                        onClick={() => {
                          const notes = prompt("请输入拒绝原因（可选）:");
                          if (notes !== null) {
                            handleConfirmOrder(order.id, 'reject', notes);
                          }
                        }}
                        disabled={confirming === order.id}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        拒绝接单
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => {
                      alert(`订单详情：\n订单ID: ${order.id}\n服务类型: ${order.service_title}\n开始时间: ${new Date(order.start_time).toLocaleString()}\n服务时长: ${order.duration_hours}小时\n服务地点: ${order.location}\n总金额: ¥${order.total_amount}\n状态: ${getStatusText(order.status)}`);
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                  >
                    查看详情
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
