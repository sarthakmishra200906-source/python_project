"""
Auth routes — signup, login, and simulated phone OTP verification.
"""
import random
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from models.user_model import (
    hash_password,
    verify_password,
    create_user,
    get_user_by_phone,
    set_payment_pin,
    count_customers,
    delete_user,
)

auth_bp = Blueprint("auth", __name__)
otp_store = {}
verified_phones = set()
OTP_TTL_SECONDS = 300
DEMO_GOOGLE_PHONE = "9999999998"
ADMIN_LOGIN_ID = "sarthak"
ADMIN_LOGIN_PASSWORD = "123456"
MAX_CUSTOMERS = 2000


def _serialize_user(user: dict) -> dict:
    """Strip sensitive fields and convert non-JSON-serializable types."""
    user.pop("password_hash", None)
    if user.get("created_at"):
        user["created_at"] = user["created_at"].isoformat()
    user["data_balance"] = float(user.get("data_balance") or 0)
    user["data_total"]   = float(user.get("data_total")   or 0)
    return user


def _phone_from_request():
    data = request.get_json(silent=True) or {}
    phone = (data.get("phone") or "").strip()
    if not phone.isdigit() or len(phone) != 10:
        return None
    return phone


@auth_bp.route("/send-otp", methods=["POST"])
def send_otp():
    phone = _phone_from_request()
    if not phone:
        return jsonify({"error": "Enter a valid 10-digit phone number."}), 400

    otp = str(random.randint(100000, 999999))
    otp_store[phone] = {
        "code": otp,
        "expires_at": datetime.now() + timedelta(seconds=OTP_TTL_SECONDS),
        "attempts": 0,
    }
    print(f"\n--- [DEMO OTP] OTP for {phone}: {otp} (valid for 5 minutes) ---\n")
    return jsonify({"message": "OTP generated for demo verification.", "demo_otp": otp}), 200


@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    phone = _phone_from_request()
    data = request.get_json(silent=True) or {}
    entered_otp = str(data.get("otp") or "").strip()
    record = otp_store.get(phone) if phone else None

    if not record or datetime.now() > record["expires_at"]:
        otp_store.pop(phone, None)
        return jsonify({"error": "OTP expired. Request a new code."}), 400

    record["attempts"] += 1
    if record["attempts"] > 5:
        otp_store.pop(phone, None)
        return jsonify({"error": "Too many attempts. Request a new OTP."}), 429

    if record["code"] != entered_otp:
        return jsonify({"error": "Invalid OTP."}), 400

    otp_store.pop(phone, None)
    verified_phones.add(phone)
    return jsonify({"message": "Phone verified successfully."}), 200


@auth_bp.route("/google-demo", methods=["POST"])
def google_demo_login():
    """Create/reuse a local demo identity for classroom presentations."""
    user = get_user_by_phone(DEMO_GOOGLE_PHONE)
    if not user:
        user = create_user(
            "Google Demo User",
            DEMO_GOOGLE_PHONE,
            "demo.google@rechargex.local",
            hash_password("demo-google-account"),
        )
    return jsonify({"message": "Demo Google login successful.", "user": _serialize_user(user)}), 200


@auth_bp.route("/admin-demo", methods=["POST"])
def admin_demo_login():
    """Temporary classroom shortcut until real admin authentication is added."""
    user = get_user_by_phone("9000000000")
    if not user or user.get("role") not in {"admin", "employee"}:
        return jsonify({"error": "Demo employee account is not available. Run seed_demo_data.py."}), 503
    return jsonify({"message": "Demo employee access granted.", "user": _serialize_user(user)}), 200


