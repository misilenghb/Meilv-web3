"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabaseToFrontend, type SupabaseOrder } from "@/lib/order-adapter";

interface Guide {
  id: string;
  name: string;
  avatar?: string;
  age: number;
  rating?: number;
  ratingCount?: number;
  hourlyRate: number;
  skills?: string[];
  bio?: string;
  certificationStatus: string;
}

interface Order {
  id: string;
  requirement: {
    startTime: string;
    duration: number;
    serviceType: string;
    area: string;
    address: string;
  };
  depositAmount: number;
  status: string;
}

function GuideSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    if (!orderId) {
      alert("缺少订单ID");
      router.push("/booking");
      return;
    }
    fetchOrderAndGuides();
  }, [orderId]);

  const fetchOrderAndGuides = async () => {
    if (!orderId) return;
    
    try {
      // 获取订单信息
      const orderResponse = await fetch(`/api/orders/${orderId}`);
      if (orderResponse.ok) {
        const supabaseOrderData = await orderResponse.json();
        const frontendOrderData = supabaseToFrontend(supabaseOrderData);
        setOrder(frontendOrderData);
        
        // 获取可用地陪列表
        const guidesResponse = await fetch("/api/guides");
        if (guidesResponse.ok) {
          const guidesData = await guidesResponse.json();
          setGuides(guidesData.items || []);
        }
      } else {
        alert("订单不存在");
        router.push("/booking");
      }
    } catch (error) {
      alert("获取信息失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGuide = async (guideId: string, hourlyRate: number) => {
    if (!order || !orderId) return;
    
    setSelecting(true);
    try {
      const totalAmount = hourlyRate * order.requirement.duration;
      
      const response = await fetch(`/api/orders/${orderId}/select-guide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guideId,
          totalAmount,
        }),
      });

      if (response.ok) {
        // 选择成功，跳转到定金支付页面
        router.push(`/booking/deposit-payment/${orderId}`);
      } else {
        const error = await response.json();
        alert(error.message || "选择地陪失败");
      }
    } catch (error) {
      alert("选择过程中出现错误");
    } finally {
      setSelecting(false);
    }
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

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">订单不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">选择心仪陪玩达人</h1>
          <p className="text-gray-600">了解不同达人单价、技能，进行选择</p>
        </div>

        {/* 流程指示器 */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">需求信息</span>
            </div>
            <div className="w-8 h-px bg-pink-600"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-pink-600">选择地陪</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm text-gray-500">等待收款</span>
            </div>
          </div>
        </div>

        {/* 订单摘要 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4 text-sm">
            <span><strong>时间：</strong>{new Date(order.requirement.startTime).toLocaleString("zh-CN")}</span>
            <span><strong>时长：</strong>{order.requirement.duration}小时</span>
            <span><strong>区域：</strong>{order.requirement.area}</span>
          </div>
        </div>

        {/* 地陪列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map((guide) => {
            const totalAmount = guide.hourlyRate * order.requirement.duration;
            const finalAmount = totalAmount - order.depositAmount; // 减去已付定金
            
            return (
              <div key={guide.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={guide.photos?.[0] || "/default-avatar.svg"}
                    alt={guide.displayName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-800">{guide.displayName}</h3>
                      {guide.certificationStatus === "verified" && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          已认证
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < Math.floor(guide.ratingAvg || 0) ? "★" : "☆"}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {guide.ratingAvg ? guide.ratingAvg.toFixed(1) : '暂无评分'} ({guide.ratingCount || 0}条评价)
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{guide.bio || '暂无介绍'}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(guide.skills || []).map((skill, index) => (
                        <span
                          key={index}
                          className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 价格信息 */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>单价：</span>
                      <span className="font-medium">¥{guide.hourlyRate}/小时</span>
                    </div>
                    <div className="flex justify-between">
                      <span>总价：</span>
                      <span className="font-medium">¥{totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>已付定金：</span>
                      <span>-¥{order.depositAmount}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                      <span>见面后需付：</span>
                      <span className="text-pink-600">¥{finalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex space-x-3">
                  <Link
                    href={`/guides/${guide.id}`}
                    className="flex-1 text-center py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    查看详情
                  </Link>
                  <button
                    onClick={() => handleSelectGuide(guide.id, guide.hourlyRate)}
                    disabled={selecting}
                    className="flex-1 py-2 px-4 bg-pink-600 text-white rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
                  >
                    {selecting ? "选择中..." : "选择TA"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {guides.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">暂无可用地陪，请稍后再试</p>
          </div>
        )}

        {/* 返回按钮 */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 返回上一页
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GuideSelectionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    }>
      <GuideSelectionContent />
    </Suspense>
  );
}
