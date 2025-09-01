"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import Link from "next/link";

interface Order {
  id: string;
  requirement: {
    startTime: string;
    duration: number;
    serviceType: string;
    area: string;
    address: string;
    specialRequests?: string;
  };
  depositAmount: number;
  status: string;
}

export default function DepositPaymentPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const orderData = await response.json();

        // 检查订单状态，如果已经收取保证金，则跳转到相应页面
        if (orderData.status === "in_progress") {
          // 保证金已收取，跳转到等待见面页面
          router.push(`/booking/waiting-meetup/${orderId}`);
          return;
        } else if (orderData.status === "completed") {
          // 订单已完成
          router.push(`/booking/completed/${orderId}`);
          return;
        } else if (orderData.status === "cancelled") {
          // 订单已取消
          alert("订单已取消");
          router.push("/booking");
          return;
        }

        setOrder(orderData);
      } else {
        alert("订单不存在");
        router.push("/booking");
      }
    } catch (error) {
      alert("获取订单信息失败");
    } finally {
      setLoading(false);
    }
  };

  const getServiceTypeName = (type: string) => {
    switch (type) {
      case 'daily': return '日常陪伴';
      case 'mild_entertainment': return '轻度娱乐';
      case 'deep_experience': return '深度体验';
      default: return type;
    }
  };

  const handleConfirmPayment = async () => {
    setPaying(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/confirm-deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.alreadyPaid) {
          // 保证金已经支付，跳转到等待见面页面
          alert('保证金已经支付完成！');
          router.push(`/booking/waiting-meetup/${orderId}`);
        } else {
          // 支付确认成功，跳转到等待收款页面
          router.push(`/booking/payment-pending/${orderId}`);
        }
      } else {
        const error = await response.json();
        alert(error.message || '确认支付失败');
      }
    } catch (error) {
      alert('确认支付过程中出现错误');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">订单不存在</p>
          <Link href="/booking" className="text-blue-600 hover:underline">
            返回预约页面
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">确认保证金支付</h1>
          <p className="text-gray-600">请确认订单信息并支付保证金</p>
        </div>

        {/* 订单信息卡片 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">订单详情</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">订单编号</span>
              <span className="font-medium">{order.id.slice(0, 8)}...</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">服务类型</span>
              <span className="font-medium">{getServiceTypeName(order.requirement.serviceType)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">开始时间</span>
              <span className="font-medium">
                {new Date(order.requirement.startTime).toLocaleString("zh-CN")}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">服务时长</span>
              <span className="font-medium">{order.requirement.duration}小时</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">服务区域</span>
              <span className="font-medium">{order.requirement.area}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">具体地址</span>
              <span className="font-medium">{order.requirement.address}</span>
            </div>
            
            {order.requirement.specialRequests && (
              <div className="flex justify-between">
                <span className="text-gray-600">特殊要求</span>
                <span className="font-medium">{order.requirement.specialRequests}</span>
              </div>
            )}
          </div>
        </div>

        {/* 保证金信息 */}
        <div className="bg-blue-50 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">保证金说明</h3>
          <div className="space-y-2 text-blue-800">
            <p>• 保证金用于确保服务的顺利进行</p>
            <p>• 服务完成后，保证金将抵扣服务费用</p>
            <p>• 如需取消订单，请提前24小时联系客服</p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-blue-900">保证金金额</span>
              <span className="text-2xl font-bold text-blue-600">¥{order.depositAmount}</span>
            </div>
          </div>
        </div>

        {/* 支付方式 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">支付方式</h3>
          <div className="space-y-3">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">微信支付</h4>
                  <p className="text-sm text-gray-600">请添加客服微信进行支付</p>
                </div>
                <div className="text-green-600">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.298c-.115.379.21.747.593.671l1.463-.292a.896.896 0 0 1 .673.05 8.759 8.759 0 0 0 2.5.377c.387 0 .746-.024 1.109-.075-.084-.301-.134-.611-.134-.938 0-3.589 3.148-6.495 7.036-6.495.387 0 .746.024 1.109.075-.084-.301-.134-.611-.134-.938 0-4.054-3.891-7.342-8.691-7.342zm-2.388 5.554c.166 0 .301.135.301.301v1.188h1.188a.301.301 0 1 1 0 .602H6.604v1.188a.301.301 0 1 1-.602 0V9.833H4.814a.301.301 0 1 1 0-.602h1.188V8.043c0-.166.135-.301.301-.301zm5.586 0c.166 0 .301.135.301.301v1.188h1.188a.301.301 0 1 1 0 .602h-1.188v1.188a.301.301 0 1 1-.602 0V9.833h-1.188a.301.301 0 1 1 0-.602h1.188V8.043c0-.166.135-.301.301-.301z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">支付宝</h4>
                  <p className="text-sm text-gray-600">请联系客服获取支付宝账号</p>
                </div>
                <div className="text-blue-600">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 客服联系方式 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">联系客服</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.298c-.115.379.21.747.593.671l1.463-.292a.896.896 0 0 1 .673.05 8.759 8.759 0 0 0 2.5.377c.387 0 .746-.024 1.109-.075-.084-.301-.134-.611-.134-.938 0-3.589 3.148-6.495 7.036-6.495.387 0 .746.024 1.109.075-.084-.301-.134-.611-.134-.938 0-4.054-3.891-7.342-8.691-7.342z"/>
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">微信客服</p>
                <p className="text-sm text-gray-600">meilv_service</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">电话客服</p>
                <p className="text-sm text-gray-600">400-123-4567</p>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          <button
            onClick={handleConfirmPayment}
            disabled={paying}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {paying ? '确认中...' : '确认已支付定金'}
          </button>
          
          <Link
            href="/guides"
            className="block w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-semibold text-center hover:bg-gray-200 transition-colors"
          >
            浏览地陪信息
          </Link>
          
          <Link
            href="/booking"
            className="block w-full text-gray-500 py-2 text-center hover:text-gray-700 transition-colors"
          >
            返回修改订单
          </Link>
        </div>

        {/* 温馨提示 */}
        <div className="mt-8 p-4 bg-yellow-50 rounded-2xl">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">温馨提示</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 请先联系客服进行定金支付</li>
            <li>• 支付完成后，点击"确认已支付定金"按钮</li>
            <li>• 确认后将进入等待地陪确认服务的阶段</li>
            <li>• 地陪确认后，我们会通知您具体的服务安排</li>
            <li>• 如有任何问题，请随时联系客服</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
