'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { ModernIcons } from "@/components/icons/ModernIcons";

interface NavProps {
  session?: any;
}

export default function Nav({ session }: NavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    if (logoutLoading) return;

    setLogoutLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        // 退出成功，刷新页面
        window.location.href = "/";
      } else {
        alert("退出登录失败，请重试");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("退出登录失败，请重试");
    } finally {
      setLogoutLoading(false);
    }
  };

  const navItems = [
    { href: "/", label: "首页" },
    { href: "/guides", label: "地陪" },
    { href: "/booking", label: "预约" },
    { href: "/messages", label: "消息" },
  ];

  return (
    <nav className="nav-blur safe-area w-full sticky top-0 z-50">
      <div className="flex items-center justify-between py-3 px-4 md:py-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-2 md:gap-3 text-lg md:text-2xl lg:text-3xl font-bold">
            <ModernIcons.Brand size={isMobile ? 24 : 32} className="animate-float text-pink-600" />
            <span className="animate-float logo-text">
              美旅 · Meilv
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-gray-700 hover:text-pink-600 transition-all duration-300 font-semibold hover:scale-105 relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-600 to-rose-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}

          {/* 地陪工作台链接 - 只对地陪用户显示 */}
          {session?.role === "guide" && (
            <Link href="/guide-dashboard" className="text-gray-700 hover:text-pink-600 transition-colors font-medium">
              工作台
            </Link>
          )}

          {session?.role === "guide" && (
            <Link href="/guide-dashboard" className="text-gray-700 hover:text-pink-600 transition-colors font-medium">
              工作台
            </Link>
          )}
          {session?.role === "admin" && (
            <Link href="/admin" className="text-gray-700 hover:text-pink-600 transition-colors font-medium">
              管理后台
            </Link>
          )}

          {session ? (
            <div className="flex items-center gap-3">
              <Link href="/my-bookings" className="text-gray-700 hover:text-pink-600 transition-colors font-medium">
                我的预约
              </Link>
              <Link href="/profile" className="text-gray-700 hover:text-pink-600 transition-colors font-medium">
                个人中心
              </Link>
              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="text-gray-700 hover:text-red-600 transition-colors font-medium disabled:opacity-50"
              >
                {logoutLoading ? "退出中..." : "退出"}
              </button>
              <span className="bg-pink-100 text-pink-700 rounded-full px-3 py-1 text-xs font-medium border border-pink-200">
                {session.role}
              </span>
            </div>
          ) : (
            <Link href="/login" className="text-gray-700 hover:text-pink-600 transition-colors font-medium">
              登录
            </Link>
          )}
        </div>

        {/* Mobile Menu Button - Hidden since we now use bottom nav */}
        <div className="md:hidden"></div>
      </div>

      {/* Mobile Menu - Removed since we now use bottom navigation */}
    </nav>
  );
}

