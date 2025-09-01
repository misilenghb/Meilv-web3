import { getSessionServer } from "@/lib/session";

export default async function ServerAdminGuard({ children }: { children: React.ReactNode }) {
  const s = await getSessionServer();
  if (!s || s.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card text-center p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">访问受限</h2>
          <p className="text-gray-600 mb-4">您需要管理员权限才能访问此页面</p>
          <a href="/login" className="text-pink-600 hover:text-pink-700 font-medium">
            请登录管理员账号
          </a>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
