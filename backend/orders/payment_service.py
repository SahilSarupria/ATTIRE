import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

def create_payment_intent(amount, currency='usd'):
    """Create a Stripe payment intent"""
    try:
        intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),  # Convert to cents
            currency=currency,
            automatic_payment_methods={
                'enabled': True,
            },
        )
        return intent
    except stripe.error.StripeError as e:
        raise Exception(f"Payment error: {str(e)}")

def confirm_payment_intent(payment_intent_id):
    """Confirm a payment intent"""
    try:
        return stripe.PaymentIntent.retrieve(payment_intent_id)
    except stripe.error.StripeError as e:
        raise Exception(f"Payment confirmation error: {str(e)}")
