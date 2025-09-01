"use client";

import { useState } from "react";
import AdminGuard from "../guard";

export default function FixDbPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFixDatabase = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/fix-order-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Fix database error:', error);
      setResult({
        error: '修复数据库失败',
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              修复数据库
            </h1>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                此操作将修复订单状态约束，添加退款相关字段和索引。
              </p>
              
              <button
                onClick={handleFixDatabase}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {isLoading ? '修复中...' : '修复数据库'}
              </button>
            </div>

            {result && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-4">执行结果</h2>
                
                {result.error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-red-800 font-medium">错误</h3>
                    <p className="text-red-700 mt-1">{result.error}</p>
                    {result.details && (
                      <p className="text-red-600 text-sm mt-2">{result.details}</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-blue-800 font-medium">{result.message}</h3>

                    {result.instructions && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-yellow-800 text-sm">{result.instructions}</p>
                      </div>
                    )}

                    {result.migrationSQL && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">需要执行的SQL:</h4>
                        <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                          {result.migrationSQL}
                        </pre>
                        <button
                          onClick={() => navigator.clipboard.writeText(result.migrationSQL)}
                          className="mt-2 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                        >
                          复制SQL
                        </button>
                      </div>
                    )}

                    {result.results && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">字段检查结果:</h4>
                        <div className="space-y-2">
                          {result.results.map((step: any, index: number) => (
                            <div
                              key={index}
                              className={`flex items-center text-sm ${
                                step.success ? 'text-green-700' : 'text-red-700'
                              }`}
                            >
                              <span className={`w-4 h-4 rounded-full mr-2 ${
                                step.success ? 'bg-green-500' : 'bg-red-500'
                              }`}></span>
                              <span className="flex-1">{step.step}</span>
                              {step.error && (
                                <span className="text-xs text-red-600 ml-2">
                                  {step.error}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
