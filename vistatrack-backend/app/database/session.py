from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

# 1. Database URL (SQLite Async)
DATABASE_URL = "sqlite+aiosqlite:///./vistatrack.db"

# 2. Create Async Engine
engine = create_async_engine(DATABASE_URL, echo=True)

# 3. Create Session Factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# 4. Base Class for Models
Base = declarative_base()

# 5. Database Initialization (Added to create tables on startup)
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created successfully")

# 6. Dependency for FastAPI Routers
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()