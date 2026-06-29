"use client";

import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Camera, BarChart3, Settings } from "lucide-react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: "لوحة التحكم الحية", path: "/", icon: LayoutDashboard },
    { name: "إدارة الكاميرات", path: "/cameras", icon: Camera },
    { name: "التقارير الإحصائية", path: "/reports", icon: BarChart3 },
  ];

  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#0f172a] text-slate-100 font-sans flex min-h-screen">
        {/* Sidebar الجانبي */}
        <aside className="w-64 bg-slate-900/80 border-l border-slate-800 p-6 flex flex-col justify-between backdrop-blur-md">
          <div>
            {/* Logo */}
            <div className="mb-10 px-2">
              <h2 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-wider">
                VistaTrack AI
              </h2>
              <p className="text-xs text-slate-500 mt-1">Smart Park Management</p>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-gradient-to-l from-emerald-500/20 to-cyan-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/5"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer Sidebar */}
          <div className="border-t border-slate-800 pt-4 flex items-center gap-3 text-xs text-slate-500">
            <Settings className="w-4 h-4" />
            <span>إعدادات النظام v1.0</span>
          </div>
        </aside>

        {/* المحتوى الرئيسي المتغير */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}