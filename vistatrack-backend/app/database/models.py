from http.client import IncompleteRead
from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .session import Base


# 1. Companies Table (Multi-tenancy)
class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    users = relationship("User", back_populates="company", cascade="all, delete-orphan")
    cameras = relationship("Camera", back_populates="company", cascade="all, delete-orphan")


# 2. Users Table
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="admin")

    # Relationships
    company = relationship("Company", back_populates="users")


# 3. Cameras Table
class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    zone_name = Column(String, nullable=False)
    rtsp_url = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    # Relationships
    company = relationship("Company", back_populates="cameras")
    logs = relationship("AnalyticsLog", back_populates="camera", cascade="all, delete-orphan")
    # 👇 ضيفنا السطر ده هنا علشان نربط العلاقة العكسية مع جدول الـ Analytics الجديد بنظافة
    analytics = relationship("CameraAnalytics", back_populates="camera", cascade="all, delete-orphan")


# 4. Analytics Table (القديم اللي شغالين بيه)
class AnalyticsLog(Base):
    __tablename__ = "analytics_logs"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    current_capacity = Column(Integer, default=0)
    total_out = Column(Integer, default=0)
    crowd_density_score = Column(Float, default=0.0)

    # Relationships
    camera = relationship("Camera", back_populates="logs")


# 5. New Camera Analytics Table (بتاع الزحام والـ Heatmap للـ Sprint دي)
class CameraAnalytics(Base):
    __tablename__ = "camera_analytics"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id", ondelete="CASCADE"), nullable=False)

    person_count = Column(Integer, default=0)
    is_crowded = Column(Boolean, default=False)
    heatmap_data = Column(JSON, nullable=True)

    # 🛠️ التعديل هنا: شيلنا الـ .datetime الزيادة
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    camera = relationship("Camera", back_populates="analytics")