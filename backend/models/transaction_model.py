"""
Transaction model — DB operations for the `transactions` table.
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


def create_transaction(user_id: int, plan_id: int, amount: float,
                       transaction_id: str, status: str = "Success"):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO transactions
               (user_id, plan_id, amount, transaction_id, status)
               VALUES (%s, %s, %s, %s, %s)""",
            (user_id, plan_id, amount, transaction_id, status),
        )
        conn.commit()
        return cursor.lastrowid
    except Exception:
        conn.rollback()
        raise
    finally:
        _safe_close(cursor, conn)


def apply_recharge(user_id: int, plan_id: int, plan_name: str,
                   data_balance: float, data_total: float,
                   validity_days: int, network_type: str, amount: float,
                   transaction_id: str):
    """Update the account and receipt together so a recharge is atomic."""
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
        if cursor.rowcount != 1:
            raise ValueError("User could not be updated.")

        cursor.execute(
            """INSERT INTO transactions
               (user_id, plan_id, amount, transaction_id, status)
               VALUES (%s, %s, %s, %s, 'Success')""",
            (user_id, plan_id, amount, transaction_id),
        )
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        _safe_close(cursor, conn)


def get_user_transactions(user_id: int, limit: int = 20):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """SELECT t.id, t.transaction_id, t.amount, t.status, t.recharged_at,
                      p.name AS plan_name, p.data, p.validity_days AS plan_validity,
                      p.category
               FROM transactions t
               JOIN plans p ON t.plan_id = p.id
               WHERE t.user_id = %s
               ORDER BY t.recharged_at DESC
               LIMIT %s""",
            (user_id, limit),
        )
        return cursor.fetchall()
    finally:
        _safe_close(cursor, conn)


def get_monthly_spending(user_id: int):
    """Return last 6 months of aggregated recharge spending — used for bar chart."""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """SELECT
                DATE_FORMAT(recharged_at, '%%b %%Y')  AS month_label,
                DATE_FORMAT(recharged_at, '%%Y-%%m')  AS month_key,
                SUM(amount)                            AS total_amount,
                COUNT(*)                               AS recharge_count
               FROM transactions
               WHERE user_id = %s
                 AND status = 'Success'
                 AND recharged_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
               GROUP BY month_key, month_label
               ORDER BY month_key ASC""",
            (user_id,),
        )
        return cursor.fetchall()
    finally:
        _safe_close(cursor, conn)
