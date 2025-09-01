"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface UserSettings {
  notifications: {
    orderUpdates: boolean;
    messageAlerts: boolean;
    promotions: boolean;
    systemAnnouncements: boolean;
  };
  privacy: {
    showProfile: boolean;
    showOrderHistory: boolean;
    allowDirectMessages: boolean;
  };
  preferences: {
    language: "zh-CN" | "en-US";
    currency: "CNY" | "USD";
    theme: "light" | "dark" | "auto";
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile/settings")
      .then(r => r.json())
      .then(data => {
        setSettings(data);
      })
      .catch(err => {
        console.error("Failed to load settings:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const updateSetting = async (category: string, key: string, value: any) => {
    if (!settings) return;

    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category as keyof UserSettings],
        [key]: value,
      },
    };

    setSettings(newSettings);

    try {
      await fetch("/api/profile/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
    } catch (err) {
      console.error("Failed to save settings:", err);
      // Revert on error
      setSettings(settings);
    }
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

  if (!settings) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card-pink p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">加载设置失败</h1>
            <Link href="/profile" className="text-pink-600 hover:text-pink-700">
              返回个人中心
            </Link>
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
          <Link href="/profile" className="text-pink-600 hover:text-pink-700">
            ← 返回
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">账户设置</h1>
            <p className="text-gray-600">管理您的通知、隐私和偏好设置</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Notifications */}
          <div className="card-pink p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">通知设置</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">订单更新</h3>
                  <p className="text-sm text-gray-600">订单状态变化时通知我</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.orderUpdates}
                    onChange={(e) => updateSetting("notifications", "orderUpdates", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">消息提醒</h3>
                  <p className="text-sm text-gray-600">收到新消息时通知我</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.messageAlerts}
                    onChange={(e) => updateSetting("notifications", "messageAlerts", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">促销活动</h3>
                  <p className="text-sm text-gray-600">接收优惠和活动信息</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.promotions}
                    onChange={(e) => updateSetting("notifications", "promotions", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">系统公告</h3>
                  <p className="text-sm text-gray-600">接收重要的系统通知</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.systemAnnouncements}
                    onChange={(e) => updateSetting("notifications", "systemAnnouncements", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="card-pink p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">隐私设置</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">公开个人资料</h3>
                  <p className="text-sm text-gray-600">允许其他用户查看我的基本信息</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showProfile}
                    onChange={(e) => updateSetting("privacy", "showProfile", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">公开订单历史</h3>
                  <p className="text-sm text-gray-600">允许地陪查看我的服务记录</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showOrderHistory}
                    onChange={(e) => updateSetting("privacy", "showOrderHistory", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">允许私信</h3>
                  <p className="text-sm text-gray-600">允许地陪主动联系我</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.allowDirectMessages}
                    onChange={(e) => updateSetting("privacy", "allowDirectMessages", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="card-pink p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">偏好设置</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">语言</label>
                <select
                  value={settings.preferences.language}
                  onChange={(e) => updateSetting("preferences", "language", e.target.value)}
                  className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="zh-CN">中文</option>
                  <option value="en-US">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">货币</label>
                <select
                  value={settings.preferences.currency}
                  onChange={(e) => updateSetting("preferences", "currency", e.target.value)}
                  className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="CNY">人民币 (¥)</option>
                  <option value="USD">美元 ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">主题</label>
                <select
                  value={settings.preferences.theme}
                  onChange={(e) => updateSetting("preferences", "theme", e.target.value)}
                  className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="light">浅色</option>
                  <option value="dark">深色</option>
                  <option value="auto">跟随系统</option>
                </select>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card-pink p-6 border-2 border-red-200">
            <h2 className="text-xl font-bold text-red-600 mb-6">危险操作</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">注销账户</h3>
                  <p className="text-sm text-gray-600">永久删除您的账户和所有数据</p>
                </div>
                <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                  注销账户
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
