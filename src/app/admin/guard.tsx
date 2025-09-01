"use client";

import { useEffect, useState } from "react";
import { Session } from "@/lib/session";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();

    // 监听登录状态变化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ml_session_changed') {
        checkSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session");
      const data = await response.json();
      setSession(data.session);
    } catch (error) {
      console.error("Failed to check session:", error);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!session || session.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card text-center p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">访问受限</h2>
          <p className="text-gray-600 mb-4">您需要管理员权限才能访问此页面</p>
          <a href="/login" className="text-pink-600 hover:text-pink-700 font-medium">
            请登录管理员账号
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

