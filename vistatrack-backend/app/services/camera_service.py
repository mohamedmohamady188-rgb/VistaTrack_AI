from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import models
from app.schemas import core as schemas

class CameraService:
    @staticmethod
    async def create_camera(db: AsyncSession, camera: schemas.CameraCreate, company_id: int) -> models.Camera:
        db_camera = models.Camera(
            company_id=company_id,
            zone_name=camera.zone_name,
            rtsp_url=camera.rtsp_url,
            is_active= camera.is_active
        )
        db.add(db_camera)
        await db.commit()
        await db.refresh(db_camera)
        return db_camera

    @staticmethod
    async def toggle_company_cameras(db: AsyncSession, company_id: int) -> list[models.Camera]:
        result = await db.execute(select(models.Camera).filter_by(company_id=company_id))
        return list(result.scalars().all())

    @staticmethod
    async def toggle_camera_status(db: AsyncSession, camera_id: int, company_id: int) -> models.Camera | None:
        result = await db.execute(select(models.Camera).filter_by(id=camera_id, company_id=company_id))
        db_camera = result.scalars().first()
        if db_camera:
            db_camera.is_active = not db_camera.is_active
            await db.commit()
            await db.refresh(db_camera)
        return db_camera