import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import websocket_router
from app.routers import cameras  # استيراد راوتر الكاميرات
from app.database.session import AsyncSessionLocal
from app.AI.detector import process_camera_stream

# دالة الـ Lifespan لإدارة تشغيل الـ AI في الخلفية مع السيرفر
@asynccontextmanager
async def lifespan(app: FastAPI):
    print(" 📡 جاري بدء تشغيل الـ AI Pipeline في الخلفية...")

    async def run_ai_in_background():
        async with AsyncSessionLocal() as db:
            try:
                # 0 لكاميرا اللاب توب الحية
                await process_camera_stream(db=db, camera_id=1, rtsp_url=0)
            except Exception as e:
                print(f"  خطأ في تشغيل الـ AI في الخلفية: {e}")

    # تشغيل الـ AI كـ Task منفصلة في الـ Background
    ai_task = asyncio.create_task(run_ai_in_background())

    yield
    # الكود اللي هنا بيشتغل والسيرفر بيقفل
    ai_task.cancel()
    print("  تم إيقاف الـ AI Pipeline بنجاح.")


# 1. إنشاء الـ FastAPI Instance مرة واحدة فقط
app = FastAPI(title="VistaTrack AI", lifespan=lifespan)

# 2. إضافة الـ CORS Middleware للسماح للفرونت إند (Next.js) بالاتصال بدون قيود
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # بورت الفرونت إند
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. تسجيل الـ Routers بشكل صحيح
app.include_router(websocket_router.router)
app.include_router(cameras.router)  # تسجيل راوتر الكاميرات