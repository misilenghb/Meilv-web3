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
  idCardFront: string;
  idCardBack: string;
  experience: string;
  motivation: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  status: string;
  submittedAt: string;
}

interface ReviewCriterion {
  category: string;
  criterion: string;
  isRequired: boolean;
  weight: number;
  passed: boolean;
  reason?: string;
}

interface ReviewResult {
  score: number;
  maxScore: number;
  passed: boolean;
  issues: string[];
  recommendations: string[];
  criteria: ReviewCriterion[];
}

export default function ReviewApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [application, setApplication] = useState<GuideApplication | null>(null);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | "request_info">("approve");
  const [reviewNotes, setReviewNotes] = useState("");

  useEffect(() => {
    fetchApplicationAndReview();
  }, [id]);

  const fetchApplicationAndReview = async () => {
    try {
      // 获取申请详情
      const appResponse = await fetch(`/api/admin/applications/${id}`);
      if (appResponse.ok) {
        const appData = await appResponse.json();
        setApplication(appData.application);

        // 自动审核检查
        const reviewResponse = await fetch(`/api/admin/applications/${id}/auto-review`);
        if (reviewResponse.ok) {
          const reviewData = await reviewResponse.json();
          setReviewResult(reviewData.result);
          
          // 根据自动审核结果设置默认操作
          if (!reviewData.result.passed) {
            setReviewAction("request_info");
            setReviewNotes(reviewData.result.issues.join("; "));
          }
        }
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

    if ((reviewAction === "reject" || reviewAction === "request_info") && !reviewNotes.trim()) {
      alert(reviewAction === "reject" ? "请填写拒绝原因" : "请说明需要补充的材料");
      return;
    }

    setReviewing(true);
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
        const result = await response.json();
        alert(result.message);
        router.push("/admin/applications");
      } else {
        const error = await response.json();
        alert(`操作失败：${error.message}`);
      }
    } catch (error) {
      alert("网络错误，请重试");
    } finally {
      setReviewing(false);
    }
  };

  const getCriteriaIcon = (passed: boolean, isRequired: boolean) => {
    if (passed) {
      return <ModernIcons.Check size={20} className="text-green-600" />;
    } else if (isRequired) {
      return <ModernIcons.X size={20} className="text-red-600" />;
    } else {
      return <ModernIcons.Warning size={20} className="text-yellow-600" />;
    }
  };

  const getCriteriaColor = (passed: boolean, isRequired: boolean) => {
    if (passed) {
      return "border-green-200 bg-green-50";
    } else if (isRequired) {
      return "border-red-200 bg-red-50";
    } else {
      return "border-yellow-200 bg-yellow-50";
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/admin/applications/${id}`}
              className="text-gray-600 hover:text-gray-800"
            >
              <ModernIcons.ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">审核申请</h1>
          </div>
          <p className="text-gray-600">
            申请人：{application.displayName} ({application.realName}) - {application.city}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 审核标准检查 */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">自动审核结果</h2>
              
              {reviewResult && (
                <>
                  {/* 总体评分 */}
                  <div className="mb-6 p-4 rounded-lg border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-semibold">总体评分</span>
                      <span className={`text-2xl font-bold ${reviewResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {reviewResult.score}/{reviewResult.maxScore}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${reviewResult.passed ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${(reviewResult.score / reviewResult.maxScore) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {reviewResult.passed ? "符合基本要求" : "不符合基本要求"}
                    </p>
                  </div>

                  {/* 详细标准检查 */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">详细检查项目</h3>
                    {reviewResult.criteria?.map((criterion, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${getCriteriaColor(criterion.passed, criterion.isRequired)}`}
                      >
                        <div className="flex items-start gap-3">
                          {getCriteriaIcon(criterion.passed, criterion.isRequired)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{criterion.criterion}</span>
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                {criterion.category}
                              </span>
                              {criterion.isRequired && (
                                <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded">
                                  必填
                                </span>
                              )}
                            </div>
                            {criterion.reason && (
                              <p className="text-sm text-gray-600 mt-1">{criterion.reason}</p>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-500">
                            {criterion.weight}分
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 问题和建议 */}
                  {(reviewResult.issues.length > 0 || reviewResult.recommendations.length > 0) && (
                    <div className="mt-6 space-y-4">
                      {reviewResult.issues.length > 0 && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <h4 className="font-semibold text-red-800 mb-2">需要解决的问题</h4>
                          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                            {reviewResult.issues.map((issue, index) => (
                              <li key={index}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {reviewResult.recommendations.length > 0 && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <h4 className="font-semibold text-yellow-800 mb-2">改进建议</h4>
                          <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                            {reviewResult.recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* 审核操作 */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">审核决定</h2>
              
              {/* 操作选择 */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">选择操作</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="reviewAction"
                        value="approve"
                        checked={reviewAction === "approve"}
                        onChange={(e) => setReviewAction(e.target.value as any)}
                        className="mr-3 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-green-700 font-medium">通过申请</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="reviewAction"
                        value="reject"
                        checked={reviewAction === "reject"}
                        onChange={(e) => setReviewAction(e.target.value as any)}
                        className="mr-3 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-red-700 font-medium">拒绝申请</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="reviewAction"
                        value="request_info"
                        checked={reviewAction === "request_info"}
                        onChange={(e) => setReviewAction(e.target.value as any)}
                        className="mr-3 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-orange-700 font-medium">要求补充材料</span>
                    </label>
                  </div>
                </div>

                {/* 审核意见 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    审核意见
                    {(reviewAction === "reject" || reviewAction === "request_info") && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder={
                      reviewAction === "approve" ? "可选择填写通过原因..." :
                      reviewAction === "reject" ? "请详细说明拒绝原因..." :
                      "请详细说明需要补充的材料和要求..."
                    }
                  />
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={handleReview}
                  disabled={reviewing || ((reviewAction === "reject" || reviewAction === "request_info") && !reviewNotes.trim())}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium ${
                    reviewAction === "approve" ? "bg-green-600 hover:bg-green-700" :
                    reviewAction === "reject" ? "bg-red-600 hover:bg-red-700" :
                    "bg-orange-600 hover:bg-orange-700"
                  } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {reviewing ? "处理中..." : 
                   reviewAction === "approve" ? "通过申请" :
                   reviewAction === "reject" ? "拒绝申请" : "要求补充材料"}
                </button>
                <Link
                  href={`/admin/applications/${id}`}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-center"
                >
                  返回详情
                </Link>
              </div>
            </div>

            {/* 申请摘要 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">申请摘要</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">申请人：</span>
                  <span className="font-medium">{application.displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">城市：</span>
                  <span className="font-medium">{application.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">费率：</span>
                  <span className="font-medium">¥{application.hourlyRate}/小时</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">技能：</span>
                  <span className="font-medium">{application.skills.length}项</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">提交时间：</span>
                  <span className="font-medium">
                    {new Date(application.submittedAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
