"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type GuideWithUser = {
  id: string;
  displayName: string;
  city: string;
  certificationStatus: "unverified" | "pending" | "verified" | "rejected";
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
};

function AdminGuidesContent() {
  const [guides, setGuides] = useState<GuideWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, rejected: 0 });

  useEffect(() => {
    fetchGuides();
  }, []);

  async function fetchGuides() {
    try {
      const res = await fetch("/api/admin/guides");
      const data = await res.json();
      setGuides(data.items || []);
      
      // Calculate stats
      const total = data.items?.length || 0;
      const pending = data.items?.filter((g: GuideWithUser) => g.certificationStatus === "pending").length || 0;
      const verified = data.items?.filter((g: GuideWithUser) => g.certificationStatus === "verified").length || 0;
      const rejected = data.items?.filter((g: GuideWithUser) => g.certificationStatus === "rejected").length || 0;
      setStats({ total, pending, verified, rejected });
    } catch (error) {
      console.error("Failed to fetch guides:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(guideId: string, status: "verified" | "rejected") {
    try {
      const res = await fetch(`/api/admin/guides/${guideId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificationStatus: status }),
      });
      
      if (res.ok) {
        await fetchGuides(); // Refresh data
      } else {
        alert("操作失败");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("操作失败");
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "text-green-400";
      case "pending": return "text-yellow-400";
      case "rejected": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "verified": return "已认证";
      case "pending": return "待审核";
      case "rejected": return "已拒绝";
      case "unverified": return "未认证";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">地陪认证管理</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/applications"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            📝 申请审核
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 text-xl">ℹ️</div>
          <div>
            <h3 className="font-medium text-blue-900 mb-1">功能说明</h3>
            <p className="text-blue-700 text-sm">
              此页面用于管理已注册地陪的认证状态。如需审核新的地陪申请，请前往
              <Link href="/admin/applications" className="underline font-medium hover:text-blue-900">
                申请审核页面
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card">
          <div className="text-sm opacity-80">总数</div>
          <div className="text-xl font-semibold">{stats.total}</div>
        </div>
        <div className="glass-card">
          <div className="text-sm opacity-80">待审核</div>
          <div className="text-xl font-semibold text-yellow-400">{stats.pending}</div>
        </div>
        <div className="glass-card">
          <div className="text-sm opacity-80">已认证</div>
          <div className="text-xl font-semibold text-green-400">{stats.verified}</div>
        </div>
        <div className="glass-card">
          <div className="text-sm opacity-80">已拒绝</div>
          <div className="text-xl font-semibold text-red-400">{stats.rejected}</div>
        </div>
      </div>

      {/* Guides List */}
      <div className="glass-card">
        <div className="font-medium mb-4">地陪列表</div>
        {loading ? (
          <div className="text-sm opacity-70">加载中...</div>
        ) : guides.length === 0 ? (
          <div className="text-sm opacity-70">暂无地陪数据</div>
        ) : (
          <div className="space-y-3">
            {guides.map((guide) => (
              <div key={guide.id} className="glass rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{guide.displayName}</div>
                    <div className="text-sm opacity-80">
                      城市：{guide.city} · 评分：{guide.ratingAvg}（{guide.ratingCount}）
                    </div>
                    <div className="text-xs opacity-60">
                      注册时间：{new Date(guide.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${getStatusColor(guide.certificationStatus)}`}>
                      {getStatusText(guide.certificationStatus)}
                    </span>
                    {guide.certificationStatus === "pending" && (
                      <div className="flex gap-2">
                        <button
                          className="bg-green-600 hover:bg-green-700 text-white rounded px-3 py-1 text-xs"
                          onClick={() => updateStatus(guide.id, "verified")}
                        >
                          通过
                        </button>
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white rounded px-3 py-1 text-xs"
                          onClick={() => updateStatus(guide.id, "rejected")}
                        >
                          拒绝
                        </button>
                      </div>
                    )}
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

export default function AdminGuidesPage() {
  return <AdminGuidesContent />;
}
