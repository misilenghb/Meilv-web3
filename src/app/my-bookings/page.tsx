"use client";

import { useState, useEffect } from "react";
import { ModernIcons } from "@/components/icons/ModernIcons";
import Link from "next/link";
import { supabaseArrayToFrontend, ORDER_STATUS_TEXT, ORDER_STATUS_COLOR, type SupabaseOrder } from "@/lib/order-adapter";
import type { Order, RefundMethod, RefundAccountInfo } from "@/types/domain";

export default function MyBookingsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isRefunding, setIsRefunding] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [showRefundModal, setShowRefundModal] = useState<string | null>(null);
  // 退款渠道相关状态
  const [refundMethod, setRefundMethod] = useState<RefundMethod>("alipay");
  const [refundAccountInfo, setRefundAccountInfo] = useState<RefundAccountInfo>({
    account: "",
    name: "",
    bank: ""
  });

  useEffect(() => {
    fetchBookings();

    // 监听登录状态变化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ml_session_changed') {
        fetchBookings();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") {
        params.append("status", filter);
      }

      const response = await fetch(`/api/orders?${params}`);
      if (response.ok) {
        const data = await response.json();
        // 转换Supabase数据为前端格式
        const frontendOrders = supabaseArrayToFrontend(data.items || []);
        setOrders(frontendOrders);
      } else if (response.status === 401) {
        // 用户未登录，重定向到登录页面
        console.log("用户未登录，重定向到登录页面");
        window.location.href = "/login?redirect=/my-bookings";
        return;
      } else {
        console.error("Failed to fetch orders, status:", response.status);
        setError("获取订单失败，请稍后重试");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("网络错误，请检查网络连接");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("确定要删除这个订单吗？删除后无法恢复。")) {
      return;
    }

    setIsDeleting(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "删除订单失败");
      }

      // 删除成功，从列表中移除订单
      setOrders(orders.filter(order => order.id !== orderId));
      alert("订单删除成功");
    } catch (error) {
      console.error("Delete order error:", error);
      alert(error instanceof Error ? error.message : "删除订单失败");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleRefundRequest = async (orderId: string) => {
    if (!refundReason.trim()) {
      alert("请填写退款原因");
      return;
    }

    if (!refundAccountInfo.account.trim() || !refundAccountInfo.name.trim()) {
      alert("请填写完整的退款账户信息");
      return;
    }

    if (refundMethod === "bank_transfer" && !refundAccountInfo.bank?.trim()) {
      alert("银行转账需要填写开户行信息");
      return;
    }

    setIsRefunding(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: refundReason,
          refundMethod: refundMethod,
          refundAccountInfo: refundAccountInfo
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "申请退款失败");
      }

      const result = await response.json();

      // 更新订单状态
      setOrders(orders.map(order =>
        order.id === orderId
          ? { ...order, status: 'CANCELLED' }
          : order
      ));

      alert(result.message);
      // 清理退款表单状态
      setShowRefundModal(null);
      setRefundReason("");
      setRefundMethod("alipay");
      setRefundAccountInfo({ account: "", name: "", bank: "" });
    } catch (error) {
      console.error("Refund request error:", error);
      alert(error instanceof Error ? error.message : "申请退款失败");
    } finally {
      setIsRefunding(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      // 新状态系统
      "pending": "bg-gray-100 text-gray-800",
      "confirmed": "bg-yellow-100 text-yellow-800",
      "in_progress": "bg-blue-100 text-blue-800",
      "completed": "bg-green-100 text-green-800",
      "cancelled": "bg-red-100 text-red-800",
      // 兼容旧状态系统
      "DRAFT": "bg-gray-100 text-gray-800",
      "GUIDE_SELECTED": "bg-purple-100 text-purple-800",
      "PAYMENT_PENDING": "bg-yellow-100 text-yellow-800",
      "PAID": "bg-green-100 text-green-800",
      "IN_PROGRESS": "bg-blue-100 text-blue-800",
      "COMPLETED": "bg-gray-100 text-gray-800",
      "CANCELLED": "bg-red-100 text-red-800",
      "REFUNDED": "bg-orange-100 text-orange-800",
      "REFUND_REJECTED": "bg-purple-100 text-purple-800"
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: string) => {
    // 新状态系统的状态映射
    const statusTextMap: Record<string, string> = {
      'pending': '待分配地陪',
      'confirmed': '等待收款',
      'in_progress': '服务中',
      'completed': '已完成',
      'cancelled': '已取消',
      // 兼容旧状态系统
      'DRAFT': '草稿',
      'GUIDE_SELECTED': '已选地陪',
      'DEPOSIT_PENDING': '等待收取保证金',
      'DEPOSIT_PAID': '等待见面收取尾款',
      'PAID': '已收取全款',
      'IN_PROGRESS': '服务进行中',
      'COMPLETED': '已完成',
      'CANCELLED': '已取消',
      'REFUNDED': '已退款',
      'REFUND_REJECTED': '退款被拒绝'
    };
    return statusTextMap[status] || status;
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case "daily":
        return "👥";
      case "mild_entertainment":
        return "🍷";
      case "local_tour":
        return "🗺️";
      default:
        return "📋";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ModernIcons.Loading size={32} className="text-pink-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md mx-auto">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">获取订单失败</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => fetchBookings()}
              className="w-full bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
            >
              重试
            </button>
            <Link
              href="/login"
              className="block w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              重新登录
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">我的预约</h1>
          <p className="text-gray-600">管理您的地陪服务预约</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-1 mb-6">
          <div className="flex space-x-1">
            {[
              { key: "all", label: "全部" },
              { key: "pending", label: "待确认" },
              { key: "confirmed", label: "已确认" },
              { key: "in_progress", label: "进行中" },
              { key: "completed", label: "已完成" },
              { key: "cancelled", label: "已取消" }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  filter === tab.key
                    ? "bg-pink-600 text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无预约记录</h3>
            <p className="text-gray-600 mb-6">
              {filter === "all" ? "您还没有任何预约记录" : `没有${getStatusText(filter)}的预约`}
            </p>
            <Link
              href="/guides"
              className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
            >
              浏览地陪
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              // 安全获取服务类型，优先使用 serviceType 字段，然后是 requirement.serviceType
              const serviceType = order.serviceType || order.requirement?.serviceType || 'daily';
              const serviceArea = order.location || order.requirement?.area || '未知区域';

              return (
              <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start gap-4">
                  {/* Service Icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center text-white text-xl">
                    {getServiceIcon(serviceType)}
                  </div>

                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {serviceType === 'daily' ? '日常陪伴' :
                           serviceType === 'mild_entertainment' ? '微醺娱乐' : '同城旅游'}
                        </h3>
                        <p className="text-gray-600">区域：{serviceArea}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <span className="text-lg font-bold text-pink-600">¥{order.totalAmount || 0}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <ModernIcons.Calendar size={16} />
                        <span>{new Date(order.startTime || order.requirement?.startTime || new Date()).toLocaleDateString('zh-CN')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ModernIcons.Clock size={16} />
                        <span>
                          {order.durationHours || order.requirement?.duration || 0}小时
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ModernIcons.Location size={16} />
                        <span>{order.location || order.requirement?.address || '未知地址'}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 flex-wrap">
                      <Link
                        href={`/booking/${order.id}`}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        查看详情
                      </Link>

                      {/* 删除订单按钮 - 仅对未支付保证金的订单显示 */}
                      {(order.status === "pending" || order.status === "confirmed" ||
                        order.status === "DRAFT" || order.status === "GUIDE_SELECTED" ||
                        order.status === "DEPOSIT_PENDING") && (
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          disabled={isDeleting === order.id}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50"
                        >
                          {isDeleting === order.id ? "删除中..." : "删除订单"}
                        </button>
                      )}

                      {/* 支付保证金按钮 */}
                      {order.status === "confirmed" && (
                        <Link
                          href={`/booking/deposit-payment/${order.id}`}
                          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                          支付保证金
                        </Link>
                      )}

                      {/* 等待见面按钮 */}
                      {order.status === "in_progress" && (
                        <Link
                          href={`/booking/waiting-meetup/${order.id}`}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                          等待见面
                        </Link>
                      )}

                      {/* 申请退款按钮 - 对已支付保证金的订单和退款被拒绝的订单显示 */}
                      {((order.status === "in_progress" || order.status === "completed" || order.status === "IN_PROGRESS" || order.status === "COMPLETED") &&
                        !["cancelled", "CANCELLED", "refunded", "REFUNDED"].includes(order.status)) ||
                       (order.status === "REFUND_REJECTED" || order.status === "refund_rejected") ? (
                        <button
                          onClick={() => setShowRefundModal(order.id)}
                          className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                            order.status === "REFUND_REJECTED" || order.status === "refund_rejected"
                              ? "bg-purple-100 hover:bg-purple-200 text-purple-700"
                              : "bg-orange-100 hover:bg-orange-200 text-orange-700"
                          }`}
                        >
                          {order.status === "REFUND_REJECTED" || order.status === "refund_rejected" ? "重新申请退款" : "申请退款"}
                        </button>
                      ) : null}

                      {/* 写评价按钮 */}
                      {order.status === "completed" && (
                        <Link
                          href={`/booking/${order.id}/review`}
                          className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                          写评价
                        </Link>
                      )}

                      {/* 投诉按钮 - 对已支付保证金或已完成的订单显示 */}
                      {(order.status === "DEPOSIT_PAID" || order.status === "PAID" ||
                        order.status === "IN_PROGRESS" || order.status === "COMPLETED" ||
                        order.status === "in_progress" || order.status === "completed") && (
                        <Link
                          href={`/complaints/create?orderId=${order.id}`}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                          投诉
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/guides"
              className="flex items-center gap-3 p-4 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors"
            >
              <span className="text-2xl">🔍</span>
              <div>
                <h4 className="font-medium text-gray-900">浏览地陪</h4>
                <p className="text-sm text-gray-600">发现更多优质地陪</p>
              </div>
            </Link>
            
            <Link
              href="/booking"
              className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <span className="text-2xl">📅</span>
              <div>
                <h4 className="font-medium text-gray-900">新建预约</h4>
                <p className="text-sm text-gray-600">快速创建新的预约</p>
              </div>
            </Link>
            
            <Link
              href="/messages"
              className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <span className="text-2xl">💬</span>
              <div>
                <h4 className="font-medium text-gray-900">消息中心</h4>
                <p className="text-sm text-gray-600">查看与地陪的对话</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 退款申请模态框 */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">申请退款</h3>

            {/* 退款原因 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                退款原因 *
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="请详细说明退款原因..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* 退款方式选择 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                退款方式 *
              </label>
              <select
                value={refundMethod}
                onChange={(e) => {
                  setRefundMethod(e.target.value as RefundMethod);
                  // 清空账户信息
                  setRefundAccountInfo({ account: "", name: "", bank: "" });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="alipay">支付宝</option>
                <option value="wechat">微信支付</option>
                <option value="bank_transfer">银行转账</option>
              </select>
            </div>

            {/* 账户信息 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {refundMethod === "alipay" ? "支付宝账号" :
                 refundMethod === "wechat" ? "微信号" : "银行卡号"} *
              </label>
              <input
                type="text"
                value={refundAccountInfo.account}
                onChange={(e) => setRefundAccountInfo(prev => ({ ...prev, account: e.target.value }))}
                placeholder={
                  refundMethod === "alipay" ? "请输入支付宝账号（手机号或邮箱）" :
                  refundMethod === "wechat" ? "请输入微信号" : "请输入银行卡号"
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* 真实姓名 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                真实姓名 *
              </label>
              <input
                type="text"
                value={refundAccountInfo.name}
                onChange={(e) => setRefundAccountInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="请输入与账户匹配的真实姓名"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* 银行信息（仅银行转账显示） */}
            {refundMethod === "bank_transfer" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  开户行 *
                </label>
                <input
                  type="text"
                  value={refundAccountInfo.bank || ""}
                  onChange={(e) => setRefundAccountInfo(prev => ({ ...prev, bank: e.target.value }))}
                  placeholder="请输入开户银行名称"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRefundModal(null);
                  setRefundReason("");
                  setRefundMethod("alipay");
                  setRefundAccountInfo({ account: "", name: "", bank: "" });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleRefundRequest(showRefundModal)}
                disabled={
                  isRefunding === showRefundModal ||
                  !refundReason.trim() ||
                  !refundAccountInfo.account.trim() ||
                  !refundAccountInfo.name.trim() ||
                  (refundMethod === "bank_transfer" && !refundAccountInfo.bank?.trim())
                }
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {isRefunding === showRefundModal ? "提交中..." : "提交申请"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
