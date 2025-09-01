'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModernIcons } from "@/components/icons/ModernIcons";

interface BottomNavProps {
  session?: any;
}

export default function BottomNav({ session }: BottomNavProps) {
  const pathname = usePathname();

  // 根据用户角色动态生成导航项
  const getNavItems = () => {
    const baseItems = [
      {
        href: "/",
        label: "首页",
        icon: ModernIcons.Home,
        activeColor: "#ec4899"
      },
      {
        href: "/guides",
        label: "地陪",
        icon: ModernIcons.Search,
        activeColor: "#ec4899"
      },
      {
        href: "/booking",
        label: "预约",
        icon: ModernIcons.Calendar,
        activeColor: "#ec4899"
      },
      {
        href: "/messages",
        label: "消息",
        icon: ModernIcons.Message,
        activeColor: "#ec4899"
      }
    ];

    // 最后一个导航项根据用户状态和角色决定
    if (!session) {
      baseItems.push({
        href: "/login",
        label: "登录",
        icon: ModernIcons.User,
        activeColor: "#ec4899"
      });
    } else if (session.role === "guide") {
      // 地陪用户显示工作台
      baseItems.push({
        href: "/guide-dashboard",
        label: "工作台",
        icon: ModernIcons.Users,
        activeColor: "#8b5cf6"
      });
    } else {
      // 普通用户显示个人中心
      baseItems.push({
        href: "/profile",
        label: "我的",
        icon: ModernIcons.User,
        activeColor: "#ec4899"
      });
    }

    return baseItems;
  };

  const navItems = getNavItems();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* 底部导航栏 */}
      <div className="bottom-nav-blur border-t border-pink-100">
        <div className="flex items-center justify-around py-2 px-2 safe-area-bottom">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const IconComponent = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-300 min-w-0 flex-1 ${
                  active 
                    ? 'bg-pink-50 text-pink-600 scale-105' 
                    : 'text-gray-600 hover:text-pink-500 hover:bg-pink-25'
                }`}
              >
                <div className={`transition-all duration-300 ${active ? 'animate-bounce-subtle' : ''}`}>
                  <IconComponent 
                    size={22} 
                    color={active ? item.activeColor : "#6b7280"}
                    className={`transition-all duration-300 ${active ? 'drop-shadow-sm' : ''}`}
                  />
                </div>
                <span className={`text-xs mt-1 font-medium transition-all duration-300 ${
                  active ? 'text-pink-600' : 'text-gray-600'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* 底部安全区域占位 */}
      <div className="h-safe-area-bottom bg-white/95"></div>
    </nav>
  );
}
