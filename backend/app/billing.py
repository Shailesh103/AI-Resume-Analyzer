"""
Stripe billing integration.

Uses Stripe Checkout (a hosted, Stripe-built payment page) rather than a custom
card form — this keeps card data off our server entirely and avoids PCI
compliance work. The flow:

  1. Logged-in user clicks "Upgrade" -> we create a Checkout Session and
     redirect them to Stripe's hosted page.
  2. They pay on Stripe's page.
  3. Stripe sends us a webhook event (checkout.session.completed) confirming
     the subscription -> we mark the user as Pro in our database.
  4. Stripe also sends events when a subscription is later updated/cancelled,
     which we use to keep subscription_status in sync.
"""
import os

import stripe
from fastapi import HTTPException
from sqlalchemy.orm import Session

from .models_db import User

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")

STRIPE_PRICE_ID = os.getenv("STRIPE_PRICE_ID", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

ACTIVE_STATUSES = {"active", "trialing"}


def is_pro_user(user: User | None) -> bool:
    return bool(user and user.subscription_status in ACTIVE_STATUSES)


def _get_or_create_stripe_customer(db: Session, user: User) -> str:
    if user.stripe_customer_id:
        return user.stripe_customer_id

    customer = stripe.Customer.create(email=user.email, metadata={"user_id": user.id})
    user.stripe_customer_id = customer["id"]
    db.commit()
    return customer["id"]


def create_checkout_session(db: Session, user: User) -> str:
    if not stripe.api_key or not STRIPE_PRICE_ID:
        raise HTTPException(status_code=500, detail="Server misconfigured: Stripe is not set up.")

    customer_id = _get_or_create_stripe_customer(db, user)

    session = stripe.checkout.Session.create(
        customer=customer_id,
        mode="subscription",
        line_items=[{"price": STRIPE_PRICE_ID, "quantity": 1}],
        client_reference_id=user.id,
        success_url=f"{FRONTEND_URL}/?billing=success",
        cancel_url=f"{FRONTEND_URL}/?billing=cancel",
    )
    return session.url


def create_portal_session(user: User) -> str:
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Server misconfigured: Stripe is not set up.")
    if not user.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No billing account found for this user yet.")

    session = stripe.billing_portal.Session.create(
        customer=user.stripe_customer_id,
        return_url=f"{FRONTEND_URL}/",
    )
    return session.url


def construct_webhook_event(payload: bytes, sig_header: str):
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Server misconfigured: STRIPE_WEBHOOK_SECRET is not set.")
    try:
        return stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.error.SignatureVerificationError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid webhook: {e}")


def handle_webhook_event(db: Session, event: dict) -> None:
    event_type = event["type"]
    # data = event["data"]["object"]
    data = event["data"]["object"].to_dict()

    if event_type == "checkout.session.completed":
        user = None
        client_reference_id = data.get("client_reference_id")
        if client_reference_id:
            user = db.query(User).filter(User.id == client_reference_id).first()
        if user is None and data.get("customer"):
            user = db.query(User).filter(User.stripe_customer_id == data["customer"]).first()

        if user is not None:
            user.stripe_customer_id = data.get("customer") or user.stripe_customer_id
            user.stripe_subscription_id = data.get("subscription")
            user.subscription_status = "active"
            db.commit()

    elif event_type in ("customer.subscription.updated", "customer.subscription.deleted"):
        customer_id = data.get("customer")
        user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
        if user is not None:
            user.subscription_status = data.get("status", "canceled")
            user.stripe_subscription_id = data.get("id") or user.stripe_subscription_id
            db.commit()
