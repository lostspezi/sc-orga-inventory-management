import Stripe from "stripe";

declare global {
     
    var __stripeClient: Stripe | undefined;
}

export function getStripe(): Stripe {
    if (!global.__stripeClient) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error("STRIPE_SECRET_KEY is not set.");
        }
        global.__stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: "2026-02-25.clover",
        });
    }
    return global.__stripeClient;
}
