"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    startTime: "",
    duration: 4,
    serviceType: "daily" as "daily" | "mild_entertainment" | "local_tour",
    area: "",
    address: "",
    specialRequests: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [preselectedGuideId, setPreselectedGuideId] = useState<string | null>(null);
  const [hasActiveOrder, setHasActiveOrder] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  useEffect(() => {
    // 检查是否有预选的地陪ID
    const guideId = searchParams.get("guideId");
    if (guideId) {
      setPreselectedGuideId(guideId);
    }

    // 检查登录状态和现有订单
    checkLoginStatus();

    // 监听登录状态变化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ml_session_changed') {
        checkLoginStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [searchParams]);

  const checkLoginStatus = async () => {
    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const data = await response.json();
        if (data.session) {
          setIsLoggedIn(true);
          // 如果已登录，检查是否有进行中的订单
          await checkActiveOrders();
        } else {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("检查登录状态失败:", error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const checkActiveOrders = async () => {
    try {
      // 检查进行中的订单状态
      const activeStatuses = ['confirmed', 'in_progress'];

      for (const status of activeStatuses) {
        const response = await fetch(`/api/orders?status=${status}`);
        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            const activeOrder = data.items[0]; // 取最新的一个
            setHasActiveOrder(true);
            setActiveOrderId(activeOrder.id);
            return; // 找到活跃订单就返回
          }
        }
      }

      // 没有找到活跃订单
      setHasActiveOrder(false);
      setActiveOrderId(null);
    } catch (error) {
      console.error("检查活跃订单失败:", error);
    }
  };

  const redirectToActiveOrder = async (orderId: string) => {
    try {
      // 获取订单详情以确定跳转页面
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const order = await response.json();

        // 根据订单状态跳转到相应页面
        if (order.status === 'confirmed') {
          // 已确认，等待收取保证金
          router.push(`/booking/deposit-payment/${orderId}`);
        } else if (order.status === 'in_progress') {
          // 保证金已收取，等待见面
          router.push(`/booking/waiting-meetup/${orderId}`);
        } else {
          // 其他状态，跳转到我的预约页面
          router.push('/my-bookings');
        }
      } else {
        // 订单不存在，跳转到我的预约页面
        router.push('/my-bookings');
      }
    } catch (error) {
      console.error("获取订单详情失败:", error);
      router.push('/my-bookings');
    }
  };

  const serviceTypes = [
    { value: "daily", label: "日常陪伴", description: "购物、用餐、休闲娱乐" },
    { value: "mild_entertainment", label: "微醺娱乐", description: "酒吧、KTV、夜生活" },
    { value: "local_tour", label: "同城旅游", description: "景点游览、文化体验" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 检查登录状态
    if (!isLoggedIn) {
      if (confirm("请先登录后再预约服务。是否前往登录页面？")) {
        router.push("/login");
      }
      return;
    }

    // 检查是否有活跃订单
    if (hasActiveOrder && activeOrderId) {
      if (confirm("您有一个正在进行的订单。是否前往查看订单状态？")) {
        // 根据订单状态跳转到相应页面
        await redirectToActiveOrder(activeOrderId);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // 构建符合API期望的requirement对象
      const requirement = {
        serviceType: formData.serviceType,
        startTime: new Date(formData.startTime).toISOString(), // 转换为ISO格式
        duration: formData.duration,
        area: formData.area,
        address: formData.address,
        specialRequests: formData.specialRequests,
      };

      const response = await fetch("/api/orders/create-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirement,
          depositAmount: 0, // 人工收款模式，无需定金
        }),
      });

      if (response.ok) {
        const order = await response.json();

        // 创建订单后直接跳转到地陪选择页面
        router.push(`/guide-selection?orderId=${order.id}`);
      } else {
        const error = await response.json();

        // 特殊处理409冲突错误（已有未完成订单）
        if (response.status === 409) {
          const details = error.details;
          const startTime = new Date(details.startTime).toLocaleString('zh-CN');
          alert(`${error.error}\n\n现有订单信息：\n服务类型：${details.serviceTitle}\n开始时间：${startTime}\n状态：${details.status}\n\n请先完成或取消现有订单后再创建新订单。`);
        } else {
          alert(error.error || error.message || "创建订单失败");
        }
      }
    } catch (error) {
      alert("网络错误，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">陪玩预约</h1>
          <p className="text-gray-600">告诉我们您的需求，即可选择心仪地陪</p>
        </div>

        {/* 流程指示器 */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-pink-600">填写需求</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm text-gray-500">选择地陪</span>
            </div>
          </div>
        </div>

        {/* 加载状态 */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            <p className="mt-2 text-gray-600">检查登录状态...</p>
          </div>
        )}

        {/* 活跃订单提示 */}
        {!isLoading && isLoggedIn && hasActiveOrder && activeOrderId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">您有正在进行的订单</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    您当前有一个正在进行的预约订单，请先完成当前订单后再创建新的预约。
                  </p>
                </div>
              </div>
              <div className="ml-4">
                <button
                  onClick={() => redirectToActiveOrder(activeOrderId)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  查看订单
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 未登录提示 */}
        {!isLoading && !isLoggedIn && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">需要登录</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>请先登录后再预约服务。</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    前往登录
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 表单 */}
        {!isLoading && isLoggedIn && !hasActiveOrder && (
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* 开始时间 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              开始时间 *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {/* 游玩时长 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              游玩时长 *
            </label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value={2}>2小时</option>
              <option value={3}>3小时</option>
              <option value={4}>4小时</option>
              <option value={6}>6小时</option>
              <option value={8}>8小时</option>
            </select>
          </div>

          {/* 游玩项目 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              游玩项目 *
            </label>
            <div className="grid grid-cols-1 gap-3">
              {serviceTypes.map((service) => (
                <label
                  key={service.value}
                  className={`relative flex cursor-pointer rounded-2xl border p-4 focus:outline-none ${
                    formData.serviceType === service.value
                      ? "border-pink-600 ring-2 ring-pink-600"
                      : "border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="serviceType"
                    value={service.value}
                    checked={formData.serviceType === service.value}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as any })}
                    className="sr-only"
                  />
                  <div className="flex flex-1">
                    <div className="flex flex-col">
                      <span className="block text-sm font-medium text-gray-900">
                        {service.label}
                      </span>
                      <span className="block text-sm text-gray-500">
                        {service.description}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 游玩区域 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              游玩区域 *
            </label>
            <input
              type="text"
              required
              placeholder="如：朝阳区、海淀区、西城区等"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {/* 大概地址 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              大概地址 *
            </label>
            <input
              type="text"
              required
              placeholder="如：三里屯、王府井、后海等"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {/* 特殊要求 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              特殊要求（可选）
            </label>
            <textarea
              rows={3}
              placeholder="请描述您的特殊需求或偏好..."
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {/* 提交按钮 */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-pink-600 text-white py-3 px-4 rounded-2xl font-medium hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "创建中..." : "下一步：选择地陪"}
            </button>
          </div>
          </form>
        )}

        {/* 说明 */}
        <div className="mt-8 p-4 bg-gray-50 rounded-2xl">
          <h3 className="text-sm font-medium text-gray-900 mb-2">温馨提示</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 填写需求后，您可以浏览地陪或联系客服推荐</li>
            <li>• 选择地陪后将确定最终服务价格</li>
            <li>• 确认订单后需要支付全额费用</li>
            <li>• 如需取消订单，请提前24小时联系客服</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
