import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51R6aeI4aaBX9TIIPcZUE9bOj7vcfsMlFhzHQBSCngT8spQrQmWOs0RnvACz3kPdeDCoR9ZpHqECoY4FrLoieto2Y00sl5up7Vi');

export const createCheckoutSession = async (priceId: string) => {
  const stripe = await stripePromise;
  
  if (!stripe) {
    throw new Error('Stripe failed to initialize');
  }

  // In a real application, you would call your backend to create a checkout session
  // For this demo, we'll simulate the checkout process
  const { error } = await stripe.redirectToCheckout({
    lineItems: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    successUrl: `${window.location.origin}/#/dashboard?success=true`,
    cancelUrl: `${window.location.origin}/#/pricing?canceled=true`,
  });

  if (error) {
    throw error;
  }
};

// Demo price IDs - in production, these would come from your Stripe dashboard
export const STRIPE_PRICES = {
  pro: 'price_1234567890', // Replace with actual price ID from Stripe
  enterprise: 'price_0987654321', // Replace with actual price ID from Stripe
};

export default stripePromise;