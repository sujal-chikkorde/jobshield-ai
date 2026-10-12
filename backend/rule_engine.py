import re

RULES = [
    {
        "name": "OTP or PIN request",
        "category": "financial",
        "severity": 35,
        "patterns": [
            r"\bshare (?:your )?otp\b",
            r"\bprovide (?:your )?otp\b",
            r"\benter your otp\b",
            r"\bshare (?:your )?pin\b",
            r"\bprovide (?:your )?upi pin\b",
            r"\bshare (?:your )?cvv\b",
        ],
    },
    {
        "name": "Urgency or threat",
        "category": "phishing",
        "severity": 12,
        "patterns": [
            r"\blimited slots?\b",
            r"\bregistration closes?\b",
            r"\bjoin today\b",
            r"\bactivate .* instantly\b",
            r"\baccount will be blocked\b",
            r"\bact immediately\b",
            r"\bwithin \d+ minutes\b",
            r"\bwithin 24 hours\b",
            r"\burgent(?:ly)?\b",
            r"\bfinal warning\b",
            r"\bexpires today\b",
            r"\bsame[\s-]day\b",
            r"\bhurry\b",
            r"\bonly \d+ (?:seats?|vacanc(?:y|ies)|slots?) (?:left|remaining)\b",
            r"\btoday only\b",
        ],
    },
    {
        "name": "Unexpected payment request",
        "category": "financial",
        "severity": 25,
        "patterns": [
            r"\brefundable .* deposit\b",
            r"\bactivation deposit\b",
            r"\bserver activation\b",
            r"\bdeposit of [₹$]?\s*\d+",
            r"\bregistration fee\b",
            r"\bprocessing fee\b",
            r"\bpay (?:now|first|in advance)\b",
            r"\bsecurity deposit\b",
            r"\btransfer (?:money|funds)\b",
            r"\bsend money\b",
            r"\bpay to receive\b",
            r"\bpay .* to unlock\b",
        ],
    },
    {
        "name": "Prize or reward bait",
        "category": "reward",
        "severity": 18,
        "patterns": [
            r"\byou (?:have )?won\b",
            r"\bclaim your (?:prize|reward)\b",
            r"\bfree gift\b",
            r"\blucky winner\b",
            r"\bcashback waiting\b",
            r"\bclaim .* reward\b",
        ],
    },
    {
        "name": "Credential or KYC request",
        "category": "phishing",
        "severity": 25,
        "patterns": [
            r"\bverify your (?:bank )?account\b",
            r"\bupdate your kyc\b",
            r"\bkyc expired\b",
            r"\bconfirm your password\b",
            r"\benter your password\b",
            r"\bverify your identity\b",
            r"\bclick here to verify\b",
        ],
    },
    {
        "name": "Impersonation indicators",
        "category": "impersonation",
        "severity": 15,
        "patterns": [
            r"\bwe are from (?:your )?bank\b",
            r"\bpretending to be\b",
            r"\bon behalf of (?:your )?bank\b",
            r"\bcustoms department\b",
            r"\bpolice case registered\b",
            r"\bdigital arrest\b",
        ],
    },
    {
        "name": "Suspicious job offer",
        "category": "job",
        "severity": 18,
        "patterns": [
            r"\bno prior experience\b",
            r"\bworking just \d+ hours?\b",
            r"\bearn [₹$]?\s*[\d,]+ .*month\b",
            r"\b\d+ hours? daily\b",
            r"\bno interview required\b",
            r"\bguaranteed income\b",
            r"\bearn .* per day\b",
            r"\bpay .* to join\b",
            r"\bno experience needed\b",
            r"\bno experience required\b",
            r"\bno (?:skills?|qualification|degree) (?:required|needed)\b",
            r"\banyone can (?:apply|earn)\b",
            r"\b(?:simple|easy) (?:tasks?|work)\b",
            r"\btask[\s-]based\b",
            r"\b(?:like|subscribe|rate|review)\b[^.\n]{0,30}\b(?:youtube|videos?|products?|reels?|posts?)\b",
        ],
    },
    {
        "name": "Suspicious communication channel",
        "category": "other",
        "severity": 12,
        "patterns": [
            r"\bwhats\s?app[\s-]+only\b",
            r"\btelegram[\s-]+only\b",
            r"\b(?:contact|message|text|apply|reach|dm)\b[^.\n]{0,40}\b(?:whats\s?app|telegram)\b",
            r"\b(?:telegram|whatsapp)\s+(?:group|channel)\b",
            r"\bjoin (?:our |the )?(?:telegram|whatsapp)\b",
            r"\btelegram:\s*@[\w]+",
            r"\bdo not tell anyone\b",
            r"\bkeep this confidential\b",
            r"[\w.+-]+@(?:gmail|yahoo|outlook|hotmail|rediffmail)\.com",
        ],
    },
    {
        "name": "Upfront fee for a job",
        "category": "job",
        "severity": 35,
        "patterns": [
            r"(?:₹|rs\.?|inr)\s?\d[\d,]*\s*(?:/-)?\s*(?:as\s+|for\s+)?(?:a\s+|the\s+)?(?:\w+\s+){0,2}?(?:fee|fees|deposit|charges?)\b",
            r"\b(?:registration|training|kit|joining|onboarding|verification|security|processing|refundable)\s+(?:fee|fees|charges?|deposit|amount)\b",
            r"\b(?:pay|deposit|send|transfer)\b[^.\n]{0,40}(?:₹|rs\.?|inr)\s?\d",
        ],
    },
    {
        "name": "Unrealistic earnings",
        "category": "job",
        "severity": 25,
        "patterns": [
            r"(?:₹|rs\.?|inr)\s?\d[\d,]*\s*(?:/-)?\s*(?:per day|a day|/day|daily)\b",
            r"\bearn up to\b",
            r"\bdaily (?:payout|payment|income|salary)\b",
            r"\bsame[\s-]day (?:payment|payout|salary)\b",
            r"\bhigh (?:income|salary|pay) .{0,20}(?:no|without) (?:skills?|experience|qualification)\b",
        ],
    },
]


