"""
Resume Builder free-vs-pro entitlements (Phase 10).

Deliberately separate from billing.py: billing.py owns Stripe/subscription
status (is_pro_user), this module just maps that status onto what the
Resume Builder allows. No Stripe logic is duplicated here.
"""

# Free users can use these templates; the rest are Pro-only.
FREE_TEMPLATES = {"modern", "minimal"}
PRO_ONLY_TEMPLATES = {"professional", "executive", "developer"}

FREE_RESUME_LIMIT = 2


def is_template_allowed(template: str, is_pro: bool) -> bool:
    return is_pro or template in FREE_TEMPLATES


def resume_limit_for(is_pro: bool) -> int | None:
    """Returns the max number of saved resumes, or None for unlimited (Pro)."""
    return None if is_pro else FREE_RESUME_LIMIT
