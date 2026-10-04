"""
MySQL connection pool — imported by all model files.
"""
import mysql.connector
from mysql.connector import pooling, Error
import sys
import os

# Make sure config is importable when running from backend/
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from config import Config

try:
    _pool = pooling.MySQLConnectionPool(
        pool_name="rechargex_pool",
        pool_size=5,
        pool_reset_session=True,
        host=Config.MYSQL_HOST,
        port=Config.MYSQL_PORT,
        user=Config.MYSQL_USER,
        password=Config.MYSQL_PASSWORD,
        database=Config.MYSQL_DB,
        autocommit=False,
    )
    print(f"[DB] Connection pool created → {Config.MYSQL_HOST}:{Config.MYSQL_PORT}/{Config.MYSQL_DB}")
except Error as e:
    print(f"[DB] FATAL: Could not create connection pool — {e}")
    _pool = None


def get_connection():
    """Return a pooled MySQL connection.  Always close() after use."""
    if _pool is None:
        raise RuntimeError("Database connection pool is unavailable. Check MySQL config.")
    return _pool.get_connection()
