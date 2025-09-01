"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ModernIcons } from "@/components/icons/ModernIcons";
import Link from "next/link";

interface GuideApplicationForm {
  // 个人信息
  displayName: string;
  realName: string;
  idNumber: string;
  phone: string;
  email: string;
  gender: "male" | "female" | "other";
  age: number;
  city: string;
  address: string;
  
  // 服务信息
  bio: string;
  skills: string[];
  hourlyRate: number;
  availableServices: string[];
  languages: string[];
  
  // 认证材料
  idCardFront: string;
  idCardBack: string;
  healthCertificate: string;
  backgroundCheck: string;
  photos: string[];
  
  // 其他信息
  experience: string;
  motivation: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export default function ApplyGuidePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [applicationData, setApplicationData] = useState<any>(null);
  const [formData, setFormData] = useState<GuideApplicationForm>({
    displayName: "",
    realName: "",
    idNumber: "",
    phone: "",
    email: "",
    gender: "female",
    age: 20,
    city: "",
    address: "",
    bio: "",
    skills: [],
    hourlyRate: 198,
    availableServices: [],
    languages: ["中文"],
    idCardFront: "",
    idCardBack: "",
    healthCertificate: "",
    backgroundCheck: "",
    photos: [],
    experience: "",
    motivation: "",
    emergencyContact: {
      name: "",
      phone: "",
      relationship: ""
    }
  });

  useEffect(() => {
    checkAuthorization();

    // 监听登录状态变化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ml_session_changed') {
        checkAuthorization();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const checkAuthorization = async () => {
    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const data = await response.json();
        if (data.session) {
          // 检查用户是否有地陪申请权限
          if (data.session.intendedRole === "guide" || data.session.role === "guide") {
            setAuthorized(true);
            setUserInfo(data.session);
            // 预填用户信息
            if (data.session.phone) {
              setFormData(prev => ({ ...prev, phone: data.session.phone }));
            }

            // 检查是否已有申请
            await checkExistingApplication();
          } else {
            setAuthorized(false);
          }
        } else {
          // 未登录，跳转到注册页面
          router.push("/register");
          return;
        }
      } else {
        router.push("/register");
        return;
      }
    } catch (error) {
      console.error("Authorization check failed:", error);
      router.push("/register");
      return;
    } finally {
      setLoading(false);
    }
  };

