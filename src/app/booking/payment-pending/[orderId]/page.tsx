"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import Link from "next/link";
import { supabaseToFrontend, type SupabaseOrder } from "@/lib/order-adapter";
import { ModernIcons } from "@/components/icons/ModernIcons";

interface Guide {
  id: string;
  name: string;
  avatar: string;
  phone: string;
}

interface Order {
  id: string;
  guideId: string;
  requirement: {
    startTime: string;
    duration: number;
    serviceType: string;
    area: string;
    address: string;
  };
  totalAmount: number;
  finalAmount: number;
  status: string;
}

export default function PaymentPendingPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    loadOrderData();
    // 每30秒检查一次支付状态
    const interval = setInterval(checkPaymentStatus, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  const loadOrderData = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const orderData = await response.json();
        setOrder(orderData);
        
        // 加载地陪信息
        if (orderData.guideId) {
          const guideResponse = await fetch(`/api/guides/${orderData.guideId}`);
          if (guideResponse.ok) {
            const guideData = await guideResponse.json();
            setGuide(guideData);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load order data:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (checking) return;
    
    setChecking(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const supabaseOrderData = await response.json();
        const frontendOrderData = supabaseToFrontend(supabaseOrderData);
        if (frontendOrderData.status === "DEPOSIT_PAID") {
          // 保证金支付完成，跳转到等待见面页面
          router.push(`/booking/waiting-meetup/${orderId}`);
        } else if (frontendOrderData.status === "PAID") {
          // 全款支付完成，跳转到服务开始页面
          router.push(`/booking/start/${orderId}`);
        }
        setOrder(frontendOrderData);
      }
    } catch (error) {
      console.error("Failed to check payment status:", error);
    } finally {
      setChecking(false);
    }
  };

  const serviceTypeMap = {
    daily: "日常陪伴",
    mild_entertainment: "微醺娱乐",
    local_tour: "同城旅游",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!order || !guide) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">订单不存在</h1>
          <Link href="/my-bookings" className="text-pink-600 hover:text-pink-700">
            返回我的预约
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ModernIcons.Clock size={32} className="text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">支付保证金</h1>
          <p className="text-gray-600">请联系工作人员支付200元保证金，剩余金额见面时支付</p>
        </div>

        {/* 流程指示器 */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <span className="ml-2 text-sm text-green-600">需求信息</span>
            </div>
            <div className="w-8 h-px bg-green-500"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <span className="ml-2 text-sm text-green-600">选择地陪</span>
            </div>
            <div className="w-8 h-px bg-yellow-500"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-yellow-600">等待收款</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
                4
              </div>
              <span className="ml-2 text-sm text-gray-500">开始服务</span>
            </div>
          </div>
        </div>

        {/* 订单信息 */}
        <div className="glass-card mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">订单信息</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">订单号</span>
                <span className="font-mono text-sm">{order.id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">服务类型</span>
                <span>{serviceTypeMap[order.requirement.serviceType as keyof typeof serviceTypeMap]}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">服务时长</span>
                <span>{order.requirement.duration} 小时</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">服务区域</span>
                <span>{order.requirement.area}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">开始时间</span>
                <span>{new Date(order.requirement.startTime).toLocaleString()}</span>
              </div>
              
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">总金额</span>
                  <span>¥{order.totalAmount}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-yellow-600">
                  <span>需支付保证金</span>
                  <span>¥200</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>剩余金额（见面支付）</span>
                  <span>¥{order.finalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 地陪信息 */}
        <div className="glass-card mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">您的地陪</h2>
            
            <div className="flex items-center gap-4">
              <img
                src={guide.avatar || "/default-avatar.svg"}
                alt={guide.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{guide.name}</h3>
                <p className="text-gray-600">联系电话：{guide.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 收款说明 */}
        <div className="glass-card mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">收款说明</h2>
            
            <div className="space-y-3 text-gray-600">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-pink-600 text-sm font-bold">1</span>
                </div>
                <p>请联系我们的工作人员支付200元保证金</p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-pink-600 text-sm font-bold">2</span>
                </div>
                <p>支持现金、微信、支付宝、银行转账等多种支付方式</p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-pink-600 text-sm font-bold">3</span>
                </div>
                <p>保证金确认后，与地陪见面时支付剩余金额即可开始服务</p>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-4">
          <button
            onClick={checkPaymentStatus}
            disabled={checking}
            className="w-full bg-pink-600 text-white py-3 px-4 rounded-2xl font-medium hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {checking ? "检查中..." : "刷新状态"}
          </button>

          <div className="flex space-x-4">
            <Link
              href={`/my-bookings`}
              className="flex-1 text-center py-3 px-4 border border-gray-300 rounded-2xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              返回我的预约
            </Link>
            <Link
              href={`/messages/${guide.id}`}
              className="flex-1 text-center py-3 px-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors"
            >
              联系地陪
            </Link>
          </div>
        </div>

        {/* 联系信息 */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>如有疑问，请联系客服：400-123-4567</p>
        </div>
      </div>
    </div>
  );
}
