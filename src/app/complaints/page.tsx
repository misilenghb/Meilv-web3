"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExclamationTriangleIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

interface Complaint {
  id: string;
  complainantId: string;
  respondentId: string;
  orderId: string;
  category: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  complainant: { id: string; name: string; phone: string };
  respondent: { id: string; name: string; phone: string };
  admin?: { id: string; name: string };
  order: { id: string; requirement: any; status: string; total_amount: number };
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

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [role, setRole] = useState<string>("all"); // 'all' | 'complainant' | 'respondent'

  useEffect(() => {
    fetchComplaints();
  }, [filter, role]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") {
        params.append("status", filter);
      }
      if (role !== "all") {
        params.append("role", role);
      }

      const response = await fetch(`/api/complaints?${params}`);
      if (response.ok) {
        const data = await response.json();
        setComplaints(data.items || []);
      } else if (response.status === 401) {
        window.location.href = "/login?redirect=/complaints";
        return;
      } else {
        console.error("Failed to fetch complaints");
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
    const IconComponent = config?.icon || ClockIcon;
    return <IconComponent className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">我的投诉</h1>
          <p className="text-gray-600">
            管理您的投诉记录，跟踪处理进度
          </p>
        </div>

        {/* Filters */}
        <div className="card-pink p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                状态筛选
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">全部状态</option>
                <option value="pending">待处理</option>
                <option value="investigating">调查中</option>
                <option value="resolved">已解决</option>
                <option value="rejected">已驳回</option>
                <option value="closed">已关闭</option>
              </select>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                角色筛选
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">全部投诉</option>
                <option value="complainant">我发起的投诉</option>
                <option value="respondent">针对我的投诉</option>
              </select>
            </div>
          </div>
        </div>

        {/* Complaints List */}
        {complaints.length === 0 ? (
          <div className="card-pink p-12 text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">暂无投诉记录</h2>
            <p className="text-gray-600 mb-6">
              {filter === "all" && role === "all" 
                ? "您还没有任何投诉记录" 
                : "当前筛选条件下没有投诉记录"}
            </p>
            <Link
              href="/my-bookings"
              className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-2xl font-medium hover:from-pink-600 hover:to-rose-600 transition-all duration-200"
            >
              查看我的订单
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="card-pink p-6 hover:shadow-lg transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        {complaint.title}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[complaint.status as keyof typeof STATUS_CONFIG]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {getStatusIcon(complaint.status)}
                        {STATUS_CONFIG[complaint.status as keyof typeof STATUS_CONFIG]?.label || complaint.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_CONFIG[complaint.priority as keyof typeof PRIORITY_CONFIG]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {PRIORITY_CONFIG[complaint.priority as keyof typeof PRIORITY_CONFIG]?.label || complaint.priority}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">类型：</span>
                        {COMPLAINT_CATEGORIES[complaint.category as keyof typeof COMPLAINT_CATEGORIES] || complaint.category}
                      </div>
                      <div>
                        <span className="font-medium">订单：</span>
                        {complaint.orderId.slice(-8)}
                      </div>
                      <div>
                        <span className="font-medium">创建时间：</span>
                        {new Date(complaint.createdAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                      {complaint.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>投诉人：{complaint.complainant.name}</span>
                      <span>被投诉人：{complaint.respondent.name}</span>
                      {complaint.admin && (
                        <span>处理人：{complaint.admin.name}</span>
                      )}
                    </div>
                  </div>

                  <div className="ml-4">
                    <Link
                      href={`/complaints/${complaint.id}`}
                      className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-lg font-medium hover:from-pink-600 hover:to-rose-600 transition-all duration-200"
                    >
                      查看详情
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
