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
  idNumber: string;
  phone: string;
  email?: string;
  gender: string;
  age: number;
  city: string;
  address: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  availableServices: string[];
  languages: string[];
  idCardFront: string;
  idCardBack: string;
  healthCertificate?: string;
  backgroundCheck?: string;
  photos: string[];
  experience: string;
  motivation: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  status: "pending" | "under_review" | "approved" | "rejected" | "need_more_info";
  submittedAt: string;
  reviewNotes?: string;
  reviewedAt?: string;
  reviewerName?: string;
  reviewHistory: Array<{
    id: string;
    reviewerName: string;
    action: string;
    status: string;
    notes?: string;
    timestamp: string;
  }>;
}

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [application, setApplication] = useState<GuideApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | "request_info">("approve");
  const [reviewNotes, setReviewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApplication();

    // 监听登录状态变化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ml_session_changed') {
        fetchApplication();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [id]);

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/admin/applications/${id}`);
      if (response.ok) {
        const data = await response.json();
        setApplication(data.application);
      } else {
        router.push("/admin/applications");
      }
    } catch (error) {
      console.error("Failed to fetch application:", error);
      router.push("/admin/applications");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!application) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/applications/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: reviewAction,
          notes: reviewNotes,
        }),
      });

      if (response.ok) {
        await fetchApplication();
        setShowReviewModal(false);
        setReviewNotes("");
      } else {
        const error = await response.json();
        alert(`操作失败：${error.message}`);
      }
    } catch (error) {
      alert("网络错误，请重试");
    } finally {
      setSubmitting(false);
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
          <Link href="/admin/applications" className="text-pink-600 hover:text-pink-700">
            返回申请列表
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
              href="/admin/applications"
              className="text-gray-600 hover:text-gray-800"
            >
              <ModernIcons.ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">申请详情</h1>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(application.status)}`}>
              {getStatusText(application.status)}
            </span>
          </div>
          
          {/* Action Buttons */}
          {(application.status === "pending" || application.status === "under_review") && (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setReviewAction("approve");
                  setShowReviewModal(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                通过申请
              </button>
              <button
                onClick={() => {
                  setReviewAction("reject");
                  setShowReviewModal(true);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                拒绝申请
              </button>
              <button
                onClick={() => {
                  setReviewAction("request_info");
                  setShowReviewModal(true);
                }}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
              >
                要求补充材料
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">个人信息</h2>
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
                  <label className="block text-sm font-medium text-gray-700">身份证号</label>
                  <p className="text-gray-900 font-mono">{application.idNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">手机号码</label>
                  <p className="text-gray-900">{application.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">性别</label>
                  <p className="text-gray-900">
                    {application.gender === "female" ? "女" : application.gender === "male" ? "男" : "其他"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">年龄</label>
                  <p className="text-gray-900">{application.age}岁</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">所在城市</label>
                  <p className="text-gray-900">{application.city}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">邮箱</label>
                  <p className="text-gray-900">{application.email || "未提供"}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">详细地址</label>
                  <p className="text-gray-900">{application.address}</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">小时费率</label>
                    <p className="text-gray-900 text-lg font-semibold">¥{application.hourlyRate}/小时</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">可提供服务</label>
                    <div className="flex flex-wrap gap-2">
                      {application.availableServices.map((service, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">语言能力</label>
                    <div className="flex flex-wrap gap-2">
                      {application.languages.map((language, index) => (
                        <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">认证材料</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">身份证正面</label>
                  <img src={application.idCardFront} alt="身份证正面" className="w-full h-48 object-cover rounded border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">身份证背面</label>
                  <img src={application.idCardBack} alt="身份证背面" className="w-full h-48 object-cover rounded border" />
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">个人照片</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {application.photos.map((photo, index) => (
                    <img key={index} src={photo} alt={`照片${index + 1}`} className="w-full h-32 object-cover rounded border" />
                  ))}
                </div>
              </div>

              {application.healthCertificate && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">健康证明</label>
                  <img src={application.healthCertificate} alt="健康证明" className="w-full max-w-md h-48 object-cover rounded border" />
                </div>
              )}

              {application.backgroundCheck && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">无犯罪记录证明</label>
                  <img src={application.backgroundCheck} alt="无犯罪记录证明" className="w-full max-w-md h-48 object-cover rounded border" />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">申请信息</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">申请编号</label>
                  <p className="text-gray-900 font-mono text-sm">{application.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">提交时间</label>
                  <p className="text-gray-900">{new Date(application.submittedAt).toLocaleString('zh-CN')}</p>
                </div>
                {application.reviewedAt && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">审核时间</label>
                      <p className="text-gray-900">{new Date(application.reviewedAt).toLocaleString('zh-CN')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">审核员</label>
                      <p className="text-gray-900">{application.reviewerName}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">紧急联系人</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">姓名</label>
                  <p className="text-gray-900">{application.emergencyContact.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">电话</label>
                  <p className="text-gray-900">{application.emergencyContact.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">关系</label>
                  <p className="text-gray-900">{application.emergencyContact.relationship}</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">补充信息</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">相关经验</label>
                  <p className="text-gray-900 text-sm bg-gray-50 p-3 rounded">{application.experience}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">申请动机</label>
                  <p className="text-gray-900 text-sm bg-gray-50 p-3 rounded">{application.motivation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {reviewAction === "approve" && "通过申请"}
                {reviewAction === "reject" && "拒绝申请"}
                {reviewAction === "request_info" && "要求补充材料"}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {reviewAction === "approve" && "通过原因（可选）"}
                  {reviewAction === "reject" && "拒绝原因"}
                  {reviewAction === "request_info" && "需要补充的材料"}
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder={
                    reviewAction === "approve" ? "可选择填写通过原因..." :
                    reviewAction === "reject" ? "请说明拒绝原因..." :
                    "请详细说明需要补充的材料..."
                  }
                  required={reviewAction !== "approve"}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReview}
                  disabled={submitting || (reviewAction !== "approve" && !reviewNotes.trim())}
                  className="flex-1 bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 disabled:opacity-50"
                >
                  {submitting ? "处理中..." : "确认"}
                </button>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewNotes("");
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
