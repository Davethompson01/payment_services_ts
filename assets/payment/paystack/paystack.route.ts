import { Router } from "express";
import paystackController from "./paystack.con";
import apiMiddleWare from "../../middleware/apiMiddlewares";
import authenicate from "../../middleware/authenticationMiddleware";
import authorisationMiddleWare from "../../middleware/authorisation";

const router = Router();
// const apiKey = apiMiddleWare()
const paystack = new paystackController();
console.log("doing good");

// create trasaction
router.post(
  "/paystack/createTrasaction",
  apiMiddleWare,
  authenicate,
  authorisationMiddleWare("admin", "user"),
  async (req, res) => await paystack.createTrasaction(req, res)
);

//upate trasaction
router.get(
  "/paystack/verifyTrasanction",
  apiMiddleWare,
  authenicate,
  authorisationMiddleWare("admin"),
  
  async (req, res) =>  {
   
    await paystack.verifyTransaction(req, res);
  }
);

export default router;
