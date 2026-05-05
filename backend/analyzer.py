import os
import json
import re
from google import genai
from dotenv import load_dotenv

load_dotenv()

# ── Client (singleton) ────────────────────────────────────────────────────────
_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL   = "gemini-2.5-flash"


# ── Prompt builder ────────────────────────────────────────────────────────────

def _build_prompt(job_text: str, rule_flags: list, ml_score: int) -> str:
    """
    Constructs a grounded prompt so Gemini's output is anchored to
    real evidence (Layer 1 flags + Layer 2 score), not free-form hallucination.
    """
    flags_block = (
        "\n".join(f"  - {f}" for f in rule_flags)
        if rule_flags
        else "  - None detected"
    )

    return f"""You are JobShield AI, an expert fraud analyst helping students identify fake job postings.

You have been given:
1. A job description to analyze
2. Rule-based red flags already detected (Layer 1)
3. A machine-learning fraud probability score 0-100 (Layer 2)

Your job is to synthesize this evidence into a clear, student-friendly explanation.

---

JOB DESCRIPTION:
\"\"\"
{job_text}
\"\"\"

DETECTED RED FLAGS (Layer 1):
{flags_block}

ML FRAUD SCORE (Layer 2): {ml_score}/100
(0-30 = Low Risk, 31-70 = Medium Risk, 71-100 = High Risk)

---

INSTRUCTIONS:
- Reference the specific red flags and score in your explanation. Do NOT invent new evidence.
- Write for a college student audience: clear, direct, no jargon.
- If the score is LOW (0-30) and no flags detected, explain why the job appears LEGITIMATE — mention positive signs like official company domain, realistic salary, proper requirements, no fees.
- If the score is MEDIUM (31-70), be honest about uncertainty and what to verify before applying.
- If the score is HIGH (71-100), clearly explain the fraud indicators and warn the student strongly.
- Always give 3 specific actionable safety tips relevant to the risk level.

Respond with ONLY a valid JSON object in this exact format, no markdown, no preamble, no backticks:
{{
  "explanation": "<3 sentences max. State the overall risk, cite specific evidence, give a bottom line.>",
  "safety_tips": [
    "<Specific action 1>",
    "<Specific action 2>",
    "<Specific action 3>"
  ]
}}"""


# ── Main exported function ────────────────────────────────────────────────────

def get_claude_explanation(
    job_text: str,
    rule_flags: list,
    ml_score: int,
) -> dict:
    """
    Calls Gemini to generate a human-readable explanation + safety tips.
    Function name kept as get_claude_explanation so app.py needs zero changes.

    Args:
        job_text:   Raw job description string
        rule_flags: List of red flag strings from Layer 1
        ml_score:   Integer 0-100 fraud probability from Layer 2

    Returns:
        { "explanation": str, "safety_tips": List[str] }
    """
    prompt = _build_prompt(job_text, rule_flags, ml_score)

    # ── Gemini API call ───────────────────────────────────────────────────────
    response = _client.models.generate_content(
        model=MODEL,
        contents=prompt,
    )

    raw_text = response.text.strip()

    # ── Parse & validate ──────────────────────────────────────────────────────
    try:
        result = json.loads(raw_text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", raw_text, re.DOTALL)
        if match:
            result = json.loads(match.group())
        else:
            raise ValueError(
                f"Gemini returned non-JSON response: {raw_text[:200]}"
            )

    # Guarantee schema contract with frontend
    if "explanation" not in result or "safety_tips" not in result:
        raise ValueError(
            f"Gemini response missing required keys. Got: {list(result.keys())}"
        )

    if not isinstance(result["safety_tips"], list):
        result["safety_tips"] = [result["safety_tips"]]

    # Pad to exactly 3 tips if Gemini under-delivered
    while len(result["safety_tips"]) < 3:
        result["safety_tips"].append(
            "Verify this job through the company's official careers page."
        )

    return {
        "explanation": result["explanation"],
        "safety_tips": result["safety_tips"][:3],
    }