import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

# ── Local imports (P4's modules + P1's analyzer) ──────────────────────────────
from rule_engine import get_rule_flags       # P4
from predictor import get_ml_score           # P4       # P4
from analyzer import get_claude_explanation  # P1

app = Flask(__name__)
CORS(app)  # Allow all origins — tighten in prod with origins=[...]


# ── Helpers ───────────────────────────────────────────────────────────────────

def score_to_risk_level(score: int) -> str:
    """Convert 0–100 ML score to human-readable risk tier."""
    if score <= 30:
        return "Low"
    elif score <= 70:
        return "Medium"
    else:
        return "High"


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    """Quick liveness check — useful for hackathon demos."""
    return jsonify({"status": "ok"}), 200


@app.route("/analyze", methods=["POST"])
def analyze():
    """
    Main detection endpoint.

    Expects JSON body:  { "text": "<job description string>" }

    Returns:
    {
        "rule_flags": ["string"],
        "ml_score":   85,
        "risk_level": "High",
        "explanation": "string",
        "safety_tips": ["string"]
    }
    """
    # ── 1. Validate input ──────────────────────────────────────────────────────
    body = request.get_json(silent=True)
    if not body or "text" not in body:
        return jsonify({"error": "Request body must include a 'text' field."}), 400

    job_text = body["text"].strip()
    if not job_text:
        return jsonify({"error": "'text' field cannot be empty."}), 400

    # ── 2. Layer 1 — Rule Engine (P4) ─────────────────────────────────────────
    try:
        rule_flags = get_rule_flags(job_text)          # returns List[str]
    except Exception as e:
        app.logger.error(f"[Layer 1] Rule engine failed: {e}")
        return jsonify({"error": "Rule engine error.", "detail": str(e)}), 500

    # ── 3. Layer 2 — ML Predictor (P4) ────────────────────────────────────────
    try:
        ml_score = get_ml_score(job_text)         # returns int 0–100
    except Exception as e:
        app.logger.error(f"[Layer 2] Predictor failed: {e}")
        return jsonify({"error": "ML predictor error.", "detail": str(e)}), 500

    risk_level = score_to_risk_level(ml_score)

    # ── 4. Layer 3 — Claude Explanation (P1) ──────────────────────────────────
    try:
        claude_result = get_claude_explanation(job_text, rule_flags, ml_score)
        explanation  = claude_result.get("explanation", "")
        safety_tips  = claude_result.get("safety_tips", [])
    except Exception as e:
        app.logger.error(f"[Layer 3] Claude API failed: {e}")
        # Graceful degradation — return partial result rather than 500
        explanation = "Explanation unavailable at this time."
        safety_tips = []

    # ── 5. Build & return consolidated response ────────────────────────────────
    response = {
        "rule_flags":  rule_flags,
        "ml_score":    ml_score,
        "risk_level":  risk_level,
        "explanation": explanation,
        "safety_tips": safety_tips,
    }

    return jsonify(response), 200


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)