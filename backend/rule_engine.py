import re

# List of common scam-related phrases frequently found in fake job postings
SCAM_KEYWORDS = [
    "registration fee", "joining fee", "pay fee", "deposit required",
    "earn from home", "work from home earn", "no experience needed",
    "urgently hiring", "immediate joining", "earn per week",
    "guaranteed income", "unlimited earning", "part time earn",
    "whatsapp only", "contact on whatsapp", "telegram group",
    "no interview", "direct joining", "earn daily",
]

# Suspicious email domains (commonly used in scams instead of official company domains)
SUSPICIOUS_DOMAINS = [
    "gmail.com", "yahoo.com", "hotmail.com", 
    "outlook.com", "rediffmail.com"
]

# Regex patterns to detect unrealistic salary claims
UNREALISTIC_SALARY_PATTERNS = [
    r"₹\s*\d{2,3},?\d{3}\s*/?\s*week",
    r"rs\.?\s*\d{2,3},?\d{3}\s*/?\s*week",
    r"\$\s*\d{3,5}\s*/?\s*week",
    r"earn\s+(?:upto|up to|upto)?\s*₹?\s*\d{4,6}\s*(?:per|/)\s*(?:day|week)",
]

def get_rule_flags(text: str) -> list:
    """
    Analyzes job description text and returns a list of suspicious indicators (flags).

    This function performs:
    - Keyword-based scam detection
    - Email domain validation
    - Salary pattern analysis
    - Text quality checks
    """

    flags = []
    text_lower = text.lower()  # Normalize text for case-insensitive matching

    # 🔹 Check for known scam-related keywords
    for kw in SCAM_KEYWORDS:
        if kw in text_lower:
            flags.append(f"Scam phrase detected: '{kw}'")

    # 🔹 Extract and validate email domains
    email_pattern = r'[\w\.-]+@([\w\.-]+)'
    emails = re.findall(email_pattern, text_lower)

    for domain in emails:
        # Check if email belongs to suspicious/free domain
        if any(sus in domain for sus in SUSPICIOUS_DOMAINS):
            flags.append(f"Personal email used ({domain}) instead of company domain")
            break  # Only flag once

    # 🔹 Detect unrealistic salary promises using regex
    for pattern in UNREALISTIC_SALARY_PATTERNS:
        if re.search(pattern, text_lower):
            flags.append("Unrealistic salary promised for entry-level role")
            break

    # 🔹 Check if job description is too short (low quality / suspicious)
    if len(text.strip()) < 100:
        flags.append("Job description is unusually short and vague")

    # 🔹 Check for restricted communication channels
    if "whatsapp" in text_lower or "telegram" in text_lower:
        flags.append("Communication restricted to WhatsApp/Telegram only")

    return flags