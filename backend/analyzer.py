import os
import json
import re

from groq import Groq
from dotenv import load_dotenv

load_dotenv()

_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "openai/gpt-oss-20b"

FALLBACK = {
    "explanation": "We couldn't generate an AI explanation right now. Please review the detected red flags carefully.",
    "safety_tips": [
        "Never pay any fee to get a job. Real employers don't charge you.",
        "Verify the company on its official website and LinkedIn.",
        "Be careful if they only talk to you on WhatsApp or Telegram.",
    ],
    "llm_score": None,
}


def _build_prompt(job_text, rule_flags, ml_score):
    flags_text = "\n".join(f"- {f}" for f in rule_flags) if rule_flags else "None detected"
    return f"""You are a scam safety assistant for college students in India.

Content to check (job posting, message, or URL):
\"\"\"
{job_text[:3000]}
\"\"\"

IMPORTANT: This text may come from OCR of a screenshot or poster. OCR often produces garbled words, stray symbols, missing headings and broken line order. Never treat messy formatting, strange characters or missing text as a warning sign. Judge only the real content: what is asked of the person, money, contact channels, urgency, salary promises, and how professional the details are.

Red flags detected by rules:
{flags_text}

ML similarity to known fake postings (0-100). Weak signal, trained mostly on US data. If no red flags were detected by rules, do not call it a scam based on this alone, say it needs verification: {ml_score}

Respond with ONLY a JSON object, no markdown, no extra text, in exactly this format:
{{"risk_score": 0,
  "explanation": "a detailed explanation, 6 to 8 sentences",
  "safety_tips": ["tip 1", "tip 2", "tip 3"]}}

risk_score is an integer 0-100 of how likely this is a scam, using your own judgment of the content and the flags.

The explanation must cover, in simple student-friendly language:
1. Your overall verdict and why.
2. What looks normal or reassuring (if anything).
3. What looks suspicious (if anything), quoting the exact phrases.
4. What the student should verify before replying or paying anything.
Do not repeat the safety tips inside the explanation.

Give exactly 3 actionable safety tips.
Never state or guess any company's or bank's official domain name. Tell the user to find the official site themselves via a search engine or the app, or to use the phone number on their bank card."""


def get_claude_explanation(job_text, rule_flags, ml_score):
    prompt = _build_prompt(job_text, rule_flags, ml_score)

    response = _client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=2500,
        reasoning_effort="low",
    )

    raw_text = (response.choices[0].message.content or "").strip()

    match = re.search(r"\{.*\}", raw_text, re.DOTALL)
    if not match:
        print("AI raw output (no JSON found):", repr(raw_text))
        return FALLBACK

    try:
        data = json.loads(match.group(0))
    except json.JSONDecodeError:
        print("AI raw output (bad JSON):", repr(raw_text))
        return FALLBACK

    explanation = str(data.get("explanation", "")).strip() or FALLBACK["explanation"]

    tips = data.get("safety_tips", [])
    if not isinstance(tips, list):
        tips = []
    tips = [str(t).strip() for t in tips if str(t).strip()][:3]

    try:
        llm_score = max(0, min(100, int(round(float(data.get("risk_score"))))))
    except (TypeError, ValueError):
        llm_score = None

    return {
        "explanation": explanation,
        "safety_tips": tips or FALLBACK["safety_tips"],
        "llm_score": llm_score,
    }