import cv2
import asyncio
import time
from ultralytics import YOLO
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import models
from app.routers.websocket_router import manager

model = YOLO("yolov8n.pt")

async def process_camera_stream(db: AsyncSession, camera_id: int, rtsp_url: str or int):
    if str(rtsp_url) == "0":
        rtsp_url = 0

    cap = cv2.VideoCapture(rtsp_url)

    if not cap.isOpened():
        print(f"Error!! Not opened camera {camera_id}")
        return

    print(f"📸 بنجاح... بدء معالجة البث للكاميرا رقم {camera_id}...")

    CROWD_THRESHOLD = 10
    last_save_time = time.time()

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            await asyncio.sleep(0.1)
            continue

        results = model(frame, classes=[0], verbose=False)

        person_count = 0
        heatmap_points = []

        for result in results:
            boxes = result.boxes
            person_count = len(boxes)

            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                center_x = int((x1 + x2) / 2)
                center_y = int((y1 + y2) / 2)
                heatmap_points.append([center_x, center_y])

        is_crowded = person_count >= CROWD_THRESHOLD

        # 🚀 1. بث الـ WebSocket الفوري للـ Dashboard
        payload = {
            "camera_id": camera_id,
            "person_count": person_count,
            "is_crowded": is_crowded,
            "heatmap_data": heatmap_points
        }

        try:
            await manager.broadcast(payload)
        except Exception as e:
            print(f"⚠️ خطأ أثناء بث الـ WebSocket: {e}")

        # 💾 2. الحفظ الدوري في قاعدة البيانات باستخدام الموديل الصحيح (CameraAnalytics)
        current_time = time.time()
        if current_time - last_save_time >= 5:
            try:
                new_log = models.CameraAnalytics(
                    camera_id=camera_id,
                    person_count=person_count,
                    is_crowded=is_crowded,
                    heatmap_data=heatmap_points # حفظنا نقاط الهيت ماب كمان بالمرة في الـ JSON column المخصص ليها
                )
                db.add(new_log)
                await db.commit()
                last_save_time = current_time
                print(f"💾 [Database Save] تم حفظ لقطة إحصائية: {person_count} أشخاص")
            except Exception as e:
                await db.rollback()
                print(f"⚠️ خطأ أثناء حفظ الإحصائيات: {e}")

        await asyncio.sleep(0.01)

    cap.release()
    cv2.destroyAllWindows()