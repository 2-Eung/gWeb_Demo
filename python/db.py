import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from pgvector.sqlalchemy import Vector
from dotenv import load_dotenv

# Load root .env file relative to this file
dotenv_path = os.path.join(os.path.dirname(__file__), "..", ".env")
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
else:
    load_dotenv()

# Database Config from Environment
DB_HOST = os.environ["DATABASE_HOST"]
DB_PORT = os.environ["DATABASE_PORT"]
DB_NAME = os.environ["DATABASE_NAME"]
DB_USER = os.environ["DATABASE_USERNAME"]
DB_PASS = os.environ["DATABASE_PASSWORD"]

# Construct URL if not provided directly
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> bool:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return True
