import sys
import os
import asyncio

# إضافة الفولدر الرئيسي للمسار
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 👇 عملنا import للـ AsyncSessionLocal الصح من ملفك
from app.database.session import AsyncSessionLocal
from app.AI.detector import process_camera_stream


async def run_test():
    # 1. فتح سيسشن Async بنظافة
    async with AsyncSessionLocal() as db:
        try:
            CAMERA_ID = 1
            VIDEO_SOURCE = 0  # 0 لفتح كاميرا اللاب توب لايف

            print("🚀 جاري تشغيل الموديل والاتصال بالكاميرا (Async Mode)...")
            # 👇 استدعاء الدالة بـ await
            await process_camera_stream(db=db, camera_id=CAMERA_ID, rtsp_url=VIDEO_SOURCE)

        except KeyboardInterrupt:
            print("\n🛑 تم إيقاف سكريبت الاختبار بواسطة المستخدم.")
        finally:
            print("🔌 تم إغلاق اتصال الداتا بيز بنجاح.")


if __name__ == "__main__":
    # تشغيل الـ Async Loop
    asyncio.run(run_test())