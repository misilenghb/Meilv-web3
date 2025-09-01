"use client";

import { useState } from "react";

export default function TestPaginationPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testPagination = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/guides?page=${page}&limit=6`);
      const data = await response.json();
      
      setResults(prev => [...prev, {
        page,
        data,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      console.error("Test failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">分页功能测试</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => testPagination(1)}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              测试第1页
            </button>
            <button
              onClick={() => testPagination(2)}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              测试第2页
            </button>
            <button
              onClick={() => testPagination(3)}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              测试第3页
            </button>
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              清空结果
            </button>
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-600 mt-2">测试中...</p>
            </div>
          )}

          <div className="space-y-6">
            {results.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold mb-2">
                  第 {result.page} 页 - {result.timestamp}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-100 p-3 rounded">
                    <div className="text-lg font-bold text-blue-600">
                      {result.data.items?.length || 0}
                    </div>
                    <div className="text-blue-700 text-sm">当前页项目数</div>
                  </div>
                  <div className="bg-green-100 p-3 rounded">
                    <div className="text-lg font-bold text-green-600">
                      {result.data.pagination?.total || 0}
                    </div>
                    <div className="text-green-700 text-sm">总项目数</div>
                  </div>
                  <div className="bg-purple-100 p-3 rounded">
                    <div className="text-lg font-bold text-purple-600">
                      {result.data.pagination?.page || 0}
                    </div>
                    <div className="text-purple-700 text-sm">当前页码</div>
                  </div>
                  <div className="bg-orange-100 p-3 rounded">
                    <div className="text-lg font-bold text-orange-600">
                      {result.data.pagination?.totalPages || 0}
                    </div>
                    <div className="text-orange-700 text-sm">总页数</div>
                  </div>
                </div>

                {result.data.items && result.data.items.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">地陪列表:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {result.data.items.map((guide: any, guideIndex: number) => (
                        <div key={guide.id} className="bg-gray-50 p-3 rounded text-sm">
                          <div className="font-medium">{guide.displayName}</div>
                          <div className="text-gray-600">{guide.city}</div>
                          <div className="text-gray-500 text-xs">ID: {guide.id.slice(0, 8)}...</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-600">查看完整响应</summary>
                  <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
