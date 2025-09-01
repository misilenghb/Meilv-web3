"use client";

import { useState, useEffect } from "react";
import { Order } from "@/types/domain";
import AdminGuard from "../guard";
import Link from "next/link";

export default function AdminPaymentsPage() {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [paidOrders, setPaidOrders] = useState<Order[]>([]);
  const [todayPaidCount, setTodayPaidCount] = useState(0);
  const [todayPaidAmount, setTodayPaidAmount] = useState(0);
  const [activeTab, setActiveTab] = useState<'pending' | 'paid'>('pending');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [collectForm, setCollectForm] = useState({
    paymentMethod: "cash" as const,
    paymentNotes: "",
    amount: 0,
    paymentType: "deposit" as "deposit" | "final",
  });

  useEffect(() => {
    loadPendingPayments();
    loadPaidOrders();
    loadTodayStats();
  }, []);

  const loadPendingPayments = async () => {
    try {
      console.log("正在加载待收款订单...");
      const response = await fetch("/api/admin/pending-payments");
      console.log("待收款API响应状态:", response.status);

      const data = await response.json();
      console.log("待收款API响应数据:", data);
      console.log("订单数量:", data.items?.length || 0);

      setPendingOrders(data.items || []);
    } catch (error) {
      console.error("Failed to load pending payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPaidOrders = async () => {
    try {
      console.log("正在加载已收款订单...");
      const response = await fetch("/api/admin/paid-orders");

      if (response.ok) {
        const data = await response.json();
        console.log("已收款订单数据:", data);
        setPaidOrders(data.items || []);
      }
    } catch (error) {
      console.error("Failed to load paid orders:", error);
    }
  };

  const loadTodayStats = async () => {
    try {
      const response = await fetch("/api/admin/order-stats");
      if (response.ok) {
        const stats = await response.json();
        setTodayPaidCount(Math.floor(stats.todayRevenue / 200));
        setTodayPaidAmount(stats.todayRevenue);
      }
    } catch (error) {
      console.error("Failed to load today stats:", error);
    }
  };

  const handleCollectPayment = async () => {
    if (!selectedOrder) return;

    console.log("开始收款处理，订单ID:", selectedOrder.id);
    console.log("收款表单数据:", collectForm);

    try {
      // 根据收款类型选择不同的API端点
      const apiEndpoint = collectForm.paymentType === "deposit"
        ? `/api/admin/collect-payment/${selectedOrder.id}`
        : `/api/admin/collect-final-payment/${selectedOrder.id}`;

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: collectForm.paymentMethod,
          paymentNotes: collectForm.paymentNotes,
          amount: collectForm.amount,
        }),
      });

      console.log("收款API响应状态:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("收款API成功响应:", result);

        setShowCollectModal(false);
        setSelectedOrder(null);
        setCollectForm({ paymentMethod: "cash", paymentNotes: "", amount: 0, paymentType: "deposit" });

        console.log("开始重新加载订单列表...");
        await loadPendingPayments();
        await loadPaidOrders();
        await loadTodayStats(); // 同时刷新今日统计
        console.log("订单列表重新加载完成");

        const paymentTypeText = collectForm.paymentType === "deposit" ? "保证金" : "尾款";
        alert(`${paymentTypeText}收款成功！`);
      } else {
        const error = await response.json();
        console.error("收款API错误响应:", error);
        alert(error.error || error.message || "收款失败");
      }
    } catch (error) {
      console.error("收款网络错误:", error);
      alert("网络错误，请重试");
    }
  };

  const openCollectModal = (order: Order) => {
    setSelectedOrder(order);
    const isDepositPayment = order.status === "confirmed"; // confirmed状态表示需要收取保证金
    setCollectForm({
      paymentMethod: "cash",
      paymentNotes: "",
      amount: isDepositPayment ? 200 : (order.totalAmount - 200), // 保证金200元，尾款为总金额-200
      paymentType: isDepositPayment ? "deposit" : "final",
    });
    setShowCollectModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAYMENT_PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "GUIDE_SELECTED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PAYMENT_PENDING":
        return "等待收款";
      case "CONFIRMED":
        return "已确认";
      case "GUIDE_SELECTED":
        return "已选地陪";
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

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">收款管理</h1>
            <p className="text-gray-600">保证金收取，见面时收取尾款，收款记录管理</p>
          </div>
          <Link
            href="/admin"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-2xl transition-colors"
          >
            返回管理后台
          </Link>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {pendingOrders.length}
            </div>
            <div className="text-sm text-gray-600">待收款订单</div>
          </div>
          <div className="glass-card text-center">
            <div className="text-2xl font-bold text-orange-600">
              ¥{pendingOrders.reduce((sum, o) => sum + (o.pendingAmount || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">待收款金额</div>
          </div>
          <div className="glass-card text-center">
            <div className="text-2xl font-bold text-blue-600">
              {todayPaidCount}
            </div>
            <div className="text-sm text-gray-600">今日收款笔数</div>
          </div>
          <div className="glass-card text-center">
            <div className="text-2xl font-bold text-green-600">
              ¥{todayPaidAmount}
            </div>
            <div className="text-sm text-gray-600">今日收款金额</div>
          </div>
        </div>

        {/* 标签页切换 */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-2xl font-medium transition-all ${
              activeTab === 'pending'
                ? 'bg-pink-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-pink-50'
            }`}
          >
            待收款订单 ({pendingOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('paid')}
            className={`px-6 py-3 rounded-2xl font-medium transition-all ${
              activeTab === 'paid'
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-green-50'
            }`}
          >
            已收款订单 ({paidOrders.length})
          </button>
        </div>

        {/* 订单列表 */}
        <div className="glass-card">
          <div className="p-6 border-b border-pink-100">
            <h2 className="text-xl font-semibold text-gray-800">
              {activeTab === 'pending' ? '待处理订单' : '已收款订单'}
            </h2>
          </div>
          
          {activeTab === 'pending' ? (
            pendingOrders.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">💰</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">暂无待收款订单</h3>
                <p className="text-gray-600">所有订单都已处理完成</p>
              </div>
            ) : (
              <div className="divide-y divide-pink-100">
                {pendingOrders.map((order) => (
                  <PendingOrderItem
                    key={order.id}
                    order={order}
                    onCollect={openCollectModal}
                  />
                ))}
              </div>
            )
          ) : (
            paidOrders.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">暂无已收款订单</h3>
                <p className="text-gray-600">最近30天内没有收款记录</p>
              </div>
            ) : (
              <div className="divide-y divide-pink-100">
                {paidOrders.map((order) => (
                  <PaidOrderItem
                    key={order.id}
                    order={order}
                  />
                ))}
              </div>
            )
          )}
        </div>

        {/* 收款确认弹窗 */}
        {showCollectModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {collectForm.paymentType === "deposit" ? "收取保证金" : "见面确认并收取尾款"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    订单号：{selectedOrder.id}
                  </label>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    收款类型：{collectForm.paymentType === "deposit" ? "保证金" : "尾款（见面时）"}
                  </label>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    应收金额：¥{collectForm.amount}
                  </label>
                  {collectForm.paymentType === "final" && (
                    <label className="block text-sm text-gray-500 mb-2">
                      （总金额 ¥{selectedOrder.totalAmount} - 保证金 ¥200 = 尾款 ¥{collectForm.amount}）
                    </label>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    收款方式
                  </label>
                  <select
                    value={collectForm.paymentMethod}
                    onChange={(e) => setCollectForm(prev => ({ 
                      ...prev, 
                      paymentMethod: e.target.value as any 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="cash">现金</option>
                    <option value="wechat">微信</option>
                    <option value="alipay">支付宝</option>
                    <option value="bank_transfer">银行转账</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    收款备注
                  </label>
                  <textarea
                    value={collectForm.paymentNotes}
                    onChange={(e) => setCollectForm(prev => ({ 
                      ...prev, 
                      paymentNotes: e.target.value 
                    }))}
                    placeholder="请输入收款备注..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCollectModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleCollectPayment}
                  className={`flex-1 px-4 py-2 ${collectForm.paymentType === "deposit" ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-2xl transition-colors`}
                >
                  {collectForm.paymentType === "deposit" ? "确认收取保证金" : "确认见面并收取尾款"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </AdminGuard>
  );
}

// 待收款订单项组件
function PendingOrderItem({ order, onCollect }: { order: Order; onCollect: (order: Order) => void }) {
  const isDepositPayment = order.status === "confirmed"; // confirmed状态表示需要收取保证金
  const paymentTypeText = isDepositPayment ? "保证金" : "尾款（见面时）";
  const paymentAmount = isDepositPayment ? 200 : (order.totalAmount - 200);

  return (
    <div className="p-6 hover:bg-pink-25 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <span className="font-mono text-sm text-gray-500">#{order.id.slice(-8)}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isDepositPayment ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
            }`}>
              待收{paymentTypeText}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">服务类型：</span>
              <span className="font-medium">{order.serviceType}</span>
            </div>
            <div>
              <span className="text-gray-500">用户：</span>
              <span className="font-medium">{order.userName}</span>
            </div>
            <div>
              <span className="text-gray-500">总金额：</span>
              <span className="font-medium">¥{order.totalAmount}</span>
            </div>
            <div>
              <span className="text-gray-500">应收{paymentTypeText}：</span>
              <span className="font-bold text-green-600">¥{paymentAmount}</span>
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-600">
            <span>服务区域：{order.location}</span>
            <span className="mx-2">•</span>
            <span>开始时间：{new Date(order.startTime).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onCollect(order)}
            className={`${isDepositPayment ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded-2xl text-sm transition-colors`}
          >
            {isDepositPayment ? '收取保证金' : '见面收取尾款'}
          </button>
          <button
            onClick={() => {
              alert(`订单详情：\n订单ID: ${order.id}\n用户: ${order.userName}\n电话: ${order.userPhone}\n服务类型: ${order.serviceType}\n总金额: ¥${order.totalAmount}\n待收${paymentTypeText}: ¥${paymentAmount}\n开始时间: ${new Date(order.startTime).toLocaleString()}\n服务时长: ${order.durationHours}小时\n服务区域: ${order.location}`);
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-2xl text-sm transition-colors"
          >
            查看详情
          </button>
        </div>
      </div>
    </div>
  );
}

// 已收款订单项组件
function PaidOrderItem({ order }: { order: Order }) {
  return (
    <div className="p-6 hover:bg-green-25 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <span className="font-mono text-sm text-gray-500">#{order.id.slice(-8)}</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
              已收款
            </span>
            <span className="text-xs text-gray-500">
              收款时间：{new Date(order.updatedAt).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">服务类型：</span>
              <span className="font-medium">{order.serviceType}</span>
            </div>
            <div>
              <span className="text-gray-500">用户：</span>
              <span className="font-medium">{order.userName}</span>
            </div>
            <div>
              <span className="text-gray-500">地陪：</span>
              <span className="font-medium">{order.guideName || '未分配'}</span>
            </div>
            <div>
              <span className="text-gray-500">收款金额：</span>
              <span className="font-bold text-green-600">¥{order.totalAmount}</span>
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-600">
            <span>服务区域：{order.location}</span>
            <span className="mx-2">•</span>
            <span>服务时间：{new Date(order.startTime).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={() => {
              alert(`订单详情：\n订单ID: ${order.id}\n用户: ${order.userName}\n电话: ${order.userPhone}\n地陪: ${order.guideName}\n服务类型: ${order.serviceType}\n开始时间: ${new Date(order.startTime).toLocaleString()}\n服务时长: ${order.durationHours}小时\n服务区域: ${order.location}\n收款时间: ${new Date(order.updatedAt).toLocaleString()}`);
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-2xl text-sm transition-colors"
          >
            查看详情
          </button>
        </div>
      </div>
    </div>
  );
}

// 状态颜色和文本的辅助函数
function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'guide_selected':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'paid':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'pending':
      return '待确认';
    case 'confirmed':
      return '已确认';
    case 'guide_selected':
      return '已选择地陪';
    case 'paid':
      return '已收款';
    default:
      return status;
  }
}
