from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from watchfiles import awatch

from app.database.session import get_db
from app.schemas import core as schemas
from app.services.company_service import CompanyService

router = APIRouter(
    prefix="/companies",
    tags=["Companies"]
)
@router.post("/", response_model=schemas.CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_new_company(company: schemas.CompanyCreate, db: AsyncSession = Depends(get_db)):
    return await CompanyService.create_company(db, company)

@router.get("/", response_model=list[schemas.CompanyResponse])
async  def read_all_companies(db: AsyncSession = Depends(get_db)):
    return await CompanyService.get_all_companies(db)

@router.get("/{company_id", response_model=schemas.CompanyResponse)
async def read_company(company_id: int, db: AsyncSession = Depends(get_db)):
    db_company = await CompanyService.get_company(db, company_id)
    if not db_company:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    return db_company