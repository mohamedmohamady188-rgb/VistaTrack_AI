"use client";

import { useEffect, useState, useRef } from "react";
import { Users, ShieldAlert, Camera, Activity } from "lucide-react";

interface AnalyticsData {
  camera_id: number;
  person_count: number;
  is_crowded: boolean;
  heatmap_data: [number, number][];
}

export default function Dashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Ref للوصول للـ Canvas اللي هنرسم عليه الـ Heatmap
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/analytics/");

    ws.onopen = () => {
      setConnected(true);
      addLog("📡 متصل بسيرفر البث المباشر بنجاح");
    };

    ws.onmessage = (event) => {
      const parsedData: AnalyticsData = JSON.parse(event.data);
      setData(parsedData);

      if (parsedData.is_crowded) {
        addLog(`⚠️ تحذير: زحام تم رصده في كاميرا ${parsedData.camera_id}!`);
      }

      // رسم النقط الحرارية فوراً عند استقبال بيانات جديدة
      if (parsedData.heatmap_data) {
        drawHeatmap(parsedData.heatmap_data);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      addLog(" تم قطع الاتصال بالسيرفر");
    };

    return () => ws.close();
  }, []);

  // دالة رسم الـ Heatmap الذكية على الـ Canvas
  const drawHeatmap = (points: [number, number][]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // مسح الـ Canvas القديم قبل الرسم الجديد لإيقاف التكرار
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    points.forEach(([x, y]) => {
      // عمل تأثير التوهج الحراري (Radial Gradient)
      // بنعمل نسبة وتناسب عشان الإحداثيات تطابق حجم الـ Canvas بتاعنا
      const scaleX = canvas.width / 640;  // فرضاً إن حجم فريم الكاميرا الأصلي 640
      const scaleY = canvas.height / 480; // فرضاً إن طول فريم الكاميرا الأصلي 480

      const canvasX = x * scaleX;
      const canvasY = y * scaleY;

      const gradient = ctx.createRadialGradient(canvasX, canvasY, 2, canvasX, canvasY, 25);
      gradient.addColorStop(0, "rgba(239, 68, 68, 0.8)");  // أحمر متوهج في السنتر
      gradient.addColorStop(0.5, "rgba(245, 158, 11, 0.4)"); // أصفر في المنتصف
      gradient.addColorStop(1, "rgba(245, 158, 11, 0)");   // شفاف على الأطراف

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, 25, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const addLog = (message: string) => {
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] ${message}`,
      ...prev.slice(0, 9),
    ]);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-8">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-slate-800 pb-5 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            VistaTrack AI Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">نظام إدارة وتحليل حشود الحديقة بالذكاء الاصطناعي</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800">
          <span className={`w-3 h-3 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
          <span className="text-xs font-semibold">{connected ? "Live System Online" : "Disconnected"}</span>
        </div>
      </header>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-xl backdrop-blur-sm">
          <div>
            <p className="text-slate-400 text-xs font-medium">العدد اللحظي الحالي</p>
            <h3 className="text-4xl font-black mt-2 text-emerald-400">{data?.person_count ?? 0}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className={`border p-6 rounded-2xl flex items-center justify-between shadow-xl backdrop-blur-sm transition-all duration-300 ${
          data?.is_crowded
            ? "bg-rose-950/40 border-rose-500/50 animate-pulse text-rose-400"
            : "bg-slate-900/60 border-slate-800 text-slate-400"
        }`}>
          <div>
            <p className="text-xs font-medium">حالة الكثافة والزحام</p>
            <h3 className="text-xl font-bold mt-3">
              {data?.is_crowded ? "⚠️ منطقة مزدحمة!" : "✅ مستقر / طبيعي"}
            </h3>
          </div>
          <div className={`p-3 rounded-xl ${data?.is_crowded ? "bg-rose-500/20 text-rose-400" : "bg-slate-800 text-slate-400"}`}>
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-xl backdrop-blur-sm">
          <div>
            <p className="text-slate-400 text-xs font-medium">الكاميرات النشطة</p>
            <h3 className="text-4xl font-black mt-2 text-cyan-400">1 <span className="text-xs text-slate-500 font-normal">/ 1</span></h3>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
            <Camera className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-xl backdrop-blur-sm">
          <div>
            <p className="text-slate-400 text-xs font-medium">نقاط الـ Heatmap المرصودة</p>
            <h3 className="text-4xl font-black mt-2 text-amber-400">{data?.heatmap_data.length ?? 0}</h3>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Layout Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* شاشة الـ Heatmap الحية */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 h-[480px] flex flex-col justify-between relative overflow-hidden shadow-2xl">
          <div className="flex justify-between items-center mb-4 z-10">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-400" /> خريطة التمركز الحراري الفورية (Live AI Heatmap)
            </h2>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-medium">Camera_01_Main_Gate</span>
          </div>

          {/* الـ Canvas السحري للرسم */}
          <div className="w-full flex-1 bg-slate-950 rounded-2xl border border-slate-800/80 relative overflow-hidden flex items-center justify-center">
            <div className="absolute top-4 left-4 text-[10px] text-slate-500 bg-slate-900/80 px-2 py-0.5 rounded font-mono z-10">
              Canvas 2D Renderer Active
            </div>

            {/* شبكة خلفية خفيفة تعطي مظهر خريطة رادار مستقبلي تكنولوجي */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>

            <canvas
              ref={canvasRef}
              width={700}
              height={350}
              className="absolute inset-0 w-full h-full z-20"
            />

            {(!data || data.heatmap_data.length === 0) && (
              <p className="text-slate-600 text-xs z-0 font-mono animate-pulse">في انتظار رصد حركة أول شخص...</p>
            )}
          </div>
        </div>

        {/* سجل الأحداث الفوري */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 h-[480px] flex flex-col shadow-2xl">
          <h2 className="text-base font-bold mb-4 flex items-center gap-2 text-cyan-400">
            <Activity className="w-5 h-5" /> سجل الأحداث الفوري (AI Logs)
          </h2>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
            {logs.map((log, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-xl border transition-all ${
                  log.includes("⚠️") 
                    ? "bg-rose-950/30 border-rose-500/20 text-rose-300" 
                    : "bg-slate-950/50 border-slate-800/80 text-slate-400"
                }`}
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}