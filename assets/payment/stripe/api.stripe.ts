import utilis from "../../controller/utils";
import axios from "axios";
import Stripe from "stripe";
import stripeModel from "./stripe.model";
import { Request, Response } from "express";

export default class APiCallStripe {
  private stripeSDK: Stripe;
  public stripemodel = new stripeModel();
  public stripe_webhook = process.env.STRIPE_WEBHOOK_SECRET;

  constructor() {
    this.stripeSDK = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover", // use typed version
    });
  }
  public utils = new utilis();
  // public stripeSDK = Stripe();
  public STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

  public async callStripeApi(amount: number, currency: string) {
    try {
      const response = await axios.post(
        "https://api.stripe.com/v1/payment_intents",
        new URLSearchParams({
          amount: String(amount * 100),
          currency,
          "automatic_payment_methods[enabled]": "true",
        }),
        {
          headers: {
            Authorization: `Bearer ${this.STRIPE_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return this.utils.returnData(
        true,
        "Stripe payment intent created",
        response.data
      );
    } catch (error: any) {
      return this.utils.returnData(
        false,
        error.response?.data?.error?.message || error.message,
        error.response?.data
      );
    }
  }

  public async webHook(req: Request, res: Response) {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || Array.isArray(sig)) {
      return this.utils.sendResponse(
        res,
        400,
        false,
        "Missing or invalid Stripe signature",
        []
      );
    }

    let event: Stripe.Event;

    try {
      event = Stripe.webhooks.constructEvent(req.body, sig, webhookSecret!);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return this.utils.sendResponse(
        res,
        400,
        false,
        `Webhook Error: ${err.message}`,
        []
      );
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment succeeded:", paymentIntent.id);

        //  Update your database
        await this.stripemodel.updateTransactionStatus(
          paymentIntent.id,
          "succeeded"
        );
        break;

      case "payment_intent.payment_failed":
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment failed:", failedIntent.id);

        //Update DB to failed
        await this.stripemodel.updateTransactionStatus(
          failedIntent.id,
          "failed"
        );
        break;

      case "charge.succeeded":
        const charge = event.data.object as Stripe.Charge;
        console.log("Charge succeeded:", charge);
        break;

      // Add more events here
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return this.utils.sendResponse(
      res,
      200,
      true,
      "Successfully received webhook event",
      event.data.object
    );
  }

  // public async payment_methods(amount: number, type: string, ) {
  //   const paymentIntent = await this.stripeSDK.paymentIntents.create({
  //     amount: amount * 100, // convert to cents
  //     currency,
  //     payment_method: payment_method_id,
  //     confirm: true, // immediately confirm
  //   });
  // }

  public async refunds() {}

  public async verifyTransactionStatus() {}
}
