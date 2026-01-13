import express from "express";
import cors from "cors";

import testDBConnection from "./config/testDBConnection.ts";
import { corsOption } from "./assets/services/header.ts";
import oAuth from "./route/auth.ts";
import stripe from "./assets/payment/stripe/stripe.route.ts";
import paystack from "./assets/payment/paystack/paystack.route.ts";

const app = express();

app.use(express.json());
app.use(cors(corsOption));
const PORT = process.env.PORT;

// authentication
app.use("/admin", oAuth);
// testDBConnection();

// paystackpayment integration
app.use("/payment", paystack);

// stripe
app.use("/stripe", stripe);

app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});
