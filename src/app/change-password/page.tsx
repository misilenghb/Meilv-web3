"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ModernIcons } from "@/components/icons/ModernIcons";
import Link from "next/link";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      alert("请填写完整信息");
      return;
    }

    if (newPassword.length < 6) {
      alert("新密码长度至少6位");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("两次输入的新密码不一致");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          currentPassword, 
          newPassword, 
          confirmPassword 
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        alert(data.error || "密码修改失败");
        return;
      }

      alert("密码修改成功！");
      router.push("/profile");
    } catch (error) {
      alert("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-white py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ModernIcons.Lock size={40} className="text-pink-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent">
              修改密码
            </h1>
          </div>
          <p className="text-gray-600">
            为了您的账户安全，请定期更换密码
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 返回按钮 */}
            <div className="flex items-center gap-2 mb-6">
              <Link
                href="/profile"
                className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                <ModernIcons.ArrowLeft size={20} />
                返回个人资料
              </Link>
            </div>

            {/* 当前密码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                当前密码 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="请输入当前密码"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? (
                    <ModernIcons.EyeOff size={20} />
                  ) : (
                    <ModernIcons.Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* 新密码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新密码 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="请输入新密码（至少6位）"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? (
                    <ModernIcons.EyeOff size={20} />
                  ) : (
                    <ModernIcons.Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* 确认新密码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                确认新密码 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入新密码"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? (
                    <ModernIcons.EyeOff size={20} />
                  ) : (
                    <ModernIcons.Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* 密码强度提示 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <ModernIcons.Info size={20} className="text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">密码安全建议</h4>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• 密码长度至少6位</li>
                    <li>• 建议包含字母、数字和特殊字符</li>
                    <li>• 不要使用过于简单的密码</li>
                    <li>• 定期更换密码</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading || !currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()}
              className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "修改中..." : "修改密码"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
