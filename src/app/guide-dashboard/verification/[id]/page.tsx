"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { ModernIcons } from "@/components/icons/ModernIcons";
import Link from "next/link";

interface GuideApplication {
  id: string;
  displayName: string;
  realName: string;
  city: string;
  hourlyRate: number;
  bio: string;
  skills: string[];
  photos: string[];
  status: "pending" | "under_review" | "approved" | "rejected" | "need_more_info";
  submittedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
  reviewHistory: Array<{
    id: string;
    reviewerName: string;
    action: string;
    status: string;
    notes?: string;
    timestamp: string;
  }>;
}

export default function VerificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [application, setApplication] = useState<GuideApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/guide/verification/${id}`);
      if (response.ok) {
        const data = await response.json();
        setApplication(data.application);
      } else if (response.status === 404) {
        router.push("/guide-dashboard");
      } else {
        console.error("Failed to fetch application");
      }
    } catch (error) {
      console.error("Failed to fetch application:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "under_review":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "need_more_info":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "待审核";
      case "under_review":
        return "审核中";
      case "approved":
        return "已通过";
      case "rejected":
        return "已拒绝";
      case "need_more_info":
        return "需补充材料";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ModernIcons.Loading size={32} className="text-pink-600" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">申请不存在</h2>
          <Link href="/guide-dashboard" className="text-pink-600 hover:text-pink-700">
            返回工作台
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
            <Link
              href="/guide-dashboard"
              className="text-gray-600 hover:text-gray-800"
            >
              <ModernIcons.ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">认证申请详情</h1>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(application.status)}`}>
              {getStatusText(application.status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">基本信息</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">显示昵称</label>
                  <p className="text-gray-900">{application.displayName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">真实姓名</label>
                  <p className="text-gray-900">{application.realName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">所在城市</label>
                  <p className="text-gray-900">{application.city}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">小时费率</label>
                  <p className="text-gray-900">¥{application.hourlyRate}/小时</p>
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">服务信息</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">个人简介</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded">{application.bio}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">专业技能</label>
                  <div className="flex flex-wrap gap-2">
                    {application.skills.map((skill, index) => (
                      <span key={index} className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">个人照片</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {application.photos.map((photo, index) => (
                  <img key={index} src={photo} alt={`照片${index + 1}`} className="w-full h-32 object-cover rounded border" />
                ))}
              </div>
            </div>

            {/* Review Notes */}
            {application.reviewNotes && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">审核备注</h2>
                <div className={`p-4 rounded-lg ${
                  application.status === "approved" ? "bg-green-50 border border-green-200" :
                  application.status === "rejected" ? "bg-red-50 border border-red-200" :
                  "bg-orange-50 border border-orange-200"
                }`}>
                  <p className="text-gray-700">{application.reviewNotes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">申请状态</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">当前状态</label>
                  <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(application.status)}`}>
                    {getStatusText(application.status)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">提交时间</label>
                  <p className="text-gray-900">{new Date(application.submittedAt).toLocaleString('zh-CN')}</p>
                </div>
                {application.reviewedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">审核时间</label>
                    <p className="text-gray-900">{new Date(application.reviewedAt).toLocaleString('zh-CN')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">操作</h3>
              <div className="space-y-3">
                {(application.status === "rejected" || application.status === "need_more_info") && (
                  <Link
                    href="/apply-guide?edit=true"
                    className="block w-full bg-pink-600 text-white text-center py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    修改并重新申请
                  </Link>
                )}
                <Link
                  href="/guide-dashboard"
                  className="block w-full bg-gray-300 text-gray-700 text-center py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  返回工作台
                </Link>
              </div>
            </div>

            {/* Review History */}
            {application.reviewHistory && application.reviewHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">审核历史</h3>
                <div className="space-y-3">
                  {application.reviewHistory.map((record, index) => (
                    <div key={index} className="border-l-4 border-gray-200 pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{record.reviewerName}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(record.timestamp).toLocaleString('zh-CN')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{record.action}</p>
                      {record.notes && (
                        <p className="text-sm text-gray-500 mt-1">{record.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
