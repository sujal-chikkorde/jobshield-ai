import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from rule_engine import get_rule_analysis
from predictor import get_ml_score
from url_analyzer import analyze_url
from analyzer import get_claude_explanation

app = Flask(__name__)
CORS(app)


def score_to_risk_level(score: int) -> str:
    if score <= 30:
        return "Low"
    elif score <= 70:
        return "Medium"
    return "High"


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/analyze", methods=["POST"])
def analyze():
    body = request.get_json(silent=True)

    if not isinstance(body, dict):
        return jsonify({"error": "Request body must be a JSON object."}), 400

    text = body.get("text", "")
    url = body.get("url", "")

    if not isinstance(text, str) or not isinstance(url, str):
        return jsonify({"error": "'text' and 'url' must be strings."}), 400

    text = text.strip()
    url = url.strip()

    if not text and not url:
        return jsonify({"error": "Provide message text, a URL, or both."}), 400

    # Layer 1: rules
    rule_result = get_rule_analysis(text)
    rule_score = int(rule_result.get("rule_score", 0))
    text_flags = rule_result.get("rule_flags", [])
    categories = rule_result.get("categories", [])

    # Layer 2: ML (can only raise risk, never lower it)
    ml_score = None
    if text:
        try:
            ml_score = get_ml_score(text)
        except Exception:
            app.logger.exception("ML predictor failed")

    # Layer 3: URL
    if url:
        try:
            url_result = analyze_url(url)
        except Exception:
            app.logger.exception("URL analyzer failed")
            url_result = {
                "url": url,
                "hostname": "",
                "url_score": 40,
                "url_flags": [
                    "URL analysis could not be completed. Verify this link independently."
                ],
            }
    else:
        url_result = {"url": "", "hostname": "", "url_score": 0, "url_flags": []}

    url_score = int(url_result.get("url_score", 0))
    url_flags = url_result.get("url_flags", [])

    all_flags = list(text_flags) + list(url_flags)

    # Overall risk
    available_scores = []
    if text:
        available_scores.append(rule_score)
    if url:
        available_scores.append(url_score)

    risk_score = max(available_scores) if available_scores else 0

    if ml_score is not None and ml_score >= 75:
        risk_score = max(risk_score, 50)
        if rule_score >= 30:
            risk_score = max(risk_score, 71)

    risk_level = score_to_risk_level(risk_score)

    # Defaults if AI is unavailable
    explanation = (
        "Automated analysis completed. Review the detected indicators "
        "and verify the source before taking action."
    )
    safety_tips = [
        "Never pay any fee to get a job. Real employers don't charge you.",
        "Verify the company on its official website and LinkedIn.",
        "Be careful if they only talk to you on WhatsApp or Telegram.",
    ]
    llm_score = None

    if text or url:
        try:
            ai_result = get_claude_explanation(
                job_text=text or f"URL submitted by the user: {url}",
                rule_flags=all_flags,
                ml_score=ml_score if ml_score is not None else risk_score,
            )
            explanation = ai_result.get("explanation") or explanation
            safety_tips = ai_result.get("safety_tips") or safety_tips
            llm_score = ai_result.get("llm_score")
        except Exception:
            app.logger.exception("AI explanation failed")

    response = {
        "text": text,
        "jobText": text,
        "rule_flags": text_flags,
        "text_flags": text_flags,
        "url_flags": url_flags,
        "rule_score": rule_score,
        "ml_score": ml_score,
        "url_score": url_score,
        "llm_score": llm_score,
        "url": url_result.get("url", url),
        "categories": categories,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "explanation": explanation,
        "safety_tips": safety_tips,
    }

    return jsonify(response), 200


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="127.0.0.1", port=port, debug=debug)