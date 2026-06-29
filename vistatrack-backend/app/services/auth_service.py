import os
import hashlib
from datetime import datetime, timedelta
from jose import jwt
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "super_secret_key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

# Standard FastAPI scheme to locate the token in headers
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


class AuthService:

    # 1. Password Hashing using SHA-256
    @staticmethod
    def hash_password(password: str) -> str:
        salted_password = password + SECRET_KEY
        return hashlib.sha256(salted_password.encode("utf-8")).hexdigest()

    # 2. Verify incoming password against database hash
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return AuthService.hash_password(plain_password) == hashed_password

    # 3. Create Access Token (JWT)
    @staticmethod
    def create_access_token(data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    # 4. Extract and validate current user from JWT token (The missing method)
    @staticmethod
    async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username: str = payload.get("sub")
            company_id: int = payload.get("company_id")
            role: str = payload.get("role")

            if username is None or company_id is None:
                raise credentials_exception

            return {"username": username, "company_id": company_id, "role": role}
        except Exception:
            raise credentials_exception