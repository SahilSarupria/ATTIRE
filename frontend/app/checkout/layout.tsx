// app/checkout/layout.tsx
"use client"

import StripeWrapper from '@/components/StripeWrapper';

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <StripeWrapper>{children}</StripeWrapper>;
}
