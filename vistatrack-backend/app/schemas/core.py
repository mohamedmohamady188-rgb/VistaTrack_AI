from pydantic import BaseModel, ConfigDict
from typing import Optional

# ==================== COMPANY SCHEMAS ====================

class CompanyBase(BaseModel):
    name: str


class CompanyCreate(CompanyBase):
    pass  # No extra data needed when creating a company except the name


class CompanyResponse(CompanyBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# ==================== CAMERA SCHEMAS ====================

class CameraBase(BaseModel):
    zone_name: str
    rtsp_url: str  # Unified to match database models and services
    is_active: Optional[bool] = True


class CameraCreate(CameraBase):
    pass  # company_id is extracted automatically from JWT token for security


class CameraResponse(CameraBase):
    id: int
    company_id: Optional[int] = None

    # Modern Pydantic v2 configuration for SQLAlchemy ORM compatibility
    model_config = ConfigDict(from_attributes=True)