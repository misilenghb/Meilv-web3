"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ModernIcons } from "@/components/icons/ModernIcons";
import { supabaseToFrontend } from "@/lib/order-adapter";

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  finalAmount: number;
  requirement: {
    serviceType: string;
    startTime: string;
    duration: number;
    area: string;
    address: string;
    specialRequests?: string;
  };
  guide?: {
    id: string;
    displayName: string;
    photos?: string[];
  };
}

export default function WaitingMeetupPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const supabaseOrderData = await response.json();
        const frontendOrderData = supabaseToFrontend(supabaseOrderData);
        setOrder(frontendOrderData);
      } else {
        alert("订单不存在");
        router.push("/my-bookings");
      }
    } catch (error) {
      alert("获取订单信息失败");
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
        if (frontendOrderData.status === "PAID") {
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
    business_companion: "商务陪同",
    shopping_guide: "购物向导",
    cultural_tour: "文化导览"
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">订单不存在</p>
          <Link href="/my-bookings" className="text-pink-600 hover:text-pink-700">
            返回我的预约
          </Link>
        </div>
      </div>
    );
  }

  const guide = order.guide;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ModernIcons.Check size={32} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">保证金已收取</h1>
          <p className="text-gray-600">请与地陪联系约定见面时间和地点，见面时支付剩余金额</p>
        </div>

        {/* 进度条 */}
        <div className="glass-card mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  ✓
                </div>
                <span className="ml-2 text-sm font-medium text-green-600">已选择地陪</span>
              </div>
              <div className="w-8 h-px bg-green-500"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  ✓
                </div>
                <span className="ml-2 text-sm font-medium text-green-600">保证金已付</span>
              </div>
              <div className="w-8 h-px bg-yellow-300"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <span className="ml-2 text-sm font-medium text-yellow-600">等待见面</span>
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
                <div className="flex justify-between text-green-600">
                  <span>已付保证金</span>
                  <span>¥200</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-orange-600">
                  <span>见面时需付</span>
                  <span>¥{order.finalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 地陪信息 */}
        {guide && (
          <div className="glass-card mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">您的地陪</h2>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {guide.displayName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{guide.displayName}</h3>
                  <p className="text-gray-600">专业地陪</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 下一步说明 */}
        <div className="glass-card mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">下一步</h2>
            
            <div className="space-y-3 text-gray-600">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-pink-600 text-sm font-bold">1</span>
                </div>
                <p>与地陪联系，约定具体的见面时间和地点</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-pink-600 text-sm font-bold">2</span>
                </div>
                <p>见面时支付剩余金额 ¥{order.finalAmount}</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-pink-600 text-sm font-bold">3</span>
                </div>
                <p>开始愉快的陪玩体验</p>
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
            {guide && (
              <Link
                href={`/messages/${guide.id}`}
                className="flex-1 text-center py-3 px-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors"
              >
                联系地陪
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
