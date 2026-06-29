from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.testing import db

from app.database import models
from app.schemas import core as schemas


class CompanyService:
    @staticmethod
    async def create_company(db: AsyncSession, company: schemas.CompanyCreate) -> models.Company:
        db_company = models.Company(name=company.name)
        db.add(db_company)
        await db.commit()
        await db.refresh(db_company)
        return db_company

    @staticmethod
    async def get_company(db: AsyncSession, company_id: int) -> models.Company | None:
        result = await db.execute(select(models.Company).filter_by(id=company_id))
        return result.scalars().first()

    @staticmethod
    async def get_all_companies(dab: AsyncSession) -> list[models.Company]:
        result = await db.execute(select(models.Company))
        return list(result.scalars().all())
