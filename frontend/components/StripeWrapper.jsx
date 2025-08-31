// src/StripeWrapper.jsx
import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Your Stripe publishable test key (from Stripe dashboard)
const stripePromise = loadStripe('pk_test_your_test_key_here');

export default function StripeWrapper({ children }) {
  return <Elements stripe={stripePromise}>{children}</Elements>;
}
