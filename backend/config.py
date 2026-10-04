import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # ── MySQL ──────────────────────────────────────────────────
    MYSQL_HOST     = os.getenv("MYSQL_HOST",     "localhost")
    MYSQL_PORT     = int(os.getenv("MYSQL_PORT", "3306"))
    MYSQL_USER     = os.getenv("MYSQL_USER",     "root")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "root")
    MYSQL_DB       = os.getenv("MYSQL_DB",       "recharge_db")

    # ── Flask ──────────────────────────────────────────────────
    SECRET_KEY     = os.getenv("SECRET_KEY", "rechargex_secret_2024_!@#$")
    DEBUG          = os.getenv("FLASK_DEBUG", "True") == "True"

    # ── CORS origins ───────────────────────────────────────────
    ALLOWED_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
