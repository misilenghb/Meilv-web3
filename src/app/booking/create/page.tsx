"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ModernIcons } from "@/components/icons/ModernIcons";
import Link from "next/link";

interface ServiceOption {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  color: string;
  icon: string;
}

const serviceOptions: ServiceOption[] = [
  {
    id: "daily",
    name: "日常陪伴",
    description: "购物、用餐、散步等日常活动陪伴",
    price: 200,
    unit: "小时",
    color: "blue",
    icon: "👥"
  },
  {
    id: "tour",
    name: "同城旅游",
    description: "景点游览、拍照打卡、文化体验",
    price: 800,
    unit: "天",
    color: "green",
    icon: "🗺️"
  },
  {
    id: "entertainment",
    name: "微醺娱乐",
    description: "酒吧、KTV、夜生活等娱乐活动",
    price: 300,
    unit: "小时",
    color: "purple",
    icon: "🍷"
  },
  {
    id: "custom",
    name: "自定义服务",
    description: "根据您的需求定制专属服务",
    price: 0,
    unit: "协商",
    color: "pink",
    icon: "⭐"
  }
];

function CreateBookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [formData, setFormData] = useState({
    guideId: "",
    serviceType: "",
    startDate: "",
    startTime: "",
    duration: 4,
    location: "",
    requirements: "",
    contactPhone: "",
    emergencyContact: ""
  });

  useEffect(() => {
    // 从URL参数获取预设值
    const guideId = searchParams.get("guideId");
    const service = searchParams.get("service");
    
    if (guideId) {
      setFormData(prev => ({ ...prev, guideId }));
    }
    
    if (service) {
      setSelectedService(service);
      setFormData(prev => ({ ...prev, serviceType: service }));
    }
  }, [searchParams]);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setFormData(prev => ({ ...prev, serviceType: serviceId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.guideId || !formData.serviceType || !formData.startDate || !formData.startTime) {
      alert("请填写完整的预约信息");
      return;
    }

    setLoading(true);
    try {
      // 第一步：创建订单草稿
      const orderResponse = await fetch("/api/orders/create-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirement: {
            serviceType: formData.serviceType,
            startTime: new Date(`${formData.startDate}T${formData.startTime}`).toISOString(),
            duration: formData.duration,
            area: formData.location,
            address: formData.location,
            specialRequests: formData.requirements,
          },
          depositAmount: 0, // 人工收款模式
        }),
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.json();

        // 特殊处理409冲突错误（已有未完成订单）
        if (orderResponse.status === 409) {
          const details = error.details;
          const startTime = new Date(details.startTime).toLocaleString('zh-CN');
          alert(`${error.error}\n\n现有订单信息：\n服务类型：${details.serviceTitle}\n开始时间：${startTime}\n状态：${details.status}\n\n请先完成或取消现有订单后再创建新订单。`);
        } else {
          alert(`创建订单失败：${error.error || error.message}`);
        }
        return;
      }

      const order = await orderResponse.json();

      // 第二步：选择地陪
      const selectResponse = await fetch(`/api/orders/${order.id}/select-guide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guideId: formData.guideId,
          totalAmount: formData.duration * 100, // 假设每小时100元，实际应该从地陪信息获取
        }),
      });

      if (selectResponse.ok) {
        alert("预约提交成功！");
        router.push(`/booking/payment-pending/${order.id}`);
      } else {
        const error = await selectResponse.json();
        alert(`选择地陪失败：${error.message}`);
      }
    } catch (error) {
      alert("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  const selectedServiceOption = serviceOptions.find(s => s.id === selectedService);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/guides" className="text-gray-600 hover:text-gray-800">
              <ModernIcons.ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">创建预约</h1>
          </div>
          <p className="text-gray-600">选择服务类型并填写预约详情</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Service Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">选择服务类型</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviceOptions.map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleServiceSelect(service.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedService === service.id
                      ? `border-${service.color}-500 bg-${service.color}-50`
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{service.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium text-${service.color}-600`}>
                          {service.price > 0 ? `¥${service.price}/${service.unit}` : service.unit}
                        </span>
                        {selectedService === service.id && (
                          <ModernIcons.Check size={20} className={`text-${service.color}-600`} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Details */}
          {selectedService && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">预约详情</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date and Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    预约日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    开始时间 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    服务时长
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    {selectedServiceOption?.unit === "小时" ? (
                      <>
                        <option value={2}>2小时</option>
                        <option value={4}>4小时</option>
                        <option value={6}>6小时</option>
                        <option value={8}>8小时</option>
                      </>
                    ) : (
                      <>
                        <option value={1}>1天</option>
                        <option value={2}>2天</option>
                        <option value={3}>3天</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    服务地点
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="请输入具体地址或地标"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    联系电话 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="请输入您的手机号"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    紧急联系人
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    placeholder="姓名 + 电话"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Requirements */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  特殊要求
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                  rows={4}
                  placeholder="请描述您的具体需求、偏好或注意事项..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Price Summary */}
          {selectedService && selectedServiceOption && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">费用预估</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{selectedServiceOption.name}</span>
                  <span className="font-medium">
                    ¥{selectedServiceOption.price} × {formData.duration}{selectedServiceOption.unit}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>预估总价</span>
                    <span className="text-pink-600">
                      {selectedServiceOption.price > 0 
                        ? `¥${selectedServiceOption.price * formData.duration}`
                        : "面议"
                      }
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  * 最终价格以地陪确认为准，可能根据具体需求调整
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <Link
              href="/guides"
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors text-center"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={loading || !selectedService}
              className="flex-1 bg-pink-600 text-white py-3 px-6 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "提交中..." : "提交预约"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <CreateBookingPageContent />
    </Suspense>
  );
}
