import re

SCAM_KEYWORDS = [
    "registration fee", "joining fee", "pay fee", "deposit required",
    "earn from home", "work from home earn", "no experience needed",
    "urgently hiring", "immediate joining", "earn per week",
    "guaranteed income", "unlimited earning", "part time earn",
    "whatsapp only", "contact on whatsapp", "telegram group",
    "no interview", "direct joining", "earn daily",
]

SUSPICIOUS_DOMAINS = [
    "gmail.com", "yahoo.com", "hotmail.com", 
    "outlook.com", "rediffmail.com"
]

UNREALISTIC_SALARY_PATTERNS = [
    r"₹\s*\d{2,3},?\d{3}\s*/?\s*week",
    r"rs\.?\s*\d{2,3},?\d{3}\s*/?\s*week",
    r"\$\s*\d{3,5}\s*/?\s*week",
    r"earn\s+(?:upto|up to|upto)?\s*₹?\s*\d{4,6}\s*(?:per|/)\s*(?:day|week)",
]

def get_rule_flags(text: str) -> list:
    flags = []
    text_lower = text.lower()

    # Check scam keywords
    for kw in SCAM_KEYWORDS:
        if kw in text_lower:
            flags.append(f"Scam phrase detected: '{kw}'")

    # Check suspicious email domains
    email_pattern = r'[\w\.-]+@([\w\.-]+)'
    emails = re.findall(email_pattern, text_lower)
    for domain in emails:
        if any(sus in domain for sus in SUSPICIOUS_DOMAINS):
            flags.append(f"Personal email used ({domain}) instead of company domain")
            break

    # Check unrealistic salary
    for pattern in UNREALISTIC_SALARY_PATTERNS:
        if re.search(pattern, text_lower):
            flags.append("Unrealistic salary promised for entry-level role")
            break

    # Check description length
    if len(text.strip()) < 100:
        flags.append("Job description is unusually short and vague")

    # Check WhatsApp / Telegram
    if "whatsapp" in text_lower or "telegram" in text_lower:
        flags.append("Communication restricted to WhatsApp/Telegram only")

    return flags