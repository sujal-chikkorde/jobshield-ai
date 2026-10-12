import re
import ipaddress
from urllib.parse import urlparse

SUSPICIOUS_TLDS = {
    "xyz", "top", "click", "loan", "work", "gq", "tk", "ml", "cf", "ga",
    "buzz", "icu", "monster", "rest", "cam", "country", "zip", "mov", "support",
}

SHORTENERS = {"bit.ly", "tinyurl.com", "t.ly", "cutt.ly", "rb.gy", "is.gd", "goo.gl", "ow.ly"}

CHAT_LINKS = {"t.me", "wa.me", "chat.whatsapp.com", "telegram.me"}

KEYWORDS = [
    "kyc", "verify", "update", "login", "signin", "reward", "claim", "prize",
    "refund", "bonus", "lucky", "free", "offer", "otp", "secure", "account",
    "support", "winner", "gift", "recharge", "unlock",
]

BRANDS = {
    "hdfc": {"hdfcbank.com"},
    "sbi": {"sbi.co.in", "onlinesbi.sbi", "sbicard.com"},
    "icici": {"icicibank.com"},
    "axis": {"axisbank.com"},
    "paytm": {"paytm.com"},
    "phonepe": {"phonepe.com"},
    "gpay": {"pay.google.com"},
    "amazon": {"amazon.in", "amazon.com"},
    "flipkart": {"flipkart.com"},
    "google": {"google.com", "google.co.in"},
    "linkedin": {"linkedin.com"},
    "naukri": {"naukri.com"},
    "indeed": {"indeed.com"},
    "infosys": {"infosys.com"},
    "tcs": {"tcs.com"},
    "wipro": {"wipro.com"},
    "microsoft": {"microsoft.com"},
    "netflix": {"netflix.com"},
}

TRUSTED = {
    "google.com", "linkedin.com", "github.com", "microsoft.com", "naukri.com",
    "indeed.com", "amazon.in", "amazon.com", "flipkart.com", "wikipedia.org",
    "infosys.com", "tcs.com", "wipro.com", "hdfcbank.com", "icicibank.com",
    "axisbank.com", "sbi.co.in", "paytm.com", "phonepe.com",
}

SECOND_LEVEL = {"co", "com", "org", "net", "ac", "gov", "edu", "nic"}


def _registered_domain(host: str) -> str:
    parts = host.split(".")
    if len(parts) >= 3 and parts[-2] in SECOND_LEVEL and len(parts[-1]) == 2:
        return ".".join(parts[-3:])
    return ".".join(parts[-2:]) if len(parts) >= 2 else host


def analyze_url(url: str) -> dict:
    raw = (url or "").strip()
    to_parse = raw if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", raw) else "http://" + raw
    try:
        parsed = urlparse(to_parse)
    except ValueError:
        return {
            "url": raw,
            "hostname": "",
            "url_score": 60,
            "url_flags": ["URL is malformed or uses unusual characters, which is common in scam links."],
        }

    scheme = parsed.scheme.lower()
    host = (parsed.hostname or "").lower()
    path = (parsed.path or "") + ("?" + parsed.query if parsed.query else "")

    flags = []
    score = 0

    def add(points, msg):
        nonlocal score
        score += points
        flags.append(msg)

    if not host:
        return {"url": raw, "hostname": "", "url_score": 30,
                "url_flags": ["Could not read a valid hostname from this URL."]}

    reg = _registered_domain(host)
    is_ip = False
    try:
        ipaddress.ip_address(host)
        is_ip = True
    except ValueError:
        pass

    # Explicit raw-text scheme check (user may have typed without http)
    typed_https = raw.lower().startswith("https://")
    if scheme != "https" or (not typed_https and not raw.lower().startswith("http")):
        add(15, "URL uses HTTP rather than HTTPS")

    if is_ip:
        add(55, "URL uses a raw IP address instead of a domain name")

    tld = host.rsplit(".", 1)[-1] if "." in host else ""
    if tld in SUSPICIOUS_TLDS:
        add(25, f"URL uses a high-risk domain ending: .{tld}")

    if "xn--" in host:
        add(25, "URL uses punycode, which can disguise look-alike domains")

    if "@" in (parsed.netloc or ""):
        add(25, "URL contains '@', which can hide the real destination")

    if reg in SHORTENERS:
        add(20, "URL is a link shortener that hides the real destination")

    if host in CHAT_LINKS or reg in CHAT_LINKS:
        add(20, "Link leads to a Telegram/WhatsApp chat, common in job scams")

    # Brand impersonation
    if not is_ip:
        for brand, official in BRANDS.items():
            if brand in host and reg not in official:
                add(35, f"Domain imitates '{brand}' but is not its official site")
                break

    # Scam wording in hostname / path
    found_host = [k for k in KEYWORDS if k in host]
    found_path = [k for k in KEYWORDS if k in path.lower() and k not in found_host]
    if found_host:
        add(min(24, 8 * len(found_host)), "URL domain contains suspicious wording: " + ", ".join(found_host))
    if found_path:
        add(min(16, 8 * len(found_path)), "URL path contains suspicious wording: " + ", ".join(found_path))

    if host.count("-") >= 2:
        add(12, "Domain has many hyphens, common in fake look-alike sites")

    if host.count(".") >= 4:
        add(10, "Domain has an unusually large number of subdomains")

    if len(host) > 35:
        add(8, "Domain name is unusually long")

    # Trusted sites: https + known domain = low risk
    if reg in TRUSTED and scheme == "https" and not found_host:
        score = min(score, 10)

    score = max(0, min(100, score))
    return {"url": raw, "hostname": host, "url_score": score, "url_flags": flags}