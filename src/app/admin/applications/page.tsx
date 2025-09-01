"use client";

import { useState, useEffect } from "react";
import { ModernIcons } from "@/components/icons/ModernIcons";
import Link from "next/link";

interface GuideApplication {
  id: string;
  displayName: string;
  realName: string;
  city: string;
  hourlyRate: number;
  status: "pending" | "under_review" | "approved" | "rejected" | "need_more_info";
  submittedAt: string;
  reviewedAt?: string;
  reviewerName?: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<GuideApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/admin/applications");
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
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

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === "all" || app.status === filter;
    const matchesSearch = app.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.realName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.city.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(app => app.status === "pending").length,
    under_review: applications.filter(app => app.status === "under_review").length,
    approved: applications.filter(app => app.status === "approved").length,
    rejected: applications.filter(app => app.status === "rejected").length,
    need_more_info: applications.filter(app => app.status === "need_more_info").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ModernIcons.Loading size={32} className="text-pink-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">地陪申请审核</h1>
              <p className="text-gray-600">审核新提交的地陪申请材料</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/guides"
                className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
              >
                👥 认证管理
              </Link>
              <Link
                href="/admin"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                返回管理台
              </Link>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-green-600 text-xl">📝</div>
              <div>
                <h3 className="font-medium text-green-900 mb-1">功能说明</h3>
                <p className="text-green-700 text-sm">
                  此页面用于审核用户提交的地陪申请。申请通过后，系统会自动创建地陪档案。
                  如需管理已注册地陪的认证状态，请前往
                  <Link href="/admin/guides" className="underline font-medium hover:text-green-900">
                    认证管理页面
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
            <div className="text-sm text-gray-600">总申请</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
            <div className="text-sm text-gray-600">待审核</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.under_review}</div>
            <div className="text-sm text-gray-600">审核中</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{statusCounts.approved}</div>
            <div className="text-sm text-gray-600">已通过</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
            <div className="text-sm text-gray-600">已拒绝</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-orange-600">{statusCounts.need_more_info}</div>
            <div className="text-sm text-gray-600">需补充</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">状态筛选</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">全部状态</option>
                <option value="pending">待审核</option>
                <option value="under_review">审核中</option>
                <option value="approved">已通过</option>
                <option value="rejected">已拒绝</option>
                <option value="need_more_info">需补充材料</option>
              </select>
            </div>

            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">搜索</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索姓名或城市..."
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <ModernIcons.Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    申请人
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    城市
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    费率
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    提交时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {application.displayName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.realName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {application.city}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{application.hourlyRate}/小时
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                        {getStatusText(application.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(application.submittedAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/applications/${application.id}`}
                        className="text-pink-600 hover:text-pink-900 mr-4"
                      >
                        查看详情
                      </Link>
                      {application.status === "pending" && (
                        <Link
                          href={`/admin/applications/${application.id}/review`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          开始审核
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <ModernIcons.Search size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到申请</h3>
              <p className="text-gray-500">
                {searchTerm ? "尝试调整搜索条件" : "暂无申请记录"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