  const checkExistingApplication = async () => {
    try {
      const response = await fetch("/api/guide/verification-status");
      if (response.ok) {
        const data = await response.json();
        if (data.status && data.status.applicationId) {
          setExistingApplication(data.status);

          // 如果申请被拒绝或需要更多信息，检查是否是编辑模式
          if (["rejected", "need_more_info"].includes(data.status.status)) {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('edit') === 'true') {
              await loadApplicationForEdit();
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to check existing application:", error);
    }
  };

  const loadApplicationForEdit = async () => {
    try {
      const response = await fetch("/api/guide/application");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.application.canEdit) {
          setIsEditMode(true);
          setApplicationData(data.application);
          setFormData(data.application.formData);
        }
      }
    } catch (error) {
      console.error("Failed to load application for edit:", error);
    }
  };

  const steps = [
    { id: 1, title: "个人信息", description: "基本个人资料" },
    { id: 2, title: "服务信息", description: "服务技能和定价" },
    { id: 3, title: "认证材料", description: "身份和资质证明" },
    { id: 4, title: "补充信息", description: "经验和动机说明" },
    { id: 5, title: "确认提交", description: "检查并提交申请" }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, value: string) => {
    const array = value.split(",").map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [field]: array }));
  };

  const handleFileUpload = async (field: string, file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert("文件大小不能超过10MB");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image');
      formData.append('category', field.includes('idCard') ? 'id-cards' : 'certificates');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setFormData(prev => ({ ...prev, [field]: result.url }));
      } else {
        alert(`上传失败：${result.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('上传失败，请重试');
    }
  };

  const handlePhotosUpload = async (files: FileList) => {
    const newPhotos: string[] = [];
    const maxFiles = Math.min(files.length, 5 - formData.photos.length);

    for (let i = 0; i < maxFiles; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        alert(`图片 ${file.name} 大小超过10MB，已跳过`);
        continue;
      }

      try {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('type', 'image');
        uploadFormData.append('category', 'photos');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData
        });

        const result = await response.json();

        if (response.ok && result.success) {
          newPhotos.push(result.url);
        } else {
          alert(`图片 ${file.name} 上传失败：${result.error || '未知错误'}`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert(`图片 ${file.name} 上传失败，请重试`);
      }
    }

    if (newPhotos.length > 0) {
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos].slice(0, 5)
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.displayName && formData.realName && formData.idNumber && 
                 formData.phone && formData.city && formData.address);
      case 2:
        return !!(formData.bio && formData.skills.length > 0 && formData.hourlyRate > 0);
      case 3:
        return !!(formData.idCardFront && formData.idCardBack && formData.photos.length > 0);
      case 4:
        return !!(formData.experience && formData.motivation && 
                 formData.emergencyContact.name && formData.emergencyContact.phone);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    } else {
      alert("请填写完整当前步骤的必填信息");
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      alert("请填写完整所有必填信息");
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = isEditMode ? "/api/guide/reapply" : "/api/guide/apply";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const message = isEditMode ?
          "申请重新提交成功！我们将在3-5个工作日内完成审核。" :
          "申请提交成功！我们将在3-5个工作日内完成审核。";
        alert(message);
        router.push("/");
      } else {
        const error = await response.json();
        alert(`申请失败：${error.error || error.message || "未知错误"}`);
      }
    } catch (error) {
      alert("网络错误，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  // 加载中
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-white flex items-center justify-center">
        <div className="text-center">
          <ModernIcons.Loading size={48} className="text-pink-600 mx-auto mb-4" />
          <p className="text-gray-600">正在验证权限...</p>
        </div>
      </div>
    );
  }

  // 权限不足
  if (!authorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-white py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <ModernIcons.Warning size={64} className="text-orange-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">无法申请成为地陪</h1>
            <p className="text-gray-600 mb-6">
              只有在注册时选择"成为地陪"的用户才能申请地陪服务。
            </p>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                如果您想成为地陪，请：
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>退出当前账号</li>
                  <li>重新注册并选择"我要成为地陪"</li>
                  <li>完成地陪申请流程</li>
                </ol>
              </div>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/"
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  返回首页
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  重新注册
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 已有申请
  if (existingApplication && existingApplication.status !== "rejected" && existingApplication.status !== "need_more_info") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-white py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <ModernIcons.Info size={64} className="text-blue-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">您已提交过申请</h1>
            <p className="text-gray-600 mb-6">
              您的地陪认证申请正在处理中，请耐心等待审核结果。
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">申请状态：</span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  existingApplication.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                  existingApplication.status === "verified" ? "bg-green-100 text-green-800" :
                  "bg-blue-100 text-blue-800"
                }`}>
                  {existingApplication.status === "pending" ? "待审核" :
                   existingApplication.status === "verified" ? "已认证" : "审核中"}
                </span>
              </div>
              {existingApplication.submittedAt && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">提交时间：</span>
                  <span className="text-sm text-gray-800">
                    {new Date(existingApplication.submittedAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-4 justify-center">
              <Link
                href="/guide-dashboard"
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                返回工作台
              </Link>
              {existingApplication.applicationId && (
                <Link
                  href={`/guide-dashboard/verification/${existingApplication.applicationId}`}
                  className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  查看详情
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent mb-4">
            {isEditMode ? "修改地陪申请" : "申请成为地陪"}
          </h1>
          <p className="text-gray-600 text-lg">
            {isEditMode ? "根据审核意见修改您的申请资料" : "加入我们的专业地陪团队，开启您的陪伴服务之旅"}
          </p>
          {isEditMode && applicationData?.reviewNotes && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg text-left max-w-2xl mx-auto">
              <h3 className="font-medium text-orange-800 mb-2">审核意见：</h3>
              <p className="text-orange-700 text-sm">{applicationData.reviewNotes}</p>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.id 
                      ? 'bg-pink-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  <div className="ml-3 hidden md:block">
                    <div className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-pink-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-pink-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">个人基本信息</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    显示昵称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={(e) => handleInputChange("displayName", e.target.value)}
                    placeholder="用户看到的昵称"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    真实姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.realName}
                    onChange={(e) => handleInputChange("realName", e.target.value)}
                    placeholder="身份证上的姓名"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    身份证号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.idNumber}
                    onChange={(e) => handleInputChange("idNumber", e.target.value)}
                    placeholder="18位身份证号码"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    手机号码 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="11位手机号码"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    邮箱地址
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="联系邮箱"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    性别 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="female">女</option>
                    <option value="male">男</option>
                    <option value="other">其他</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    年龄 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="60"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    所在城市 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="如：北京、上海、杭州"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  详细地址 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="详细居住地址"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Step 2: Service Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">服务信息设置</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  个人简介 <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="请介绍您的个人背景、特长和服务理念..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  专业技能 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.skills.join(", ")}
                  onChange={(e) => handleArrayChange("skills", e.target.value)}
                  placeholder="如：景点讲解, 拍照指导, 美食推荐, 购物陪伴（用逗号分隔）"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  小时费率 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="50"
                    max="1000"
                    value={formData.hourlyRate}
                    onChange={(e) => handleInputChange("hourlyRate", parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <span className="absolute right-3 top-3 text-gray-500">元/小时</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">建议范围：50-1000元/小时</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  可提供服务
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    "日常陪伴", "购物陪伴", "用餐陪伴", "景点游览",
                    "文化体验", "学习陪伴", "运动陪伴", "娱乐陪伴",
                    "商务陪伴", "机场接送", "翻译服务", "摄影服务"
                  ].map((service) => (
                    <label key={service} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.availableServices.includes(service)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              availableServices: [...prev.availableServices, service]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              availableServices: prev.availableServices.filter(s => s !== service)
                            }));
                          }
                        }}
                        className="mr-2 text-pink-600 focus:ring-pink-500"
                      />
                      <span className="text-sm">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  语言能力
                </label>
                <input
                  type="text"
                  value={formData.languages.join(", ")}
                  onChange={(e) => handleArrayChange("languages", e.target.value)}
                  placeholder="如：中文, 英语, 日语（用逗号分隔）"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Step 3: Certification Materials */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">认证材料上传</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    身份证正面 <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {formData.idCardFront ? (
                      <div>
                        <img src={formData.idCardFront} alt="身份证正面" className="max-h-32 mx-auto mb-2" />
                        <button
                          onClick={() => handleInputChange("idCardFront", "")}
                          className="text-red-500 text-sm"
                        >
                          删除
                        </button>
                      </div>
                    ) : (
                      <div>
                        <ModernIcons.Upload size={32} className="mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500 mb-2">点击上传身份证正面</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload("idCardFront", e.target.files[0])}
                          className="hidden"
                          id="idCardFront"
                        />
                        <label
                          htmlFor="idCardFront"
                          className="bg-pink-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-pink-700"
                        >
                          选择文件
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    身份证背面 <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {formData.idCardBack ? (
                      <div>
                        <img src={formData.idCardBack} alt="身份证背面" className="max-h-32 mx-auto mb-2" />
                        <button
                          onClick={() => handleInputChange("idCardBack", "")}
                          className="text-red-500 text-sm"
                        >
                          删除
                        </button>
                      </div>
                    ) : (
                      <div>
                        <ModernIcons.Upload size={32} className="mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500 mb-2">点击上传身份证背面</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload("idCardBack", e.target.files[0])}
                          className="hidden"
                          id="idCardBack"
                        />
                        <label
                          htmlFor="idCardBack"
                          className="bg-pink-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-pink-700"
                        >
                          选择文件
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  个人照片 <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img src={photo} alt={`照片${index + 1}`} className="w-full h-24 object-cover rounded" />
                        <button
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              photos: prev.photos.filter((_, i) => i !== index)
                            }));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  {formData.photos.length < 5 && (
                    <div className="text-center">
                      <ModernIcons.Upload size={32} className="mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500 mb-2">上传个人照片（最多5张）</p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => e.target.files && handlePhotosUpload(e.target.files)}
                        className="hidden"
                        id="photos"
                      />
                      <label
                        htmlFor="photos"
                        className="bg-pink-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-pink-700"
                      >
                        选择照片
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    健康证明（可选）
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {formData.healthCertificate ? (
                      <div>
                        <img src={formData.healthCertificate} alt="健康证明" className="max-h-32 mx-auto mb-2" />
                        <button
                          onClick={() => handleInputChange("healthCertificate", "")}
                          className="text-red-500 text-sm"
                        >
                          删除
                        </button>
                      </div>
                    ) : (
                      <div>
                        <ModernIcons.Upload size={24} className="mx-auto mb-2 text-gray-400" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload("healthCertificate", e.target.files[0])}
                          className="hidden"
                          id="healthCertificate"
                        />
                        <label
                          htmlFor="healthCertificate"
                          className="text-pink-600 cursor-pointer hover:text-pink-700"
                        >
                          上传健康证明
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    无犯罪记录证明（可选）
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {formData.backgroundCheck ? (
                      <div>
                        <img src={formData.backgroundCheck} alt="无犯罪记录证明" className="max-h-32 mx-auto mb-2" />
                        <button
                          onClick={() => handleInputChange("backgroundCheck", "")}
                          className="text-red-500 text-sm"
                        >
                          删除
                        </button>
                      </div>
                    ) : (
                      <div>
                        <ModernIcons.Upload size={24} className="mx-auto mb-2 text-gray-400" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload("backgroundCheck", e.target.files[0])}
                          className="hidden"
                          id="backgroundCheck"
                        />
                        <label
                          htmlFor="backgroundCheck"
                          className="text-pink-600 cursor-pointer hover:text-pink-700"
                        >
                          上传证明文件
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Additional Information */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">补充信息</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  相关经验 <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                  placeholder="请描述您的相关工作经验、服务经历或特殊技能..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  申请动机 <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.motivation}
                  onChange={(e) => handleInputChange("motivation", e.target.value)}
                  placeholder="请说明您为什么想成为地陪，以及您的服务理念..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">紧急联系人</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      姓名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.emergencyContact.name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      电话 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.emergencyContact.phone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      关系 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.emergencyContact.relationship}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="">请选择</option>
                      <option value="父母">父母</option>
                      <option value="配偶">配偶</option>
                      <option value="兄弟姐妹">兄弟姐妹</option>
                      <option value="朋友">朋友</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">确认提交</h2>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <ModernIcons.Warning size={20} className="text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">提交前请确认</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>所有信息均真实有效</li>
                        <li>上传的证件照片清晰可见</li>
                        <li>联系方式准确无误</li>
                        <li>已阅读并同意服务条款</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">申请信息摘要</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">显示昵称：</span>
                    <span className="text-gray-800">{formData.displayName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">所在城市：</span>
                    <span className="text-gray-800">{formData.city}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">小时费率：</span>
                    <span className="text-gray-800">{formData.hourlyRate}元/小时</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">专业技能：</span>
                    <span className="text-gray-800">{formData.skills.join(", ")}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-600">个人简介：</span>
                    <span className="text-gray-800">{formData.bio}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <ModernIcons.Info size={20} className="text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">审核流程说明</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>提交申请后，我们将在3-5个工作日内完成审核：</p>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>材料初审（1-2个工作日）</li>
                        <li>背景核查（2-3个工作日）</li>
                        <li>面试确认（如需要）</li>
                        <li>审核结果通知</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="agreement"
                  className="mr-3 text-pink-600 focus:ring-pink-500"
                  required
                />
                <label htmlFor="agreement" className="text-sm text-gray-700">
                  我已阅读并同意
                  <a href="/terms" className="text-pink-600 hover:text-pink-700 ml-1">服务条款</a> 和
                  <a href="/privacy" className="text-pink-600 hover:text-pink-700 ml-1">隐私政策</a>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一步
            </button>
            
            {currentStep < 5 ? (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                下一步
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
              >
                {submitting ?
                  (isEditMode ? "重新提交中..." : "提交中...") :
                  (isEditMode ? "重新提交申请" : "提交申请")
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