def get_rule_analysis(text: str) -> dict:
    """Return matched rule evidence, categories, and a bounded heuristic score."""
    text = text or ""
    matches = []
    categories = set()
    seen = set()

    for rule in RULES:
        for pattern in rule["patterns"]:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                evidence = match.group(0)
                key = (rule["name"], evidence.lower())

                if key not in seen:
                    seen.add(key)
                    matches.append({
                        "rule": rule["name"],
                        "category": rule["category"],
                        "severity": rule["severity"],
                        "evidence": evidence,
                    })
                    categories.add(rule["category"])

                break

    score = min(100, sum(item["severity"] for item in matches))

    # OTP/PIN/CVV requests are especially concerning.
    if any(item["rule"] == "OTP or PIN request" for item in matches):
        score = max(score, 70)

    # Asking a job seeker to pay upfront is the strongest job-scam signal.
    if any(item["rule"] == "Upfront fee for a job" for item in matches):
        score = max(score, 71)

    # Several different signals, including a money signal, together mean High.
    rules_hit = {item["rule"] for item in matches}
    money_rules = {"Upfront fee for a job", "Unrealistic earnings", "Unexpected payment request"}
    if len(rules_hit) >= 3 and rules_hit & money_rules:
        score = max(score, 71)

    return {
        "rule_score": score,
        "categories": sorted(categories),
        "matches": matches,
        "rule_flags": [
            f"{item['rule']}: matched '{item['evidence']}'"
            for item in matches
        ],
    }


def get_rule_flags(text: str) -> list:
    """Backward-compatible interface used by the current app.py."""
    return get_rule_analysis(text)["rule_flags"]