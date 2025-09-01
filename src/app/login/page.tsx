"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard, GlassButton, GlassField, GlassInput, GlassSelect } from "@/components/ui";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "登录失败");
      } else {
        alert("登录成功");
        // 通知其他组件状态已更新
        if (typeof window !== 'undefined') {
          localStorage.setItem('ml_session_changed', Date.now().toString());
          localStorage.removeItem('ml_session_changed');
        }
        // 强制刷新页面以更新所有状态
        window.location.href = "/";
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold text-center">登录</h1>
        <GlassCard>
        <div className="space-y-4">
          <GlassField label="手机号" required>
            <GlassInput
              type="tel"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </GlassField>

          <GlassField label="密码" required>
            <GlassInput
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </GlassField>

          <GlassField label="角色" required>
            <GlassSelect value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">用户</option>
              <option value="guide">地陪</option>
              <option value="admin">管理员</option>
            </GlassSelect>
          </GlassField>

          <GlassButton
            variant="primary"
            onClick={submit}
            loading={loading}
            disabled={!phone.trim() || !password.trim()}
            className="w-full"
          >
            登录
          </GlassButton>

          <div className="text-center">
            <span className="text-gray-500 text-sm">还没有账号？</span>
            <Link href="/register" className="text-pink-600 hover:text-pink-700 text-sm ml-1">
              立即注册
            </Link>
          </div>
        </div>
        </GlassCard>
      </div>
    </div>
  );
}

