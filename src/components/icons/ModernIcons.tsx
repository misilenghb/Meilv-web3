import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

// 现代化图标组件库
export const ModernIcons = {
  // 品牌图标 - 替换 ✨
  Brand: ({ size = 24, className = "", color = "currentColor" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="brand-gradient-static" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="50%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path
        d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"
        fill="url(#brand-gradient-static)"
        className="drop-shadow-sm"
      />
      <circle cx="12" cy="12" r="3" fill="white" opacity="0.9" />
    </svg>
  ),

  // 星星评分 - 替换 ★ ☆
  Star: ({ size = 20, className = "", color = "#fbbf24" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path 
        d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" 
        fill={color}
        stroke={color}
        strokeWidth="1"
        className="drop-shadow-sm"
      />
    </svg>
  ),

  StarOutline: ({ size = 20, className = "", color = "#d1d5db" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path 
        d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" 
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),

  // 心形收藏 - 替换 ❤️ 🤍
  Heart: ({ size = 24, className = "", color = "#ec4899" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path 
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
        fill={color}
        className="drop-shadow-sm animate-pulse"
      />
    </svg>
  ),

  HeartOutline: ({ size = 24, className = "", color = "#ec4899" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path 
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        className="hover:fill-current transition-all duration-200"
      />
    </svg>
  ),

  // 位置图标 - 替换 📍
  Location: ({ size = 20, className = "", color = "#ec4899" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path 
        d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" 
        fill={color}
        opacity="0.1"
      />
      <path 
        d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" 
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
      <circle cx="12" cy="10" r="3" fill={color} />
    </svg>
  ),

  // 安全盾牌 - 替换 🛡️
  Shield: ({ size = 24, className = "", color = "#10b981" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <path 
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" 
        fill="url(#shieldGradient)"
        className="drop-shadow-md"
      />
      <path 
        d="M9 12l2 2 4-4" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  ),

  // 钻石品质 - 替换 💎
  Diamond: ({ size = 24, className = "", color = "#3b82f6" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="diamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
      </defs>
      <path 
        d="M6 3h12l4 6-10 12L2 9l4-6z" 
        fill="url(#diamondGradient)"
        className="drop-shadow-lg"
      />
      <path 
        d="M6 3h12l4 6-10 12L2 9l4-6z" 
        fill="none"
        stroke="white"
        strokeWidth="1"
        opacity="0.3"
      />
    </svg>
  ),

  // 握手合作 - 替换 🤝
  Handshake: ({ size = 24, className = "", color = "#10b981" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path 
        d="M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14" 
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path 
        d="M8 12h2a2 2 0 1 1 0 4h-3c-.6 0-1.1-.2-1.4-.6L0 10" 
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        transform="translate(12, 0) scale(-1, 1)"
      />
      <circle cx="12" cy="12" r="2" fill={color} opacity="0.2" />
    </svg>
  ),

  // 时钟时间 - 替换 ⏰
  Clock: ({ size = 24, className = "", color = "#8b5cf6" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        fill={color}
        opacity="0.1"
      />
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      <path 
        d="M12 6v6l4 2" 
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  // 用户群组 - 替换 👥
  Users: ({ size = 24, className = "", color = "#ec4899" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path 
        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" 
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" fill={color} opacity="0.1" />
      <path 
        d="M23 21v-2a4 4 0 0 0-3-3.87" 
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path 
        d="M16 3.13a4 4 0 0 1 0 7.75" 
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  ),

  // 目标靶心 - 替换 🎯
  Target: ({ size = 24, className = "", color = "#ec4899" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="2" fill={color} />
    </svg>
  ),

  // 礼物盒 - 替换 💝
  Gift: ({ size = 24, className = "", color = "#ec4899" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gift-gradient-static" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
      </defs>
      <rect x="3" y="8" width="18" height="13" rx="2" fill="url(#gift-gradient-static)" opacity="0.8" />
      <path d="M12 8v13" stroke="white" strokeWidth="2" />
      <path d="M3 8h18" stroke="white" strokeWidth="2" />
      <path
        d="M8.5 8a2.5 2.5 0 0 1 0-5A4.9 4.9 0 0 1 12 6a4.9 4.9 0 0 1 3.5-3 2.5 2.5 0 0 1 0 5"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
    </svg>
  ),

  // 加载中 - 替换 ⏳
  Loading: ({ size = 24, className = "", color = "#ec4899" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`${className} animate-spin`}>
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        stroke={color}
        strokeWidth="4"
        strokeDasharray="32"
        strokeDashoffset="32"
        fill="none"
        opacity="0.3"
      />
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        stroke={color}
        strokeWidth="4"
        strokeDasharray="16"
        strokeDashoffset="16"
        fill="none"
        strokeLinecap="round"
        className="animate-pulse"
      />
    </svg>
  ),

  // 庆祝 - 替换 🎉
  Celebration: ({ size = 32, className = "", color = "#ec4899" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="celebrationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="50%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <path 
        d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" 
        fill="url(#celebrationGradient)"
        className="drop-shadow-lg animate-pulse"
      />
      <circle cx="8" cy="6" r="1" fill="#fbbf24" className="animate-bounce" />
      <circle cx="16" cy="6" r="1" fill="#f472b6" className="animate-bounce" style={{animationDelay: '0.1s'}} />
      <circle cx="6" cy="16" r="1" fill="#ec4899" className="animate-bounce" style={{animationDelay: '0.2s'}} />
      <circle cx="18" cy="16" r="1" fill="#a855f7" className="animate-bounce" style={{animationDelay: '0.3s'}} />
    </svg>
  ),

  // 相机拍照 - 替换 📸
  Camera: ({ size = 24, className = "", color = "#6366f1" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path 
        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2v11z" 
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        fill={color}
        opacity="0.1"
      />
      <circle cx="12" cy="13" r="4" stroke={color} strokeWidth="2" fill="none" />
      <circle cx="12" cy="13" r="2" fill={color} />
    </svg>
  ),

  // 地图导航 - 替换 🗺️
  Map: ({ size = 24, className = "", color = "#06b6d4" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        fill={color}
        opacity="0.1"
      />
      <path d="M8 2v16" stroke={color} strokeWidth="2" />
      <path d="M16 6v16" stroke={color} strokeWidth="2" />
    </svg>
  ),

  // 消息图标 - 替换 💬
  Message: ({ size = 24, className = "", color = "#ec4899" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        fill={color}
        opacity="0.1"
      />
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="9" cy="10" r="1" fill={color} />
      <circle cx="15" cy="10" r="1" fill={color} />
      <circle cx="12" cy="10" r="1" fill={color} />
    </svg>
  ),

  // 发送图标
  Send: ({ size = 24, className = "", color = "#ec4899" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="send-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
      </defs>
      <path
        d="M22 2L11 13"
        stroke="url(#send-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 2L15 22L11 13L2 9L22 2Z"
        fill="url(#send-gradient)"
        opacity="0.8"
      />
    </svg>
  ),

  // 首页图标
  Home: ({ size = 24, className = "", color = "#ec4899" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        fill={color}
        opacity="0.1"
      />
      <path
        d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M9 22V12h6v10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  // 用户个人图标
  User: ({ size = 24, className = "", color = "#ec4899" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle
        cx="12"
        cy="8"
        r="5"
        fill={color}
        opacity="0.1"
      />
      <circle
        cx="12"
        cy="8"
        r="5"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M20 21a8 8 0 0 0-16 0"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  ),

  // 预约/日历图标
  Calendar: ({ size = 24, className = "", color = "#ec4899" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        ry="2"
        fill={color}
        opacity="0.1"
      />
      <rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        ry="2"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      <line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="2" />
      <circle cx="8" cy="14" r="1" fill={color} />
      <circle cx="12" cy="14" r="1" fill={color} />
      <circle cx="16" cy="14" r="1" fill={color} />
    </svg>
  ),

  // 搜索图标
  Search: ({ size = 24, className = "", color = "#ec4899" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle
        cx="11"
        cy="11"
        r="8"
        fill={color}
        opacity="0.1"
      />
      <circle
        cx="11"
        cy="11"
        r="8"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M21 21l-4.35-4.35"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),

  // 酒杯娱乐 - 替换 🍷
  Wine: ({ size = 24, className = "", color = "#8b5cf6" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path 
        d="M8 22h8" 
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path 
        d="M12 15v7" 
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path 
        d="M12 15a5 5 0 0 0 5-5V2H7v8a5 5 0 0 0 5 5z" 
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        fill={color}
        opacity="0.1"
      />
      <path 
        d="M7 6h10" 
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),

  // 上传文件 - 替换 📤
  Upload: ({ size = 24, className = "", color = "#6b7280" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  // 警告 - 替换 ⚠️
  Warning: ({ size = 24, className = "", color = "#f59e0b" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill={color} />
    </svg>
  ),

  // 信息 - 替换 ℹ️
  Info: ({ size = 24, className = "", color = "#3b82f6" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <path d="M12 16v-4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1" fill={color} />
    </svg>
  ),

  // 搜索 - 替换 🔍
  Search: ({ size = 24, className = "", color = "#6b7280" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" />
      <path d="m21 21-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  // 左箭头 - 替换 ←
  ArrowLeft: ({ size = 24, className = "", color = "#6b7280" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M19 12H5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 19l-7-7 7-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  // 对勾 - 替换 ✓
  Check: ({ size = 24, className = "", color = "#10b981" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  // 叉号 - 替换 ✗
  X: ({ size = 24, className = "", color = "#ef4444" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M18 6L6 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  // 用户 - 替换 👤
  User: ({ size = 24, className = "", color = "#6b7280" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" />
    </svg>
  ),

  // 加载中 - 替换 ⏳
  Loading: ({ size = 24, className = "", color = "#6b7280" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`${className} animate-spin`}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" strokeDasharray="31.416" strokeDashoffset="31.416" opacity="0.3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),

  // 日历 - 替换 📅
  Calendar: ({ size = 24, className = "", color = "#6b7280" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={color} strokeWidth="2" />
      <line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),

  // 时钟 - 替换 🕐
  Clock: ({ size = 24, className = "", color = "#6b7280" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <polyline points="12,6 12,12 16,14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  // 锁 - 替换 🔒
  Lock: ({ size = 24, className = "", color = "#6b7280" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={color} strokeWidth="2" />
      <circle cx="12" cy="16" r="1" fill={color} />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  // 眼睛 - 显示密码
  Eye: ({ size = 24, className = "", color = "#6b7280" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth="2" />
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
    </svg>
  ),

  // 眼睛关闭 - 隐藏密码
  EyeOff: ({ size = 24, className = "", color = "#6b7280" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="1" y1="1" x2="23" y2="23" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
};
