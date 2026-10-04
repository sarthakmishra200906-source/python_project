"""
Plan routes — /api/plans  &  /api/plans/<category>
"""
from flask import Blueprint, jsonify
from models.plan_model import get_all_plans, get_plans_by_category, get_plan_by_id

plan_bp = Blueprint("plans", __name__)

VALID_CATEGORIES = {"Popular", "Data", "Unlimited", "Topup", "Network"}


def _serialize(plan: dict) -> dict:
    if not plan:
        return plan
    plan["price"]      = float(plan["price"])
    plan["data_gb"]    = float(plan.get("data_gb") or 0)
    plan["is_popular"] = bool(plan.get("is_popular"))
    if plan.get("created_at"):
        plan["created_at"] = plan["created_at"].isoformat()
    return plan


@plan_bp.route("/plans", methods=["GET"])
def list_plans():
    return jsonify([_serialize(p) for p in get_all_plans()]), 200


@plan_bp.route("/plans/category/<category>", methods=["GET"])
def list_by_category(category):
    if category not in VALID_CATEGORIES:
        return jsonify({"error": f"Invalid category. Choose from {list(VALID_CATEGORIES)}"}), 400
    return jsonify([_serialize(p) for p in get_plans_by_category(category)]), 200


@plan_bp.route("/plans/<int:plan_id>", methods=["GET"])
def get_plan(plan_id):
    plan = get_plan_by_id(plan_id)
    if not plan:
        return jsonify({"error": "Plan not found."}), 404
    return jsonify(_serialize(plan)), 200
