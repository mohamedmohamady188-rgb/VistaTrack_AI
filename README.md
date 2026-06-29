# 🌐 VistaTrack AI - Intelligent Industrial Surveillance System

[**English**](#english-description) | [**الوصف باللغة العربية**](#الوصف-باللغة-العربية)

---

## الوصف باللغة العربية

**VistaTrack AI** هو نظام مراقبة صناعي ذكي متكامل مصمم لتحليل بث كاميرات المراقبة (RTSP Streams) في الوقت الفعلي (Real-Time) داخل المصانع والمنشآت. يعتمد النظام على خط معالجة معقد للذكاء الاصطناعي (AI Pipeline) للكشف عن الأفراد، تتبع الحركة، ورسم خرائط الحرارة (Heatmaps) لأماكن التكدس، مع إرسال البيانات فوراً وشحنها للفرونت إند عبر بروتوكول الـ WebSockets بدون الحاجة لتحديث الصفحة.

###  بنية وهندسة النظام (System Architecture)

تم تصميم النظام باتباع معايير الفصل الكامل بين الخدمات (Separation of Concerns) لضمان السرعة والكفاءة العالية:

1. **إطار عمل الذات الاصطناعي (AI Pipeline):**
   * معالجة الفريمات بكفاءة عالية باستخدام موديل **YOLOv8** لعمل Object Detection وخوارزميات التتبع للعمال والأفراد.
   * حساب مناطق التكدس ورسم الـ Heatmaps لايف على فريمات الفيديو.
2. **الباكيند (Backend Service):**
   * مبني باستخدام **FastAPI** بالاعتماد الكامل على البرمجة غير المتزامنة Async Python (`async`/`await`) لمعالجة مئات الطلبات في نفس الوقت وفتح قنوات الاتصال المستمر.
   * حارس البيانات والـ Validation يتم عبر **Pydantic v2 Models** لضمان سلامة المدخلات.
   * استخدام **SQLAlchemy (Async)** كـ ORM لإدارة قواعد البيانات والتعامل مع الكاميرات والشركات.
3. **قنوات البث المباشر (Real-Time Communication):**
   * استخدام **WebSockets** لفتح خط اتصال ثنائي الاتجاه (Full-Duplex) لإرسال فريمات الكاميرات والبيانات الإحصائية لحظة بلحظة للفرونت إند.
4. **الفرونت إند والـ Dashboard:**
   * واجهة مستخدم تفاعلية وسريعة ومحمية مبنية بـ **Next.js** مع استخدام **Tailwind CSS** و **Lucide React Icons** لتقديم لوحة تحكم عصرية ومستقرة.

---

## English Description

**VistaTrack AI** is an enterprise-grade, real-time intelligent surveillance system designed for monitoring industrial camera streams (RTSP) using advanced Computer Vision. The system processes video streams asynchronously, detects personnel, tracks motion, generates live crowd density heatmaps, and dispatches data directly to the frontend via high-performance WebSockets.

### 🚀 Tech Stack & Tools Used

#### Backend & AI Pipeline
* **FastAPI:** High-performance, asynchronous Python web framework for core API endpoints and WebSocket routers.
* **YOLOv8 (Ultralytics):** Real-time object detection model fine-tuned for human tracking and layout analytics.
* **Pydantic v2:** Robust data validation and settings management layer.
* **SQLAlchemy (Async) & SQLite:** Modern asynchronous ORM compatibility for managing system resources, companies, and camera schemas.
* **WebSockets:** Full-duplex persistent connections for live frame streaming.

#### Frontend Dashboard
* **Next.js:** React framework leveraging server-side rendering and client-side interactions.
* **Tailwind CSS:** Modern utility-first CSS framework for clean, dark-themed responsive dashboards.
* **Lucide React:** Sleek and lightweight icon suite.

---

### 🛠️ How to run the project | كيفية التشغيل

#### 1. Backend Setup
```bash
cd vistatrack-backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
