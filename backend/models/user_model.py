"""
User model — DB operations for the `users` table.
"""
import bcrypt
from db.connection import get_connection


# ── helpers ────────────────────────────────────────────────────────────────

def _safe_close(cursor, conn):
    try:
        cursor.close()
    except Exception:
        pass
    try:
        conn.close()
    except Exception:
        pass


# ── public API ─────────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def set_payment_pin(user_id: int, pin: str):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE users SET payment_pin_hash = %s WHERE id = %s",
            (hash_password(pin), user_id),
        )
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        _safe_close(cursor, conn)


def verify_payment_pin(user_id: int, pin: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT payment_pin_hash FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        return bool(user and user.get("payment_pin_hash") and verify_password(pin, user["payment_pin_hash"]))
    finally:
        _safe_close(cursor, conn)


def create_user(name: str, phone: str, email, password_hash: str):
    """Insert a new user and return the created row (without password_hash)."""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "INSERT INTO users (name, phone, email, password_hash) VALUES (%s, %s, %s, %s)",
            (name, phone, email, password_hash),
        )
        conn.commit()
        new_id = cursor.lastrowid
    except Exception:
        conn.rollback()
        raise
    finally:
        _safe_close(cursor, conn)
    return get_user_by_id(new_id)


def get_user_by_phone(phone: str):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM users WHERE phone = %s", (phone,))
        return cursor.fetchone()
    finally:
        _safe_close(cursor, conn)


def count_customers() -> int:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'customer'")
        return int(cursor.fetchone()[0])
    finally:
        _safe_close(cursor, conn)


def delete_user(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM users WHERE id = %s AND role = 'customer'", (user_id,))
        if cursor.rowcount != 1:
            raise ValueError("Customer account not found.")
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        _safe_close(cursor, conn)


def get_user_by_id(user_id: int):
    """Return user row without password_hash."""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """SELECT id, name, phone, email,
                      data_balance, data_total, validity_days,
                      plan_name, network_type, payment_pin_hash IS NOT NULL AS has_payment_pin, role, created_at
               FROM users WHERE id = %s""",
            (user_id,),
        )
        return cursor.fetchone()
    finally:
        _safe_close(cursor, conn)


def update_user_plan(user_id: int, plan_name: str,
                     data_balance: float, data_total: float,
                     validity_days: int, network_type: str = "4G"):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """UPDATE users
               SET plan_name = %s, data_balance = %s, data_total = %s,
                     validity_days = %s, network_type = %s
               WHERE id = %s""",
                 (plan_name, data_balance, data_total, validity_days, network_type, user_id),
        )
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        _safe_close(cursor, conn)
