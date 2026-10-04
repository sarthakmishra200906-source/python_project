"""Local Ollama support assistant with a small RechargeX knowledge base fallback."""
import json
import os
from urllib.error import URLError
from urllib.request import Request, urlopen

from flask import Blueprint, jsonify, request

chat_bp = Blueprint("chat", __name__)

KNOWLEDGE = [
    ("plans", "Open /plans to compare Popular, Data, Unlimited, Topup, Network, 2G, 3G, 4G, AirFiber, and Fiber plans."),
    ("payment", "Payments are simulated. Set a six-digit PIN on /dashboard, choose a plan, enter the PIN, scan the generated QR code, and confirm. No real money is charged."),
    ("pin", "The payment PIN is separate from the login password and is set in the Payment Security section on the dashboard."),
    ("otp", "Signup uses a simulated OTP. Click Send OTP and read the six-digit code in the Flask terminal. It expires after five minutes."),
    ("dashboard", "The dashboard shows active plan, network, balance, validity, spending, recent transactions, and payment PIN settings."),
    ("history", "Open /history to see the signed-in customer's own recharge records."),
    ("login", "Signup and login are available at /login. Customer accounts are stored in MySQL and the browser remembers the active session."),
]


def _fallback(message):
    text = message.lower()
    for keyword, answer in KNOWLEDGE:
        if keyword in text:
            return answer
    return "I can help with plans, OTP signup, payment PINs, QR demo payments, dashboard usage, and transaction history."


def _context():
    return "\n".join(f"- {keyword}: {answer}" for keyword, answer in KNOWLEDGE)


@chat_bp.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    message = str(data.get("message") or "").strip()
    history = data.get("history") or []
    if not message:
        return jsonify({"error": "Message is required."}), 400

    model = os.getenv("OLLAMA_MODEL", "qwen3.5:latest")
    endpoint = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434/api/chat")
    prompt = (
        "You are RechargeX Assistant. Answer briefly and helpfully using only the product context below. "
        "Never claim to process real payments, send real OTPs, or access private customer data. "
        "When navigation is useful, mention the route plainly.\n\n"
        f"PRODUCT CONTEXT:\n{_context()}\n\nUSER QUESTION:\n{message}"
    )
    payload = {"model": model, "stream": False, "messages": [{"role": "user", "content": prompt}]}
    try:
        request_body = json.dumps(payload).encode("utf-8")
        ollama_request = Request(endpoint, data=request_body, headers={"Content-Type": "application/json"})
        with urlopen(ollama_request, timeout=45) as response:
            result = json.loads(response.read().decode("utf-8"))
        answer = result.get("message", {}).get("content", "").strip()
        if answer:
            return jsonify({"answer": answer, "source": "ollama", "model": model}), 200
    except (URLError, TimeoutError, ValueError, OSError):
        pass

    return jsonify({"answer": _fallback(message), "source": "local-knowledge"}), 200
