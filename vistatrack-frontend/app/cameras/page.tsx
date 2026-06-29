"use client";

import { useState, useEffect } from "react";
import { Plus, Video, Radio, MapPin, CheckCircle2 } from "lucide-react";

// 🛠️ 1. تعديل الأنواع لتطابق TypeScript (string) وتطابق الـ Properties القادمة من الـ Database
interface Camera {
  id: number;
  zone_name: string; // بدلاً من name أو location لتطابق موديل الباكيند
  rtsp_url: string;
  is_active: boolean;
}

export default function CamerasPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [zoneName, setZoneName] = useState("");
  const [url, setUrl] = useState("");

  // 1. جلب الكاميرات من الباكيند فور تحميل الصفحة (بدون حماية Auth مؤقتاً لتسهيل الـ MVP)
  useEffect(() => {
    fetch("http://127.0.0.1:8000/cameras/")
      .then((res) => {
        if (!res.ok) throw new Error("سيرفر الكاميرات لم يستجب بشكل صحيح");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setCameras(data);
        } else {
          setCameras([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching cameras:", err);
        setCameras([]);
      });
  }, []);

  // 2. إرسال كاميرا جديدة للباكيند وحفظها في قاعدة البيانات
  const handleAddCamera = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName || !url) return;

    try {
      // 🛠️ 2. تعديل المسار هنا ليطابق راوتر الباكيند مباشرة بدون /api
      const response = await fetch("http://127.0.0.1:8000/cameras/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 🛠️ 3. تعديل الـ Body ليرسل المسميات المطلوبة في الـ Schema (CameraCreate)
        body: JSON.stringify({
          zone_name: zoneName,
          rtsp_url: url
        }),
      });

      if (response.ok) {
        const newCam = await response.json();
        setCameras((prev) => [...prev, newCam]); // تحديث الجدول فوراً بالـ State الجديدة الآمنة
        setZoneName("");
        setUrl("");
      } else {
        console.error("فشل في إضافة الكاميرا، السيرفر رد بـ خطأ");
      }
    } catch (error) {
      console.error("Error adding camera:", error);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-100">إدارة كاميرات المراقبة</h1>
        <p className="text-slate-400 text-sm mt-1">إضافة، تعديل، وربط كاميرات الـ RTSP بنظام التحليل الذكي</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* فورم الإضافة */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl h-fit">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-emerald-400">
            <Plus className="w-5 h-5" /> إضافة كاميرا جديدة
          </h2>
          <form onSubmit={handleAddCamera} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">اسم المنطقة / زون الكاميرا</label>
              <input
                type="text"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                placeholder="مثال: البوابة الرئيسية أو ساحة التحميل"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">رابط البث (RTSP / IP URL أو 0 للاب توب)</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="مثال: 0"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-100 focus:outline-none focus:border-emerald-500 transition-all text-left"
                dir="ltr"
              />
            </div>
            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/10 text-sm">
              ربط وتشغيل الكاميرا فوراً
            </button>
          </form>
        </div>

        {/* جدول الكاميرات المتصلة الحقيقي */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse" /> الكاميرات المتصلة حالياً بالسيستم
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs">
                  <th className="pb-3 font-medium">المعرف الرقمي</th>
                  <th className="pb-3 font-medium">اسم الزون والمنطقة</th>
                  <th className="pb-3 font-medium">حالة الاتصال بالـ AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {Array.isArray(cameras) && cameras.length > 0 ? (
                  cameras.map((cam) => (
                    <tr key={cam.id} className="text-slate-300">
                      <td className="py-4 font-mono text-slate-500 text-xs">
                        #{cam.id}
                      </td>
                      <td className="py-4 flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg text-cyan-400"><Video className="w-4 h-4" /></div>
                        <div>
                          <p className="font-semibold text-slate-200">{cam.zone_name}</p>
                          <p className="text-xs text-slate-500 font-mono truncate max-w-xs" dir="ltr">{cam.rtsp_url}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        {cam.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" /> نشط وتحلل
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            خارج الخدمة
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-slate-500">
                      لا يوجد كاميرات مضافة حالياً بالسيستم.. أضف أول كاميرا الآن!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}