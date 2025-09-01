"use client";

import { useState } from "react";

export default function MigratePage() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const runMigration = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/migrate-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`错误: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">数据库迁移</h1>
      
      <button
        onClick={runMigration}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "执行中..." : "执行订单表迁移"}
      </button>

      {result && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">结果:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
