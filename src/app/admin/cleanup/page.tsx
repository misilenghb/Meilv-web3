"use client";

import { useState } from "react";

interface DuplicateGroup {
  key: string;
  count: number;
  guides: Array<{
    id: string;
    displayName: string;
    phone: string;
    createdAt: string;
    verificationStatus: string;
  }>;
}

interface DuplicateData {
  totalGuides: number;
  duplicateGroups: number;
  totalDuplicates: number;
  duplicates: DuplicateGroup[];
}

export default function CleanupPage() {
  const [duplicateData, setDuplicateData] = useState<DuplicateData | null>(null);
  const [consistencyData, setConsistencyData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<any>(null);

  const checkDuplicates = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/cleanup-duplicates", {
        method: "GET",
      });
      const data = await response.json();
      setDuplicateData(data);
    } catch (error) {
      console.error("检查重复数据失败:", error);
      alert("检查重复数据失败");
    } finally {
      setLoading(false);
    }
  };

  const checkConsistency = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/check-consistency", {
        method: "GET",
      });
      const data = await response.json();
      setConsistencyData(data);
    } catch (error) {
      console.error("检查一致性失败:", error);
      alert("检查一致性失败");
    } finally {
      setLoading(false);
    }
  };

  const cleanupDuplicates = async () => {
    if (!confirm("确定要删除重复数据吗？此操作不可撤销！")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/cleanup-duplicates", {
        method: "POST",
      });
      const result = await response.json();
      setCleanupResult(result);
      // 重新检查数据
      await checkDuplicates();
      await checkConsistency();
    } catch (error) {
      console.error("清理重复数据失败:", error);
      alert("清理重复数据失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">数据清理工具</h1>
          <p className="text-gray-600">检查和清理重复的地陪数据</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-pink-200 mb-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={checkDuplicates}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "检查中..." : "检查重复数据"}
            </button>

            <button
              onClick={checkConsistency}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? "检查中..." : "检查一致性"}
            </button>

            {duplicateData && duplicateData.totalDuplicates > 0 && (
              <button
                onClick={cleanupDuplicates}
                disabled={loading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "清理中..." : "清理重复数据"}
              </button>
            )}
          </div>

          {cleanupResult && (
            <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg">
              <h3 className="font-bold text-green-800 mb-2">清理结果</h3>
              <p className="text-green-700">
                发现重复项: {cleanupResult.duplicatesFound}，已删除: {cleanupResult.duplicatesRemoved}
              </p>
              {cleanupResult.removedIds && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-green-700">查看删除的ID</summary>
                  <pre className="mt-2 text-xs bg-green-50 p-2 rounded">
                    {JSON.stringify(cleanupResult.removedIds, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}

          {consistencyData && (
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4">一致性检查结果</h3>

              {/* 统计概览 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{consistencyData.stats.total}</div>
                  <div className="text-blue-700 text-sm">总地陪数</div>
                </div>
                <div className="bg-green-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{consistencyData.stats.verified}</div>
                  <div className="text-green-700 text-sm">已认证</div>
                </div>
                <div className="bg-orange-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">{consistencyData.stats.pending}</div>
                  <div className="text-orange-700 text-sm">待审核</div>
                </div>
                <div className="bg-purple-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{consistencyData.stats.publicVisible}</div>
                  <div className="text-purple-700 text-sm">公开显示</div>
                </div>
              </div>

              {/* 一致性状态 */}
              <div className={`p-4 rounded-lg mb-6 ${
                consistencyData.summary.isConsistent
                  ? "bg-green-100 border border-green-300"
                  : "bg-red-100 border border-red-300"
              }`}>
                <h4 className={`font-bold mb-2 ${
                  consistencyData.summary.isConsistent ? "text-green-800" : "text-red-800"
                }`}>
                  {consistencyData.summary.isConsistent ? "✅ 数据一致" : "❌ 发现不一致"}
                </h4>
                <p className={consistencyData.summary.isConsistent ? "text-green-700" : "text-red-700"}>
                  {consistencyData.summary.isConsistent
                    ? "地陪页面与管理页面数据一致"
                    : `发现 ${consistencyData.summary.totalInconsistencies} 个不一致项`}
                </p>
                <p className="text-sm mt-1">
                  预期公开显示: {consistencyData.summary.expectedPublicCount}，
                  实际公开显示: {consistencyData.summary.actualPublicCount}
                  {consistencyData.summary.publicCountMatch ? " ✅" : " ❌"}
                </p>
              </div>

              {/* 不一致详情 */}
              {consistencyData.inconsistencies.length > 0 && (
                <div>
                  <h4 className="font-bold mb-4">不一致详情</h4>
                  <div className="space-y-4">
                    {consistencyData.inconsistencies.map((inc: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold mb-2 text-red-600">
                          {inc.description} ({inc.count} 项)
                        </h5>
                        <div className="space-y-2">
                          {inc.items.slice(0, 5).map((item: any, itemIndex: number) => (
                            <div key={itemIndex} className="bg-red-50 p-2 rounded text-sm">
                              <span className="font-medium">{item.displayName || item.id}</span>
                              {item.city && <span className="text-gray-600 ml-2">({item.city})</span>}
                              {item.verificationStatus && (
                                <span className="text-gray-600 ml-2">状态: {item.verificationStatus}</span>
                              )}
                              {item.isActive !== undefined && (
                                <span className="text-gray-600 ml-2">
                                  {item.isActive ? "活跃" : "未激活"}
                                </span>
                              )}
                            </div>
                          ))}
                          {inc.items.length > 5 && (
                            <div className="text-sm text-gray-500">
                              还有 {inc.items.length - 5} 项...
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {duplicateData && (
            <div>
              <h3 className="text-lg font-bold mb-4">重复数据检查结果</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{duplicateData.totalGuides}</div>
                  <div className="text-blue-700">总地陪数</div>
                </div>
                <div className="bg-orange-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">{duplicateData.duplicateGroups}</div>
                  <div className="text-orange-700">重复组数</div>
                </div>
                <div className="bg-red-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">{duplicateData.totalDuplicates}</div>
                  <div className="text-red-700">需删除的重复项</div>
                </div>
              </div>

              {duplicateData.duplicates.length > 0 && (
                <div>
                  <h4 className="font-bold mb-4">重复数据详情</h4>
                  <div className="space-y-4">
                    {duplicateData.duplicates.map((group, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold mb-2">
                          重复组 {index + 1} (共 {group.count} 项)
                        </h5>
                        <div className="grid gap-2">
                          {group.guides.map((guide, guideIndex) => (
                            <div
                              key={guide.id}
                              className={`p-3 rounded ${
                                guideIndex === 0 
                                  ? "bg-green-50 border border-green-200" 
                                  : "bg-red-50 border border-red-200"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="font-medium">{guide.displayName}</span>
                                  <span className="text-sm text-gray-600 ml-2">({guide.phone})</span>
                                  <span className="text-sm text-gray-600 ml-2">{guide.verificationStatus}</span>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new Date(guide.createdAt).toLocaleString()}
                                  {guideIndex === 0 && (
                                    <span className="ml-2 text-green-600 font-medium">保留</span>
                                  )}
                                  {guideIndex > 0 && (
                                    <span className="ml-2 text-red-600 font-medium">删除</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
