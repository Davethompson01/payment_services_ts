import Stripe from "stripe";
import dbOPS from "../../model/dbOPS";
import utilis from "../../controller/utils";
import APiCallStripe from "./api.stripe";
import Database from "../../../config/database_connect";
import { Request, Response } from "express";
import stripeModel from "./stripe.model";

export default class stripeController {
  // private stripeSDK: Stripe;

  private stripeSDK: Stripe;

  constructor() {
    this.stripeSDK = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover", // use typed version
    });
  }

  public dbops = new dbOPS();
  public stripeAPi = new APiCallStripe();
  public utils = new utilis();
  public database = new Database();
  public stripeModel = new stripeModel();

  public async createTransaction(req: Request, res: Response) {
    const user_id = req.user?.user_id;
    if (!user_id) {
      return this.utils.sendResponse(res, 401, false, "UserID is required", []);
    }

    const { amount, currency } = req.body;
    if (!amount || !currency) {
      return this.utils.sendResponse(
        res,
        400,
        false,
        "Amount and currency are required",
        []
      );
    }

    // Call Stripe API
    const result = await this.stripeAPi.callStripeApi(Number(amount), currency);
    if (!result.success) {
      return this.utils.sendResponse(
        res,
        500,
        false,
        result.message,
        result.data
      );
    }

    const data = result.data; // Stripe object

    // Insert into database
    const insert = await this.stripeModel.createTrasactionIntentModel(
      user_id,
      data.id,
      data.amount,
      data.currency,
      data.status,
      data.client_secret,
      // new Date(data.created * 1000), // Stripe UNIX timestamp -> JS Date
      data.livemode
    );

    if (!insert.success) {
      return this.utils.sendResponse(
        res,
        500,
        false,
        insert.message,
        insert.data
      );
    }

    return this.utils.sendResponse(
      res,
      200,
      true,
      "Payment intent created",
      data
    );
  }

  public async handleWebhook(req: any, res: any) {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;

    try {
      event = this.stripeSDK.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log("PaymentIntent succeeded:", paymentIntent);
    }

    res.json({ received: true });
  }

  public async retrievePaymentbyStripeID(req: Request, res: Response) {
    const user_id = req.user.user_id;
    console.log(user_id);

    if (!user_id) {
      return this.utils.sendResponse(res, 401, false, "UserID is required", []);
    }

    const stripe_id = req.query.stripeID as string;
    console.log(stripe_id, "reference");

    if (!stripe_id) {
      return this.utils.sendResponse(res, 400, false, "stripe is required", []);
    }

    try {
      const select = await this.stripeModel.retrievePaymentIntent(stripe_id);
      if (!select.success) {
        return this.utils.sendResponse(
          res,
          401,
          false,
          select.message,
          select.data
        );
      }
      return this.utils.sendResponse(
        res,
        200,
        true,
        select.message,
        select.data
      );
    } catch (error: any) {
      return this.utils.sendResponse(
        res,
        401,
        false,
        error.message,
        error.data
      );
    }
  }

  public async retrievePaymentbyUserID(req: Request, res: Response) {
    const user_id = req.user.user_id;
    console.log(user_id);

    if (!user_id) {
      return this.utils.sendResponse(res, 401, false, "UserID is required", []);
    }

    // const stripe_id = req.query as string;
    // console.log(stripe_id, "reference");

    // if (!stripe_id) {
    //   return this.utils.sendResponse(res, 400, false, "stripe is required", []);
    // }

    try {
      const select = await this.stripeModel.retrievePaymentByUser(user_id);
      if (!select.success) {
        return this.utils.sendResponse(
          res,
          401,
          false,
          select.message,
          select.data
        );
      }
      return this.utils.sendResponse(
        res,
        200,
        true,
        select.message,
        select.data
      );
    } catch (error: any) {
      return this.utils.sendResponse(
        res,
        401,
        false,
        error.message,
        error.data
      );
    }
  }

  public async retrievePaymentbyID(req: Request, res: Response) {
    const user_id = req.user.user_id;
    console.log(user_id);

    if (!user_id) {
      return this.utils.sendResponse(res, 401, false, "UserID is required", []);
    }

    const id = req.query.id as string;
    console.log(id, "reference");

    if (!id) {
      return this.utils.sendResponse(res, 400, false, "stripe is required", []);
    }

    try {
      const select = await this.stripeModel.retrievePaymentByUser(user_id);
      if (!select.success) {
        return this.utils.sendResponse(
          res,
          401,
          false,
          select.message,
          select.data
        );
      }
      return this.utils.sendResponse(
        res,
        200,
        true,
        select.message,
        select.data
      );
    } catch (error: any) {
      return this.utils.sendResponse(
        res,
        401,
        false,
        error.message,
        error.data
      );
    }
  }
}
