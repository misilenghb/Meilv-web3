"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ExclamationTriangleIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

interface OrderInfo {
  id: string;
  status: string;
  createdAt: string;
}

interface Respondent {
  id: string;
  name: string;
  type: 'user' | 'guide';
}

interface PermissionCheck {
  canComplain: boolean;
  reason: string;
  orderInfo?: OrderInfo;
  respondent?: Respondent;
  existingComplaint?: {
    id: string;
    status: string;
    createdAt: string;
  };
}

const COMPLAINT_CATEGORIES = {
  service_quality: "服务质量问题",
  attitude_problem: "态度问题", 
  safety_concern: "安全问题",
  pricing_dispute: "价格争议",
  no_show: "爽约/未出现",
  inappropriate_behavior: "不当行为",
  other: "其他"
};

function CreateComplaintForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [permissionCheck, setPermissionCheck] = useState<PermissionCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    evidenceUrls: [] as string[]
  });

  useEffect(() => {
    if (orderId) {
      checkComplaintPermission();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const checkComplaintPermission = async () => {
    try {
      const response = await fetch(`/api/complaints/check-permission?orderId=${orderId}`);
      const data = await response.json();
      setPermissionCheck(data);
    } catch (error) {
      console.error("Failed to check permission:", error);
      setPermissionCheck({
        canComplain: false,
        reason: "检查权限时发生错误"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!permissionCheck?.canComplain || !permissionCheck.respondent) {
      return;
    }

    if (!formData.category || !formData.title || !formData.description) {
      alert("请填写所有必填字段");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          respondentId: permissionCheck.respondent.id,
          category: formData.category,
          title: formData.title,
          description: formData.description,
          evidenceUrls: formData.evidenceUrls
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert("投诉提交成功！我们会尽快处理您的投诉。");
        router.push(`/complaints`);
      } else {
        const error = await response.json();
        alert(error.error || "提交投诉失败");
      }
    } catch (error) {
      console.error("Submit complaint error:", error);
      alert("提交投诉时发生错误");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">检查投诉权限中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="card-pink p-8 text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">缺少订单信息</h1>
            <p className="text-gray-600 mb-6">请从订单页面进入投诉流程</p>
            <Link
              href="/my-bookings"
              className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-2xl font-medium hover:from-pink-600 hover:to-rose-600 transition-all duration-200"
            >
              查看我的订单
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!permissionCheck?.canComplain) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="card-pink p-8 text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">无法投诉</h1>
            <p className="text-gray-600 mb-6">{permissionCheck?.reason}</p>
            
            {permissionCheck?.existingComplaint && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 font-medium">您已有投诉记录</p>
                <p className="text-blue-600 text-sm mt-1">
                  状态：{permissionCheck.existingComplaint.status}
                </p>
                <Link
                  href={`/complaints/${permissionCheck.existingComplaint.id}`}
                  className="inline-block mt-3 text-blue-600 hover:text-blue-700 underline"
                >
                  查看投诉详情
                </Link>
              </div>
            )}
            
            <Link
              href="/my-bookings"
              className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-2xl font-medium hover:from-pink-600 hover:to-rose-600 transition-all duration-200"
            >
              返回订单列表
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/my-bookings"
            className="text-pink-600 hover:text-pink-700 transition-colors mb-4 inline-block"
          >
            ← 返回订单列表
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">提交投诉</h1>
          <p className="text-gray-600">
            对订单 {orderId?.slice(-8)} 的服务进行投诉
          </p>
        </div>

        {/* Order Info */}
        {permissionCheck.orderInfo && (
          <div className="card-pink p-6 mb-8">
            <h3 className="font-bold text-gray-800 mb-4">订单信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">订单编号：</span>
                <span className="font-medium">{permissionCheck.orderInfo.id.slice(-8)}</span>
              </div>
              <div>
                <span className="text-gray-600">订单状态：</span>
                <span className="font-medium">{permissionCheck.orderInfo.status}</span>
              </div>
              <div>
                <span className="text-gray-600">被投诉人：</span>
                <span className="font-medium">
                  {permissionCheck.respondent?.name} 
                  ({permissionCheck.respondent?.type === 'guide' ? '地陪' : '用户'})
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Complaint Form */}
        <form onSubmit={handleSubmit} className="card-pink p-6">
          <h3 className="font-bold text-gray-800 mb-6">投诉详情</h3>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              投诉类型 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            >
              <option value="">请选择投诉类型</option>
              {Object.entries(COMPLAINT_CATEGORIES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              投诉标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="请简要描述投诉问题"
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              maxLength={200}
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              详细描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="请详细描述遇到的问题，包括时间、地点、具体情况等"
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Evidence */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              证据材料（可选）
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">
                暂不支持文件上传，请在描述中详细说明相关证据
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-2xl font-medium hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-2xl font-medium hover:from-pink-600 hover:to-rose-600 transition-all duration-200 disabled:opacity-50"
            >
              {submitting ? "提交中..." : "提交投诉"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    </div>
  );
}

export default function CreateComplaintPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CreateComplaintForm />
    </Suspense>
  );
}
