"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import { BarChart3, TrendingUp, Users, AlertTriangle } from "lucide-react";

interface HourlyChartPoint {
  hour: string;
  count: number;
}

const weeklyData = [
  { day: "السبت", count: 420 },
  { day: "الأحد", count: 310 },
  { day: "الإثنين", count: 250 },
  { day: "الثلاثاء", count: 280 },
  { day: "الأربعاء", count: 390 },
  { day: "الخميس", count: 680 },
  { day: "الجمعة", count: 850 },
];

export default function ReportsPage() {
  // تخرين البيانات الحية القادمة من الداتا بيز للرسم البياني اليومي
  const [hourlyData, setHourlyData] = useState<HourlyChartPoint[]>([]);

  useEffect(() => {
    const fetchRealtimeAnalytics = () => {
      fetch("http://127.0.0.1:8000/cameras/analytics-summary")
        .then((res) => {
          if (!res.ok) throw new Error("السيرفر لم يستجب");
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setHourlyData(data);
          }
        })
        .catch((err) => console.error("Error fetching analytics:", err));
    };

    fetchRealtimeAnalytics(); // جلب الداتا فوراً عند التحميل
    const interval = setInterval(fetchRealtimeAnalytics, 5000); // تحديث الجراف تلقائياً كل 5 ثواني

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* العناوين الأساسية */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-100">التقارير الإحصائية والتحليلات</h1>
        <p className="text-slate-400 text-sm mt-1">تحليل أوقات الذروة ومعدلات الكثافة العددية عبر الذكاء الاصطناعي</p>
      </div>

      {/* بطاقات الملخص السريع للتقارير */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-xl">
          <div>
            <p className="text-slate-400 text-xs font-medium">متوسط الزوار اليومي</p>
            <h3 className="text-2xl font-black mt-2 text-cyan-400">
              {hourlyData.length > 0 ? `${Math.round(hourlyData.reduce((acc, curr) => acc + curr.count, 0) / hourlyData.length)} زائر` : "تحليل..."}
            </h3>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-xl">
          <div>
            <p className="text-slate-400 text-xs font-medium">آخر قراءة عددية</p>
            <h3 className="text-2xl font-black mt-2 text-amber-400">
              {hourlyData.length > 0 ? `${hourlyData[hourlyData.length - 1].count} أشخاص` : "0"}
            </h3>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-xl">
          <div>
            <p className="text-slate-400 text-xs font-medium">إشعارات الزحام الحرجة هذا الأسبوع</p>
            <h3 className="text-2xl font-black mt-2 text-rose-400">14 تنبيه</h3>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* قسم الجرافات الكبيرة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* جراف 1: معدل الزحام الحي الفعلي المقروء من قاعدة البيانات */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-bold mb-6 flex items-center gap-2 text-slate-200">
            <BarChart3 className="w-4 h-4 text-emerald-400" /> منحنى الكثافة العددية اللحظي (مستخرج من الداتا بيز لايف)
          </h2>
          <div className="w-full h-64 text-xs font-mono">
            {hourlyData.length > 0 ? (
              <ResponsiveContainer width="100%" h="100%">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" stroke="#64748b" />
                  <YAxis stroke="#64748b" allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }} />
                  <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 animate-pulse">
                في انتظار رصد أولى اللقطات الإحصائية من الكاميرا...
              </div>
            )}
          </div>
        </div>

        {/* جراف 2: مقارنة الأيام على مدار الأسبوع (Bar Chart) */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-bold mb-6 flex items-center gap-2 text-slate-200">
            <BarChart3 className="w-4 h-4 text-cyan-400" /> إحصائيات الإقبال الأسبوعي (بالأيام)
          </h2>
          <div className="w-full h-64 text-xs font-mono">
            <ResponsiveContainer width="100%" h="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }} />
                <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}