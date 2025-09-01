"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface GuideProfile {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  skills: string[];
  hourlyRate: number;
  services: Array<{
    code: "daily" | "mild_entertainment" | "local_tour";
    title: string;
    pricePerHour?: number;
    packagePrice?: number;
  }>;
  photos: string[];
  city: string;
  certificationStatus: string;
  ratingAvg: number;
  ratingCount: number;
}

export default function GuideProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<GuideProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    skills: [] as string[],
    hourlyRate: 200,
    city: "",
    location: "",
    photos: [] as string[],
    services: [
      { code: "daily" as const, title: "日常陪伴", pricePerHour: 198 },
      { code: "mild_entertainment" as const, title: "微醺娱乐", pricePerHour: 298 },
      { code: "local_tour" as const, title: "同城旅游", packagePrice: 2900 },
    ],
  });
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    fetch("/api/guide/profile")
      .then(r => r.json())
      .then(data => {
        setProfile(data);
        setFormData({
          displayName: data.displayName || "",
          bio: data.bio || "",
          skills: data.skills || [],
          hourlyRate: data.hourlyRate || 200,
          city: data.city || "",
          location: data.location || "",
          photos: data.photos || [],
          services: data.services || [
            { code: "daily", title: "日常陪伴", pricePerHour: 198 },
            { code: "mild_entertainment", title: "微醺娱乐", pricePerHour: 298 },
            { code: "local_tour", title: "同城旅游", packagePrice: 2900 },
          ],
        });
      })
      .catch(err => {
        console.error("Failed to load profile:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/guide/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/guide-dashboard");
      } else {
        const error = await response.json();
        alert(`保存失败: ${error.error}`);
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
      alert("保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceChange = (index: number, field: string, value: number) => {
    const newServices = [...formData.services];
    newServices[index] = { ...newServices[index], [field]: value };
    setFormData(prev => ({ ...prev, services: newServices }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert("图片大小不能超过5MB");
      return;
    }

    // 模拟上传 - 在实际应用中应该上传到云存储
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, event.target!.result as string]
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card-pink p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            <p className="text-gray-600 mt-2">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/guide-dashboard" className="text-pink-600 hover:text-pink-700">
            ← 返回工作台
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">编辑地陪资料</h1>
            <p className="text-gray-600">完善您的服务信息，吸引更多客户</p>
          </div>
        </div>

        {/* Profile Status */}
        {profile && (
          <div className="card-pink p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">认证状态</h3>
                <p className="text-gray-600">当前状态：
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                    profile.certificationStatus === "verified" 
                      ? "bg-green-100 text-green-700" 
                      : profile.certificationStatus === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {profile.certificationStatus === "verified" ? "已认证" : 
                     profile.certificationStatus === "pending" ? "审核中" : "未认证"}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-600">{profile.ratingAvg}</div>
                <div className="text-sm text-gray-600">{profile.ratingCount}条评价</div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="card-pink p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6">基本信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    显示名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleChange("displayName", e.target.value)}
                    className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    所在城市 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="如：杭州"
                    className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    详细位置信息
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="如：西湖区文三路"
                    className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  个人简介
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  placeholder="介绍一下您的服务特色和经验..."
                  rows={4}
                  className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Photos */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6">个人照片</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    上传照片 (最多6张，每张不超过5MB)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    disabled={formData.photos.length >= 6}
                  />
                </div>

                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`照片 ${index + 1}`}
                          className="w-full h-32 object-cover rounded-xl border border-pink-200"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6">专业技能</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="添加技能标签，如：杭州景点讲解"
                    className="flex-1 px-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl transition-colors"
                  >
                    添加
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-pink-500 hover:text-pink-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6">服务定价</h3>
              <div className="space-y-4">
                {formData.services.map((service, index) => (
                  <div key={service.code} className="bg-white/70 rounded-2xl p-4 border border-pink-100">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-800">{service.title}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {service.code !== "local_tour" ? (
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">小时价格 (¥)</label>
                          <input
                            type="number"
                            value={service.pricePerHour || 0}
                            onChange={(e) => handleServiceChange(index, "pricePerHour", parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">套餐价格 (¥/10小时)</label>
                          <input
                            type="number"
                            value={service.packagePrice || 0}
                            onChange={(e) => handleServiceChange(index, "packagePrice", parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "保存中..." : "保存修改"}
              </button>
              <Link
                href="/guide-dashboard"
                className="flex-1 border-2 border-pink-500 text-pink-500 hover:bg-pink-50 py-3 rounded-xl font-medium transition-colors text-center"
              >
                取消
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