@auth_bp.route("/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json(silent=True) or {}
    login_id = str(data.get("login_id") or "").strip()
    password = str(data.get("password") or "")
    if login_id != ADMIN_LOGIN_ID or password != ADMIN_LOGIN_PASSWORD:
        return jsonify({"error": "Invalid admin ID or password."}), 401
    user = get_user_by_phone("9000000000")
    if not user:
        return jsonify({"error": "Admin account is not seeded."}), 503
    return jsonify({"message": "Admin login successful.", "user": _serialize_user(user)}), 200


@auth_bp.route("/payment-pin/reset", methods=["POST"])
def reset_payment_pin():
    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id")
    phone = str(data.get("phone") or "").strip()
    password = str(data.get("password") or "")
    new_pin = str(data.get("new_pin") or "").strip()
    try:
        request_user_id = int(request.headers.get("X-User-Id", "0"))
    except ValueError:
        request_user_id = 0
    account = get_user_by_phone(phone)
    if request_user_id != user_id or not account or account.get("id") != user_id:
        return jsonify({"error": "You can only reset your own payment PIN."}), 403
    if not verify_password(password, account.get("password_hash", "")):
        return jsonify({"error": "Login verification failed."}), 401
    if not new_pin.isdigit() or len(new_pin) != 6:
        return jsonify({"error": "New payment PIN must contain six digits."}), 400
    set_payment_pin(user_id, new_pin)
    return jsonify({"message": "Payment PIN reset successfully."}), 200


@auth_bp.route("/signup", methods=["POST"])
def signup():
    data     = request.get_json() or {}
    name     = (data.get("name",     "") or "").strip()
    phone    = (data.get("phone",    "") or "").strip()
    email    = (data.get("email",    "") or "").strip() or None
    password = (data.get("password", "") or "").strip()

    if not all([name, phone, password]):
        return jsonify({"error": "Name, phone and password are required."}), 400

    if len(phone) < 10 or not phone.isdigit():
        return jsonify({"error": "Enter a valid 10-digit phone number."}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    if phone not in verified_phones:
        return jsonify({"error": "Verify your phone number with OTP before signing up."}), 400

    if count_customers() >= MAX_CUSTOMERS:
        return jsonify({"error": "Customer capacity reached. New signups are temporarily closed."}), 429

    if get_user_by_phone(phone):
        return jsonify({"error": "This phone number is already registered."}), 409

    try:
        pwd_hash = hash_password(password)
        user     = create_user(name, phone, email, pwd_hash)
        verified_phones.discard(phone)
        return jsonify({"message": "Account created successfully!", "user": _serialize_user(user)}), 201
    except Exception as e:
        print(f"[signup] Error: {e}")
        return jsonify({"error": "Failed to create account. Please try again."}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    data     = request.get_json() or {}
    phone    = (data.get("phone",    "") or "").strip()
    password = (data.get("password", "") or "").strip()

    if not all([phone, password]):
        return jsonify({"error": "Phone and password are required."}), 400

    user = get_user_by_phone(phone)
    if not user or not verify_password(password, user.get("password_hash", "")):
        return jsonify({"error": "Invalid phone number or password."}), 401

    return jsonify({"message": "Login successful!", "user": _serialize_user(user)}), 200


@auth_bp.route("/payment-pin", methods=["POST"])
def payment_pin():
    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id")
    pin = str(data.get("pin") or "").strip()
    if not isinstance(user_id, int) or user_id <= 0 or not pin.isdigit() or len(pin) != 6:
        return jsonify({"error": "A valid user ID and six-digit PIN are required."}), 400
    try:
        request_user_id = int(request.headers.get("X-User-Id", "0"))
    except ValueError:
        request_user_id = 0
    if request_user_id != user_id:
        return jsonify({"error": "You can only update your own payment PIN."}), 403
    set_payment_pin(user_id, pin)
    return jsonify({"message": "Payment PIN saved successfully."}), 200


@auth_bp.route("/account", methods=["DELETE"])
def delete_account():
    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id")
    password = str(data.get("password") or "")
    try:
        request_user_id = int(request.headers.get("X-User-Id", "0"))
    except ValueError:
        request_user_id = 0
    account = get_user_by_phone(str(data.get("phone") or "").strip())
    if request_user_id != user_id or not account or account.get("id") != user_id:
        return jsonify({"error": "You can only delete your own account."}), 403
    if not verify_password(password, account.get("password_hash", "")):
        return jsonify({"error": "Password verification failed."}), 401
    delete_user(user_id)
    return jsonify({"message": "Account and associated recharge data deleted."}), 200
