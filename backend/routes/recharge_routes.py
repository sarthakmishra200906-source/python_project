"""
Recharge & dashboard routes
  GET  /api/dashboard/<user_id>   — account info + chart data
  POST /api/recharge              — mock payment & update DB
  GET  /api/history/<user_id>     — transaction history
"""
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from models.user_model       import get_user_by_id, verify_payment_pin
from models.plan_model       import get_plan_by_id
from models.transaction_model import (
    apply_recharge,
    get_user_transactions,
    get_monthly_spending,
)

recharge_bp = Blueprint("recharge", __name__)


def _request_user_id():
    try:
        return int(request.headers.get("X-User-Id", "0"))
    except ValueError:
        return 0


def _owns_user(user_id):
    return _request_user_id() == user_id


# ── serialisers ──────────────────────────────────────────────────────────────

def _ser_user(u: dict) -> dict:
    if not u:
        return u
    u["data_balance"] = float(u.get("data_balance") or 0)
    u["data_total"]   = float(u.get("data_total")   or 0)
    if u.get("created_at"):
        u["created_at"] = u["created_at"].isoformat()
    return u


def _ser_tx(t: dict) -> dict:
    if not t:
        return t
    t["amount"] = float(t["amount"])
    if t.get("recharged_at"):
        t["recharged_at"] = t["recharged_at"].isoformat()
    return t


def _ser_monthly(m: dict) -> dict:
    m["total_amount"] = float(m["total_amount"])
    return m


# ── routes ───────────────────────────────────────────────────────────────────

@recharge_bp.route("/dashboard/<int:user_id>", methods=["GET"])
def dashboard(user_id):
    if not _owns_user(user_id):
        return jsonify({"error": "You can only access your own dashboard."}), 403
    user = get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    monthly = get_monthly_spending(user_id)

    return jsonify({
        "user":             _ser_user(user),
        "monthly_spending": [_ser_monthly(m) for m in monthly],
    }), 200


@recharge_bp.route("/recharge", methods=["POST"])
def process_recharge():
    data    = request.get_json() or {}
    user_id = data.get("user_id")
    plan_id = data.get("plan_id")
    payment_pin = str(data.get("payment_pin") or "").strip()

    if not isinstance(user_id, int) or user_id <= 0 or not isinstance(plan_id, int) or plan_id <= 0:
        return jsonify({"error": "user_id and plan_id are required."}), 400
    if not _owns_user(user_id):
        return jsonify({"error": "You can only recharge your own account."}), 403

    if not payment_pin.isdigit() or len(payment_pin) != 6:
        return jsonify({"error": "Enter your six-digit payment PIN."}), 400
    if not verify_payment_pin(user_id, payment_pin):
        return jsonify({"error": "Incorrect payment PIN."}), 401

    user = get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    plan = get_plan_by_id(plan_id)
    if not plan:
        return jsonify({"error": "Plan not found."}), 404

    # Generate unique transaction ID
    txn_id = f"RX{datetime.now().strftime('%Y%m%d%H%M%S')}{str(uuid.uuid4())[:6].upper()}"

    data_gb  = float(plan.get("data_gb") or 0)
    validity = int(plan.get("validity_days") or 0)
    amount   = float(plan["price"])

    apply_recharge(
        user_id=user_id,
        plan_id=plan_id,
        plan_name=plan["name"],
        data_balance=data_gb,
        data_total=data_gb,
        validity_days=validity,
        network_type=plan.get("network_type") or "4G",
        amount=amount,
        transaction_id=txn_id,
    )

    updated_user = _ser_user(get_user_by_id(user_id))

    return jsonify({
        "message":        "Recharge successful!",
        "transaction_id": txn_id,
        "plan": {
            "name":         plan["name"],
            "data":         plan["data"],
            "validity_days":plan["validity_days"],
            "network_type": plan.get("network_type") or "4G",
            "price":        amount,
        },
        "user": updated_user,
    }), 200


@recharge_bp.route("/history/<int:user_id>", methods=["GET"])
def history(user_id):
    if not _owns_user(user_id):
        return jsonify({"error": "You can only access your own history."}), 403
    txns = get_user_transactions(user_id)
    return jsonify([_ser_tx(t) for t in txns]), 200
