"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import AdminGuard from "../../guard";
import { Order } from "@/types/domain";

interface Guide {
  id: string;
  display_name: string;
  hourly_rate: number;
  city: string;
  rating_avg: number;
  rating_count: number;
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableGuides, setAvailableGuides] = useState<Guide[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState("");
  const [assignNotes, setAssignNotes] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${id}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (error) {
      console.error("Failed to load order:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableGuides = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${id}/assign-guide`);
      if (response.ok) {
        const data = await response.json();
        setAvailableGuides(data.guides || []);
      }
    } catch (error) {
      console.error("Failed to load guides:", error);
    }
  };

  const handleAutoAssign = async () => {
    if (!order) return;

    setAssigning(true);
    try {
      const response = await fetch(`/api/admin/orders/${id}/auto-assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        loadOrder(); // 重新加载订单
      } else {
        const error = await response.json();
        alert(error.error || "自动分配失败");
      }
    } catch (error) {
      alert("自动分配失败");
    } finally {
      setAssigning(false);
    }
  };

  const handleManualAssign = async () => {
    if (!selectedGuideId) {
      alert("请选择地陪");
      return;
    }

    setAssigning(true);
    try {
      const response = await fetch(`/api/admin/orders/${id}/assign-guide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guideId: selectedGuideId,
          notes: assignNotes
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setShowAssignModal(false);
        setSelectedGuideId("");
        setAssignNotes("");
        loadOrder(); // 重新加载订单
      } else {
        const error = await response.json();
        alert(error.error || "分配失败");
      }
    } catch (error) {
      alert("分配失败");
    } finally {
      setAssigning(false);
    }
  };

  const openAssignModal = () => {
    loadAvailableGuides();
    setShowAssignModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "confirmed":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      // 兼容旧状态
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
      case "pending":
        return "待分配地陪";
      case "confirmed":
        return "等待收款";
      case "in_progress":
        return "服务中";
      case "completed":
        return "已完成";
      case "cancelled":
        return "已取消";
      // 兼容旧状态
      case "DRAFT":
        return "草稿";
      case "GUIDE_SELECTED":
        return "已选地陪";
      case "PAYMENT_PENDING":
        return "等待收款";
      case "PAID":
        return "已收款";
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

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      </AdminGuard>
    );
  }

  if (!order) {
    return (
      <AdminGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">订单不存在</h1>
            <Link href="/admin/orders/list" className="text-pink-600 hover:text-pink-700">
              返回订单列表
            </Link>
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">订单详情</h1>
              <p className="text-gray-600">订单号：{order.id}</p>
            </div>
            <Link
              href="/admin/orders/list"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-2xl transition-colors"
            >
              返回订单列表
            </Link>
          </div>

          {/* Order Status */}
          <div className="glass-card mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">订单状态</h2>
                <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">创建时间：</span>
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">更新时间：</span>
                  <span>{new Date(order.updatedAt).toLocaleString()}</span>
                </div>
                {order.paymentCollectedAt && (
                  <div>
                    <span className="text-gray-500">收款时间：</span>
                    <span>{new Date(order.paymentCollectedAt).toLocaleString()}</span>
                  </div>
                )}
                {order.completedAt && (
                  <div>
                    <span className="text-gray-500">完成时间：</span>
                    <span>{new Date(order.completedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="glass-card mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">服务详情</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-800 mb-3">基本信息</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">服务类型：</span>
                      <span>
                        {order.requirement.serviceType === "daily" ? "日常陪伴" :
                         order.requirement.serviceType === "mild_entertainment" ? "微醺娱乐" : "同城旅游"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">服务时长：</span>
                      <span>{order.requirement.duration} 小时</span>
                    </div>
                    <div>
                      <span className="text-gray-500">开始时间：</span>
                      <span>{new Date(order.requirement.startTime).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-800 mb-3">地点信息</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">服务区域：</span>
                      <span>{order.requirement.area}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">详细地址：</span>
                      <span>{order.requirement.address}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {order.requirement.specialRequests && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-800 mb-3">特殊要求</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {order.requirement.specialRequests}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="glass-card mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">费用详情</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">定金金额</span>
                  <span>¥{order.depositAmount}</span>
                </div>
                {order.totalAmount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">总金额</span>
                    <span>¥{order.totalAmount}</span>
                  </div>
                )}
                {order.finalAmount && (
                  <div className="flex justify-between font-semibold text-lg">
                    <span>应收金额</span>
                    <span className="text-green-600">¥{order.finalAmount}</span>
                  </div>
                )}
                
                {order.paymentMethod && (
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">收款方式</span>
                      <span>
                        {order.paymentMethod === "cash" ? "现金" :
                         order.paymentMethod === "wechat" ? "微信" :
                         order.paymentMethod === "alipay" ? "支付宝" : "银行转账"}
                      </span>
                    </div>
                    {order.paymentNotes && (
                      <div className="mt-2">
                        <span className="text-gray-600">收款备注：</span>
                        <p className="text-sm text-gray-600 mt-1">{order.paymentNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Guide Assignment */}
          <div className="glass-card mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">地陪分配</h2>

              {order.guideId ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-800 font-medium">已分配地陪</p>
                      <p className="text-green-600 text-sm">地陪ID: {order.guideId}</p>
                      <p className="text-green-600 text-sm">状态: {getStatusText(order.status)}</p>
                    </div>
                    <button
                      onClick={openAssignModal}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      更换地陪
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-yellow-800 font-medium">未分配地陪</p>
                  <p className="text-yellow-600 text-sm">请选择分配方式</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleAutoAssign}
                  disabled={assigning}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-2xl transition-colors disabled:opacity-50"
                >
                  {assigning ? "分配中..." : "智能分配"}
                </button>
                <button
                  onClick={openAssignModal}
                  disabled={assigning}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl transition-colors disabled:opacity-50"
                >
                  手动分配
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          {order.status === "PAYMENT_PENDING" && (
            <div className="glass-card">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">操作</h2>
                <Link
                  href="/admin/payments"
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl transition-colors"
                >
                  确认收款
                </Link>
              </div>
            </div>
          )}

          {/* Manual Assignment Modal */}
          {showAssignModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {order.guideId ? "更换地陪" : "分配地陪"}
                  </h3>
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {availableGuides.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">暂无可用地陪</p>
                  ) : (
                    availableGuides.map((guide) => (
                      <div
                        key={guide.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedGuideId === guide.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedGuideId(guide.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-800">{guide.display_name}</h4>
                            <p className="text-sm text-gray-600">
                              {guide.city} • ¥{guide.hourly_rate}/小时
                            </p>
                            <p className="text-sm text-gray-500">
                              评分: {guide.rating_avg?.toFixed(1) || "暂无"}
                              ({guide.rating_count || 0}条评价)
                            </p>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              checked={selectedGuideId === guide.id}
                              onChange={() => setSelectedGuideId(guide.id)}
                              className="w-4 h-4 text-blue-600"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      备注（可选）
                    </label>
                    <textarea
                      value={assignNotes}
                      onChange={(e) => setAssignNotes(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      rows={3}
                      placeholder="分配备注..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleManualAssign}
                      disabled={!selectedGuideId || assigning}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {assigning ? "分配中..." : "确认分配"}
                    </button>
                    <button
                      onClick={() => setShowAssignModal(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
