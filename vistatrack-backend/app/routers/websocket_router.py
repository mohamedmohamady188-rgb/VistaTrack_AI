from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
import json

router = APIRouter(tags=["WebSockets"])

# 1. كلاس إدارة الاتصالات (Connection Manager)
class ConnectionManager:
    def __init__(self):
        # قائمة لتخزين كل المتصفحات (العملاء) المتصلة حالياً
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"🔌 متصفح جديد اتصل بالـ WebSocket. إجمالي المتصلين: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"❌ متصفح قفل الاتصال. المتبقي: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        """
        دالة سحرية تاخد البيانات وتذيعها لكل المتصفحات المفتوحة في نفس اللحظة
        """
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                # لو فيه اتصال معلق أو باظ بنظفه
                print(f"⚠️ فشل الإرسال لأحد المتصلين، جاري إزالته: {e}")
                self.active_connections.remove(connection)

# عمل Instance موحد ومشارك على مستوى السيستم بالكامل
manager = ConnectionManager()

# 2. الـ Endpoint اللي الفرونت إند هيتصل بيه
@router.websocket("/ws/analytics/")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    async def disconnect(self, websocket: WebSocket):
        try:
            self.active_connections.remove(websocket)
        except ValueError:
            pass  # لو مش موجود في اللستة أصلاً عديها بسلام وماتطلعش خطأ
