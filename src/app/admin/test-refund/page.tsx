"use client";

import { useState, useEffect } from "react";
import AdminGuard from "../guard";

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  notes?: string;
  created_at: string;
}

export default function TestRefundPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.items || []);
      }
    } catch (error) {
      console.error('获取订单失败:', error);
    }
  };

  const handleSetRefundRejected = async (orderId: string) => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/test-refund-rejected', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();
      setResult(data);
      
      if (response.ok) {
        // 刷新订单列表
        fetchOrders();
      }
    } catch (error) {
      console.error('设置退款被拒绝失败:', error);
      setResult({
        error: '设置失败',
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'DRAFT': '草稿',
      'CANCELLED': '已取消',
      'REFUNDED': '已退款',
      'REFUND_REJECTED': '退款被拒绝',
      'IN_PROGRESS': '服务中',
      'COMPLETED': '已完成'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'DRAFT': 'bg-gray-100 text-gray-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'REFUNDED': 'bg-orange-100 text-orange-800',
      'REFUND_REJECTED': 'bg-purple-100 text-purple-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'COMPLETED': 'bg-green-100 text-green-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              测试退款被拒绝功能
            </h1>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                选择一个订单设置为"退款被拒绝"状态，然后在客户端测试重新申请退款功能。
              </p>
            </div>

            {result && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">操作结果</h2>
                
                {result.error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-red-800 font-medium">错误</h3>
                    <p className="text-red-700 mt-1">{result.error}</p>
                    {result.details && (
                      <p className="text-red-600 text-sm mt-2">{result.details}</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-green-800 font-medium">{result.message}</h3>
                  </div>
                )}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      订单ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      金额
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      创建时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ¥{order.totalAmount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {order.status !== 'REFUND_REJECTED' && (
                          <button
                            onClick={() => handleSetRefundRejected(order.id)}
                            disabled={isLoading}
                            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            {isLoading ? '设置中...' : '设为退款被拒绝'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {orders.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">暂无订单数据</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
