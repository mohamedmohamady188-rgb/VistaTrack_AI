from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database.session import get_db
from app.database import models
from app.schemas import auth as auth_schemas
from app.services.auth_service import AuthService
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# 1. API التسجيل (Sign Up / Create User)
@router.post("/signup", response_model=auth_schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: auth_schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    # التأكد إن الـ username مش متكرر في الداتا بيز
    result = await db.execute(select(models.User).filter_by(username=user_data.username))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # تشفير الباسورد قبل الحفظ
    hashed_pwd = AuthService.hash_password(user_data.password)

    # إنشاء كائن اليوزر الجديد
    new_user = models.User(
        username=user_data.username,
        password_hash=hashed_pwd,
        role=user_data.role,
        company_id=user_data.company_id
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


# 2. API تسجيل الدخول وتوليد التوكن (Login)
@router.post("/login", response_model=auth_schemas.Token)
async def login(
    login_data: OAuth2PasswordRequestForm = Depends(),  # <--- غيرنا دي عشان تستقبل الفورم المباشر
    db: AsyncSession = Depends(get_db)
):
    # البحث عن اليوزر في الداتا بيز (الـ Form data بتبعته في خانة username)
    result = await db.execute(select(models.User).filter_by(username=login_data.username))
    user = result.scalars().first()

    # التأكد من وجود اليوزر وصحة الباسورد المشفر
    if not user or not AuthService.verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    # تجهيز البيانات اللي جوه التوكن (الـ Payload)
    token_payload = {
        "sub": user.username,
        "company_id": user.company_id,
        "role": user.role
    }

    # توليد الـ Access Token
    access_token = AuthService.create_access_token(data=token_payload)
    return {"access_token": access_token, "token_type": "bearer"}