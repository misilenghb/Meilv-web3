"use client";

import { useState, useEffect } from "react";

export default function DebugGuidesPage() {
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGuides = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("开始获取地陪数据...");
      const response = await fetch("/api/guides");
      console.log("API响应状态:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("API响应数据:", data);
      setApiResponse(data);
    } catch (err) {
      console.error("获取地陪数据失败:", err);
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">地陪API调试页面</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <button
              onClick={fetchGuides}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "加载中..." : "重新获取数据"}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>错误:</strong> {error}
            </div>
          )}

          {apiResponse && (
            <div>
              <h2 className="text-xl font-bold mb-4">API响应概览</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-100 p-4 rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {apiResponse.items?.length || 0}
                  </div>
                  <div className="text-blue-700">当前页地陪数</div>
                </div>
                <div className="bg-green-100 p-4 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {apiResponse.pagination?.total || 0}
                  </div>
                  <div className="text-green-700">总地陪数</div>
                </div>
                <div className="bg-purple-100 p-4 rounded">
                  <div className="text-2xl font-bold text-purple-600">
                    {apiResponse.pagination?.page || 0}
                  </div>
                  <div className="text-purple-700">当前页</div>
                </div>
                <div className="bg-orange-100 p-4 rounded">
                  <div className="text-2xl font-bold text-orange-600">
                    {apiResponse.pagination?.totalPages || 0}
                  </div>
                  <div className="text-orange-700">总页数</div>
                </div>
              </div>

              <h3 className="text-lg font-bold mb-4">地陪列表</h3>
              {apiResponse.items && apiResponse.items.length > 0 ? (
                <div className="space-y-4">
                  {apiResponse.items.map((guide: any, index: number) => (
                    <div key={guide.id} className="border border-gray-200 rounded p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-lg">{guide.displayName}</h4>
                          <p className="text-gray-600 text-sm mb-2">{guide.bio}</p>
                          <div className="flex gap-4 text-sm text-gray-500">
                            <span>城市: {guide.city}</span>
                            <span>价格: ¥{guide.hourlyRate}/小时</span>
                            <span>评分: {guide.ratingAvg} ({guide.ratingCount}评价)</span>
                            <span>状态: {guide.certificationStatus}</span>
                          </div>
                          <div className="mt-2">
                            <span className="text-xs text-gray-400">ID: {guide.id}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">#{index + 1}</div>
                          {guide.photos && guide.photos.length > 0 && (
                            <img 
                              src={guide.photos[0]} 
                              alt={guide.displayName}
                              className="w-16 h-16 rounded-full object-cover mt-2"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  没有找到地陪数据
                </div>
              )}

              <details className="mt-6">
                <summary className="cursor-pointer font-bold">查看完整API响应</summary>
                <pre className="mt-4 bg-gray-100 p-4 rounded text-xs overflow-auto">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
