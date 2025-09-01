"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { ModernIcons } from "@/components/icons/ModernIcons";
import Link from "next/link";

interface BookingDetail {
  id: string;
  userId: string;
  guideId: string;
  requirement: {
    serviceType: string;
    startTime: string;
    duration: number;
    area: string;
    address: string;
    specialRequests: string;
  };
  depositAmount: number;
  totalAmount: number;
  finalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetail();
  }, [id]);

  const fetchBookingDetail = async () => {
    try {
      const response = await fetch(`/api/orders/${id}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data);
      } else if (response.status === 404) {
        router.push("/my-bookings");
      }
    } catch (error) {
      console.error("Failed to fetch booking detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    const statusTextMap: Record<string, string> = {
      'pending': '待分配地陪',
      'confirmed': '等待收款',
      'in_progress': '服务中',
      'completed': '已完成',
      'cancelled': '已取消',
    };
    return statusTextMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      "pending": "bg-gray-100 text-gray-800",
      "confirmed": "bg-yellow-100 text-yellow-800",
      "in_progress": "bg-blue-100 text-blue-800",
      "completed": "bg-green-100 text-green-800",
      "cancelled": "bg-red-100 text-red-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ModernIcons.Loading size={32} className="text-pink-600" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">预约不存在</h2>
          <Link href="/my-bookings" className="text-pink-600 hover:text-pink-700">
            返回预约列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/my-bookings" className="text-gray-600 hover:text-gray-800">
              <ModernIcons.ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">预约详情</h1>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(booking.status)}`}>
              {getStatusText(booking.status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">服务信息</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">服务类型</label>
                  <p className="text-gray-900">{booking.requirement.serviceType}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">开始时间</label>
                    <p className="text-gray-900">
                      {new Date(booking.requirement.startTime).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">服务时长</label>
                    <p className="text-gray-900">{booking.requirement.duration} 小时</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">服务区域</label>
                    <p className="text-gray-900">{booking.requirement.area}</p>
                  </div>
                  {booking.requirement.address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">具体地址</label>
                      <p className="text-gray-900">{booking.requirement.address}</p>
                    </div>
                  )}
                </div>
                {booking.requirement.specialRequests && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">特殊要求</label>
                    <p className="text-gray-900">{booking.requirement.specialRequests}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Guide Info */}
            {booking.guideId && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">地陪信息</h2>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <ModernIcons.User size={32} className="text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">地陪 ID: {booking.guideId}</h3>
                    <p className="text-sm text-gray-600">地陪详细信息请联系客服获取</p>
                  </div>
                </div>
              </div>
            )}

            {!booking.guideId && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">地陪信息</h2>
                <div className="text-center py-8">
                  <ModernIcons.Clock size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">等待分配地陪</p>
                  <p className="text-sm text-gray-500 mt-2">我们正在为您匹配合适的地陪，请耐心等待</p>
                </div>
              </div>
            )}


          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">费用信息</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">保证金</span>
                  <span className="font-medium">¥{booking.depositAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">服务费用</span>
                  <span className="font-medium">¥{booking.finalAmount}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>总计</span>
                    <span className="text-pink-600">¥{booking.totalAmount}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  订单状态：
                  <span className={`ml-1 ${
                    booking.status === 'completed' ? 'text-green-600' :
                    booking.status === 'in_progress' ? 'text-blue-600' :
                    booking.status === 'confirmed' ? 'text-yellow-600' :
                    booking.status === 'cancelled' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {booking.paymentStatus === 'paid' ? '已支付' : 
                     booking.paymentStatus === 'pending' ? '待支付' : '已退款'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">操作</h3>
              <div className="space-y-3">
                {booking.status === "pending" && (
                  <>
                    <button className="w-full bg-red-600 text-white py-2 px-4 rounded-2xl hover:bg-red-700 transition-colors">
                      取消预约
                    </button>
                    <button className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-2xl hover:bg-gray-400 transition-colors">
                      修改预约
                    </button>
                  </>
                )}
                
                {booking.status === "confirmed" && booking.paymentStatus === "pending" && (
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-2xl hover:bg-green-700 transition-colors">
                    立即支付
                  </button>
                )}
                
                {booking.status === "completed" && (
                  <Link
                    href={`/booking/${booking.id}/review`}
                    className="block w-full bg-pink-600 text-white py-2 px-4 rounded-2xl hover:bg-pink-700 transition-colors text-center"
                  >
                    写评价
                  </Link>
                )}
                
                <Link
                  href="/my-bookings"
                  className="block w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-2xl hover:bg-gray-400 transition-colors text-center"
                >
                  返回列表
                </Link>
              </div>
            </div>

            {/* Booking Timeline */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">预约进度</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">预约已创建</p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </div>
                
                {booking.status !== "pending" && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">地陪已确认</p>
                      <p className="text-xs text-gray-500">等待服务开始</p>
                    </div>
                  </div>
                )}
                
                {booking.status === "completed" && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">服务已完成</p>
                      <p className="text-xs text-gray-500">可以写评价了</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
