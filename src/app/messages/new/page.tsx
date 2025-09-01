"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ModernIcons } from "@/components/icons/ModernIcons";

interface User {
  id: string;
  name: string;
  role: string;
  phone: string;
  roleLabel: string;
}

export default function NewMessagePage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users?excludeCurrentUser=true");
      const data = await response.json();
      setUsers(data.items || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const startConversation = (userId: string) => {
    router.push(`/messages/${userId}`);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'user':
        return 'bg-blue-100 text-blue-800';
      case 'guide':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'user':
        return <ModernIcons.User size={16} />;
      case 'guide':
        return <ModernIcons.Location size={16} />;
      case 'admin':
        return <ModernIcons.Shield size={16} />;
      default:
        return <ModernIcons.User size={16} />;
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 messages-container">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/messages"
              className="p-2 hover:bg-pink-50 rounded-full transition-colors"
            >
              <ModernIcons.ArrowLeft size={24} color="#ec4899" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">新建对话</h1>
              <p className="text-gray-600 mt-1">选择用户开始对话</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="card-pink p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <ModernIcons.Search 
                size={20} 
                color="#9ca3af" 
                className="absolute left-3 top-1/2 transform -translate-y-1/2" 
              />
              <input
                type="text"
                placeholder="搜索用户姓名或手机号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
            >
              <option value="all">所有角色</option>
              <option value="user">用户</option>
              <option value="guide">地陪</option>
              <option value="admin">管理员</option>
            </select>
          </div>
        </div>

        {/* Users List */}
        <div className="card-pink p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              <p className="text-gray-600 mt-2">加载中...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-6">
                <ModernIcons.Users size={80} color="#ec4899" className="animate-pulse" />
              </div>
              <p className="text-gray-600 mb-2 text-lg font-medium">
                {searchTerm || selectedRole !== "all" ? "未找到匹配的用户" : "暂无其他用户"}
              </p>
              <p className="text-sm text-gray-500">
                {searchTerm || selectedRole !== "all" ? "请尝试调整搜索条件" : "系统中还没有其他用户"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => startConversation(user.id)}
                  className="bg-white/70 rounded-2xl p-4 border border-pink-100 hover:bg-white/90 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {user.name.charAt(0)}
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800">{user.name}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {getRoleIcon(user.role)}
                            {user.roleLabel}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{user.phone}</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-2">
                      <button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-4 py-2 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2">
                        <ModernIcons.Message size={16} />
                        <span className="hidden sm:inline">开始对话</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
