"use client";

import { useState, useEffect } from "react";

export type Session = {
  userId: string;
  phone: string;
  name?: string;
  role: "user" | "guide" | "admin";
  intendedRole?: "user" | "guide" | "admin";
} | null;

/**
 * 客户端认证 Hook
 * 用于在客户端组件中获取用户会话信息
 */
export function useSession() {
  const [session, setSession] = useState<Session>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();

    // 监听存储变化，当其他标签页登录/登出时同步状态
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
      if (response.ok) {
        const data = await response.json();
        setSession(data.session);
      } else {
        setSession(null);
      }
    } catch (error) {
      console.error("Failed to check session:", error);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = () => {
    setLoading(true);
    checkSession();
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setSession(null);
      // 通知其他标签页状态变化
      localStorage.setItem('ml_session_changed', Date.now().toString());
      localStorage.removeItem('ml_session_changed');
      // 可选：重定向到首页
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return {
    session,
    loading,
    refreshSession,
    logout
  };
}

/**
 * 检查用户是否有特定角色
 */
export function hasRole(session: Session, role: string): boolean {
  return session?.role === role;
}

/**
 * 检查用户是否是管理员
 */
export function isAdmin(session: Session): boolean {
  return hasRole(session, "admin");
}

/**
 * 检查用户是否是地陪
 */
export function isGuide(session: Session): boolean {
  return hasRole(session, "guide");
}

/**
 * 检查用户是否已登录
 */
export function isAuthenticated(session: Session): boolean {
  return session !== null;
}
