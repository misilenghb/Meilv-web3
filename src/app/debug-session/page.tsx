"use client";

import { useState, useEffect } from "react";

export default function DebugSessionPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session");
      const data = await response.json();
      setSessionInfo({
        status: response.status,
        data: data,
        cookies: document.cookie
      });
    } catch (error) {
      setSessionInfo({
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  const testOrdersAPI = async () => {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();
      alert(`Orders API Status: ${response.status}\nData: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      alert(`Orders API Error: ${error}`);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Session Debug</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="text-lg font-semibold mb-2">Session Info:</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(sessionInfo, null, 2)}
        </pre>
      </div>

      <div className="space-y-4">
        <button
          onClick={checkSession}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh Session
        </button>
        
        <button
          onClick={testOrdersAPI}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-4"
        >
          Test Orders API
        </button>

        <div className="mt-4">
          <a href="/login" className="text-blue-600 hover:underline">
            Go to Login
          </a>
        </div>
      </div>
    </div>
  );
}
