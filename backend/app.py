"""
RechargeX — Flask application entry point
Run: python app.py
"""
from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from routes.auth_routes     import auth_bp
from routes.plan_routes     import plan_bp
from routes.recharge_routes import recharge_bp
from routes.employee_routes import employee_bp
from routes.chat_routes import chat_bp


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["SECRET_KEY"] = Config.SECRET_KEY

    # ── CORS — allow Vite dev server ────────────────────────────
    CORS(
        app,
        origins=Config.ALLOWED_ORIGINS,
        supports_credentials=True,
        allow_headers=["Content-Type", "X-User-Id"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )

    # ── Blueprints ───────────────────────────────────────────────
    app.register_blueprint(auth_bp,     url_prefix="/api/auth")
    app.register_blueprint(plan_bp,     url_prefix="/api")
    app.register_blueprint(recharge_bp, url_prefix="/api")
    app.register_blueprint(employee_bp, url_prefix="/api")
    app.register_blueprint(chat_bp, url_prefix="/api")

    # ── Health check ─────────────────────────────────────────────
    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok", "app": "RechargeX API v1.0"}), 200

    # ── 404 handler ──────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Endpoint not found."}), 404

    # ── 500 handler ──────────────────────────────────────────────
    @app.errorhandler(500)
    def internal(e):
        return jsonify({"error": "Internal server error."}), 500

    @app.errorhandler(RuntimeError)
    def runtime_error(e):
        if "Database connection pool is unavailable" in str(e):
            return jsonify({
                "error": "Database unavailable. Check MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD and MYSQL_DB."
            }), 503
        return jsonify({"error": "Service temporarily unavailable."}), 503

    return app


if __name__ == "__main__":
    application = create_app()
    print("=" * 50)
    print(" RechargeX Flask API — http://localhost:5000")
    print("=" * 50)
    application.run(debug=Config.DEBUG, host="0.0.0.0", port=5000)
