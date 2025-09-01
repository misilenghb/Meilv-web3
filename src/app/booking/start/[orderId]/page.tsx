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
  status: string;
}

export default function StartServicePage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchOrderAndGuide();
  }, [orderId]);

  const fetchOrderAndGuide = async () => {
    try {
      const orderResponse = await fetch(`/api/orders/${orderId}`);
      if (orderResponse.ok) {
        const supabaseOrderData = await orderResponse.json();
        const frontendOrderData = supabaseToFrontend(supabaseOrderData);
        setOrder(frontendOrderData);

        if (frontendOrderData.guideId) {
          const guideResponse = await fetch(`/api/guides/${frontendOrderData.guideId}`);
          if (guideResponse.ok) {
            const guideData = await guideResponse.json();
            setGuide(guideData);
          }
        }
      } else {
        alert("订单不存在");
        router.push("/orders");
      }
    } catch (error) {
      alert("获取信息失败");
    } finally {
      setLoading(false);
    }
  };

  const handleStartService = async () => {
    setStarting(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        // 开始服务成功，跳转到订单详情页面
        router.push(`/orders/${orderId}`);
      } else {
        const error = await response.json();
        alert(error.message || "开始服务失败");
      }
    } catch (error) {
      alert("操作过程中出现错误");
    } finally {
      setStarting(false);
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!order || !guide) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">订单或地陪信息不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ModernIcons.Celebration size={64} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">游玩开始</h1>
          <p className="text-gray-600">正式开始游玩，祝您玩得开心！</p>
        </div>

        {/* 流程指示器 */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">需求信息</span>
            </div>
            <div className="w-4 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">支付定金</span>
            </div>
            <div className="w-4 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">选择地陪</span>
            </div>
            <div className="w-4 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">见面确认</span>
            </div>
            <div className="w-4 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                5
              </div>
              <span className="ml-2 text-sm font-medium text-pink-600">游玩开始</span>
            </div>
          </div>
        </div>

        {/* 成功信息 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-green-600 text-2xl">✅</span>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-green-800 mb-2">
                支付完成！
              </h3>
              <p className="text-green-700">
                您已成功完成所有支付流程，现在可以开始愉快的陪玩体验了！
              </p>
            </div>
          </div>
        </div>

        {/* 地陪信息 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">您的地陪</h2>
          <div className="flex items-center space-x-4">
            <img
              src={guide.avatar || "/default-avatar.svg"}
              alt={guide.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{guide.name}</h3>
              <p className="text-gray-600">联系电话：{guide.phone}</p>
            </div>
          </div>
        </div>

        {/* 服务信息 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">服务信息</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">开始时间：</span>
              <span className="font-medium">
                {new Date(order.requirement.startTime).toLocaleString("zh-CN")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">服务时长：</span>
              <span className="font-medium">{order.requirement.duration}小时</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">服务类型：</span>
              <span className="font-medium">
                {serviceTypeMap[order.requirement.serviceType as keyof typeof serviceTypeMap]}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">服务区域：</span>
              <span className="font-medium">{order.requirement.area}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">服务地址：</span>
              <span className="font-medium">{order.requirement.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">总费用：</span>
              <span className="font-medium text-pink-600">¥{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* 温馨提示 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">温馨提示</h3>
          <ul className="text-blue-700 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>客服会在到期前20分钟联系您，如需增加时长请提前联系</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>避免行程中突然无法继续导致您的体验不佳</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>如有任何问题，请及时联系客服：400-123-4567</span>
            </li>
          </ul>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-4">
          <button
            onClick={handleStartService}
            disabled={starting}
            className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {starting ? "开始中..." : "确认开始服务"}
          </button>

          <div className="flex space-x-4">
            <Link
              href={`/orders/${orderId}`}
              className="flex-1 text-center py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              查看订单详情
            </Link>
            <Link
              href={`/messages/${guide.id}`}
              className="flex-1 text-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              联系地陪
            </Link>
          </div>
        </div>

        {/* 客服联系 */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm mb-2">遇到问题？</p>
          <a
            href="tel:400-123-4567"
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            联系客服：400-123-4567
          </a>
        </div>
      </div>
    </div>
  );
}
