"use client";

import { useState, useEffect } from "react";
import { Order, RefundMethod, RefundAccountInfo } from "@/types/domain";
import AdminGuard from "../guard";
import Link from "next/link";

interface RefundRequest {
  id: string;
  user_id: string;
  guide_id: string;
  service_type: string;
  start_time: string;
  duration_hours: number;
  location: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  // 退款渠道相关字段
  refund_method?: RefundMethod;
  refund_account_info?: RefundAccountInfo;
  refund_requested_at?: string;
}

export default function AdminRefundsPage() {
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processForm, setProcessForm] = useState({
    action: "approve" as "approve" | "reject",
    adminNotes: "",
    refundAmount: 0,
  });

  useEffect(() => {
    loadRefundRequests();
  }, []);

  const loadRefundRequests = async () => {
    try {
      // 使用管理员API获取所有退款相关的订单
      const response = await fetch("/api/admin/refunds");
      if (response.ok) {
        const data = await response.json();
        setRefundRequests(data.items || []);
      } else {
        console.error("Failed to load refund requests:", response.status);
      }
    } catch (error) {
      console.error("Failed to load refund requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRefund = async () => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/admin/refunds/${selectedRequest.id}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: processForm.action,
          adminNotes: processForm.adminNotes,
          refundAmount: processForm.refundAmount,
        }),
      });

      if (response.ok) {
        alert(`退款${processForm.action === 'approve' ? '批准' : '拒绝'}成功`);
        setShowProcessModal(false);
        setSelectedRequest(null);
        loadRefundRequests(); // 重新加载数据
      } else {
        const errorData = await response.json();
        alert(`处理失败: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Process refund error:", error);
      alert("处理退款申请失败");
    }
  };

  const openProcessModal = (request: RefundRequest) => {
    setSelectedRequest(request);
    setProcessForm({
      action: "approve",
      adminNotes: "",
      refundAmount: 200, // 默认退还保证金（固定金额）
    });
    setShowProcessModal(true);
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'cancelled': '待处理退款',
      'CANCELLED': '待处理退款',
      'refunded': '已退款',
      'REFUNDED': '已退款',
      'refund_rejected': '退款被拒绝',
      'REFUND_REJECTED': '退款被拒绝',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'cancelled': 'bg-yellow-100 text-yellow-800',
      'CANCELLED': 'bg-yellow-100 text-yellow-800',
      'refunded': 'bg-green-100 text-green-800',
      'REFUNDED': 'bg-green-100 text-green-800',
      'refund_rejected': 'bg-red-100 text-red-800',
      'REFUND_REJECTED': 'bg-red-100 text-red-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const extractRefundReason = (notes: string) => {
    if (!notes) return "无退款原因";
    const match = notes.match(/退款申请：(.+?)(?:\n|$)/);
    return match ? match[1] : "无退款原因";
  };

  const formatRefundMethod = (method?: RefundMethod) => {
    const methodMap: Record<RefundMethod, string> = {
      'alipay': '支付宝',
      'wechat': '微信支付',
      'bank_transfer': '银行转账'
    };
    return method ? methodMap[method] : '未设置';
  };

  const formatRefundAccountInfo = (accountInfo?: RefundAccountInfo) => {
    if (!accountInfo) return '未提供';

    const { account, name, bank } = accountInfo;
    if (bank) {
      return `${name} | ${account} | ${bank}`;
    }
    return `${name} | ${account}`;
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">退款管理</h1>
                <p className="text-gray-600 mt-2">管理用户的退款申请</p>
              </div>
              <Link
                href="/admin"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                返回管理后台
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">待处理申请</h3>
              <p className="text-3xl font-bold text-yellow-600">
                {refundRequests.filter(r => r.status === 'cancelled').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">已处理申请</h3>
              <p className="text-3xl font-bold text-green-600">
                {refundRequests.filter(r => r.status === 'refunded').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">被拒绝申请</h3>
              <p className="text-3xl font-bold text-red-600">
                {refundRequests.filter(r => r.status === 'refund_rejected').length}
              </p>
            </div>
          </div>

          {/* Refund Requests Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">退款申请列表</h2>
            </div>
            
            {refundRequests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">暂无退款申请</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        订单信息
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        退款原因
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        退款渠道
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        金额
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状态
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        申请时间
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {refundRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.service_type}
                            </div>
                            <div className="text-sm text-gray-500">
                              订单ID: {request.id.slice(0, 8)}...
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.location?.split(' ')[0] || '未知区域'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {extractRefundReason(request.notes || "")}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {formatRefundMethod(request.refund_method)}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {formatRefundAccountInfo(request.refund_account_info)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            总额: ¥{request.total_amount}
                          </div>
                          <div className="text-sm text-gray-500">
                            保证金: ¥200
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                            {getStatusText(request.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(request.updated_at).toLocaleString('zh-CN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {(request.status === 'cancelled' || request.status === 'CANCELLED') && (
                            <button
                              onClick={() => openProcessModal(request)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              处理
                            </button>
                          )}
                          <Link
                            href={`/admin/orders/${request.id}`}
                            className="text-gray-600 hover:text-gray-900 ml-4"
                          >
                            查看详情
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Process Refund Modal */}
        {showProcessModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">处理退款申请</h3>

              {/* 退款渠道信息显示 */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">用户退款信息</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">退款方式：</span>
                    <span className="font-medium">{formatRefundMethod(selectedRequest.refund_method)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">账户信息：</span>
                    <span className="font-medium">{formatRefundAccountInfo(selectedRequest.refund_account_info)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">申请时间：</span>
                    <span className="font-medium">
                      {selectedRequest.refund_requested_at
                        ? new Date(selectedRequest.refund_requested_at).toLocaleString('zh-CN')
                        : new Date(selectedRequest.updated_at).toLocaleString('zh-CN')
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  处理方式
                </label>
                <select
                  value={processForm.action}
                  onChange={(e) => setProcessForm({...processForm, action: e.target.value as "approve" | "reject"})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="approve">批准退款</option>
                  <option value="reject">拒绝退款</option>
                </select>
              </div>

              {processForm.action === 'approve' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    退款金额
                  </label>
                  <input
                    type="number"
                    value={processForm.refundAmount}
                    onChange={(e) => setProcessForm({...processForm, refundAmount: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    min="0"
                    max={selectedRequest.total_amount}
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  管理员备注
                </label>
                <textarea
                  value={processForm.adminNotes}
                  onChange={(e) => setProcessForm({...processForm, adminNotes: e.target.value})}
                  placeholder="请填写处理说明..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowProcessModal(false);
                    setSelectedRequest(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleProcessRefund}
                  className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  确认处理
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
