"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ModernIcons } from "@/components/icons/ModernIcons";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState<"user" | "guide">("user");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone.trim() || !name.trim() || !password.trim() || !confirmPassword.trim()) {
      alert("请填写完整信息");
      return;
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      alert("请输入正确的手机号码");
      return;
    }

    // 验证密码
    if (password.length < 6) {
      alert("密码长度至少6位");
      return;
    }

    if (password !== confirmPassword) {
      alert("两次输入的密码不一致");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          name,
          password,
          role: userType,
          intendedRole: userType // 记录用户注册时的意向角色
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        alert(data.error || "注册失败");
        return;
      }

      alert("注册成功！");
      
      // 根据用户类型跳转到不同页面
      if (userType === "guide") {
        router.push("/apply-guide");
      } else {
        router.push("/");
      }
    } catch (error) {
      alert("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-white py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ModernIcons.Brand size={40} className="text-pink-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent">
              美旅注册
            </h1>
          </div>
          <p className="text-gray-600">
            {step === 1 ? "选择您的身份类型" : "完善基本信息"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {step === 1 ? (
            // Step 1: 选择用户类型
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
                您希望以什么身份使用美旅？
              </h2>
              
              <div className="space-y-4">
                {/* 普通用户选项 */}
                <div
                  onClick={() => setUserType("user")}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    userType === "user"
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 hover:border-pink-300 hover:bg-pink-25"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      userType === "user" ? "border-pink-500 bg-pink-500" : "border-gray-300"
                    }`}>
                      {userType === "user" && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <ModernIcons.User size={24} className="text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-800">我是用户</h3>
                      </div>
                      <p className="text-gray-600 text-sm">
                        我想寻找专业的地陪服务，享受高质量的陪伴体验
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">找地陪</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">预约服务</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">享受陪伴</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 地陪选项 */}
                <div
                  onClick={() => setUserType("guide")}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    userType === "guide"
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 hover:border-pink-300 hover:bg-pink-25"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      userType === "guide" ? "border-pink-500 bg-pink-500" : "border-gray-300"
                    }`}>
                      {userType === "guide" && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <ModernIcons.Heart size={24} className="text-pink-600" />
                        <h3 className="text-lg font-semibold text-gray-800">我要成为地陪</h3>
                      </div>
                      <p className="text-gray-600 text-sm">
                        我想提供专业的陪伴服务，帮助他人获得美好体验
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded">提供服务</span>
                        <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded">获得收入</span>
                        <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded">帮助他人</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
              >
                下一步
              </button>

              <div className="text-center">
                <span className="text-gray-500 text-sm">已有账号？</span>
                <Link href="/login" className="text-pink-600 hover:text-pink-700 text-sm ml-1">
                  立即登录
                </Link>
              </div>
            </div>
          ) : (
            // Step 2: 填写基本信息
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <ModernIcons.ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-semibold text-gray-800">
                  完善{userType === "guide" ? "地陪" : "用户"}信息
                </h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  手机号码 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入11位手机号码"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入您的真实姓名"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码（至少6位）"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  确认密码 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入密码"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>

              {userType === "guide" && (
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <ModernIcons.Info size={20} className="text-pink-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-pink-800">地陪注册说明</h4>
                      <p className="text-sm text-pink-700 mt-1">
                        注册完成后，您需要提交详细的申请材料进行审核。审核通过后即可开始提供地陪服务。
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !phone.trim() || !name.trim() || !password.trim() || !confirmPassword.trim()}
                className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? "注册中..." : `注册${userType === "guide" ? "并申请成为地陪" : ""}`}
              </button>

              <div className="text-center">
                <span className="text-gray-500 text-sm">已有账号？</span>
                <Link href="/login" className="text-pink-600 hover:text-pink-700 text-sm ml-1">
                  立即登录
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
