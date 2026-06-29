from pydantic import BaseModel, ConfigDict

class UserBase(BaseModel):
    username: str
    role: str = "admin"
class UserCreate(UserBase):
    password: str
    company_id: int
class UserResponse(UserBase):
    id: int
    company_id: int

    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: str | None = None
    company_id: int | None = None

    