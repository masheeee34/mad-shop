import Stripe from "stripe";

/**
 * Instance Stripe, ou null si la clé n'est pas configurée.
 * Permet au site de tourner en local sans clés (mode démo).
 */
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;
