"""
Plan model — DB operations for the `plans` table.
"""
from db.connection import get_connection


def _safe_close(cursor, conn):
    try:
        cursor.close()
    except Exception:
        pass
    try:
        conn.close()
    except Exception:
        pass


def get_all_plans():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM plans ORDER BY category, price")
        return cursor.fetchall()
    finally:
        _safe_close(cursor, conn)


def get_plans_by_category(category: str):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT * FROM plans WHERE category = %s ORDER BY price",
            (category,),
        )
        return cursor.fetchall()
    finally:
        _safe_close(cursor, conn)


def get_plan_by_id(plan_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM plans WHERE id = %s", (plan_id,))
        return cursor.fetchone()
    finally:
        _safe_close(cursor, conn)
