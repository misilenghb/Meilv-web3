"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ClockIcon, CheckCircleIcon, XCircleIcon, UserIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

interface ComplaintAction {
  id: string;
  actionType: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
  actor: { id: string; name: string };
}

interface ComplaintDetail {
  id: string;
  complainantId: string;
  respondentId: string;
  orderId: string;
  category: string;
  title: string;
  description: string;
  evidenceUrls: string[];
  status: string;
  priority: string;
  adminId?: string;
  adminNotes?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  complainant: { id: string; name: string; phone: string };
  respondent: { id: string; name: string; phone: string };
  admin?: { id: string; name: string };
  order: { id: string; requirement: any; status: string; total_amount: number; created_at: string };
  actions: ComplaintAction[];
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

const STATUS_CONFIG = {
  pending: { label: "待处理", color: "bg-yellow-100 text-yellow-800", icon: ClockIcon },
  investigating: { label: "调查中", color: "bg-blue-100 text-blue-800", icon: ClockIcon },
  resolved: { label: "已解决", color: "bg-green-100 text-green-800", icon: CheckCircleIcon },
  rejected: { label: "已驳回", color: "bg-red-100 text-red-800", icon: XCircleIcon },
  closed: { label: "已关闭", color: "bg-gray-100 text-gray-800", icon: XCircleIcon }
};

const PRIORITY_CONFIG = {
  low: { label: "低", color: "bg-gray-100 text-gray-800" },
  normal: { label: "普通", color: "bg-blue-100 text-blue-800" },
  high: { label: "高", color: "bg-orange-100 text-orange-800" },
  urgent: { label: "紧急", color: "bg-red-100 text-red-800" }
};

const ACTION_TYPE_LABELS = {
  created: "创建投诉",
  assigned: "分配处理人",
  status_changed: "状态变更",
  note_added: "添加备注",
  evidence_added: "添加证据",
  resolved: "解决投诉",
  rejected: "驳回投诉",
  closed: "关闭投诉"
};

export default function ComplaintDetailPage() {
  const params = useParams();
  const complaintId = params.id as string;
  
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (complaintId) {
      fetchComplaintDetail();
    }
  }, [complaintId]);

  const fetchComplaintDetail = async () => {
    try {
      const response = await fetch(`/api/complaints/${complaintId}`);
      if (response.ok) {
        const data = await response.json();
        setComplaint(data);
      } else if (response.status === 401) {
        window.location.href = "/login?redirect=/complaints";
        return;
      } else if (response.status === 404) {
        setError("投诉不存在");
      } else if (response.status === 403) {
        setError("无权查看此投诉");
      } else {
        setError("获取投诉详情失败");
      }
    } catch (error) {
      console.error("Error fetching complaint detail:", error);
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
    const IconComponent = config?.icon || ClockIcon;
    return <IconComponent className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card-pink p-8 text-center">
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">出错了</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/complaints"
              className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-2xl font-medium hover:from-pink-600 hover:to-rose-600 transition-all duration-200"
            >
              返回投诉列表
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/complaints"
            className="text-pink-600 hover:text-pink-700 transition-colors mb-4 inline-block"
          >
            ← 返回投诉列表
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-3xl font-bold text-gray-800">投诉详情</h1>
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${STATUS_CONFIG[complaint.status as keyof typeof STATUS_CONFIG]?.color || 'bg-gray-100 text-gray-800'}`}>
              {getStatusIcon(complaint.status)}
              {STATUS_CONFIG[complaint.status as keyof typeof STATUS_CONFIG]?.label || complaint.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${PRIORITY_CONFIG[complaint.priority as keyof typeof PRIORITY_CONFIG]?.color || 'bg-gray-100 text-gray-800'}`}>
              {PRIORITY_CONFIG[complaint.priority as keyof typeof PRIORITY_CONFIG]?.label || complaint.priority}
            </span>
          </div>
          <p className="text-gray-600">
            投诉编号：{complaint.id.slice(-8)} | 创建时间：{new Date(complaint.createdAt).toLocaleString('zh-CN')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="card-pink p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">基本信息</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">投诉标题</label>
                  <p className="text-gray-900 font-medium">{complaint.title}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">投诉类型</label>
                  <p className="text-gray-900">
                    {COMPLAINT_CATEGORIES[complaint.category as keyof typeof COMPLAINT_CATEGORIES] || complaint.category}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">详细描述</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{complaint.description}</p>
                  </div>
                </div>

                {complaint.evidenceUrls && complaint.evidenceUrls.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">证据材料</label>
                    <div className="space-y-2">
                      {complaint.evidenceUrls.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                        >
                          <DocumentTextIcon className="w-4 h-4" />
                          证据文件 {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Response */}
            {(complaint.adminNotes || complaint.resolution) && (
              <div className="card-pink p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">处理结果</h2>
                <div className="space-y-4">
                  {complaint.adminNotes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">管理员备注</label>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-900 whitespace-pre-wrap">{complaint.adminNotes}</p>
                      </div>
                    </div>
                  )}

                  {complaint.resolution && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">处理结果</label>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-green-900 whitespace-pre-wrap">{complaint.resolution}</p>
                      </div>
                    </div>
                  )}

                  {complaint.resolvedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">处理时间</label>
                      <p className="text-gray-900">{new Date(complaint.resolvedAt).toLocaleString('zh-CN')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Processing History */}
            <div className="card-pink p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">处理记录</h2>
              <div className="space-y-4">
                {complaint.actions.map((action, index) => (
                  <div key={action.id} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-pink-600" />
                      </div>
                      {index < complaint.actions.length - 1 && (
                        <div className="w-px h-8 bg-gray-200 mx-auto mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {action.actor.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {ACTION_TYPE_LABELS[action.actionType as keyof typeof ACTION_TYPE_LABELS] || action.actionType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{action.description}</p>
                      {action.oldValue && action.newValue && (
                        <p className="text-xs text-gray-500">
                          {action.oldValue} → {action.newValue}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(action.createdAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participants */}
            <div className="card-pink p-6">
              <h3 className="font-bold text-gray-800 mb-4">相关人员</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">投诉人</label>
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{complaint.complainant.name}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">被投诉人</label>
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{complaint.respondent.name}</span>
                  </div>
                </div>

                {complaint.admin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">处理人</label>
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{complaint.admin.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Info */}
            <div className="card-pink p-6">
              <h3 className="font-bold text-gray-800 mb-4">关联订单</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">订单编号</label>
                  <p className="text-gray-900 font-mono text-sm">{complaint.order.id.slice(-8)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">订单状态</label>
                  <p className="text-gray-900">{complaint.order.status}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">订单金额</label>
                  <p className="text-gray-900 font-medium">¥{complaint.order.total_amount}</p>
                </div>

                <Link
                  href={`/booking/${complaint.order.id}`}
                  className="inline-block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  查看订单详情
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
