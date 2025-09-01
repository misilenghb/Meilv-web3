"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminGuard from "../guard";

interface GuideFinance {
  guideId: string;
  guideName: string;
  hourlyRate: number;
  totalOrders: number;
  completedOrders: number;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  commission: number;
  netEarnings: number;
  orders: Array<{
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    customerName: string;
    durationHours: number;
  }>;
}

interface FinanceStats {
  totalGuides: number;
  totalOrders: number;
  totalEarnings: number;
  totalCommission: number;
  totalNetEarnings: number;
  pendingEarnings: number;
}

export default function GuideFinancesPage() {
  const [guides, setGuides] = useState<GuideFinance[]>([]);
  const [stats, setStats] = useState<FinanceStats>({
    totalGuides: 0,
    totalOrders: 0,
    totalEarnings: 0,
    totalCommission: 0,
    totalNetEarnings: 0,
    pendingEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedGuide, setSelectedGuide] = useState<GuideFinance | null>(null);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [settlementForm, setSettlementForm] = useState({
    amount: 0,
    notes: ""
  });

  useEffect(() => {
    loadGuideFinances();
  }, []);

  const loadGuideFinances = async () => {
    try {
      const response = await fetch('/api/admin/guide-finances');
      if (response.ok) {
        const data = await response.json();
        setGuides(data.guides || []);
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('Failed to load guide finances:', error);
    } finally {
      setLoading(false);
    }
  };

  const openSettlementModal = (guide: GuideFinance) => {
    setSelectedGuide(guide);
    setSettlementForm({
      amount: guide.netEarnings,
      notes: `结算地陪 ${guide.guideName} 的收入`
    });
    setShowSettlementModal(true);
  };

  const handleSettlement = async () => {
    if (!selectedGuide) return;

    try {
      const response = await fetch('/api/admin/guide-finances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guideId: selectedGuide.guideId,
          amount: settlementForm.amount,
          settlementNotes: settlementForm.notes
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        setShowSettlementModal(false);
        setSelectedGuide(null);
        loadGuideFinances(); // 重新加载数据
      } else {
        const error = await response.json();
        alert(error.error || '结算失败');
      }
    } catch (error) {
      alert('结算处理失败');
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': '待处理',
      'confirmed': '已确认',
      'in_progress': '进行中',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">地陪财务管理</h1>
              <p className="text-gray-600">地陪收入统计、应收应付管理、佣金结算</p>
            </div>
            <Link
              href="/admin"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              返回管理后台
            </Link>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">{stats.totalGuides}</div>
              <div className="text-gray-600 text-sm">活跃地陪数</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">{stats.totalOrders}</div>
              <div className="text-gray-600 text-sm">总订单数</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">¥{stats.totalEarnings}</div>
              <div className="text-gray-600 text-sm">总收入</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">¥{stats.totalCommission}</div>
              <div className="text-gray-600 text-sm">平台抽成(30%)</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-emerald-600 mb-2">¥{stats.totalNetEarnings}</div>
              <div className="text-gray-600 text-sm">地陪净收入(70%)</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-2">¥{stats.pendingEarnings}</div>
              <div className="text-gray-600 text-sm">待结算收入</div>
            </div>
          </div>

          {/* 地陪财务列表 */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">地陪收入明细</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      地陪信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      订单统计
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      收入统计
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      平台抽成
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      净收入
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {guides.map((guide) => (
                    <tr key={guide.guideId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{guide.guideName}</div>
                          <div className="text-sm text-gray-500">时薪: ¥{guide.hourlyRate}</div>
                          <div className="text-sm text-gray-500">ID: {guide.guideId.substring(0, 8)}...</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">总订单: {guide.totalOrders}</div>
                        <div className="text-sm text-gray-500">已完成: {guide.completedOrders}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">总收入: ¥{guide.totalEarnings}</div>
                        <div className="text-sm text-gray-500">待结算: ¥{guide.pendingEarnings}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-orange-600 font-medium">¥{guide.commission}</div>
                        <div className="text-sm text-gray-500">30%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-green-600 font-medium">¥{guide.netEarnings}</div>
                        <div className="text-sm text-gray-500">70%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => openSettlementModal(guide)}
                          disabled={guide.netEarnings <= 0}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          结算收入
                        </button>
                        <button
                          onClick={() => setSelectedGuide(guide)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          查看详情
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {guides.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">暂无地陪财务数据</p>
              </div>
            )}
          </div>

          {/* 结算弹窗 */}
          {showSettlementModal && selectedGuide && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  结算地陪收入
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      地陪姓名
                    </label>
                    <div className="text-sm text-gray-900">{selectedGuide.guideName}</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      结算金额
                    </label>
                    <input
                      type="number"
                      value={settlementForm.amount}
                      onChange={(e) => setSettlementForm({
                        ...settlementForm,
                        amount: Number(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="输入结算金额"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      结算备注
                    </label>
                    <textarea
                      value={settlementForm.notes}
                      onChange={(e) => setSettlementForm({
                        ...settlementForm,
                        notes: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="输入结算备注"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSettlement}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition-colors"
                  >
                    确认结算
                  </button>
                  <button
                    onClick={() => setShowSettlementModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-md transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 地陪详情弹窗 */}
          {selectedGuide && !showSettlementModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedGuide.guideName} - 订单详情
                  </h3>
                  <button
                    onClick={() => setSelectedGuide(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  {selectedGuide.orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            订单 {order.id.substring(0, 8)}...
                          </div>
                          <div className="text-sm text-gray-500">
                            客户: {order.customerName} • 时长: {order.durationHours}小时
                          </div>
                          <div className="text-sm text-gray-500">
                            创建时间: {new Date(order.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            ¥{order.totalAmount}
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
