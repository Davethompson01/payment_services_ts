import { Router } from "express";
import stripeController from "./stripe.con";
import apiKey from "../../middleware/apiMiddlewares";
import APiCallStripe from "./api.stripe";
import express from "express";
import authenicate from "../../middleware/authenticationMiddleware";
import authorisationMiddleWare from "../../middleware/authorisation";
// import APiCallStripe from "./api.stripe";
const router = Router();
const app = express();
const stripe = new stripeController();
const apiStripe = new APiCallStripe();

//createPaymentIntent()
router.post(
  "/createintent",
  apiKey,
  authenicate,
  authorisationMiddleWare("admin", "user"),
  async (req, res) => await stripe.createTransaction(req, res)
);

// stripe webhook

app.post(
  "/webhook",
  express.raw({ type: "*/*" }), // Keep body as Buffer for Stripe signature verification
  async (req, res) => {
    await apiStripe.webHook(req, res);
  }
);

//get by stripe_id
router.get(
  "/getStripeID",
  apiKey,
  authenicate,
  authorisationMiddleWare("admin"),
  async (req, res) => await stripe.retrievePaymentbyStripeID(req, res)
);

//get by users_id
router.get(
  "/getuserspayment",
  apiKey,
  authenicate,
  authorisationMiddleWare("admin", "users"),
  async (req, res) => await stripe.retrievePaymentbyUserID(req, res)
);

//get by id
router.get(
  "/getuserspayment",
  apiKey,
  authenicate,
  authorisationMiddleWare("admin", "users"),
  async (req, res) => await stripe.retrievePaymentbyID(req, res)
);

export default router;
