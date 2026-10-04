"""Employee analytics endpoints for the classroom administration view."""
from flask import Blueprint, jsonify, request
from db.connection import get_connection
from services.churn_service import score_customers

employee_bp = Blueprint("employee", __name__)


def _close(cursor, conn):
    try:
        cursor.close()
    finally:
        conn.close()


@employee_bp.route("/employee/analytics", methods=["GET"])
def analytics():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        try:
            user_id = int(request.headers.get("X-User-Id", "0"))
        except ValueError:
            user_id = 0
        cursor.execute("SELECT role FROM users WHERE id = %s", (user_id,))
        requester = cursor.fetchone()
        if not requester or requester["role"] not in {"admin", "employee"}:
            return jsonify({"error": "Employee access required."}), 403

        cursor.execute("SELECT COUNT(*) AS total_customers FROM users WHERE role = 'customer'")
        total_customers = cursor.fetchone()["total_customers"]
        cursor.execute("""SELECT COUNT(*) AS total_recharges, COALESCE(SUM(amount), 0) AS total_revenue
                        FROM transactions WHERE status = 'Success'""")
        summary = cursor.fetchone()
        cursor.execute("""SELECT p.network_type AS network, COUNT(t.id) AS recharges,
                        COALESCE(SUM(t.amount), 0) AS revenue
                        FROM plans p LEFT JOIN transactions t ON t.plan_id = p.id AND t.status = 'Success'
                        GROUP BY p.network_type ORDER BY revenue DESC""")
        network_mix = cursor.fetchall()
        cursor.execute("""SELECT p.name AS plan_name, p.network_type AS network,
                        COUNT(t.id) AS recharges, COALESCE(SUM(t.amount), 0) AS revenue
                        FROM plans p LEFT JOIN transactions t ON t.plan_id = p.id AND t.status = 'Success'
                        GROUP BY p.id, p.name, p.network_type ORDER BY recharges DESC, revenue DESC LIMIT 8""")
        top_plans = cursor.fetchall()
        cursor.execute("""SELECT DATE_FORMAT(recharged_at, '%%b %%Y') AS month,
                        COALESCE(SUM(amount), 0) AS revenue, COUNT(*) AS recharges
                        FROM transactions WHERE status = 'Success'
                        GROUP BY DATE_FORMAT(recharged_at, '%%Y-%%m'), DATE_FORMAT(recharged_at, '%%b %%Y')
                        ORDER BY MIN(recharged_at) DESC LIMIT 6""")
        trend = cursor.fetchall()[::-1]
        cursor.execute("""SELECT u.id, u.name, u.phone, u.plan_name, u.network_type,
                u.validity_days, u.created_at, COUNT(t.id) AS transaction_count,
                COALESCE(AVG(t.amount), 50) AS monthly_charges
                FROM users u LEFT JOIN transactions t ON t.user_id = u.id AND t.status = 'Success'
                WHERE u.role = 'customer'
                GROUP BY u.id, u.name, u.phone, u.plan_name, u.network_type,
                     u.validity_days, u.created_at""")
        churn = score_customers(cursor.fetchall())
        return jsonify({
            "summary": {"total_customers": total_customers, **summary},
            "network_mix": network_mix,
            "top_plans": top_plans,
            "trend": trend,
            "churn": churn,
        }), 200
    finally:
        _close(cursor, conn)